import { z } from 'zod';

export const createDebtSchema = z.object({
  title: z.string().min(1, 'El título es requerido').trim(),
  initialAmount: z.string().refine((v) => Number(v) > 0, 'Ingresa un monto inicial válido'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  interestRate: z.string().optional(),
  minimumPayment: z.string().optional(),
  dueDay: z.coerce.number().int().min(1).max(31).optional(),
  startDate: z.string().optional(),
  description: z.string().max(255).trim().optional(),
});

export const updateDebtSchema = createDebtSchema.partial().extend({
  currentAmount: z.string().optional(),
  status: z.enum(['pending', 'paid', 'overdue']).optional(),
  endDate: z.string().optional(),
});

export const createPaymentSchema = z.object({
  amount: z.string().refine((v) => Number(v) > 0, 'Ingresa un monto válido'),
  paymentDate: z.string().min(1, 'Selecciona una fecha'),
  notes: z.string().max(255).trim().optional(),
});
