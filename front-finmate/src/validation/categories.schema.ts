import { capitalizeFirst } from '@/utils/format';
import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').trim().transform(capitalizeFirst),
  type: z.enum(['income', 'expense']),
  icon: z.string().optional(),
});

export const updateCategorySchema = createCategorySchema.partial().extend({
  isActive: z.boolean().optional(),
});
