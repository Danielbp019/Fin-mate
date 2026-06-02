import type { Category, CreateCategoryBody, UpdateCategoryBody } from '@/types';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import api from '@/services/api';

export const useCategoriesStore = defineStore('categories', () => {
  const categories = ref<Category[]>([]);
  const loading = ref(false);
  const error = ref('');

  const incomeCategories = computed(() =>
    categories.value.filter((c) => c.type === 'income' && c.isActive),
  );
  const expenseCategories = computed(() =>
    categories.value.filter((c) => c.type === 'expense' && c.isActive),
  );

  function getCategoryById(id: string) {
    return categories.value.find((c) => c.id === id) ?? null;
  }

  async function fetchCategories(type?: 'income' | 'expense') {
    loading.value = true;
    error.value = '';
    try {
      const params = type ? { type } : {};
      const res = await api.get<Category[]>('/categories', { params });
      categories.value = res.data;
    } catch (error_: unknown) {
      const msg =
        (error_ as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Error al cargar categorías';
      error.value = msg;
    } finally {
      loading.value = false;
    }
  }

  async function createCategory(data: CreateCategoryBody) {
    const res = await api.post<Category>('/categories', data);
    categories.value.push(res.data);
    return res.data;
  }

  async function updateCategory(id: string, data: UpdateCategoryBody) {
    const res = await api.patch<Category>(`/categories/${id}`, data);
    const idx = categories.value.findIndex((c) => c.id === id);
    if (idx !== -1) {
      categories.value[idx] = res.data;
    }
    return res.data;
  }

  async function deleteCategory(id: string) {
    await api.delete(`/categories/${id}`);
    categories.value = categories.value.filter((c) => c.id !== id);
  }

  return {
    categories,
    loading,
    error,
    incomeCategories,
    expenseCategories,
    getCategoryById,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  };
});
