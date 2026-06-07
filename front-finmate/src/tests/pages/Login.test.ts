import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';

const mockLogin = vi.fn();

vi.mock('@/stores/auth', () => ({
  useAuthStore: vi.fn(() => ({
    login: mockLogin,
  })),
}));

import Login from '@/pages/Login.vue';

describe('Login.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('renders the login page', () => {
    const wrapper = shallowMount(Login);
    expect(wrapper.text()).toContain('Bienvenido de vuelta');
  });

  it('calls auth.login on handleLogin', async () => {
    mockLogin.mockResolvedValue(undefined);

    const wrapper = shallowMount(Login) as any;
    wrapper.vm.email = 'test@test.com';
    wrapper.vm.password = 'mypassword';
    await wrapper.vm.handleLogin();

    expect(mockLogin).toHaveBeenCalledWith('test@test.com', 'mypassword');
    expect(wrapper.vm.loading).toBe(false);
  });

  it('shows error on login failure with server message', async () => {
    mockLogin.mockRejectedValue({
      response: { data: { message: 'Credenciales inválidas' } },
    });

    const wrapper = shallowMount(Login) as any;
    wrapper.vm.email = 'test@test.com';
    wrapper.vm.password = 'wrong';
    await wrapper.vm.handleLogin();

    expect(wrapper.vm.error).toBe('Credenciales inválidas');
    expect(wrapper.vm.loading).toBe(false);
  });

  it('shows generic error when no server message', async () => {
    mockLogin.mockRejectedValue(new Error('network'));

    const wrapper = shallowMount(Login) as any;
    wrapper.vm.email = 'test@test.com';
    wrapper.vm.password = 'wrong';
    await wrapper.vm.handleLogin();

    expect(wrapper.vm.error).toBe('Error al iniciar sesión');
    expect(wrapper.vm.loading).toBe(false);
  });
});
