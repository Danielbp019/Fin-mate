import mysql from 'mysql2/promise';
import { env } from '../../config/env.js';

export async function cleanupExpiredTokens() {
  const conn = await mysql.createConnection({
    host: env.db.host,
    port: env.db.port,
    user: env.db.user,
    password: env.db.password,
    database: env.db.name,
  });

  await conn.execute(`
    DELETE FROM refresh_tokens
    WHERE expires_at < NOW()
       OR (revoked = 1 AND created_at < NOW() - INTERVAL 7 DAY)
  `);

  await conn.end();
}
