import { Router } from 'express';
import { authMiddleware } from '../../../shared/middlewares/auth.middleware.js';
import { list, create } from './payments.controller.js';

const router = Router({ mergeParams: true });

router.use(authMiddleware);

router.get('/', list);
router.post('/', create);

export default router;
