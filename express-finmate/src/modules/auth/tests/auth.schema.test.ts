import { describe, it, expect } from 'vitest';
import { registerSchema, loginSchema } from '../auth.schema.js';

describe('registerSchema', () => {
  it('accepts valid data', () => {
    const result = registerSchema.parse({
      name: 'Juan Pérez',
      email: 'juan@example.com',
      password: '123456',
    });
    expect(result).toEqual({
      name: 'Juan Pérez',
      email: 'juan@example.com',
      password: '123456',
    });
  });

  it('rejects name shorter than 2 characters', () => {
    expect(() =>
      registerSchema.parse({ name: 'A', email: 'a@b.com', password: '123456' }),
    ).toThrow();
  });

  it('rejects name longer than 120 characters', () => {
    expect(() =>
      registerSchema.parse({
        name: 'A'.repeat(121),
        email: 'a@b.com',
        password: '123456',
      }),
    ).toThrow();
  });

  it('rejects invalid email', () => {
    expect(() =>
      registerSchema.parse({ name: 'Juan', email: 'correo-invalido', password: '123456' }),
    ).toThrow();
  });

  it('rejects password shorter than 6 characters', () => {
    expect(() =>
      registerSchema.parse({ name: 'Juan', email: 'juan@example.com', password: '12345' }),
    ).toThrow();
  });
});

describe('loginSchema', () => {
  it('accepts valid data', () => {
    const result = loginSchema.parse({
      email: 'juan@example.com',
      password: '123456',
    });
    expect(result).toEqual({
      email: 'juan@example.com',
      password: '123456',
    });
  });

  it('rejects invalid email', () => {
    expect(() =>
      loginSchema.parse({ email: 'invalido', password: '123456' }),
    ).toThrow();
  });

  it('rejects empty password', () => {
    expect(() =>
      loginSchema.parse({ email: 'juan@example.com', password: '' }),
    ).toThrow();
  });
});
