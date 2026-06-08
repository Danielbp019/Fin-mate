import { z } from 'zod';

export const createMovementSchema = z.object({
  categoryId: z.string().uuid('ID de categoria invalido'),
  type: z.enum(['income', 'expense'], {
    errorMap: () => ({ message: 'El tipo debe ser income o expense' }),
  }),
  amount: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, 'El monto debe ser un numero valido con hasta 2 decimales'),
  description: z.string().max(255, 'La descripcion no puede exceder 255 caracteres').optional(),
  movementDate: z.string().datetime({ message: 'Fecha de movimiento invalida' }),
});

export const updateMovementSchema = z.object({
  categoryId: z.string().uuid('ID de categoria invalido').optional(),
  type: z
    .enum(['income', 'expense'], {
      errorMap: () => ({ message: 'El tipo debe ser income o expense' }),
    })
    .optional(),
  amount: z
    .string()
    .regex(/^\d+(\.\d{1,4})?$/, 'El monto debe ser un numero valido con hasta 4 decimales')
    .optional(),
  description: z.string().max(255, 'La descripcion no puede exceder 255 caracteres').optional(),
  movementDate: z.string().datetime({ message: 'Fecha de movimiento invalida' }).optional(),
});

export const movementParamsSchema = z.object({
  id: z.string().uuid('ID de movimiento invalido'),
});

export const movementListQuerySchema = z.object({
  type: z.enum(['income', 'expense']).optional(),
  categoryId: z.string().uuid().optional(),
  referenceType: z.string().optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});
