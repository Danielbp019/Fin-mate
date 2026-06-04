import { describe, it, expect } from 'vitest';
import {
  createCategorySchema,
  updateCategorySchema,
  categoryParamsSchema,
} from '../categories.schema.js';

describe('createCategorySchema', () => {
  it('accepts valid data with only required fields', () => {
    const result = createCategorySchema.parse({
      name: 'Comida',
      type: 'expense',
    });
    expect(result).toEqual({ name: 'Comida', type: 'expense' });
  });

  it('accepts valid data with all fields', () => {
    const result = createCategorySchema.parse({
      name: 'Salario',
      type: 'income',
      icon: 'salary',
    });
    expect(result).toEqual({
      name: 'Salario',
      type: 'income',
      icon: 'salary',
    });
  });

  it('rejects empty name', () => {
    expect(() => createCategorySchema.parse({ name: '', type: 'expense' })).toThrow();
  });

  it('rejects name longer than 100 characters', () => {
    expect(() => createCategorySchema.parse({ name: 'A'.repeat(101), type: 'expense' })).toThrow();
  });

  it('rejects invalid type', () => {
    expect(() => createCategorySchema.parse({ name: 'Test', type: 'invalid' })).toThrow();
  });

  it('rejects icon longer than 50 characters', () => {
    expect(() =>
      createCategorySchema.parse({
        name: 'Test',
        type: 'expense',
        icon: 'A'.repeat(51),
      }),
    ).toThrow();
  });
});

describe('updateCategorySchema', () => {
  it('accepts partial update with name only', () => {
    const result = updateCategorySchema.parse({ name: 'Nuevo nombre' });
    expect(result).toEqual({ name: 'Nuevo nombre' });
  });

  it('accepts isActive boolean', () => {
    const result = updateCategorySchema.parse({ isActive: false });
    expect(result).toEqual({ isActive: false });
  });

  it('accepts empty object (no fields)', () => {
    const result = updateCategorySchema.parse({});
    expect(result).toEqual({});
  });
});

describe('categoryParamsSchema', () => {
  it('accepts valid UUID', () => {
    const result = categoryParamsSchema.parse({
      id: '550e8400-e29b-41d4-a716-446655440000',
    });
    expect(result.id).toBe('550e8400-e29b-41d4-a716-446655440000');
  });

  it('rejects invalid UUID', () => {
    expect(() => categoryParamsSchema.parse({ id: 'not-a-uuid' })).toThrow();
  });
});
