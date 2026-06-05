import { describe, it, expect } from 'vitest';
import {
  createCoupleSchema,
  updateCoupleSchema,
  inviteSchema,
  coupleParamsSchema,
} from '../couples.schema.js';

describe('createCoupleSchema', () => {
  it('rejects empty body', () => {
    expect(() => createCoupleSchema.parse({})).toThrow();
  });

  it('rejects empty name string', () => {
    expect(() => createCoupleSchema.parse({ name: '' })).toThrow('El nombre es obligatorio');
  });

  it('accepts name', () => {
    const result = createCoupleSchema.parse({ name: 'Nuestro grupo' });
    expect(result.name).toBe('Nuestro grupo');
  });

  it('rejects name exceeding 120 characters', () => {
    expect(() => createCoupleSchema.parse({ name: 'A'.repeat(121) })).toThrow();
  });
});

describe('updateCoupleSchema', () => {
  it('accepts valid name', () => {
    const result = updateCoupleSchema.parse({ name: 'Nuevo nombre' });
    expect(result.name).toBe('Nuevo nombre');
  });

  it('rejects empty name', () => {
    expect(() => updateCoupleSchema.parse({})).toThrow();
  });

  it('rejects empty name string', () => {
    expect(() => updateCoupleSchema.parse({ name: '' })).toThrow('El nombre es obligatorio');
  });

  it('rejects name exceeding 120 characters', () => {
    expect(() => updateCoupleSchema.parse({ name: 'A'.repeat(121) })).toThrow();
  });
});

describe('inviteSchema', () => {
  it('accepts valid email', () => {
    const result = inviteSchema.parse({ email: 'user@example.com' });
    expect(result.email).toBe('user@example.com');
  });

  it('rejects invalid email', () => {
    expect(() => inviteSchema.parse({ email: 'not-an-email' })).toThrow();
  });
});

describe('coupleParamsSchema', () => {
  it('accepts valid UUID', () => {
    const result = coupleParamsSchema.parse({
      id: '550e8400-e29b-41d4-a716-446655440000',
    });
    expect(result.id).toBe('550e8400-e29b-41d4-a716-446655440000');
  });

  it('rejects invalid UUID', () => {
    expect(() => coupleParamsSchema.parse({ id: 'not-a-uuid' })).toThrow();
  });
});
