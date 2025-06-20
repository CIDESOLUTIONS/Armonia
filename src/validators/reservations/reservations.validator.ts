import { z } from 'zod';
import { ReservationStatus } from '@prisma/client';

// Esquema para validar parámetros de consulta en GET /api/reservations
export const GetReservationsSchema = z.object({
  userId: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  propertyId: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  commonAreaId: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  status: z.nativeEnum(ReservationStatus).optional(),
  startDate: z.string().optional().refine(val => !val || !isNaN(Date.parse(val)), {
    message: "Fecha de inicio inválida"
  }),
  endDate: z.string().optional().refine(val => !val || !isNaN(Date.parse(val)), {
    message: "Fecha de fin inválida"
  })
});

export type GetReservationsRequest = z.infer<typeof GetReservationsSchema>;

// Esquema para validar datos de creación en POST /api/reservations
export const CreateReservationSchema = z.object({
  commonAreaId: z.number().int().positive({
    message: "ID de área común debe ser un número entero positivo"
  }),
  propertyId: z.number().int().positive({
    message: "ID de propiedad debe ser un número entero positivo"
  }),
  title: z.string().min(3, {
    message: "El título debe tener al menos 3 caracteres"
  }).max(100, {
    message: "El título no puede exceder 100 caracteres"
  }),
  description: z.string().max(500, {
    message: "La descripción no puede exceder 500 caracteres"
  }).optional(),
  startDateTime: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: "Fecha y hora de inicio inválida"
  }),
  endDateTime: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: "Fecha y hora de fin inválida"
  }),
  attendees: z.number().int().min(1).optional(),
  specialRequests: z.string().max(500).optional()
}).refine(data => {
  const start = new Date(data.startDateTime);
  const end = new Date(data.endDateTime);
  return start < end;
}, {
  message: "La fecha de fin debe ser posterior a la fecha de inicio",
  path: ["endDateTime"]
});

export type CreateReservationRequest = z.infer<typeof CreateReservationSchema>;
