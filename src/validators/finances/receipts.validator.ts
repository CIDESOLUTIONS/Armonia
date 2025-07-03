import { z } from 'zod';

// Esquema para validar parámetros de consulta en GET /api/finances/receipts
export const GetReceiptsSchema = z.object({
  propertyId: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  status: z.enum(['PENDING', 'PAID', 'OVERDUE', 'CANCELLED']).optional(),
  startDate: z.string().optional().refine(val => !val || !isNaN(Date.parse(val)), {
    message: "Fecha de inicio inválida"
  }),
  endDate: z.string().optional().refine(val => !val || !isNaN(Date.parse(val)), {
    message: "Fecha de fin inválida"
  }),
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 20)
});

export type GetReceiptsRequest = z.infer<typeof GetReceiptsSchema>;

// Esquema para validar datos de creación en POST /api/finances/receipts
export const CreateReceiptSchema = z.object({
  propertyId: z.number().int().positive({
    message: "ID de propiedad debe ser un número entero positivo"
  }),
  feeIds: z.array(z.number().int().positive({
    message: "IDs de cuotas deben ser números enteros positivos"
  })).min(1, {
    message: "Debe incluir al menos una cuota"
  }),
  type: z.enum(['STANDARD', 'SPECIAL', 'PENALTY']).default('STANDARD'),
  description: z.string().optional(),
  dueDate: z.string().optional().refine(val => !val || !isNaN(Date.parse(val)), {
    message: "Fecha de vencimiento inválida"
  })
});

export type CreateReceiptRequest = z.infer<typeof CreateReceiptSchema>;
