import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import * as debtsService from '../debts.service.js';

vi.mock('../debts.service.js');

const mockDebt = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  userId: 'user-123',
  title: 'Tarjeta de credito',
  description: null,
  initialAmount: '5000.00',
  currentAmount: '5000.00',
  interestRate: '0',
  interestRateType: 'annual',
  minimumPayment: '0',
  dueDate: null,
  priority: 'medium' as const,
  status: 'pending' as const,
  startDate: null,
  endDate: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
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

let debtsController: typeof import('../debts.controller.js');

beforeEach(async () => {
  vi.clearAllMocks();
  debtsController = await import('../debts.controller.js');
});

describe('list', () => {
  it('returns 200 with debts', async () => {
    const req = createAuthReq();
    const res = createRes();
    const next = vi.fn() as NextFunction;

    vi.mocked(debtsService.list).mockResolvedValue([mockDebt]);

    await debtsController.list(req, res, next);

    expect(debtsService.list).toHaveBeenCalledWith('user-123', {});
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([mockDebt]);
  });

  it('calls next with error when service throws', async () => {
    const req = createAuthReq();
    const res = createRes();
    const next = vi.fn() as NextFunction;

    const error = new Error('DB error');
    vi.mocked(debtsService.list).mockRejectedValue(error);

    await debtsController.list(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});

describe('getById', () => {
  it('returns 200 with debt', async () => {
    const req = createAuthReq({ params: { id: mockDebt.id } });
    const res = createRes();
    const next = vi.fn() as NextFunction;

    vi.mocked(debtsService.getById).mockResolvedValue(mockDebt);

    await debtsController.getById(req, res, next);

    expect(debtsService.getById).toHaveBeenCalledWith(mockDebt.id, 'user-123');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockDebt);
  });

  it('calls next with error when service throws', async () => {
    const req = createAuthReq({ params: { id: 'nonexistent' } });
    const res = createRes();
    const next = vi.fn() as NextFunction;

    const error = new Error('Deuda no encontrada');
    vi.mocked(debtsService.getById).mockRejectedValue(error);

    await debtsController.getById(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});

describe('create', () => {
  it('returns 201 with created debt', async () => {
    const req = createAuthReq({
      body: { title: 'Nueva deuda', initialAmount: '3000.00' },
    });
    const res = createRes();
    const next = vi.fn() as NextFunction;

    vi.mocked(debtsService.create).mockResolvedValue(mockDebt);

    await debtsController.create(req, res, next);

    expect(debtsService.create).toHaveBeenCalledWith(
      { title: 'Nueva deuda', initialAmount: '3000.00' },
      'user-123',
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(mockDebt);
  });

  it('calls next with error when body is invalid', async () => {
    const req = createAuthReq({
      body: { initialAmount: 'abc' },
    });
    const res = createRes();
    const next = vi.fn() as NextFunction;

    await debtsController.create(req, res, next);

    expect(debtsService.create).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});

describe('update', () => {
  it('returns 200 with updated debt', async () => {
    const updated = { ...mockDebt, currentAmount: '3000.00' };
    const req = createAuthReq({
      params: { id: mockDebt.id },
      body: { currentAmount: '3000.00' },
    });
    const res = createRes();
    const next = vi.fn() as NextFunction;

    vi.mocked(debtsService.update).mockResolvedValue(updated);

    await debtsController.update(req, res, next);

    expect(debtsService.update).toHaveBeenCalledWith(
      mockDebt.id,
      { currentAmount: '3000.00' },
      'user-123',
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(updated);
  });
});

describe('remove', () => {
  it('returns 204 with no content', async () => {
    const req = createAuthReq({ params: { id: mockDebt.id } });
    const res = createRes();
    const next = vi.fn() as NextFunction;

    vi.mocked(debtsService.remove).mockResolvedValue(undefined as never);

    await debtsController.remove(req, res, next);

    expect(debtsService.remove).toHaveBeenCalledWith(mockDebt.id, 'user-123');
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });
});
