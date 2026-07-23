import { Router } from 'express';
import { authMiddleware } from '../../shared/middlewares/auth.middleware.js';
import { getPlan, getDebtPlan } from './advisor.controller.js';

const router = Router();

router.use(authMiddleware);

router.get('/plan', getPlan);
router.get('/debt/:debtId', getDebtPlan);

export default router;
