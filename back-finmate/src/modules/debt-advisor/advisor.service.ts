import { AppError } from '../../shared/errors/AppError.js';
import * as debtsRepository from '../debts/debts.repository.js';
import type {
  AdvisorDebtItem,
  PaymentOrderItem,
  StrategyResult,
  DebtTip,
  AdvisorPlanResponse,
  PayoffScenario,
  DebtPayoffPlan,
} from './advisor.types.js';

function toNumber(val: string): number {
  return parseFloat(val);
}

function toFixed(val: number): string {
  return val.toFixed(2);
}

type OrderFn = (a: AdvisorDebtItem, b: AdvisorDebtItem) => number;

interface DebtState {
  debtId: string;
  title: string;
  currentAmount: number;
  interestRate: number;
  interestRateType: 'annual' | 'monthly';
  minimumPayment: number;
  remaining: number;
  totalInterestPaid: number;
  payoffMonth: number | null;
}

const MAX_MONTHS = 600;
const PAYOFF_EPSILON = 0.01;

function runSimulation(
  debts: AdvisorDebtItem[],
  orderFn: OrderFn,
  totalMonthly: number,
): { state: DebtState[]; totalMonths: number; totalInterest: number; totalPaid: number } {
  const ordered = [...debts].sort(orderFn);

  const state: DebtState[] = ordered.map((d) => ({
    debtId: d.debtId,
    title: d.title,
    currentAmount: d.currentAmount,
    interestRate: d.interestRate,
    interestRateType: d.interestRateType,
    minimumPayment: d.minimumPayment,
    remaining: d.currentAmount,
    totalInterestPaid: 0,
    payoffMonth: null,
  }));

  let month = 0;
  let totalInterest = 0;
  let totalPaid = 0;

  while (state.some((s) => s.remaining > PAYOFF_EPSILON) && month < MAX_MONTHS) {
    month++;
    let pool = totalMonthly;

    const target = state.find((s) => s.remaining > PAYOFF_EPSILON);

    for (const s of state) {
      if (s.remaining <= PAYOFF_EPSILON) continue;

      const monthlyRate = s.interestRateType === 'monthly' ? s.interestRate / 100 : s.interestRate / 100 / 12;
      const interest = s.remaining * monthlyRate;
      s.remaining += interest;
      s.totalInterestPaid += interest;
      totalInterest += interest;

      const minPayment = Math.min(s.minimumPayment, s.remaining);
      s.remaining -= minPayment;
      totalPaid += minPayment;
      pool -= s.minimumPayment;

      if (s.debtId === target?.debtId && pool > PAYOFF_EPSILON) {
        const extra = Math.min(pool, s.remaining);
        s.remaining -= extra;
        totalPaid += extra;
        pool -= extra;
      }

      if (s.remaining <= PAYOFF_EPSILON && s.payoffMonth === null) {
        s.payoffMonth = month;
      }
    }
  }

  return { state, totalMonths: month, totalInterest, totalPaid };
}

function buildOrderItems(
  state: DebtState[],
  totalExtra: number,
  totalMinSum: number,
): PaymentOrderItem[] {
  const sorted = [...state].sort(
    (a, b) => (a.payoffMonth ?? MAX_MONTHS) - (b.payoffMonth ?? MAX_MONTHS),
  );

  let freedAmount = 0;
  return sorted.map((s, i) => {
    const allocation = i === 0
      ? s.minimumPayment + totalExtra
      : s.minimumPayment + totalExtra + freedAmount;
    freedAmount += s.minimumPayment;

    return {
      debtId: s.debtId,
      title: s.title,
      currentAmount: toFixed(s.currentAmount),
      interestRate: toFixed(s.interestRate),
      minimumPayment: toFixed(s.minimumPayment),
      monthlyAllocation: toFixed(allocation),
      payoffOrder: i + 1,
      estimatedPayoffMonths: s.payoffMonth ?? MAX_MONTHS,
    };
  });
}

const avalancheOrder: OrderFn = (a, b) => {
  if (b.interestRate !== a.interestRate) return b.interestRate - a.interestRate;
  return b.currentAmount - a.currentAmount;
};

const snowballOrder: OrderFn = (a, b) => {
  if (a.currentAmount !== b.currentAmount) return a.currentAmount - b.currentAmount;
  return b.interestRate - a.interestRate;
};

const priorityRank: Record<string, number> = { high: 0, medium: 1, low: 2 };

const byPriorityOrder: OrderFn = (a, b) => {
  const rankDiff = (priorityRank[a.priority] ?? 1) - (priorityRank[b.priority] ?? 1);
  if (rankDiff !== 0) return rankDiff;
  return b.interestRate - a.interestRate;
};

function buildStrategy(
  key: 'avalanche' | 'snowball' | 'byPriority' | 'minimumOnly',
  debts: AdvisorDebtItem[],
  totalMonthly: number,
  totalMinSum: number,
  totalExtra: number,
): StrategyResult {
  const names: Record<string, string> = {
    avalanche: 'Avalancha',
    snowball: 'Bola de nieve',
    byPriority: 'Por prioridad',
    minimumOnly: 'Solo mínimos',
  };

  const descriptions: Record<string, string> = {
    avalanche: 'Prioriza la deuda con la tasa de interés más alta. Ahorras más en intereses a largo plazo.',
    snowball: 'Prioriza la deuda con el saldo más pequeño. Te motiva al ver resultados rápido.',
    byPriority: 'Sigue el orden de prioridad que tú definiste en cada deuda.',
    minimumOnly: 'Solo pagas los mínimos. Es la línea base para comparar.',
  };

  const orderFns: Record<string, OrderFn | null> = {
    avalanche: avalancheOrder,
    snowball: snowballOrder,
    byPriority: byPriorityOrder,
    minimumOnly: null,
  };

  if (key === 'minimumOnly') {
    const order = debts.map((d, i) => ({
      debtId: d.debtId,
      title: d.title,
      currentAmount: toFixed(d.currentAmount),
      interestRate: toFixed(d.interestRate),
      minimumPayment: toFixed(d.minimumPayment),
      monthlyAllocation: toFixed(d.minimumPayment),
      payoffOrder: i + 1,
      estimatedPayoffMonths: 0,
    }));

    return {
      name: names.minimumOnly,
      key: 'minimumOnly',
      description: descriptions.minimumOnly,
      order,
      totalMonths: 0,
      totalInterestPaid: '0.00',
      totalPaid: toFixed(debts.reduce((s, d) => s + d.currentAmount, 0)),
    };
  }

  const { state, totalMonths, totalInterest, totalPaid } = runSimulation(
    debts,
    orderFns[key]!,
    totalMonthly,
  );

  const order = buildOrderItems(state, totalExtra, totalMinSum);

  return {
    name: names[key],
    key,
    description: descriptions[key],
    order,
    totalMonths,
    totalInterestPaid: toFixed(totalInterest),
    totalPaid: toFixed(totalPaid),
  };
}

function generateTips(debts: AdvisorDebtItem[], strategies: StrategyResult[]): DebtTip[] {
  const highRateDebts = debts.filter((d) => d.interestRate > 20);
  const veryHighRateDebts = debts.filter((d) => d.interestRate > 25);
  const rateSpread = Math.max(...debts.map((d) => d.interestRate)) - Math.min(...debts.map((d) => d.interestRate));

  const avalanche = strategies.find((s) => s.key === 'avalanche');
  const snowball = strategies.find((s) => s.key === 'snowball');

  let avalancheWin = false;
  if (avalanche && snowball) {
    const interestSaved = parseFloat(snowball.totalInterestPaid) - parseFloat(avalanche.totalInterestPaid);
    avalancheWin = interestSaved > parseFloat(snowball.totalInterestPaid) * 0.1;
  }

  const tips: DebtTip[] = [
    {
      type: 'avalanche_win',
      title: 'Estrategia recomendada',
      description: rateSpread > 5
        ? 'Tus deudas tienen tasas muy distintas. La estrategia Avalancha te ahorrará más dinero.'
        : 'Tus deudas tienen tasas similares. La Bola de nieve puede ser más motivadora.',
      applicable: true,
    },
    {
      type: 'consolidation',
      title: 'Consolidación de deudas',
      description: 'Unificar varias deudas en una sola con tasa más baja puede reducir tu pago mensual y el interés total.',
      applicable: debts.length >= 3 && highRateDebts.length >= 2,
    },
    {
      type: 'negotiation',
      title: 'Negociar con acreedores',
      description: 'Puedes llamar a tus acreedores y negociar una tasa más baja o un plan de pago. Muchos bancos prefieren cobrar algo a no cobrar nada.',
      applicable: veryHighRateDebts.length > 0,
    },
    {
      type: 'balance_transfer',
      title: 'Transferencia de saldo',
      description: 'Si tienes deudas en tarjetas con tasas >20%, una transferencia a una tarjeta con 0% APR por 12-18 meses puede darte respiro.',
      applicable: highRateDebts.length > 0,
    },
    {
      type: 'biweekly',
      title: 'Pagos quincenales',
      description: 'Pagar la mitad cada dos semanas (en vez de una cuota mensual) resulta en un pago extra al año, acelerando tu libertad financiera.',
      applicable: true,
    },
    {
      type: 'snowflake',
      title: 'Método copo de nieve',
      description: 'Cada ingreso extra (vuelto, freelance, bono) ponlo directo a tu deuda prioritaria. Pequeños montos suman.',
      applicable: true,
    },
  ];

  return tips;
}

function determineRecommended(debts: AdvisorDebtItem[], strategies: StrategyResult[]): string {
  const rateSpread = Math.max(...debts.map((d) => d.interestRate)) - Math.min(...debts.map((d) => d.interestRate));

  const allHaveSameRate = debts.every((d) => d.interestRate === debts[0].interestRate);
  const allNoInterest = debts.every((d) => d.interestRate === 0);

  if (allNoInterest || allHaveSameRate) {
    return 'snowball';
  }

  if (rateSpread > 5) {
    return 'avalanche';
  }

  return 'snowball';
}

export async function generatePlan(
  userId: string,
  monthlyExtraPayment: string,
): Promise<AdvisorPlanResponse> {
  const debts = await debtsRepository.findByUser(userId, { status: 'pending' });

  const items: AdvisorDebtItem[] = debts.map((d) => ({
    debtId: d.id,
    title: d.title,
    currentAmount: toNumber(d.currentAmount),
    interestRate: toNumber(d.interestRate),
    interestRateType: d.interestRateType,
    minimumPayment: toNumber(d.minimumPayment),
    priority: d.priority,
  }));

  if (items.length === 0) {
    return {
      strategies: [],
      recommendedStrategy: '',
      tips: [],
      totalMonthlyMinimum: '0.00',
      totalMonthlyWithExtra: '0.00',
    };
  }

  const totalMinSum = items.reduce((s, d) => s + d.minimumPayment, 0);
  const totalExtra = toNumber(monthlyExtraPayment);
  const totalMonthly = totalMinSum + totalExtra;

  const strategies: StrategyResult[] = [
    buildStrategy('avalanche', items, totalMonthly, totalMinSum, totalExtra),
    buildStrategy('snowball', items, totalMonthly, totalMinSum, totalExtra),
    buildStrategy('byPriority', items, totalMonthly, totalMinSum, totalExtra),
    buildStrategy('minimumOnly', items, totalMonthly, totalMinSum, totalExtra),
  ];

  const tips = generateTips(items, strategies);
  const recommendedStrategy = determineRecommended(items, strategies);

  return {
    strategies,
    recommendedStrategy,
    tips,
    totalMonthlyMinimum: toFixed(totalMinSum),
    totalMonthlyWithExtra: toFixed(totalMonthly),
  };
}

function simulateSingleDebt(
  currentAmount: number,
  interestRate: number,
  interestRateType: 'annual' | 'monthly',
  monthlyPayment: number,
): { totalMonths: number; totalInterest: number; totalPaid: number } {
  let remaining = currentAmount;
  let totalInterest = 0;
  let month = 0;

  while (remaining > PAYOFF_EPSILON && month < MAX_MONTHS) {
    month++;
    const monthlyRate = interestRateType === 'monthly' ? interestRate / 100 : interestRate / 100 / 12;
    const interest = remaining * monthlyRate;
    remaining += interest;
    totalInterest += interest;
    const payment = Math.min(monthlyPayment, remaining);
    remaining -= payment;
  }

  return { totalMonths: month, totalInterest, totalPaid: currentAmount + totalInterest };
}

function calculateSuggestedPayment(currentAmount: number, minimumPayment: number): number {
  if (minimumPayment > 0) {
    return Math.max(minimumPayment * 1.5, minimumPayment + currentAmount * 0.02);
  }
  return Math.max(currentAmount / 12, 1);
}

function estimatePayoffDate(totalMonths: number): string {
  const now = new Date();
  now.setMonth(now.getMonth() + totalMonths);
  return now.toISOString().slice(0, 10);
}

function buildPayoffScenario(
  label: string,
  currentAmount: number,
  interestRate: number,
  interestRateType: 'annual' | 'monthly',
  monthlyPayment: number,
): PayoffScenario {
  const { totalMonths, totalInterest, totalPaid } = simulateSingleDebt(
    currentAmount,
    interestRate,
    interestRateType,
    monthlyPayment,
  );

  return {
    label,
    monthlyPayment: toFixed(monthlyPayment),
    totalMonths,
    totalInterestPaid: toFixed(totalInterest),
    totalPaid: toFixed(totalPaid),
    estimatedPayoffDate: estimatePayoffDate(totalMonths),
  };
}

function generateSingleDebtTips(debt: {
  interestRate: number;
  minimumPayment: number;
  currentAmount: number;
}): DebtTip[] {
  const tips: DebtTip[] = [];

  if (debt.interestRate > 25) {
    tips.push({
      type: 'negotiation',
      title: 'Negociar con el acreedor',
      description: 'Tu tasa es muy alta. Llama al banco y pide una reducci\u00F3n. Muchos prefieren cobrar algo a no cobrar nada.',
      applicable: true,
    });
  }

  if (debt.interestRate > 20) {
    tips.push({
      type: 'balance_transfer',
      title: 'Transferencia de saldo',
      description: 'Considera transferir esta deuda a una tarjeta con 0% APR por 12-18 meses para detener los intereses.',
      applicable: true,
    });
  }

  tips.push({
    type: 'biweekly',
    title: 'Pagos quincenales',
    description: 'Pagar la mitad cada dos semanas resulta en un pago extra al a\u00F1o, acelerando tu libertad financiera.',
    applicable: true,
  });

  tips.push({
    type: 'snowflake',
    title: 'M\u00E9todo copo de nieve',
    description: 'Cada ingreso extra (vuelto, freelance, bono) ponlo directo a esta deuda. Peque\u00F1os montos suman.',
    applicable: true,
  });

  return tips;
}

export async function getDebtPayoffPlan(
  userId: string,
  debtId: string,
  monthlyPayment?: string,
): Promise<DebtPayoffPlan> {
  const debt = await debtsRepository.findById(debtId);

  if (!debt) {
    throw new AppError(404, 'Deuda no encontrada');
  }

  if (debt.userId !== userId) {
    throw new AppError(404, 'Deuda no encontrada');
  }

  const currentAmount = toNumber(debt.currentAmount);
  const interestRate = toNumber(debt.interestRate);
  const minimumPayment = toNumber(debt.minimumPayment);
  const initialAmount = toNumber(debt.initialAmount);

  const suggestedPayment = calculateSuggestedPayment(currentAmount, minimumPayment);

  const interestRateType = debt.interestRateType;

  const scenarios: PayoffScenario[] = [];

  scenarios.push(
    buildPayoffScenario('Solo m\u00EDnimos', currentAmount, interestRate, interestRateType, minimumPayment),
  );

  scenarios.push(
    buildPayoffScenario('Recomendado', currentAmount, interestRate, interestRateType, suggestedPayment),
  );

  if (monthlyPayment) {
    const userPayment = toNumber(monthlyPayment);
    if (userPayment > 0) {
      scenarios.push(
        buildPayoffScenario('Tu plan', currentAmount, interestRate, interestRateType, userPayment),
      );
    }
  }

  const tips = generateSingleDebtTips({ interestRate, minimumPayment, currentAmount });
  const progressPercent = initialAmount > 0
    ? Math.round(((initialAmount - currentAmount) / initialAmount) * 100)
    : 0;

  return {
    debtId: debt.id,
    title: debt.title,
    currentAmount: debt.currentAmount,
    interestRate: debt.interestRate,
    interestRateType: debt.interestRateType,
    minimumPayment: debt.minimumPayment,
    initialAmount: debt.initialAmount,
    suggestedPayment: toFixed(suggestedPayment),
    progressPercent,
    scenarios,
    tips,
  };
}
