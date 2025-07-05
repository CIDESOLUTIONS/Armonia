// src/validators/pqr/pqr.validator.ts
import { z } from 'zod';

// Enums para validación
export const PQRTypeEnum = z.enum([
  'COMPLAINT',
  'REQUEST', 
  'SUGGESTION',
  'CLAIM',
  'INFORMATION',
  'MAINTENANCE',
  'SECURITY',
  'OTHER'
]);

export const PQRPriorityEnum = z.enum([
  'LOW',
  'MEDIUM', 
  'HIGH',
  'URGENT'
]);

export const PQRStatusEnum = z.enum([
  'OPEN',
  'IN_PROGRESS',
  'RESOLVED',
  'CLOSED',
  'CANCELLED'
]);

// Schema para crear PQR
export const CreatePQRSchema = z.object({
  type: PQRTypeEnum,
  title: z
    .string()
    .min(5, 'El título debe tener al menos 5 caracteres')
    .max(200, 'El título no puede exceder 200 caracteres')
    .trim(),
  description: z
    .string()
    .min(10, 'La descripción debe tener al menos 10 caracteres')
    .max(2000, 'La descripción no puede exceder 2000 caracteres')
    .trim(),
  priority: PQRPriorityEnum,
  unitNumber: z
    .string()
    .optional()
    .refine(val => !val || /^[A-Z0-9-]+$/.test(val), {
      message: 'Número de unidad debe contener solo letras mayúsculas, números y guiones'
    }),
  attachments: z
    .array(z.object({
      filename: z.string(),
      url: z.string().url(),
      type: z.enum(['IMAGE', 'DOCUMENT', 'VIDEO', 'AUDIO'])
    }))
    .optional()
    .default([])
});

export type CreatePQRRequest = z.infer<typeof CreatePQRSchema>;

// Schema para actualizar PQR
export const UpdatePQRSchema = z.object({
  title: z.string().min(5).max(200).trim().optional(),
  description: z.string().min(10).max(2000).trim().optional(),
  priority: PQRPriorityEnum.optional(),
  status: PQRStatusEnum.optional(),
  resolution: z.string().max(1000).trim().optional(),
  assignedTo: z.number().int().positive().optional()
});

export type UpdatePQRRequest = z.infer<typeof UpdatePQRSchema>;

// Schema para consultar PQRs
export const GetPQRsSchema = z.object({
  filter: z.enum(['all', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']).optional().default('all'),
  priority: PQRPriorityEnum.optional(),
  type: PQRTypeEnum.optional(),
  assignedTo: z.number().int().positive().optional(),
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(20),
  search: z.string().max(100).trim().optional()
});

export type GetPQRsRequest = z.infer<typeof GetPQRsSchema>;

// Schema para respuesta de PQR
export const PQRResponseSchema = z.object({
  id: z.number(),
  type: PQRTypeEnum,
  title: z.string(),
  description: z.string(),
  priority: PQRPriorityEnum,
  status: PQRStatusEnum,
  unitNumber: z.string().nullable(),
  resolution: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  userId: z.number(),
  complexId: z.number(),
  assignedTo: z.number().nullable(),
  user: z.object({
    id: z.number(),
    name: z.string().nullable(),
    email: z.string()
  }).optional(),
  assignedUser: z.object({
    id: z.number(),
    name: z.string().nullable(),
    email: z.string()
  }).nullable().optional()
});

export type PQRResponse = z.infer<typeof PQRResponseSchema>;
