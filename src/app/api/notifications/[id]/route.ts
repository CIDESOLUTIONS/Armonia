import { NextRequest, NextResponse } from 'next/server';
import reservationService from '@/services/reservationService';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { serverLogger } from '@/lib/logging/server-logger';
import { validateRequest, withValidation } from '@/lib/validation';
import { 
  NotificationIdSchema,
  MarkNotificationSchema,
  type NotificationIdRequest,
  type MarkNotificationRequest
} from '@/validators/notifications/notification.validator';
import prisma from '@/lib/prisma';

/**
 * GET /api/notifications/[id]
 * Obtiene los detalles de una notificación específica
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Validar parámetros de ruta
    const validation = validateRequest(NotificationIdSchema, params);
    if (!validation.success) {
      return validation.response;
    }

    const validatedParams = validation.data;
    const id = parseInt(validatedParams.id);

    // Obtener notificación
    const notification = await prisma.reservationNotification.findUnique({
      where: { id },
    });

    if (!notification) {
      return NextResponse.json(
        { error: 'Notificación no encontrada' },
        { status: 404 }
      );
    }

    // Verificar que la notificación pertenece al usuario
    if (notification.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'No tiene permiso para ver esta notificación' },
        { status: 403 }
      );
    }

    return NextResponse.json(notification);
  } catch (error) {
    serverLogger.error('Error al obtener notificación', { error, id: params.id });
    return NextResponse.json(
      { error: 'Error al obtener notificación' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/notifications/[id]/read
 * Marca una notificación como leída
 */
async function markNotificationHandler(
  validatedData: MarkNotificationRequest,
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Validar parámetros de ruta
    const routeValidation = validateRequest(NotificationIdSchema, params);
    if (!routeValidation.success) {
      return routeValidation.response;
    }

    const validatedParams = routeValidation.data;
    const id = parseInt(validatedParams.id);

    // Marcar notificación como leída
    const updatedNotification = await reservationService.markNotificationAsRead(
      id,
      session.user.id
    );

    return NextResponse.json(updatedNotification);
  } catch (error) {
    serverLogger.error('Error al marcar notificación como leída', { error, id: params.id });
    
    // Manejar errores específicos
    if (error instanceof Error) {
      if (error.message === 'Notificación no encontrada' || 
          error.message === 'No tiene permiso para acceder a esta notificación') {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Error al marcar notificación como leída' },
      { status: 500 }
    );
  }
}

// Exportar PUT con validación
export const PUT = withValidation(MarkNotificationSchema, markNotificationHandler);
