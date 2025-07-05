import { z } from 'zod';

// Esquema para validar datos de proyectos
export const ProjectSchema = z.object({
  name: z.string().min(3, {
    message: "El nombre debe tener al menos 3 caracteres"
  }).max(100, {
    message: "El nombre no puede exceder 100 caracteres"
  }),
  description: z.string().min(10, {
    message: "La descripción debe tener al menos 10 caracteres"
  }).max(1000, {
    message: "La descripción no puede exceder 1000 caracteres"
  }),
  budget: z.number().min(0, {
    message: "El presupuesto no puede ser negativo"
  }),
  startDate: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: "Fecha de inicio inválida"
  }),
  endDate: z.string().nullable().optional().refine(val => !val || !isNaN(Date.parse(val)), {
    message: "Fecha de fin inválida"
  }),
  status: z.enum(['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'], {
    errorMap: () => ({ message: "Estado de proyecto inválido" })
  }),
  progress: z.number().min(0, {
    message: "El progreso no puede ser negativo"
  }).max(100, {
    message: "El progreso no puede ser mayor a 100"
  }),
  responsibleId: z.number().int().positive().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional()
});

export type ProjectRequest = z.infer<typeof ProjectSchema>;

// Esquema para validar parámetros de consulta en GET /api/projects
export const GetProjectsSchema = z.object({
  status: z.enum(['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  responsibleId: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  search: z.string().optional(),
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 20)
});

export type GetProjectsRequest = z.infer<typeof GetProjectsSchema>;
