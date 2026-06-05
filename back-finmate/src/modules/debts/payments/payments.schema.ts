import { z } from 'zod';

export const createPaymentSchema = z.object({
  amount: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, 'El monto debe ser un numero valido con hasta 2 decimales'),
  paymentDate: z.string().datetime({ message: 'Fecha de pago invalida' }),
  notes: z.string().max(255, 'Las notas no pueden exceder 255 caracteres').optional(),
});

export const paymentParamsSchema = z.object({
  debtId: z.string().uuid('ID de deuda invalido'),
});
