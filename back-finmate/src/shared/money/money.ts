import { dinero, add, subtract, toSnapshot, type Dinero } from 'dinero.js';
import { COP } from 'dinero.js/currencies';

export function dbToDinero(value: string): Dinero<number, 'COP'> {
  const amount = Math.round(Number(value) * 100);
  if (!Number.isFinite(amount)) {
    return dinero({ amount: 0, currency: COP });
  }
  return dinero({ amount, currency: COP });
}

export function dineroToDb(money: Dinero<number, 'COP'>): string {
  const { amount } = toSnapshot(money);
  const abs = Math.abs(amount);
  const whole = Math.floor(abs / 100);
  const cents = String(abs % 100).padStart(2, '0');
  return `${amount < 0 ? '-' : ''}${whole}.${cents}00`;
}

export function toNumber(money: Dinero<number, 'COP'>): number {
  const { amount } = toSnapshot(money);
  return amount / 100;
}

export { dinero, add, subtract, toSnapshot };
export type { Dinero };
