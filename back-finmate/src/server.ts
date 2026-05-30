import app from './app.js';
import { env } from './config/env.js';
import { cleanupExpiredTokens } from './shared/database/cleanup.js';

try {
  await cleanupExpiredTokens();
  console.log('Tokens expirados limpiados con exito');
} catch (err) {
  const message = err instanceof Error ? err.message : String(err);
  console.warn(`No se pudieron limpiar tokens expirados: ${message}`);
}

app.listen(env.port, () => {
  console.log(`Servidor corriendo en http://localhost:${env.port}`);
});
