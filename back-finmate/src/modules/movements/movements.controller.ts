import { type Request, type Response, type NextFunction } from 'express';
import {
  createMovementSchema,
  updateMovementSchema,
  movementListQuerySchema,
} from './movements.schema.js';
import * as movementsService from './movements.service.js';

export async function list(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { userId } = req as unknown as { userId: string };
    const query = movementListQuerySchema.parse(req.query);
    const result = await movementsService.list(userId, query);
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
    const result = await movementsService.getById(id, userId);
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
    const data = createMovementSchema.parse(req.body);
    const result = await movementsService.create(data, userId);
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
    const data = updateMovementSchema.parse(req.body);
    const result = await movementsService.update(id, data, userId);
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
    await movementsService.remove(id, userId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
