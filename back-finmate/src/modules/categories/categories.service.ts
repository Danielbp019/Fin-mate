import crypto from 'crypto';
import { AppError } from '../../shared/errors/AppError.js';
import * as categoriesRepository from './categories.repository.js';
import type { CreateCategoryBody, UpdateCategoryBody } from './categories.types.js';

export async function list(userId: string, type?: string) {
  return await categoriesRepository.findByUser(userId, type);
}

export async function getById(id: string, userId: string) {
  const category = await categoriesRepository.findById(id);
  if (!category) {
    throw new AppError(404, 'Categoría no encontrada');
  }

  if (!category.isSystem && category.userId !== userId) {
    throw new AppError(404, 'Categoría no encontrada');
  }

  return category;
}

export async function create(data: CreateCategoryBody, userId: string) {
  const existing = await categoriesRepository.findByNameAndUser(data.name, userId);
  if (existing) {
    throw new AppError(409, 'Ya tienes una categoría con ese nombre');
  }

  const now = new Date();
  const category = {
    id: crypto.randomUUID(),
    userId,
    type: data.type,
    name: data.name,
    icon: data.icon ?? null,
    isSystem: false,
    createdAt: now,
    updatedAt: now,
  };

  await categoriesRepository.create(category);
  return category;
}

export async function update(id: string, data: UpdateCategoryBody, userId: string) {
  const category = await categoriesRepository.findById(id);
  if (!category) {
    throw new AppError(404, 'Categoría no encontrada');
  }

  if (category.isSystem) {
    throw new AppError(403, 'No puedes modificar una categoría del sistema');
  }

  if (category.userId !== userId) {
    throw new AppError(404, 'Categoría no encontrada');
  }

  if (data.name && data.name !== category.name) {
    const existing = await categoriesRepository.findByNameAndUser(data.name, userId, id);
    if (existing) {
      throw new AppError(409, 'Ya tienes una categoría con ese nombre');
    }
  }

  const now = new Date();

  const updateData: Record<string, unknown> = { updatedAt: now };
  if (data.name !== undefined) updateData.name = data.name;
  if (data.icon !== undefined) updateData.icon = data.icon ?? null;

  await categoriesRepository.update(
    id,
    updateData as Parameters<typeof categoriesRepository.update>[1],
  );

  const updated = await categoriesRepository.findById(id);
  return updated!;
}

export async function remove(id: string, userId: string) {
  const category = await categoriesRepository.findById(id);
  if (!category) {
    throw new AppError(404, 'Categoría no encontrada');
  }

  if (category.isSystem) {
    throw new AppError(403, 'No puedes eliminar una categoría del sistema');
  }

  if (category.userId !== userId) {
    throw new AppError(404, 'Categoría no encontrada');
  }

  const movementCount = await categoriesRepository.countMovementsByCategory(id);
  if (movementCount > 0) {
    throw new AppError(409, 'No puedes eliminar una categoría que tiene movimientos asociados');
  }

  await categoriesRepository.softDelete(id, new Date());
}
