import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { db } from './connection.js';
import { users, categories } from './schema.js';

async function seed() {
  console.log('Ejecutando seed...');

  await db.delete(categories);
  await db.delete(users);

  const passwordHash = await bcrypt.hash('123456', 10);
  const now = new Date();

  const testUsers = [
    {
      id: crypto.randomUUID(),
      name: 'Usuario 1',
      email: 'user1@test.com',
      passwordHash,
      status: 'active' as const,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      name: 'Usuario 2',
      email: 'user2@test.com',
      passwordHash,
      status: 'active' as const,
      createdAt: now,
      updatedAt: now,
    },
  ];

  await db.insert(users).values(testUsers);

  const systemCategories = [
    {
      id: crypto.randomUUID(),
      userId: null,
      type: 'income' as const,
      name: 'Salario',
      sortOrder: '0',
      isActive: true,
      isSystem: true,
      updatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      userId: null,
      type: 'expense' as const,
      name: 'Comida',
      sortOrder: '0',
      isActive: true,
      isSystem: true,
      updatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      userId: null,
      type: 'expense' as const,
      name: 'Transporte',
      sortOrder: '0',
      isActive: true,
      isSystem: true,
      updatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      userId: null,
      type: 'expense' as const,
      name: 'Salud',
      sortOrder: '0',
      isActive: true,
      isSystem: true,
      updatedAt: now,
    },
  ];

  await db.insert(categories).values(systemCategories);
  console.log('Seed completado — 2 usuarios y 4 categorías del sistema creados');
}

seed().catch((err) => {
  console.error('Error en seed:', err);
  process.exit(1);
});
