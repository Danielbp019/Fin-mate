import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';

vi.mock('../couples.repository.js');
vi.mock('../../auth/auth.repository.js');
vi.mock('../goals/goals.service.js', () => ({
  cancelActiveGoalsOnDissolve: vi.fn(),
}));
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

let app: Awaited<typeof appPromise>;
let couplesRepository: typeof import('../couples.repository.js');

beforeEach(async () => {
  vi.clearAllMocks();
  app = await appPromise;
  couplesRepository = await import('../couples.repository.js');
});

describe('authentication', () => {
  it('returns 401 when no token is provided', async () => {
    await request(app).get('/couples').expect(401);
    await request(app).post('/couples').expect(401);
    await request(app).post('/couples/couple-123/invite').expect(401);
    await request(app).post('/couples/couple-123/join').expect(401);
  });
});

describe('GET /couples', () => {
  it('returns 200 with couple data', async () => {
    vi.mocked(couplesRepository.findActiveCoupleByUserId).mockResolvedValue({
      couple: {
        id: 'couple-123',
        name: 'Nuestro grupo',
        status: 'active',
        createdBy: 'user-123',
      },
      member: { id: 'member-1', userId: 'user-123', role: 'owner' },
    });
    vi.mocked(couplesRepository.findCoupleMembers).mockResolvedValue([
      {
        id: 'member-1',
        userId: 'user-123',
        name: 'User',
        email: 'user@test.com',
        role: 'owner',
        joinedAt: new Date(),
      },
    ]);

    const token = createToken();
    const res = await request(app)
      .get('/couples')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.id).toBe('couple-123');
    expect(res.body.members).toBeInstanceOf(Array);
  });
});

describe('POST /couples', () => {
  it('returns 201 with created couple', async () => {
    vi.mocked(couplesRepository.findActiveCoupleByUserId).mockResolvedValue(null);
    vi.mocked(couplesRepository.findCoupleMembers).mockResolvedValue([
      {
        id: 'member-1',
        userId: 'user-123',
        name: 'User',
        email: 'user@test.com',
        role: 'owner',
        joinedAt: new Date(),
      },
    ]);

    const token = createToken();
    const res = await request(app)
      .post('/couples')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Nuestro grupo' })
      .expect(201);

    expect(res.body.name).toBe('Nuestro grupo');
  });

  it('returns 400 for invalid body', async () => {
    const token = createToken();
    const res = await request(app)
      .post('/couples')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'A'.repeat(121) })
      .expect(400);

    expect(res.body.error).toBe('Datos inv' + String.fromCharCode(225) + 'lidos');
  });
});

describe('POST /couples/:id/invite', () => {
  it('returns 201 with invitation', async () => {
    vi.mocked(couplesRepository.findCoupleById).mockResolvedValue({
      id: 'couple-123',
      createdBy: 'user-123',
      status: 'active',
    });
    vi.mocked(couplesRepository.findMemberByUserAndCouple)
      .mockResolvedValueOnce({ role: 'owner' })
      .mockResolvedValueOnce(null);
    vi.mocked(couplesRepository.findUserByEmail).mockResolvedValue({
      id: 'invited-123',
      email: 'invited@test.com',
    });
    vi.mocked(couplesRepository.findActiveCoupleByUserId).mockResolvedValue(null);
    vi.mocked(couplesRepository.findPendingInvitation).mockResolvedValue(null);

    const token = createToken();
    const res = await request(app)
      .post('/couples/couple-123/invite')
      .set('Authorization', `Bearer ${token}`)
      .send({ email: 'invited@test.com' })
      .expect(201);

    expect(res.body.status).toBe('pending');
  });
});

describe('DELETE /couples/:id/leave', () => {
  it('returns 200 with message', async () => {
    vi.mocked(couplesRepository.findMemberByUserAndCouple).mockResolvedValue({
      id: 'member-1',
      userId: 'user-123',
      coupleId: 'couple-123',
      role: 'member',
    });

    const token = createToken();
    const res = await request(app)
      .delete('/couples/couple-123/leave')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.message).toBe('Has abandonado el grupo');
  });
});

describe('DELETE /couples/:id', () => {
  it('returns 200 when dissolved by owner', async () => {
    vi.mocked(couplesRepository.findCoupleById).mockResolvedValue({
      id: 'couple-123',
      createdBy: 'user-123',
      status: 'active',
    });
    vi.mocked(couplesRepository.findCoupleMembers).mockResolvedValue([]);

    const token = createToken();
    const res = await request(app)
      .delete('/couples/couple-123')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.message).toBe('Grupo disuelto correctamente');
  });
});
