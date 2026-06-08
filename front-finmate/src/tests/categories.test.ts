import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCategoriesStore } from '@/stores/categories';
import type { Category } from '@/types';

vi.mock('@/services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import api from '@/services/api';

const mockCategories: Category[] = [
  {
    id: '1',
    userId: null,
    type: 'income',
    name: 'Salario',
    icon: 'mdi-cash',
    isSystem: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: '2',
    userId: null,
    type: 'expense',
    name: 'Comida',
    icon: 'mdi-food',
    isSystem: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: '3',
    userId: null,
    type: 'expense',
    name: 'Inactiva',
    icon: null,
    isSystem: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
];

describe('useCategoriesStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('fetchCategories loads categories into state', async () => {
    (api.get as any).mockResolvedValue({ data: mockCategories });
    const store = useCategoriesStore();

    await store.fetchCategories();

    expect(api.get).toHaveBeenCalledWith('/categories', { params: {} });
    expect(store.categories).toEqual(mockCategories);
    expect(store.loading).toBe(false);
    expect(store.error).toBe('');
  });

  it('fetchCategories with type filter passes params', async () => {
    (api.get as any).mockResolvedValue({ data: [mockCategories[0]] });
    const store = useCategoriesStore();

    await store.fetchCategories('income');

    expect(api.get).toHaveBeenCalledWith('/categories', { params: { type: 'income' } });
  });

  it('fetchCategories handles error', async () => {
    (api.get as any).mockRejectedValue({
      response: { data: { error: 'Error del servidor' } },
    });
    const store = useCategoriesStore();

    await store.fetchCategories();

    expect(store.error).toBe('Error del servidor');
    expect(store.loading).toBe(false);
  });

  it('fetchCategories handles error without response message', async () => {
    (api.get as any).mockRejectedValue(new Error('Network error'));
    const store = useCategoriesStore();

    await store.fetchCategories();

    expect(store.error).toBe('Error al cargar categorías');
    expect(store.loading).toBe(false);
  });

  it('incomeCategories returns income categories', () => {
    const store = useCategoriesStore();
    store.categories = mockCategories;

    expect(store.incomeCategories).toHaveLength(1);
    expect(store.incomeCategories[0].name).toBe('Salario');
  });

  it('expenseCategories returns expense categories', () => {
    const store = useCategoriesStore();
    store.categories = mockCategories;

    expect(store.expenseCategories).toHaveLength(2);
  });

  it('getCategoryById finds by id', () => {
    const store = useCategoriesStore();
    store.categories = mockCategories;

    const result = store.getCategoryById('2');
    expect(result).not.toBeNull();
    expect(result!.name).toBe('Comida');
  });

  it('getCategoryById returns null for missing id', () => {
    const store = useCategoriesStore();
    store.categories = mockCategories;

    expect(store.getCategoryById('999')).toBeNull();
  });

  it('createCategory adds category to list', async () => {
    const newCategory: Category = {
      id: '4',
      userId: 'u1',
      type: 'income',
      name: 'Freelance',
    icon: null,
    isSystem: false,
      createdAt: '2024-02-01',
      updatedAt: '2024-02-01',
    };
    (api.post as any).mockResolvedValue({ data: newCategory });
    const store = useCategoriesStore();

    const result = await store.createCategory({ name: 'Freelance', type: 'income' });

    expect(api.post).toHaveBeenCalledWith('/categories', {
      name: 'Freelance',
      type: 'income',
    });
    expect(store.categories).toContainEqual(newCategory);
    expect(result).toEqual(newCategory);
  });

  it('updateCategory updates category in list', async () => {
    (api.patch as any).mockResolvedValue({
      data: { ...mockCategories[0], name: 'Salario Actualizado' },
    });
    const store = useCategoriesStore();
    store.categories = [...mockCategories];

    await store.updateCategory('1', { name: 'Salario Actualizado' });

    expect(api.patch).toHaveBeenCalledWith('/categories/1', { name: 'Salario Actualizado' });
    expect(store.categories[0].name).toBe('Salario Actualizado');
  });

  it('deleteCategory removes category from list', async () => {
    (api.delete as any).mockResolvedValue({});
    const store = useCategoriesStore();
    store.categories = [...mockCategories];

    await store.deleteCategory('1');

    expect(api.delete).toHaveBeenCalledWith('/categories/1');
    expect(store.categories).toHaveLength(2);
    expect(store.categories.find((c) => c.id === '1')).toBeUndefined();
  });
});
