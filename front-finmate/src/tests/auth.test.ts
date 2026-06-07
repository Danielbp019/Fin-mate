import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useAuthStore } from '@/stores/auth';

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
}));

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mocks.push }),
}));

vi.mock('@/services/api', () => ({
  default: {
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

import api from '@/services/api';

describe('useAuthStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  afterEach(() => {
    mocks.push.mockClear();
  });

  it('login sets accessToken, user and navigates to dashboard', async () => {
    const mockResponse = {
      data: { accessToken: 'token123', user: { id: '1', name: 'Test', email: 'test@test.com' } },
    };
    (api.post as any).mockResolvedValue(mockResponse);

    const store = useAuthStore();
    await store.login('test@test.com', 'pass123');

    expect(api.post).toHaveBeenCalledWith('/auth/login', {
      email: 'test@test.com',
      password: 'pass123',
    });
    expect(store.accessToken).toBe('token123');
    expect(store.user).toEqual({ id: '1', name: 'Test', email: 'test@test.com' });
    expect(store.isAuthenticated).toBe(true);
    expect(store.appReady).toBe(true);
    expect(mocks.push).toHaveBeenCalledWith('/dashboard');
  });

  it('register sets accessToken, user and navigates to dashboard', async () => {
    const mockResponse = {
      data: { accessToken: 'token456', user: { id: '2', name: 'New', email: 'new@test.com' } },
    };
    (api.post as any).mockResolvedValue(mockResponse);

    const store = useAuthStore();
    await store.register('New', 'new@test.com', 'pass456');

    expect(api.post).toHaveBeenCalledWith('/auth/register', {
      name: 'New',
      email: 'new@test.com',
      password: 'pass456',
    });
    expect(store.accessToken).toBe('token456');
    expect(store.user).toEqual({ id: '2', name: 'New', email: 'new@test.com' });
    expect(mocks.push).toHaveBeenCalledWith('/dashboard');
  });

  it('logout calls /auth/logout, clears state and navigates to /', async () => {
    (api.post as any).mockResolvedValue({});

    const store = useAuthStore();
    store.accessToken = 'token';
    store.user = { id: '1', name: 'T', email: 't@t.com' };
    store.appReady = true;

    await store.logout();

    expect(api.post).toHaveBeenCalledWith('/auth/logout');
    expect(store.accessToken).toBeNull();
    expect(store.user).toBeNull();
    expect(store.isAuthenticated).toBe(false);
    expect(mocks.push).toHaveBeenCalledWith('/');
  });

  it('logout clears state even if API call fails', async () => {
    (api.post as any).mockRejectedValue(new Error('Network error'));

    const store = useAuthStore();
    store.accessToken = 'token';
    store.user = { id: '1', name: 'T', email: 't@t.com' };
    store.appReady = true;

    try {
      await store.logout();
    } catch {
      // Error is re-thrown by finally block, expected
    }

    expect(store.accessToken).toBeNull();
    expect(store.user).toBeNull();
    expect(mocks.push).toHaveBeenCalledWith('/');
  });

  it('refresh updates accessToken and user', async () => {
    const mockResponse = {
      data: {
        accessToken: 'refreshedToken',
        user: { id: '1', name: 'T', email: 't@t.com' },
      },
    };
    (api.post as any).mockResolvedValue(mockResponse);

    const store = useAuthStore();
    await store.refresh();

    expect(api.post).toHaveBeenCalledWith('/auth/refresh');
    expect(store.accessToken).toBe('refreshedToken');
    expect(store.user).toEqual({ id: '1', name: 'T', email: 't@t.com' });
  });

  it('updateProfile updates user', async () => {
    const mockResponse = {
      data: { id: '1', name: 'Updated', email: 't@t.com' },
    };
    (api.patch as any).mockResolvedValue(mockResponse);

    const store = useAuthStore();
    store.user = { id: '1', name: 'Old', email: 't@t.com' };

    await store.updateProfile('Updated');

    expect(api.patch).toHaveBeenCalledWith('/auth/profile', { name: 'Updated' });
    expect(store.user).toEqual({ id: '1', name: 'Updated', email: 't@t.com' });
  });

  it('initialize calls refresh and sets appReady', async () => {
    const mockResponse = {
      data: {
        accessToken: 'token',
        user: { id: '1', name: 'T', email: 't@t.com' },
      },
    };
    (api.post as any).mockResolvedValue(mockResponse);

    const store = useAuthStore();
    await store.initialize();

    expect(store.accessToken).toBe('token');
    expect(store.appReady).toBe(true);
  });

  it('initialize handles refresh failure and still sets appReady', async () => {
    (api.post as any).mockRejectedValue(new Error('Refresh failed'));

    const store = useAuthStore();
    await store.initialize();

    expect(store.accessToken).toBeNull();
    expect(store.user).toBeNull();
    expect(store.appReady).toBe(true);
  });

  it('clear resets accessToken and user', () => {
    const store = useAuthStore();
    store.accessToken = 'token';
    store.user = { id: '1', name: 'T', email: 't@t.com' };

    store.clear();

    expect(store.accessToken).toBeNull();
    expect(store.user).toBeNull();
    expect(store.isAuthenticated).toBe(false);
  });

  it('isAuthenticated is false when accessToken is null', () => {
    const store = useAuthStore();
    expect(store.isAuthenticated).toBe(false);
  });

  it('isAuthenticated is true when accessToken is set', () => {
    const store = useAuthStore();
    store.accessToken = 'some-token';
    expect(store.isAuthenticated).toBe(true);
  });
});
