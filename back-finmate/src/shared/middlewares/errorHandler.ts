import { type Request, type Response, type NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ZodError } from 'zod';
import { AppError } from '../errors/AppError.js';

const { TokenExpiredError } = jwt;
import { env } from '../../config/env.js';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
    });
    return;
  }

  if (err instanceof TokenExpiredError) {
    res.status(401).json({
      error: 'Token de acceso expirado',
    });
    return;
  }

  const statusCode = 'statusCode' in err ? (err as { statusCode?: number }).statusCode : undefined;
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
