import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useDashboardStore } from '@/stores/dashboard';
import type { DashboardSummary } from '@/types/dashboard';

vi.mock('@/services/api', () => ({
  default: {
    get: vi.fn(),
  },
}));

import api from '@/services/api';

const mockSummary: DashboardSummary = {
  currentMonth: {
    totalIncome: '5000',
    totalExpense: '3000',
    balance: '2000',
  },
  comparison: {
    incomeChange: 10.5,
    expenseChange: -5.2,
  },
  incomeByCategory: [{ categoryId: 'c1', categoryName: 'Salario', icon: null, total: '4000' }],
  expenseByCategory: [{ categoryId: 'c2', categoryName: 'Comida', icon: null, total: '1000' }],
  monthlyBalance: [{ month: '2024-06', income: '5000', expense: '3000', balance: '2000' }],
  recentMovements: [
    {
      id: 'm1',
      type: 'income',
      amount: '500',
      categoryName: 'Salario',
      categoryIcon: null,
      description: null,
      movementDate: '2024-06-01',
    },
  ],
  activeDebts: { count: 2, totalRemaining: '5000' },
  coupleGoals: { active: 1, totalProgress: 50 },
};

describe('useDashboardStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('fetchSummary loads summary data', async () => {
    (api.get as any).mockResolvedValue({ data: mockSummary });

    const store = useDashboardStore();
    await store.fetchSummary();

    expect(api.get).toHaveBeenCalledWith('/dashboard/summary');
    expect(store.summary).toEqual(mockSummary);
    expect(store.loading).toBe(false);
    expect(store.error).toBe('');
  });

  it('fetchSummary handles error', async () => {
    (api.get as any).mockRejectedValue(new Error('fail'));

    const store = useDashboardStore();
    await store.fetchSummary();

    expect(store.error).toBe('Error al cargar el resumen financiero');
    expect(store.summary).toBeNull();
    expect(store.loading).toBe(false);
  });

  it('$reset clears all state', () => {
    const store = useDashboardStore();
    store.summary = mockSummary;
    store.loading = true;
    store.error = 'some error';

    store.$reset();

    expect(store.summary).toBeNull();
    expect(store.loading).toBe(false);
    expect(store.error).toBe('');
  });
});
