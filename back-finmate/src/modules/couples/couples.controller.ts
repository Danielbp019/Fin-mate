import { type Request, type Response, type NextFunction } from 'express';
import { createCoupleSchema, inviteSchema } from './couples.schema.js';
import * as couplesService from './couples.service.js';

export async function getMyCouple(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { userId } = req as unknown as { userId: string };
    const result = await couplesService.getMyCouple(userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req as unknown as { userId: string };
    const data = createCoupleSchema.parse(req.body);
    const result = await couplesService.create(data, userId);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function invite(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req as unknown as { userId: string };
    const coupleId = req.params.id as string;
    const data = inviteSchema.parse(req.body);
    const result = await couplesService.invite(coupleId, data.email, userId);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function join(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req as unknown as { userId: string };
    const coupleId = req.params.id as string;
    const result = await couplesService.join(coupleId, userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function leave(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req as unknown as { userId: string };
    const coupleId = req.params.id as string;
    await couplesService.leave(coupleId, userId);
    res.status(200).json({ message: 'Has abandonado el grupo' });
  } catch (error) {
    next(error);
  }
}

export async function dissolve(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { userId } = req as unknown as { userId: string };
    const coupleId = req.params.id as string;
    await couplesService.dissolve(coupleId, userId);
    res.status(200).json({ message: 'Grupo disuelto correctamente' });
  } catch (error) {
    next(error);
  }
}
