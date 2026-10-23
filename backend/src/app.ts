import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import apiRouter from './routes';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';

export function createApp(): Application {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());

  // Simple request logging
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`);
    });
    next();
  });

  // Base & Health check routes
  app.get('/', (req: Request, res: Response) => {
    res.status(200).json({
      name: 'resQmech Dispatch API',
      status: 'online',
      version: '1.0.0',
      description: 'Uber-like Roadside Assistance MVP Backend',
      endpoints: {
        health: 'GET /api/v1/health',
        nearbyMechanics: 'GET /api/v1/mechanics/nearby?lat=13.0827&lng=80.2707&radiusKm=10',
        updateLocation: 'PATCH /api/v1/mechanics/location',
        createRequest: 'POST /api/v1/requests/create',
        acceptRequest: 'POST /api/v1/requests/:id/accept',
        verifyOtp: 'POST /api/v1/requests/:id/verify-otp',
      },
    });
  });

  app.get('/api/v1/health', (req: Request, res: Response) => {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'resQmech-backend',
    });
  });

  // API v1 routes
  app.use('/api/v1', apiRouter);

  // 404 handler
  app.use(notFoundHandler);

  // Global Error Handler
  app.use(errorHandler);

  return app;
}
