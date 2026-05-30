import mysql from 'mysql2/promise';
import { execSync } from 'child_process';
import { env } from '../src/config/env.js';

async function migrate() {
  console.log('');
  console.log('🔍 Verificando conexión con MySQL...');
  console.log('');

  let connection;
  try {
    connection = await mysql.createConnection({
      host: env.db.host,
      port: env.db.port,
      user: env.db.user,
      password: env.db.password,
    });

    await connection.execute(
      `CREATE DATABASE IF NOT EXISTS \`${env.db.name}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    );
    console.log(`  ✔ Base de datos '${env.db.name}' verificada/creada correctamente`);
    console.log('');
    await connection.end();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`  ✖ Error al conectar con MySQL: ${message}`);
    console.error('    Verifica que MySQL/MariaDB esté corriendo y las credenciales en .env sean correctas');
    console.error('');
    process.exit(1);
  }

  console.log('📦 Aplicando migraciones pendientes...');
  console.log('');

  try {
    execSync('drizzle-kit migrate', { stdio: 'inherit' });
    console.log('');
    console.log('  ✔ Migraciones aplicadas correctamente');
    console.log('');
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`  ✖ Error al aplicar migraciones: ${message}`);
    console.error('');
    process.exit(1);
  }
}

migrate();
