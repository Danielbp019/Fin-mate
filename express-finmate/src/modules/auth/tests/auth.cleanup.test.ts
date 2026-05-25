import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../auth.repository.js', () => ({
  deleteExpiredTokens: vi.fn().mockResolvedValue(undefined),
}));

let authCleanup: typeof import('../auth.cleanup.js');
let authRepository: typeof import('../auth.repository.js');

beforeEach(async () => {
  vi.clearAllMocks();
  authCleanup = await import('../auth.cleanup.js');
  authRepository = await import('../auth.repository.js');
});

afterEach(() => {
  authCleanup.stopTokenCleanup();
});

describe('startTokenCleanup', () => {
  it('calls deleteExpiredTokens immediately on start', () => {
    authCleanup.startTokenCleanup();

    expect(authRepository.deleteExpiredTokens).toHaveBeenCalledTimes(1);
  });

  it('does not start a second interval if called again', () => {
    authCleanup.startTokenCleanup();
    authCleanup.startTokenCleanup();

    expect(authRepository.deleteExpiredTokens).toHaveBeenCalledTimes(1);
  });
});

describe('stopTokenCleanup', () => {
  it('stops cleanup and allows restart', () => {
    authCleanup.startTokenCleanup();
    authCleanup.stopTokenCleanup();
    expect(authRepository.deleteExpiredTokens).toHaveBeenCalledTimes(1);

    vi.clearAllMocks();

    authCleanup.startTokenCleanup();
    expect(authRepository.deleteExpiredTokens).toHaveBeenCalledTimes(1);
  });
});
