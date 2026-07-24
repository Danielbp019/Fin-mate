import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useDebtsStore } from '@/stores/debts';
import type { Debt, Payment } from '@/types';

vi.mock('@/services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import api from '@/services/api';

const mockDebts: Debt[] = [
  {
    id: '1',
    userId: 'u1',
    title: 'Tarjeta',
    description: null,
    initialAmount: '5000',
    currentAmount: '3000',
    interestRate: '0',
    interestRateType: 'annual',
    minimumPayment: '500',
    dueDate: null,
    priority: 'high',
    status: 'pending',
    startDate: null,
    endDate: null,
    createdAt: '2024-01-01',
    updatedAt: '2024-06-01',
  },
  {
    id: '2',
    userId: 'u1',
    title: 'Préstamo',
    description: 'Coche',
    initialAmount: '20000',
    currentAmount: '15000',
    interestRate: '5',
    interestRateType: 'annual',
    minimumPayment: '1000',
    dueDate: null,
    priority: 'medium',
    status: 'pending',
    startDate: '2024-01-01',
    endDate: null,
    createdAt: '2024-01-01',
    updatedAt: '2024-06-01',
  },
];

const mockPayments: Payment[] = [
  {
    id: 'p1',
    debtId: '1',
    userId: 'u1',
    amount: '500',
    paymentDate: '2024-06-01',
    notes: null,
    createdAt: '2024-06-01',
  },
];

describe('useDebtsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('fetchDebts loads debts', async () => {
    (api.get as any).mockResolvedValue({ data: mockDebts });
    const store = useDebtsStore();

    await store.fetchDebts();

    expect(api.get).toHaveBeenCalledWith('/debts', { params: {} });
    expect(store.debts).toEqual(mockDebts);
    expect(store.loading).toBe(false);
    expect(store.error).toBe('');
  });

  it('fetchDebts with filters passes params', async () => {
    (api.get as any).mockResolvedValue({ data: [mockDebts[0]] });
    const store = useDebtsStore();

    await store.fetchDebts({ status: 'pending', priority: 'high' });

    expect(api.get).toHaveBeenCalledWith('/debts', {
      params: { status: 'pending', priority: 'high' },
    });
  });

  it('fetchDebts handles error', async () => {
    (api.get as any).mockRejectedValue({
      response: { data: { error: 'Error deudas' } },
    });
    const store = useDebtsStore();

    await store.fetchDebts();

    expect(store.error).toBe('Error deudas');
    expect(store.loading).toBe(false);
  });

  it('fetchDebts handles error without message', async () => {
    (api.get as any).mockRejectedValue(new Error('fail'));
    const store = useDebtsStore();

    await store.fetchDebts();

    expect(store.error).toBe('Error al cargar deudas');
  });

  it('createDebt adds debt to list', async () => {
    const newDebt: Debt = {
      id: '3',
      userId: 'u1',
      title: 'Nueva Deuda',
      description: null,
      initialAmount: '1000',
      currentAmount: '1000',
    interestRate: '0',
    interestRateType: 'annual',
    minimumPayment: '100',
    dueDate: null,
      priority: 'low',
      status: 'pending',
      startDate: null,
      endDate: null,
      createdAt: '2024-07-01',
      updatedAt: '2024-07-01',
    };
    (api.post as any).mockResolvedValue({ data: newDebt });
    const store = useDebtsStore();

    const result = await store.createDebt({
      title: 'Nueva Deuda',
      initialAmount: '1000',
    });

    expect(api.post).toHaveBeenCalledWith('/debts', {
      title: 'Nueva Deuda',
      initialAmount: '1000',
    });
    expect(store.debts).toContainEqual(newDebt);
    expect(result).toEqual(newDebt);
  });

  it('updateDebt updates debt in list', async () => {
    const updated = { ...mockDebts[0], currentAmount: '2500' };
    (api.patch as any).mockResolvedValue({ data: updated });
    const store = useDebtsStore();
    store.debts = [...mockDebts];

    await store.updateDebt('1', { currentAmount: '2500' });

    expect(api.patch).toHaveBeenCalledWith('/debts/1', { currentAmount: '2500' });
    expect(store.debts[0].currentAmount).toBe('2500');
  });

  it('deleteDebt removes debt from list', async () => {
    (api.delete as any).mockResolvedValue({});
    const store = useDebtsStore();
    store.debts = [...mockDebts];

    await store.deleteDebt('1');

    expect(api.delete).toHaveBeenCalledWith('/debts/1');
    expect(store.debts).toHaveLength(1);
    expect(store.debts.find((d) => d.id === '1')).toBeUndefined();
  });

  it('fetchPayments returns payments for a debt', async () => {
    (api.get as any).mockResolvedValue({ data: mockPayments });
    const store = useDebtsStore();

    const result = await store.fetchPayments('1');

    expect(api.get).toHaveBeenCalledWith('/debts/1/payments');
    expect(result).toEqual(mockPayments);
  });

  it('createPayment calls POST and returns payment', async () => {
    const newPayment: Payment = {
      id: 'p2',
      debtId: '1',
      userId: 'u1',
      amount: '300',
      paymentDate: '2024-07-01',
      notes: 'Pago parcial',
      createdAt: '2024-07-01',
    };
    (api.post as any).mockResolvedValue({ data: newPayment });
    const store = useDebtsStore();

    const result = await store.createPayment('1', {
      amount: '300',
      paymentDate: '2024-07-01',
      notes: 'Pago parcial',
    });

    expect(api.post).toHaveBeenCalledWith('/debts/1/payments', {
      amount: '300',
      paymentDate: '2024-07-01',
      notes: 'Pago parcial',
    });
    expect(result).toEqual(newPayment);
  });
});
