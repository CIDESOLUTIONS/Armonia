import { z } from 'zod';

// Esquema para validar parámetros de consulta en GET /api/notifications
export const GetNotificationsSchema = z.object({
  isRead: z.string().optional().transform(val => {
    if (val === 'true') return true;
    if (val === 'false') return false;
    return undefined;
  }),
  type: z.string().optional()
});

export type GetNotificationsRequest = z.infer<typeof GetNotificationsSchema>;

// Esquema para validar datos de marcado de notificación en PUT /api/notifications/[id]
export const MarkNotificationSchema = z.object({
  isRead: z.boolean({
    required_error: "El estado de lectura es requerido",
    invalid_type_error: "El estado de lectura debe ser un booleano"
  })
});

export type MarkNotificationRequest = z.infer<typeof MarkNotificationSchema>;

// Esquema para validar parámetros de ruta en GET, PUT /api/notifications/[id]
export const NotificationIdSchema = z.object({
  id: z.string().refine(val => !isNaN(parseInt(val)), {
    message: "ID de notificación debe ser un número"
  })
});

export type NotificationIdRequest = z.infer<typeof NotificationIdSchema>;

// Esquema para validar datos de envío de notificación en POST /api/notifications/send
export const SendNotificationSchema = z.object({
  userId: z.number().int().positive({
    message: "ID de usuario inválido"
  }),
  title: z.string().min(3, {
    message: "El título debe tener al menos 3 caracteres"
  }).max(100, {
    message: "El título no puede exceder 100 caracteres"
  }),
  message: z.string().min(5, {
    message: "El mensaje debe tener al menos 5 caracteres"
  }).max(500, {
    message: "El mensaje no puede exceder 500 caracteres"
  }),
  type: z.enum(['INFO', 'WARNING', 'ERROR', 'SUCCESS'], {
    errorMap: () => ({ message: "Tipo de notificación inválido" })
  }),
  link: z.string().url({
    message: "El enlace debe ser una URL válida"
  }).optional(),
  data: z.record(z.unknown()).optional()
});

export type SendNotificationRequest = z.infer<typeof SendNotificationSchema>;
