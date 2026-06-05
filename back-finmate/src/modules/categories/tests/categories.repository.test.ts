import { describe, it, expect, vi, beforeEach } from 'vitest';
import { db } from '../../../shared/database/connection.js';

vi.mock('../../../shared/database/connection.js', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
  },
}));

const mockDb = vi.mocked(db);

const mockCategory = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  userId: 'user-123',
  type: 'expense' as const,
  name: 'Comida',
  icon: 'food',
  isActive: true,
  isSystem: false,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  deletedAt: null,
};

function mockSelectChain(result: unknown) {
  const chain = {
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue(result as never),
    orderBy: vi.fn().mockResolvedValue(result as never),
  };
  chain.from.mockReturnValue(chain);
  chain.where.mockReturnValue(chain);
  chain.limit.mockImplementation(() => Promise.resolve(result));
  chain.orderBy.mockImplementation(() => Promise.resolve(result));
  return chain;
}

function mockInsertChain() {
  return {
    values: vi.fn().mockResolvedValue(undefined),
  };
}

function mockUpdateChain() {
  const chain = {
    set: vi.fn().mockReturnThis(),
    where: vi.fn().mockResolvedValue(undefined),
  };
  chain.set.mockReturnValue(chain);
  return chain;
}

describe('categoriesRepository', () => {
  let categoriesRepository: typeof import('../categories.repository.js');

  beforeEach(async () => {
    vi.clearAllMocks();
    categoriesRepository = await import('../categories.repository.js');
  });

  describe('findById', () => {
    it('retorna categoría cuando existe', async () => {
      mockDb.select.mockReturnValue(mockSelectChain([mockCategory]) as any);

      const result = await categoriesRepository.findById('some-id');

      expect(result).toEqual(mockCategory);
      expect(mockDb.select).toHaveBeenCalledTimes(1);
    });

    it('retorna null cuando no existe', async () => {
      mockDb.select.mockReturnValue(mockSelectChain([]) as any);

      const result = await categoriesRepository.findById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findByNameAndUser', () => {
    it('retorna categoría cuando existe', async () => {
      mockDb.select.mockReturnValue(mockSelectChain([mockCategory]) as any);

      const result = await categoriesRepository.findByNameAndUser('Comida', 'user-123');

      expect(result).toEqual(mockCategory);
    });

    it('retorna null cuando no existe', async () => {
      mockDb.select.mockReturnValue(mockSelectChain([]) as any);

      const result = await categoriesRepository.findByNameAndUser('Inexistente', 'user-123');

      expect(result).toBeNull();
    });

    it('excluye un ID cuando se proporciona excludeId', async () => {
      mockDb.select.mockReturnValue(mockSelectChain([mockCategory]) as any);

      const result = await categoriesRepository.findByNameAndUser('Comida', 'user-123', 'other-id');

      expect(result).toEqual(mockCategory);
    });
  });

  describe('findByUser', () => {
    it('retorna categorías del usuario y del sistema', async () => {
      mockDb.select.mockReturnValue(mockSelectChain([mockCategory]) as any);

      const result = await categoriesRepository.findByUser('user-123');

      expect(result).toEqual([mockCategory]);
    });

    it('filtra por tipo cuando se proporciona', async () => {
      mockDb.select.mockReturnValue(mockSelectChain([mockCategory]) as any);

      const result = await categoriesRepository.findByUser('user-123', 'expense');

      expect(result).toEqual([mockCategory]);
    });
  });

  describe('create', () => {
    it('inserta una categoría en la base de datos', async () => {
      mockDb.insert.mockReturnValue(mockInsertChain() as any);

      await categoriesRepository.create(mockCategory);

      expect(mockDb.insert).toHaveBeenCalledTimes(1);
    });
  });

  describe('update', () => {
    it('actualiza los campos de una categoría', async () => {
      mockDb.update.mockReturnValue(mockUpdateChain() as any);

      await categoriesRepository.update('some-id', { name: 'Nuevo nombre', icon: null });

      expect(mockDb.update).toHaveBeenCalledTimes(1);
    });
  });

  describe('softDelete', () => {
    it('marca como inactivo y setea deletedAt', async () => {
      const now = new Date();
      mockDb.update.mockReturnValue(mockUpdateChain() as any);

      await categoriesRepository.softDelete('some-id', now);

      expect(mockDb.update).toHaveBeenCalledTimes(1);
    });
  });

  describe('countMovementsByCategory', () => {
    it('retorna el conteo de movimientos', async () => {
      const selectChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{ count: 5 }]),
      };
      selectChain.from.mockReturnValue(selectChain);
      mockDb.select.mockReturnValue(selectChain as any);

      const result = await categoriesRepository.countMovementsByCategory('some-id');

      expect(result).toBe(5);
    });
  });
});
