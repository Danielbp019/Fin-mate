import { describe, it, expect, vi, beforeEach } from 'vitest';
import { db } from '../../../shared/database/connection.js';
import * as authRepository from '../auth.repository.js';

vi.mock('../../../shared/database/connection.js', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockDb = vi.mocked(db);

describe('authRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('findUserByEmail', () => {
    it('debe retornar usuario cuando existe', async () => {
      const mockUser = { id: '1', name: 'Test', email: 'test@test.com' };
      const selectChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockUser]),
      };
      mockDb.select.mockReturnValue(selectChain);

      const result = await authRepository.findUserByEmail('test@test.com');
      expect(result).toEqual(mockUser);
    });

    it('debe retornar null cuando no existe', async () => {
      const selectChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };
      mockDb.select.mockReturnValue(selectChain);

      const result = await authRepository.findUserByEmail('no@existe.com');
      expect(result).toBeNull();
    });
  });

  describe('createRefreshToken', () => {
    it('debe insertar y retornar el id', async () => {
      mockDb.insert.mockReturnValue({
        values: vi.fn().mockResolvedValue(undefined),
      });

      const id = await authRepository.createRefreshToken({
        userId: 'user-1',
        expiresAt: new Date(),
      });

      expect(id).toBeTruthy();
      expect(typeof id).toBe('string');
      expect(mockDb.insert).toHaveBeenCalledTimes(1);
    });
  });

  describe('findRefreshTokenById', () => {
    it('debe retornar el refresh token', async () => {
      const mockToken = { id: 'token-1', userId: 'user-1', revoked: false };
      const selectChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockToken]),
      };
      mockDb.select.mockReturnValue(selectChain);

      const result = await authRepository.findRefreshTokenById('token-1');
      expect(result).toEqual(mockToken);
    });

    it('debe retornar null cuando no existe', async () => {
      const selectChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };
      mockDb.select.mockReturnValue(selectChain);

      const result = await authRepository.findRefreshTokenById('no-existe');
      expect(result).toBeNull();
    });
  });

  describe('revokeRefreshToken', () => {
    it('debe actualizar revoked a true', async () => {
      const updateChain = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(undefined),
      };
      mockDb.update.mockReturnValue(updateChain);

      await authRepository.revokeRefreshToken('token-1');
      expect(mockDb.update).toHaveBeenCalledTimes(1);
    });
  });

  describe('revokeAllUserRefreshTokens', () => {
    it('debe revocar todos los tokens activos del usuario', async () => {
      const updateChain = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(undefined),
      };
      mockDb.update.mockReturnValue(updateChain);

      await authRepository.revokeAllUserRefreshTokens('user-1');
      expect(mockDb.update).toHaveBeenCalledTimes(1);
    });
  });
});
