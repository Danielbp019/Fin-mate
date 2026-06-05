import { and, eq, isNull, gte, lte, sql, count, desc } from 'drizzle-orm';
import { db } from '../../shared/database/connection.js';
import { movements, categories } from '../../shared/database/schema.js';
import type { MovementListFilters } from './movements.types.js';

function buildConditions(userId: string, filters: MovementListFilters) {
  const conditions = [eq(movements.userId, userId), isNull(movements.deletedAt)];

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

export async function update(id: string, data: Partial<typeof movements.$inferInsert>) {
  await db.update(movements).set(data).where(eq(movements.id, id));
}

export async function softDelete(id: string, deletedAt: Date) {
  await db.update(movements).set({ deletedAt, updatedAt: deletedAt }).where(eq(movements.id, id));
}

export async function getPeriodTotals(userId: string, from: Date, to: Date) {
  const result = await db
    .select({
      totalIncome: sql<string>`COALESCE(SUM(CASE WHEN ${movements.type} = 'income' THEN ${movements.amount} ELSE 0 END), 0)`,
      totalExpense: sql<string>`COALESCE(SUM(CASE WHEN ${movements.type} = 'expense' THEN ${movements.amount} ELSE 0 END), 0)`,
    })
    .from(movements)
    .where(
      and(
        eq(movements.userId, userId),
        isNull(movements.deletedAt),
        gte(movements.movementDate, from),
        lte(movements.movementDate, to),
      ),
    );

  return {
    totalIncome: result[0]?.totalIncome ?? '0',
    totalExpense: result[0]?.totalExpense ?? '0',
  };
}

export async function getTotalsByCategory(
  userId: string,
  type: 'income' | 'expense',
  from: Date,
  to: Date,
) {
  const rows = await db
    .select({
      categoryId: movements.categoryId,
      categoryName: categories.name,
      icon: categories.icon,
      total: sql<string>`COALESCE(SUM(${movements.amount}), 0)`,
    })
    .from(movements)
    .innerJoin(categories, eq(movements.categoryId, categories.id))
    .where(
      and(
        eq(movements.userId, userId),
        eq(movements.type, type),
        isNull(movements.deletedAt),
        gte(movements.movementDate, from),
        lte(movements.movementDate, to),
      ),
    )
    .groupBy(movements.categoryId, categories.name, categories.icon)
    .orderBy(desc(sql`SUM(${movements.amount})`));

  return rows;
}

export async function getMonthlyTotals(userId: string, limitMonths = 12) {
  const rows = await db
    .select({
      month: sql<string>`DATE_FORMAT(${movements.movementDate}, '%Y-%m')`,
      income: sql<string>`COALESCE(SUM(CASE WHEN ${movements.type} = 'income' THEN ${movements.amount} ELSE 0 END), 0)`,
      expense: sql<string>`COALESCE(SUM(CASE WHEN ${movements.type} = 'expense' THEN ${movements.amount} ELSE 0 END), 0)`,
    })
    .from(movements)
    .where(and(eq(movements.userId, userId), isNull(movements.deletedAt)))
    .groupBy(sql`DATE_FORMAT(${movements.movementDate}, '%Y-%m')`)
    .orderBy(desc(sql`DATE_FORMAT(${movements.movementDate}, '%Y-%m')`))
    .limit(limitMonths);

  return rows.reverse();
}

export async function getRecentWithCategory(userId: string, limitRows = 5) {
  const rows = await db
    .select({
      id: movements.id,
      type: movements.type,
      amount: movements.amount,
      categoryName: categories.name,
      categoryIcon: categories.icon,
      description: movements.description,
      movementDate: movements.movementDate,
    })
    .from(movements)
    .innerJoin(categories, eq(movements.categoryId, categories.id))
    .where(and(eq(movements.userId, userId), isNull(movements.deletedAt)))
    .orderBy(desc(movements.movementDate))
    .limit(limitRows);

  return rows.map((r) => ({
    ...r,
    movementDate:
      r.movementDate instanceof Date ? r.movementDate.toISOString() : String(r.movementDate),
  }));
}
