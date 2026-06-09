import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { rateLimit } from 'express-rate-limit';
import { errorHandler } from './shared/middlewares/errorHandler.js';
import { notFoundHandler } from './shared/middlewares/notFoundHandler.js';
import pingRouter from './modules/ping/ping.routes.js';
import authRouter from './modules/auth/auth.routes.js';
import categoriesRouter from './modules/categories/categories.routes.js';
import movementsRouter from './modules/movements/movements.routes.js';
import debtsRouter from './modules/debts/debts.routes.js';
import couplesRouter from './modules/couples/couples.routes.js';
import dashboardRouter from './modules/dashboard/dashboard.routes.js';
import { env } from './config/env.js';

const app = express();

const limiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  limit: env.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(helmet());
app.use(limiter);
app.use(
  cors({
    origin: env.frontendUrl,
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.use((req, _res, next) => {
  console.log(`[${new Date().toLocaleString('es-ES')}] ${req.method} ${req.originalUrl}`);
  next();
});

app.use(pingRouter);
app.use(authRouter);

// Rutas protegidas (requieren autenticación)
app.use('/categories', categoriesRouter);
app.use('/movements', movementsRouter);
app.use('/debts', debtsRouter);
app.use('/couples', couplesRouter);
app.use('/dashboard', dashboardRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
