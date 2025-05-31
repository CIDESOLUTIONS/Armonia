// src/app/api/notifications/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ReservationService } from '@/services/reservationService';
import { ServerLogger } from '@/lib/logging/server-logger';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';

interface Params {
  params: {
    id: string;
  };
}

/**
 * PUT /api/notifications/[id]
 * Marca una notificación como leída
 */
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    // Obtener sesión del usuario
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }
    
    // Obtener ID de la notificación
    const id = parseInt(params.id, 10);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID de notificación inválido' },
        { status: 400 }
      );
    }
    
    // Obtener esquema del tenant
    const schema = session.user.tenantSchema || 'tenant';
    
    // Crear servicio de reservas
    const reservationService = new ReservationService(schema);
    
    // Marcar notificación como leída
    const notification = await reservationService.markNotificationAsRead(id, session.user.id);
    
    return NextResponse.json(notification);
  } catch (error: any) {
    ServerLogger.error(`Error al marcar notificación como leída: ${error.message}`);
    
    return NextResponse.json(
      { error: 'Error al marcar notificación como leída', details: error.message },
      { status: 500 }
    );
  }
}
