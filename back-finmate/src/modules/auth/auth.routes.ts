import { Router } from 'express';
import { authMiddleware } from '../../shared/middlewares/auth.middleware.js';
import {
  register,
  login,
  refresh,
  logout,
  logoutAll,
  updateProfile,
  changePassword,
} from './auth.controller.js';

const router = Router();

router.post('/auth/register', register);
router.post('/auth/login', login);
router.post('/auth/refresh', refresh);
router.post('/auth/logout', authMiddleware, logout);
router.post('/auth/logout-all', authMiddleware, logoutAll);
router.patch('/auth/profile', authMiddleware, updateProfile);
router.post('/auth/change-password', authMiddleware, changePassword);

export default router;
