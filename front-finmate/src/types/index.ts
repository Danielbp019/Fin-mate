export interface Category {
  id: string;
  userId: string | null;
  type: 'income' | 'expense';
  name: string;
  icon: string | null;
  color: string | null;
  isActive: boolean;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryBody {
  name: string;
  type: 'income' | 'expense';
  icon?: string;
  color?: string;
}

export interface UpdateCategoryBody {
  name?: string;
  icon?: string;
  color?: string;
  isActive?: boolean;
}

export interface Movement {
  id: string;
  userId: string;
  categoryId: string;
  type: 'income' | 'expense';
  amount: string;
  description: string | null;
  movementDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMovementBody {
  categoryId: string;
  type: 'income' | 'expense';
  amount: string;
  description?: string;
  movementDate: string;
}

export interface UpdateMovementBody {
  categoryId?: string;
  type?: 'income' | 'expense';
  amount?: string;
  description?: string;
  movementDate?: string;
}

export interface MovementFilters {
  type?: 'income' | 'expense';
  categoryId?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

export interface Debt {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  initialAmount: string;
  currentAmount: string;
  interestRate: string;
  minimumPayment: string;
  dueDay: number | null;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'paid' | 'overdue';
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDebtBody {
  title: string;
  description?: string;
  initialAmount: string;
  interestRate?: string;
  minimumPayment?: string;
  dueDay?: number;
  priority?: 'low' | 'medium' | 'high';
  startDate?: string;
}

export interface UpdateDebtBody {
  title?: string;
  description?: string;
  initialAmount?: string;
  currentAmount?: string;
  interestRate?: string;
  minimumPayment?: string;
  dueDay?: number;
  priority?: 'low' | 'medium' | 'high';
  status?: 'pending' | 'paid' | 'overdue';
  startDate?: string;
  endDate?: string;
}

export interface DebtFilters {
  status?: 'pending' | 'paid' | 'overdue';
  priority?: 'low' | 'medium' | 'high';
}

export interface Payment {
  id: string;
  debtId: string;
  userId: string;
  amount: string;
  paymentDate: string;
  notes: string | null;
  createdAt: string;
}

export interface CreatePaymentBody {
  amount: string;
  paymentDate: string;
  notes?: string;
}
