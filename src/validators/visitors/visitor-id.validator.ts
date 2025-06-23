import { z } from 'zod';

// Esquema para validar parámetros de ruta en GET, PUT, DELETE /api/visitors/[id]
export const VisitorIdSchema = z.object({
  id: z.string().refine(val => !isNaN(parseInt(val)), {
    message: "ID de visitante debe ser un número"
  })
});

export type VisitorIdRequest = z.infer<typeof VisitorIdSchema>;

// Esquema para validar datos de actualización en PUT /api/visitors/[id]
export const UpdateVisitorSchema = z.object({
  name: z.string().min(3, {
    message: "El nombre debe tener al menos 3 caracteres"
  }).max(100, {
    message: "El nombre no puede exceder 100 caracteres"
  }).optional(),
  destination: z.string().min(2, {
    message: "El destino debe tener al menos 2 caracteres"
  }).max(100, {
    message: "El destino no puede exceder 100 caracteres"
  }).optional(),
  residentName: z.string().min(3, {
    message: "El nombre del residente debe tener al menos 3 caracteres"
  }).max(100, {
    message: "El nombre del residente no puede exceder 100 caracteres"
  }).optional(),
  plate: z.string().max(20, {
    message: "La placa no puede exceder 20 caracteres"
  }).optional(),
  photoUrl: z.string().url({
    message: "URL de foto inválida"
  }).optional(),
  purpose: z.string().max(200, {
    message: "El propósito no puede exceder 200 caracteres"
  }).optional(),
  company: z.string().max(100, {
    message: "La empresa no puede exceder 100 caracteres"
  }).optional(),
  belongings: z.array(z.string()).optional(),
  notes: z.string().max(500, {
    message: "Las notas no pueden exceder 500 caracteres"
  }).optional(),
  updatedBy: z.number().int().positive().optional()
});

export type UpdateVisitorRequest = z.infer<typeof UpdateVisitorSchema>;

// Esquema para validar datos de registro de salida en POST /api/visitors/[id]/exit
export const RegisterExitSchema = z.object({
  notes: z.string().max(500, {
    message: "Las notas no pueden exceder 500 caracteres"
  }).optional(),
  registeredBy: z.number().int().positive({
    message: "ID de registrador inválido"
  })
});

export type RegisterExitRequest = z.infer<typeof RegisterExitSchema>;

// Esquema para validar datos de eliminación en DELETE /api/visitors/[id]
export const DeleteVisitorSchema = z.object({
  adminId: z.number().int().positive({
    message: "ID de administrador inválido"
  }),
  reason: z.string().min(5, {
    message: "La razón debe tener al menos 5 caracteres"
  }).max(200, {
    message: "La razón no puede exceder 200 caracteres"
  }).optional()
});

export type DeleteVisitorRequest = z.infer<typeof DeleteVisitorSchema>;
