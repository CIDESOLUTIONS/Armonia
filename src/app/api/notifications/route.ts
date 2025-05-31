// src/app/api/notifications/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ReservationService } from '@/services/reservationService';
import { ServerLogger } from '@/lib/logging/server-logger';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';

/**
 * GET /api/notifications
 * Obtiene las notificaciones del usuario actual
 */
export async function GET(request: NextRequest) {
  try {
    // Obtener sesión del usuario
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }
    
    // Obtener parámetros de consulta
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    
    // Obtener esquema del tenant
    const schema = session.user.tenantSchema || 'tenant';
    
    // Crear servicio de reservas
    const reservationService = new ReservationService(schema);
    
    // Obtener notificaciones del usuario
    const result = await reservationService.getUserNotifications(
      session.user.id,
      page,
      limit
    );
    
    return NextResponse.json(result);
  } catch (error: any) {
    ServerLogger.error(`Error al obtener notificaciones: ${error.message}`);
    
    return NextResponse.json(
      { error: 'Error al obtener notificaciones', details: error.message },
      { status: 500 }
    );
  }
}
