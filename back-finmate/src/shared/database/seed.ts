import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { sql } from 'drizzle-orm';
import { db, pool } from './connection.js';
import { users, categories } from './schema.js';

async function seed() {
  console.log('');
  console.log('🌱 Ejecutando seed...');
  console.log('');

  try {
    await db.execute(sql`SELECT 1`);
    console.log('  ✔ Conexión a base de datos exitosa');
    console.log('');
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`  ✖ Error de conexión: ${message}`);
    console.error('    Verifica que las migraciones estén aplicadas con "npm run db:migrate"');
    console.error('');
    process.exit(1);
  }

  console.log('  🗑️  Limpiando datos existentes...');
  await db.delete(categories);
  await db.delete(users);
  console.log('  ✔ Datos existentes eliminados');
  console.log('');

  const passwordHash = await bcrypt.hash('123456', 10);
  const now = new Date();

  const testUsers = [
    {
      id: crypto.randomUUID(),
      name: 'Usuario 1',
      email: 'user1@prueba.com',
      passwordHash,
      status: 'active' as const,
      emailVerifiedAt: now,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      name: 'Usuario 2',
      email: 'user2@prueba.com',
      passwordHash,
      status: 'active' as const,
      emailVerifiedAt: now,
      createdAt: now,
      updatedAt: now,
    },
  ];

  await db.insert(users).values(testUsers);
  console.log('  ✔ 2 usuarios insertados');
  console.log('');

  const systemCategories = [
    {
      id: crypto.randomUUID(),
      userId: null,
      type: 'income' as const,
      name: 'Salario',
      icon: 'mdi-briefcase',
      isActive: true,
      isSystem: true,
      updatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      userId: null,
      type: 'expense' as const,
      name: 'Comida',
      icon: 'mdi-food',
      isActive: true,
      isSystem: true,
      updatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      userId: null,
      type: 'expense' as const,
      name: 'Transporte',
      icon: 'mdi-car',
      isActive: true,
      isSystem: true,
      updatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      userId: null,
      type: 'expense' as const,
      name: 'Salud',
      icon: 'mdi-heart-pulse',
      isActive: true,
      isSystem: true,
      updatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      userId: null,
      type: 'expense' as const,
      name: 'Ahorro Meta de Pareja',
      icon: 'mdi-wallet',
      isActive: true,
      isSystem: true,
      updatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      userId: null,
      type: 'income' as const,
      name: 'Devolucion Meta de Pareja',
      icon: 'mdi-cash-multiple',
      isActive: true,
      isSystem: true,
      updatedAt: now,
    },
  ];

  await db.insert(categories).values(systemCategories);
  console.log('  ✔ 6 categorías del sistema insertadas');
  console.log('');

  console.log('  ✅ Seed completado — 2 usuarios y 6 categorías del sistema creados');
  console.log('');

  await pool.end();
  console.log('  ✔ Conexión cerrada');
  console.log('');
}

seed().catch((err) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`  ✖ Error en seed: ${message}`);
  console.error('');
  process.exit(1);
});
