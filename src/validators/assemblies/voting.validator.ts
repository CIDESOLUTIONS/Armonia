import { z } from 'zod';

// Esquema para validar parámetros de consulta en GET /api/assemblies/voting
export const GetVotingQuestionsSchema = z.object({
  assemblyId: z.string().refine(val => !isNaN(parseInt(val)), {
    message: "ID de asamblea debe ser un número"
  })
});

export type GetVotingQuestionsRequest = z.infer<typeof GetVotingQuestionsSchema>;

// Esquema para validar datos de creación en POST /api/assemblies/voting
export const CreateVotingQuestionSchema = z.object({
  assemblyId: z.number().int().positive({
    message: "ID de asamblea debe ser un número entero positivo"
  }),
  text: z.string().min(5, {
    message: "La pregunta debe tener al menos 5 caracteres"
  }).max(500, {
    message: "La pregunta no puede exceder 500 caracteres"
  }),
  options: z.array(z.string()).optional(),
  votingTime: z.number().int().positive().optional()
});

export type CreateVotingQuestionRequest = z.infer<typeof CreateVotingQuestionSchema>;
