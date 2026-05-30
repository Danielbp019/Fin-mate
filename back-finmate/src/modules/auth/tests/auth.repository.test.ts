import { describe, it, expect, vi, beforeEach } from 'vitest';
import { tokenBlacklist } from '../../../shared/database/schema.js';

vi.mock('../../../shared/database/connection.js', () => ({
  db: {
    delete: vi.fn(),
  },
}));

let authRepository: typeof import('../auth.repository.js');
let db: typeof import('../../../shared/database/connection.js').db;

beforeEach(async () => {
  vi.clearAllMocks();
  authRepository = await import('../auth.repository.js');
  db = (await import('../../../shared/database/connection.js')).db;
});

describe('deleteExpiredTokens', () => {
  it('deletes tokens where expiresAt is before now', async () => {
    const whereMock = vi.fn().mockResolvedValue(undefined);
    vi.mocked(db.delete).mockReturnValue({ where: whereMock } as never);

    await authRepository.deleteExpiredTokens();

    expect(db.delete).toHaveBeenCalledWith(tokenBlacklist);
    expect(whereMock).toHaveBeenCalledOnce();
  });
});
