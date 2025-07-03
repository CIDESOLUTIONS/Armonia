// src/validators/assemblies/assemblies.validator.ts
import { z } from 'zod';

export const AssemblyStatusEnum = z.enum(['PLANNED', 'ACTIVE', 'COMPLETED', 'CANCELLED']);

export const CreateAssemblySchema = z.object({
  title: z.string().min(3).max(200).trim(),
  description: z.string().max(1000).trim().optional(),
  scheduledDate: z.string().datetime(),
  location: z.string().min(2).max(200).trim(),
  type: z.enum(['ORDINARY', 'EXTRAORDINARY']),
  agenda: z.array(z.string().min(2).max(500)).optional()
});

export const UpdateAssemblySchema = CreateAssemblySchema.partial();

export const GetAssembliesSchema = z.object({
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(20),
  status: AssemblyStatusEnum.optional()
});

export type CreateAssemblyRequest = z.infer<typeof CreateAssemblySchema>;
export type UpdateAssemblyRequest = z.infer<typeof UpdateAssemblySchema>;
export type GetAssembliesRequest = z.infer<typeof GetAssembliesSchema>;
