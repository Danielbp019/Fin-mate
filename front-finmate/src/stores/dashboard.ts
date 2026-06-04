import type { DashboardSummary } from '@/types/dashboard';
import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '@/services/api';

export const useDashboardStore = defineStore('dashboard', () => {
  const summary = ref<DashboardSummary | null>(null);
  const loading = ref(false);
  const error = ref('');

  async function fetchSummary() {
    loading.value = true;
    error.value = '';
    try {
      const res = await api.get<DashboardSummary>('/dashboard/summary');
      summary.value = res.data;
    } catch {
      error.value = 'Error al cargar el resumen financiero';
    } finally {
      loading.value = false;
    }
  }

  function $reset() {
    summary.value = null;
    loading.value = false;
    error.value = '';
  }

  return {
    summary,
    loading,
    error,
    fetchSummary,
    $reset,
  };
});
