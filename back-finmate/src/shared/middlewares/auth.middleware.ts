import { type Request, type Response, type NextFunction } from 'express';
import jwt, { TokenExpiredError } from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { AppError } from '../errors/AppError.js';

export async function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(401, 'Token no proporcionado');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, env.jwtSecret) as { sub: string };
    req.userId = decoded.sub;
    next();
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      next(new AppError(401, 'Token de acceso expirado'));
    } else {
      next(error);
    }
  }
}
