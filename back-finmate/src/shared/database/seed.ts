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
  const pagoDeudaId = '20000000-0000-0000-0000-000000000007';

  const systemCategories = [
    {
      id: salarioId,
      userId: null,
      type: 'income' as const,
      name: 'Salario',
      icon: 'mdi-briefcase',
      isSystem: true,
      updatedAt: now,
    },
    {
      id: comidaId,
      userId: null,
      type: 'expense' as const,
      name: 'Comida',
      icon: 'mdi-food',
      isSystem: true,
      updatedAt: now,
    },
    {
      id: transporteId,
      userId: null,
      type: 'expense' as const,
      name: 'Transporte',
      icon: 'mdi-car',
      isSystem: true,
      updatedAt: now,
    },
    {
      id: saludId,
      userId: null,
      type: 'expense' as const,
      name: 'Salud',
      icon: 'mdi-heart-pulse',
      isSystem: true,
      updatedAt: now,
    },
    {
      id: ahorroMetaId,
      userId: null,
      type: 'expense' as const,
      name: 'Ahorro Meta de Pareja',
      icon: 'mdi-wallet',
      isSystem: true,
      updatedAt: now,
    },
    {
      id: devolucionMetaId,
      userId: null,
      type: 'income' as const,
      name: 'Devolucion Meta de Pareja',
      icon: 'mdi-cash-multiple',
      isSystem: true,
      updatedAt: now,
    },
    {
      id: pagoDeudaId,
      userId: null,
      type: 'expense' as const,
      name: 'Pago de Deuda',
      icon: 'mdi-credit-card-check',
      isSystem: true,
      updatedAt: now,
    },
  ];

  await db.insert(categories).values(systemCategories);
  console.log('  - 7 categorias del sistema insertadas');
  console.log('');

  console.log('Insertando categorias de usuario...');

  const userCategories = [
    {
      id: '21000000-0000-0000-0000-000000000001',
      userId: user1Id,
      type: 'expense' as const,
      name: 'Entretenimiento',
      icon: 'mdi-gamepad-variant',
      isSystem: false,
      updatedAt: now,
    },
    {
      id: '21000000-0000-0000-0000-000000000002',
      userId: user1Id,
      type: 'expense' as const,
      name: 'Servicios',
      icon: 'mdi-home-lightning-bolt',
      isSystem: false,
      updatedAt: now,
    },
    {
      id: '21000000-0000-0000-0000-000000000003',
      userId: user2Id,
      type: 'income' as const,
      name: 'Freelance',
      icon: 'mdi-laptop',
      isSystem: false,
      updatedAt: now,
    },
    {
      id: '21000000-0000-0000-0000-000000000004',
      userId: user2Id,
      type: 'expense' as const,
      name: 'Ropa',
      icon: 'mdi-tshirt-crew',
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
      amount: '3500000.0000',
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
      amount: '280000.0000',
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
      amount: '95000.0000',
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
      amount: '68000.0000',
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
      amount: '160000.0000',
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
      amount: '3500000.0000',
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
      amount: '335000.0000',
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
      amount: '160000.0000',
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
      amount: '80000.0000',
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
      amount: '145000.0000',
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
      amount: '2500000.0000',
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
      amount: '225000.0000',
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
      amount: '120000.0000',
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
      amount: '2500000.0000',
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
      amount: '1200000.0000',
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
      amount: '360000.0000',
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
      initialAmount: '15000000.0000',
      currentAmount: '8500000.0000',
      interestRate: '3.5000',
      interestRateType: 'annual' as const,
      minimumPayment: '800000.0000',
      dueDate: d('2026-08-15'),
      priority: 'high' as const,
      status: 'pending' as const,
      startDate: d('2026-01-15'),
      endDate: d('2026-12-15'),
      updatedAt: now,
    },
    {
      id: debt2Id,
      userId: user1Id,
      coupleId: null,
      title: 'Prestamo Personal',
      description: 'Prestamo para renovacion de casa',
      initialAmount: '50000000.0000',
      currentAmount: '35000000.0000',
      interestRate: '1.2000',
      interestRateType: 'annual' as const,
      minimumPayment: '2500000.0000',
      dueDate: d('2026-09-10'),
      priority: 'medium' as const,
      status: 'pending' as const,
      startDate: d('2026-03-01'),
      endDate: d('2027-03-01'),
      updatedAt: now,
    },
    {
      id: debt3Id,
      userId: user2Id,
      coupleId: null,
      title: 'Deuda Colegiatura',
      description: 'Curso de especializacion',
      initialAmount: '25000000.0000',
      currentAmount: '18000000.0000',
      interestRate: '0.5000',
      interestRateType: 'monthly' as const,
      minimumPayment: '1500000.0000',
      dueDate: d('2026-08-20'),
      priority: 'high' as const,
      status: 'pending' as const,
      startDate: d('2026-02-01'),
      endDate: d('2026-11-20'),
      updatedAt: now,
    },
    {
      id: debt4Id,
      userId: user2Id,
      coupleId: null,
      title: 'Prestamo Auto',
      description: 'Financiamiento Honda Civic',
      initialAmount: '120000000.0000',
      currentAmount: '95000000.0000',
      interestRate: '2.0000',
      interestRateType: 'annual' as const,
      minimumPayment: '4000000.0000',
      dueDate: d('2026-08-05'),
      priority: 'medium' as const,
      status: 'pending' as const,
      startDate: d('2026-01-05'),
      endDate: d('2028-01-05'),
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
      amount: '3000000.0000',
      paymentDate: d('2026-05-20'),
      notes: 'Pago parcial mayo',
    },
    {
      id: '50000000-0000-0000-0000-000000000002',
      debtId: debt1Id,
      userId: user1Id,
      amount: '3500000.0000',
      paymentDate: d('2026-06-15'),
      notes: 'Pago parcial junio',
    },
    {
      id: '50000000-0000-0000-0000-000000000003',
      debtId: debt2Id,
      userId: user1Id,
      amount: '15000000.0000',
      paymentDate: d('2026-05-10'),
      notes: 'Abono a capital',
    },
    {
      id: '50000000-0000-0000-0000-000000000004',
      debtId: debt3Id,
      userId: user2Id,
      amount: '5000000.0000',
      paymentDate: d('2026-05-22'),
      notes: 'Pago parcial colegiatura',
    },
    {
      id: '50000000-0000-0000-0000-000000000005',
      debtId: debt3Id,
      userId: user2Id,
      amount: '2000000.0000',
      paymentDate: d('2026-06-18'),
      notes: 'Pago mensual junio',
    },
    {
      id: '50000000-0000-0000-0000-000000000006',
      debtId: debt4Id,
      userId: user2Id,
      amount: '25000000.0000',
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
      targetAmount: '30000000.0000',
      currentAmount: '8000000.0000',
      deadline: d('2026-12-31'),
      status: 'active',
      createdBy: user1Id,
      updatedAt: now,
    },
    {
      id: goal2Id,
      coupleId,
      title: 'Fondo de Emergencia',
      targetAmount: '15000000.0000',
      currentAmount: '3000000.0000',
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
      amount: '5000000.0000',
      notes: 'Ahorro junio',
      date: d('2026-06-02'),
    },
    {
      id: '90000000-0000-0000-0000-000000000002',
      goalId: goal1Id,
      userId: user2Id,
      amount: '3000000.0000',
      notes: 'Ahorro junio',
      date: d('2026-06-02'),
    },
    {
      id: '90000000-0000-0000-0000-000000000003',
      goalId: goal2Id,
      userId: user1Id,
      amount: '2000000.0000',
      notes: 'Primera aportacion',
      date: d('2026-06-05'),
    },
    {
      id: '90000000-0000-0000-0000-000000000004',
      goalId: goal2Id,
      userId: user2Id,
      amount: '1000000.0000',
      notes: 'Primera aportacion',
      date: d('2026-06-05'),
    },
  ]);

  console.log('  - 2 metas de pareja con 4 contribuciones insertadas');
  console.log('');

  console.log('Insertando movimientos automaticos para pagos y contribuciones...');

  const autoMovements = [
    // Debt payment movements
    {
      id: '30000000-0000-0000-0000-000000000021',
      userId: user1Id,
      coupleId: null,
      categoryId: pagoDeudaId,
      type: 'expense' as const,
      amount: '3000000.0000',
      description: 'Pago de deuda: Tarjeta de Credito',
      movementDate: d('2026-05-20'),
      referenceType: 'debt_payment',
      referenceId: '50000000-0000-0000-0000-000000000001',
      updatedAt: now,
    },
    {
      id: '30000000-0000-0000-0000-000000000022',
      userId: user1Id,
      coupleId: null,
      categoryId: pagoDeudaId,
      type: 'expense' as const,
      amount: '3500000.0000',
      description: 'Pago de deuda: Tarjeta de Credito',
      movementDate: d('2026-06-15'),
      referenceType: 'debt_payment',
      referenceId: '50000000-0000-0000-0000-000000000002',
      updatedAt: now,
    },
    {
      id: '30000000-0000-0000-0000-000000000023',
      userId: user1Id,
      coupleId: null,
      categoryId: pagoDeudaId,
      type: 'expense' as const,
      amount: '15000000.0000',
      description: 'Pago de deuda: Prestamo Personal',
      movementDate: d('2026-05-10'),
      referenceType: 'debt_payment',
      referenceId: '50000000-0000-0000-0000-000000000003',
      updatedAt: now,
    },
    {
      id: '30000000-0000-0000-0000-000000000024',
      userId: user2Id,
      coupleId: null,
      categoryId: pagoDeudaId,
      type: 'expense' as const,
      amount: '5000000.0000',
      description: 'Pago de deuda: Deuda Colegiatura',
      movementDate: d('2026-05-22'),
      referenceType: 'debt_payment',
      referenceId: '50000000-0000-0000-0000-000000000004',
      updatedAt: now,
    },
    {
      id: '30000000-0000-0000-0000-000000000025',
      userId: user2Id,
      coupleId: null,
      categoryId: pagoDeudaId,
      type: 'expense' as const,
      amount: '2000000.0000',
      description: 'Pago de deuda: Deuda Colegiatura',
      movementDate: d('2026-06-18'),
      referenceType: 'debt_payment',
      referenceId: '50000000-0000-0000-0000-000000000005',
      updatedAt: now,
    },
    {
      id: '30000000-0000-0000-0000-000000000026',
      userId: user2Id,
      coupleId: null,
      categoryId: pagoDeudaId,
      type: 'expense' as const,
      amount: '25000000.0000',
      description: 'Pago de deuda: Prestamo Auto',
      movementDate: d('2026-05-05'),
      referenceType: 'debt_payment',
      referenceId: '50000000-0000-0000-0000-000000000006',
      updatedAt: now,
    },
    // Goal contribution movements
    {
      id: '30000000-0000-0000-0000-000000000031',
      userId: user1Id,
      coupleId: coupleId,
      categoryId: ahorroMetaId,
      type: 'expense' as const,
      amount: '5000000.0000',
      description: 'Aporte a meta: Viaje a Fin de Ano',
      movementDate: d('2026-06-02'),
      referenceType: 'goal_contribution',
      referenceId: '90000000-0000-0000-0000-000000000001',
      updatedAt: now,
    },
    {
      id: '30000000-0000-0000-0000-000000000032',
      userId: user2Id,
      coupleId: coupleId,
      categoryId: ahorroMetaId,
      type: 'expense' as const,
      amount: '3000000.0000',
      description: 'Aporte a meta: Viaje a Fin de Ano',
      movementDate: d('2026-06-02'),
      referenceType: 'goal_contribution',
      referenceId: '90000000-0000-0000-0000-000000000002',
      updatedAt: now,
    },
    {
      id: '30000000-0000-0000-0000-000000000033',
      userId: user1Id,
      coupleId: coupleId,
      categoryId: ahorroMetaId,
      type: 'expense' as const,
      amount: '2000000.0000',
      description: 'Aporte a meta: Fondo de Emergencia',
      movementDate: d('2026-06-05'),
      referenceType: 'goal_contribution',
      referenceId: '90000000-0000-0000-0000-000000000003',
      updatedAt: now,
    },
    {
      id: '30000000-0000-0000-0000-000000000034',
      userId: user2Id,
      coupleId: coupleId,
      categoryId: ahorroMetaId,
      type: 'expense' as const,
      amount: '1000000.0000',
      description: 'Aporte a meta: Fondo de Emergencia',
      movementDate: d('2026-06-05'),
      referenceType: 'goal_contribution',
      referenceId: '90000000-0000-0000-0000-000000000004',
      updatedAt: now,
    },
  ];

  await db.insert(movements).values(autoMovements);
  console.log(`  - ${autoMovements.length} movimientos automaticos insertados`);
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
