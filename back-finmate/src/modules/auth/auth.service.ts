import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../../config/env.js';
import { AppError } from '../../shared/errors/AppError.js';
import * as authRepository from './auth.repository.js';

const REFRESH_TOKEN_COOKIE = 'refreshToken';
const ACCESS_TOKEN_EXPIRY = env.jwtExpiresInSeconds;
const REFRESH_TOKEN_EXPIRY = env.jwtRefreshExpiresInSeconds;

function generateAccessToken(userId: string): string {
  return jwt.sign({ sub: userId }, env.jwtSecret, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
}

function generateRefreshToken(userId: string, jti: string): string {
  return jwt.sign({ sub: userId, jti }, env.jwtSecret, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });
}

function getRefreshCookieOptions() {
  return {
    httpOnly: true,
    secure: env.nodeEnv === 'production',
    sameSite: 'strict' as const,
    path: '/auth',
    maxAge: REFRESH_TOKEN_EXPIRY * 1000,
  };
}

async function createSession(userId: string) {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + REFRESH_TOKEN_EXPIRY * 1000);
  const jti = await authRepository.createRefreshToken({ userId, expiresAt });
  const refreshToken = generateRefreshToken(userId, jti);
  return { refreshToken, jti };
}

export async function login(data: { email: string; password: string }) {
  const user = await authRepository.findUserByEmail(data.email);
  if (!user) {
    throw new AppError(401, 'Credenciales inválidas');
  }

  const validPassword = await bcrypt.compare(data.password, user.passwordHash);
  if (!validPassword) {
    throw new AppError(401, 'Credenciales inválidas');
  }

  if (user.status === 'inactive') {
    throw new AppError(403, 'Cuenta desactivada');
  }

  const accessToken = generateAccessToken(user.id);
  const { refreshToken } = await createSession(user.id);

  return {
    accessToken,
    user: { id: user.id, name: user.name, email: user.email },
    refreshToken,
    cookieOptions: getRefreshCookieOptions(),
  };
}

export async function register(data: {
  name: string;
  email: string;
  password: string;
}) {
  const existing = await authRepository.findUserByEmail(data.email);
  if (existing) {
    throw new AppError(409, 'El correo electrónico ya está registrado');
  }

  const passwordHash = await bcrypt.hash(data.password, 10);
  const now = new Date();

  const user = {
    id: crypto.randomUUID(),
    name: data.name,
    email: data.email,
    passwordHash,
    status: 'active' as const,
    createdAt: now,
    updatedAt: now,
  };

  await authRepository.createUser(user);

  const accessToken = generateAccessToken(user.id);
  const { refreshToken } = await createSession(user.id);

  return {
    accessToken,
    user: { id: user.id, name: user.name, email: user.email },
    refreshToken,
    cookieOptions: getRefreshCookieOptions(),
  };
}

export async function logout(refreshTokenValue: string | undefined) {
  if (!refreshTokenValue) {
    return { success: true, cookieOptions: clearCookieOptions() };
  }

  try {
    let decoded: { sub: string; jti: string };
    try {
      decoded = jwt.verify(refreshTokenValue, env.jwtSecret) as {
        sub: string;
        jti: string;
      };
    } catch {
      return { success: true, cookieOptions: clearCookieOptions() };
    }

    const session = await authRepository.findRefreshTokenById(decoded.jti);
    if (session && !session.revoked) {
      await authRepository.revokeRefreshToken(decoded.jti);
    }
  } catch {
    // Ignorar errores
  }

  return { success: true, cookieOptions: clearCookieOptions() };
}

export async function refresh(refreshTokenValue: string | undefined) {
  if (!refreshTokenValue) {
    throw new AppError(401, 'Refresh token no proporcionado');
  }

  let decoded: { sub: string; jti: string };
  try {
    decoded = jwt.verify(refreshTokenValue, env.jwtSecret) as {
      sub: string;
      jti: string;
    };
  } catch {
    throw new AppError(401, 'Refresh token inválido');
  }

  const session = await authRepository.findRefreshTokenById(decoded.jti);

  if (!session) {
    throw new AppError(401, 'Sesión no encontrada');
  }

  if (session.revoked) {
    throw new AppError(401, 'Sesión inválida');
  }

  if (new Date() > session.expiresAt) {
    throw new AppError(401, 'Sesión expirada');
  }

  await authRepository.revokeRefreshToken(decoded.jti);

  const user = await authRepository.findUserById(decoded.sub);

  if (!user) {
    throw new AppError(401, 'Usuario no encontrado');
  }

  const accessToken = generateAccessToken(decoded.sub);
  const { refreshToken } = await createSession(decoded.sub);

  return {
    accessToken,
    refreshToken,
    cookieOptions: getRefreshCookieOptions(),
    user: { id: user.id, name: user.name, email: user.email },
  };
}

export async function logoutAll(
  userId: string,
  refreshTokenValue: string | undefined,
) {
  await authRepository.revokeAllUserRefreshTokens(userId);

  if (refreshTokenValue) {
    try {
      const decoded = jwt.verify(refreshTokenValue, env.jwtSecret) as {
        jti: string;
      };
      const session = await authRepository.findRefreshTokenById(decoded.jti);
      if (session && !session.revoked) {
        await authRepository.revokeRefreshToken(decoded.jti);
      }
    } catch {
      // Ignorar
    }
  }

  return { success: true, cookieOptions: clearCookieOptions() };
}

export async function updateProfile(userId: string, data: { name: string }) {
  const user = await authRepository.findUserById(userId);
  if (!user) {
    throw new AppError(404, 'Usuario no encontrado');
  }

  if (user.name === data.name) {
    return { id: user.id, name: user.name, email: user.email };
  }

  await authRepository.updateUserName(userId, data.name);

  return { id: user.id, name: data.name, email: user.email };
}

export async function changePassword(
  userId: string,
  data: { currentPassword: string; newPassword: string },
) {
  const user = await authRepository.findUserById(userId);
  if (!user) {
    throw new AppError(404, 'Usuario no encontrado');
  }

  const validPassword = await bcrypt.compare(
    data.currentPassword,
    user.passwordHash,
  );
  if (!validPassword) {
    throw new AppError(401, 'La contraseña actual no es correcta');
  }

  const passwordHash = await bcrypt.hash(data.newPassword, 10);
  await authRepository.updateUserPassword(userId, passwordHash);

  return { message: 'Contraseña actualizada correctamente' };
}

function clearCookieOptions() {
  return {
    httpOnly: true,
    secure: env.nodeEnv === 'production',
    sameSite: 'strict' as const,
    path: '/auth',
    maxAge: 0,
  };
}
