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

app.get('/', (_req, res) => {
  res.send('¡Hola Mundo!');
});

app.use(pingRouter);
app.use(authRouter);

// Rutas protegidas (requieren autenticación)
app.use('/categories', categoriesRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
