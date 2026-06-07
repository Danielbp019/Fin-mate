import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCouplesStore } from '@/stores/couples';
import type { Couple, Goal } from '@/types';

vi.mock('@/services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import api from '@/services/api';

const mockCouple: Couple = {
  id: 'cpl1',
  name: 'Pareja Test',
  status: 'active',
  members: [
    {
      id: 'm1',
      userId: 'u1',
      name: 'Yo',
      email: 'yo@test.com',
      role: 'owner',
      joinedAt: '2024-01-01',
    },
    {
      id: 'm2',
      userId: 'u2',
      name: 'Pareja',
      email: 'pareja@test.com',
      role: 'member',
      joinedAt: '2024-01-01',
    },
  ],
};

const mockGoals: Goal[] = [
  {
    id: 'g1',
    coupleId: 'cpl1',
    title: 'Viaje',
    targetAmount: '2000',
    currentAmount: '500',
    deadline: '2024-12-31',
    status: 'active',
    createdBy: 'u1',
    createdAt: '2024-01-01',
    updatedAt: '2024-06-01',
  },
];

describe('useCouplesStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  // --- Couple CRUD ---

  it('fetchCouple loads couple data', async () => {
    (api.get as any).mockResolvedValue({ data: mockCouple });

    const store = useCouplesStore();
    await store.fetchCouple();

    expect(api.get).toHaveBeenCalledWith('/couples');
    expect(store.couple).toEqual(mockCouple);
    expect(store.loading).toBe(false);
  });

  it('fetchCouple sets couple to null on error (no couple yet)', async () => {
    (api.get as any).mockRejectedValue(new Error('not found'));

    const store = useCouplesStore();
    store.couple = mockCouple;
    await store.fetchCouple();

    expect(store.couple).toBeNull();
    expect(store.loading).toBe(false);
  });

  it('createCouple sets couple and returns it', async () => {
    (api.post as any).mockResolvedValue({ data: mockCouple });

    const store = useCouplesStore();
    const result = await store.createCouple({ name: 'Pareja Test' });

    expect(api.post).toHaveBeenCalledWith('/couples', { name: 'Pareja Test' });
    expect(store.couple).toEqual(mockCouple);
    expect(result).toEqual(mockCouple);
  });

  it('createCouple handles error', async () => {
    (api.post as any).mockRejectedValue({
      response: { data: { error: 'Error al crear' } },
    });

    const store = useCouplesStore();
    await expect(store.createCouple({ name: 'Test' })).rejects.toThrow();
    expect(store.error).toBe('Error al crear');
    expect(store.saving).toBe(false);
  });

  it('updateCouple updates couple', async () => {
    const updated = { ...mockCouple, name: 'Nuevo Nombre' };
    (api.patch as any).mockResolvedValue({ data: updated });

    const store = useCouplesStore();
    store.couple = { ...mockCouple };
    const result = await store.updateCouple({ name: 'Nuevo Nombre' });

    expect(api.patch).toHaveBeenCalledWith('/couples/cpl1', { name: 'Nuevo Nombre' });
    expect(store.couple).toEqual(updated);
    expect(result).toEqual(updated);
  });

  it('updateCouple does nothing when no couple exists', async () => {
    const store = useCouplesStore();
    store.couple = null;

    const result = await store.updateCouple({ name: 'X' });

    expect(result).toBeUndefined();
    expect(api.patch).not.toHaveBeenCalled();
  });

  it('updateCouple handles error', async () => {
    (api.patch as any).mockRejectedValue({
      response: { data: { error: 'Error al actualizar' } },
    });

    const store = useCouplesStore();
    store.couple = { ...mockCouple };
    await expect(store.updateCouple({ name: 'X' })).rejects.toThrow();
    expect(store.error).toBe('Error al actualizar');
  });

  it('invitePartner sends invitation', async () => {
    (api.post as any).mockResolvedValue({});

    const store = useCouplesStore();
    store.couple = { ...mockCouple };
    await store.invitePartner('invitado@test.com');

    expect(api.post).toHaveBeenCalledWith('/couples/cpl1/invite', {
      email: 'invitado@test.com',
    });
  });

  it('invitePartner does nothing when no couple', async () => {
    const store = useCouplesStore();
    store.couple = null;
    await store.invitePartner('x@test.com');

    expect(api.post).not.toHaveBeenCalled();
  });

  it('invitePartner handles error', async () => {
    (api.post as any).mockRejectedValue({
      response: { data: { error: 'Error al invitar' } },
    });

    const store = useCouplesStore();
    store.couple = { ...mockCouple };
    await expect(store.invitePartner('x@test.com')).rejects.toThrow();
    expect(store.error).toBe('Error al invitar');
  });

  it('joinCouple joins and sets couple', async () => {
    (api.post as any).mockResolvedValue({ data: mockCouple });

    const store = useCouplesStore();
    const result = await store.joinCouple('cpl_xyz');

    expect(api.post).toHaveBeenCalledWith('/couples/cpl_xyz/join');
    expect(store.couple).toEqual(mockCouple);
    expect(store.saving).toBe(false);
  });

  it('joinCouple handles error', async () => {
    (api.post as any).mockRejectedValue({
      response: { data: { error: 'Error al unirse' } },
    });

    const store = useCouplesStore();
    await expect(store.joinCouple('cpl_xyz')).rejects.toThrow();
    expect(store.error).toBe('Error al unirse');
  });

  it('leaveCouple clears couple and goals', async () => {
    (api.delete as any).mockResolvedValue({});

    const store = useCouplesStore();
    store.couple = { ...mockCouple };
    store.goals = [...mockGoals];
    await store.leaveCouple();

    expect(api.delete).toHaveBeenCalledWith('/couples/cpl1/leave');
    expect(store.couple).toBeNull();
    expect(store.goals).toEqual([]);
  });

  it('leaveCouple does nothing when no couple', async () => {
    const store = useCouplesStore();
    store.couple = null;
    await store.leaveCouple();

    expect(api.delete).not.toHaveBeenCalled();
  });

  it('leaveCouple handles error', async () => {
    (api.delete as any).mockRejectedValue({
      response: { data: { error: 'Error al abandonar' } },
    });

    const store = useCouplesStore();
    store.couple = { ...mockCouple };
    await expect(store.leaveCouple()).rejects.toThrow();
    expect(store.error).toBe('Error al abandonar');
  });

  it('dissolveCouple clears couple and goals', async () => {
    (api.delete as any).mockResolvedValue({});

    const store = useCouplesStore();
    store.couple = { ...mockCouple };
    store.goals = [...mockGoals];
    await store.dissolveCouple();

    expect(api.delete).toHaveBeenCalledWith('/couples/cpl1');
    expect(store.couple).toBeNull();
    expect(store.goals).toEqual([]);
  });

  it('dissolveCouple handles error', async () => {
    (api.delete as any).mockRejectedValue({
      response: { data: { error: 'Error al disolver' } },
    });

    const store = useCouplesStore();
    store.couple = { ...mockCouple };
    await expect(store.dissolveCouple()).rejects.toThrow();
    expect(store.error).toBe('Error al disolver');
  });

  it('dissolveCouple does nothing when no couple', async () => {
    const store = useCouplesStore();
    store.couple = null;
    await store.dissolveCouple();

    expect(api.delete).not.toHaveBeenCalled();
  });

  // --- Goals ---

  it('fetchGoals loads goals', async () => {
    (api.get as any).mockResolvedValue({ data: mockGoals });

    const store = useCouplesStore();
    store.couple = { ...mockCouple };
    await store.fetchGoals();

    expect(api.get).toHaveBeenCalledWith('/couples/cpl1/goals');
    expect(store.goals).toEqual(mockGoals);
  });

  it('fetchGoals does nothing when no couple', async () => {
    const store = useCouplesStore();
    store.couple = null;
    await store.fetchGoals();

    expect(api.get).not.toHaveBeenCalled();
  });

  it('fetchGoals handles error', async () => {
    (api.get as any).mockRejectedValue({
      response: { data: { error: 'Error metas' } },
    });

    const store = useCouplesStore();
    store.couple = { ...mockCouple };
    await store.fetchGoals();

    expect(store.error).toBe('Error metas');
  });

  it('createGoal adds goal to list', async () => {
    const newGoal: Goal = {
      id: 'g2',
      coupleId: 'cpl1',
      title: 'Ahorro',
      targetAmount: '5000',
      currentAmount: '0',
      deadline: null,
      status: 'active',
      createdBy: 'u1',
      createdAt: '2024-07-01',
      updatedAt: '2024-07-01',
    };
    (api.post as any).mockResolvedValue({ data: newGoal });

    const store = useCouplesStore();
    store.couple = { ...mockCouple };
    const result = await store.createGoal({ title: 'Ahorro', targetAmount: '5000' });

    expect(api.post).toHaveBeenCalledWith('/couples/cpl1/goals', {
      title: 'Ahorro',
      targetAmount: '5000',
    });
    expect(store.goals).toContainEqual(newGoal);
    expect(result).toEqual(newGoal);
  });

  it('createGoal does nothing when no couple', async () => {
    const store = useCouplesStore();
    store.couple = null;

    const result = await store.createGoal({ title: 'X', targetAmount: '100' });
    expect(result).toBeUndefined();
    expect(api.post).not.toHaveBeenCalled();
  });

  it('updateGoal updates goal in list', async () => {
    const updated = { ...mockGoals[0], targetAmount: '3000' };
    (api.patch as any).mockResolvedValue({ data: updated });

    const store = useCouplesStore();
    store.couple = { ...mockCouple };
    store.goals = [...mockGoals];

    await store.updateGoal('g1', { targetAmount: '3000' });

    expect(api.patch).toHaveBeenCalledWith('/couples/cpl1/goals/g1', { targetAmount: '3000' });
    expect(store.goals[0].targetAmount).toBe('3000');
  });

  it('updateGoal does nothing when no couple', async () => {
    const store = useCouplesStore();
    store.couple = null;

    const result = await store.updateGoal('g1', { title: 'X' });
    expect(result).toBeUndefined();
    expect(api.patch).not.toHaveBeenCalled();
  });

  it('deleteGoal removes goal from list', async () => {
    (api.delete as any).mockResolvedValue({});

    const store = useCouplesStore();
    store.couple = { ...mockCouple };
    store.goals = [...mockGoals];

    await store.deleteGoal('g1');

    expect(api.delete).toHaveBeenCalledWith('/couples/cpl1/goals/g1');
    expect(store.goals).toHaveLength(0);
  });

  it('deleteGoal handles error', async () => {
    (api.delete as any).mockRejectedValue({
      response: { data: { error: 'Error al eliminar' } },
    });

    const store = useCouplesStore();
    store.couple = { ...mockCouple };
    store.goals = [...mockGoals];

    await expect(store.deleteGoal('g1')).rejects.toThrow();
    expect(store.error).toBe('Error al eliminar');
  });

  it('contributeToGoal calls POST and refetches goals', async () => {
    (api.post as any).mockResolvedValue({});
    (api.get as any).mockResolvedValue({ data: mockGoals });

    const store = useCouplesStore();
    store.couple = { ...mockCouple };

    await store.contributeToGoal('g1', { amount: '200', date: '2024-07-01' });

    expect(api.post).toHaveBeenCalledWith('/couples/cpl1/goals/g1/contribute', {
      amount: '200',
      date: '2024-07-01',
    });
    expect(api.get).toHaveBeenCalledWith('/couples/cpl1/goals');
  });
});
