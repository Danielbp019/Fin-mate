import { describe, it, expect, vi, beforeEach } from 'vitest';
import { type Request, type Response, type NextFunction } from 'express';
import * as authController from '../auth.controller.js';
import * as authService from '../auth.service.js';

vi.mock('../auth.service.js');

function createMockRes() {
  const res: Partial<Response> = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    cookie: vi.fn().mockReturnThis(),
  };
  return res as Response;
}

function createMockReq(overrides: Partial<Request> = {}): Request {
  return {
    body: {},
    cookies: {},
    ...overrides,
  } as Request;
}

const mockNext: NextFunction = vi.fn();

const mockServiceResult = {
  accessToken: 'access-token-value',
  user: { id: '1', name: 'Test', email: 'test@test.com' },
  refreshToken: 'refresh-token-value',
  cookieOptions: {
    httpOnly: true,
    secure: false,
    sameSite: 'strict' as const,
    path: '/auth',
    maxAge: 2592000000,
  },
};

describe('authController.login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authService.login).mockResolvedValue(mockServiceResult);
  });

  it('debe llamar al servicio y setear cookie', async () => {
    const req = createMockReq({
      body: { email: 'test@test.com', password: '123456' },
    });
    const res = createMockRes();

    await authController.login(req, res, mockNext);

    expect(authService.login).toHaveBeenCalledWith({
      email: 'test@test.com',
      password: '123456',
    });
    expect(res.cookie).toHaveBeenCalledWith(
      'refreshToken',
      'refresh-token-value',
      mockServiceResult.cookieOptions,
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      accessToken: 'access-token-value',
      user: { id: '1', name: 'Test', email: 'test@test.com' },
    });
  });

  it('debe pasar errores a next', async () => {
    const error = new Error('Test error');
    vi.mocked(authService.login).mockRejectedValueOnce(error);
    const req = createMockReq({
      body: { email: 'test@test.com', password: '123456' },
    });
    const res = createMockRes();

    await authController.login(req, res, mockNext);
    expect(mockNext).toHaveBeenCalledWith(error);
  });
});

describe('authController.refresh', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authService.refresh).mockResolvedValue(mockServiceResult);
  });

  it('debe llamar al servicio con cookie y setear nueva cookie', async () => {
    const req = createMockReq({
      cookies: { refreshToken: 'old-refresh-token' },
    });
    const res = createMockRes();

    await authController.refresh(req, res, mockNext);

    expect(authService.refresh).toHaveBeenCalledWith('old-refresh-token');
    expect(res.cookie).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      accessToken: 'access-token-value',
      user: { id: '1', name: 'Test', email: 'test@test.com' },
    });
  });
});

describe('authController.logout', () => {
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

  it('debe llamar al servicio y limpiar cookie', async () => {
    const req = createMockReq({ cookies: { refreshToken: 'rt' } });
    const res = createMockRes();

    await authController.logout(req, res, mockNext);

    expect(authService.logout).toHaveBeenCalledWith('rt');
    expect(res.cookie).toHaveBeenCalledWith('refreshToken', '', expect.any(Object));
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true });
  });
});

describe('authController.logoutAll', () => {
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

  it('debe llamar al servicio con userId y limpiar cookie', async () => {
    const req = createMockReq({
      cookies: { refreshToken: 'rt' },
    });
    req.userId = 'user-1';
    const res = createMockRes();

    await authController.logoutAll(req, res, mockNext);

    expect(authService.logoutAll).toHaveBeenCalledWith('user-1', 'rt');
    expect(res.cookie).toHaveBeenCalledWith('refreshToken', '', expect.any(Object));
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
