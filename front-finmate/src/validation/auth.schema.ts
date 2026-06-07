import { capitalizeFirst } from '@/utils/format';
import { z } from 'zod';

export const registerSchema = z
  .object({
    name: z.string().min(1, 'El nombre es obligatorio').trim().transform(capitalizeFirst),
    email: z.string().email('Correo inválido').trim().toLowerCase(),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'La contraseña actual es requerida'),
    newPassword: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export const updateProfileSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio').trim(),
});
