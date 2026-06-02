import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import * as goalsService from '../goals.service.js';

vi.mock('../goals.service.js');

const mockGoal = {
  id: 'goal-123',
  coupleId: 'couple-123',
  title: 'Viaje a la playa',
  targetAmount: '5000.00',
  currentAmount: '1500.00',
  progressPercent: 30,
  deadline: '2026-12-31T00:00:00.000Z',
  status: 'active' as const,
  createdBy: 'user-owner',
  createdAt: '2026-06-01T12:00:00.000Z',
  updatedAt: '2026-06-01T12:00:00.000Z',
  contributions: [],
};

const mockContribution = {
  id: 'contrib-123',
  goalId: 'goal-123',
  userId: 'user-owner',
  userName: '',
  amount: '500.00',
  notes: null,
  date: '2026-06-15T10:00:00.000Z',
  createdAt: '2026-06-15T10:00:00.000Z',
};

function createAuthReq(overrides: Record<string, unknown> = {}): Request {
  return {
    userId: 'user-owner',
    params: { coupleId: 'couple-123', id: 'goal-123' },
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

let goalsController: typeof import('../goals.controller.js');

beforeEach(async () => {
  vi.clearAllMocks();
  goalsController = await import('../goals.controller.js');
});

describe('list', () => {
  it('returns 200 with goals', async () => {
    const req = createAuthReq();
    const res = createRes();
    const next = vi.fn() as NextFunction;

    vi.mocked(goalsService.list).mockResolvedValue([mockGoal]);

    await goalsController.list(req, res, next);

    expect(goalsService.list).toHaveBeenCalledWith('couple-123', 'user-owner');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([mockGoal]);
  });

  it('calls next with error when service throws', async () => {
    const req = createAuthReq();
    const res = createRes();
    const next = vi.fn() as NextFunction;

    const error = new Error('No eres miembro de este grupo');
    vi.mocked(goalsService.list).mockRejectedValue(error);

    await goalsController.list(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});

describe('create', () => {
  it('returns 201 with created goal', async () => {
    const req = createAuthReq({
      body: { title: 'Viaje a la playa', targetAmount: '5000.00' },
    });
    const res = createRes();
    const next = vi.fn() as NextFunction;

    vi.mocked(goalsService.create).mockResolvedValue(mockGoal);

    await goalsController.create(req, res, next);

    expect(goalsService.create).toHaveBeenCalledWith(
      { title: 'Viaje a la playa', targetAmount: '5000.00' },
      'couple-123',
      'user-owner',
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(mockGoal);
  });

  it('calls next with error when body is invalid', async () => {
    const req = createAuthReq({
      body: { targetAmount: 'abc' },
    });
    const res = createRes();
    const next = vi.fn() as NextFunction;

    await goalsController.create(req, res, next);

    expect(goalsService.create).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});

describe('update', () => {
  it('returns 200 with updated goal', async () => {
    const req = createAuthReq({
      body: { title: 'Viaje actualizado' },
    });
    const res = createRes();
    const next = vi.fn() as NextFunction;

    vi.mocked(goalsService.update).mockResolvedValue(mockGoal);

    await goalsController.update(req, res, next);

    expect(goalsService.update).toHaveBeenCalledWith(
      'goal-123',
      { title: 'Viaje actualizado' },
      'couple-123',
      'user-owner',
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockGoal);
  });

  it('calls next with error when service throws', async () => {
    const req = createAuthReq({
      body: { title: 'Nuevo titulo' },
    });
    const res = createRes();
    const next = vi.fn() as NextFunction;

    const error = new Error('Solo el creador puede modificar');
    vi.mocked(goalsService.update).mockRejectedValue(error);

    await goalsController.update(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});

describe('remove', () => {
  it('returns 204 on success', async () => {
    const req = createAuthReq();
    const res = createRes();
    const next = vi.fn() as NextFunction;

    vi.mocked(goalsService.remove).mockResolvedValue(undefined as never);

    await goalsController.remove(req, res, next);

    expect(goalsService.remove).toHaveBeenCalledWith(
      'goal-123',
      'couple-123',
      'user-owner',
    );
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });

  it('calls next with error when service throws', async () => {
    const req = createAuthReq();
    const res = createRes();
    const next = vi.fn() as NextFunction;

    const error = new Error('Meta no encontrada');
    vi.mocked(goalsService.remove).mockRejectedValue(error);

    await goalsController.remove(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});

describe('contribute', () => {
  it('returns 201 with contribution', async () => {
    const req = createAuthReq({
      body: { amount: '500.00', notes: 'Ahorro del mes' },
    });
    const res = createRes();
    const next = vi.fn() as NextFunction;

    vi.mocked(goalsService.contribute).mockResolvedValue(mockContribution);

    await goalsController.contribute(req, res, next);

    expect(goalsService.contribute).toHaveBeenCalledWith(
      'goal-123',
      { amount: '500.00', notes: 'Ahorro del mes' },
      'couple-123',
      'user-owner',
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(mockContribution);
  });

  it('calls next with error when body is invalid', async () => {
    const req = createAuthReq({
      body: { amount: 'abc' },
    });
    const res = createRes();
    const next = vi.fn() as NextFunction;

    await goalsController.contribute(req, res, next);

    expect(goalsService.contribute).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  it('calls next with error when service throws', async () => {
    const req = createAuthReq({
      body: { amount: '100.00' },
    });
    const res = createRes();
    const next = vi.fn() as NextFunction;

    const error = new Error('La meta no esta activa');
    vi.mocked(goalsService.contribute).mockRejectedValue(error);

    await goalsController.contribute(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
