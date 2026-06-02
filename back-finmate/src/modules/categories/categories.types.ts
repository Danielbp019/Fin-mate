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

export interface CategoryResponse {
  id: string;
  userId: string | null;
  type: 'income' | 'expense';
  name: string;
  icon: string | null;
  color: string | null;
  isActive: boolean;
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}
