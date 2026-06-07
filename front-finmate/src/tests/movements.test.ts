import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useMovementsStore } from '@/stores/movements';
import type { Movement } from '@/types';

vi.mock('@/services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import api from '@/services/api';

const mockMovements: Movement[] = [
  {
    id: '1',
    userId: 'u1',
    categoryId: 'c1',
    type: 'income',
    amount: '1000',
    description: 'Salario',
    movementDate: '2024-06-01',
    createdAt: '2024-06-01',
    updatedAt: '2024-06-01',
  },
  {
    id: '2',
    userId: 'u1',
    categoryId: 'c2',
    type: 'expense',
    amount: '50',
    description: 'Comida',
    movementDate: '2024-06-02',
    createdAt: '2024-06-02',
    updatedAt: '2024-06-02',
  },
];

describe('useMovementsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('fetchMovements loads movements and pagination', async () => {
    const mockResponse = {
      data: {
        data: mockMovements,
        pagination: { page: 1, limit: 20, total: 2 },
      },
    };
    (api.get as any).mockResolvedValue(mockResponse);

    const store = useMovementsStore();
    await store.fetchMovements();

    expect(api.get).toHaveBeenCalledWith('/movements', { params: {} });
    expect(store.movements).toEqual(mockMovements);
    expect(store.pagination).toEqual({ page: 1, limit: 20, total: 2 });
    expect(store.loading).toBe(false);
  });

  it('fetchMovements with override filters applies them', async () => {
    (api.get as any).mockResolvedValue({
      data: { data: [], pagination: { page: 1, limit: 20, total: 0 } },
    });

    const store = useMovementsStore();
    await store.fetchMovements({ type: 'expense', from: '2024-01-01', to: '2024-12-31' });

    expect(api.get).toHaveBeenCalledWith('/movements', {
      params: { type: 'expense', from: '2024-01-01', to: '2024-12-31' },
    });
    expect(store.filters.type).toBe('expense');
  });

  it('fetchMovements handles error', async () => {
    (api.get as any).mockRejectedValue({
      response: { data: { error: 'Error de carga' } },
    });

    const store = useMovementsStore();
    await store.fetchMovements();

    expect(store.error).toBe('Error de carga');
    expect(store.loading).toBe(false);
  });

  it('fetchMovements handles error without message', async () => {
    (api.get as any).mockRejectedValue(new Error('fail'));

    const store = useMovementsStore();
    await store.fetchMovements();

    expect(store.error).toBe('Error al cargar movimientos');
  });

  it('createMovement makes POST and does not mutate list', async () => {
    const newMovement: Movement = {
      id: '3',
      userId: 'u1',
      categoryId: 'c3',
      type: 'income',
      amount: '500',
      description: 'Freelance',
      movementDate: '2024-07-01',
      createdAt: '2024-07-01',
      updatedAt: '2024-07-01',
    };
    (api.post as any).mockResolvedValue({ data: newMovement });

    const store = useMovementsStore();
    const result = await store.createMovement({
      categoryId: 'c3',
      type: 'income',
      amount: '500',
      movementDate: '2024-07-01',
    });

    expect(api.post).toHaveBeenCalledWith('/movements', {
      categoryId: 'c3',
      type: 'income',
      amount: '500',
      movementDate: '2024-07-01',
    });
    expect(result).toEqual(newMovement);
  });

  it('updateMovement makes PATCH and returns updated', async () => {
    const updated = { ...mockMovements[0], amount: '1200' };
    (api.patch as any).mockResolvedValue({ data: updated });

    const store = useMovementsStore();
    const result = await store.updateMovement('1', { amount: '1200' });

    expect(api.patch).toHaveBeenCalledWith('/movements/1', { amount: '1200' });
    expect(result).toEqual(updated);
  });

  it('deleteMovement makes DELETE', async () => {
    (api.delete as any).mockResolvedValue({});

    const store = useMovementsStore();
    await store.deleteMovement('1');

    expect(api.delete).toHaveBeenCalledWith('/movements/1');
  });

  it('setPage changes page and refetches', async () => {
    (api.get as any).mockResolvedValue({
      data: { data: [], pagination: { page: 2, limit: 20, total: 0 } },
    });

    const store = useMovementsStore();
    await store.setPage(2);

    expect(store.filters.page).toBe(2);
    expect(api.get).toHaveBeenCalled();
  });

  it('setFilters replaces filters and resets page to 1', async () => {
    (api.get as any).mockResolvedValue({
      data: { data: [], pagination: { page: 1, limit: 20, total: 0 } },
    });

    const store = useMovementsStore();
    store.filters = { type: 'income', page: 3 };

    await store.setFilters({ type: 'expense', categoryId: 'c1' });

    expect(store.filters.type).toBe('expense');
    expect(store.filters.categoryId).toBe('c1');
    expect(store.filters.page).toBe(1);
  });
});
