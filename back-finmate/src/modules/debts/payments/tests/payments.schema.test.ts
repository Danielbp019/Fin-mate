import { describe, it, expect } from 'vitest';
import { createPaymentSchema } from '../payments.schema.js';

describe('createPaymentSchema', () => {
  it('accepts valid data with only required fields', () => {
    const result = createPaymentSchema.parse({
      amount: '500.00',
      paymentDate: '2026-06-15T10:00:00.000Z',
    });
    expect(result).toEqual({
      amount: '500.00',
      paymentDate: '2026-06-15T10:00:00.000Z',
    });
  });

  it('accepts valid data with all fields', () => {
    const result = createPaymentSchema.parse({
      amount: '1000.00',
      paymentDate: '2026-06-15T10:00:00.000Z',
      notes: 'Pago mensual',
    });
    expect(result).toEqual({
      amount: '1000.00',
      paymentDate: '2026-06-15T10:00:00.000Z',
      notes: 'Pago mensual',
    });
  });

  it('rejects invalid amount', () => {
    expect(() =>
      createPaymentSchema.parse({
        amount: 'abc',
        paymentDate: '2026-06-15T10:00:00.000Z',
      }),
    ).toThrow();
  });

  it('rejects amount with more than 2 decimal places', () => {
    expect(() =>
      createPaymentSchema.parse({
        amount: '100.123',
        paymentDate: '2026-06-15T10:00:00.000Z',
      }),
    ).toThrow();
  });

  it('rejects invalid paymentDate', () => {
    expect(() =>
      createPaymentSchema.parse({
        amount: '500.00',
        paymentDate: 'not-a-date',
      }),
    ).toThrow();
  });

  it('rejects notes exceeding 255 characters', () => {
    expect(() =>
      createPaymentSchema.parse({
        amount: '500.00',
        paymentDate: '2026-06-15T10:00:00.000Z',
        notes: 'A'.repeat(256),
      }),
    ).toThrow();
  });
});
