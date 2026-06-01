import { and, eq, isNull } from 'drizzle-orm';
import { db } from '../../shared/database/connection.js';
import { debts } from '../../shared/database/schema.js';
import type { DebtListFilters } from './debts.types.js';

export async function findById(id: string) {
  const result = await db
    .select()
    .from(debts)
    .where(and(eq(debts.id, id), isNull(debts.deletedAt)))
    .limit(1);

  return result[0] ?? null;
}

export async function findByUser(userId: string, filters: DebtListFilters) {
  const conditions = [
    eq(debts.userId, userId),
    isNull(debts.deletedAt),
  ];

  if (filters.status) {
    conditions.push(eq(debts.status, filters.status));
  }

  if (filters.priority) {
    conditions.push(eq(debts.priority, filters.priority));
  }

  return await db
    .select()
    .from(debts)
    .where(and(...conditions))
    .orderBy(debts.createdAt);
}

export async function create(data: typeof debts.$inferInsert) {
  await db.insert(debts).values(data);
}

export async function update(
  id: string,
  data: Partial<typeof debts.$inferInsert>,
) {
  await db.update(debts).set(data).where(eq(debts.id, id));
}

export async function softDelete(id: string, deletedAt: Date) {
  await db
    .update(debts)
    .set({ deletedAt, updatedAt: deletedAt })
    .where(eq(debts.id, id));
}
