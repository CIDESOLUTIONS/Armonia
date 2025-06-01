import { NextRequest, NextResponse } from 'next/server';
import reservationService from '@/services/reservationService';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { serverLogger } from '@/lib/logging/server-logger';

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
    const isRead = searchParams.get('isRead') === 'true' ? true : 
                  searchParams.get('isRead') === 'false' ? false : undefined;
    const type = searchParams.get('type') || undefined;

    // Obtener notificaciones del usuario
    const notifications = await reservationService.getUserNotifications(
      session.user.id,
      { isRead, type }
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
