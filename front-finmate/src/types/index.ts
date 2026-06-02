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
