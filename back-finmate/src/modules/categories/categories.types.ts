export interface CreateCategoryBody {
  name: string;
  type: 'income' | 'expense';
  icon?: string;
}

export interface UpdateCategoryBody {
  name?: string;
  icon?: string;
}

export interface CategoryResponse {
  id: string;
  userId: string | null;
  type: 'income' | 'expense';
  name: string;
  icon: string | null;
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}
