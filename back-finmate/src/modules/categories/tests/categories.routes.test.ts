import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';

vi.mock('../../auth/auth.repository.js');
vi.mock('../categories.repository.js');
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

function createOtherUserToken(): string {
  return jwt.sign({ sub: 'other-user' }, 'test-secret', { expiresIn: '1h' });
}

const mockCategory = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  userId: 'user-123',
  type: 'expense' as const,
  name: 'Comida',
  icon: 'food',
  isActive: true,
  isSystem: false,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  deletedAt: null,
};

let app: Awaited<typeof appPromise>;
let categoriesRepository: typeof import('../categories.repository.js');

beforeEach(async () => {
  vi.clearAllMocks();
  app = await appPromise;
  categoriesRepository = await import('../categories.repository.js');
});

describe('authentication', () => {
  it('returns 401 when no token is provided', async () => {
    await request(app).get('/categories').expect(401);
  });
});

describe('GET /categories', () => {
  it('returns 200 with categories list', async () => {
    vi.mocked(categoriesRepository.findByUser).mockResolvedValue([mockCategory] as any);

    const token = createToken();

    const res = await request(app)
      .get('/categories')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body).toBeInstanceOf(Array);
    expect(res.body[0].name).toBe('Comida');
  });

  it('filters by type query param', async () => {
    vi.mocked(categoriesRepository.findByUser).mockResolvedValue([mockCategory] as any);

    const token = createToken();

    const res = await request(app)
      .get('/categories?type=income')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(categoriesRepository.findByUser).toHaveBeenCalledWith('user-123', 'income');
    expect(res.body).toBeInstanceOf(Array);
  });

  it('returns 400 when type query param is invalid', async () => {
    const token = createToken();

    const res = await request(app)
      .get('/categories?type=invalid')
      .set('Authorization', `Bearer ${token}`)
      .expect(400);

    expect(res.body.error).toBe('El tipo debe ser income o expense');
  });
});

describe('GET /categories/:id', () => {
  it('returns 200 with category', async () => {
    vi.mocked(categoriesRepository.findById).mockResolvedValue(mockCategory as any);
    vi.mocked(categoriesRepository.findByNameAndUser).mockResolvedValue(null as any);

    const token = createToken();

    const res = await request(app)
      .get(`/categories/${mockCategory.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.name).toBe('Comida');
  });

  it('returns 404 when not found', async () => {
    vi.mocked(categoriesRepository.findById).mockResolvedValue(null as any);

    const token = createToken();

    const res = await request(app)
      .get('/categories/550e8400-e29b-41d4-a716-446655440001')
      .set('Authorization', `Bearer ${token}`)
      .expect(404);

    expect(res.body.error).toBe('Categoría no encontrada');
  });
});

describe('POST /categories', () => {
  it('returns 201 with created category', async () => {
    vi.mocked(categoriesRepository.findByNameAndUser).mockResolvedValue(null as any);

    const token = createToken();

    const res = await request(app)
      .post('/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Nueva categoría', type: 'expense' })
      .expect(201);

    expect(res.body.name).toBe('Nueva categoría');
    expect(res.body.type).toBe('expense');
  });

  it('returns 201 with icon when provided', async () => {
    vi.mocked(categoriesRepository.findByNameAndUser).mockResolvedValue(null as any);

    const token = createToken();

    const res = await request(app)
      .post('/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Trabajo', type: 'income', icon: 'mdi-briefcase' })
      .expect(201);

    expect(res.body.icon).toBe('mdi-briefcase');
  });

  it('returns 409 when name already exists', async () => {
    vi.mocked(categoriesRepository.findByNameAndUser).mockResolvedValue(mockCategory as any);

    const token = createToken();

    const res = await request(app)
      .post('/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Comida', type: 'expense' })
      .expect(409);

    expect(res.body.error).toBe('Ya tienes una categoría con ese nombre');
  });

  it('returns 400 for invalid body', async () => {
    const token = createToken();

    const res = await request(app)
      .post('/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: '', type: 'invalid' })
      .expect(400);

    expect(res.body.error).toBe('Datos inválidos');
  });
});

describe('PATCH /categories/:id', () => {
  it('returns 200 with updated category', async () => {
    vi.mocked(categoriesRepository.findById)
      .mockResolvedValueOnce(mockCategory as any)
      .mockResolvedValueOnce({ ...mockCategory, name: 'Actualizada' } as any);
    vi.mocked(categoriesRepository.findByNameAndUser).mockResolvedValue(null as any);

    const token = createToken();

    const res = await request(app)
      .patch(`/categories/${mockCategory.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Actualizada' })
      .expect(200);

    expect(res.body.name).toBe('Actualizada');
  });

  it('returns 403 when category is system', async () => {
    vi.mocked(categoriesRepository.findById).mockResolvedValue({
      ...mockCategory,
      isSystem: true,
      userId: null,
    } as any);

    const token = createToken();

    const res = await request(app)
      .patch(`/categories/${mockCategory.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Nuevo' })
      .expect(403);

    expect(res.body.error).toBe('No puedes modificar una categoría del sistema');
  });

  it('returns 404 when category not found', async () => {
    vi.mocked(categoriesRepository.findById).mockResolvedValue(null as any);

    const token = createToken();

    const res = await request(app)
      .patch(`/categories/${mockCategory.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Nuevo' })
      .expect(404);

    expect(res.body.error).toBe('Categoría no encontrada');
  });

  it('returns 404 when category not owned', async () => {
    vi.mocked(categoriesRepository.findById).mockResolvedValue(mockCategory as any);

    const token = createOtherUserToken();

    const res = await request(app)
      .patch(`/categories/${mockCategory.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Nuevo' })
      .expect(404);

    expect(res.body.error).toBe('Categoría no encontrada');
  });

  it('returns 409 when name conflicts', async () => {
    vi.mocked(categoriesRepository.findById).mockResolvedValue(mockCategory as any);
    vi.mocked(categoriesRepository.findByNameAndUser).mockResolvedValue({
      ...mockCategory,
      id: 'other-id',
    } as any);

    const token = createToken();

    const res = await request(app)
      .patch(`/categories/${mockCategory.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Comida duplicada' })
      .expect(409);

    expect(res.body.error).toBe('Ya tienes una categoría con ese nombre');
  });
});

describe('DELETE /categories/:id', () => {
  it('returns 204 when deleted successfully', async () => {
    vi.mocked(categoriesRepository.findById).mockResolvedValue(mockCategory as any);
    vi.mocked(categoriesRepository.countMovementsByCategory).mockResolvedValue(0);

    const token = createToken();

    await request(app)
      .delete(`/categories/${mockCategory.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204);
  });

  it('returns 409 when category has movements', async () => {
    vi.mocked(categoriesRepository.findById).mockResolvedValue(mockCategory as any);
    vi.mocked(categoriesRepository.countMovementsByCategory).mockResolvedValue(5);

    const token = createToken();

    const res = await request(app)
      .delete(`/categories/${mockCategory.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(409);

    expect(res.body.error).toBe('No puedes eliminar una categoría que tiene movimientos asociados');
  });

  it('returns 404 when category not found', async () => {
    vi.mocked(categoriesRepository.findById).mockResolvedValue(null as any);

    const token = createToken();

    const res = await request(app)
      .delete(`/categories/${mockCategory.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404);

    expect(res.body.error).toBe('Categoría no encontrada');
  });

  it('returns 404 when category not owned', async () => {
    vi.mocked(categoriesRepository.findById).mockResolvedValue(mockCategory as any);

    const token = createOtherUserToken();

    const res = await request(app)
      .delete(`/categories/${mockCategory.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404);

    expect(res.body.error).toBe('Categoría no encontrada');
  });

  it('returns 403 when category is system', async () => {
    vi.mocked(categoriesRepository.findById).mockResolvedValue({
      ...mockCategory,
      isSystem: true,
      userId: null,
    } as any);

    const token = createToken();

    const res = await request(app)
      .delete(`/categories/${mockCategory.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(403);

    expect(res.body.error).toBe('No puedes eliminar una categoría del sistema');
  });
});
