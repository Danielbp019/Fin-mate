import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';

vi.mock('../debts.repository.js');
vi.mock('../../../config/env.js', () => ({
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

const appPromise = import('../../../app.js').then((m) => m.default);

function createToken(): string {
  return jwt.sign({ sub: 'user-123' }, 'test-secret', { expiresIn: '1h' });
}

const mockDebt = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  userId: 'user-123',
  coupleId: null,
  title: 'Tarjeta de credito',
  description: null,
  initialAmount: '5000.00',
  currentAmount: '5000.00',
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

let app: Awaited<typeof appPromise>;
let debtsRepository: typeof import('../debts.repository.js');

beforeEach(async () => {
  vi.clearAllMocks();
  app = await appPromise;
  debtsRepository = await import('../debts.repository.js');
});

describe('authentication', () => {
  it('returns 401 when no token is provided', async () => {
    await request(app).get('/debts').expect(401);
  });
});

describe('GET /debts', () => {
  it('returns 200 with debts list', async () => {
    vi.mocked(debtsRepository.findByUser).mockResolvedValue([mockDebt]);

    const token = createToken();

    const res = await request(app)
      .get('/debts')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body).toBeInstanceOf(Array);
    expect(res.body[0].title).toBe('Tarjeta de credito');
  });

  it('filters by status query param', async () => {
    vi.mocked(debtsRepository.findByUser).mockResolvedValue([mockDebt]);

    const token = createToken();

    await request(app)
      .get('/debts?status=pending')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(debtsRepository.findByUser).toHaveBeenCalledWith(
      'user-123',
      expect.objectContaining({ status: 'pending' }),
    );
  });
});

describe('GET /debts/:id', () => {
  it('returns 200 with debt', async () => {
    vi.mocked(debtsRepository.findById).mockResolvedValue(mockDebt);

    const token = createToken();

    const res = await request(app)
      .get(`/debts/${mockDebt.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.title).toBe('Tarjeta de credito');
  });

  it('returns 404 when not found', async () => {
    vi.mocked(debtsRepository.findById).mockResolvedValue(null as never);

    const token = createToken();

    const res = await request(app)
      .get('/debts/550e8400-e29b-41d4-a716-446655440099')
      .set('Authorization', `Bearer ${token}`)
      .expect(404);

    expect(res.body.error).toBe('Deuda no encontrada');
  });
});

describe('POST /debts', () => {
  it('returns 201 with created debt', async () => {
    vi.mocked(debtsRepository.create).mockResolvedValue(undefined as never);

    const token = createToken();

    const res = await request(app)
      .post('/debts')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Nueva deuda', initialAmount: '3000.00' })
      .expect(201);

    expect(res.body.title).toBe('Nueva deuda');
    expect(res.body.initialAmount).toBe('3000.00');
  });

  it('returns 400 for invalid body', async () => {
    const token = createToken();

    const res = await request(app)
      .post('/debts')
      .set('Authorization', `Bearer ${token}`)
      .send({ initialAmount: 'abc' })
      .expect(400);

    expect(res.body.error).toBeTruthy();
  });
});

describe('PATCH /debts/:id', () => {
  it('returns 200 with updated debt', async () => {
    vi.mocked(debtsRepository.findById)
      .mockResolvedValueOnce(mockDebt)
      .mockResolvedValueOnce({ ...mockDebt, currentAmount: '3000.00' });
    vi.mocked(debtsRepository.update).mockResolvedValue(undefined as never);

    const token = createToken();

    const res = await request(app)
      .patch(`/debts/${mockDebt.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ currentAmount: '3000.00' })
      .expect(200);

    expect(res.body.currentAmount).toBe('3000.00');
  });

  it('returns 404 when not found', async () => {
    vi.mocked(debtsRepository.findById).mockResolvedValue(null as never);

    const token = createToken();

    const res = await request(app)
      .patch('/debts/550e8400-e29b-41d4-a716-446655440099')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentAmount: '100' })
      .expect(404);

    expect(res.body.error).toBe('Deuda no encontrada');
  });
});

describe('DELETE /debts/:id', () => {
  it('returns 204 when deleted successfully', async () => {
    vi.mocked(debtsRepository.findById).mockResolvedValue(mockDebt);
    vi.mocked(debtsRepository.softDelete).mockResolvedValue(undefined as never);

    const token = createToken();

    await request(app)
      .delete(`/debts/${mockDebt.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204);
  });

  it('returns 404 when not found', async () => {
    vi.mocked(debtsRepository.findById).mockResolvedValue(null as never);

    const token = createToken();

    const res = await request(app)
      .delete('/debts/550e8400-e29b-41d4-a716-446655440099')
      .set('Authorization', `Bearer ${token}`)
      .expect(404);

    expect(res.body.error).toBe('Deuda no encontrada');
  });
});
