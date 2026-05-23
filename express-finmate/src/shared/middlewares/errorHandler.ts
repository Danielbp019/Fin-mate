import { type Request, type Response, type NextFunction } from 'express';
import { AppError } from '../errors/AppError.js';
import { env } from '../../config/env.js';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
    });
    return;
  }

  console.error(err);

  res.status(500).json({
    error: env.nodeEnv === 'production' ? 'Error interno del servidor' : err.message,
  });
}
