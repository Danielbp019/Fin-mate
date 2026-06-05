import * as movementsRepository from '../movements/movements.repository.js';
import * as debtsRepository from '../debts/debts.repository.js';
import * as couplesRepository from '../couples/couples.repository.js';
import * as goalsRepository from '../couples/goals/goals.repository.js';
import type { DashboardSummary } from './dashboard.types.js';
import { dbToDinero, toNumber } from '../../shared/money/money.js';
import { add, subtract } from 'dinero.js';
import { COP } from 'dinero.js/currencies';
import { dinero } from 'dinero.js';

function getMonthRange(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const from = new Date(year, month, 1);
  const to = new Date(year, month + 1, 0, 23, 59, 59, 999);
  return { from, to };
}

function getPreviousMonthRange(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const prev = new Date(year, month - 1, 1);
  const prevMonth = prev.getMonth();
  const prevYear = prev.getFullYear();
  const from = new Date(prevYear, prevMonth, 1);
  const to = new Date(prevYear, prevMonth + 1, 0, 23, 59, 59, 999);
  return { from, to };
}

function calcPercentage(current: number, previous: number): number | null {
  if (previous === 0) {
    return current > 0 ? 100 : current === 0 ? 0 : null;
  }
  return Math.round(((current - previous) / previous) * 100);
}

export async function getSummary(userId: string): Promise<DashboardSummary> {
  const now = new Date();
  const currentRange = getMonthRange(now);
  const prevRange = getPreviousMonthRange(now);

  const [
    currentTotals,
    prevTotals,
    incomeByCategory,
    expenseByCategory,
    monthlyBalance,
    recentMovements,
    activeDebts,
    activeCouple,
  ] = await Promise.all([
    movementsRepository.getPeriodTotals(userId, currentRange.from, currentRange.to),
    movementsRepository.getPeriodTotals(userId, prevRange.from, prevRange.to),
    movementsRepository.getTotalsByCategory(userId, 'income', currentRange.from, currentRange.to),
    movementsRepository.getTotalsByCategory(userId, 'expense', currentRange.from, currentRange.to),
    movementsRepository.getMonthlyTotals(userId, 12),
    movementsRepository.getRecentWithCategory(userId, 5),
    debtsRepository.getActiveSummary(userId),
    couplesRepository.findActiveCoupleByUserId(userId),
  ]);

  let coupleGoals = null;
  if (activeCouple) {
    const goals = await goalsRepository.findActiveByCouple(activeCouple.couple.id);
    if (goals.length > 0) {
      const totalTarget = goals.reduce(
        (sum, g) => add(sum, dbToDinero(g.targetAmount)),
        dinero({ amount: 0, currency: COP }),
      );
      const totalCurrent = goals.reduce(
        (sum, g) => add(sum, dbToDinero(g.currentAmount)),
        dinero({ amount: 0, currency: COP }),
      );
      const targetNum = toNumber(totalTarget);
      const currentNum = toNumber(totalCurrent);
      const progress = targetNum > 0 ? Math.round((currentNum / targetNum) * 100) : 0;
      coupleGoals = { active: goals.length, totalProgress: progress };
    }
  }

  const incomeMoney = dbToDinero(currentTotals.totalIncome);
  const expenseMoney = dbToDinero(currentTotals.totalExpense);
  const prevIncomeMoney = dbToDinero(prevTotals.totalIncome);
  const prevExpenseMoney = dbToDinero(prevTotals.totalExpense);
  const balanceMoney = subtract(incomeMoney, expenseMoney);

  const monthlyBalanceWithCalc = monthlyBalance.map((m) => {
    const income = dbToDinero(m.income);
    const expense = dbToDinero(m.expense);
    const bal = subtract(income, expense);
    return { ...m, balance: toNumber(bal).toFixed(2) };
  });

  return {
    currentMonth: {
      totalIncome: currentTotals.totalIncome,
      totalExpense: currentTotals.totalExpense,
      balance: toNumber(balanceMoney).toFixed(2),
    },
    comparison: {
      incomeChange: calcPercentage(toNumber(incomeMoney), toNumber(prevIncomeMoney)),
      expenseChange: calcPercentage(toNumber(expenseMoney), toNumber(prevExpenseMoney)),
    },
    incomeByCategory,
    expenseByCategory,
    monthlyBalance: monthlyBalanceWithCalc,
    recentMovements,
    activeDebts,
    coupleGoals,
  };
}
