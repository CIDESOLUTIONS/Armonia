// src/validators/auth/login.validator.ts
import { z } from 'zod';

export const LoginSchema = z.object({
  email: z
    .string()
    .email('Formato de email inválido')
    .min(1, 'Email es requerido'),
  password: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(100, 'La contraseña no puede exceder 100 caracteres'),
  complexId: z
    .number()
    .int('ID del complejo debe ser un número entero')
    .positive('ID del complejo debe ser positivo')
    .optional(),
  schemaName: z
    .string()
    .min(1, 'Nombre del esquema no puede estar vacío')
    .max(50, 'Nombre del esquema no puede exceder 50 caracteres')
    .regex(/^[a-z0-9_]+$/, 'Nombre del esquema solo puede contener letras minúsculas, números y guiones bajos')
    .optional()
});

export type LoginRequest = z.infer<typeof LoginSchema>;

// Schema para la respuesta de login
export const LoginResponseSchema = z.object({
  token: z.string(),
  user: z.object({
    id: z.number(),
    email: z.string().email(),
    role: z.string(),
    name: z.string().nullable(),
    complexId: z.number().nullable(),
    complexName: z.string().nullable(),
    schemaName: z.string().nullable(),
    isGlobalAdmin: z.boolean(),
    isReception: z.boolean(),
    isComplexAdmin: z.boolean(),
    isResident: z.boolean()
  })
});

export type LoginResponse = z.infer<typeof LoginResponseSchema>;
