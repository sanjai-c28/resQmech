import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { BadRequestError } from '../utils/errors';

export const validateBody = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = await schema.parseAsync(req.body);
      req.body = parsed;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const issueMessages = err.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        }));
        next(new BadRequestError('Validation failed on request body', issueMessages));
      } else {
        next(err);
      }
    }
  };
};

export const validateQuery = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = await schema.parseAsync(req.query);
      (req as any).validatedQuery = parsed;
      res.locals.validatedQuery = parsed;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const issueMessages = err.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        }));
        next(new BadRequestError('Validation failed on query parameters', issueMessages));
      } else {
        next(err);
      }
    }
  };
};
