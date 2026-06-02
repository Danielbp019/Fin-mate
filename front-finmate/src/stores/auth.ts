import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/services/api';

export interface User {
  id: string;
  name: string;
  email: string;
}

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter();

  const accessToken = ref<string | null>(null);
  const user = ref<User | null>(null);
  const appReady = ref(false);

  const isAuthenticated = computed(() => !!accessToken.value);

  async function login(email: string, password: string) {
    const res = await api.post('/auth/login', { email, password });
    accessToken.value = res.data.accessToken;
    user.value = res.data.user;
    appReady.value = true;
    router.push('/dashboard');
  }

  async function register(name: string, email: string, password: string) {
    const res = await api.post('/auth/register', { name, email, password });
    accessToken.value = res.data.accessToken;
    user.value = res.data.user;
    appReady.value = true;
    router.push('/dashboard');
  }

  async function logout() {
    try {
      await api.post('/auth/logout');
    } finally {
      clear();
      localStorage.removeItem('theme');
      router.push('/');
    }
  }

  async function refresh() {
    const res = await api.post('/auth/refresh');
    accessToken.value = res.data.accessToken;
    user.value = res.data.user;
  }

  async function updateProfile(name: string) {
    const res = await api.patch('/auth/profile', { name });
    user.value = res.data;
  }

  async function initialize() {
    try {
      await refresh();
    } catch {
      clear();
    } finally {
      appReady.value = true;
    }
  }

  function clear() {
    accessToken.value = null;
    user.value = null;
  }

  return {
    accessToken,
    user,
    isAuthenticated,
    appReady,
    login,
    register,
    logout,
    refresh,
    updateProfile,
    initialize,
    clear,
  };
});
