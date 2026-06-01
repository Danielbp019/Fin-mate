export interface CreatePaymentBody {
  amount: string;
  paymentDate: string;
  notes?: string;
}

export interface PaymentResponse {
  id: string;
  debtId: string;
  userId: string;
  amount: string;
  paymentDate: string;
  notes: string | null;
  createdAt: string;
}
