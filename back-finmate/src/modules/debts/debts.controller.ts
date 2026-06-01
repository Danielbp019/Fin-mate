import { type Request, type Response, type NextFunction } from 'express';
import {
  createDebtSchema,
  updateDebtSchema,
} from './debts.schema.js';
import * as debtsService from './debts.service.js';

export async function list(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { userId } = req as unknown as { userId: string };
    const query = req.query as { status?: string; priority?: string };
    const filters: { status?: 'pending' | 'paid' | 'overdue'; priority?: 'low' | 'medium' | 'high' } = {};
    if (query.status === 'pending' || query.status === 'paid' || query.status === 'overdue') {
      filters.status = query.status;
    }
    if (query.priority === 'low' || query.priority === 'medium' || query.priority === 'high') {
      filters.priority = query.priority;
    }
    const result = await debtsService.list(userId, filters);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getById(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { userId } = req as unknown as { userId: string };
    const id = req.params.id as string;
    const result = await debtsService.getById(id, userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function create(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { userId } = req as unknown as { userId: string };
    const data = createDebtSchema.parse(req.body);
    const result = await debtsService.create(data, userId);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function update(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { userId } = req as unknown as { userId: string };
    const id = req.params.id as string;
    const data = updateDebtSchema.parse(req.body);
    const result = await debtsService.update(id, data, userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function remove(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { userId } = req as unknown as { userId: string };
    const id = req.params.id as string;
    await debtsService.remove(id, userId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
