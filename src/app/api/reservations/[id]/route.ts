// src/app/api/reservations/[id]/route.ts
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
 * GET /api/reservations/[id]
 * Obtiene una reserva por su ID
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
    
    // Obtener ID de la reserva
    const id = parseInt(params.id, 10);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID de reserva inválido' },
        { status: 400 }
      );
    }
    
    // Obtener esquema del tenant
    const schema = session.user.tenantSchema || 'tenant';
    
    // Crear servicio de reservas
    const reservationService = new ReservationService(schema);
    
    // Obtener reserva
    const reservation = await reservationService.getReservationById(id);
    
    if (!reservation) {
      return NextResponse.json(
        { error: `Reserva con ID ${id} no encontrada` },
        { status: 404 }
      );
    }
    
    // Verificar que el usuario tiene acceso a la reserva
    if (!session.user.isAdmin && reservation.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'No tienes permisos para ver esta reserva' },
        { status: 403 }
      );
    }
    
    return NextResponse.json(reservation);
  } catch (error: any) {
    ServerLogger.error(`Error al obtener reserva: ${error.message}`);
    
    return NextResponse.json(
      { error: 'Error al obtener reserva', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/reservations/[id]/status
 * Actualiza el estado de una reserva
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
    
    // Obtener ID de la reserva
    const id = parseInt(params.id, 10);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID de reserva inválido' },
        { status: 400 }
      );
    }
    
    // Obtener datos del cuerpo de la solicitud
    const body = await request.json();
    
    // Validar datos requeridos
    if (!body.status) {
      return NextResponse.json(
        { error: 'Falta campo requerido: status' },
        { status: 400 }
      );
    }
    
    // Obtener esquema del tenant
    const schema = session.user.tenantSchema || 'tenant';
    
    // Crear servicio de reservas
    const reservationService = new ReservationService(schema);
    
    // Obtener reserva actual para verificar permisos
    const currentReservation = await reservationService.getReservationById(id);
    
    if (!currentReservation) {
      return NextResponse.json(
        { error: `Reserva con ID ${id} no encontrada` },
        { status: 404 }
      );
    }
    
    // Verificar permisos según el estado solicitado
    if (body.status === 'APPROVED' || body.status === 'REJECTED') {
      // Solo administradores pueden aprobar o rechazar
      if (!session.user.isAdmin) {
        return NextResponse.json(
          { error: 'No tienes permisos para aprobar o rechazar reservas' },
          { status: 403 }
        );
      }
    } else if (body.status === 'CANCELLED') {
      // Solo el creador o un administrador puede cancelar
      if (!session.user.isAdmin && currentReservation.userId !== session.user.id) {
        return NextResponse.json(
          { error: 'No tienes permisos para cancelar esta reserva' },
          { status: 403 }
        );
      }
    } else if (body.status === 'COMPLETED') {
      // Solo administradores pueden marcar como completada
      if (!session.user.isAdmin) {
        return NextResponse.json(
          { error: 'No tienes permisos para marcar reservas como completadas' },
          { status: 403 }
        );
      }
    }
    
    // Actualizar estado de la reserva
    const updatedReservation = await reservationService.updateReservationStatus({
      reservationId: id,
      status: body.status,
      adminId: session.user.isAdmin ? session.user.id : undefined,
      reason: body.reason
    });
    
    return NextResponse.json(updatedReservation);
  } catch (error: any) {
    ServerLogger.error(`Error al actualizar estado de reserva: ${error.message}`);
    
    return NextResponse.json(
      { error: 'Error al actualizar estado de reserva', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/reservations/[id]
 * Elimina una reserva (equivalente a cancelarla)
 */
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    // Obtener sesión del usuario
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }
    
    // Obtener ID de la reserva
    const id = parseInt(params.id, 10);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID de reserva inválido' },
        { status: 400 }
      );
    }
    
    // Obtener esquema del tenant
    const schema = session.user.tenantSchema || 'tenant';
    
    // Crear servicio de reservas
    const reservationService = new ReservationService(schema);
    
    // Obtener reserva actual para verificar permisos
    const currentReservation = await reservationService.getReservationById(id);
    
    if (!currentReservation) {
      return NextResponse.json(
        { error: `Reserva con ID ${id} no encontrada` },
        { status: 404 }
      );
    }
    
    // Verificar que el usuario tiene permisos para eliminar la reserva
    if (!session.user.isAdmin && currentReservation.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'No tienes permisos para eliminar esta reserva' },
        { status: 403 }
      );
    }
    
    // Obtener razón de la cancelación de los parámetros de consulta
    const searchParams = request.nextUrl.searchParams;
    const reason = searchParams.get('reason') || 'Cancelada por el usuario';
    
    // Cancelar la reserva (equivalente a eliminarla)
    const cancelledReservation = await reservationService.updateReservationStatus({
      reservationId: id,
      status: 'CANCELLED',
      reason
    });
    
    return NextResponse.json(cancelledReservation);
  } catch (error: any) {
    ServerLogger.error(`Error al eliminar reserva: ${error.message}`);
    
    return NextResponse.json(
      { error: 'Error al eliminar reserva', details: error.message },
      { status: 500 }
    );
  }
}
