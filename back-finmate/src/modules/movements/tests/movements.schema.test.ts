import { describe, it, expect } from 'vitest';
import {
  createMovementSchema,
  updateMovementSchema,
  movementParamsSchema,
  movementListQuerySchema,
} from '../movements.schema.js';

describe('createMovementSchema', () => {
  it('accepts valid data with only required fields', () => {
    const result = createMovementSchema.parse({
      categoryId: '550e8400-e29b-41d4-a716-446655440000',
      type: 'expense',
      amount: '150.50',
      movementDate: '2026-06-01T12:00:00.000Z',
    });
    expect(result).toEqual({
      categoryId: '550e8400-e29b-41d4-a716-446655440000',
      type: 'expense',
      amount: '150.50',
      movementDate: '2026-06-01T12:00:00.000Z',
    });
  });

  it('accepts valid data with all fields', () => {
    const result = createMovementSchema.parse({
      categoryId: '550e8400-e29b-41d4-a716-446655440000',
      type: 'income',
      amount: '2500.0000',
      description: 'Salario mensual',
      movementDate: '2026-06-01T12:00:00.000Z',
    });
    expect(result).toEqual({
      categoryId: '550e8400-e29b-41d4-a716-446655440000',
      type: 'income',
      amount: '2500.0000',
      description: 'Salario mensual',
      movementDate: '2026-06-01T12:00:00.000Z',
    });
  });

  it('rejects invalid categoryId', () => {
    expect(() =>
      createMovementSchema.parse({
        categoryId: 'not-a-uuid',
        type: 'expense',
        amount: '100',
        movementDate: '2026-06-01T12:00:00.000Z',
      }),
    ).toThrow();
  });

  it('rejects invalid type', () => {
    expect(() =>
      createMovementSchema.parse({
        categoryId: '550e8400-e29b-41d4-a716-446655440000',
        type: 'invalid',
        amount: '100',
        movementDate: '2026-06-01T12:00:00.000Z',
      }),
    ).toThrow();
  });

  it('rejects invalid amount format', () => {
    expect(() =>
      createMovementSchema.parse({
        categoryId: '550e8400-e29b-41d4-a716-446655440000',
        type: 'expense',
        amount: 'abc',
        movementDate: '2026-06-01T12:00:00.000Z',
      }),
    ).toThrow();
  });

  it('rejects amount with more than 4 decimal places', () => {
    expect(() =>
      createMovementSchema.parse({
        categoryId: '550e8400-e29b-41d4-a716-446655440000',
        type: 'expense',
        amount: '100.12345',
        movementDate: '2026-06-01T12:00:00.000Z',
      }),
    ).toThrow();
  });

  it('rejects invalid movementDate', () => {
    expect(() =>
      createMovementSchema.parse({
        categoryId: '550e8400-e29b-41d4-a716-446655440000',
        type: 'expense',
        amount: '100',
        movementDate: 'not-a-date',
      }),
    ).toThrow();
  });

  it('rejects description exceeding 255 characters', () => {
    expect(() =>
      createMovementSchema.parse({
        categoryId: '550e8400-e29b-41d4-a716-446655440000',
        type: 'expense',
        amount: '100',
        movementDate: '2026-06-01T12:00:00.000Z',
        description: 'A'.repeat(256),
      }),
    ).toThrow();
  });
});

describe('updateMovementSchema', () => {
  it('accepts partial update with amount only', () => {
    const result = updateMovementSchema.parse({ amount: '200.00' });
    expect(result).toEqual({ amount: '200.00' });
  });

  it('accepts empty object', () => {
    const result = updateMovementSchema.parse({});
    expect(result).toEqual({});
  });

  it('rejects invalid type in update', () => {
    expect(() =>
      updateMovementSchema.parse({ type: 'invalid' }),
    ).toThrow();
  });
});

describe('movementParamsSchema', () => {
  it('accepts valid UUID', () => {
    const result = movementParamsSchema.parse({
      id: '550e8400-e29b-41d4-a716-446655440000',
    });
    expect(result.id).toBe('550e8400-e29b-41d4-a716-446655440000');
  });

  it('rejects invalid UUID', () => {
    expect(() => movementParamsSchema.parse({ id: 'not-a-uuid' })).toThrow();
  });
});

describe('movementListQuerySchema', () => {
  it('accepts valid filters', () => {
    const result = movementListQuerySchema.parse({
      type: 'expense',
      page: '1',
      limit: '10',
    });
    expect(result.type).toBe('expense');
    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
  });

  it('coerces string numbers to numbers', () => {
    const result = movementListQuerySchema.parse({ page: '2', limit: '50' });
    expect(result.page).toBe(2);
    expect(result.limit).toBe(50);
  });

  it('accepts empty query', () => {
    const result = movementListQuerySchema.parse({});
    expect(result).toEqual({});
  });

  it('rejects negative page', () => {
    expect(() => movementListQuerySchema.parse({ page: '-1' })).toThrow();
  });

  it('rejects limit exceeding 100', () => {
    expect(() => movementListQuerySchema.parse({ limit: '200' })).toThrow();
  });
});
