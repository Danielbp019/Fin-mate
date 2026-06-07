import { describe, it, expect, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => {
  let guardCallback: ((to: any) => any) | null = null;
  const mockRouter = {
    beforeEach: vi.fn((cb: any) => {
      guardCallback = cb;
    }),
    push: vi.fn(),
  };
  return {
    mockRouter,
    getGuard: () => guardCallback,
    setAuthState: vi.fn(),
  };
});

vi.mock('vue-router', () => ({
  createRouter: vi.fn(() => mocks.mockRouter),
  createWebHistory: vi.fn(() => ({})),
}));

vi.mock('@/stores/auth', () => ({
  useAuthStore: vi.fn(() => ({
    appReady: false,
    isAuthenticated: false,
    initialize: vi.fn(),
  })),
}));

import { useAuthStore } from '@/stores/auth';

describe('router guard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects unauthenticated user to login on protected route', async () => {
    (useAuthStore as any).mockReturnValue({
      appReady: true,
      isAuthenticated: false,
      initialize: vi.fn(),
    });

    await import('@/router/index');
    const guard = mocks.getGuard()!;

    const result = await guard({ name: 'Dashboard' });

    expect(result).toEqual({ name: 'Login' });
  });

  it('redirects authenticated user to dashboard on guest route', async () => {
    (useAuthStore as any).mockReturnValue({
      appReady: true,
      isAuthenticated: true,
      initialize: vi.fn(),
    });

    await import('@/router/index');
    const guard = mocks.getGuard()!;

    const result = await guard({ name: 'Login' });

    expect(result).toEqual({ name: 'Dashboard' });
  });

  it('allows guest access on guest routes when unauthenticated', async () => {
    (useAuthStore as any).mockReturnValue({
      appReady: true,
      isAuthenticated: false,
      initialize: vi.fn(),
    });

    await import('@/router/index');
    const guard = mocks.getGuard()!;

    const result = await guard({ name: 'Login' });

    expect(result).toBeUndefined();
  });

  it('allows authenticated access on protected routes', async () => {
    (useAuthStore as any).mockReturnValue({
      appReady: true,
      isAuthenticated: true,
      initialize: vi.fn(),
    });

    await import('@/router/index');
    const guard = mocks.getGuard()!;

    const result = await guard({ name: 'Dashboard' });

    expect(result).toBeUndefined();
  });

  it('initializes auth if appReady is false on protected route', async () => {
    const initialize = vi.fn();
    (useAuthStore as any).mockReturnValue({
      appReady: false,
      isAuthenticated: false,
      initialize,
    });

    await import('@/router/index');
    const guard = mocks.getGuard()!;

    await guard({ name: 'Dashboard' });

    expect(initialize).toHaveBeenCalled();
  });

  it('does not initialize auth on guest routes when appReady is false', async () => {
    const initialize = vi.fn();
    (useAuthStore as any).mockReturnValue({
      appReady: false,
      isAuthenticated: false,
      initialize,
    });

    await import('@/router/index');
    const guard = mocks.getGuard()!;

    await guard({ name: 'Landing' });

    expect(initialize).not.toHaveBeenCalled();
  });
});
