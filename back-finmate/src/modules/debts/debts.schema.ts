import { z } from 'zod';

export const createDebtSchema = z.object({
  title: z
    .string()
    .min(1, 'El titulo es requerido')
    .max(150, 'El titulo no puede exceder 150 caracteres'),
  description: z
    .string()
    .max(255, 'La descripcion no puede exceder 255 caracteres')
    .optional(),
  initialAmount: z
    .string()
    .regex(
      /^\d+(\.\d{1,4})?$/,
      'El monto debe ser un numero valido con hasta 4 decimales',
    ),
  interestRate: z
    .string()
    .regex(/^\d+(\.\d{1,4})?$/, 'La tasa de interes debe ser un numero valido')
    .optional(),
  minimumPayment: z
    .string()
    .regex(/^\d+(\.\d{1,4})?$/, 'El pago minimo debe ser un numero valido')
    .optional(),
  dueDay: z
    .number()
    .int('El dia de vencimiento debe ser un numero entero')
    .min(1, 'El dia de vencimiento debe estar entre 1 y 31')
    .max(31, 'El dia de vencimiento debe estar entre 1 y 31')
    .optional(),
  priority: z
    .enum(['low', 'medium', 'high'], {
      errorMap: () => ({ message: 'La prioridad debe ser low, medium o high' }),
    })
    .optional(),
  startDate: z
    .string()
    .datetime({ message: 'Fecha de inicio invalida' })
    .optional(),
});

export const updateDebtSchema = z.object({
  title: z
    .string()
    .min(1, 'El titulo es requerido')
    .max(150, 'El titulo no puede exceder 150 caracteres')
    .optional(),
  description: z
    .string()
    .max(255, 'La descripcion no puede exceder 255 caracteres')
    .optional(),
  initialAmount: z
    .string()
    .regex(
      /^\d+(\.\d{1,4})?$/,
      'El monto debe ser un numero valido con hasta 4 decimales',
    )
    .optional(),
  currentAmount: z
    .string()
    .regex(
      /^\d+(\.\d{1,4})?$/,
      'El monto debe ser un numero valido con hasta 4 decimales',
    )
    .optional(),
  interestRate: z
    .string()
    .regex(/^\d+(\.\d{1,4})?$/, 'La tasa de interes debe ser un numero valido')
    .optional(),
  minimumPayment: z
    .string()
    .regex(/^\d+(\.\d{1,4})?$/, 'El pago minimo debe ser un numero valido')
    .optional(),
  dueDay: z
    .number()
    .int('El dia de vencimiento debe ser un numero entero')
    .min(1, 'El dia de vencimiento debe estar entre 1 y 31')
    .max(31, 'El dia de vencimiento debe estar entre 1 y 31')
    .optional(),
  priority: z
    .enum(['low', 'medium', 'high'], {
      errorMap: () => ({ message: 'La prioridad debe ser low, medium o high' }),
    })
    .optional(),
  status: z
    .enum(['pending', 'paid', 'overdue'], {
      errorMap: () => ({
        message: 'El estado debe ser pending, paid o overdue',
      }),
    })
    .optional(),
  startDate: z
    .string()
    .datetime({ message: 'Fecha de inicio invalida' })
    .optional(),
  endDate: z.string().datetime({ message: 'Fecha de fin invalida' }).optional(),
});

export const debtParamsSchema = z.object({
  id: z.string().uuid('ID de deuda invalido'),
});

export const debtListQuerySchema = z.object({
  status: z.enum(['pending', 'paid', 'overdue']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
});
