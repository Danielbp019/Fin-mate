import type {
  CreateMovementBody,
  Movement,
  MovementFilters,
  PaginatedResponse,
  UpdateMovementBody,
} from '@/types';
import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '@/services/api';

export const useMovementsStore = defineStore('movements', () => {
  const movements = ref<Movement[]>([]);
  const pagination = ref({ page: 1, limit: 20, total: 0 });
  const filters = ref<MovementFilters>({});
  const loading = ref(false);
  const error = ref('');

  async function fetchMovements(overrideFilters?: MovementFilters) {
    loading.value = true;
    error.value = '';
    try {
      if (overrideFilters) {
        filters.value = overrideFilters;
      }
      const params: Record<string, string | number> = {};
      if (filters.value.type) {
        params.type = filters.value.type;
      }
      if (filters.value.categoryId) {
        params.categoryId = filters.value.categoryId;
      }
      if (filters.value.from) {
        params.from = filters.value.from;
      }
      if (filters.value.to) {
        params.to = filters.value.to;
      }
      if (filters.value.page) {
        params.page = filters.value.page;
      }
      if (filters.value.limit) {
        params.limit = filters.value.limit;
      }

      const res = await api.get<PaginatedResponse<Movement>>('/movements', {
        params,
      });
      movements.value = res.data.data;
      pagination.value = res.data.pagination;
    } catch (error_: unknown) {
      const msg =
        (error_ as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ?? 'Error al cargar movimientos';
      error.value = msg;
    } finally {
      loading.value = false;
    }
  }

  async function createMovement(data: CreateMovementBody) {
    const res = await api.post<Movement>('/movements', data);
    return res.data;
  }

  async function updateMovement(id: string, data: UpdateMovementBody) {
    const res = await api.patch<Movement>(`/movements/${id}`, data);
    return res.data;
  }

  async function deleteMovement(id: string) {
    await api.delete(`/movements/${id}`);
  }

  function setPage(page: number) {
    filters.value.page = page;
    fetchMovements();
  }

  function setFilters(newFilters: MovementFilters) {
    filters.value = { ...newFilters, page: 1 };
    fetchMovements();
  }

  return {
    movements,
    pagination,
    filters,
    loading,
    error,
    fetchMovements,
    createMovement,
    updateMovement,
    deleteMovement,
    setPage,
    setFilters,
  };
});
