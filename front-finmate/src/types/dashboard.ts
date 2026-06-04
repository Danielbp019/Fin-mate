export interface CategoryBreakdown {
  categoryId: string;
  categoryName: string;
  icon: string | null;
  color: string | null;
  total: string;
}

export interface MonthlyBalance {
  month: string;
  income: string;
  expense: string;
  balance: string;
}

export interface RecentMovement {
  id: string;
  type: 'income' | 'expense';
  amount: string;
  categoryName: string;
  categoryIcon: string | null;
  description: string | null;
  movementDate: string;
}

export interface ActiveDebts {
  count: number;
  totalRemaining: string;
}

export interface CoupleGoals {
  active: number;
  totalProgress: number;
}

export interface DashboardSummary {
  currentMonth: {
    totalIncome: string;
    totalExpense: string;
    balance: string;
  };
  comparison: {
    incomeChange: number | null;
    expenseChange: number | null;
  };
  incomeByCategory: CategoryBreakdown[];
  expenseByCategory: CategoryBreakdown[];
  monthlyBalance: MonthlyBalance[];
  recentMovements: RecentMovement[];
  activeDebts: ActiveDebts | null;
  coupleGoals: CoupleGoals | null;
}
