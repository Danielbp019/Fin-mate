import { Router } from 'express';
import { authMiddleware } from '../../../shared/middlewares/auth.middleware.js';
import { list, create, update, remove, contribute } from './goals.controller.js';

const router = Router({ mergeParams: true });

router.use(authMiddleware);

router.get('/', list);
router.post('/', create);
router.patch('/:id', update);
router.delete('/:id', remove);
router.post('/:id/contribute', contribute);

export default router;
