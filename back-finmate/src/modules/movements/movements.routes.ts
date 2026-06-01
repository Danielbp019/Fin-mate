import { Router } from 'express';
import { authMiddleware } from '../../shared/middlewares/auth.middleware.js';
import { list, getById, create, update, remove } from './movements.controller.js';

const router = Router();

router.use(authMiddleware);

router.get('/', list);
router.get('/:id', getById);
router.post('/', create);
router.patch('/:id', update);
router.delete('/:id', remove);

export default router;
