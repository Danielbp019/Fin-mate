import { Router } from 'express';
import { authMiddleware } from '../../shared/middlewares/auth.middleware.js';
import { getSummary } from './dashboard.controller.js';

const router = Router();

router.use(authMiddleware);

router.get('/summary', getSummary);

export default router;
