// src/app/api/common-areas/[id]/availability/route.ts
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
 * GET /api/common-areas/[id]/availability
 * Verifica la disponibilidad de un área común en un rango de fechas
 */
export async function GET(request: NextRequest, { params }: Params) {
  try {
    // Obtener sesión del usuario
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }
    
    // Obtener ID del área común
    const id = parseInt(params.id, 10);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID de área común inválido' },
        { status: 400 }
      );
    }
    
    // Obtener parámetros de consulta
    const searchParams = request.nextUrl.searchParams;
    const startDateTimeStr = searchParams.get('startDateTime');
    const endDateTimeStr = searchParams.get('endDateTime');
    
    if (!startDateTimeStr || !endDateTimeStr) {
      return NextResponse.json(
        { error: 'Faltan parámetros requeridos: startDateTime, endDateTime' },
        { status: 400 }
      );
    }
    
    const startDateTime = new Date(startDateTimeStr);
    const endDateTime = new Date(endDateTimeStr);
    
    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
      return NextResponse.json(
        { error: 'Formato de fecha inválido' },
        { status: 400 }
      );
    }
    
    // Obtener esquema del tenant
    const schema = session.user.tenantSchema || 'tenant';
    
    // Crear servicio de reservas
    const reservationService = new ReservationService(schema);
    
    // Verificar disponibilidad
    const availability = await reservationService.checkAvailability(
      id,
      startDateTime,
      endDateTime
    );
    
    return NextResponse.json(availability);
  } catch (error: any) {
    ServerLogger.error(`Error al verificar disponibilidad: ${error.message}`);
    
    return NextResponse.json(
      { error: 'Error al verificar disponibilidad', details: error.message },
      { status: 500 }
    );
  }
}
