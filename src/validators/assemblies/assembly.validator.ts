import { z } from 'zod';

// Esquema para validar datos de creación de asamblea
export const CreateAssemblySchema = z.object({
  title: z.string().min(5, {
    message: "El título debe tener al menos 5 caracteres"
  }).max(200, {
    message: "El título no puede exceder 200 caracteres"
  }),
  type: z.enum(['ORDINARY', 'EXTRAORDINARY', 'INFORMATIVE'], {
    errorMap: () => ({ message: "Tipo de asamblea inválido" })
  }),
  date: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: "Fecha inválida"
  }),
  description: z.string().max(1000, {
    message: "La descripción no puede exceder 1000 caracteres"
  }).optional(),
  agenda: z.array(
    z.object({
      numeral: z.number().int().positive(),
      title: z.string().min(3).max(200),
      description: z.string().max(1000).optional(),
      requiresVoting: z.boolean().optional().default(false),
      attachments: z.array(z.string()).optional()
    })
  ).min(1, {
    message: "Debe incluir al menos un punto en la agenda"
  })
});

export type CreateAssemblyRequest = z.infer<typeof CreateAssemblySchema>;
