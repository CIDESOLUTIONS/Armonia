import { NextRequest, NextResponse } from 'next/server';
import reservationService from '@/services/reservationService';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { serverLogger } from '@/lib/logging/server-logger';
import { ReservationStatus } from '@prisma/client';

/**
 * GET /api/reservations
 * Obtiene la lista de reservas según filtros
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
    const userId = searchParams.get('userId') ? parseInt(searchParams.get('userId')!) : undefined;
    const propertyId = searchParams.get('propertyId') ? parseInt(searchParams.get('propertyId')!) : undefined;
    const commonAreaId = searchParams.get('commonAreaId') ? parseInt(searchParams.get('commonAreaId')!) : undefined;
    const status = searchParams.get('status') as ReservationStatus | undefined;
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    // Validar y convertir fechas
    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (startDateParam) {
      startDate = new Date(startDateParam);
      if (isNaN(startDate.getTime())) {
        return NextResponse.json(
          { error: 'Fecha de inicio inválida' },
          { status: 400 }
        );
      }
    }

    if (endDateParam) {
      endDate = new Date(endDateParam);
      if (isNaN(endDate.getTime())) {
        return NextResponse.json(
          { error: 'Fecha de fin inválida' },
          { status: 400 }
        );
      }
    }

    // Si el usuario no es administrador, solo puede ver sus propias reservas
    if (session.user.role !== 'ADMIN') {
      // Forzar filtro por userId del usuario autenticado
      const authenticatedUserId = session.user.id;
      
      // Si se especificó un userId diferente, verificar que sea el mismo
      if (userId !== undefined && userId !== authenticatedUserId) {
        return NextResponse.json(
          { error: 'No tiene permiso para ver reservas de otros usuarios' },
          { status: 403 }
        );
      }
      
      // Establecer userId al del usuario autenticado
      const filters = {
        userId: authenticatedUserId,
        propertyId,
        commonAreaId,
        status,
        startDate,
        endDate,
      };
      
      const reservations = await reservationService.getReservations(filters);
      return NextResponse.json(reservations);
    } else {
      // Para administradores, permitir todos los filtros
      const filters = {
        userId,
        propertyId,
        commonAreaId,
        status,
        startDate,
        endDate,
      };
      
      const reservations = await reservationService.getReservations(filters);
      return NextResponse.json(reservations);
    }
  } catch (error) {
    serverLogger.error('Error al obtener reservas', { error });
    return NextResponse.json(
      { error: 'Error al obtener reservas' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/reservations
 * Crea una nueva solicitud de reserva
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

    // Obtener datos del cuerpo de la solicitud
    const data = await req.json();

    // Validar datos requeridos
    if (!data.commonAreaId || !data.propertyId || !data.title || !data.startDateTime || !data.endDateTime) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Convertir fechas
    data.startDateTime = new Date(data.startDateTime);
    data.endDateTime = new Date(data.endDateTime);

    // Validar fechas
    if (isNaN(data.startDateTime.getTime()) || isNaN(data.endDateTime.getTime())) {
      return NextResponse.json(
        { error: 'Fechas inválidas' },
        { status: 400 }
      );
    }

    if (data.startDateTime >= data.endDateTime) {
      return NextResponse.json(
        { error: 'La fecha de fin debe ser posterior a la fecha de inicio' },
        { status: 400 }
      );
    }

    // Establecer userId al del usuario autenticado
    data.userId = session.user.id;

    // Crear reserva
    const reservation = await reservationService.createReservation(data);

    return NextResponse.json(reservation, { status: 201 });
  } catch (error) {
    serverLogger.error('Error al crear reserva', { error });
    
    // Manejar errores específicos
    if (error instanceof Error) {
      if (error.message === 'El horario solicitado no está disponible' || 
          error.message === 'Área común no encontrada') {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Error al crear reserva' },
      { status: 500 }
    );
  }
}
