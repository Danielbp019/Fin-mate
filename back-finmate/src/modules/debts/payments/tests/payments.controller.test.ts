import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import * as paymentsService from '../payments.service.js';

vi.mock('../payments.service.js');

const mockPayment = {
  id: 'pay-123',
  debtId: 'debt-550e8400',
  userId: 'user-123',
  amount: '500.00',
  paymentDate: '2026-06-15T10:00:00.000Z',
  notes: null,
  createdAt: '2026-06-15T10:00:00.000Z',
};

function createAuthReq(overrides: Record<string, unknown> = {}): Request {
  return {
    userId: 'user-123',
    params: { debtId: 'debt-550e8400' },
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

let paymentsController: typeof import('../payments.controller.js');

beforeEach(async () => {
  vi.clearAllMocks();
  paymentsController = await import('../payments.controller.js');
});

describe('list', () => {
  it('returns 200 with payments', async () => {
    const req = createAuthReq();
    const res = createRes();
    const next = vi.fn() as NextFunction;

    vi.mocked(paymentsService.list).mockResolvedValue([mockPayment]);

    await paymentsController.list(req, res, next);

    expect(paymentsService.list).toHaveBeenCalledWith('debt-550e8400', 'user-123');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([mockPayment]);
  });

  it('calls next with error when service throws', async () => {
    const req = createAuthReq();
    const res = createRes();
    const next = vi.fn() as NextFunction;

    const error = new Error('Deuda no encontrada');
    vi.mocked(paymentsService.list).mockRejectedValue(error);

    await paymentsController.list(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});

describe('create', () => {
  it('returns 201 with created payment', async () => {
    const req = createAuthReq({
      body: { amount: '500.00', paymentDate: '2026-06-15T10:00:00.000Z' },
    });
    const res = createRes();
    const next = vi.fn() as NextFunction;

    vi.mocked(paymentsService.create).mockResolvedValue(mockPayment);

    await paymentsController.create(req, res, next);

    expect(paymentsService.create).toHaveBeenCalledWith(
      { amount: '500.00', paymentDate: '2026-06-15T10:00:00.000Z' },
      'debt-550e8400',
      'user-123',
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(mockPayment);
  });

  it('calls next with error when body is invalid', async () => {
    const req = createAuthReq({
      body: { amount: 'abc' },
    });
    const res = createRes();
    const next = vi.fn() as NextFunction;

    await paymentsController.create(req, res, next);

    expect(paymentsService.create).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});
