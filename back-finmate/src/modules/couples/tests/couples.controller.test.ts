import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import * as couplesService from '../couples.service.js';

vi.mock('../couples.service.js');

const mockCoupleResponse = {
  id: 'couple-123',
  name: 'Nuestro grupo',
  status: 'active' as const,
  members: [
    {
      id: 'member-1',
      userId: 'user-123',
      name: 'User',
      email: 'user@test.com',
      role: 'owner' as const,
      joinedAt: '2026-06-01T12:00:00.000Z',
    },
  ],
};

function createAuthReq(overrides: Record<string, unknown> = {}): Request {
  return {
    userId: 'user-123',
    query: {},
    params: {},
    body: {},
    ...overrides,
  } as unknown as Request;
}

function createRes(): Response {
  const res: Partial<Response> = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.send = vi.fn().mockReturnValue(res);
  return res as Response;
}

let couplesController: typeof import('../couples.controller.js');

beforeEach(async () => {
  vi.clearAllMocks();
  couplesController = await import('../couples.controller.js');
});

describe('getMyCouple', () => {
  it('returns 200 with couple data', async () => {
    const req = createAuthReq();
    const res = createRes();
    const next = vi.fn() as NextFunction;

    vi.mocked(couplesService.getMyCouple).mockResolvedValue(mockCoupleResponse);

    await couplesController.getMyCouple(req, res, next);

    expect(couplesService.getMyCouple).toHaveBeenCalledWith('user-123');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockCoupleResponse);
  });
});

describe('create', () => {
  it('returns 201 with created couple', async () => {
    const req = createAuthReq({ body: { name: 'Nuestro grupo' } });
    const res = createRes();
    const next = vi.fn() as NextFunction;

    vi.mocked(couplesService.create).mockResolvedValue(mockCoupleResponse);

    await couplesController.create(req, res, next);

    expect(couplesService.create).toHaveBeenCalledWith({ name: 'Nuestro grupo' }, 'user-123');
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(mockCoupleResponse);
  });
});

describe('invite', () => {
  it('returns 201 with invitation', async () => {
    const req = createAuthReq({
      params: { id: 'couple-123' },
      body: { email: 'invited@test.com' },
    });
    const res = createRes();
    const next = vi.fn() as NextFunction;

    vi.mocked(couplesService.invite).mockResolvedValue({
      id: 'invitation-1',
      coupleId: 'couple-123',
      invitedEmail: 'invited@test.com',
      status: 'pending',
      expiresAt: '2026-06-08T12:00:00.000Z',
    });

    await couplesController.invite(req, res, next);

    expect(couplesService.invite).toHaveBeenCalledWith(
      'couple-123',
      'invited@test.com',
      'user-123',
    );
    expect(res.status).toHaveBeenCalledWith(201);
  });
});

describe('join', () => {
  it('returns 200 with couple data', async () => {
    const req = createAuthReq({ params: { id: 'couple-123' } });
    const res = createRes();
    const next = vi.fn() as NextFunction;

    vi.mocked(couplesService.join).mockResolvedValue(mockCoupleResponse);

    await couplesController.join(req, res, next);

    expect(couplesService.join).toHaveBeenCalledWith('couple-123', 'user-123');
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe('leave', () => {
  it('returns 200 with message', async () => {
    const req = createAuthReq({ params: { id: 'couple-123' } });
    const res = createRes();
    const next = vi.fn() as NextFunction;

    vi.mocked(couplesService.leave).mockResolvedValue(undefined as never);

    await couplesController.leave(req, res, next);

    expect(couplesService.leave).toHaveBeenCalledWith('couple-123', 'user-123');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Has abandonado el grupo',
    });
  });
});

describe('dissolve', () => {
  it('returns 200 with message', async () => {
    const req = createAuthReq({ params: { id: 'couple-123' } });
    const res = createRes();
    const next = vi.fn() as NextFunction;

    vi.mocked(couplesService.dissolve).mockResolvedValue(undefined as never);

    await couplesController.dissolve(req, res, next);

    expect(couplesService.dissolve).toHaveBeenCalledWith('couple-123', 'user-123');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Grupo disuelto correctamente',
    });
  });
});
