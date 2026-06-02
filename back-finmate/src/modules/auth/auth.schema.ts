import { z } from 'zod';

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(120, 'El nombre no puede exceder 120 caracteres'),
  email: z.string().email('Correo electrónico inválido').max(190),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export const loginSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(120, 'El nombre no puede exceder 120 caracteres'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'La contraseña actual es requerida'),
  newPassword: z.string().min(6, 'La nueva contraseña debe tener al menos 6 caracteres'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'El token es requerido'),
  newPassword: z.string().min(6, 'La nueva contraseña debe tener al menos 6 caracteres'),
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'El token es requerido'),
});
