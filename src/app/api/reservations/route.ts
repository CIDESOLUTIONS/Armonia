// src/app/api/reservations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ReservationService } from '@/services/reservationService';
import { ServerLogger } from '@/lib/logging/server-logger';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';

/**
 * GET /api/reservations
 * Obtiene las reservas según los filtros especificados
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
    const userId = searchParams.get('userId') ? parseInt(searchParams.get('userId') || '0', 10) : undefined;
    const propertyId = searchParams.get('propertyId') ? parseInt(searchParams.get('propertyId') || '0', 10) : undefined;
    const commonAreaId = searchParams.get('commonAreaId') ? parseInt(searchParams.get('commonAreaId') || '0', 10) : undefined;
    const status = searchParams.get('status') || undefined;
    const startDateStr = searchParams.get('startDate');
    const endDateStr = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    
    // Convertir fechas si están presentes
    const startDate = startDateStr ? new Date(startDateStr) : undefined;
    const endDate = endDateStr ? new Date(endDateStr) : undefined;
    
    // Validar fechas
    if ((startDate && isNaN(startDate.getTime())) || (endDate && isNaN(endDate.getTime()))) {
      return NextResponse.json(
        { error: 'Formato de fecha inválido' },
        { status: 400 }
      );
    }
    
    // Obtener esquema del tenant
    const schema = session.user.tenantSchema || 'tenant';
    
    // Crear servicio de reservas
    const reservationService = new ReservationService(schema);
    
    // Si no es administrador, solo puede ver sus propias reservas
    const finalUserId = session.user.isAdmin ? userId : session.user.id;
    
    // Obtener reservas
    const result = await reservationService.getReservations({
      userId: finalUserId,
      propertyId,
      commonAreaId,
      status: status as any,
      startDate,
      endDate,
      page,
      limit
    });
    
    return NextResponse.json(result);
  } catch (error: any) {
    ServerLogger.error(`Error al obtener reservas: ${error.message}`);
    
    return NextResponse.json(
      { error: 'Error al obtener reservas', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/reservations
 * Crea una nueva reserva
 */
export async function POST(request: NextRequest) {
  try {
    // Obtener sesión del usuario
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }
    
    // Obtener datos del cuerpo de la solicitud
    const body = await request.json();
    
    // Validar datos requeridos
    if (!body.commonAreaId || !body.propertyId || !body.title || !body.startDateTime || !body.endDateTime) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: commonAreaId, propertyId, title, startDateTime, endDateTime' },
        { status: 400 }
      );
    }
    
    // Convertir fechas
    const startDateTime = new Date(body.startDateTime);
    const endDateTime = new Date(body.endDateTime);
    
    // Validar fechas
    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
      return NextResponse.json(
        { error: 'Formato de fecha inválido' },
        { status: 400 }
      );
    }
    
    // Validar que la fecha de inicio sea anterior a la fecha de fin
    if (startDateTime >= endDateTime) {
      return NextResponse.json(
        { error: 'La fecha de inicio debe ser anterior a la fecha de fin' },
        { status: 400 }
      );
    }
    
    // Obtener esquema del tenant
    const schema = session.user.tenantSchema || 'tenant';
    
    // Crear servicio de reservas
    const reservationService = new ReservationService(schema);
    
    // Crear reserva
    const reservation = await reservationService.createReservation({
      commonAreaId: body.commonAreaId,
      userId: session.user.id,
      propertyId: body.propertyId,
      title: body.title,
      description: body.description,
      startDateTime,
      endDateTime,
      attendees: body.attendees || 1
    });
    
    return NextResponse.json(reservation);
  } catch (error: any) {
    ServerLogger.error(`Error al crear reserva: ${error.message}`);
    
    return NextResponse.json(
      { error: 'Error al crear reserva', details: error.message },
      { status: 500 }
    );
  }
}
