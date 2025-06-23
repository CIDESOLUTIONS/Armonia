import { z } from 'zod';

// Esquema para validar parámetros de consulta en GET /api/visitors
export const GetVisitorsSchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
  status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING', 'COMPLETED']).optional(),
  search: z.string().optional(),
  startDate: z.string().optional().refine(val => !val || !isNaN(Date.parse(val)), {
    message: "Fecha de inicio inválida"
  }),
  endDate: z.string().optional().refine(val => !val || !isNaN(Date.parse(val)), {
    message: "Fecha de fin inválida"
  })
});

export type GetVisitorsRequest = z.infer<typeof GetVisitorsSchema>;

// Esquema para validar datos de creación en POST /api/visitors
export const CreateVisitorSchema = z.object({
  name: z.string().min(3, {
    message: "El nombre debe tener al menos 3 caracteres"
  }).max(100, {
    message: "El nombre no puede exceder 100 caracteres"
  }),
  documentType: z.enum(['DNI', 'PASSPORT', 'FOREIGN_ID', 'DRIVER_LICENSE', 'OTHER'], {
    errorMap: () => ({ message: "Tipo de documento inválido" })
  }),
  documentNumber: z.string().min(3, {
    message: "El número de documento debe tener al menos 3 caracteres"
  }).max(20, {
    message: "El número de documento no puede exceder 20 caracteres"
  }),
  destination: z.string().min(2, {
    message: "El destino debe tener al menos 2 caracteres"
  }).max(100, {
    message: "El destino no puede exceder 100 caracteres"
  }),
  residentName: z.string().min(3, {
    message: "El nombre del residente debe tener al menos 3 caracteres"
  }).max(100, {
    message: "El nombre del residente no puede exceder 100 caracteres"
  }),
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
  temperature: z.number().min(30, {
    message: "La temperatura debe ser al menos 30°C"
  }).max(45, {
    message: "La temperatura no puede exceder 45°C"
  }).optional(),
  belongings: z.array(z.string()).optional(),
  signature: z.string().optional(),
  registeredBy: z.number().int().positive({
    message: "ID de registrador inválido"
  }),
  preRegisterId: z.number().int().positive().optional(),
  accessPassId: z.number().int().positive().optional()
});

export type CreateVisitorRequest = z.infer<typeof CreateVisitorSchema>;

// Esquema para validar parámetros de consulta en GET /api/visitors/stats
export const GetVisitorStatsSchema = z.object({
  startDate: z.string().optional().refine(val => !val || !isNaN(Date.parse(val)), {
    message: "Fecha de inicio inválida"
  }),
  endDate: z.string().optional().refine(val => !val || !isNaN(Date.parse(val)), {
    message: "Fecha de fin inválida"
  })
});

export type GetVisitorStatsRequest = z.infer<typeof GetVisitorStatsSchema>;
