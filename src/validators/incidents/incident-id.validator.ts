import { z } from 'zod';

// Esquema para validar parámetros de ruta en GET, PUT, DELETE /api/incidents/[id]
export const IncidentIdSchema = z.object({
  id: z.string().refine(val => !isNaN(parseInt(val)), {
    message: "ID de incidente debe ser un número"
  })
});

export type IncidentIdRequest = z.infer<typeof IncidentIdSchema>;

// Esquema para validar datos de actualización en PUT /api/incidents/[id]
export const UpdateIncidentSchema = z.object({
  title: z.string().min(5, {
    message: "El título debe tener al menos 5 caracteres"
  }).max(200, {
    message: "El título no puede exceder 200 caracteres"
  }).optional(),
  description: z.string().min(10, {
    message: "La descripción debe tener al menos 10 caracteres"
  }).max(2000, {
    message: "La descripción no puede exceder 2000 caracteres"
  }).optional(),
  category: z.string().min(2, {
    message: "La categoría debe tener al menos 2 caracteres"
  }).optional(),
  subcategory: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], {
    errorMap: () => ({ message: "Prioridad inválida" })
  }).optional(),
  impact: z.string().optional(),
  location: z.string().min(3, {
    message: "La ubicación debe tener al menos 3 caracteres"
  }).optional(),
  unitId: z.number().int().positive().optional(),
  unitNumber: z.string().optional(),
  area: z.string().optional(),
  isPublic: z.boolean().optional(),
  isEmergency: z.boolean().optional(),
  requiresFollowUp: z.boolean().optional(),
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

export type UpdateIncidentRequest = z.infer<typeof UpdateIncidentSchema>;

// Esquema para validar datos de cancelación en DELETE /api/incidents/[id]
export const CancelIncidentSchema = z.object({
  reason: z.string().min(5, {
    message: "La razón debe tener al menos 5 caracteres"
  }).max(500, {
    message: "La razón no puede exceder 500 caracteres"
  }).optional()
});

export type CancelIncidentRequest = z.infer<typeof CancelIncidentSchema>;
