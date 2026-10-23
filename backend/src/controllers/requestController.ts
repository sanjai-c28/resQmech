import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { dispatchService } from '../services/dispatchService';

export const createRequestBodySchema = z.object({
  customerId: z.string().optional(),
  pickupLocation: z.object({
    lat: z.number().min(-90).max(90, 'lat must be between -90 and 90'),
    lng: z.number().min(-180).max(180, 'lng must be between -180 and 180'),
  }),
  vehicleType: z.string().min(1, 'vehicleType is required (e.g., TWO_WHEELER, FOUR_WHEELER, COMMERCIAL)'),
  issueType: z.string().min(1, 'issueType is required (e.g., PUNCTURE, BATTERY_JUMP, TOWING)'),
  notes: z.string().optional(),
});

export const acceptRequestBodySchema = z.object({
  mechanicId: z.string().min(1, 'mechanicId is required'),
});

export const verifyOtpBodySchema = z.object({
  otp: z.string().regex(/^\d{4}$/, 'OTP must be a 4-digit number (e.g., "1234")'),
  mechanicId: z.string().optional(),
});

export const cancelRequestBodySchema = z.object({
  reason: z.string().optional(),
});

export class RequestController {
  public async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = req.body as z.infer<typeof createRequestBodySchema>;
      const result = dispatchService.createRequest(body);

      res.status(201).json({
        success: true,
        message: 'Assistance request created. Nearby mechanics alerted.',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  public async accept(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const body = req.body as z.infer<typeof acceptRequestBodySchema>;

      const result = dispatchService.acceptRequest(id, body.mechanicId);

      res.status(200).json({
        success: true,
        message: result.message,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  public async verifyOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const body = req.body as z.infer<typeof verifyOtpBodySchema>;

      const result = dispatchService.verifyOtp(id, body.otp, body.mechanicId);

      res.status(200).json({
        success: true,
        message: result.message,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  public async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const result = dispatchService.getRequest(id);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  public async complete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const result = dispatchService.completeRequest(id);

      res.status(200).json({
        success: true,
        message: result.message,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  public async cancel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const body = req.body as z.infer<typeof cancelRequestBodySchema>;
      const result = dispatchService.cancelRequest(id, body?.reason);

      res.status(200).json({
        success: true,
        message: result.message,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
}

export const requestController = new RequestController();
