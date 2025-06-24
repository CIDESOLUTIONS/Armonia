import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { pushNotificationService, SendNotificationRequest } from '@/lib/notifications/push-notification-service';
import { withValidation } from '@/lib/validation';
import { 
  SendNotificationSchema,
  type SendNotificationRequest as ValidatedSendNotificationRequest
} from '@/validators/notifications/notification.validator';

/**
 * POST /api/notifications/send
 * Enviar notificación push
 */
async function sendNotificationHandler(
  validatedData: ValidatedSendNotificationRequest,
  request: NextRequest
) {
  try {
    const { auth, payload: authPayload } = await verifyAuth(request);
    if (!auth || !authPayload) {
      return NextResponse.json({ message: 'Token requerido' }, { status: 401 });
    }

    // Solo admins y complex_admins pueden enviar notificaciones
    if (!['ADMIN', 'COMPLEX_ADMIN'].includes(authPayload.role)) {
      return NextResponse.json({ 
        message: 'Solo administradores pueden enviar notificaciones' 
      }, { status: 403 });
    }

    // Verificar que el usuario tenga acceso al complejo objetivo
    const targetComplexId = validatedData.complexId || authPayload.complexId;
    if (!targetComplexId) {
      return NextResponse.json({ 
        message: 'Complex ID requerido' 
      }, { status: 400 });
    }

    if (authPayload.role === 'COMPLEX_ADMIN' && authPayload.complexId !== targetComplexId) {
      return NextResponse.json({ 
        message: 'No tienes permisos para enviar notificaciones a este complejo' 
      }, { status: 403 });
    }

    // Preparar request de notificación
    const notificationRequest: SendNotificationRequest = {
      userId: validatedData.userId,
      title: validatedData.title,
      message: validatedData.message,
      type: validatedData.type,
      link: validatedData.link,
      data: validatedData.data,
      complexId: targetComplexId
    };

    // Enviar notificación
    const result = await pushNotificationService.sendNotification(notificationRequest);

    if (!result.success) {
      return NextResponse.json({ 
        message: 'Error enviando notificación',
        errors: result.errors
      }, { status: 500 });
    }

    console.log(`[NOTIFICATION SENT] ${validatedData.title} enviado por ${authPayload.email} a complejo ${targetComplexId}`);

    return NextResponse.json({
      success: true,
      message: 'Notificación enviada exitosamente',
      messageId: result.messageId,
      stats: {
        successCount: result.successCount,
        failureCount: result.failureCount
      }
    });

  } catch (error) {
    console.error('[NOTIFICATION API] Error:', error);
    return NextResponse.json({ 
      message: error instanceof Error ? error.message : 'Error interno del servidor' 
    }, { status: 500 });
  }
}

/**
 * GET /api/notifications/send
 * Obtener historial de notificaciones (para futuras versiones)
 */
export async function GET(request: NextRequest) {
  try {
    const { auth, payload } = await verifyAuth(request);
    if (!auth || !payload) {
      return NextResponse.json({ message: 'Token requerido' }, { status: 401 });
    }

    if (!['ADMIN', 'COMPLEX_ADMIN'].includes(payload.role)) {
      return NextResponse.json({ 
        message: 'Solo administradores pueden ver el historial' 
      }, { status: 403 });
    }

    // Por ahora retornar mock data
    // En futuras versiones, consultar tabla notifications_log
    const mockHistory = [
      {
        id: 1,
        title: 'Recordatorio de Pago',
        body: 'Tu cuota de administración está próxima a vencer',
        sentAt: new Date().toISOString(),
        status: 'sent',
        recipientCount: 25
      }
    ];

    return NextResponse.json({
      success: true,
      notifications: mockHistory
    });

  } catch (error) {
    console.error('[NOTIFICATION HISTORY] Error:', error);
    return NextResponse.json({ 
      message: 'Error obteniendo historial' 
    }, { status: 500 });
  }
}

// Exportar POST con validación
export const POST = withValidation(SendNotificationSchema, sendNotificationHandler);
