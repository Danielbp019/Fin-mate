import type {
  Couple,
  CreateContributionBody,
  CreateCoupleBody,
  CreateGoalBody,
  Goal,
  UpdateCoupleBody,
  UpdateGoalBody,
} from '@/types';
import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '@/services/api';

export const useCouplesStore = defineStore('couples', () => {
  const couple = ref<Couple | null>(null);
  const goals = ref<Goal[]>([]);
  const loading = ref(false);
  const saving = ref(false);
  const error = ref('');

  async function fetchCouple() {
    loading.value = true;
    error.value = '';
    try {
      const res = await api.get<Couple>('/couples');
      couple.value = res.data;
    } catch {
      couple.value = null;
    } finally {
      loading.value = false;
    }
  }

  async function createCouple(data: CreateCoupleBody) {
    saving.value = true;
    error.value = '';
    try {
      const res = await api.post<Couple>('/couples', data);
      couple.value = res.data;
      return res.data;
    } catch (error_: unknown) {
      const msg =
        (error_ as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Error al crear el grupo';
      error.value = msg;
      throw error_;
    } finally {
      saving.value = false;
    }
  }

  async function updateCouple(data: UpdateCoupleBody) {
    if (!couple.value) return;
    saving.value = true;
    error.value = '';
    try {
      const res = await api.patch<Couple>(`/couples/${couple.value.id}`, data);
      couple.value = res.data;
      return res.data;
    } catch (error_: unknown) {
      const msg =
        (error_ as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Error al actualizar el grupo';
      error.value = msg;
      throw error_;
    } finally {
      saving.value = false;
    }
  }

  async function invitePartner(email: string) {
    if (!couple.value) return;
    error.value = '';
    try {
      await api.post(`/couples/${couple.value.id}/invite`, { email });
    } catch (error_: unknown) {
      const msg =
        (error_ as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Error al invitar';
      error.value = msg;
      throw error_;
    }
  }

  async function joinCouple(id: string) {
    saving.value = true;
    error.value = '';
    try {
      const res = await api.post<Couple>(`/couples/${id}/join`);
      couple.value = res.data;
      return res.data;
    } catch (error_: unknown) {
      const msg =
        (error_ as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Error al unirse al grupo';
      error.value = msg;
      throw error_;
    } finally {
      saving.value = false;
    }
  }

  async function leaveCouple() {
    if (!couple.value) return;
    saving.value = true;
    error.value = '';
    try {
      await api.delete(`/couples/${couple.value.id}/leave`);
      couple.value = null;
      goals.value = [];
    } catch (error_: unknown) {
      const msg =
        (error_ as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Error al abandonar el grupo';
      error.value = msg;
      throw error_;
    } finally {
      saving.value = false;
    }
  }

  async function dissolveCouple() {
    if (!couple.value) return;
    saving.value = true;
    error.value = '';
    try {
      await api.delete(`/couples/${couple.value.id}`);
      couple.value = null;
      goals.value = [];
    } catch (error_: unknown) {
      const msg =
        (error_ as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Error al disolver el grupo';
      error.value = msg;
      throw error_;
    } finally {
      saving.value = false;
    }
  }

  async function fetchGoals() {
    if (!couple.value) return;
    error.value = '';
    try {
      const res = await api.get<Goal[]>(`/couples/${couple.value.id}/goals`);
      goals.value = res.data;
    } catch (error_: unknown) {
      const msg =
        (error_ as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Error al cargar metas';
      error.value = msg;
    }
  }

  async function createGoal(data: CreateGoalBody) {
    if (!couple.value) return;
    saving.value = true;
    error.value = '';
    try {
      const res = await api.post<Goal>(`/couples/${couple.value.id}/goals`, data);
      goals.value.push(res.data);
      return res.data;
    } catch (error_: unknown) {
      const msg =
        (error_ as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Error al crear la meta';
      error.value = msg;
      throw error_;
    } finally {
      saving.value = false;
    }
  }

  async function updateGoal(goalId: string, data: UpdateGoalBody) {
    if (!couple.value) return;
    saving.value = true;
    error.value = '';
    try {
      const res = await api.patch<Goal>(`/couples/${couple.value.id}/goals/${goalId}`, data);
      const idx = goals.value.findIndex((g) => g.id === goalId);
      if (idx !== -1) goals.value[idx] = res.data;
      return res.data;
    } catch (error_: unknown) {
      const msg =
        (error_ as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Error al actualizar la meta';
      error.value = msg;
      throw error_;
    } finally {
      saving.value = false;
    }
  }

  async function deleteGoal(goalId: string) {
    if (!couple.value) return;
    error.value = '';
    try {
      await api.delete(`/couples/${couple.value.id}/goals/${goalId}`);
      goals.value = goals.value.filter((g) => g.id !== goalId);
    } catch (error_: unknown) {
      const msg =
        (error_ as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Error al eliminar la meta';
      error.value = msg;
      throw error_;
    }
  }

  async function contributeToGoal(goalId: string, data: CreateContributionBody) {
    if (!couple.value) return;
    saving.value = true;
    error.value = '';
    try {
      await api.post(`/couples/${couple.value.id}/goals/${goalId}/contribute`, data);
      await fetchGoals();
    } catch (error_: unknown) {
      const msg =
        (error_ as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Error al contribuir';
      error.value = msg;
      throw error_;
    } finally {
      saving.value = false;
    }
  }

  return {
    couple,
    goals,
    loading,
    saving,
    error,
    fetchCouple,
    createCouple,
    updateCouple,
    invitePartner,
    joinCouple,
    leaveCouple,
    dissolveCouple,
    fetchGoals,
    createGoal,
    updateGoal,
    deleteGoal,
    contributeToGoal,
  };
});
