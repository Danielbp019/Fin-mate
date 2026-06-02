import { z } from 'zod';

export const createGoalSchema = z.object({
  title: z
    .string()
    .min(1, 'El titulo es requerido')
    .max(150, 'El titulo no puede exceder 150 caracteres'),
  targetAmount: z
    .string()
    .regex(
      /^\d+(\.\d{1,4})?$/,
      'El monto debe ser un numero valido con hasta 4 decimales',
    ),
  deadline: z
    .string()
    .datetime({ message: 'Fecha de vencimiento invalida' })
    .optional(),
});

export const updateGoalSchema = z.object({
  title: z
    .string()
    .min(1, 'El titulo es requerido')
    .max(150, 'El titulo no puede exceder 150 caracteres')
    .optional(),
  targetAmount: z
    .string()
    .regex(
      /^\d+(\.\d{1,4})?$/,
      'El monto debe ser un numero valido con hasta 4 decimales',
    )
    .optional(),
  deadline: z
    .string()
    .datetime({ message: 'Fecha de vencimiento invalida' })
    .optional()
    .nullable(),
  status: z.enum(['active', 'completed', 'cancelled']).optional(),
});

export const contributeSchema = z.object({
  amount: z
    .string()
    .regex(
      /^\d+(\.\d{1,4})?$/,
      'El monto debe ser un numero valido con hasta 4 decimales',
    ),
  notes: z
    .string()
    .max(255, 'Las notas no pueden exceder 255 caracteres')
    .optional(),
  date: z.string().datetime({ message: 'Fecha invalida' }).optional(),
});

export const goalParamsSchema = z.object({
  coupleId: z.string().uuid('ID de grupo invalido'),
});

export const goalIdParamsSchema = z.object({
  coupleId: z.string().uuid('ID de grupo invalido'),
  id: z.string().uuid('ID de meta invalido'),
});
