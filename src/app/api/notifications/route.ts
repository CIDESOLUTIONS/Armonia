import { NextRequest, NextResponse } from 'next/server';
import reservationService from '@/services/reservationService';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { serverLogger } from '@/lib/logging/server-logger';
import { validateRequest } from '@/lib/validation';
import { 
  GetNotificationsSchema,
  type GetNotificationsRequest
} from '@/validators/notifications/notification.validator';

/**
 * GET /api/notifications
 * Obtiene las notificaciones del usuario actual
 */
export async function GET(req: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Obtener parámetros de consulta
    const searchParams = req.nextUrl.searchParams;
    const queryParams = {
      isRead: searchParams.get('isRead'),
      type: searchParams.get('type')
    };

    // Validar parámetros
    const validation = validateRequest(GetNotificationsSchema, queryParams);
    if (!validation.success) {
      return validation.response;
    }

    const validatedParams = validation.data;

    // Obtener notificaciones del usuario
    const notifications = await reservationService.getUserNotifications(
      session.user.id,
      validatedParams
    );

    return NextResponse.json(notifications);
  } catch (error) {
    serverLogger.error('Error al obtener notificaciones', { error });
    return NextResponse.json(
      { error: 'Error al obtener notificaciones' },
      { status: 500 }
    );
  }
}
