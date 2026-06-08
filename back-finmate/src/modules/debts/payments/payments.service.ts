import crypto from 'crypto';
import { AppError } from '../../../shared/errors/AppError.js';
import * as debtsRepository from '../debts.repository.js';
import * as paymentsRepository from './payments.repository.js';
import * as movementsRepository from '../../movements/movements.repository.js';
import type { CreatePaymentBody, PaymentResponse } from './payments.types.js';
import { dbToDinero, dinero, dineroToDb } from '../../../shared/money/money.js';
import { subtract, isNegative, isZero } from 'dinero.js';
import { COP } from 'dinero.js/currencies';
import { db } from '../../../shared/database/connection.js';
import { categories } from '../../../shared/database/schema.js';
import { eq } from 'drizzle-orm';

const DEBT_PAYMENT_CATEGORY = 'Pago de Deuda';

async function findCategoryIdByName(name: string): Promise<string> {
  const result = await db
    .select({ id: categories.id })
    .from(categories)
    .where(eq(categories.name, name))
    .limit(1);

  if (!result[0]) {
    throw new AppError(500, `Categoria del sistema "${name}" no encontrada`);
  }
  return result[0].id;
}

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

  const paymentMoney = dbToDinero(data.amount);
  const debtMoney = dbToDinero(debt.currentAmount);
  const remaining = subtract(debtMoney, paymentMoney);
  const paid = isNegative(remaining) || isZero(remaining);
  const clamped = paid ? dinero({ amount: 0, currency: COP }) : remaining;
  const newStatus = paid ? ('paid' as const) : ('pending' as const);

  await paymentsRepository.create(payment);

  await debtsRepository.update(debtId, {
    currentAmount: dineroToDb(clamped),
    status: newStatus,
    updatedAt: now,
  });

  const categoryId = await findCategoryIdByName(DEBT_PAYMENT_CATEGORY);

  const movement = {
    id: crypto.randomUUID(),
    userId,
    coupleId: debt.coupleId,
    categoryId,
    type: 'expense' as const,
    amount: data.amount,
    description: `Pago de deuda: ${debt.title}`,
    movementDate: new Date(data.paymentDate),
    referenceType: 'debt_payment',
    referenceId: payment.id,
    createdAt: now,
    updatedAt: now,
  };

  await movementsRepository.create(movement);

  return toResponse(payment);
}
