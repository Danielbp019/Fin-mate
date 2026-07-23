import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as debtsRepository from '../../debts/debts.repository.js';

vi.mock('../../debts/debts.repository.js');

const mockDebts = [
  {
    id: 'debt-1',
    userId: 'user-123',
    coupleId: null,
    title: 'Tarjeta alta tasa',
    description: null,
    initialAmount: '3000.00',
    currentAmount: '3000.00',
    interestRate: '24',
    minimumPayment: '150.00',
    dueDay: 10,
    priority: 'high',
    status: 'pending' as const,
    startDate: null,
    endDate: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    deletedAt: null,
  },
  {
    id: 'debt-2',
    userId: 'user-123',
    coupleId: null,
    title: 'Préstamo baja tasa',
    description: null,
    initialAmount: '10000.00',
    currentAmount: '10000.00',
    interestRate: '5',
    minimumPayment: '300.00',
    dueDay: 15,
    priority: 'medium',
    status: 'pending' as const,
    startDate: null,
    endDate: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    deletedAt: null,
  },
  {
    id: 'debt-3',
    userId: 'user-123',
    coupleId: null,
    title: 'Deuda pequeña',
    description: null,
    initialAmount: '500.00',
    currentAmount: '500.00',
    interestRate: '10',
    minimumPayment: '50.00',
    dueDay: 5,
    priority: 'low',
    status: 'pending' as const,
    startDate: null,
    endDate: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    deletedAt: null,
  },
];

let advisorService: typeof import('../advisor.service.js');

beforeEach(async () => {
  vi.clearAllMocks();
  advisorService = await import('../advisor.service.js');
});

describe('generatePlan', () => {
  it('returns avalanche as recommended when rates differ significantly', async () => {
    vi.mocked(debtsRepository.findByUser).mockResolvedValue(mockDebts);

    const result = await advisorService.generatePlan('user-123', '500');

    expect(debtsRepository.findByUser).toHaveBeenCalledWith('user-123', { status: 'pending' });
    expect(result.recommendedStrategy).toBe('avalanche');
    expect(result.strategies.length).toBe(4);
    expect(result.tips.length).toBeGreaterThan(0);
  });

  it('snowball orders by smallest balance first', async () => {
    vi.mocked(debtsRepository.findByUser).mockResolvedValue(mockDebts);

    const result = await advisorService.generatePlan('user-123', '500');
    const snowball = result.strategies.find((s) => s.key === 'snowball');

    expect(snowball).toBeDefined();
    expect(snowball!.order[0].title).toBe('Deuda pequeña');
    expect(snowball!.order[1].title).toBe('Tarjeta alta tasa');
    expect(snowball!.order[2].title).toBe('Préstamo baja tasa');
  });

  it('avalanche orders by highest rate first', async () => {
    vi.mocked(debtsRepository.findByUser).mockResolvedValue(mockDebts);

    const result = await advisorService.generatePlan('user-123', '500');
    const avalanche = result.strategies.find((s) => s.key === 'avalanche');

    expect(avalanche).toBeDefined();
    expect(avalanche!.order[0].title).toBe('Tarjeta alta tasa');
    expect(avalanche!.order[1].title).toBe('Deuda pequeña');
    expect(avalanche!.order[2].title).toBe('Préstamo baja tasa');
  });

  it('byPriority puts extra toward highest priority first', async () => {
    vi.mocked(debtsRepository.findByUser).mockResolvedValue(mockDebts);

    const result = await advisorService.generatePlan('user-123', '500');
    const byPriority = result.strategies.find((s) => s.key === 'byPriority');

    expect(byPriority).toBeDefined();
    expect(byPriority!.order[0].title).toBe('Tarjeta alta tasa');
    expect(byPriority!.order[2].title).toBe('Préstamo baja tasa');
  });

  it('avalanche pays less total interest than snowball', async () => {
    vi.mocked(debtsRepository.findByUser).mockResolvedValue(mockDebts);

    const result = await advisorService.generatePlan('user-123', '500');
    const avalanche = result.strategies.find((s) => s.key === 'avalanche')!;
    const snowball = result.strategies.find((s) => s.key === 'snowball')!;

    expect(parseFloat(avalanche.totalInterestPaid)).toBeLessThan(parseFloat(snowball.totalInterestPaid));
  });

  it('generates applicable tips for high interest debts', async () => {
    vi.mocked(debtsRepository.findByUser).mockResolvedValue(mockDebts);

    const result = await advisorService.generatePlan('user-123', '500');

    const balanceTransferTip = result.tips.find((t) => t.type === 'balance_transfer');
    expect(balanceTransferTip?.applicable).toBe(true);

    const negotiationTip = result.tips.find((t) => t.type === 'negotiation');
    expect(negotiationTip?.applicable).toBe(false);
  });

  it('returns empty result when no debts', async () => {
    vi.mocked(debtsRepository.findByUser).mockResolvedValue([]);

    const result = await advisorService.generatePlan('user-123', '500');

    expect(result.strategies).toHaveLength(0);
    expect(result.recommendedStrategy).toBe('');
    expect(result.totalMonthlyMinimum).toBe('0.00');
  });

  it('respects zero extra payment', async () => {
    vi.mocked(debtsRepository.findByUser).mockResolvedValue([mockDebts[0], mockDebts[1]]);

    const result = await advisorService.generatePlan('user-123', '0');

    expect(result.totalMonthlyWithExtra).toBe(result.totalMonthlyMinimum);
  });

  it('snowball recommended when all rates are the same', async () => {
    const sameRateDebts = mockDebts.map((d) => ({ ...d, interestRate: '10' }));
    vi.mocked(debtsRepository.findByUser).mockResolvedValue(sameRateDebts);

    const result = await advisorService.generatePlan('user-123', '500');

    expect(result.recommendedStrategy).toBe('snowball');
  });

  it('returns plan with scenarios for existing debt', async () => {
    vi.mocked(debtsRepository.findById).mockResolvedValue(mockDebts[0]);

    const result = await advisorService.getDebtPayoffPlan('user-123', 'debt-1');

    expect(result.debtId).toBe('debt-1');
    expect(result.title).toBe('Tarjeta alta tasa');
    expect(result.scenarios.length).toBe(2);
    expect(result.scenarios[0].label).toBe('Solo m\u00EDnimos');
    expect(result.scenarios[1].label).toBe('Recomendado');
    expect(result.suggestedPayment).toBe('225.00');
  });

  it('includes custom scenario when monthlyPayment is provided', async () => {
    vi.mocked(debtsRepository.findById).mockResolvedValue(mockDebts[0]);

    const result = await advisorService.getDebtPayoffPlan('user-123', 'debt-1', '500');

    expect(result.scenarios.length).toBe(3);
    expect(result.scenarios[2].label).toBe('Tu plan');
    expect(result.scenarios[2].monthlyPayment).toBe('500.00');
  });

  it('throws 404 when debt not found', async () => {
    vi.mocked(debtsRepository.findById).mockResolvedValue(null);

    await expect(
      advisorService.getDebtPayoffPlan('user-123', 'nonexistent'),
    ).rejects.toThrow('Deuda no encontrada');
  });

  it('throws 404 when debt belongs to another user', async () => {
    vi.mocked(debtsRepository.findById).mockResolvedValue(mockDebts[0]);

    await expect(
      advisorService.getDebtPayoffPlan('other-user', 'debt-1'),
    ).rejects.toThrow('Deuda no encontrada');
  });

  it('calculates progress percent correctly', async () => {
    const partiallyPaid = { ...mockDebts[0], currentAmount: '2000.00', initialAmount: '4000.00' };
    vi.mocked(debtsRepository.findById).mockResolvedValue(partiallyPaid);

    const result = await advisorService.getDebtPayoffPlan('user-123', 'debt-1');

    expect(result.progressPercent).toBe(50);
  });

  it('estimates payoff date in the future', async () => {
    const smallDebt = { ...mockDebts[0], currentAmount: '1000.00', interestRate: '0', minimumPayment: '500.00' };
    vi.mocked(debtsRepository.findById).mockResolvedValue(smallDebt);

    const result = await advisorService.getDebtPayoffPlan('user-123', 'debt-1', '500');

    const payoffDate = new Date(result.scenarios[2].estimatedPayoffDate);
    expect(payoffDate.getTime()).toBeGreaterThan(new Date().getTime());
  });
});
