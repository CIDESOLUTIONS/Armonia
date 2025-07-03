import { NextRequest, NextResponse } from 'next/server';
import communicationService from '@/services/communicationService';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { serverLogger } from '@/lib/logging/server-logger';

/**
 * GET /api/communications/notifications
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
    const read = searchParams.get('read') === 'true' ? true : 
                searchParams.get('read') === 'false' ? false : undefined;
    const type = searchParams.get('type') || undefined;
    const sourceType = searchParams.get('sourceType') || undefined;
    const priority = searchParams.get('priority') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;

    // Obtener notificaciones del usuario
    const notifications = await communicationService.getUserNotifications(
      session.user.id,
      { read, type, sourceType, priority, limit }
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

/**
 * POST /api/communications/notifications
 * Crea una nueva notificación (solo para administradores)
 */
export async function POST(req: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Verificar permisos de administrador
    if (session.user.role !== 'admin' && session.user.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'No tiene permisos para crear notificaciones' },
        { status: 403 }
      );
    }

    // Obtener datos de la solicitud
    const data = await req.json();
    
    // Validar datos requeridos
    if (!data.recipientId || !data.type || !data.title || !data.message) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Crear notificación
    const notification = await communicationService.notifyUser(
      data.recipientId,
      {
        type: data.type,
        title: data.title,
        message: data.message,
        link: data.link,
        data: data.data,
        sourceType: data.sourceType || 'system',
        sourceId: data.sourceId,
        priority: data.priority,
        requireConfirmation: data.requireConfirmation,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined
      }
    );

    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    serverLogger.error('Error al crear notificación', { error });
    return NextResponse.json(
      { error: 'Error al crear notificación' },
      { status: 500 }
    );
  }
}
