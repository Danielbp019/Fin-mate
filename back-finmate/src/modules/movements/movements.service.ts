import crypto from 'crypto';
import { AppError } from '../../shared/errors/AppError.js';
import * as movementsRepository from './movements.repository.js';
import { movements, categories } from '../../shared/database/schema.js';
import { eq } from 'drizzle-orm';
import { db } from '../../shared/database/connection.js';
import type {
  CreateMovementBody,
  UpdateMovementBody,
  MovementListFilters,
  MovementResponse,
  PaginatedResponse,
} from './movements.types.js';

function toResponse(row: typeof movements.$inferSelect): MovementResponse {
  return {
    id: row.id,
    userId: row.userId,
    categoryId: row.categoryId,
    type: row.type,
    amount: row.amount,
    description: row.description,
    movementDate: row.movementDate.toISOString(),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function list(
  userId: string,
  filters: MovementListFilters,
): Promise<PaginatedResponse<MovementResponse>> {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 20;

  const [rows, total] = await Promise.all([
    movementsRepository.findByUser(userId, { ...filters, page, limit }),
    movementsRepository.countByUser(userId, filters),
  ]);

  return {
    data: rows.map(toResponse),
    pagination: { page, limit, total },
  };
}

export async function getById(
  id: string,
  userId: string,
): Promise<MovementResponse> {
  const movement = await movementsRepository.findById(id);
  if (!movement) {
    throw new AppError(404, 'Movimiento no encontrado');
  }
  if (movement.userId !== userId) {
    throw new AppError(404, 'Movimiento no encontrado');
  }
  return toResponse(movement);
}

export async function create(
  data: CreateMovementBody,
  userId: string,
): Promise<MovementResponse> {
  const category = await db
    .select({ id: categories.id })
    .from(categories)
    .where(eq(categories.id, data.categoryId))
    .limit(1);

  if (!category[0]) {
    throw new AppError(404, 'Categoria no encontrada');
  }

  const now = new Date();
  const movementDate = new Date(data.movementDate);

  const movement = {
    id: crypto.randomUUID(),
    userId,
    coupleId: null,
    categoryId: data.categoryId,
    type: data.type,
    amount: data.amount,
    description: data.description ?? null,
    movementDate,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };

  await movementsRepository.create(movement);
  return toResponse(movement);
}

export async function update(
  id: string,
  data: UpdateMovementBody,
  userId: string,
): Promise<MovementResponse> {
  const existing = await movementsRepository.findById(id);
  if (!existing) {
    throw new AppError(404, 'Movimiento no encontrado');
  }
  if (existing.userId !== userId) {
    throw new AppError(404, 'Movimiento no encontrado');
  }

  if (data.categoryId) {
    const category = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.id, data.categoryId))
      .limit(1);

    if (!category[0]) {
      throw new AppError(404, 'Categoria no encontrada');
    }
  }

  const now = new Date();
  const updateData: Record<string, unknown> = { updatedAt: now };

  if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
  if (data.type !== undefined) updateData.type = data.type;
  if (data.amount !== undefined) updateData.amount = data.amount;
  if (data.description !== undefined)
    updateData.description = data.description ?? null;
  if (data.movementDate !== undefined)
    updateData.movementDate = new Date(data.movementDate);

  await movementsRepository.update(id, updateData);

  const updated = await movementsRepository.findById(id);
  return toResponse(updated!);
}

export async function remove(id: string, userId: string): Promise<void> {
  const existing = await movementsRepository.findById(id);
  if (!existing) {
    throw new AppError(404, 'Movimiento no encontrado');
  }
  if (existing.userId !== userId) {
    throw new AppError(404, 'Movimiento no encontrado');
  }

  await movementsRepository.softDelete(id, new Date());
}
