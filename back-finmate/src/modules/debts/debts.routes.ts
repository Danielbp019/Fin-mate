import { Router } from 'express';
import { authMiddleware } from '../../shared/middlewares/auth.middleware.js';
import { list, getById, create, update, remove } from './debts.controller.js';
import paymentsRouter from './payments/payments.routes.js';

const router = Router();

router.use(authMiddleware);

router.get('/', list);
router.get('/:id', getById);
router.post('/', create);
router.patch('/:id', update);
router.delete('/:id', remove);

router.use('/:debtId/payments', paymentsRouter);

export default router;
