import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as couplesRepository from '../couples.repository.js';

vi.mock('../couples.repository.js');
vi.mock('../../auth/auth.repository.js', () => ({
  findUserById: vi.fn(),
}));
vi.mock('../goals/goals.service.js', () => ({
  cancelActiveGoalsOnDissolve: vi.fn(),
}));

const mockCouple = {
  id: 'couple-123',
  createdBy: 'owner-123',
  name: 'Nuestro grupo',
  status: 'active' as const,
  createdAt: new Date('2026-06-01T12:00:00.000Z'),
  updatedAt: new Date('2026-06-01T12:00:00.000Z'),
};

const mockMembers = [
  {
    id: 'member-1',
    userId: 'owner-123',
    name: 'Owner',
    email: 'owner@test.com',
    role: 'owner' as const,
    joinedAt: new Date('2026-06-01T12:00:00.000Z'),
  },
];

const mockRawMember = {
  id: 'member-1',
  coupleId: 'couple-123',
  userId: 'owner-123',
  role: 'owner' as const,
  joinedAt: new Date('2026-06-01T12:00:00.000Z'),
};

let couplesService: typeof import('../couples.service.js');
let authRepository: typeof import('../../auth/auth.repository.js');

beforeEach(async () => {
  vi.clearAllMocks();
  couplesService = await import('../couples.service.js');
  authRepository = await import('../../auth/auth.repository.js');
});

describe('getMyCouple', () => {
  it('returns active couple for user', async () => {
    vi.mocked(couplesRepository.findActiveCoupleByUserId).mockResolvedValue({
      couple: mockCouple,
      member: mockRawMember,
    });
    vi.mocked(couplesRepository.findCoupleMembers).mockResolvedValue(mockMembers);

    const result = await couplesService.getMyCouple('owner-123');

    expect(result.id).toBe('couple-123');
    expect(result.members).toHaveLength(1);
  });

  it('throws 404 when user has no active couple', async () => {
    vi.mocked(couplesRepository.findActiveCoupleByUserId).mockResolvedValue(
      null as unknown as Awaited<ReturnType<typeof couplesRepository.findActiveCoupleByUserId>>,
    );

    await expect(couplesService.getMyCouple('user-without-couple')).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});

describe('create', () => {
  it('creates couple and returns it with members', async () => {
    vi.mocked(couplesRepository.findActiveCoupleByUserId).mockResolvedValue(
      null as unknown as Awaited<ReturnType<typeof couplesRepository.findActiveCoupleByUserId>>,
    );
    vi.mocked(couplesRepository.findCoupleMembers).mockResolvedValue(mockMembers);

    const result = await couplesService.create({ name: 'Nuestro grupo' }, 'owner-123');

    expect(couplesRepository.createCouple).toHaveBeenCalled();
    expect(couplesRepository.createMember).toHaveBeenCalled();
    expect(result.name).toBe('Nuestro grupo');
  });

  it('throws 409 when user already has an active couple', async () => {
    vi.mocked(couplesRepository.findActiveCoupleByUserId).mockResolvedValue({
      couple: mockCouple,
      member: mockRawMember,
    });

    await expect(couplesService.create({ name: 'Otro grupo' }, 'owner-123')).rejects.toMatchObject({
      statusCode: 409,
    });
  });
});

describe('invite', () => {
  it('creates invitation when valid', async () => {
    vi.mocked(couplesRepository.findCoupleById).mockResolvedValue(mockCouple);
    vi.mocked(couplesRepository.findMemberByUserAndCouple)
      .mockResolvedValueOnce(mockRawMember)
      .mockResolvedValueOnce(
        null as unknown as Awaited<ReturnType<typeof couplesRepository.findMemberByUserAndCouple>>,
      );
    vi.mocked(couplesRepository.findUserByEmail).mockResolvedValue({
      id: 'invited-123',
      name: 'Invited',
      email: 'invited@test.com',
      passwordHash: 'hash',
      status: 'active' as const,
      emailVerifiedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });
    vi.mocked(couplesRepository.findActiveCoupleByUserId).mockResolvedValue(
      null as unknown as Awaited<ReturnType<typeof couplesRepository.findActiveCoupleByUserId>>,
    );
    vi.mocked(couplesRepository.findPendingInvitation).mockResolvedValue(
      null as unknown as Awaited<ReturnType<typeof couplesRepository.findPendingInvitation>>,
    );

    const result = await couplesService.invite('couple-123', 'invited@test.com', 'owner-123');

    expect(couplesRepository.createInvitation).toHaveBeenCalled();
    expect(result.status).toBe('pending');
  });

  it('throws 404 when couple not found', async () => {
    vi.mocked(couplesRepository.findCoupleById).mockResolvedValue(
      null as unknown as Awaited<ReturnType<typeof couplesRepository.findCoupleById>>,
    );

    await expect(
      couplesService.invite('nonexistent', 'test@test.com', 'user-123'),
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  it('throws 403 when not owner', async () => {
    vi.mocked(couplesRepository.findCoupleById).mockResolvedValue(mockCouple);
    vi.mocked(couplesRepository.findMemberByUserAndCouple).mockResolvedValue({
      ...mockRawMember,
      role: 'member',
    });

    await expect(
      couplesService.invite('couple-123', 'test@test.com', 'member-123'),
    ).rejects.toMatchObject({ statusCode: 403 });
  });
});

describe('join', () => {
  it('accepts invitation and creates member', async () => {
    vi.mocked(couplesRepository.findCoupleById).mockResolvedValue(mockCouple);
    vi.mocked(authRepository.findUserById).mockResolvedValue({
      id: 'invited-123',
      name: 'Invited',
      email: 'invited@test.com',
      passwordHash: 'hash',
      status: 'active' as const,
      emailVerifiedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });
    vi.mocked(couplesRepository.findInvitationByCoupleAndEmail).mockResolvedValue({
      id: 'invitation-1',
      coupleId: 'couple-123',
      invitedEmail: 'invited@test.com',
      status: 'pending',
      expiresAt: new Date(Date.now() + 86400000),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    vi.mocked(couplesRepository.findActiveCoupleByUserId).mockResolvedValue(
      null as unknown as Awaited<ReturnType<typeof couplesRepository.findActiveCoupleByUserId>>,
    );
    vi.mocked(couplesRepository.findCoupleMembers).mockResolvedValue(mockMembers);

    const result = await couplesService.join('couple-123', 'invited-123');

    expect(couplesRepository.acceptInvitation).toHaveBeenCalled();
    expect(couplesRepository.createMember).toHaveBeenCalled();
    expect(result.id).toBe('couple-123');
  });

  it('throws 404 when no pending invitation', async () => {
    vi.mocked(couplesRepository.findCoupleById).mockResolvedValue(mockCouple);
    vi.mocked(authRepository.findUserById).mockResolvedValue({
      id: 'user-123',
      name: 'User',
      email: 'user@test.com',
      passwordHash: 'hash',
      status: 'active' as const,
      emailVerifiedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });
    vi.mocked(couplesRepository.findInvitationByCoupleAndEmail).mockResolvedValue(
      null as unknown as Awaited<ReturnType<typeof couplesRepository.findInvitationByCoupleAndEmail>>,
    );

    await expect(couplesService.join('couple-123', 'user-123')).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});

describe('leave', () => {
  it('removes member from couple', async () => {
    vi.mocked(couplesRepository.findMemberByUserAndCouple).mockResolvedValue({
      ...mockRawMember,
      id: 'member-1',
      userId: 'user-123',
      role: 'member',
    });

    await couplesService.leave('couple-123', 'user-123');

    expect(couplesRepository.deleteMember).toHaveBeenCalledWith('member-1');
  });

  it('throws 403 when owner tries to leave', async () => {
    vi.mocked(couplesRepository.findMemberByUserAndCouple).mockResolvedValue({
      ...mockRawMember,
      id: 'member-1',
      userId: 'owner-123',
      role: 'owner',
    });

    await expect(couplesService.leave('couple-123', 'owner-123')).rejects.toMatchObject({
      statusCode: 403,
    });
  });
});

describe('dissolve', () => {
  it('dissolves couple when owner', async () => {
    vi.mocked(couplesRepository.findCoupleById).mockResolvedValue(mockCouple);
    vi.mocked(couplesRepository.findCoupleMembers).mockResolvedValue(mockMembers);

    await couplesService.dissolve('couple-123', 'owner-123');

    expect(couplesRepository.unshareMovements).toHaveBeenCalledWith('couple-123');
    expect(couplesRepository.unshareDebts).toHaveBeenCalledWith('couple-123');
    expect(couplesRepository.dissolveCouple).toHaveBeenCalledWith('couple-123');
  });

  it('throws 403 when not owner', async () => {
    vi.mocked(couplesRepository.findCoupleById).mockResolvedValue(mockCouple);

    await expect(couplesService.dissolve('couple-123', 'other-user')).rejects.toMatchObject({
      statusCode: 403,
    });
  });
});
