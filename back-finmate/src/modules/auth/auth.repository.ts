import crypto from 'crypto';
import { eq, and } from 'drizzle-orm';
import { db } from '../../shared/database/connection.js';
import {
  users,
  refreshTokens,
  passwordResetTokens,
} from '../../shared/database/schema.js';

export async function findUserByEmail(
  email: string,
): Promise<typeof users.$inferSelect | null> {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  return result[0] ?? null;
}

export async function findUserById(
  id: string,
): Promise<typeof users.$inferSelect | null> {
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);

  return result[0] ?? null;
}

export async function createUser(data: typeof users.$inferInsert) {
  await db.insert(users).values(data);
}

export async function createRefreshToken(data: {
  userId: string;
  expiresAt: Date;
}) {
  const id = crypto.randomUUID();
  const now = new Date();

  await db.insert(refreshTokens).values({
    id,
    userId: data.userId,
    expiresAt: data.expiresAt,
    revoked: false,
    createdAt: now,
    updatedAt: now,
  });

  return id;
}

export async function findRefreshTokenById(
  id: string,
): Promise<typeof refreshTokens.$inferSelect | null> {
  const result = await db
    .select()
    .from(refreshTokens)
    .where(eq(refreshTokens.id, id))
    .limit(1);

  return result[0] ?? null;
}

export async function revokeRefreshToken(id: string) {
  await db
    .update(refreshTokens)
    .set({ revoked: true, updatedAt: new Date() })
    .where(eq(refreshTokens.id, id));
}

export async function revokeAllUserRefreshTokens(userId: string) {
  await db
    .update(refreshTokens)
    .set({ revoked: true, updatedAt: new Date() })
    .where(
      and(eq(refreshTokens.userId, userId), eq(refreshTokens.revoked, false)),
    );
}

export async function updateUserName(userId: string, name: string) {
  await db
    .update(users)
    .set({ name, updatedAt: new Date() })
    .where(eq(users.id, userId));
}

export async function updateUserPassword(userId: string, passwordHash: string) {
  await db
    .update(users)
    .set({ passwordHash, updatedAt: new Date() })
    .where(eq(users.id, userId));
}

export async function createPasswordResetToken(data: {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
}) {
  await db.insert(passwordResetTokens).values(data);
}

export async function findPasswordResetToken(token: string) {
  const result = await db
    .select()
    .from(passwordResetTokens)
    .where(eq(passwordResetTokens.token, token))
    .limit(1);

  return result[0] ?? null;
}

export async function markPasswordResetTokenUsed(id: string) {
  await db
    .update(passwordResetTokens)
    .set({ used: true })
    .where(eq(passwordResetTokens.id, id));
}

export async function updateUserEmailVerifiedAt(userId: string) {
  await db
    .update(users)
    .set({ emailVerifiedAt: new Date(), updatedAt: new Date() })
    .where(eq(users.id, userId));
}
