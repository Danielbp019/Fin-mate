import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as goalsRepository from '../goals.repository.js';
import * as couplesRepository from '../../couples.repository.js';

const mockCategoryId = 'cat-ahorro-123';

const mockModules = vi.hoisted(() => {
  const mockDb: Record<string, ReturnType<typeof vi.fn>> = {};
  const chain = () => mockDb;
  mockDb.select = vi.fn(() => chain());
  mockDb.from = vi.fn(() => chain());
  mockDb.where = vi.fn(() => chain());
  mockDb.limit = vi.fn(() => Promise.resolve([{ id: mockCategoryId }]));
  mockDb.innerJoin = vi.fn(() => chain());
  mockDb.orderBy = vi.fn(() => chain());
  mockDb.insert = vi.fn(() => chain());
  mockDb.values = vi.fn(() => Promise.resolve(undefined));
  return { db: mockDb, chain };
});

vi.mock('../goals.repository.js');
vi.mock('../../couples.repository.js');
vi.mock('../../../../shared/database/connection.js', () => ({
  db: mockModules.db,
}));

const mockGoal = {
  id: 'goal-123',
  coupleId: 'couple-123',
  title: 'Viaje a la playa',
  targetAmount: '5000.00',
  currentAmount: '1500.00',
  deadline: new Date('2026-12-31T00:00:00.000Z'),
  status: 'active' as const,
  createdBy: 'user-owner',
  createdAt: new Date('2026-06-01T12:00:00.000Z'),
  updatedAt: new Date('2026-06-01T12:00:00.000Z'),
  deletedAt: null,
};

const mockContribution = {
  id: 'contrib-123',
  goalId: 'goal-123',
  userId: 'user-owner',
  userName: 'Owner',
  amount: '500.00',
  notes: null,
  date: new Date('2026-06-15T10:00:00.000Z'),
  createdAt: new Date('2026-06-15T10:00:00.000Z'),
};

const mockMember = {
  id: 'member-1',
  coupleId: 'couple-123',
  userId: 'user-owner',
  role: 'owner' as const,
  joinedAt: new Date('2026-06-01T12:00:00.000Z'),
};

let goalsService: typeof import('../goals.service.js');

beforeEach(async () => {
  vi.clearAllMocks();
  goalsService = await import('../goals.service.js');
});

describe('list', () => {
  it('returns goals with contributions for a couple', async () => {
    vi.mocked(couplesRepository.findMemberByUserAndCouple).mockResolvedValue(
      mockMember,
    );
    vi.mocked(goalsRepository.findByCouple).mockResolvedValue([mockGoal]);
    vi.mocked(goalsRepository.findContributionsByGoal).mockResolvedValue([
      mockContribution,
    ]);

    const result = await goalsService.list('couple-123', 'user-owner');

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Viaje a la playa');
    expect(result[0].progressPercent).toBe(30);
    expect(result[0].contributions).toHaveLength(1);
  });

  it('returns empty array when no goals', async () => {
    vi.mocked(couplesRepository.findMemberByUserAndCouple).mockResolvedValue(
      mockMember,
    );
    vi.mocked(goalsRepository.findByCouple).mockResolvedValue([]);

    const result = await goalsService.list('couple-123', 'user-owner');

    expect(result).toHaveLength(0);
  });

  it('throws 403 when user is not a member', async () => {
    vi.mocked(couplesRepository.findMemberByUserAndCouple).mockResolvedValue(
      null,
    );

    await expect(
      goalsService.list('couple-123', 'other-user'),
    ).rejects.toMatchObject({ statusCode: 403 });
  });
});

describe('create', () => {
  it('creates a goal and returns it', async () => {
    vi.mocked(couplesRepository.findMemberByUserAndCouple).mockResolvedValue(
      mockMember,
    );

    const result = await goalsService.create(
      { title: 'Viaje a la playa', targetAmount: '5000.00' },
      'couple-123',
      'user-owner',
    );

    expect(goalsRepository.create).toHaveBeenCalledTimes(1);
    expect(result.title).toBe('Viaje a la playa');
    expect(result.targetAmount).toBe('5000.00');
    expect(result.currentAmount).toBe('0');
  });

  it('throws 403 when user is not a member', async () => {
    vi.mocked(couplesRepository.findMemberByUserAndCouple).mockResolvedValue(
      null,
    );

    await expect(
      goalsService.create(
        { title: 'Meta', targetAmount: '1000.00' },
        'couple-123',
        'other-user',
      ),
    ).rejects.toMatchObject({ statusCode: 403 });
  });
});

describe('update', () => {
  it('updates goal fields when owner', async () => {
    vi.mocked(goalsRepository.findById).mockResolvedValue(mockGoal);
    vi.mocked(goalsRepository.findContributionsByGoal).mockResolvedValue([]);

    const result = await goalsService.update(
      'goal-123',
      { title: 'Viaje actualizado', targetAmount: '6000.00' },
      'couple-123',
      'user-owner',
    );

    expect(goalsRepository.update).toHaveBeenCalledWith(
      'goal-123',
      expect.objectContaining({
        title: 'Viaje actualizado',
        targetAmount: '6000.00',
      }),
    );
    expect(result.title).toBe('Viaje a la playa');
  });

  it('throws 403 when not the creator', async () => {
    vi.mocked(goalsRepository.findById).mockResolvedValue(mockGoal);

    await expect(
      goalsService.update(
        'goal-123',
        { title: 'Hackeado' },
        'couple-123',
        'other-user',
      ),
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  it('throws 404 when goal not found', async () => {
    vi.mocked(goalsRepository.findById).mockResolvedValue(null);

    await expect(
      goalsService.update(
        'nonexistent',
        { title: 'Nope' },
        'couple-123',
        'user-owner',
      ),
    ).rejects.toMatchObject({ statusCode: 404 });
  });
});

describe('remove', () => {
  it('soft deletes goal when owner', async () => {
    vi.mocked(goalsRepository.findById).mockResolvedValue(mockGoal);

    await goalsService.remove('goal-123', 'couple-123', 'user-owner');

    expect(goalsRepository.softDelete).toHaveBeenCalledWith('goal-123');
  });

  it('throws 403 when not the creator', async () => {
    vi.mocked(goalsRepository.findById).mockResolvedValue(mockGoal);

    await expect(
      goalsService.remove('goal-123', 'couple-123', 'other-user'),
    ).rejects.toMatchObject({ statusCode: 403 });
  });
});

describe('contribute', () => {
  it('creates contribution and movement expense', async () => {
    vi.mocked(couplesRepository.findMemberByUserAndCouple).mockResolvedValue(
      mockMember,
    );
    vi.mocked(goalsRepository.findById).mockResolvedValue(mockGoal);

    const result = await goalsService.contribute(
      'goal-123',
      { amount: '500.00', notes: 'Ahorro del mes' },
      'couple-123',
      'user-owner',
    );

    expect(goalsRepository.createContribution).toHaveBeenCalledTimes(1);
    expect(mockModules.db.insert).toHaveBeenCalled();
    expect(mockModules.db.values).toHaveBeenCalled();
    expect(goalsRepository.update).toHaveBeenCalledWith(
      'goal-123',
      expect.objectContaining({
        currentAmount: '2000.0000',
        status: 'active',
      }),
    );
    expect(result.amount).toBe('500.00');
  });

  it('marks goal as completed when target reached', async () => {
    const almostCompleteGoal = { ...mockGoal, currentAmount: '4800.00' };
    vi.mocked(couplesRepository.findMemberByUserAndCouple).mockResolvedValue(
      mockMember,
    );
    vi.mocked(goalsRepository.findById).mockResolvedValue(almostCompleteGoal);

    await goalsService.contribute(
      'goal-123',
      { amount: '500.00' },
      'couple-123',
      'user-owner',
    );

    expect(goalsRepository.update).toHaveBeenCalledWith(
      'goal-123',
      expect.objectContaining({
        currentAmount: '5300.0000',
        status: 'completed',
      }),
    );
  });

  it('throws 403 when user is not a member', async () => {
    vi.mocked(couplesRepository.findMemberByUserAndCouple).mockResolvedValue(
      null,
    );

    await expect(
      goalsService.contribute(
        'goal-123',
        { amount: '100.00' },
        'couple-123',
        'other-user',
      ),
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  it('throws 404 when goal not found', async () => {
    vi.mocked(couplesRepository.findMemberByUserAndCouple).mockResolvedValue(
      mockMember,
    );
    vi.mocked(goalsRepository.findById).mockResolvedValue(null);

    await expect(
      goalsService.contribute(
        'nonexistent',
        { amount: '100.00' },
        'couple-123',
        'user-owner',
      ),
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  it('throws 400 when goal is not active', async () => {
    const completedGoal = { ...mockGoal, status: 'completed' as const };
    vi.mocked(couplesRepository.findMemberByUserAndCouple).mockResolvedValue(
      mockMember,
    );
    vi.mocked(goalsRepository.findById).mockResolvedValue(completedGoal);

    await expect(
      goalsService.contribute(
        'goal-123',
        { amount: '100.00' },
        'couple-123',
        'user-owner',
      ),
    ).rejects.toMatchObject({
      statusCode: 400,
      message: 'La meta no esta activa',
    });
  });
});

describe('cancelActiveGoalsOnDissolve', () => {
  it('cancels active goals and creates income movements', async () => {
    const activeGoal = { ...mockGoal, status: 'active' as const };
    vi.mocked(goalsRepository.findActiveByCouple).mockResolvedValue([
      activeGoal,
    ]);

    await goalsService.cancelActiveGoalsOnDissolve('couple-123');

    expect(goalsRepository.findActiveByCouple).toHaveBeenCalledWith(
      'couple-123',
    );
    expect(mockModules.db.insert).toHaveBeenCalledTimes(1);
    expect(mockModules.db.values).toHaveBeenCalledTimes(1);
    expect(goalsRepository.update).toHaveBeenCalledWith(
      'goal-123',
      expect.objectContaining({ status: 'cancelled' }),
    );
  });

  it('does nothing when no active goals', async () => {
    vi.mocked(goalsRepository.findActiveByCouple).mockResolvedValue([]);

    await goalsService.cancelActiveGoalsOnDissolve('couple-123');

    expect(mockModules.db.insert).not.toHaveBeenCalled();
    expect(goalsRepository.update).not.toHaveBeenCalled();
  });

  it('skips movement for goals with zero currentAmount', async () => {
    const zeroGoal = { ...mockGoal, currentAmount: '0' };
    vi.mocked(goalsRepository.findActiveByCouple).mockResolvedValue([zeroGoal]);

    await goalsService.cancelActiveGoalsOnDissolve('couple-123');

    expect(mockModules.db.insert).not.toHaveBeenCalled();
    expect(goalsRepository.update).toHaveBeenCalledWith(
      'goal-123',
      expect.objectContaining({ status: 'cancelled' }),
    );
  });
});
