import { type Response, type NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { AppError } from '../errors/AppError.js';
import { findBlacklistedToken } from '../../modules/auth/auth.repository.js';
import type { AuthenticatedRequest } from '../../modules/auth/auth.types.js';

export async function authMiddleware(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(401, 'Token no proporcionado');
    }

    const token = authHeader.split(' ')[1];

    const blacklisted = await findBlacklistedToken(token);
    if (blacklisted) {
      throw new AppError(401, 'Token inválido o expirado');
    }

    const decoded = jwt.verify(token, env.jwtSecret) as { userId: string };
    req.userId = decoded.userId;
    next();
  } catch (error) {
    next(error);
  }
}
