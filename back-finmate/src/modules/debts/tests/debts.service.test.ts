import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as debtsRepository from '../debts.repository.js';

vi.mock('../debts.repository.js');

const mockDebt = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  userId: 'user-123',
  coupleId: null,
  title: 'Tarjeta de credito',
  description: 'Deuda del banco',
  initialAmount: '5000.00',
  currentAmount: '5000.00',
  interestRate: '0',
  minimumPayment: '0',
  dueDay: null,
  priority: 'medium' as const,
  status: 'pending' as const,
  startDate: null,
  endDate: null,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  deletedAt: null,
};

let debtsService: typeof import('../debts.service.js');

beforeEach(async () => {
  vi.clearAllMocks();
  debtsService = await import('../debts.service.js');
});

describe('list', () => {
  it('returns debts from repository', async () => {
    vi.mocked(debtsRepository.findByUser).mockResolvedValue([mockDebt]);

    const result = await debtsService.list('user-123', {});

    expect(debtsRepository.findByUser).toHaveBeenCalledWith('user-123', {});
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Tarjeta de credito');
  });

  it('passes filters to repository', async () => {
    vi.mocked(debtsRepository.findByUser).mockResolvedValue([]);

    await debtsService.list('user-123', { status: 'pending', priority: 'high' });

    expect(debtsRepository.findByUser).toHaveBeenCalledWith('user-123', {
      status: 'pending',
      priority: 'high',
    });
  });
});

describe('getById', () => {
  it('returns debt when found and owned', async () => {
    vi.mocked(debtsRepository.findById).mockResolvedValue(mockDebt);

    const result = await debtsService.getById(mockDebt.id, 'user-123');

    expect(result.id).toBe(mockDebt.id);
    expect(result.initialAmount).toBe('5000.00');
  });

  it('throws 404 when not found', async () => {
    vi.mocked(debtsRepository.findById).mockResolvedValue(null as never);

    await expect(
      debtsService.getById('nonexistent', 'user-123'),
    ).rejects.toMatchObject({ statusCode: 404, message: 'Deuda no encontrada' });
  });

  it('throws 404 when not owned', async () => {
    vi.mocked(debtsRepository.findById).mockResolvedValue(mockDebt);

    await expect(
      debtsService.getById(mockDebt.id, 'other-user'),
    ).rejects.toMatchObject({ statusCode: 404, message: 'Deuda no encontrada' });
  });
});

describe('create', () => {
  it('creates debt with currentAmount equal to initialAmount', async () => {
    vi.mocked(debtsRepository.create).mockResolvedValue(undefined as never);

    const result = await debtsService.create(
      { title: 'Nueva deuda', initialAmount: '3000.00', priority: 'high' },
      'user-123',
    );

    expect(debtsRepository.create).toHaveBeenCalledTimes(1);
    expect(result.title).toBe('Nueva deuda');
    expect(result.initialAmount).toBe('3000.00');
    expect(result.currentAmount).toBe('3000.00');
    expect(result.priority).toBe('high');
    expect(result.status).toBe('pending');
    expect(result.userId).toBe('user-123');
  });

  it('defaults to medium priority when not provided', async () => {
    vi.mocked(debtsRepository.create).mockResolvedValue(undefined as never);

    const result = await debtsService.create(
      { title: 'Deuda simple', initialAmount: '1000.00' },
      'user-123',
    );

    expect(result.priority).toBe('medium');
  });
});

describe('update', () => {
  it('updates debt when valid', async () => {
    vi.mocked(debtsRepository.findById)
      .mockResolvedValueOnce(mockDebt)
      .mockResolvedValueOnce({ ...mockDebt, currentAmount: '3000.00' });
    vi.mocked(debtsRepository.update).mockResolvedValue(undefined as never);

    const result = await debtsService.update(
      mockDebt.id,
      { currentAmount: '3000.00' },
      'user-123',
    );

    expect(debtsRepository.update).toHaveBeenCalled();
    expect(result.currentAmount).toBe('3000.00');
  });

  it('throws 404 when not found', async () => {
    vi.mocked(debtsRepository.findById).mockResolvedValue(null as never);

    await expect(
      debtsService.update('nonexistent', { title: 'Nuevo' }, 'user-123'),
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  it('throws 404 when not owned', async () => {
    vi.mocked(debtsRepository.findById).mockResolvedValue(mockDebt);

    await expect(
      debtsService.update(mockDebt.id, { title: 'Nuevo' }, 'other-user'),
    ).rejects.toMatchObject({ statusCode: 404 });
  });
});

describe('remove', () => {
  it('soft deletes debt when owned', async () => {
    vi.mocked(debtsRepository.findById).mockResolvedValue(mockDebt);
    vi.mocked(debtsRepository.softDelete).mockResolvedValue(undefined as never);

    await debtsService.remove(mockDebt.id, 'user-123');

    expect(debtsRepository.softDelete).toHaveBeenCalledWith(
      mockDebt.id,
      expect.any(Date),
    );
  });

  it('throws 404 when not found', async () => {
    vi.mocked(debtsRepository.findById).mockResolvedValue(null as never);

    await expect(
      debtsService.remove('nonexistent', 'user-123'),
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  it('throws 404 when not owned', async () => {
    vi.mocked(debtsRepository.findById).mockResolvedValue(mockDebt);

    await expect(
      debtsService.remove(mockDebt.id, 'other-user'),
    ).rejects.toMatchObject({ statusCode: 404 });
  });
});
