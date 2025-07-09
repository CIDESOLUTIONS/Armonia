import { NextRequest, NextResponse } from 'next/server';
import * as reservationService from '@/services/reservationService';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ServerLogger } from '@/lib/logging/server-logger';

/**
 * GET /api/reservations/[id]
 * Obtiene los detalles de una reserva específica
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

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    // Obtener reserva
    const reservation = await reservationService.getReservationById(id);
    if (!reservation) {
      return NextResponse.json(
        { error: 'Reserva no encontrada' },
        { status: 404 }
      );
    }

    // Verificar permisos (solo administradores o el propietario pueden ver la reserva)
    if (session.user.role !== 'ADMIN' && reservation.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'No tiene permiso para ver esta reserva' },
        { status: 403 }
      );
    }

    return NextResponse.json(reservation);
  } catch (error) {
    serverLogger.error('Error al obtener reserva', { error, id: params.id });
    return NextResponse.json(
      { error: 'Error al obtener reserva' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/reservations/[id]
 * Actualiza una reserva existente
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

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    // Obtener reserva actual para verificar permisos
    const currentReservation = await reservationService.getReservationById(id);
    if (!currentReservation) {
      return NextResponse.json(
        { error: 'Reserva no encontrada' },
        { status: 404 }
      );
    }

    // Verificar permisos (solo administradores o el propietario pueden actualizar la reserva)
    if (session.user.role !== 'ADMIN' && currentReservation.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'No tiene permiso para actualizar esta reserva' },
        { status: 403 }
      );
    }

    // Obtener datos del cuerpo de la solicitud
    const data = await req.json();

    // Convertir fechas si están presentes
    if (data.startDateTime) {
      data.startDateTime = new Date(data.startDateTime);
      if (isNaN(data.startDateTime.getTime())) {
        return NextResponse.json(
          { error: 'Fecha de inicio inválida' },
          { status: 400 }
        );
      }
    }

    if (data.endDateTime) {
      data.endDateTime = new Date(data.endDateTime);
      if (isNaN(data.endDateTime.getTime())) {
        return NextResponse.json(
          { error: 'Fecha de fin inválida' },
          { status: 400 }
        );
      }
    }

    // Validar que la fecha de fin sea posterior a la de inicio
    if (data.startDateTime && data.endDateTime && data.startDateTime >= data.endDateTime) {
      return NextResponse.json(
        { error: 'La fecha de fin debe ser posterior a la fecha de inicio' },
        { status: 400 }
      );
    }

    // Actualizar reserva
    const updatedReservation = await reservationService.updateReservation(id, data);

    return NextResponse.json(updatedReservation);
  } catch (error) {
    serverLogger.error('Error al actualizar reserva', { error, id: params.id });
    
    // Manejar errores específicos
    if (error instanceof Error) {
      if (error.message === 'El horario solicitado no está disponible' || 
          error.message === 'Reserva no encontrada') {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Error al actualizar reserva' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/reservations/[id]
 * Cancela una reserva
 */
export async function DELETE(
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

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    // Obtener datos del cuerpo de la solicitud
    const data = await req.json();
    const cancellationReason = data.cancellationReason || 'Cancelada por el usuario';

    // Cancelar reserva
    const cancelledReservation = await reservationService.cancelReservation(
      id,
      cancellationReason,
      session.user.id
    );

    return NextResponse.json(cancelledReservation);
  } catch (error) {
    serverLogger.error('Error al cancelar reserva', { error, id: params.id });
    
    // Manejar errores específicos
    if (error instanceof Error) {
      if (error.message.includes('cancelaciones') || 
          error.message === 'Reserva no encontrada' ||
          error.message === 'Solo el propietario puede cancelar la reserva' ||
          error.message === 'Solo se pueden cancelar reservas pendientes o aprobadas') {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Error al cancelar reserva' },
      { status: 500 }
    );
  }
}
