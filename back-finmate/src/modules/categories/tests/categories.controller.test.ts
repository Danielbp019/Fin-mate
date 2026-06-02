import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import * as categoriesService from '../categories.service.js';

vi.mock('../categories.service.js');

const mockCategory = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  userId: 'user-123',
  type: 'expense' as const,
  name: 'Comida',
  icon: 'food',
  color: '#ff0000',
  isActive: true,
  isSystem: false,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
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

let categoriesController: typeof import('../categories.controller.js');

beforeEach(async () => {
  vi.clearAllMocks();
  categoriesController = await import('../categories.controller.js');
});

describe('list', () => {
  it('returns 200 with categories', async () => {
    const req = createAuthReq();
    const res = createRes();
    const next = vi.fn() as NextFunction;

    vi.mocked(categoriesService.list).mockResolvedValue([mockCategory]);

    await categoriesController.list(req, res, next);

    expect(categoriesService.list).toHaveBeenCalledWith('user-123', undefined);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([mockCategory]);
  });

  it('returns 400 when type query param is invalid', async () => {
    const req = createAuthReq({ query: { type: 'invalid' } });
    const res = createRes();
    const next = vi.fn() as NextFunction;

    await categoriesController.list(req, res, next);

    expect(categoriesService.list).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'El tipo debe ser income o expense' });
  });

  it('passes type filter to service when valid', async () => {
    const req = createAuthReq({ query: { type: 'income' } });
    const res = createRes();
    const next = vi.fn() as NextFunction;

    vi.mocked(categoriesService.list).mockResolvedValue([]);

    await categoriesController.list(req, res, next);

    expect(categoriesService.list).toHaveBeenCalledWith('user-123', 'income');
  });
});

describe('getById', () => {
  it('returns 200 with category', async () => {
    const req = createAuthReq({ params: { id: mockCategory.id } });
    const res = createRes();
    const next = vi.fn() as NextFunction;

    vi.mocked(categoriesService.getById).mockResolvedValue(mockCategory);

    await categoriesController.getById(req, res, next);

    expect(categoriesService.getById).toHaveBeenCalledWith(mockCategory.id, 'user-123');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockCategory);
  });

  it('calls next with error when service throws', async () => {
    const req = createAuthReq({ params: { id: 'nonexistent' } });
    const res = createRes();
    const next = vi.fn() as NextFunction;
    const error = new Error('Categoría no encontrada');

    vi.mocked(categoriesService.getById).mockRejectedValue(error);

    await categoriesController.getById(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});

describe('create', () => {
  it('returns 201 with created category', async () => {
    const req = createAuthReq({ body: { name: 'Comida', type: 'expense' } });
    const res = createRes();
    const next = vi.fn() as NextFunction;

    vi.mocked(categoriesService.create).mockResolvedValue(mockCategory);

    await categoriesController.create(req, res, next);

    expect(categoriesService.create).toHaveBeenCalledWith(
      { name: 'Comida', type: 'expense' },
      'user-123',
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(mockCategory);
  });

  it('calls next with error when body is invalid', async () => {
    const req = createAuthReq({ body: { name: '', type: 'expense' } });
    const res = createRes();
    const next = vi.fn() as NextFunction;

    await categoriesController.create(req, res, next);

    expect(categoriesService.create).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});

describe('update', () => {
  it('returns 200 with updated category', async () => {
    const req = createAuthReq({
      params: { id: mockCategory.id },
      body: { name: 'Comida actualizada' },
    });
    const res = createRes();
    const next = vi.fn() as NextFunction;

    vi.mocked(categoriesService.update).mockResolvedValue({
      ...mockCategory,
      name: 'Comida actualizada',
    });

    await categoriesController.update(req, res, next);

    expect(categoriesService.update).toHaveBeenCalledWith(
      mockCategory.id,
      { name: 'Comida actualizada' },
      'user-123',
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      ...mockCategory,
      name: 'Comida actualizada',
    });
  });
});

describe('remove', () => {
  it('returns 204 with no content', async () => {
    const req = createAuthReq({ params: { id: mockCategory.id } });
    const res = createRes();
    const next = vi.fn() as NextFunction;

    vi.mocked(categoriesService.remove).mockResolvedValue(undefined as never);

    await categoriesController.remove(req, res, next);

    expect(categoriesService.remove).toHaveBeenCalledWith(mockCategory.id, 'user-123');
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });
});
