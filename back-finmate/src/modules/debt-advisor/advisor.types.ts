export interface AdvisorDebtItem {
  debtId: string;
  title: string;
  currentAmount: number;
  interestRate: number;
  minimumPayment: number;
  priority: string;
}

export interface PaymentOrderItem {
  debtId: string;
  title: string;
  currentAmount: string;
  interestRate: string;
  minimumPayment: string;
  monthlyAllocation: string;
  payoffOrder: number;
  estimatedPayoffMonths: number;
}

export interface StrategyResult {
  name: string;
  key: 'avalanche' | 'snowball' | 'byPriority' | 'minimumOnly';
  description: string;
  order: PaymentOrderItem[];
  totalMonths: number;
  totalInterestPaid: string;
  totalPaid: string;
}

export interface DebtTip {
  type: 'consolidation' | 'negotiation' | 'balance_transfer' | 'biweekly' | 'snowflake' | 'avalanche_win';
  title: string;
  description: string;
  applicable: boolean;
}

export interface AdvisorPlanResponse {
  strategies: StrategyResult[];
  recommendedStrategy: string;
  tips: DebtTip[];
  totalMonthlyMinimum: string;
  totalMonthlyWithExtra: string;
}

export interface PayoffScenario {
  label: string;
  monthlyPayment: string;
  totalMonths: number;
  totalInterestPaid: string;
  totalPaid: string;
  estimatedPayoffDate: string;
}

export interface DebtPayoffPlan {
  debtId: string;
  title: string;
  currentAmount: string;
  interestRate: string;
  minimumPayment: string;
  initialAmount: string;
  suggestedPayment: string;
  progressPercent: number;
  scenarios: PayoffScenario[];
  tips: DebtTip[];
}
