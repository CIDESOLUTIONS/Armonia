import { z } from 'zod';

// Esquema para validar parámetros de consulta en GET /api/incidents
export const GetIncidentsSchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REOPENED']).optional(),
  category: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  search: z.string().optional(),
  startDate: z.string().optional().refine(val => !val || !isNaN(Date.parse(val)), {
    message: "Fecha de inicio inválida"
  }),
  endDate: z.string().optional().refine(val => !val || !isNaN(Date.parse(val)), {
    message: "Fecha de fin inválida"
  }),
  unitNumber: z.string().optional(),
  reportedById: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  assignedToId: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  isPublic: z.string().optional().transform(val => val === 'true'),
  isEmergency: z.string().optional().transform(val => val === 'true'),
  tags: z.string().optional().transform(val => val ? val.split(',') : undefined)
});

export type GetIncidentsRequest = z.infer<typeof GetIncidentsSchema>;

// Esquema para validar datos de creación en POST /api/incidents
export const CreateIncidentSchema = z.object({
  title: z.string().min(5, {
    message: "El título debe tener al menos 5 caracteres"
  }).max(200, {
    message: "El título no puede exceder 200 caracteres"
  }),
  description: z.string().min(10, {
    message: "La descripción debe tener al menos 10 caracteres"
  }).max(2000, {
    message: "La descripción no puede exceder 2000 caracteres"
  }),
  category: z.string().min(2, {
    message: "La categoría debe tener al menos 2 caracteres"
  }),
  subcategory: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], {
    errorMap: () => ({ message: "Prioridad inválida" })
  }),
  impact: z.string().optional(),
  location: z.string().min(3, {
    message: "La ubicación debe tener al menos 3 caracteres"
  }),
  unitId: z.number().int().positive().optional(),
  unitNumber: z.string().optional(),
  area: z.string().optional(),
  isPublic: z.boolean().default(false),
  isEmergency: z.boolean().default(false),
  requiresFollowUp: z.boolean().default(false),
  tags: z.array(z.string()).optional(),
  mainPhotoUrl: z.string().url().optional(),
  attachments: z.array(z.object({
    url: z.string().url(),
    type: z.string(),
    name: z.string()
  })).optional(),
  relatedIncidentIds: z.array(z.number().int().positive()).optional(),
  visitorId: z.number().int().positive().optional(),
  packageId: z.number().int().positive().optional()
});

export type CreateIncidentRequest = z.infer<typeof CreateIncidentSchema>;
