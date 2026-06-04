import { and, eq, isNull, ne, or, sql } from 'drizzle-orm';
import { db } from '../../shared/database/connection.js';
import { categories } from '../../shared/database/schema.js';

export async function findById(id: string) {
  const result = await db
    .select()
    .from(categories)
    .where(and(eq(categories.id, id), isNull(categories.deletedAt)))
    .limit(1);

  return result[0] ?? null;
}

export async function findByNameAndUser(name: string, userId: string, excludeId?: string) {
  const conditions = [
    eq(categories.name, name),
    eq(categories.userId, userId),
    isNull(categories.deletedAt),
  ];

  if (excludeId) {
    conditions.push(ne(categories.id, excludeId));
  }

  const result = await db
    .select()
    .from(categories)
    .where(and(...conditions))
    .limit(1);

  return result[0] ?? null;
}

export async function findByUser(userId: string, type?: string) {
  const conditions: ReturnType<typeof eq>[] = [
    or(
      eq(categories.isSystem, true),
      and(eq(categories.userId, userId), eq(categories.isActive, true)),
    ) as unknown as ReturnType<typeof eq>,
    isNull(categories.deletedAt),
  ];

  if (type) {
    conditions.push(eq(categories.type, type as 'income' | 'expense'));
  }

  return await db
    .select()
    .from(categories)
    .where(and(...conditions))
    .orderBy(sql`${categories.isSystem} DESC`, categories.name);
}

export async function create(data: {
  id: string;
  userId: string;
  type: 'income' | 'expense';
  name: string;
  icon?: string | null;
  isActive: boolean;
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}) {
  await db.insert(categories).values(data);
}

export async function update(
  id: string,
  data: Partial<{
    name: string;
    icon: string | null;
    isActive: boolean;
    updatedAt: Date;
  }>,
) {
  await db.update(categories).set(data).where(eq(categories.id, id));
}

export async function softDelete(id: string, updatedAt: Date) {
  await db
    .update(categories)
    .set({
      isActive: false,
      deletedAt: updatedAt,
      updatedAt,
    })
    .where(eq(categories.id, id));
}

export async function countMovementsByCategory(categoryId: string) {
  const { movements } = await import('../../shared/database/schema.js');
  const result = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(movements)
    .where(eq(movements.categoryId, categoryId));

  return Number(result[0].count);
}
