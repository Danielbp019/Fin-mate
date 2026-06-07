import { z } from 'zod';

export const createCoupleSchema = z.object({
  name: z.string().min(1, 'El nombre del grupo es obligatorio').trim(),
});

export const updateCoupleSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio').trim(),
});

export const inviteSchema = z.object({
  email: z.string().email('Correo inválido').trim(),
});

export const createGoalSchema = z.object({
  title: z.string().min(1, 'El título es obligatorio').trim(),
  targetAmount: z.string().refine((v) => Number(v) > 0, 'Ingresa un monto objetivo válido'),
  deadline: z.string().optional(),
});

export const updateGoalSchema = createGoalSchema.partial().extend({
  status: z.enum(['active', 'completed', 'cancelled']).optional(),
});

export const contributeSchema = z.object({
  amount: z.string().refine((v) => Number(v) > 0, 'Ingresa un monto válido'),
  date: z.string().min(1, 'Selecciona una fecha'),
  notes: z.string().max(255).trim().optional(),
});
