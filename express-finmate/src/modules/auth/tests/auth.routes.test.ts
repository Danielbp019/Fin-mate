import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { env } from '../../../config/env.js';

vi.mock('../auth.repository.js');
vi.mock('bcryptjs');

const appPromise = import('../../../app.js').then((m) => m.default);

function createToken(): string {
  return jwt.sign({ userId: '550e8400-e29b-41d4-a716-446655440000' }, env.jwtSecret, {
    expiresIn: '1h',
  });
}

let app: Awaited<typeof appPromise>;
let authRepository: typeof import('../auth.repository.js');

beforeEach(async () => {
  vi.clearAllMocks();
  app = await appPromise;
  authRepository = await import('../auth.repository.js');
});

describe('POST /auth/register', () => {
  it('returns 201 with token for valid data', async () => {
    vi.mocked(authRepository.findUserByEmail).mockResolvedValue(null);

    const res = await request(app)
      .post('/auth/register')
      .send({ name: 'Juan Pérez', email: 'juan@example.com', password: '123456' })
      .expect(201);

    expect(res.body).toHaveProperty('token');
    expect(res.body.message).toBe('Usuario registrado exitosamente');
    expect(res.body.user.name).toBe('Juan Pérez');
  });

  it('returns 409 when email already exists', async () => {
    vi.mocked(authRepository.findUserByEmail).mockResolvedValue({
      id: 'existing-id',
      name: 'Existente',
      email: 'juan@example.com',
      passwordHash: 'hash',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });

    const res = await request(app)
      .post('/auth/register')
      .send({ name: 'Juan', email: 'juan@example.com', password: '123456' })
      .expect(409);

    expect(res.body.error).toBe('El correo electrónico ya está registrado');
  });

  it('returns 400 for invalid body', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ name: 'J', email: 'invalido', password: '12345' })
      .expect(400);

    expect(res.body.error).toBe('Datos inválidos');
    expect(res.body.details).toBeInstanceOf(Array);
  });
});

describe('POST /auth/login', () => {
  it('returns 200 with token for valid credentials', async () => {
    vi.mocked(authRepository.findUserByEmail).mockResolvedValue({
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Juan Pérez',
      email: 'juan@example.com',
      passwordHash: '$2a$10$hashedpassword',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'juan@example.com', password: '123456' })
      .expect(200);

    expect(res.body).toHaveProperty('token');
    expect(res.body.message).toBe('Inicio de sesión exitoso');
  });

  it('returns 401 when user not found', async () => {
    vi.mocked(authRepository.findUserByEmail).mockResolvedValue(null);

    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'unknown@example.com', password: '123456' })
      .expect(401);

    expect(res.body.error).toBe('Credenciales inválidas');
  });

  it('returns 401 for wrong password', async () => {
    vi.mocked(authRepository.findUserByEmail).mockResolvedValue({
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Juan Pérez',
      email: 'juan@example.com',
      passwordHash: '$2a$10$hashedpassword',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });
    vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'juan@example.com', password: 'wrong-password' })
      .expect(401);

    expect(res.body.error).toBe('Credenciales inválidas');
  });
});

describe('POST /auth/logout', () => {
  it('returns 200 when token is valid', async () => {
    vi.mocked(authRepository.findBlacklistedToken).mockResolvedValue(null);

    const token = createToken();

    const res = await request(app)
      .post('/auth/logout')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.message).toBe('Sesión cerrada exitosamente');
  });

  it('returns 401 when no token is provided', async () => {
    const res = await request(app)
      .post('/auth/logout')
      .expect(401);

    expect(res.body.error).toBe('Token no proporcionado');
  });

  it('returns 401 when token is blacklisted', async () => {
    vi.mocked(authRepository.findBlacklistedToken).mockResolvedValue({
      id: 'blacklisted-id',
      token: 'some-token',
      expiresAt: new Date(Date.now() + 3600000),
      createdAt: new Date(),
    });

    const token = createToken();

    const res = await request(app)
      .post('/auth/logout')
      .set('Authorization', `Bearer ${token}`)
      .expect(401);

    expect(res.body.error).toBe('Token inválido o expirado');
  });
});
