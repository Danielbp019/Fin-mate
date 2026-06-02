import { eq } from 'drizzle-orm';
import { db } from '../../../shared/database/connection.js';
import { debtPayments } from '../../../shared/database/schema.js';

export async function findByDebt(debtId: string) {
  return await db
    .select()
    .from(debtPayments)
    .where(eq(debtPayments.debtId, debtId))
    .orderBy(debtPayments.paymentDate);
}

export async function findById(id: string) {
  const result = await db.select().from(debtPayments).where(eq(debtPayments.id, id)).limit(1);

  return result[0] ?? null;
}

export async function create(data: typeof debtPayments.$inferInsert) {
  await db.insert(debtPayments).values(data);
}
