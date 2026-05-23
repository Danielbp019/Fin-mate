import crypto from 'crypto';
import { eq } from 'drizzle-orm';
import { db } from '../../shared/database/connection.js';
import { users, tokenBlacklist } from '../../shared/database/schema.js';

export async function findUserByEmail(email: string) {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  return result[0] ?? null;
}

export async function createUser(
  data: typeof users.$inferInsert,
) {
  await db.insert(users).values(data);
}

export async function blacklistToken(token: string, expiresAt: Date) {
  await db.insert(tokenBlacklist).values({
    id: crypto.randomUUID(),
    token,
    expiresAt,
  });
}

export async function findBlacklistedToken(token: string) {
  const result = await db
    .select()
    .from(tokenBlacklist)
    .where(eq(tokenBlacklist.token, token))
    .limit(1);

  return result[0] ?? null;
}
