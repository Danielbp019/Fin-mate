import { describe, it, expect, vi, beforeEach } from 'vitest';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as authRepository from '../auth.repository.js';

vi.mock('../auth.repository.js');
vi.mock('bcryptjs');
vi.mock('jsonwebtoken');

const mockUser = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'Juan Pérez',
  email: 'juan@example.com',
  passwordHash: '$2a$10$hashedpassword',
  status: 'active' as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

let authService: typeof import('../auth.service.js');

beforeEach(async () => {
  vi.clearAllMocks();
  authService = await import('../auth.service.js');
});

describe('register', () => {
  it('creates user and returns token when email is available', async () => {
    vi.mocked(authRepository.findUserByEmail).mockResolvedValue(null);
    vi.mocked(bcrypt.hash).mockResolvedValue('$2a$10$hashedpassword');
    vi.mocked(jwt.sign).mockReturnValue('mock-token' as never);

    const result = await authService.register({
      name: 'Juan Pérez',
      email: 'juan@example.com',
      password: '123456',
    });

    expect(authRepository.findUserByEmail).toHaveBeenCalledWith('juan@example.com');
    expect(bcrypt.hash).toHaveBeenCalledWith('123456', 10);
    expect(authRepository.createUser).toHaveBeenCalledTimes(1);
    expect(jwt.sign).toHaveBeenCalled();
    expect(result.token).toBe('mock-token');
    expect(result.message).toBe('Usuario registrado exitosamente');
    expect(result.user).toEqual({
      id: expect.any(String),
      name: 'Juan Pérez',
      email: 'juan@example.com',
    });
  });

  it('throws 409 when email already exists', async () => {
    vi.mocked(authRepository.findUserByEmail).mockResolvedValue(mockUser);

    await expect(
      authService.register({
        name: 'Juan',
        email: 'juan@example.com',
        password: '123456',
      }),
    ).rejects.toMatchObject({
      statusCode: 409,
      message: 'El correo electrónico ya está registrado',
    });

    expect(authRepository.createUser).not.toHaveBeenCalled();
  });
});

describe('login', () => {
  it('returns token with valid credentials', async () => {
    vi.mocked(authRepository.findUserByEmail).mockResolvedValue(mockUser);
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
    vi.mocked(jwt.sign).mockReturnValue('mock-token' as never);

    const result = await authService.login({
      email: 'juan@example.com',
      password: '123456',
    });

    expect(authRepository.findUserByEmail).toHaveBeenCalledWith('juan@example.com');
    expect(bcrypt.compare).toHaveBeenCalledWith('123456', mockUser.passwordHash);
    expect(result.token).toBe('mock-token');
    expect(result.message).toBe('Inicio de sesión exitoso');
  });

  it('throws 401 when user not found', async () => {
    vi.mocked(authRepository.findUserByEmail).mockResolvedValue(null);

    await expect(
      authService.login({ email: 'unknown@example.com', password: '123456' }),
    ).rejects.toMatchObject({
      statusCode: 401,
      message: 'Credenciales inválidas',
    });
  });

  it('throws 401 when password is incorrect', async () => {
    vi.mocked(authRepository.findUserByEmail).mockResolvedValue(mockUser);
    vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

    await expect(
      authService.login({ email: 'juan@example.com', password: 'wrong' }),
    ).rejects.toMatchObject({
      statusCode: 401,
      message: 'Credenciales inválidas',
    });
  });

  it('throws 403 when user is inactive', async () => {
    vi.mocked(authRepository.findUserByEmail).mockResolvedValue({
      ...mockUser,
      status: 'inactive',
    });
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

    await expect(
      authService.login({ email: 'juan@example.com', password: '123456' }),
    ).rejects.toMatchObject({
      statusCode: 403,
      message: 'Cuenta desactivada',
    });
  });
});

describe('logout', () => {
  it('blacklists token and returns success message', async () => {
    const expiresAt = new Date(Date.now() + 3600000);
    vi.mocked(jwt.verify).mockReturnValue({
      userId: mockUser.id,
      exp: Math.floor(expiresAt.getTime() / 1000),
    } as never);

    const result = await authService.logout('valid-token');

    expect(jwt.verify).toHaveBeenCalledWith('valid-token', expect.any(String));
    expect(authRepository.blacklistToken).toHaveBeenCalledWith(
      'valid-token',
      expect.any(Date),
    );
    expect(result.message).toBe('Sesión cerrada exitosamente');
  });
});
