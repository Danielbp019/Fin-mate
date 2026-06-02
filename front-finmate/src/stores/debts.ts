import type {
  CreateDebtBody,
  CreatePaymentBody,
  Debt,
  DebtFilters,
  Payment,
  UpdateDebtBody,
} from '@/types';
import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '@/services/api';

export const useDebtsStore = defineStore('debts', () => {
  const debts = ref<Debt[]>([]);
  const loading = ref(false);
  const error = ref('');

  async function fetchDebts(filters?: DebtFilters) {
    loading.value = true;
    error.value = '';
    try {
      const params: Record<string, string> = {};
      if (filters?.status) {
        params.status = filters.status;
      }
      if (filters?.priority) {
        params.priority = filters.priority;
      }
      const res = await api.get<Debt[]>('/debts', { params });
      debts.value = res.data;
    } catch (error_: unknown) {
      const msg =
        (error_ as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ?? 'Error al cargar deudas';
      error.value = msg;
    } finally {
      loading.value = false;
    }
  }

  async function createDebt(data: CreateDebtBody) {
    const res = await api.post<Debt>('/debts', data);
    debts.value.push(res.data);
    return res.data;
  }

  async function updateDebt(id: string, data: UpdateDebtBody) {
    const res = await api.patch<Debt>(`/debts/${id}`, data);
    const idx = debts.value.findIndex((d) => d.id === id);
    if (idx !== -1) {
      debts.value[idx] = res.data;
    }
    return res.data;
  }

  async function deleteDebt(id: string) {
    await api.delete(`/debts/${id}`);
    debts.value = debts.value.filter((d) => d.id !== id);
  }

  async function fetchPayments(debtId: string) {
    const res = await api.get<Payment[]>(`/debts/${debtId}/payments`);
    return res.data;
  }

  async function createPayment(debtId: string, data: CreatePaymentBody) {
    const res = await api.post<Payment>(`/debts/${debtId}/payments`, data);
    return res.data;
  }

  return {
    debts,
    loading,
    error,
    fetchDebts,
    createDebt,
    updateDebt,
    deleteDebt,
    fetchPayments,
    createPayment,
  };
});
