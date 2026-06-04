import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as categoriesRepository from '../categories.repository.js';

vi.mock('../categories.repository.js');

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

const mockSystemCategory = { ...mockCategory, id: 'system-id', isSystem: true, userId: null };

let categoriesService: typeof import('../categories.service.js');

beforeEach(async () => {
  vi.clearAllMocks();
  categoriesService = await import('../categories.service.js');
});

describe('list', () => {
  it('returns categories from repository', async () => {
    vi.mocked(categoriesRepository.findByUser).mockResolvedValue([mockCategory]);

    const result = await categoriesService.list('user-123');

    expect(categoriesRepository.findByUser).toHaveBeenCalledWith('user-123', undefined);
    expect(result).toEqual([mockCategory]);
  });

  it('filters by type when provided', async () => {
    vi.mocked(categoriesRepository.findByUser).mockResolvedValue([mockCategory]);

    const result = await categoriesService.list('user-123', 'expense');

    expect(categoriesRepository.findByUser).toHaveBeenCalledWith('user-123', 'expense');
    expect(result).toEqual([mockCategory]);
  });
});

describe('getById', () => {
  it('returns category when found and is system', async () => {
    vi.mocked(categoriesRepository.findById).mockResolvedValue(mockSystemCategory);

    const result = await categoriesService.getById('system-id', 'user-123');

    expect(result).toEqual(mockSystemCategory);
  });

  it('returns category when found and owned by user', async () => {
    vi.mocked(categoriesRepository.findById).mockResolvedValue(mockCategory);

    const result = await categoriesService.getById(mockCategory.id, 'user-123');

    expect(result).toEqual(mockCategory);
  });

  it('throws 404 when not found', async () => {
    vi.mocked(categoriesRepository.findById).mockResolvedValue(null);

    await expect(categoriesService.getById('nonexistent', 'user-123')).rejects.toMatchObject({
      statusCode: 404,
      message: 'Categoría no encontrada',
    });
  });

  it('throws 404 when not owned and not system', async () => {
    vi.mocked(categoriesRepository.findById).mockResolvedValue(mockCategory);

    await expect(categoriesService.getById(mockCategory.id, 'other-user')).rejects.toMatchObject({
      statusCode: 404,
      message: 'Categoría no encontrada',
    });
  });
});

describe('create', () => {
  it('creates category when name is available', async () => {
    vi.mocked(categoriesRepository.findByNameAndUser).mockResolvedValue(null);
    vi.mocked(categoriesRepository.create).mockResolvedValue(undefined as never);

    const result = await categoriesService.create({ name: 'Comida', type: 'expense' }, 'user-123');

    expect(categoriesRepository.findByNameAndUser).toHaveBeenCalledWith('Comida', 'user-123');
    expect(categoriesRepository.create).toHaveBeenCalledTimes(1);
    expect(result.name).toBe('Comida');
    expect(result.type).toBe('expense');
    expect(result.userId).toBe('user-123');
    expect(result.isActive).toBe(true);
    expect(result.isSystem).toBe(false);
  });

  it('throws 409 when name already exists', async () => {
    vi.mocked(categoriesRepository.findByNameAndUser).mockResolvedValue(mockCategory);

    await expect(
      categoriesService.create({ name: 'Comida', type: 'expense' }, 'user-123'),
    ).rejects.toMatchObject({
      statusCode: 409,
      message: 'Ya tienes una categoría con ese nombre',
    });

    expect(categoriesRepository.create).not.toHaveBeenCalled();
  });

  it('creates category with icon when provided', async () => {
    vi.mocked(categoriesRepository.findByNameAndUser).mockResolvedValue(null);
    vi.mocked(categoriesRepository.create).mockResolvedValue(undefined as never);

    const result = await categoriesService.create(
      { name: 'Trabajo', type: 'income', icon: 'mdi-briefcase' },
      'user-123',
    );

    expect(categoriesRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ icon: 'mdi-briefcase' }),
    );
    expect(result.icon).toBe('mdi-briefcase');
  });
});

describe('update', () => {
  it('updates category when data is valid', async () => {
    vi.mocked(categoriesRepository.findById)
      .mockResolvedValueOnce(mockCategory)
      .mockResolvedValueOnce({ ...mockCategory, name: 'Comida actualizada' });
    vi.mocked(categoriesRepository.findByNameAndUser).mockResolvedValue(null);

    const result = await categoriesService.update(
      mockCategory.id,
      { name: 'Comida actualizada', icon: 'new-icon' },
      'user-123',
    );

    expect(categoriesRepository.update).toHaveBeenCalled();
    expect(result.name).toBe('Comida actualizada');
  });

  it('throws 404 when category not found', async () => {
    vi.mocked(categoriesRepository.findById).mockResolvedValue(null);

    await expect(
      categoriesService.update('nonexistent', { name: 'Nuevo' }, 'user-123'),
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  it('throws 403 when category is system', async () => {
    vi.mocked(categoriesRepository.findById).mockResolvedValue(mockSystemCategory);

    await expect(
      categoriesService.update('system-id', { name: 'Nuevo' }, 'user-123'),
    ).rejects.toMatchObject({
      statusCode: 403,
      message: 'No puedes modificar una categoría del sistema',
    });
  });

  it('throws 404 when not owned', async () => {
    vi.mocked(categoriesRepository.findById).mockResolvedValue(mockCategory);

    await expect(
      categoriesService.update(mockCategory.id, { name: 'Nuevo' }, 'other-user'),
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  it('throws 409 when new name conflicts with existing', async () => {
    vi.mocked(categoriesRepository.findById).mockResolvedValue(mockCategory);
    vi.mocked(categoriesRepository.findByNameAndUser).mockResolvedValue({
      ...mockCategory,
      id: 'other-id',
    });

    await expect(
      categoriesService.update(mockCategory.id, { name: 'Comida duplicada' }, 'user-123'),
    ).rejects.toMatchObject({
      statusCode: 409,
      message: 'Ya tienes una categoría con ese nombre',
    });
  });

  it('updates icon when provided', async () => {
    vi.mocked(categoriesRepository.findById)
      .mockResolvedValueOnce(mockCategory)
      .mockResolvedValueOnce({ ...mockCategory, icon: 'new-icon' });
    vi.mocked(categoriesRepository.findByNameAndUser).mockResolvedValue(null);

    const result = await categoriesService.update(
      mockCategory.id,
      { icon: 'new-icon' },
      'user-123',
    );

    expect(categoriesRepository.update).toHaveBeenCalledWith(
      mockCategory.id,
      expect.objectContaining({ icon: 'new-icon' }),
    );
    expect(result.icon).toBe('new-icon');
  });

  it('sets icon to null when explicitly provided as null', async () => {
    vi.mocked(categoriesRepository.findById)
      .mockResolvedValueOnce(mockCategory)
      .mockResolvedValueOnce({ ...mockCategory, icon: null });
    vi.mocked(categoriesRepository.findByNameAndUser).mockResolvedValue(null);

    const result = await categoriesService.update(
      mockCategory.id,
      { icon: null },
      'user-123',
    );

    expect(categoriesRepository.update).toHaveBeenCalledWith(
      mockCategory.id,
      expect.objectContaining({ icon: null }),
    );
    expect(result.icon).toBeNull();
  });

  it('updates isActive when provided', async () => {
    vi.mocked(categoriesRepository.findById)
      .mockResolvedValueOnce(mockCategory)
      .mockResolvedValueOnce({ ...mockCategory, isActive: false });
    vi.mocked(categoriesRepository.findByNameAndUser).mockResolvedValue(null);

    const result = await categoriesService.update(
      mockCategory.id,
      { isActive: false },
      'user-123',
    );

    expect(categoriesRepository.update).toHaveBeenCalledWith(
      mockCategory.id,
      expect.objectContaining({ isActive: false }),
    );
    expect(result.isActive).toBe(false);
  });

  it('does not check duplicate name when name is not provided', async () => {
    vi.mocked(categoriesRepository.findById)
      .mockResolvedValueOnce(mockCategory)
      .mockResolvedValueOnce(mockCategory);

    await categoriesService.update(mockCategory.id, { icon: 'new-icon' }, 'user-123');

    expect(categoriesRepository.findByNameAndUser).not.toHaveBeenCalled();
  });
});

describe('remove', () => {
  it('soft deletes category when no movements', async () => {
    vi.mocked(categoriesRepository.findById).mockResolvedValue(mockCategory);
    vi.mocked(categoriesRepository.countMovementsByCategory).mockResolvedValue(0);

    await categoriesService.remove(mockCategory.id, 'user-123');

    expect(categoriesRepository.softDelete).toHaveBeenCalledWith(mockCategory.id, expect.any(Date));
  });

  it('throws 404 when not found', async () => {
    vi.mocked(categoriesRepository.findById).mockResolvedValue(null);

    await expect(categoriesService.remove('nonexistent', 'user-123')).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it('throws 403 when category is system', async () => {
    vi.mocked(categoriesRepository.findById).mockResolvedValue(mockSystemCategory);

    await expect(categoriesService.remove('system-id', 'user-123')).rejects.toMatchObject({
      statusCode: 403,
      message: 'No puedes eliminar una categoría del sistema',
    });
  });

  it('throws 404 when not owned', async () => {
    vi.mocked(categoriesRepository.findById).mockResolvedValue(mockCategory);

    await expect(categoriesService.remove(mockCategory.id, 'other-user')).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it('throws 409 when category has movements', async () => {
    vi.mocked(categoriesRepository.findById).mockResolvedValue(mockCategory);
    vi.mocked(categoriesRepository.countMovementsByCategory).mockResolvedValue(5);

    await expect(categoriesService.remove(mockCategory.id, 'user-123')).rejects.toMatchObject({
      statusCode: 409,
      message: 'No puedes eliminar una categoría que tiene movimientos asociados',
    });

    expect(categoriesRepository.softDelete).not.toHaveBeenCalled();
  });
});
