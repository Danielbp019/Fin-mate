import { type Request, type Response, type NextFunction } from 'express';
import { createGoalSchema, updateGoalSchema, contributeSchema } from './goals.schema.js';
import * as goalsService from './goals.service.js';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req as unknown as { userId: string };
    const coupleId = req.params.coupleId as string;
    const result = await goalsService.list(coupleId, userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req as unknown as { userId: string };
    const coupleId = req.params.coupleId as string;
    const data = createGoalSchema.parse(req.body);
    const result = await goalsService.create(data, coupleId, userId);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req as unknown as { userId: string };
    const coupleId = req.params.coupleId as string;
    const goalId = req.params.id as string;
    const data = updateGoalSchema.parse(req.body);
    const result = await goalsService.update(goalId, data, coupleId, userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req as unknown as { userId: string };
    const coupleId = req.params.coupleId as string;
    const goalId = req.params.id as string;
    await goalsService.remove(goalId, coupleId, userId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function contribute(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req as unknown as { userId: string };
    const coupleId = req.params.coupleId as string;
    const goalId = req.params.id as string;
    const data = contributeSchema.parse(req.body);
    const result = await goalsService.contribute(goalId, data, coupleId, userId);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}
