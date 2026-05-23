import { Router } from 'express';
import { ping } from './ping.controller.js';

const router = Router();

router.get('/ping', ping);

export default router;
