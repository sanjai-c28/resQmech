import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { mechanicService } from '../services/mechanicService';

// Validation schemas
export const nearbyMechanicsQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90, 'Latitude must be between -90 and 90'),
  lng: z.coerce.number().min(-180).max(180, 'Longitude must be between -180 and 180'),
  radiusKm: z.coerce.number().positive('radiusKm must be positive').optional().default(15),
  issueType: z.string().optional(),
  vehicleType: z.string().optional(),
  availableOnly: z
    .enum(['true', 'false'])
    .optional()
    .transform((val) => val === undefined || val === 'true'),
});

export const updateLocationBodySchema = z.object({
  mechanicId: z.string().min(1, 'mechanicId is required'),
  lat: z.number().min(-90).max(90, 'lat must be between -90 and 90'),
  lng: z.number().min(-180).max(180, 'lng must be between -180 and 180'),
});

export class MechanicController {
  public async getNearby(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = ((req as any).validatedQuery ?? req.query) as z.infer<typeof nearbyMechanicsQuerySchema>;

      const mechanics = mechanicService.findNearby({
        lat: query.lat,
        lng: query.lng,
        radiusKm: query.radiusKm,
        issueType: query.issueType,
        vehicleType: query.vehicleType,
        availableOnly: query.availableOnly,
      });

      res.status(200).json({
        success: true,
        count: mechanics.length,
        searchOrigin: { lat: query.lat, lng: query.lng },
        radiusKm: query.radiusKm,
        data: mechanics,
      });
    } catch (err) {
      next(err);
    }
  }

  public async updateLocation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = req.body as z.infer<typeof updateLocationBodySchema>;

      const result = mechanicService.updateLocation(body.mechanicId, {
        lat: body.lat,
        lng: body.lng,
      });

      res.status(200).json({
        success: true,
        message: `Live GPS coordinates updated for mechanic '${body.mechanicId}'`,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  public async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const mechanics = mechanicService.listAll();
      res.status(200).json({
        success: true,
        count: mechanics.length,
        data: mechanics,
      });
    } catch (err) {
      next(err);
    }
  }

  public async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const result = mechanicService.getById(id);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
}

export const mechanicController = new MechanicController();
