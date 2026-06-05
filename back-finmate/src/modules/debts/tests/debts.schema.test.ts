import { describe, it, expect } from 'vitest';
import { createDebtSchema, updateDebtSchema, debtParamsSchema } from '../debts.schema.js';

describe('createDebtSchema', () => {
  it('accepts valid data with only required fields', () => {
    const result = createDebtSchema.parse({
      title: 'Tarjeta de credito',
      initialAmount: '5000.00',
    });
    expect(result).toEqual({
      title: 'Tarjeta de credito',
      initialAmount: '5000.00',
    });
  });

  it('accepts valid data with all fields', () => {
    const result = createDebtSchema.parse({
      title: 'Prestamo personal',
      description: 'Prestamo del banco',
      initialAmount: '10000.00',
      interestRate: '5.5',
      minimumPayment: '500.00',
      dueDay: 15,
      priority: 'high',
      startDate: '2026-01-01T00:00:00.000Z',
    });
    expect(result.title).toBe('Prestamo personal');
    expect(result.priority).toBe('high');
    expect(result.dueDay).toBe(15);
  });

  it('rejects empty title', () => {
    expect(() => createDebtSchema.parse({ title: '', initialAmount: '100' })).toThrow();
  });

  it('rejects title exceeding 150 characters', () => {
    expect(() =>
      createDebtSchema.parse({ title: 'A'.repeat(151), initialAmount: '100' }),
    ).toThrow();
  });

  it('rejects invalid initialAmount', () => {
    expect(() => createDebtSchema.parse({ title: 'Test', initialAmount: 'abc' })).toThrow();
  });

  it('rejects dueDay below 1', () => {
    expect(() =>
      createDebtSchema.parse({ title: 'Test', initialAmount: '100', dueDay: 0 }),
    ).toThrow();
  });

  it('rejects dueDay above 31', () => {
    expect(() =>
      createDebtSchema.parse({ title: 'Test', initialAmount: '100', dueDay: 32 }),
    ).toThrow();
  });

  it('rejects invalid priority', () => {
    expect(() =>
      createDebtSchema.parse({ title: 'Test', initialAmount: '100', priority: 'urgent' }),
    ).toThrow();
  });

  it('rejects invalid startDate', () => {
    expect(() =>
      createDebtSchema.parse({ title: 'Test', initialAmount: '100', startDate: 'not-a-date' }),
    ).toThrow();
  });
});

describe('updateDebtSchema', () => {
  it('accepts partial update with title only', () => {
    const result = updateDebtSchema.parse({ title: 'Nuevo titulo' });
    expect(result).toEqual({ title: 'Nuevo titulo' });
  });

  it('accepts empty object', () => {
    const result = updateDebtSchema.parse({});
    expect(result).toEqual({});
  });

  it('accepts status update', () => {
    const result = updateDebtSchema.parse({ status: 'paid' });
    expect(result).toEqual({ status: 'paid' });
  });

  it('rejects invalid status', () => {
    expect(() => updateDebtSchema.parse({ status: 'invalid' })).toThrow();
  });

  it('accepts currentAmount update', () => {
    const result = updateDebtSchema.parse({ currentAmount: '2500.00' });
    expect(result).toEqual({ currentAmount: '2500.00' });
  });
});

describe('debtParamsSchema', () => {
  it('accepts valid UUID', () => {
    const result = debtParamsSchema.parse({
      id: '550e8400-e29b-41d4-a716-446655440000',
    });
    expect(result.id).toBe('550e8400-e29b-41d4-a716-446655440000');
  });

  it('rejects invalid UUID', () => {
    expect(() => debtParamsSchema.parse({ id: 'not-a-uuid' })).toThrow();
  });
});
