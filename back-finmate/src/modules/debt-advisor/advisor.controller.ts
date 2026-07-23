import type { Request, Response, NextFunction } from 'express';
import * as advisorService from './advisor.service.js';
import { advisorQuerySchema, debtPayoffQuerySchema } from './advisor.schema.js';

export async function getPlan(req: Request, res: Response, next: NextFunction) {
  try {
    const { monthlyExtraPayment } = advisorQuerySchema.parse(req.query);
    const plan = await advisorService.generatePlan(req.userId!, monthlyExtraPayment);
    res.json(plan);
  } catch (error) {
    next(error);
  }
}

export async function getDebtPlan(req: Request, res: Response, next: NextFunction) {
  try {
    const { monthlyPayment } = debtPayoffQuerySchema.parse(req.query);
    const plan = await advisorService.getDebtPayoffPlan(
      req.userId!,
      req.params.debtId,
      monthlyPayment,
    );
    res.json(plan);
  } catch (error) {
    next(error);
  }
}
