// src/app/api/notifications/send/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { pushNotificationService, SendNotificationRequest } from '@/lib/notifications/push-notification-service';
import { z } from 'zod';

// Schema de validación para envío de notificaciones
const SendNotificationSchema = z.object({
  payload: z.object({
    title: z.string().min(1).max(100),
    body: z.string().min(1).max(500),
    icon: z.string().optional(),
    badge: z.string().optional(),
    image: z.string().optional(),
    data: z.record(z.any()).optional(),
    actions: z.array(z.object({
      action: z.string(),
      title: z.string(),
      icon: z.string().optional()
    })).optional()
  }),
  target: z.object({
    userId: z.number().optional(),
    userIds: z.array(z.number()).optional(),
    complexId: z.number().optional(),
    role: z.enum(['ADMIN', 'RESIDENT', 'RECEPTION', 'COMPLEX_ADMIN']).optional(),
    deviceTokens: z.array(z.string()).optional(),
    topic: z.string().optional()
  }).refine(target => {
    // Al menos un tipo de target debe estar presente
    return !!(target.userId || target.userIds || target.complexId || target.role || target.deviceTokens || target.topic);
  }, 'Al menos un tipo de target debe estar especificado'),
  options: z.object({
    priority: z.enum(['normal', 'high']).optional(),
    timeToLive: z.number().optional(),
    sound: z.string().optional(),
    clickAction: z.string().optional(),
    tag: z.string().optional(),
    requireInteraction: z.boolean().optional(),
    silent: z.boolean().optional()
  }).optional(),
  scheduleAt: z.string().datetime().optional()
});\n\n// POST: Enviar notificación push\nexport async function POST(request: NextRequest) {\n  try {\n    const { auth, payload: authPayload } = await verifyAuth(request);\n    if (!auth || !authPayload) {\n      return NextResponse.json({ message: 'Token requerido' }, { status: 401 });\n    }\n\n    // Solo admins y complex_admins pueden enviar notificaciones\n    if (!['ADMIN', 'COMPLEX_ADMIN'].includes(authPayload.role)) {\n      return NextResponse.json({ \n        message: 'Solo administradores pueden enviar notificaciones' \n      }, { status: 403 });\n    }\n\n    const body = await request.json();\n    const validation = SendNotificationSchema.safeParse(body);\n    \n    if (!validation.success) {\n      return NextResponse.json(\n        { \n          message: 'Datos inválidos', \n          errors: validation.error.format() \n        },\n        { status: 400 }\n      );\n    }\n\n    const data = validation.data;\n    \n    // Verificar que el usuario tenga acceso al complejo objetivo\n    const targetComplexId = data.target.complexId || authPayload.complexId;\n    if (!targetComplexId) {\n      return NextResponse.json({ \n        message: 'Complex ID requerido' \n      }, { status: 400 });\n    }\n\n    if (authPayload.role === 'COMPLEX_ADMIN' && authPayload.complexId !== targetComplexId) {\n      return NextResponse.json({ \n        message: 'No tienes permisos para enviar notificaciones a este complejo' \n      }, { status: 403 });\n    }\n\n    // Preparar request de notificación\n    const notificationRequest: SendNotificationRequest = {\n      payload: data.payload,\n      target: {\n        ...data.target,\n        complexId: targetComplexId\n      },\n      options: data.options,\n      scheduleAt: data.scheduleAt ? new Date(data.scheduleAt) : undefined,\n      complexId: targetComplexId\n    };\n\n    // Enviar notificación\n    const result = await pushNotificationService.sendNotification(notificationRequest);\n\n    if (!result.success) {\n      return NextResponse.json({ \n        message: 'Error enviando notificación',\n        errors: result.errors\n      }, { status: 500 });\n    }\n\n    console.log(`[NOTIFICATION SENT] ${data.payload.title} enviado por ${authPayload.email} a complejo ${targetComplexId}`);\n\n    return NextResponse.json({\n      success: true,\n      message: 'Notificación enviada exitosamente',\n      messageId: result.messageId,\n      stats: {\n        successCount: result.successCount,\n        failureCount: result.failureCount\n      }\n    });\n\n  } catch (error) {\n    console.error('[NOTIFICATION API] Error:', error);\n    return NextResponse.json({ \n      message: error instanceof Error ? error.message : 'Error interno del servidor' \n    }, { status: 500 });\n  }\n}\n\n// GET: Obtener historial de notificaciones (para futuras versiones)\nexport async function GET(request: NextRequest) {\n  try {\n    const { auth, payload } = await verifyAuth(request);\n    if (!auth || !payload) {\n      return NextResponse.json({ message: 'Token requerido' }, { status: 401 });\n    }\n\n    if (!['ADMIN', 'COMPLEX_ADMIN'].includes(payload.role)) {\n      return NextResponse.json({ \n        message: 'Solo administradores pueden ver el historial' \n      }, { status: 403 });\n    }\n\n    // Por ahora retornar mock data\n    // En futuras versiones, consultar tabla notifications_log\n    const mockHistory = [\n      {\n        id: 1,\n        title: 'Recordatorio de Pago',\n        body: 'Tu cuota de administración está próxima a vencer',\n        sentAt: new Date().toISOString(),\n        status: 'sent',\n        recipientCount: 25\n      }\n    ];\n\n    return NextResponse.json({\n      success: true,\n      notifications: mockHistory\n    });\n\n  } catch (error) {\n    console.error('[NOTIFICATION HISTORY] Error:', error);\n    return NextResponse.json({ \n      message: 'Error obteniendo historial' \n    }, { status: 500 });\n  }\n}\n