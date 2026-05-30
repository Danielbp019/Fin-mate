import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import * as authService from '../auth.service.js';

vi.mock('../auth.service.js');

function createReq(body: Record<string, unknown> = {}): Request {
  return { body } as Request;
}

function createRes(): Response {
  const res: Partial<Response> = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res as Response;
}

function createTokenReq(token: string, body: Record<string, unknown> = {}): Request {
  return { body, token } as unknown as Request;
}

let authController: typeof import('../auth.controller.js');

beforeEach(async () => {
  vi.clearAllMocks();
  authController = await import('../auth.controller.js');
});

describe('register', () => {
  it('returns 201 with auth response when data is valid', async () => {
    const req = createReq({ name: 'Juan', email: 'juan@example.com', password: '123456' });
    const res = createRes();
    const next = vi.fn() as NextFunction;

    vi.mocked(authService.register).mockResolvedValue({
      message: 'Usuario registrado exitosamente',
      token: 'mock-token',
      user: { id: 'uuid', name: 'Juan', email: 'juan@example.com' },
    });

    await authController.register(req, res, next);

    expect(authService.register).toHaveBeenCalledWith({
      name: 'Juan',
      email: 'juan@example.com',
      password: '123456',
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Usuario registrado exitosamente',
      token: 'mock-token',
      user: { id: 'uuid', name: 'Juan', email: 'juan@example.com' },
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next with error when body is invalid', async () => {
    const req = createReq({ name: 'Juan', email: 'invalido' });
    const res = createRes();
    const next = vi.fn() as NextFunction;

    await authController.register(req, res, next);

    expect(authService.register).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  it('calls next with error when service throws', async () => {
    const req = createReq({ name: 'Juan', email: 'juan@example.com', password: '123456' });
    const res = createRes();
    const next = vi.fn() as NextFunction;
    const error = new Error('Service error');

    vi.mocked(authService.register).mockRejectedValue(error);

    await authController.register(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});

describe('login', () => {
  it('returns 200 with auth response when credentials are valid', async () => {
    const req = createReq({ email: 'juan@example.com', password: '123456' });
    const res = createRes();
    const next = vi.fn() as NextFunction;

    vi.mocked(authService.login).mockResolvedValue({
      message: 'Inicio de sesión exitoso',
      token: 'mock-token',
      user: { id: 'uuid', name: 'Juan', email: 'juan@example.com' },
    });

    await authController.login(req, res, next);

    expect(authService.login).toHaveBeenCalledWith({
      email: 'juan@example.com',
      password: '123456',
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Inicio de sesión exitoso',
      token: 'mock-token',
      user: { id: 'uuid', name: 'Juan', email: 'juan@example.com' },
    });
  });

  it('calls next with error when credentials are invalid', async () => {
    const req = createReq({ email: 'juan@example.com', password: 'wrong' });
    const res = createRes();
    const next = vi.fn() as NextFunction;
    const error = new Error('Credenciales inválidas');

    vi.mocked(authService.login).mockRejectedValue(error);

    await authController.login(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});

describe('logout', () => {
  it('returns 200 with success message', async () => {
    const req = createTokenReq('valid-token');
    const res = createRes();
    const next = vi.fn() as NextFunction;

    vi.mocked(authService.logout).mockResolvedValue({
      message: 'Sesión cerrada exitosamente',
    });

    await authController.logout(req, res, next);

    expect(authService.logout).toHaveBeenCalledWith('valid-token');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Sesión cerrada exitosamente',
    });
  });
});
