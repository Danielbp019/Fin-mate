import { type Request, type Response, type NextFunction } from 'express';
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from './auth.schema.js';
import * as authService from './auth.service.js';

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const data = registerSchema.parse(req.body);
    const result = await authService.register(data);

    res.cookie('refreshToken', result.refreshToken, result.cookieOptions);
    res.status(201).json({
      accessToken: result.accessToken,
      user: result.user,
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const data = loginSchema.parse(req.body);
    const result = await authService.login(data);

    res.cookie('refreshToken', result.refreshToken, result.cookieOptions);
    res.status(200).json({
      accessToken: result.accessToken,
      user: result.user,
    });
  } catch (error) {
    next(error);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const refreshTokenValue = req.cookies?.refreshToken;
    const result = await authService.refresh(refreshTokenValue);

    res.cookie('refreshToken', result.refreshToken, result.cookieOptions);
    res.status(200).json({
      accessToken: result.accessToken,
      user: result.user,
    });
  } catch (error) {
    next(error);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const refreshTokenValue = req.cookies?.refreshToken;
    const result = await authService.logout(refreshTokenValue);

    res.cookie('refreshToken', '', result.cookieOptions);
    res.status(200).json({ success: result.success });
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.userId!;
    const data = updateProfileSchema.parse(req.body);
    const result = await authService.updateProfile(userId, data);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function changePassword(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.userId!;
    const data = changePasswordSchema.parse(req.body);
    const result = await authService.changePassword(userId, data);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function forgotPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const data = forgotPasswordSchema.parse(req.body);
    const result = await authService.forgotPassword(data);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function resetPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const data = resetPasswordSchema.parse(req.body);
    const result = await authService.resetPassword(data);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function verifyEmail(req: Request, res: Response, next: NextFunction) {
  try {
    const data = verifyEmailSchema.parse(req.body);
    const result = await authService.verifyEmail(data);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function logoutAll(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.userId!;
    const refreshTokenValue = req.cookies?.refreshToken;
    const result = await authService.logoutAll(userId, refreshTokenValue);

    res.cookie('refreshToken', '', result.cookieOptions);
    res.status(200).json({ success: result.success });
  } catch (error) {
    next(error);
  }
}
