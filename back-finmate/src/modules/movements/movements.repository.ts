import { and, eq, isNull, gte, lte, sql, count } from 'drizzle-orm';
import { db } from '../../shared/database/connection.js';
import { movements } from '../../shared/database/schema.js';
import type { MovementListFilters } from './movements.types.js';

function buildConditions(userId: string, filters: MovementListFilters) {
  const conditions = [
    eq(movements.userId, userId),
    isNull(movements.deletedAt),
  ];

  if (filters.type) {
    conditions.push(eq(movements.type, filters.type));
  }

  if (filters.categoryId) {
    conditions.push(eq(movements.categoryId, filters.categoryId));
  }

  if (filters.from) {
    conditions.push(gte(movements.movementDate, new Date(filters.from)));
  }

  if (filters.to) {
    conditions.push(lte(movements.movementDate, new Date(filters.to)));
  }

  return conditions;
}

export async function findById(id: string) {
  const result = await db
    .select()
    .from(movements)
    .where(and(eq(movements.id, id), isNull(movements.deletedAt)))
    .limit(1);

  return result[0] ?? null;
}

export async function findByUser(userId: string, filters: MovementListFilters) {
  const conditions = buildConditions(userId, filters);

  const page = filters.page ?? 1;
  const limit = filters.limit ?? 20;
  const offset = (page - 1) * limit;

  return await db
    .select()
    .from(movements)
    .where(and(...conditions))
    .orderBy(sql`${movements.movementDate} DESC`, sql`${movements.createdAt} DESC`)
    .limit(limit)
    .offset(offset);
}

export async function countByUser(userId: string, filters: MovementListFilters) {
  const conditions = buildConditions(userId, filters);

  const result = await db
    .select({ total: count() })
    .from(movements)
    .where(and(...conditions));

  return Number(result[0].total);
}

export async function create(data: typeof movements.$inferInsert) {
  await db.insert(movements).values(data);
}

export async function update(
  id: string,
  data: Partial<typeof movements.$inferInsert>,
) {
  await db.update(movements).set(data).where(eq(movements.id, id));
}

export async function softDelete(id: string, deletedAt: Date) {
  await db
    .update(movements)
    .set({ deletedAt, updatedAt: deletedAt })
    .where(eq(movements.id, id));
}
