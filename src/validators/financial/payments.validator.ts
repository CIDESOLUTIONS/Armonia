// src/validators/financial/payments.validator.ts
import { z } from 'zod';

// Enums para validación
export const TransactionStatusEnum = z.enum([
  'PENDING',
  'PROCESSING', 
  'COMPLETED',
  'FAILED',
  'REFUNDED',
  'CANCELLED'
]);

export const CurrencyEnum = z.enum([
  'COP', // Colombian Peso
  'USD', // US Dollar
  'EUR'  // Euro
]);

// Schema para consultar transacciones
export const GetTransactionsSchema = z.object({
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
  status: TransactionStatusEnum.optional(),
  startDate: z
    .string()
    .datetime()
    .optional(),
  endDate: z
    .string()
    .datetime()
    .optional(),
  minAmount: z
    .number()
    .min(0)
    .optional(),
  maxAmount: z
    .number()
    .min(0)
    .optional(),
  search: z
    .string()
    .max(100)
    .trim()
    .optional()
});

export type GetTransactionsRequest = z.infer<typeof GetTransactionsSchema>;

// Schema para crear transacción
export const CreateTransactionSchema = z.object({
  amount: z
    .number()
    .positive('El monto debe ser mayor a 0')
    .max(999999999, 'El monto excede el límite permitido')
    .multipleOf(0.01, 'El monto debe tener máximo 2 decimales'),
  currency: CurrencyEnum.optional().default('COP'),
  description: z
    .string()
    .min(3, 'La descripción debe tener al menos 3 caracteres')
    .max(500, 'La descripción no puede exceder 500 caracteres')
    .trim(),
  invoiceId: z
    .number()
    .int()
    .positive()
    .optional(),
  paymentMethodId: z
    .number()
    .int()
    .positive('ID de método de pago inválido'),
  metadata: z
    .record(z.string(), z.any())
    .optional(),
  returnUrl: z
    .string()
    .url('URL de retorno inválida')
    .optional(),
  ipAddress: z
    .string()
    .ip('Dirección IP inválida')
    .optional(),
  userAgent: z
    .string()
    .max(500)
    .optional()
});

export type CreateTransactionRequest = z.infer<typeof CreateTransactionSchema>;

// Schema para actualizar transacción
export const UpdateTransactionSchema = z.object({
  status: TransactionStatusEnum,
  gatewayReference: z
    .string()
    .max(255)
    .optional(),
  gatewayResponse: z
    .record(z.string(), z.any())
    .optional(),
  errorMessage: z
    .string()
    .max(1000)
    .optional(),
  completedAt: z
    .string()
    .datetime()
    .optional()
});

export type UpdateTransactionRequest = z.infer<typeof UpdateTransactionSchema>;

// Schema para procesar pago
export const ProcessPaymentSchema = z.object({
  paymentData: z
    .record(z.string(), z.any())
    .refine((data) => Object.keys(data).length > 0, {
      message: 'Datos de pago requeridos'
    }),
  savePaymentMethod: z
    .boolean()
    .optional()
    .default(false)
});

export type ProcessPaymentRequest = z.infer<typeof ProcessPaymentSchema>;

// Schema para respuesta de transacción
export const TransactionResponseSchema = z.object({
  id: z.number(),
  userId: z.number(),
  complexId: z.number(),
  invoiceId: z.number().nullable(),
  amount: z.number(),
  currency: CurrencyEnum,
  description: z.string(),
  status: TransactionStatusEnum,
  gatewayReference: z.string().nullable(),
  paymentMethodId: z.number(),
  metadata: z.record(z.string(), z.any()).nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  completedAt: z.date().nullable(),
  invoice: z.object({
    id: z.number(),
    invoiceNumber: z.string(),
    amount: z.number()
  }).optional(),
  paymentMethod: z.object({
    id: z.number(),
    name: z.string(),
    type: z.string()
  }).optional()
});

export type TransactionResponse = z.infer<typeof TransactionResponseSchema>;

// Schema para validar parámetros de ID
export const TransactionIdSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, 'ID debe ser un número válido')
    .transform(Number)
    .refine((id) => id > 0, 'ID debe ser mayor a 0')
});

export type TransactionIdParams = z.infer<typeof TransactionIdSchema>;
