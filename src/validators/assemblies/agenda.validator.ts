import { z } from 'zod';

// Esquema para validar parámetros de consulta en GET /api/assemblies/agenda
export const GetAgendaSchema = z.object({
  assemblyId: z.string().refine(val => !isNaN(parseInt(val)), {
    message: "ID de asamblea debe ser un número"
  })
});

export type GetAgendaRequest = z.infer<typeof GetAgendaSchema>;

// Esquema para validar datos de actualización en PUT /api/assemblies/agenda
export const UpdateAgendaSchema = z.object({
  id: z.string().refine(val => !isNaN(parseInt(val)), {
    message: "ID de ítem de agenda debe ser un número"
  }),
  notes: z.string().max(2000, {
    message: "Las notas no pueden exceder 2000 caracteres"
  }).optional(),
  completed: z.boolean().optional()
});

export type UpdateAgendaRequest = z.infer<typeof UpdateAgendaSchema>;
