import { Router } from 'express';
import { register, login, logout } from './auth.controller.js';

const router = Router();

router.post('/auth/register', register);
router.post('/auth/login', login);
router.post('/auth/logout', logout);

export default router;
