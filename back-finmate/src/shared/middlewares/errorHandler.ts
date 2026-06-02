import { type Request, type Response, type NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../errors/AppError.js';
import { env } from '../../config/env.js';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
    });
    return;
  }

  const statusCode = (err as any).statusCode;
  if (statusCode && typeof statusCode === 'number') {
    res.status(statusCode).json({
      error: err.message,
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Datos inválidos',
      details: err.errors.map((e) => ({
        campo: e.path.join('.'),
        mensaje: e.message,
      })),
    });
    return;
  }

  console.error(err);

  res.status(500).json({
    error: env.nodeEnv === 'production' ? 'Error interno del servidor' : err.message,
  });
}
