import { deleteExpiredTokens } from './auth.repository.js';
import { env } from '../../config/env.js';

const CLEANUP_INTERVAL_MS = env.tokenCleanupIntervalMs;

let intervalHandle: ReturnType<typeof setInterval> | null = null;

export function startTokenCleanup(): void {
  if (intervalHandle) return;

  deleteExpiredTokens().catch(console.error);
  intervalHandle = setInterval(() => {
    deleteExpiredTokens().catch(console.error);
  }, CLEANUP_INTERVAL_MS);
}

export function stopTokenCleanup(): void {
  if (intervalHandle) {
    clearInterval(intervalHandle);
    intervalHandle = null;
  }
}
