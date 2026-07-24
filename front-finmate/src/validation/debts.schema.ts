import { z } from 'zod';
import { capitalizeFirst } from '@/utils/format';

export const createDebtSchema = z.object({
  title: z.string().min(1, 'El título es requerido').trim().transform(capitalizeFirst),
  initialAmount: z.string().refine((v) => Number(v) > 0, 'Ingresa un monto inicial válido'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  interestRate: z.string().optional(),
  interestRateType: z.enum(['annual', 'monthly']).default('annual'),
  minimumPayment: z.string().optional(),
  dueDate: z.string().optional(),
  startDate: z.string().optional(),
  description: z.string().max(255).trim().transform((v) => (v ? capitalizeFirst(v) : v)).optional(),
});

export const updateDebtSchema = createDebtSchema.partial().extend({
  currentAmount: z.string().optional(),
  status: z.enum(['pending', 'paid', 'overdue']).optional(),
  endDate: z.string().optional(),
});

export const createPaymentSchema = z.object({
  amount: z.string().refine((v) => Number(v) > 0, 'Ingresa un monto válido'),
  paymentDate: z.string().min(1, 'Selecciona una fecha'),
  notes: z.string().max(255).trim().transform((v) => (v ? capitalizeFirst(v) : v)).optional(),
});
