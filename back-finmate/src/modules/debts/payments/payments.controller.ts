import { type Request, type Response, type NextFunction } from 'express';
import { createPaymentSchema } from './payments.schema.js';
import * as paymentsService from './payments.service.js';

export async function list(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { userId } = req as unknown as { userId: string };
    const debtId = req.params.debtId as string;
    const result = await paymentsService.list(debtId, userId);
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
    const debtId = req.params.debtId as string;
    const data = createPaymentSchema.parse(req.body);
    const result = await paymentsService.create(data, debtId, userId);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}
