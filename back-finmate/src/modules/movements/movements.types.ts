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

export interface MovementResponse {
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

export interface MovementListFilters {
  type?: 'income' | 'expense';
  categoryId?: string;
  referenceType?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}
