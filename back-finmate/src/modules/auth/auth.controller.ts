import { type Request, type Response, type NextFunction } from 'express';
import { registerSchema, loginSchema } from './auth.schema.js';
import * as authService from './auth.service.js';
import type { AuthenticatedRequest } from './auth.types.js';

export async function register(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const data = registerSchema.parse(req.body);
    const result = await authService.register(data);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function login(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const data = loginSchema.parse(req.body);
    const result = await authService.login(data);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function logout(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { token } = req as AuthenticatedRequest;
    const result = await authService.logout(token);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
