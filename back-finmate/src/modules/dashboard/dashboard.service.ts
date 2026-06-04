import * as movementsRepository from '../movements/movements.repository.js';
import * as debtsRepository from '../debts/debts.repository.js';
import * as couplesRepository from '../couples/couples.repository.js';
import * as goalsRepository from '../couples/goals/goals.repository.js';
import type { DashboardSummary } from './dashboard.types.js';

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

function parseAmount(amount: string): number {
  return Number.parseFloat(amount) || 0;
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
      const totalTarget = goals.reduce((sum, g) => sum + parseAmount(g.targetAmount), 0);
      const totalCurrent = goals.reduce((sum, g) => sum + parseAmount(g.currentAmount), 0);
      const progress = totalTarget > 0 ? Math.round((totalCurrent / totalTarget) * 100) : 0;
      coupleGoals = { active: goals.length, totalProgress: progress };
    }
  }

  const currentIncome = parseAmount(currentTotals.totalIncome);
  const currentExpense = parseAmount(currentTotals.totalExpense);
  const prevIncome = parseAmount(prevTotals.totalIncome);
  const prevExpense = parseAmount(prevTotals.totalExpense);

  const monthlyBalanceWithCalc = monthlyBalance.map((m) => ({
    ...m,
    balance: (parseAmount(m.income) - parseAmount(m.expense)).toFixed(2),
  }));

  return {
    currentMonth: {
      totalIncome: currentTotals.totalIncome,
      totalExpense: currentTotals.totalExpense,
      balance: (currentIncome - currentExpense).toFixed(2),
    },
    comparison: {
      incomeChange: calcPercentage(currentIncome, prevIncome),
      expenseChange: calcPercentage(currentExpense, prevExpense),
    },
    incomeByCategory,
    expenseByCategory,
    monthlyBalance: monthlyBalanceWithCalc,
    recentMovements,
    activeDebts,
    coupleGoals,
  };
}
