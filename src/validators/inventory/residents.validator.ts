// src/validators/inventory/residents.validator.ts
import { z } from 'zod';

// Enums para validación
export const ResidentStatusEnum = z.enum([
  'ENABLED',
  'DISABLED',
  'SUSPENDED',
  'PENDING'
]);

// Schema para consultar residentes
export const GetResidentsSchema = z.object({
  propertyId: z
    .string()
    .regex(/^\d+$/, 'Property ID debe ser un número válido')
    .transform(Number)
    .optional(),
  page: z
    .number()
    .int()
    .min(1)
    .optional()
    .default(1),
  limit: z
    .number()
    .int()
    .min(1)
    .max(100)
    .optional()
    .default(20),
  search: z
    .string()
    .max(100)
    .trim()
    .optional(),
  status: ResidentStatusEnum.optional()
});

export type GetResidentsRequest = z.infer<typeof GetResidentsSchema>;

// Schema para crear residente
export const CreateResidentSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .trim(),
  email: z
    .string()
    .email('Formato de email inválido')
    .max(150, 'El email no puede exceder 150 caracteres')
    .trim()
    .toLowerCase(),
  dni: z
    .string()
    .min(5, 'El DNI debe tener al menos 5 caracteres')
    .max(20, 'El DNI no puede exceder 20 caracteres')
    .regex(/^[A-Z0-9-]+$/, 'DNI debe contener solo letras mayúsculas, números y guiones')
    .trim(),
  propertyId: z
    .number()
    .int()
    .positive('Property ID debe ser un número positivo'),
  whatsapp: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Formato de WhatsApp inválido')
    .optional()
    .nullable(),
  isPrimary: z
    .boolean()
    .optional()
    .default(false),
  status: ResidentStatusEnum.optional().default('ENABLED'),
  password: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(100, 'La contraseña no puede exceder 100 caracteres')
});

export type CreateResidentRequest = z.infer<typeof CreateResidentSchema>;

// Schema para actualizar residente
export const UpdateResidentSchema = z.object({
  name: z
    .string()
    .min(2)
    .max(100)
    .trim()
    .optional(),
  email: z
    .string()
    .email()
    .max(150)
    .trim()
    .toLowerCase()
    .optional(),
  dni: z
    .string()
    .min(5)
    .max(20)
    .regex(/^[A-Z0-9-]+$/)
    .trim()
    .optional(),
  whatsapp: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/)
    .optional()
    .nullable(),
  isPrimary: z
    .boolean()
    .optional(),
  status: ResidentStatusEnum.optional()
});

export type UpdateResidentRequest = z.infer<typeof UpdateResidentSchema>;

// Schema para respuesta de residente
export const ResidentResponseSchema = z.object({
  id: z.number(),
  userId: z.number(),
  propertyId: z.number(),
  complexId: z.number(),
  dni: z.string(),
  whatsapp: z.string().nullable(),
  isPrimary: z.boolean(),
  status: ResidentStatusEnum,
  createdAt: z.date(),
  updatedAt: z.date(),
  user: z.object({
    id: z.number(),
    name: z.string().nullable(),
    email: z.string(),
    role: z.string()
  }).optional(),
  property: z.object({
    id: z.number(),
    unitNumber: z.string(),
    type: z.string()
  }).optional()
});

export type ResidentResponse = z.infer<typeof ResidentResponseSchema>;
