export interface Category {
  id: string;
  userId: string | null;
  type: 'income' | 'expense';
  name: string;
  icon: string | null;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryBody {
  name: string;
  type: 'income' | 'expense';
  icon?: string;
}

export interface UpdateCategoryBody {
  name?: string;
  icon?: string;
}

export interface Movement {
  id: string;
  userId: string;
  categoryId: string;
  type: 'income' | 'expense';
  amount: string;
  description: string | null;
  movementDate: string;
  referenceType: string | null;
  referenceId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMovementBody {
  categoryId: string | null;
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
  referenceType?: string;
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

export interface CoupleMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: 'owner' | 'member';
  joinedAt: string;
}

export interface Couple {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  members: CoupleMember[];
}

export interface CreateCoupleBody {
  name: string;
}

export interface UpdateCoupleBody {
  name: string;
}

export interface Goal {
  id: string;
  coupleId: string;
  title: string;
  targetAmount: string;
  currentAmount: string;
  progressPercent: number;
  deadline: string | null;
  status: 'active' | 'completed' | 'cancelled';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  contributions: Contribution[];
}

export interface CreateGoalBody {
  title: string;
  targetAmount: string;
  deadline?: string;
}

export interface UpdateGoalBody {
  title?: string;
  targetAmount?: string;
  deadline?: string;
  status?: 'active' | 'completed' | 'cancelled';
}

export interface Contribution {
  id: string;
  goalId: string;
  userId: string;
  userName: string;
  amount: string;
  notes: string | null;
  date: string;
  createdAt: string;
}

export interface CreateContributionBody {
  amount: string;
  notes?: string;
  date?: string;
}
