import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  type: z.enum(['income', 'expense'], {
    errorMap: () => ({ message: 'El tipo debe ser income o expense' }),
  }),
  icon: z.string().max(50, 'El icono no puede exceder 50 caracteres').optional(),
});

export const updateCategorySchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .optional(),
  icon: z.string().max(50, 'El icono no puede exceder 50 caracteres').optional(),
});

export const categoryParamsSchema = z.object({
  id: z.string().uuid('ID de categoría inválido'),
});
