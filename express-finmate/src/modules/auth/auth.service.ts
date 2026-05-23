import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../../config/env.js';
import { AppError } from '../../shared/errors/AppError.js';
import * as authRepository from './auth.repository.js';
import type { AuthResponse, AuthUser } from './auth.types.js';

function buildAuthResponse(user: { id: string; name: string; email: string }): AuthResponse {
  const token = jwt.sign({ userId: user.id }, env.jwtSecret, {
    expiresIn: env.jwtExpiresInSeconds,
  });

  return {
    message: '',
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  };
}

export async function register(data: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthResponse> {
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

  const response = buildAuthResponse(user);
  response.message = 'Usuario registrado exitosamente';
  return response;
}

export async function login(data: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
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

  const response = buildAuthResponse(user);
  response.message = 'Inicio de sesión exitoso';
  return response;
}

export async function logout(token: string): Promise<{ message: string }> {
  const decoded = jwt.verify(token, env.jwtSecret) as {
    userId: string;
    exp: number;
  };
  const expiresAt = new Date(decoded.exp * 1000);
  await authRepository.blacklistToken(token, expiresAt);

  return { message: 'Sesión cerrada exitosamente' };
}
