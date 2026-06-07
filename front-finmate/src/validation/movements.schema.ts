import { capitalizeFirst } from '@/utils/format';
import { z } from 'zod';

export const createMovementSchema = z.object({
  categoryId: z.string().min(1, 'Selecciona una categoría'),
  type: z.enum(['income', 'expense']),
  amount: z.string().refine((v) => Number(v) > 0, 'Ingresa un monto válido'),
  description: z.string().max(255).trim().transform((v) => (v ? capitalizeFirst(v) : v)).optional(),
  movementDate: z.string().min(1, 'Selecciona una fecha'),
});

export const updateMovementSchema = createMovementSchema.partial();

export const movementFiltersSchema = z.object({
  type: z.enum(['income', 'expense']).optional(),
  categoryId: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
});
