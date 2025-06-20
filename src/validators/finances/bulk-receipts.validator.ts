import { z } from 'zod';

// Esquema para validar datos de generación masiva de recibos
export const BulkReceiptsSchema = z.object({
  month: z.number().int().min(1).max(12, {
    message: "El mes debe ser un número entre 1 y 12"
  }),
  year: z.number().int().min(2020).max(2050, {
    message: "El año debe estar en un rango válido (2020-2050)"
  }),
  feeType: z.enum(['MAINTENANCE', 'SPECIAL', 'RESERVE', 'ALL']).optional().default('ALL'),
  type: z.enum(['STANDARD', 'SPECIAL', 'PENALTY']).default('STANDARD'),
  description: z.string().optional(),
  dueDate: z.string().optional().refine(val => !val || !isNaN(Date.parse(val)), {
    message: "Fecha de vencimiento inválida"
  })
});

export type BulkReceiptsRequest = z.infer<typeof BulkReceiptsSchema>;
