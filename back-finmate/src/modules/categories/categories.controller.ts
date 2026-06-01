import { type Request, type Response, type NextFunction } from 'express';
import {
  createCategorySchema,
  updateCategorySchema,
} from './categories.schema.js';
import * as categoriesService from './categories.service.js';
import type { AuthenticatedRequest } from '../auth/auth.types.js';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req as AuthenticatedRequest;
    const type = req.query.type as string | undefined;

    if (type && type !== 'income' && type !== 'expense') {
      res.status(400).json({ error: 'El tipo debe ser income o expense' });
      return;
    }

    const result = await categoriesService.list(userId, type);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req as AuthenticatedRequest;
    const id = req.params.id as string;
    const result = await categoriesService.getById(id, userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req as AuthenticatedRequest;
    const data = createCategorySchema.parse(req.body);
    const result = await categoriesService.create(data, userId);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req as AuthenticatedRequest;
    const id = req.params.id as string;
    const data = updateCategorySchema.parse(req.body);
    const result = await categoriesService.update(id, data, userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req as AuthenticatedRequest;
    const id = req.params.id as string;
    await categoriesService.remove(id, userId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
