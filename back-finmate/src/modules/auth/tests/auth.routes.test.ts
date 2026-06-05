import { describe, it, expect, vi, beforeEach } from 'vitest';
import express from 'express';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { errorHandler } from '../../../shared/middlewares/errorHandler.js';
import authRouter from '../auth.routes.js';
import * as authService from '../auth.service.js';

vi.mock('../auth.service.js');
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

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(authRouter);
app.use(errorHandler);

function createMockServiceResponse() {
  return {
    accessToken: 'mock-access-token',
    user: { id: '1', name: 'Test', email: 'test@test.com' },
    refreshToken: 'mock-refresh-token',
    cookieOptions: {
      httpOnly: true,
      secure: false,
      sameSite: 'strict' as const,
      path: '/auth',
      maxAge: 2592000000,
    },
  };
}

describe('POST /auth/login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authService.login).mockResolvedValue(createMockServiceResponse() as any);
  });

  it('debe retornar 200 con accessToken y user', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'test@test.com', password: '123456' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.email).toBe('test@test.com');
  });

  it('debe setear cookie refreshToken', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'test@test.com', password: '123456' });

    expect(res.headers['set-cookie']).toBeDefined();
    const cookies = res.headers['set-cookie'] as unknown as string[];
    const hasRefreshCookie = cookies.some((c: string) => c.startsWith('refreshToken='));
    expect(hasRefreshCookie).toBe(true);
  });

  it('debe retornar 400 con datos inválidos', async () => {
    const res = await request(app).post('/auth/login').send({ email: 'invalido', password: '' });

    expect(res.status).toBe(400);
  });

  it('debe retornar 401 con credenciales inválidas', async () => {
    vi.mocked(authService.login).mockRejectedValueOnce(
      Object.assign(new Error(), {
        statusCode: 401,
        message: 'Credenciales inválidas',
      }),
    );

    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'test@test.com', password: 'wrong' });

    expect(res.status).toBe(401);
  });
});

describe('POST /auth/register', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authService.register).mockResolvedValue(createMockServiceResponse() as any);
  });

  it('debe retornar 201 con accessToken y user', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ name: 'Nuevo', email: 'nuevo@test.com', password: '123456' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('user');
  });

  it('debe retornar 400 con datos inválidos', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ name: '', email: 'invalido', password: '12' });

    expect(res.status).toBe(400);
  });
});

describe('POST /auth/refresh', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authService.refresh).mockResolvedValue(createMockServiceResponse() as any);
  });

  it('debe retornar 200 con nuevo accessToken', async () => {
    const res = await request(app)
      .post('/auth/refresh')
      .set('Cookie', ['refreshToken=mock-refresh-token']);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
  });

  it('debe retornar 401 sin cookie', async () => {
    vi.mocked(authService.refresh).mockRejectedValueOnce(
      Object.assign(new Error(), {
        statusCode: 401,
        message: 'Refresh token no proporcionado',
      }),
    );

    const res = await request(app).post('/auth/refresh');

    expect(res.status).toBe(401);
  });
});

describe('POST /auth/logout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authService.logout).mockResolvedValue({
      success: true,
      cookieOptions: {
        httpOnly: true,
        secure: false,
        sameSite: 'strict' as const,
        path: '/auth',
        maxAge: 0,
      },
    });
  });

  it('debe retornar 401 sin token de acceso', async () => {
    const res = await request(app).post('/auth/logout');

    expect(res.status).toBe(401);
  });

  it('debe retornar 200 con token válido', async () => {
    const token = jwt.sign({ sub: 'user-1' }, 'test-secret');

    const res = await request(app)
      .post('/auth/logout')
      .set('Authorization', `Bearer ${token}`)
      .set('Cookie', ['refreshToken=rt']);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true });
  });
});

describe('POST /auth/logout-all', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authService.logoutAll).mockResolvedValue({
      success: true,
      cookieOptions: {
        httpOnly: true,
        secure: false,
        sameSite: 'strict' as const,
        path: '/auth',
        maxAge: 0,
      },
    });
  });

  it('debe retornar 401 sin token de acceso', async () => {
    const res = await request(app).post('/auth/logout-all');
    expect(res.status).toBe(401);
  });

  it('debe retornar 200 con token válido', async () => {
    const token = jwt.sign({ sub: 'user-1' }, 'test-secret');

    const res = await request(app).post('/auth/logout-all').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true });
  });
});
