import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as movementsRepository from '../movements.repository.js';

vi.mock('../movements.repository.js');
vi.mock('../../../shared/database/connection.js', () => ({
  db: {
    select: vi.fn(),
  },
}));

const mockMovement = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  userId: 'user-123',
  coupleId: null,
  categoryId: '660e8400-e29b-41d4-a716-446655440001',
  type: 'expense' as const,
  amount: '150.50',
  description: 'Compra de comida',
  movementDate: new Date('2026-06-01T12:00:00.000Z'),
  createdAt: new Date('2026-06-01T12:00:00.000Z'),
  updatedAt: new Date('2026-06-01T12:00:00.000Z'),
  deletedAt: null,
};

let movementsService: typeof import('../movements.service.js');

beforeEach(async () => {
  vi.clearAllMocks();
  movementsService = await import('../movements.service.js');
});

describe('list', () => {
  it('returns paginated movements', async () => {
    vi.mocked(movementsRepository.findByUser).mockResolvedValue([mockMovement]);
    vi.mocked(movementsRepository.countByUser).mockResolvedValue(1);

    const result = await movementsService.list('user-123', {});

    expect(movementsRepository.findByUser).toHaveBeenCalledWith('user-123', {
      page: 1,
      limit: 20,
    });
    expect(movementsRepository.countByUser).toHaveBeenCalledWith('user-123', {});
    expect(result.data).toHaveLength(1);
    expect(result.pagination).toEqual({ page: 1, limit: 20, total: 1 });
  });

  it('passes filters to repository', async () => {
    vi.mocked(movementsRepository.findByUser).mockResolvedValue([]);
    vi.mocked(movementsRepository.countByUser).mockResolvedValue(0);

    await movementsService.list('user-123', {
      type: 'income',
      categoryId: 'cat-1',
      page: 2,
      limit: 10,
    });

    expect(movementsRepository.findByUser).toHaveBeenCalledWith('user-123', {
      type: 'income',
      categoryId: 'cat-1',
      page: 2,
      limit: 10,
    });
  });
});

describe('getById', () => {
  it('returns movement when found and owned', async () => {
    vi.mocked(movementsRepository.findById).mockResolvedValue(mockMovement);

    const result = await movementsService.getById(mockMovement.id, 'user-123');

    expect(result.id).toBe(mockMovement.id);
    expect(result.amount).toBe('150.50');
  });

  it('throws 404 when not found', async () => {
    vi.mocked(movementsRepository.findById).mockResolvedValue(null as never);

    await expect(movementsService.getById('nonexistent', 'user-123')).rejects.toMatchObject({
      statusCode: 404,
      message: 'Movimiento no encontrado',
    });
  });

  it('throws 404 when not owned', async () => {
    vi.mocked(movementsRepository.findById).mockResolvedValue(mockMovement);

    await expect(movementsService.getById(mockMovement.id, 'other-user')).rejects.toMatchObject({
      statusCode: 404,
      message: 'Movimiento no encontrado',
    });
  });
});

describe('create', () => {
  it('creates movement when category exists', async () => {
    vi.mocked(movementsRepository.findByUser).mockResolvedValue([] as never);
    vi.mocked(movementsRepository.countByUser).mockResolvedValue(0 as never);

    const { db } = await import('../../../shared/database/connection.js');
    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([{ id: mockMovement.categoryId }]),
        }),
      }),
    } as never);

    vi.mocked(movementsRepository.create).mockResolvedValue(undefined as never);

    const result = await movementsService.create(
      {
        categoryId: mockMovement.categoryId,
        type: 'expense',
        amount: '150.50',
        movementDate: '2026-06-01T12:00:00.000Z',
      },
      'user-123',
    );

    expect(movementsRepository.create).toHaveBeenCalledTimes(1);
    expect(result.amount).toBe('150.50');
    expect(result.type).toBe('expense');
    expect(result.userId).toBe('user-123');
  });
});

describe('update', () => {
  it('updates movement when valid', async () => {
    vi.mocked(movementsRepository.findById)
      .mockResolvedValueOnce(mockMovement)
      .mockResolvedValueOnce({ ...mockMovement, amount: '200.00' });

    vi.mocked(movementsRepository.update).mockResolvedValue(undefined as never);

    const result = await movementsService.update(mockMovement.id, { amount: '200.00' }, 'user-123');

    expect(movementsRepository.update).toHaveBeenCalled();
    expect(result.amount).toBe('200.00');
  });

  it('throws 404 when not found', async () => {
    vi.mocked(movementsRepository.findById).mockResolvedValue(null as never);

    await expect(
      movementsService.update('nonexistent', { amount: '100' }, 'user-123'),
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  it('throws 404 when not owned', async () => {
    vi.mocked(movementsRepository.findById).mockResolvedValue(mockMovement);

    await expect(
      movementsService.update(mockMovement.id, { amount: '100' }, 'other-user'),
    ).rejects.toMatchObject({ statusCode: 404 });
  });
});

describe('remove', () => {
  it('soft deletes movement when owned', async () => {
    vi.mocked(movementsRepository.findById).mockResolvedValue(mockMovement);
    vi.mocked(movementsRepository.softDelete).mockResolvedValue(undefined as never);

    await movementsService.remove(mockMovement.id, 'user-123');

    expect(movementsRepository.softDelete).toHaveBeenCalledWith(mockMovement.id, expect.any(Date));
  });

  it('throws 404 when not found', async () => {
    vi.mocked(movementsRepository.findById).mockResolvedValue(null as never);

    await expect(movementsService.remove('nonexistent', 'user-123')).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it('throws 404 when not owned', async () => {
    vi.mocked(movementsRepository.findById).mockResolvedValue(mockMovement);

    await expect(movementsService.remove(mockMovement.id, 'other-user')).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});
