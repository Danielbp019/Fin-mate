import { eq, and } from 'drizzle-orm';
import { db } from '../../shared/database/connection.js';
import {
  couples,
  coupleMembers,
  coupleInvitations,
  users,
  movements,
  debts,
} from '../../shared/database/schema.js';

export async function findActiveCoupleByUserId(userId: string) {
  const result = await db
    .select({
      couple: couples,
      member: coupleMembers,
    })
    .from(coupleMembers)
    .innerJoin(couples, eq(coupleMembers.coupleId, couples.id))
    .where(and(eq(coupleMembers.userId, userId), eq(couples.status, 'active')))
    .limit(1);

  return result[0] ?? null;
}

export async function findCoupleById(id: string) {
  const result = await db
    .select()
    .from(couples)
    .where(eq(couples.id, id))
    .limit(1);

  return result[0] ?? null;
}

export async function findCoupleMembers(coupleId: string) {
  return await db
    .select({
      id: coupleMembers.id,
      userId: coupleMembers.userId,
      name: users.name,
      email: users.email,
      role: coupleMembers.role,
      joinedAt: coupleMembers.joinedAt,
    })
    .from(coupleMembers)
    .innerJoin(users, eq(coupleMembers.userId, users.id))
    .where(eq(coupleMembers.coupleId, coupleId));
}

export async function findMemberByUserAndCouple(
  userId: string,
  coupleId: string,
) {
  const result = await db
    .select()
    .from(coupleMembers)
    .where(
      and(
        eq(coupleMembers.userId, userId),
        eq(coupleMembers.coupleId, coupleId),
      ),
    )
    .limit(1);

  return result[0] ?? null;
}

export async function findUserByEmail(email: string) {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  return result[0] ?? null;
}

export async function findPendingInvitation(coupleId: string, email: string) {
  const result = await db
    .select()
    .from(coupleInvitations)
    .where(
      and(
        eq(coupleInvitations.coupleId, coupleId),
        eq(coupleInvitations.invitedEmail, email),
        eq(coupleInvitations.status, 'pending'),
      ),
    )
    .limit(1);

  return result[0] ?? null;
}

export async function findInvitationByCoupleAndEmail(
  coupleId: string,
  email: string,
) {
  const result = await db
    .select()
    .from(coupleInvitations)
    .where(
      and(
        eq(coupleInvitations.coupleId, coupleId),
        eq(coupleInvitations.invitedEmail, email),
        eq(coupleInvitations.status, 'pending'),
      ),
    )
    .limit(1);

  return result[0] ?? null;
}

export async function createCouple(data: {
  id: string;
  createdBy: string;
  name: string | null;
  status: 'active';
  createdAt: Date;
  updatedAt: Date;
}) {
  await db.insert(couples).values(data);
}

export async function createMember(data: {
  id: string;
  coupleId: string;
  userId: string;
  role: 'owner' | 'member';
  joinedAt: Date;
}) {
  await db.insert(coupleMembers).values(data);
}

export async function createInvitation(data: {
  id: string;
  coupleId: string;
  invitedEmail: string;
  status: 'pending';
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}) {
  await db.insert(coupleInvitations).values(data);
}

export async function acceptInvitation(id: string) {
  await db
    .update(coupleInvitations)
    .set({ status: 'accepted', updatedAt: new Date() })
    .where(eq(coupleInvitations.id, id));
}

export async function deleteMember(id: string) {
  await db.delete(coupleMembers).where(eq(coupleMembers.id, id));
}

export async function dissolveCouple(id: string) {
  await db
    .update(couples)
    .set({ status: 'inactive', updatedAt: new Date() })
    .where(eq(couples.id, id));
}

export async function unshareMovements(coupleId: string) {
  await db
    .update(movements)
    .set({ coupleId: null })
    .where(eq(movements.coupleId, coupleId));
}

export async function unshareDebts(coupleId: string) {
  await db
    .update(debts)
    .set({ coupleId: null })
    .where(eq(debts.coupleId, coupleId));
}

export async function expireInvitations(coupleId: string) {
  await db
    .update(coupleInvitations)
    .set({ status: 'expired', updatedAt: new Date() })
    .where(
      and(
        eq(coupleInvitations.coupleId, coupleId),
        eq(coupleInvitations.status, 'pending'),
      ),
    );
}
