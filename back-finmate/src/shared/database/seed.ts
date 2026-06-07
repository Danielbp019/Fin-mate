import bcrypt from 'bcryptjs';
import { sql } from 'drizzle-orm';
import { db, pool } from './connection.js';
import {
  users,
  categories,
  refreshTokens,
  passwordResetTokens,
  movements,
  debts,
  debtPayments,
  couples,
  coupleMembers,
  coupleInvitations,
  coupleGoals,
  goalContributions,
} from './schema.js';

const d = (dateStr: string) => new Date(dateStr);

async function seed() {
  console.log('');
  console.log('Ejecutando seed...');
  console.log('');

  try {
    await db.execute(sql`SELECT 1`);
    console.log('  - Conexion a base de datos exitosa');
    console.log('');
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`Error de conexion: ${message}`);
    console.error('Verifica que las migraciones esten aplicadas con "npm run db:migrate"');
    console.error('');
    process.exit(1);
  }

  console.log('Limpiando datos existentes...');

  await db.delete(goalContributions);
  await db.delete(coupleGoals);
  await db.delete(debtPayments);
  await db.delete(debts);
  await db.delete(movements);
  await db.delete(coupleInvitations);
  await db.delete(coupleMembers);
  await db.delete(couples);
  await db.delete(passwordResetTokens);
  await db.delete(refreshTokens);
  await db.delete(categories);
  await db.delete(users);

  console.log('  - Datos existentes eliminados');
  console.log('');

  const passwordHash = await bcrypt.hash('123456', 10);
  const now = new Date();

  console.log('Insertando usuarios...');

  const user1Id = '10000000-0000-0000-0000-000000000001';
  const user2Id = '10000000-0000-0000-0000-000000000002';

  const testUsers = [
    {
      id: user1Id,
      name: 'Usuario Uno',
      email: 'user1@prueba.com',
      passwordHash,
      status: 'active' as const,
      emailVerifiedAt: now,
      createdAt: d('2026-01-15'),
      updatedAt: now,
    },
    {
      id: user2Id,
      name: 'Usuario Dos',
      email: 'user2@prueba.com',
      passwordHash,
      status: 'active' as const,
      emailVerifiedAt: now,
      createdAt: d('2026-02-20'),
      updatedAt: now,
    },
  ];

  await db.insert(users).values(testUsers);
  console.log('  - 2 usuarios insertados (user1@prueba.com, user2@prueba.com / 123456)');
  console.log('');

  console.log('Insertando categorias del sistema...');

  const salarioId = '20000000-0000-0000-0000-000000000001';
  const comidaId = '20000000-0000-0000-0000-000000000002';
  const transporteId = '20000000-0000-0000-0000-000000000003';
  const saludId = '20000000-0000-0000-0000-000000000004';
  const ahorroMetaId = '20000000-0000-0000-0000-000000000005';
  const devolucionMetaId = '20000000-0000-0000-0000-000000000006';

  const systemCategories = [
    {
      id: salarioId,
      userId: null,
      type: 'income' as const,
      name: 'Salario',
      icon: 'mdi-briefcase',
      isActive: true,
      isSystem: true,
      updatedAt: now,
    },
    {
      id: comidaId,
      userId: null,
      type: 'expense' as const,
      name: 'Comida',
      icon: 'mdi-food',
      isActive: true,
      isSystem: true,
      updatedAt: now,
    },
    {
      id: transporteId,
      userId: null,
      type: 'expense' as const,
      name: 'Transporte',
      icon: 'mdi-car',
      isActive: true,
      isSystem: true,
      updatedAt: now,
    },
    {
      id: saludId,
      userId: null,
      type: 'expense' as const,
      name: 'Salud',
      icon: 'mdi-heart-pulse',
      isActive: true,
      isSystem: true,
      updatedAt: now,
    },
    {
      id: ahorroMetaId,
      userId: null,
      type: 'expense' as const,
      name: 'Ahorro Meta de Pareja',
      icon: 'mdi-wallet',
      isActive: true,
      isSystem: true,
      updatedAt: now,
    },
    {
      id: devolucionMetaId,
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
  console.log('  - 6 categorias del sistema insertadas');
  console.log('');

  console.log('Insertando categorias de usuario...');

  const userCategories = [
    {
      id: '21000000-0000-0000-0000-000000000001',
      userId: user1Id,
      type: 'expense' as const,
      name: 'Entretenimiento',
      icon: 'mdi-gamepad-variant',
      isActive: true,
      isSystem: false,
      updatedAt: now,
    },
    {
      id: '21000000-0000-0000-0000-000000000002',
      userId: user1Id,
      type: 'expense' as const,
      name: 'Servicios',
      icon: 'mdi-home-lightning-bolt',
      isActive: true,
      isSystem: false,
      updatedAt: now,
    },
    {
      id: '21000000-0000-0000-0000-000000000003',
      userId: user2Id,
      type: 'income' as const,
      name: 'Freelance',
      icon: 'mdi-laptop',
      isActive: true,
      isSystem: false,
      updatedAt: now,
    },
    {
      id: '21000000-0000-0000-0000-000000000004',
      userId: user2Id,
      type: 'expense' as const,
      name: 'Ropa',
      icon: 'mdi-tshirt-crew',
      isActive: true,
      isSystem: false,
      updatedAt: now,
    },
  ];

  await db.insert(categories).values(userCategories);
  console.log('  - 4 categorias de usuario insertadas');
  console.log('');

  console.log('Insertando movimientos...');

  const movementsData = [
    {
      id: '30000000-0000-0000-0000-000000000001',
      userId: user1Id,
      coupleId: null,
      categoryId: salarioId,
      type: 'income' as const,
      amount: '4500.0000',
      description: 'Nomina Junio',
      movementDate: d('2026-06-01'),
      updatedAt: now,
    },
    {
      id: '30000000-0000-0000-0000-000000000002',
      userId: user1Id,
      coupleId: null,
      categoryId: comidaId,
      type: 'expense' as const,
      amount: '350.5000',
      description: 'Supermercado',
      movementDate: d('2026-06-03'),
      updatedAt: now,
    },
    {
      id: '30000000-0000-0000-0000-000000000003',
      userId: user1Id,
      coupleId: null,
      categoryId: transporteId,
      type: 'expense' as const,
      amount: '120.0000',
      description: 'Gasolina',
      movementDate: d('2026-06-05'),
      updatedAt: now,
    },
    {
      id: '30000000-0000-0000-0000-000000000004',
      userId: user1Id,
      coupleId: null,
      categoryId: comidaId,
      type: 'expense' as const,
      amount: '85.0000',
      description: 'Restaurante',
      movementDate: d('2026-06-10'),
      updatedAt: now,
    },
    {
      id: '30000000-0000-0000-0000-000000000005',
      userId: user1Id,
      coupleId: null,
      categoryId: '21000000-0000-0000-0000-000000000001',
      type: 'expense' as const,
      amount: '200.0000',
      description: 'Cine y cena',
      movementDate: d('2026-06-12'),
      updatedAt: now,
    },
    {
      id: '30000000-0000-0000-0000-000000000006',
      userId: user1Id,
      coupleId: null,
      categoryId: salarioId,
      type: 'income' as const,
      amount: '4500.0000',
      description: 'Nomina Mayo',
      movementDate: d('2026-05-01'),
      updatedAt: now,
    },
    {
      id: '30000000-0000-0000-0000-000000000007',
      userId: user1Id,
      coupleId: null,
      categoryId: comidaId,
      type: 'expense' as const,
      amount: '420.0000',
      description: 'Supermercado',
      movementDate: d('2026-05-07'),
      updatedAt: now,
    },
    {
      id: '30000000-0000-0000-0000-000000000008',
      userId: user1Id,
      coupleId: null,
      categoryId: saludId,
      type: 'expense' as const,
      amount: '200.0000',
      description: 'Farmacia',
      movementDate: d('2026-05-15'),
      updatedAt: now,
    },
    {
      id: '30000000-0000-0000-0000-000000000009',
      userId: user1Id,
      coupleId: null,
      categoryId: transporteId,
      type: 'expense' as const,
      amount: '100.0000',
      description: 'Uber',
      movementDate: d('2026-05-20'),
      updatedAt: now,
    },
    {
      id: '30000000-0000-0000-0000-000000000010',
      userId: user1Id,
      coupleId: null,
      categoryId: '21000000-0000-0000-0000-000000000002',
      type: 'expense' as const,
      amount: '180.0000',
      description: 'Luz y agua',
      movementDate: d('2026-05-10'),
      updatedAt: now,
    },
    {
      id: '30000000-0000-0000-0000-000000000011',
      userId: user2Id,
      coupleId: null,
      categoryId: salarioId,
      type: 'income' as const,
      amount: '3200.0000',
      description: 'Nomina Junio',
      movementDate: d('2026-06-01'),
      updatedAt: now,
    },
    {
      id: '30000000-0000-0000-0000-000000000012',
      userId: user2Id,
      coupleId: null,
      categoryId: comidaId,
      type: 'expense' as const,
      amount: '280.0000',
      description: 'Restaurante',
      movementDate: d('2026-06-04'),
      updatedAt: now,
    },
    {
      id: '30000000-0000-0000-0000-000000000013',
      userId: user2Id,
      coupleId: null,
      categoryId: saludId,
      type: 'expense' as const,
      amount: '150.0000',
      description: 'Consulta medica',
      movementDate: d('2026-06-08'),
      updatedAt: now,
    },
    {
      id: '30000000-0000-0000-0000-000000000014',
      userId: user2Id,
      coupleId: null,
      categoryId: salarioId,
      type: 'income' as const,
      amount: '3200.0000',
      description: 'Nomina Mayo',
      movementDate: d('2026-05-01'),
      updatedAt: now,
    },
    {
      id: '30000000-0000-0000-0000-000000000015',
      userId: user2Id,
      coupleId: null,
      categoryId: '21000000-0000-0000-0000-000000000003',
      type: 'income' as const,
      amount: '1500.0000',
      description: 'Proyecto web freelance',
      movementDate: d('2026-05-25'),
      updatedAt: now,
    },
    {
      id: '30000000-0000-0000-0000-000000000016',
      userId: user2Id,
      coupleId: null,
      categoryId: '21000000-0000-0000-0000-000000000004',
      type: 'expense' as const,
      amount: '450.0000',
      description: 'Compra ropa',
      movementDate: d('2026-05-18'),
      updatedAt: now,
    },
  ];

  await db.insert(movements).values(movementsData);
  console.log(`  - ${movementsData.length} movimientos insertados`);
  console.log('');

  console.log('Insertando deudas...');

  const debt1Id = '40000000-0000-0000-0000-000000000001';
  const debt2Id = '40000000-0000-0000-0000-000000000002';
  const debt3Id = '40000000-0000-0000-0000-000000000003';
  const debt4Id = '40000000-0000-0000-0000-000000000004';

  const debtsData = [
    {
      id: debt1Id,
      userId: user1Id,
      coupleId: null,
      title: 'Tarjeta de Credito',
      description: 'Deuda de tarjeta de credito Banorte',
      initialAmount: '15000.0000',
      currentAmount: '8500.0000',
      interestRate: '3.5000',
      minimumPayment: '800.0000',
      dueDay: 15,
      priority: 'high' as const,
      status: 'pending' as const,
      startDate: d('2026-01-15'),
      updatedAt: now,
    },
    {
      id: debt2Id,
      userId: user1Id,
      coupleId: null,
      title: 'Prestamo Personal',
      description: 'Prestamo para renovacion de casa',
      initialAmount: '50000.0000',
      currentAmount: '35000.0000',
      interestRate: '1.2000',
      minimumPayment: '2500.0000',
      dueDay: 10,
      priority: 'medium' as const,
      status: 'pending' as const,
      startDate: d('2026-03-01'),
      updatedAt: now,
    },
    {
      id: debt3Id,
      userId: user2Id,
      coupleId: null,
      title: 'Deuda Colegiatura',
      description: 'Curso de especializacion',
      initialAmount: '25000.0000',
      currentAmount: '18000.0000',
      interestRate: '0.5000',
      minimumPayment: '1500.0000',
      dueDay: 20,
      priority: 'high' as const,
      status: 'pending' as const,
      startDate: d('2026-02-01'),
      updatedAt: now,
    },
    {
      id: debt4Id,
      userId: user2Id,
      coupleId: null,
      title: 'Prestamo Auto',
      description: 'Financiamiento Honda Civic',
      initialAmount: '120000.0000',
      currentAmount: '95000.0000',
      interestRate: '2.0000',
      minimumPayment: '4000.0000',
      dueDay: 5,
      priority: 'medium' as const,
      status: 'pending' as const,
      startDate: d('2026-01-05'),
      updatedAt: now,
    },
  ];

  await db.insert(debts).values(debtsData);
  console.log(`  - ${debtsData.length} deudas insertadas`);
  console.log('');

  console.log('Insertando pagos de deudas...');

  const debtPaymentsData = [
    {
      id: '50000000-0000-0000-0000-000000000001',
      debtId: debt1Id,
      userId: user1Id,
      amount: '3000.0000',
      paymentDate: d('2026-05-20'),
      notes: 'Pago parcial mayo',
    },
    {
      id: '50000000-0000-0000-0000-000000000002',
      debtId: debt1Id,
      userId: user1Id,
      amount: '3500.0000',
      paymentDate: d('2026-06-15'),
      notes: 'Pago parcial junio',
    },
    {
      id: '50000000-0000-0000-0000-000000000003',
      debtId: debt2Id,
      userId: user1Id,
      amount: '15000.0000',
      paymentDate: d('2026-05-10'),
      notes: 'Abono a capital',
    },
    {
      id: '50000000-0000-0000-0000-000000000004',
      debtId: debt3Id,
      userId: user2Id,
      amount: '5000.0000',
      paymentDate: d('2026-05-22'),
      notes: 'Pago parcial colegiatura',
    },
    {
      id: '50000000-0000-0000-0000-000000000005',
      debtId: debt3Id,
      userId: user2Id,
      amount: '2000.0000',
      paymentDate: d('2026-06-18'),
      notes: 'Pago mensual junio',
    },
    {
      id: '50000000-0000-0000-0000-000000000006',
      debtId: debt4Id,
      userId: user2Id,
      amount: '25000.0000',
      paymentDate: d('2026-05-05'),
      notes: 'Enganche',
    },
  ];

  await db.insert(debtPayments).values(debtPaymentsData);
  console.log(`  - ${debtPaymentsData.length} pagos de deudas insertados`);
  console.log('');

  console.log('Insertando pareja...');

  const coupleId = '60000000-0000-0000-0000-000000000001';

  await db.insert(couples).values([
    {
      id: coupleId,
      createdBy: user1Id,
      name: 'Hogar Prueba',
      status: 'active',
      updatedAt: now,
    },
  ]);

  await db.insert(coupleMembers).values([
    {
      id: '70000000-0000-0000-0000-000000000001',
      coupleId,
      userId: user1Id,
      role: 'owner',
    },
    {
      id: '70000000-0000-0000-0000-000000000002',
      coupleId,
      userId: user2Id,
      role: 'member',
    },
  ]);

  console.log('  - 1 pareja creada con 2 miembros');
  console.log('');

  console.log('Insertando metas de pareja...');

  const goal1Id = '80000000-0000-0000-0000-000000000001';
  const goal2Id = '80000000-0000-0000-0000-000000000002';

  await db.insert(coupleGoals).values([
    {
      id: goal1Id,
      coupleId,
      title: 'Viaje a Fin de Ano',
      targetAmount: '30000.0000',
      currentAmount: '8000.0000',
      deadline: d('2026-12-31'),
      status: 'active',
      createdBy: user1Id,
      updatedAt: now,
    },
    {
      id: goal2Id,
      coupleId,
      title: 'Fondo de Emergencia',
      targetAmount: '15000.0000',
      currentAmount: '3000.0000',
      deadline: d('2026-09-30'),
      status: 'active',
      createdBy: user2Id,
      updatedAt: now,
    },
  ]);

  await db.insert(goalContributions).values([
    {
      id: '90000000-0000-0000-0000-000000000001',
      goalId: goal1Id,
      userId: user1Id,
      amount: '5000.0000',
      notes: 'Ahorro junio',
      date: d('2026-06-02'),
    },
    {
      id: '90000000-0000-0000-0000-000000000002',
      goalId: goal1Id,
      userId: user2Id,
      amount: '3000.0000',
      notes: 'Ahorro junio',
      date: d('2026-06-02'),
    },
    {
      id: '90000000-0000-0000-0000-000000000003',
      goalId: goal2Id,
      userId: user1Id,
      amount: '2000.0000',
      notes: 'Primera aportacion',
      date: d('2026-06-05'),
    },
    {
      id: '90000000-0000-0000-0000-000000000004',
      goalId: goal2Id,
      userId: user2Id,
      amount: '1000.0000',
      notes: 'Primera aportacion',
      date: d('2026-06-05'),
    },
  ]);

  console.log('  - 2 metas de pareja con 4 contribuciones insertadas');
  console.log('');

  const totalMovements = await db.$count(movements);
  const totalDebts = await db.$count(debts);
  const totalPayments = await db.$count(debtPayments);
  const totalCouples = await db.$count(couples);
  const totalGoals = await db.$count(coupleGoals);
  const totalContributions = await db.$count(goalContributions);
  const totalCategories = await db.$count(categories);
  const totalUsers = await db.$count(users);

  console.log('Resumen final:');
  console.log(`  - Usuarios: ${totalUsers}`);
  console.log(`  - Categorias: ${totalCategories}`);
  console.log(`  - Movimientos: ${totalMovements}`);
  console.log(`  - Deudas: ${totalDebts}`);
  console.log(`  - Pagos: ${totalPayments}`);
  console.log(`  - Parejas: ${totalCouples}`);
  console.log(`  - Metas: ${totalGoals}`);
  console.log(`  - Contribuciones: ${totalContributions}`);
  console.log('');
  console.log('Contrasena para todos los usuarios: 123456');
  console.log('');

  await pool.end();
  console.log('Conexion cerrada');
  console.log('');
}

seed().catch((err) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`Error en seed: ${message}`);
  console.error('');
  process.exit(1);
});
