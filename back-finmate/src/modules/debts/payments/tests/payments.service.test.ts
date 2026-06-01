import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as paymentsRepository from '../payments.repository.js';
import * as debtsRepository from '../../debts.repository.js';

vi.mock('../payments.repository.js');
vi.mock('../../debts.repository.js');

const mockDebt = {
  id: 'debt-550e8400',
  userId: 'user-123',
  coupleId: null,
  title: 'Tarjeta de credito',
  description: null,
  initialAmount: '5000.00',
  currentAmount: '3000.00',
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

const mockPayment = {
  id: 'pay-123',
  debtId: 'debt-550e8400',
  userId: 'user-123',
  amount: '500.00',
  paymentDate: new Date('2026-06-15T10:00:00.000Z'),
  notes: null,
  createdAt: new Date('2026-06-15T10:00:00.000Z'),
};

let paymentsService: typeof import('../payments.service.js');

beforeEach(async () => {
  vi.clearAllMocks();
  paymentsService = await import('../payments.service.js');
});

describe('list', () => {
  it('returns payments for a debt', async () => {
    vi.mocked(debtsRepository.findById).mockResolvedValue(mockDebt);
    vi.mocked(paymentsRepository.findByDebt).mockResolvedValue([mockPayment]);

    const result = await paymentsService.list('debt-550e8400', 'user-123');

    expect(debtsRepository.findById).toHaveBeenCalledWith('debt-550e8400');
    expect(result).toHaveLength(1);
    expect(result[0].amount).toBe('500.00');
  });

  it('throws 404 when debt not found', async () => {
    vi.mocked(debtsRepository.findById).mockResolvedValue(null as never);

    await expect(
      paymentsService.list('nonexistent', 'user-123'),
    ).rejects.toMatchObject({ statusCode: 404, message: 'Deuda no encontrada' });
  });

  it('throws 404 when debt not owned', async () => {
    vi.mocked(debtsRepository.findById).mockResolvedValue(mockDebt);

    await expect(
      paymentsService.list('debt-550e8400', 'other-user'),
    ).rejects.toMatchObject({ statusCode: 404 });
  });
});

describe('create', () => {
  it('creates payment and reduces currentAmount', async () => {
    vi.mocked(debtsRepository.findById).mockResolvedValue(mockDebt);
    vi.mocked(paymentsRepository.create).mockResolvedValue(undefined as never);
    vi.mocked(debtsRepository.update).mockResolvedValue(undefined as never);

    const result = await paymentsService.create(
      { amount: '500.00', paymentDate: '2026-06-15T10:00:00.000Z' },
      'debt-550e8400',
      'user-123',
    );

    expect(paymentsRepository.create).toHaveBeenCalledTimes(1);
    expect(debtsRepository.update).toHaveBeenCalledWith(
      'debt-550e8400',
      expect.objectContaining({
        currentAmount: '2500.0000',
      }),
    );
    expect(result.amount).toBe('500.00');
  });

  it('sets status to paid when currentAmount reaches 0', async () => {
    const almostPaidDebt = { ...mockDebt, currentAmount: '300.00' };
    vi.mocked(debtsRepository.findById).mockResolvedValue(almostPaidDebt);
    vi.mocked(paymentsRepository.create).mockResolvedValue(undefined as never);
    vi.mocked(debtsRepository.update).mockResolvedValue(undefined as never);

    await paymentsService.create(
      { amount: '500.00', paymentDate: '2026-06-15T10:00:00.000Z' },
      'debt-550e8400',
      'user-123',
    );

    expect(debtsRepository.update).toHaveBeenCalledWith(
      'debt-550e8400',
      expect.objectContaining({
        currentAmount: '0.0000',
        status: 'paid',
      }),
    );
  });

  it('throws 404 when debt not found', async () => {
    vi.mocked(debtsRepository.findById).mockResolvedValue(null as never);

    await expect(
      paymentsService.create(
        { amount: '500.00', paymentDate: '2026-06-15T10:00:00.000Z' },
        'nonexistent',
        'user-123',
      ),
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  it('throws 404 when debt not owned', async () => {
    vi.mocked(debtsRepository.findById).mockResolvedValue(mockDebt);

    await expect(
      paymentsService.create(
        { amount: '500.00', paymentDate: '2026-06-15T10:00:00.000Z' },
        'debt-550e8400',
        'other-user',
      ),
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  it('throws 400 when debt is already paid', async () => {
    const paidDebt = { ...mockDebt, status: 'paid' as const };
    vi.mocked(debtsRepository.findById).mockResolvedValue(paidDebt);

    await expect(
      paymentsService.create(
        { amount: '500.00', paymentDate: '2026-06-15T10:00:00.000Z' },
        'debt-550e8400',
        'user-123',
      ),
    ).rejects.toMatchObject({
      statusCode: 400,
      message: 'La deuda ya esta pagada',
    });

    expect(paymentsRepository.create).not.toHaveBeenCalled();
  });
});
