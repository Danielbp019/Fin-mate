import { z } from 'zod';

export const createCoupleSchema = z.object({
  name: z
    .string()
    .max(120, 'El nombre no puede exceder 120 caracteres')
    .optional(),
});

export const inviteSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
});

export const coupleParamsSchema = z.object({
  id: z.string().uuid('ID de grupo inválido'),
});
