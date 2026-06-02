import { Router } from 'express';
import { authMiddleware } from '../../shared/middlewares/auth.middleware.js';
import {
  getMyCouple,
  create,
  invite,
  join,
  leave,
  dissolve,
} from './couples.controller.js';
import goalsRouter from './goals/goals.routes.js';

const router = Router();

router.use(authMiddleware);

router.get('/', getMyCouple);
router.post('/', create);
router.post('/:id/invite', invite);
router.post('/:id/join', join);
router.delete('/:id/leave', leave);
router.delete('/:id', dissolve);

router.use('/:coupleId/goals', goalsRouter);

export default router;
