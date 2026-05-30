import { describe, it, expect, vi, beforeEach } from 'vitest';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as authService from '../auth.service.js';
import * as authRepository from '../auth.repository.js';

vi.mock('../auth.repository.js');
vi.mock('../../../config/env.js', () => ({
  env: {
    jwtSecret: 'test-secret',
    jwtExpiresInSeconds: 900,
    jwtRefreshExpiresInSeconds: 2592000,
    nodeEnv: 'test',
    frontendUrl: 'http://localhost:5173',
    rateLimitWindowMs: 900000,
    rateLimitMax: 100,
    db: {
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      name: 'finmate_test',
    },
  },
}));

const mockUser = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'Usuario Test',
  email: 'test@example.com',
  passwordHash: bcrypt.hashSync('123456', 10),
  status: 'active' as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

const mockRefreshTokenRecord = {
  id: '660e8400-e29b-41d4-a716-446655440001',
  userId: mockUser.id,
  expiresAt: new Date(Date.now() + 2592000 * 1000),
  revoked: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('authService.login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authRepository.findUserByEmail).mockResolvedValue(mockUser);
    vi.mocked(authRepository.createRefreshToken).mockResolvedValue(mockRefreshTokenRecord.id);
  });

  it('debe retornar accessToken y refreshToken con credenciales válidas', async () => {
    const result = await authService.login({
      email: 'test@example.com',
      password: '123456',
    });

    expect(result.accessToken).toBeTruthy();
    expect(result.refreshToken).toBeTruthy();
    expect(result.cookieOptions).toBeTruthy();
    expect(result.user.id).toBe(mockUser.id);
    expect(result.user.name).toBe('Usuario Test');

    const decoded = jwt.verify(result.accessToken, 'test-secret') as { sub: string };
    expect(decoded.sub).toBe(mockUser.id);
  });

  it('debe lanzar 401 si el email no existe', async () => {
    vi.mocked(authRepository.findUserByEmail).mockResolvedValueOnce(null);
    await expect(
      authService.login({ email: 'noexiste@test.com', password: '123456' }),
    ).rejects.toMatchObject({ statusCode: 401 });
  });

  it('debe lanzar 401 si la contraseña es incorrecta', async () => {
    await expect(
      authService.login({
        email: 'test@example.com',
        password: 'wrong-password',
      }),
    ).rejects.toMatchObject({ statusCode: 401 });
  });

  it('debe lanzar 403 si el usuario está inactivo', async () => {
    vi.mocked(authRepository.findUserByEmail).mockResolvedValueOnce({
      ...mockUser,
      status: 'inactive' as const,
    });
    await expect(
      authService.login({ email: 'test@example.com', password: '123456' }),
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  it('debe crear un refresh token en la base de datos', async () => {
    await authService.login({
      email: 'test@example.com',
      password: '123456',
    });

    expect(authRepository.createRefreshToken).toHaveBeenCalledTimes(1);
    expect(authRepository.createRefreshToken).toHaveBeenCalledWith({
      userId: mockUser.id,
      expiresAt: expect.any(Date),
    });
  });
});

describe('authService.register', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authRepository.findUserByEmail).mockResolvedValue(null);
    vi.mocked(authRepository.createUser).mockResolvedValue(undefined);
    vi.mocked(authRepository.createRefreshToken).mockResolvedValue(mockRefreshTokenRecord.id);
  });

  it('debe registrar y retornar tokens', async () => {
    const result = await authService.register({
      name: 'Nuevo Usuario',
      email: 'nuevo@test.com',
      password: '123456',
    });

    expect(result.accessToken).toBeTruthy();
    expect(result.refreshToken).toBeTruthy();
    expect(result.user.name).toBe('Nuevo Usuario');
    expect(authRepository.createUser).toHaveBeenCalledTimes(1);
  });

  it('debe lanzar 409 si el email ya existe', async () => {
    vi.mocked(authRepository.findUserByEmail).mockResolvedValueOnce(mockUser);
    await expect(
      authService.register({
        name: 'Otro',
        email: 'test@example.com',
        password: '123456',
      }),
    ).rejects.toMatchObject({ statusCode: 409 });
  });
});

describe('authService.refresh', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authRepository.findRefreshTokenById).mockResolvedValue(mockRefreshTokenRecord);
    vi.mocked(authRepository.revokeRefreshToken).mockResolvedValue(undefined);
    vi.mocked(authRepository.createRefreshToken).mockResolvedValue('new-jti');
  });

  it('debe rotar el refresh token y generar nuevo access token', async () => {
    const oldRefreshToken = jwt.sign(
      { sub: mockUser.id, jti: mockRefreshTokenRecord.id },
      'test-secret',
      { expiresIn: 2592000 },
    );

    const result = await authService.refresh(oldRefreshToken);

    expect(result.accessToken).toBeTruthy();
    expect(result.refreshToken).toBeTruthy();
    expect(result.cookieOptions).toBeTruthy();
    expect(authRepository.revokeRefreshToken).toHaveBeenCalledWith(mockRefreshTokenRecord.id);
    expect(authRepository.createRefreshToken).toHaveBeenCalledTimes(1);
  });

  it('debe lanzar 401 si no se proporciona refresh token', async () => {
    await expect(authService.refresh(undefined)).rejects.toMatchObject({
      statusCode: 401,
    });
  });

  it('debe lanzar 401 si el refresh token es inválido', async () => {
    await expect(authService.refresh('token-invalido')).rejects.toMatchObject({
      statusCode: 401,
    });
  });

  it('debe lanzar 401 si la sesión fue revocada', async () => {
    vi.mocked(authRepository.findRefreshTokenById).mockResolvedValueOnce({
      ...mockRefreshTokenRecord,
      revoked: true,
    });

    const revokedRefreshToken = jwt.sign(
      { sub: mockUser.id, jti: mockRefreshTokenRecord.id },
      'test-secret',
      { expiresIn: 2592000 },
    );

    await expect(authService.refresh(revokedRefreshToken)).rejects.toMatchObject({
      statusCode: 401,
    });
  });
});

describe('authService.logout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authRepository.findRefreshTokenById).mockResolvedValue(mockRefreshTokenRecord);
    vi.mocked(authRepository.revokeRefreshToken).mockResolvedValue(undefined);
  });

  it('debe revocar el refresh token', async () => {
    const refreshToken = jwt.sign(
      { sub: mockUser.id, jti: mockRefreshTokenRecord.id },
      'test-secret',
      { expiresIn: 2592000 },
    );

    const result = await authService.logout(refreshToken);

    expect(result.success).toBe(true);
    expect(authRepository.revokeRefreshToken).toHaveBeenCalledWith(mockRefreshTokenRecord.id);
  });

  it('debe retornar éxito incluso sin refresh token', async () => {
    const result = await authService.logout(undefined);
    expect(result.success).toBe(true);
    expect(authRepository.revokeRefreshToken).not.toHaveBeenCalled();
  });
});

describe('authService.logoutAll', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authRepository.revokeAllUserRefreshTokens).mockResolvedValue(undefined);
  });

  it('debe revocar todos los refresh tokens del usuario', async () => {
    const result = await authService.logoutAll(mockUser.id, undefined);
    expect(result.success).toBe(true);
    expect(authRepository.revokeAllUserRefreshTokens).toHaveBeenCalledWith(mockUser.id);
  });
});
