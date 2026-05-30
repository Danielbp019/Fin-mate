import app from './app.js';
import { env } from './config/env.js';
import { startTokenCleanup } from './modules/auth/auth.cleanup.js';

startTokenCleanup();

app.listen(env.port, () => {
  console.log(`Servidor corriendo en http://localhost:${env.port}`);
});
