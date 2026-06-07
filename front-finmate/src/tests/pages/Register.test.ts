import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';

const mockRegister = vi.fn();

vi.mock('@/stores/auth', () => ({
  useAuthStore: vi.fn(() => ({
    register: mockRegister,
  })),
}));

import Register from '@/pages/Register.vue';

describe('Register.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('renders the registration page', () => {
    const wrapper = shallowMount(Register);
    expect(wrapper.text()).toContain('Crea tu cuenta');
  });

  it('calls auth.register on handleRegister with matching passwords', async () => {
    mockRegister.mockResolvedValue(undefined);

    const wrapper = shallowMount(Register) as any;
    wrapper.vm.name = 'Test User';
    wrapper.vm.email = 'test@test.com';
    wrapper.vm.password = 'pass123';
    wrapper.vm.confirmPassword = 'pass123';
    await wrapper.vm.handleRegister();

    expect(mockRegister).toHaveBeenCalledWith('Test User', 'test@test.com', 'pass123');
    expect(wrapper.vm.loading).toBe(false);
  });

  it('shows error when passwords do not match', async () => {
    const wrapper = shallowMount(Register) as any;
    wrapper.vm.name = 'Test';
    wrapper.vm.email = 'test@test.com';
    wrapper.vm.password = 'pass123';
    wrapper.vm.confirmPassword = 'different';
    await wrapper.vm.handleRegister();

    expect(wrapper.vm.error).toBe('Las contraseñas no coinciden');
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('shows error on register failure with server message', async () => {
    mockRegister.mockRejectedValue({
      response: { data: { message: 'El correo ya está registrado' } },
    });

    const wrapper = shallowMount(Register) as any;
    wrapper.vm.name = 'Test';
    wrapper.vm.email = 'existing@test.com';
    wrapper.vm.password = 'pass123';
    wrapper.vm.confirmPassword = 'pass123';
    await wrapper.vm.handleRegister();

    expect(wrapper.vm.error).toBe('El correo ya está registrado');
    expect(wrapper.vm.loading).toBe(false);
  });

  it('shows generic error when no server message', async () => {
    mockRegister.mockRejectedValue(new Error('network'));

    const wrapper = shallowMount(Register) as any;
    wrapper.vm.name = 'Test';
    wrapper.vm.email = 'test@test.com';
    wrapper.vm.password = 'pass123';
    wrapper.vm.confirmPassword = 'pass123';
    await wrapper.vm.handleRegister();

    expect(wrapper.vm.error).toBe('Error al registrarse');
    expect(wrapper.vm.loading).toBe(false);
  });
});
