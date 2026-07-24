export interface CreateDebtBody {
  title: string;
  description?: string;
  initialAmount: string;
  interestRate?: string;
  interestRateType?: 'annual' | 'monthly';
  minimumPayment?: string;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
  startDate?: string;
}

export interface UpdateDebtBody {
  title?: string;
  description?: string;
  initialAmount?: string;
  currentAmount?: string;
  interestRate?: string;
  interestRateType?: 'annual' | 'monthly';
  minimumPayment?: string;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
  status?: 'pending' | 'paid' | 'overdue';
  startDate?: string;
  endDate?: string;
}

export interface DebtResponse {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  initialAmount: string;
  currentAmount: string;
  interestRate: string;
  interestRateType: 'annual' | 'monthly';
  minimumPayment: string;
  dueDate: string | null;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'paid' | 'overdue';
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DebtListFilters {
  status?: 'pending' | 'paid' | 'overdue';
  priority?: 'low' | 'medium' | 'high';
}
