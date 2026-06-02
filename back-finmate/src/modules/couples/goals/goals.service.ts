import crypto from 'crypto';
import { AppError } from '../../../shared/errors/AppError.js';
import * as goalsRepository from './goals.repository.js';
import * as couplesRepository from '../couples.repository.js';
import { db } from '../../../shared/database/connection.js';
import { movements, categories } from '../../../shared/database/schema.js';
import { eq } from 'drizzle-orm';
import type {
  CreateGoalBody,
  UpdateGoalBody,
  ContributeBody,
  GoalResponse,
  ContributionResponse,
} from './goals.types.js';

const CATEGORY_AHORRO = 'Ahorro Meta de Pareja';
const CATEGORY_DEVOLUCION = 'Devolucion Meta de Pareja';

async function findCategoryIdByName(name: string): Promise<string> {
  const result = await db
    .select({ id: categories.id })
    .from(categories)
    .where(eq(categories.name, name))
    .limit(1);

  if (!result[0]) {
    throw new AppError(500, `Categoria del sistema "${name}" no encontrada`);
  }
  return result[0].id;
}

function toGoalResponse(
  goal: NonNullable<Awaited<ReturnType<typeof goalsRepository.findById>>>,
  contributions: ContributionResponse[],
): GoalResponse {
  const target = Number(goal.targetAmount);
  const current = Number(goal.currentAmount);
  const progressPercent =
    target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;

  return {
    id: goal.id,
    coupleId: goal.coupleId,
    title: goal.title,
    targetAmount: goal.targetAmount,
    currentAmount: goal.currentAmount,
    progressPercent,
    deadline: goal.deadline ? goal.deadline.toISOString() : null,
    status: goal.status,
    createdBy: goal.createdBy,
    createdAt: goal.createdAt.toISOString(),
    updatedAt: goal.updatedAt.toISOString(),
    contributions,
  };
}

export async function list(
  coupleId: string,
  userId: string,
): Promise<GoalResponse[]> {
  await assertMember(coupleId, userId);

  const goals = await goalsRepository.findByCouple(coupleId);
  const result: GoalResponse[] = [];

  for (const goal of goals) {
    const contributions = await goalsRepository.findContributionsByGoal(
      goal.id,
    );
    const mapped: ContributionResponse[] = contributions.map((c) => ({
      ...c,
      amount: c.amount,
      notes: c.notes,
      date: c.date.toISOString(),
      createdAt: c.createdAt.toISOString(),
    }));
    result.push(toGoalResponse(goal, mapped));
  }

  return result;
}

export async function create(
  data: CreateGoalBody,
  coupleId: string,
  userId: string,
): Promise<GoalResponse> {
  await assertMember(coupleId, userId);

  const now = new Date();
  const goal = {
    id: crypto.randomUUID(),
    coupleId,
    title: data.title,
    targetAmount: data.targetAmount,
    currentAmount: '0',
    deadline: data.deadline ? new Date(data.deadline) : null,
    status: 'active' as const,
    createdBy: userId,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };

  await goalsRepository.create(goal);

  return toGoalResponse(goal, []);
}

export async function update(
  goalId: string,
  data: UpdateGoalBody,
  coupleId: string,
  userId: string,
): Promise<GoalResponse> {
  const goal = await findGoalOwnedBy(goalId, coupleId, userId);

  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (data.title !== undefined) updateData.title = data.title;
  if (data.targetAmount !== undefined)
    updateData.targetAmount = data.targetAmount;
  if (data.deadline !== undefined) {
    updateData.deadline = data.deadline ? new Date(data.deadline) : null;
  }
  if (data.status !== undefined) updateData.status = data.status;

  await goalsRepository.update(goalId, updateData);

  const updated = await goalsRepository.findById(goalId);
  if (!updated) {
    throw new AppError(500, 'Error al actualizar la meta');
  }

  const contributions = await goalsRepository.findContributionsByGoal(goalId);
  const mapped: ContributionResponse[] = contributions.map((c) => ({
    ...c,
    amount: c.amount,
    notes: c.notes,
    date: c.date.toISOString(),
    createdAt: c.createdAt.toISOString(),
  }));

  return toGoalResponse(updated, mapped);
}

export async function remove(
  goalId: string,
  coupleId: string,
  userId: string,
): Promise<void> {
  await findGoalOwnedBy(goalId, coupleId, userId);
  await goalsRepository.softDelete(goalId);
}

export async function contribute(
  goalId: string,
  data: ContributeBody,
  coupleId: string,
  userId: string,
): Promise<ContributionResponse> {
  await assertMember(coupleId, userId);

  const goal = await goalsRepository.findById(goalId);
  if (!goal) {
    throw new AppError(404, 'Meta no encontrada');
  }
  if (goal.coupleId !== coupleId) {
    throw new AppError(404, 'Meta no encontrada en este grupo');
  }
  if (goal.status !== 'active') {
    throw new AppError(400, 'La meta no esta activa');
  }

  const now = new Date();
  const contributionDate = data.date ? new Date(data.date) : now;

  const contribution = {
    id: crypto.randomUUID(),
    goalId,
    userId,
    amount: data.amount,
    notes: data.notes ?? null,
    date: contributionDate,
    createdAt: now,
  };

  const newCurrent = Number(goal.currentAmount) + Number(data.amount);
  const newCurrentStr = newCurrent.toFixed(4);
  const newStatus =
    newCurrent >= Number(goal.targetAmount)
      ? ('completed' as const)
      : ('active' as const);

  const categoryId = await findCategoryIdByName(CATEGORY_AHORRO);

  const movement = {
    id: crypto.randomUUID(),
    userId,
    coupleId,
    categoryId,
    type: 'expense' as const,
    amount: data.amount,
    description: `Aporte a meta: ${goal.title}`,
    movementDate: contributionDate,
    createdAt: now,
    updatedAt: now,
  };

  await goalsRepository.createContribution(contribution);
  await db.insert(movements).values(movement);
  await goalsRepository.update(goalId, {
    currentAmount: newCurrentStr,
    status: newStatus,
    updatedAt: now,
  });

  return {
    id: contribution.id,
    goalId: contribution.goalId,
    userId: contribution.userId,
    userName: '',
    amount: contribution.amount,
    notes: contribution.notes,
    date: contribution.date.toISOString(),
    createdAt: contribution.createdAt.toISOString(),
  };
}

export async function cancelActiveGoalsOnDissolve(
  coupleId: string,
): Promise<void> {
  const activeGoals = await goalsRepository.findActiveByCouple(coupleId);

  for (const goal of activeGoals) {
    const currentAmount = Number(goal.currentAmount);
    if (currentAmount > 0) {
      const categoryId = await findCategoryIdByName(CATEGORY_DEVOLUCION);
      const now = new Date();

      const movement = {
        id: crypto.randomUUID(),
        userId: goal.createdBy,
        coupleId,
        categoryId,
        type: 'income' as const,
        amount: goal.currentAmount,
        description: `Devolucion por disolucion de meta: ${goal.title}`,
        movementDate: now,
        createdAt: now,
        updatedAt: now,
      };

      await db.insert(movements).values(movement);
    }

    await goalsRepository.update(goal.id, {
      status: 'cancelled',
      updatedAt: new Date(),
    });
  }
}

async function assertMember(coupleId: string, userId: string): Promise<void> {
  const member = await couplesRepository.findMemberByUserAndCouple(
    userId,
    coupleId,
  );
  if (!member) {
    throw new AppError(403, 'No eres miembro de este grupo');
  }
}

async function findGoalOwnedBy(
  goalId: string,
  coupleId: string,
  userId: string,
) {
  const goal = await goalsRepository.findById(goalId);
  if (!goal) {
    throw new AppError(404, 'Meta no encontrada');
  }
  if (goal.coupleId !== coupleId) {
    throw new AppError(404, 'Meta no encontrada en este grupo');
  }
  if (goal.createdBy !== userId) {
    throw new AppError(403, 'Solo el creador de la meta puede modificarla');
  }
  return goal;
}
