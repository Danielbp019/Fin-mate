import { describe, it, expect } from 'vitest';
import { registerSchema, loginSchema } from '../auth.schema.js';

describe('registerSchema', () => {
  it('debe validar datos correctos', () => {
    const data = registerSchema.parse({
      name: 'Usuario Test',
      email: 'test@example.com',
      password: '123456',
    });
    expect(data.name).toBe('Usuario Test');
    expect(data.email).toBe('test@example.com');
    expect(data.password).toBe('123456');
  });

  it('debe rechazar email inválido', () => {
    expect(() =>
      registerSchema.parse({
        name: 'Test',
        email: 'invalido',
        password: '123456',
      }),
    ).toThrow();
  });

  it('debe rechazar contraseña menor a 6 caracteres', () => {
    expect(() =>
      registerSchema.parse({
        name: 'Test',
        email: 'test@example.com',
        password: '12345',
      }),
    ).toThrow();
  });

  it('debe rechazar nombre vacío', () => {
    expect(() =>
      registerSchema.parse({
        name: 'A',
        email: 'test@example.com',
        password: '123456',
      }),
    ).toThrow();
  });
});

describe('loginSchema', () => {
  it('debe validar datos correctos', () => {
    const data = loginSchema.parse({
      email: 'test@example.com',
      password: '123456',
    });
    expect(data.email).toBe('test@example.com');
    expect(data.password).toBe('123456');
  });

  it('debe rechazar email inválido', () => {
    expect(() =>
      loginSchema.parse({ email: 'invalido', password: '123456' }),
    ).toThrow();
  });

  it('debe rechazar contraseña vacía', () => {
    expect(() =>
      loginSchema.parse({ email: 'test@example.com', password: '' }),
    ).toThrow();
  });
});
