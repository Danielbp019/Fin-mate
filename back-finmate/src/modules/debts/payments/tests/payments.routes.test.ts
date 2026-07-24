import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';

vi.mock('../../debts.repository.js');
vi.mock('../payments.repository.js');
vi.mock('../../../movements/movements.repository.js');
vi.mock('../../../../shared/database/connection.js', () => ({
  db: {
    select: vi.fn(),
  },
}));
vi.mock('../../../../config/env.js', () => ({
  env: {
    jwtSecret: 'test-secret',
    jwtExpiresInSeconds: 900,
    jwtRefreshExpiresInSeconds: 2592000,
    nodeEnv: 'test',
    frontendUrl: 'http://localhost:5173',
    rateLimitWindowMs: 900000,
    rateLimitMax: 100,
    db: {
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      name: 'finmate_test',
    },
  },
}));

const appPromise = import('../../../../app.js').then((m) => m.default);

function createToken(): string {
  return jwt.sign({ sub: 'user-123' }, 'test-secret', { expiresIn: '1h' });
}

const mockDebt = {
  id: 'debt-550e8400',
  userId: 'user-123',
  coupleId: null,
  title: 'Tarjeta de credito',
  description: null,
  initialAmount: '5000.00',
  currentAmount: '3000.00',
  interestRate: '0',
  interestRateType: 'annual',
  minimumPayment: '0',
  dueDate: null,
  priority: 'medium' as const,
  status: 'pending' as const,
  startDate: null,
  endDate: null,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  deletedAt: null,
};

const mockPayment = {
  id: 'pay-123',
  debtId: 'debt-550e8400',
  userId: 'user-123',
  amount: '500.00',
  paymentDate: new Date('2026-06-15T10:00:00.000Z'),
  notes: null,
  createdAt: new Date('2026-06-15T10:00:00.000Z'),
};

let app: Awaited<typeof appPromise>;
let debtsRepository: typeof import('../../debts.repository.js');
let paymentsRepository: typeof import('../payments.repository.js');

beforeEach(async () => {
  vi.clearAllMocks();
  app = await appPromise;
  debtsRepository = await import('../../debts.repository.js');
  paymentsRepository = await import('../payments.repository.js');
});

describe('authentication', () => {
  it('returns 401 when no token is provided', async () => {
    await request(app).get('/debts/debt-550e8400/payments').expect(401);
  });
});

describe('GET /debts/:debtId/payments', () => {
  it('returns 200 with payments list', async () => {
    vi.mocked(debtsRepository.findById).mockResolvedValue(mockDebt);
    vi.mocked(paymentsRepository.findByDebt).mockResolvedValue([mockPayment]);

    const token = createToken();

    const res = await request(app)
      .get('/debts/debt-550e8400/payments')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body).toBeInstanceOf(Array);
    expect(res.body[0].amount).toBe('500.00');
  });

  it('returns 404 when debt not found', async () => {
    vi.mocked(debtsRepository.findById).mockResolvedValue(null as never);

    const token = createToken();

    const res = await request(app)
      .get('/debts/debt-550e8400/payments')
      .set('Authorization', `Bearer ${token}`)
      .expect(404);

    expect(res.body.error).toBe('Deuda no encontrada');
  });
});

describe('POST /debts/:debtId/payments', () => {
  it('returns 201 with created payment', async () => {
    vi.mocked(debtsRepository.findById).mockResolvedValue(mockDebt);
    vi.mocked(paymentsRepository.create).mockResolvedValue(undefined as never);
    vi.mocked(debtsRepository.update).mockResolvedValue(undefined as never);

    const dbMock = (await import('../../../../shared/database/connection.js')).db;
    (dbMock.select as ReturnType<typeof vi.fn>).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([{ id: 'cat-pago-deuda' }]),
        }),
      }),
    });

    const movementsRepo = await import('../../../movements/movements.repository.js');
    vi.mocked(movementsRepo.create).mockResolvedValue(undefined as never);

    const token = createToken();

    const res = await request(app)
      .post('/debts/debt-550e8400/payments')
      .set('Authorization', `Bearer ${token}`)
      .send({ amount: '500.00', paymentDate: '2026-06-15T10:00:00.000Z' })
      .expect(201);

    expect(res.body.amount).toBe('500.00');
  });

  it('returns 400 for invalid body', async () => {
    const token = createToken();

    const res = await request(app)
      .post('/debts/debt-550e8400/payments')
      .set('Authorization', `Bearer ${token}`)
      .send({ amount: 'abc' })
      .expect(400);

    expect(res.body.error).toBeTruthy();
  });

  it('returns 400 when debt is already paid', async () => {
    vi.mocked(debtsRepository.findById).mockResolvedValue({
      ...mockDebt,
      status: 'paid' as const,
    });

    const token = createToken();

    const res = await request(app)
      .post('/debts/debt-550e8400/payments')
      .set('Authorization', `Bearer ${token}`)
      .send({ amount: '500.00', paymentDate: '2026-06-15T10:00:00.000Z' })
      .expect(400);

    expect(res.body.error).toBe('La deuda ya esta pagada');
  });

  it('returns 404 when debt not found', async () => {
    vi.mocked(debtsRepository.findById).mockResolvedValue(null as never);

    const token = createToken();

    const res = await request(app)
      .post('/debts/debt-550e8400/payments')
      .set('Authorization', `Bearer ${token}`)
      .send({ amount: '500.00', paymentDate: '2026-06-15T10:00:00.000Z' })
      .expect(404);

    expect(res.body.error).toBe('Deuda no encontrada');
  });
});
