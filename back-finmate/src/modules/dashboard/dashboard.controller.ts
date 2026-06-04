import { type Request, type Response, type NextFunction } from 'express';
import * as dashboardService from './dashboard.service.js';

export async function getSummary(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req as unknown as { userId: string };
    const result = await dashboardService.getSummary(userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
