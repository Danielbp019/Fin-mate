import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../../config/env.js';
import { AppError } from '../../shared/errors/AppError.js';
import { sendEmail } from '../../shared/email/email.service.js';
import { verificationEmail, passwordResetEmail } from '../../shared/email/email.templates.js';
import * as authRepository from './auth.repository.js';

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

export async function register(data: { name: string; email: string; password: string }) {
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

  const verificationToken = jwt.sign(
    { sub: user.id, purpose: 'email-verification' },
    env.jwtSecret,
    { expiresIn: '24h' },
  );

  const verificationUrl = `${env.frontendUrl}/verify-email?token=${verificationToken}`;
  const { subject, html } = verificationEmail(user.name, verificationUrl);

  sendEmail({ to: user.email, subject, html }).catch(() => {
    // No bloquear registro si falla el email
  });

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

export async function logoutAll(userId: string, refreshTokenValue: string | undefined) {
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

  const validPassword = await bcrypt.compare(data.currentPassword, user.passwordHash);
  if (!validPassword) {
    throw new AppError(401, 'La contraseña actual no es correcta');
  }

  const passwordHash = await bcrypt.hash(data.newPassword, 10);
  await authRepository.updateUserPassword(userId, passwordHash);

  return { message: 'Contraseña actualizada correctamente' };
}

export async function forgotPassword(data: { email: string }): Promise<{ message: string }> {
  const user = await authRepository.findUserByEmail(data.email);
  if (!user) {
    return {
      message: 'Si el correo existe, recibiras un enlace de recuperacion',
    };
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + 15 * 60 * 1000); // 15 min
  const tokenId = crypto.randomUUID();
  const resetToken = crypto.randomBytes(32).toString('hex');

  await authRepository.createPasswordResetToken({
    id: tokenId,
    userId: user.id,
    token: resetToken,
    expiresAt,
  });

  const resetUrl = `${env.frontendUrl}/reset-password?token=${resetToken}`;
  const { subject, html } = passwordResetEmail(user.name, resetUrl);

  sendEmail({ to: user.email, subject, html }).catch(() => {
    // No bloquear si falla el email
  });

  return {
    message: 'Si el correo existe, recibiras un enlace de recuperacion',
  };
}

export async function resetPassword(data: {
  token: string;
  newPassword: string;
}): Promise<{ message: string }> {
  const record = await authRepository.findPasswordResetToken(data.token);
  if (!record) {
    throw new AppError(400, 'Token invalido');
  }

  if (record.used) {
    throw new AppError(400, 'El token ya ha sido utilizado');
  }

  if (new Date() > record.expiresAt) {
    throw new AppError(400, 'El token ha expirado');
  }

  const passwordHash = await bcrypt.hash(data.newPassword, 10);
  await authRepository.updateUserPassword(record.userId, passwordHash);
  await authRepository.markPasswordResetTokenUsed(record.id);

  return { message: 'Contrasena actualizada correctamente' };
}

export async function verifyEmail(data: { token: string }): Promise<{ message: string }> {
  let decoded: { sub: string; purpose: string };
  try {
    decoded = jwt.verify(data.token, env.jwtSecret) as {
      sub: string;
      purpose: string;
    };
  } catch {
    throw new AppError(400, 'Token invalido o expirado');
  }

  if (decoded.purpose !== 'email-verification') {
    throw new AppError(400, 'Token invalido');
  }

  const user = await authRepository.findUserById(decoded.sub);
  if (!user) {
    throw new AppError(404, 'Usuario no encontrado');
  }

  if (user.emailVerifiedAt) {
    return { message: 'El correo ya ha sido verificado' };
  }

  await authRepository.updateUserEmailVerifiedAt(user.id);

  return { message: 'Correo verificado correctamente' };
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
