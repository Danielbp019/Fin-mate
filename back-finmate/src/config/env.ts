import 'dotenv/config';

export const env = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX) || 100,
  jwtSecret: process.env.JWT_SECRET || 'dev-jwt-secret',
  jwtExpiresInSeconds: Number(process.env.JWT_EXPIRES_IN_SECONDS) || 7200,
  tokenCleanupIntervalMs: Number(process.env.TOKEN_CLEANUP_INTERVAL_MS) || 3600000,
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    name: process.env.DB_NAME || 'finmate',
  },
};
