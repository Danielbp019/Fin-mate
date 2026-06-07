import { describe, it, expect, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => {
  let requestHandler: ((config: any) => any) | null = null;
  let responseSuccessHandler: ((response: any) => any) | null = null;
  let responseErrorHandler: ((error: any) => any) | null = null;

  const mockAxiosInstance = {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: {
        use: vi.fn((handler: any) => {
          requestHandler = handler;
        }),
      },
      response: {
        use: vi.fn((success: any, error: any) => {
          responseSuccessHandler = success;
          responseErrorHandler = error;
        }),
      },
    },
    defaults: { baseURL: '', withCredentials: false, headers: {} },
  };

  return {
    mockAxiosInstance,
    getRequestHandler: () => requestHandler,
    getResponseSuccessHandler: () => responseSuccessHandler,
    getResponseErrorHandler: () => responseErrorHandler,
  };
});

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => mocks.mockAxiosInstance),
  },
}));

vi.mock('@/stores/auth', () => ({
  useAuthStore: vi.fn(),
}));

import { useAuthStore } from '@/stores/auth';

describe('api interceptor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('request interceptor', () => {
    it('adds Authorization header when token exists', async () => {
      (useAuthStore as any).mockReturnValue({ accessToken: 'my-token' });
      const { default: api } = await import('@/services/api');

      const handler = mocks.getRequestHandler();
      expect(handler).not.toBeNull();

      const config = { headers: {} };
      const result = handler!(config);

      expect(result.headers.Authorization).toBe('Bearer my-token');
    });

    it('does not add Authorization header when no token', async () => {
      (useAuthStore as any).mockReturnValue({ accessToken: null });
      const { default: api } = await import('@/services/api');

      const handler = mocks.getRequestHandler();
      const config = { headers: {} };
      const result = handler!(config);

      expect(result.headers.Authorization).toBeUndefined();
    });
  });

  describe('response interceptor - success', () => {
    it('passes through successful responses', async () => {
      const { default: api } = await import('@/services/api');
      const successHandler = mocks.getResponseSuccessHandler();
      expect(successHandler).not.toBeNull();

      const response = { data: 'ok', status: 200 };
      const result = successHandler!(response);

      expect(result).toBe(response);
    });
  });

  describe('response interceptor - error', () => {
    it('throws on 401 from refresh endpoint', async () => {
      const { default: api } = await import('@/services/api');
      const errorHandler = mocks.getResponseErrorHandler()!;
      (useAuthStore as any).mockReturnValue({ accessToken: null });

      const error = {
        config: { url: '/auth/refresh', _retry: undefined },
        response: { status: 401 },
      };

      await expect(errorHandler(error)).rejects.toThrow();
    });

    it('throws on non-401 errors', async () => {
      const { default: api } = await import('@/services/api');
      const errorHandler = mocks.getResponseErrorHandler()!;

      const error = {
        config: { url: '/movements' },
        response: { status: 500 },
      };

      await expect(errorHandler(error)).rejects.toThrow();
    });
  });
});
