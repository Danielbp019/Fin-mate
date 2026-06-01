import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import * as movementsService from '../movements.service.js';

vi.mock('../movements.service.js');

const mockMovement = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  userId: 'user-123',
  categoryId: '660e8400-e29b-41d4-a716-446655440001',
  type: 'expense' as const,
  amount: '150.50',
  description: 'Compra de comida',
  movementDate: '2026-06-01T12:00:00.000Z',
  isShared: false,
  createdAt: '2026-06-01T12:00:00.000Z',
  updatedAt: '2026-06-01T12:00:00.000Z',
};

const mockPaginated = {
  data: [mockMovement],
  pagination: { page: 1, limit: 20, total: 1 },
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

let movementsController: typeof import('../movements.controller.js');

beforeEach(async () => {
  vi.clearAllMocks();
  movementsController = await import('../movements.controller.js');
});

describe('list', () => {
  it('returns 200 with paginated movements', async () => {
    const req = createAuthReq();
    const res = createRes();
    const next = vi.fn() as NextFunction;

    vi.mocked(movementsService.list).mockResolvedValue(mockPaginated);

    await movementsController.list(req, res, next);

    expect(movementsService.list).toHaveBeenCalledWith('user-123', {});
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockPaginated);
  });

  it('calls next with error when service throws', async () => {
    const req = createAuthReq();
    const res = createRes();
    const next = vi.fn() as NextFunction;

    const error = new Error('DB error');
    vi.mocked(movementsService.list).mockRejectedValue(error);

    await movementsController.list(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});

describe('getById', () => {
  it('returns 200 with movement', async () => {
    const req = createAuthReq({ params: { id: mockMovement.id } });
    const res = createRes();
    const next = vi.fn() as NextFunction;

    vi.mocked(movementsService.getById).mockResolvedValue(mockMovement);

    await movementsController.getById(req, res, next);

    expect(movementsService.getById).toHaveBeenCalledWith(mockMovement.id, 'user-123');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockMovement);
  });

  it('calls next with error when service throws', async () => {
    const req = createAuthReq({ params: { id: 'nonexistent' } });
    const res = createRes();
    const next = vi.fn() as NextFunction;

    const error = new Error('Movimiento no encontrado');
    vi.mocked(movementsService.getById).mockRejectedValue(error);

    await movementsController.getById(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});

describe('create', () => {
  it('returns 201 with created movement', async () => {
    const req = createAuthReq({
      body: {
        categoryId: '660e8400-e29b-41d4-a716-446655440001',
        type: 'expense',
        amount: '150.50',
        movementDate: '2026-06-01T12:00:00.000Z',
      },
    });
    const res = createRes();
    const next = vi.fn() as NextFunction;

    vi.mocked(movementsService.create).mockResolvedValue(mockMovement);

    await movementsController.create(req, res, next);

    expect(movementsService.create).toHaveBeenCalledWith(
      {
        categoryId: '660e8400-e29b-41d4-a716-446655440001',
        type: 'expense',
        amount: '150.50',
        movementDate: '2026-06-01T12:00:00.000Z',
      },
      'user-123',
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(mockMovement);
  });

  it('calls next with error when body is invalid', async () => {
    const req = createAuthReq({
      body: { type: 'expense', amount: 'abc' },
    });
    const res = createRes();
    const next = vi.fn() as NextFunction;

    await movementsController.create(req, res, next);

    expect(movementsService.create).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});

describe('update', () => {
  it('returns 200 with updated movement', async () => {
    const updated = { ...mockMovement, amount: '200.00' };
    const req = createAuthReq({
      params: { id: mockMovement.id },
      body: { amount: '200.00' },
    });
    const res = createRes();
    const next = vi.fn() as NextFunction;

    vi.mocked(movementsService.update).mockResolvedValue(updated);

    await movementsController.update(req, res, next);

    expect(movementsService.update).toHaveBeenCalledWith(
      mockMovement.id,
      { amount: '200.00' },
      'user-123',
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(updated);
  });
});

describe('remove', () => {
  it('returns 204 with no content', async () => {
    const req = createAuthReq({ params: { id: mockMovement.id } });
    const res = createRes();
    const next = vi.fn() as NextFunction;

    vi.mocked(movementsService.remove).mockResolvedValue(undefined as never);

    await movementsController.remove(req, res, next);

    expect(movementsService.remove).toHaveBeenCalledWith(mockMovement.id, 'user-123');
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });
});
