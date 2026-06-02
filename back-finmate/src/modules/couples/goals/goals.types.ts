export interface CreateGoalBody {
  title: string;
  targetAmount: string;
  deadline?: string;
}

export interface UpdateGoalBody {
  title?: string;
  targetAmount?: string;
  deadline?: string | null;
  status?: 'active' | 'completed' | 'cancelled';
}

export interface ContributeBody {
  amount: string;
  notes?: string;
  date?: string;
}

export interface GoalResponse {
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
  contributions: ContributionResponse[];
}

export interface ContributionResponse {
  id: string;
  goalId: string;
  userId: string;
  userName: string;
  amount: string;
  notes: string | null;
  date: string;
  createdAt: string;
}
