import crypto from 'crypto';
import { AppError } from '../../../shared/errors/AppError.js';
import * as debtsRepository from '../debts.repository.js';
import * as paymentsRepository from './payments.repository.js';
import type { CreatePaymentBody, PaymentResponse } from './payments.types.js';

function toResponse(
  row: NonNullable<Awaited<ReturnType<typeof paymentsRepository.findByDebt>>>[number],
): PaymentResponse {
  return {
    id: row.id,
    debtId: row.debtId,
    userId: row.userId,
    amount: row.amount,
    paymentDate: row.paymentDate.toISOString(),
    notes: row.notes,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function list(debtId: string, userId: string): Promise<PaymentResponse[]> {
  const debt = await debtsRepository.findById(debtId);
  if (!debt) {
    throw new AppError(404, 'Deuda no encontrada');
  }
  if (debt.userId !== userId) {
    throw new AppError(404, 'Deuda no encontrada');
  }

  const rows = await paymentsRepository.findByDebt(debtId);
  return rows.map(toResponse);
}

export async function create(
  data: CreatePaymentBody,
  debtId: string,
  userId: string,
): Promise<PaymentResponse> {
  const debt = await debtsRepository.findById(debtId);
  if (!debt) {
    throw new AppError(404, 'Deuda no encontrada');
  }
  if (debt.userId !== userId) {
    throw new AppError(404, 'Deuda no encontrada');
  }
  if (debt.status === 'paid') {
    throw new AppError(400, 'La deuda ya esta pagada');
  }

  const now = new Date();

  const payment = {
    id: crypto.randomUUID(),
    debtId,
    userId,
    amount: data.amount,
    paymentDate: new Date(data.paymentDate),
    notes: data.notes ?? null,
    createdAt: now,
  };

  const paymentAmount = Number(data.amount);
  const currentAmount = Number(debt.currentAmount);
  const newAmount = Math.max(0, currentAmount - paymentAmount);
  const newStatus = newAmount <= 0 ? ('paid' as const) : ('pending' as const);

  await paymentsRepository.create(payment);

  await debtsRepository.update(debtId, {
    currentAmount: newAmount.toFixed(4),
    status: newStatus,
    updatedAt: now,
  });

  return toResponse(payment);
}
