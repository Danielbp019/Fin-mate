import crypto from 'crypto';
import { AppError } from '../../shared/errors/AppError.js';
import { debts } from '../../shared/database/schema.js';
import * as debtsRepository from './debts.repository.js';
import type {
  CreateDebtBody,
  UpdateDebtBody,
  DebtListFilters,
  DebtResponse,
} from './debts.types.js';

function toResponse(row: typeof debts.$inferSelect): DebtResponse {
  return {
    id: row.id,
    userId: row.userId,
    title: row.title,
    description: row.description,
    initialAmount: row.initialAmount,
    currentAmount: row.currentAmount,
    interestRate: row.interestRate,
    interestRateType: row.interestRateType,
    minimumPayment: row.minimumPayment,
    dueDate: row.dueDate?.toISOString() ?? null,
    priority: row.priority,
    status: row.status,
    startDate: row.startDate?.toISOString() ?? null,
    endDate: row.endDate?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function list(userId: string, filters: DebtListFilters): Promise<DebtResponse[]> {
  const rows = await debtsRepository.findByUser(userId, filters);
  return rows.map(toResponse);
}

export async function getById(id: string, userId: string): Promise<DebtResponse> {
  const debt = await debtsRepository.findById(id);
  if (!debt) {
    throw new AppError(404, 'Deuda no encontrada');
  }
  if (debt.userId !== userId) {
    throw new AppError(404, 'Deuda no encontrada');
  }
  return toResponse(debt);
}

export async function create(data: CreateDebtBody, userId: string): Promise<DebtResponse> {
  const now = new Date();

  const debt = {
    id: crypto.randomUUID(),
    userId,
    coupleId: null,
    title: data.title,
    description: data.description ?? null,
    initialAmount: data.initialAmount,
    currentAmount: data.initialAmount,
    interestRate: data.interestRate ?? '0',
    interestRateType: data.interestRateType ?? 'annual',
    minimumPayment: data.minimumPayment ?? '0',
    dueDate: data.dueDate ? new Date(data.dueDate) : null,
    priority: data.priority ?? 'medium',
    status: 'pending' as const,
    startDate: data.startDate ? new Date(data.startDate) : null,
    endDate: null,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };

  await debtsRepository.create(debt);
  return toResponse(debt);
}

export async function update(
  id: string,
  data: UpdateDebtBody,
  userId: string,
): Promise<DebtResponse> {
  const existing = await debtsRepository.findById(id);
  if (!existing) {
    throw new AppError(404, 'Deuda no encontrada');
  }
  if (existing.userId !== userId) {
    throw new AppError(404, 'Deuda no encontrada');
  }

  const now = new Date();
  const updateData: Record<string, unknown> = { updatedAt: now };

  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description ?? null;
  if (data.initialAmount !== undefined) updateData.initialAmount = data.initialAmount;
  if (data.currentAmount !== undefined) updateData.currentAmount = data.currentAmount;
  if (data.interestRate !== undefined) updateData.interestRate = data.interestRate;
  if (data.interestRateType !== undefined) updateData.interestRateType = data.interestRateType;
  if (data.minimumPayment !== undefined) updateData.minimumPayment = data.minimumPayment;
  if (data.dueDate !== undefined)
    updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
  if (data.priority !== undefined) updateData.priority = data.priority;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.startDate !== undefined)
    updateData.startDate = data.startDate ? new Date(data.startDate) : null;
  if (data.endDate !== undefined) updateData.endDate = data.endDate ? new Date(data.endDate) : null;

  await debtsRepository.update(id, updateData);

  const updated = await debtsRepository.findById(id);
  return toResponse(updated!);
}

export async function remove(id: string, userId: string): Promise<void> {
  const existing = await debtsRepository.findById(id);
  if (!existing) {
    throw new AppError(404, 'Deuda no encontrada');
  }
  if (existing.userId !== userId) {
    throw new AppError(404, 'Deuda no encontrada');
  }

  await debtsRepository.softDelete(id, new Date());
}
