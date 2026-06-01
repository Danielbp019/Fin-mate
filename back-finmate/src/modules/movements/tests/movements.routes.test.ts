import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';

vi.mock('../movements.repository.js');
vi.mock('../../categories/categories.repository.js');
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
vi.mock('../../../shared/database/connection.js', () => ({
  db: {
    select: vi.fn(),
  },
}));

const appPromise = import('../../../app.js').then((m) => m.default);

function createToken(): string {
  return jwt.sign({ sub: 'user-123' }, 'test-secret', { expiresIn: '1h' });
}

const mockMovement = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  userId: 'user-123',
  coupleId: null,
  categoryId: '660e8400-e29b-41d4-a716-446655440001',
  type: 'expense' as const,
  amount: '150.50',
  description: 'Compra de comida',
  movementDate: new Date('2026-06-01T12:00:00.000Z'),
  isShared: false,
  createdAt: new Date('2026-06-01T12:00:00.000Z'),
  updatedAt: new Date('2026-06-01T12:00:00.000Z'),
  deletedAt: null,
};

let app: Awaited<typeof appPromise>;
let movementsRepository: typeof import('../movements.repository.js');

beforeEach(async () => {
  vi.clearAllMocks();
  app = await appPromise;
  movementsRepository = await import('../movements.repository.js');
});

describe('authentication', () => {
  it('returns 401 when no token is provided', async () => {
    await request(app).get('/movements').expect(401);
  });
});

describe('GET /movements', () => {
  it('returns 200 with movements list', async () => {
    vi.mocked(movementsRepository.findByUser).mockResolvedValue([mockMovement]);
    vi.mocked(movementsRepository.countByUser).mockResolvedValue(1);

    const token = createToken();

    const res = await request(app)
      .get('/movements')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.pagination.total).toBe(1);
    expect(res.body.data[0].amount).toBe('150.50');
  });

  it('filters by type query param', async () => {
    vi.mocked(movementsRepository.findByUser).mockResolvedValue([mockMovement]);
    vi.mocked(movementsRepository.countByUser).mockResolvedValue(1);

    const token = createToken();

    const res = await request(app)
      .get('/movements?type=expense')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(movementsRepository.findByUser).toHaveBeenCalledWith(
      'user-123',
      expect.objectContaining({ type: 'expense' }),
    );
    expect(res.body.data).toBeInstanceOf(Array);
  });
});

describe('GET /movements/:id', () => {
  it('returns 200 with movement', async () => {
    vi.mocked(movementsRepository.findById).mockResolvedValue(mockMovement);

    const token = createToken();

    const res = await request(app)
      .get(`/movements/${mockMovement.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.amount).toBe('150.50');
  });

  it('returns 404 when not found', async () => {
    vi.mocked(movementsRepository.findById).mockResolvedValue(null as never);

    const token = createToken();

    const res = await request(app)
      .get('/movements/550e8400-e29b-41d4-a716-446655440099')
      .set('Authorization', `Bearer ${token}`)
      .expect(404);

    expect(res.body.error).toBe('Movimiento no encontrado');
  });
});

describe('POST /movements', () => {
  it('returns 201 with created movement', async () => {
    const dbMock = (await import('../../../shared/database/connection.js')).db;
    (dbMock.select as ReturnType<typeof vi.fn>).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([{ id: mockMovement.categoryId }]),
        }),
      }),
    });

    vi.mocked(movementsRepository.create).mockResolvedValue(undefined as never);

    const token = createToken();

    const res = await request(app)
      .post('/movements')
      .set('Authorization', `Bearer ${token}`)
      .send({
        categoryId: mockMovement.categoryId,
        type: 'expense',
        amount: '150.50',
        movementDate: '2026-06-01T12:00:00.000Z',
      })
      .expect(201);

    expect(res.body.amount).toBe('150.50');
    expect(res.body.type).toBe('expense');
  });

  it('returns 400 for invalid body', async () => {
    const token = createToken();

    const res = await request(app)
      .post('/movements')
      .set('Authorization', `Bearer ${token}`)
      .send({ type: 'invalid', amount: 'abc' })
      .expect(400);

    const expected = 'Datos inv' + String.fromCharCode(225) + 'lidos';
    expect(res.body.error).toBe(expected);
  });
});

describe('PATCH /movements/:id', () => {
  it('returns 200 with updated movement', async () => {
    vi.mocked(movementsRepository.findById)
      .mockResolvedValueOnce(mockMovement)
      .mockResolvedValueOnce({ ...mockMovement, amount: '200.00' });
    vi.mocked(movementsRepository.update).mockResolvedValue(undefined as never);

    const token = createToken();

    const res = await request(app)
      .patch(`/movements/${mockMovement.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ amount: '200.00' })
      .expect(200);

    expect(res.body.amount).toBe('200.00');
  });

  it('returns 404 when not found', async () => {
    vi.mocked(movementsRepository.findById).mockResolvedValue(null as never);

    const token = createToken();

    const res = await request(app)
      .patch('/movements/550e8400-e29b-41d4-a716-446655440099')
      .set('Authorization', `Bearer ${token}`)
      .send({ amount: '100' })
      .expect(404);

    expect(res.body.error).toBe('Movimiento no encontrado');
  });
});

describe('DELETE /movements/:id', () => {
  it('returns 204 when deleted successfully', async () => {
    vi.mocked(movementsRepository.findById).mockResolvedValue(mockMovement);
    vi.mocked(movementsRepository.softDelete).mockResolvedValue(undefined as never);

    const token = createToken();

    await request(app)
      .delete(`/movements/${mockMovement.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204);
  });

  it('returns 404 when not found', async () => {
    vi.mocked(movementsRepository.findById).mockResolvedValue(null as never);

    const token = createToken();

    const res = await request(app)
      .delete('/movements/550e8400-e29b-41d4-a716-446655440099')
      .set('Authorization', `Bearer ${token}`)
      .expect(404);

    expect(res.body.error).toBe('Movimiento no encontrado');
  });
});
