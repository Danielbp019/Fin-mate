import { eq, and, isNull } from 'drizzle-orm';
import { db } from '../../../shared/database/connection.js';
import { coupleGoals, goalContributions, users } from '../../../shared/database/schema.js';

export async function findByCouple(coupleId: string) {
  return await db
    .select()
    .from(coupleGoals)
    .where(and(eq(coupleGoals.coupleId, coupleId), isNull(coupleGoals.deletedAt)))
    .orderBy(coupleGoals.createdAt);
}

export async function findById(id: string) {
  const result = await db
    .select()
    .from(coupleGoals)
    .where(and(eq(coupleGoals.id, id), isNull(coupleGoals.deletedAt)))
    .limit(1);

  return result[0] ?? null;
}

export async function findActiveByCouple(coupleId: string) {
  return await db
    .select()
    .from(coupleGoals)
    .where(
      and(
        eq(coupleGoals.coupleId, coupleId),
        eq(coupleGoals.status, 'active'),
        isNull(coupleGoals.deletedAt),
      ),
    );
}

export async function create(data: typeof coupleGoals.$inferInsert) {
  await db.insert(coupleGoals).values(data);
}

export async function update(id: string, data: Partial<typeof coupleGoals.$inferInsert>) {
  await db.update(coupleGoals).set(data).where(eq(coupleGoals.id, id));
}

export async function softDelete(id: string) {
  await db.update(coupleGoals).set({ deletedAt: new Date() }).where(eq(coupleGoals.id, id));
}

export async function findContributionsByGoal(goalId: string) {
  return await db
    .select({
      id: goalContributions.id,
      goalId: goalContributions.goalId,
      userId: goalContributions.userId,
      userName: users.name,
      amount: goalContributions.amount,
      notes: goalContributions.notes,
      date: goalContributions.date,
      createdAt: goalContributions.createdAt,
    })
    .from(goalContributions)
    .innerJoin(users, eq(goalContributions.userId, users.id))
    .where(eq(goalContributions.goalId, goalId))
    .orderBy(goalContributions.date);
}

export async function createContribution(data: typeof goalContributions.$inferInsert) {
  await db.insert(goalContributions).values(data);
}
