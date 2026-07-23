import { z } from 'zod';

export const advisorQuerySchema = z.object({
  monthlyExtraPayment: z
    .string()
    .regex(/^\d+(\.\d{1,4})?$/, 'Debe ser un monto válido')
    .refine((val) => parseFloat(val) >= 0, 'No puede ser negativo'),
});

export const debtPayoffQuerySchema = z.object({
  monthlyPayment: z
    .string()
    .regex(/^\d+(\.\d{1,4})?$/)
    .refine((val) => parseFloat(val) >= 0)
    .optional(),
});
