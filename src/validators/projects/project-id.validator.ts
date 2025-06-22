import { z } from 'zod';

// Esquema para validar parámetros de ruta en GET, PUT, DELETE /api/projects/[id]
export const ProjectIdSchema = z.object({
  id: z.string().refine(val => !isNaN(parseInt(val)), {
    message: "ID de proyecto debe ser un número"
  })
});

export type ProjectIdRequest = z.infer<typeof ProjectIdSchema>;

// Esquema para validar datos de actualización en PUT /api/projects/[id]
export const ProjectUpdateSchema = z.object({
  name: z.string().min(3, {
    message: "El nombre debe tener al menos 3 caracteres"
  }).max(100, {
    message: "El nombre no puede exceder 100 caracteres"
  }).optional(),
  description: z.string().min(10, {
    message: "La descripción debe tener al menos 10 caracteres"
  }).max(1000, {
    message: "La descripción no puede exceder 1000 caracteres"
  }).optional(),
  budget: z.number().min(0, {
    message: "El presupuesto no puede ser negativo"
  }).optional(),
  startDate: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: "Fecha de inicio inválida"
  }).optional(),
  endDate: z.string().nullable().optional().refine(val => !val || !isNaN(Date.parse(val)), {
    message: "Fecha de fin inválida"
  }),
  status: z.enum(['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'], {
    errorMap: () => ({ message: "Estado de proyecto inválido" })
  }).optional(),
  progress: z.number().min(0, {
    message: "El progreso no puede ser negativo"
  }).max(100, {
    message: "El progreso no puede ser mayor a 100"
  }).optional(),
  responsibleId: z.number().int().positive().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional()
});

export type ProjectUpdateRequest = z.infer<typeof ProjectUpdateSchema>;
