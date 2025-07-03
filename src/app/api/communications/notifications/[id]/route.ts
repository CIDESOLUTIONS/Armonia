import { NextRequest, NextResponse } from 'next/server';
import communicationService from '@/services/communicationService';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { serverLogger } from '@/lib/logging/server-logger';

/**
 * GET /api/communications/notifications/[id]
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

    const id = params.id;
    if (!id) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    // Obtener notificación
    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      return NextResponse.json(
        { error: 'Notificación no encontrada' },
        { status: 404 }
      );
    }

    // Verificar que la notificación pertenece al usuario
    if (notification.recipientId !== session.user.id) {
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
 * PUT /api/communications/notifications/[id]/read
 * Marca una notificación como leída
 */
export async function PUT(
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

    const id = params.id;
    if (!id) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    // Marcar notificación como leída
    const updatedNotification = await communicationService.markNotificationAsRead(
      id,
      session.user.id
    );

    return NextResponse.json(updatedNotification);
  } catch (error) {
    serverLogger.error('Error al marcar notificación como leída', { error, id: params.id });
    
    // Manejar errores específicos
    if (error instanceof Error) {
      if (error.message === 'Notificación no encontrada o no pertenece al usuario') {
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
