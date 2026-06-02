import crypto from 'crypto';
import { env } from '../../config/env.js';
import { AppError } from '../../shared/errors/AppError.js';
import { findUserById } from '../auth/auth.repository.js';
import { sendEmail } from '../../shared/email/email.service.js';
import { coupleInvitationEmail } from '../../shared/email/email.templates.js';
import * as couplesRepository from './couples.repository.js';
import { cancelActiveGoalsOnDissolve } from './goals/goals.service.js';
import type { CoupleResponse, CoupleMemberResponse } from './couples.types.js';

const INVITATION_EXPIRY_DAYS = 7;

function buildCoupleResponse(
  couple: NonNullable<
    Awaited<ReturnType<typeof couplesRepository.findCoupleById>>
  >,
  members: CoupleMemberResponse[],
): CoupleResponse {
  return {
    id: couple.id,
    name: couple.name,
    status: couple.status,
    members,
  };
}

export async function getMyCouple(userId: string): Promise<CoupleResponse> {
  const active = await couplesRepository.findActiveCoupleByUserId(userId);
  if (!active) {
    throw new AppError(404, 'No perteneces a ningun grupo activo');
  }

  const members = await couplesRepository.findCoupleMembers(active.couple.id);
  return buildCoupleResponse(active.couple, members);
}

export async function create(
  data: { name?: string },
  userId: string,
): Promise<CoupleResponse> {
  const existing = await couplesRepository.findActiveCoupleByUserId(userId);
  if (existing) {
    throw new AppError(409, 'Ya perteneces a un grupo activo');
  }

  const now = new Date();
  const coupleId = crypto.randomUUID();

  const couple = {
    id: coupleId,
    createdBy: userId,
    name: data.name ?? null,
    status: 'active' as const,
    createdAt: now,
    updatedAt: now,
  };

  await couplesRepository.createCouple(couple);

  const member = {
    id: crypto.randomUUID(),
    coupleId,
    userId,
    role: 'owner' as const,
    joinedAt: now,
  };

  await couplesRepository.createMember(member);

  const members = await couplesRepository.findCoupleMembers(coupleId);
  return buildCoupleResponse(couple, members);
}

export async function invite(
  coupleId: string,
  email: string,
  userId: string,
): Promise<{
  id: string;
  coupleId: string;
  invitedEmail: string;
  status: string;
  expiresAt: string;
}> {
  const couple = await couplesRepository.findCoupleById(coupleId);
  if (!couple) {
    throw new AppError(404, 'Grupo no encontrado');
  }

  if (couple.status !== 'active') {
    throw new AppError(400, 'El grupo no esta activo');
  }

  const member = await couplesRepository.findMemberByUserAndCouple(
    userId,
    coupleId,
  );
  if (!member || member.role !== 'owner') {
    throw new AppError(403, 'Solo el propietario del grupo puede invitar');
  }

  const invitedUser = await couplesRepository.findUserByEmail(email);
  if (!invitedUser) {
    throw new AppError(404, 'No existe un usuario con ese correo electronico');
  }

  const alreadyMember = await couplesRepository.findMemberByUserAndCouple(
    invitedUser.id,
    coupleId,
  );
  if (alreadyMember) {
    throw new AppError(409, 'El usuario ya es miembro del grupo');
  }

  const activeCouple = await couplesRepository.findActiveCoupleByUserId(
    invitedUser.id,
  );
  if (activeCouple) {
    throw new AppError(409, 'El usuario ya pertenece a otro grupo activo');
  }

  const pending = await couplesRepository.findPendingInvitation(
    coupleId,
    email,
  );
  if (pending) {
    throw new AppError(
      409,
      'Ya existe una invitacion pendiente para este usuario',
    );
  }

  const now = new Date();
  const expiresAt = new Date(
    now.getTime() + INVITATION_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
  );
  const invitationId = crypto.randomUUID();

  const invitation = {
    id: invitationId,
    coupleId,
    invitedEmail: email,
    status: 'pending' as const,
    expiresAt,
    createdAt: now,
    updatedAt: now,
  };

  await couplesRepository.createInvitation(invitation);

  const inviter = await findUserById(userId);
  if (inviter) {
    const coupleName = couple.name ?? 'Sin nombre';
    const inviteUrl = `${env.frontendUrl}/couples/${coupleId}/join`;
    const { subject, html } = coupleInvitationEmail(
      coupleName,
      inviter.name,
      inviteUrl,
    );
    sendEmail({ to: email, subject, html }).catch(() => {
      // No bloquear si falla el email
    });
  }

  return {
    id: invitation.id,
    coupleId: invitation.coupleId,
    invitedEmail: invitation.invitedEmail,
    status: invitation.status,
    expiresAt: expiresAt.toISOString(),
  };
}

export async function join(
  coupleId: string,
  userId: string,
): Promise<CoupleResponse> {
  const couple = await couplesRepository.findCoupleById(coupleId);
  if (!couple) {
    throw new AppError(404, 'Grupo no encontrado');
  }

  if (couple.status !== 'active') {
    throw new AppError(400, 'El grupo no esta activo');
  }

  const userRecord = await findUserById(userId);
  if (!userRecord) {
    throw new AppError(404, 'Usuario no encontrado');
  }

  const invitation = await couplesRepository.findInvitationByCoupleAndEmail(
    coupleId,
    userRecord.email,
  );
  if (!invitation) {
    throw new AppError(
      404,
      'No tienes una invitacion pendiente para este grupo',
    );
  }

  if (new Date() > invitation.expiresAt) {
    throw new AppError(400, 'La invitacion ha expirado');
  }

  const activeCouple = await couplesRepository.findActiveCoupleByUserId(userId);
  if (activeCouple) {
    throw new AppError(409, 'Ya perteneces a otro grupo activo');
  }

  await couplesRepository.acceptInvitation(invitation.id);

  const member = {
    id: crypto.randomUUID(),
    coupleId,
    userId,
    role: 'member' as const,
    joinedAt: new Date(),
  };

  await couplesRepository.createMember(member);

  const members = await couplesRepository.findCoupleMembers(coupleId);
  return buildCoupleResponse(couple, members);
}

export async function leave(coupleId: string, userId: string): Promise<void> {
  const member = await couplesRepository.findMemberByUserAndCouple(
    userId,
    coupleId,
  );
  if (!member) {
    throw new AppError(404, 'No eres miembro de este grupo');
  }

  if (member.role === 'owner') {
    throw new AppError(
      403,
      'El propietario no puede abandonar el grupo. Debes disolverlo o transferir la propiedad',
    );
  }

  await couplesRepository.deleteMember(member.id);
}

export async function dissolve(
  coupleId: string,
  userId: string,
): Promise<void> {
  const couple = await couplesRepository.findCoupleById(coupleId);
  if (!couple) {
    throw new AppError(404, 'Grupo no encontrado');
  }

  if (couple.createdBy !== userId) {
    throw new AppError(403, 'Solo el propietario puede disolver el grupo');
  }

  await cancelActiveGoalsOnDissolve(coupleId);

  await Promise.all([
    couplesRepository.unshareMovements(coupleId),
    couplesRepository.unshareDebts(coupleId),
    couplesRepository.expireInvitations(coupleId),
  ]);

  await couplesRepository.dissolveCouple(coupleId);

  const members = await couplesRepository.findCoupleMembers(coupleId);
  await Promise.all(members.map((m) => couplesRepository.deleteMember(m.id)));
}
