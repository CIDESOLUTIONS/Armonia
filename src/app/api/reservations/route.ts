import { NextRequest, NextResponse } from 'next/server';
import reservationService from '@/services/reservationService';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { serverLogger } from '@/lib/logging/server-logger';
import { withValidation, validateRequest } from '@/lib/validation';
import { 
  GetReservationsSchema, 
  CreateReservationSchema,
  type CreateReservationRequest 
} from '@/validators/reservations/reservations.validator';

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
    const queryParams = {
      userId: searchParams.get('userId'),
      propertyId: searchParams.get('propertyId'),
      commonAreaId: searchParams.get('commonAreaId'),
      status: searchParams.get('status'),
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate')
    };

    // Validar parámetros
    const validation = validateRequest(GetReservationsSchema, queryParams);
    if (!validation.success) {
      return validation.response;
    }

    const validatedParams = validation.data;

    // Si el usuario no es administrador, solo puede ver sus propias reservas
    if (session.user.role !== 'ADMIN') {
      // Forzar filtro por userId del usuario autenticado
      const authenticatedUserId = session.user.id;
      
      // Si se especificó un userId diferente, verificar que sea el mismo
      if (validatedParams.userId !== undefined && validatedParams.userId !== authenticatedUserId) {
        return NextResponse.json(
          { error: 'No tiene permiso para ver reservas de otros usuarios' },
          { status: 403 }
        );
      }
      
      // Establecer userId al del usuario autenticado
      const filters = {
        userId: authenticatedUserId,
        propertyId: validatedParams.propertyId,
        commonAreaId: validatedParams.commonAreaId,
        status: validatedParams.status,
        startDate: validatedParams.startDate ? new Date(validatedParams.startDate) : undefined,
        endDate: validatedParams.endDate ? new Date(validatedParams.endDate) : undefined,
      };
      
      const reservations = await reservationService.getReservations(filters);
      return NextResponse.json(reservations);
    } else {
      // Para administradores, permitir todos los filtros
      const filters = {
        userId: validatedParams.userId,
        propertyId: validatedParams.propertyId,
        commonAreaId: validatedParams.commonAreaId,
        status: validatedParams.status,
        startDate: validatedParams.startDate ? new Date(validatedParams.startDate) : undefined,
        endDate: validatedParams.endDate ? new Date(validatedParams.endDate) : undefined,
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
async function createReservationHandler(validatedData: CreateReservationRequest, req: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Convertir fechas
    const startDateTime = new Date(validatedData.startDateTime);
    const endDateTime = new Date(validatedData.endDateTime);

    // Establecer userId al del usuario autenticado
    const reservationData = {
      ...validatedData,
      startDateTime,
      endDateTime,
      userId: session.user.id
    };

    // Crear reserva
    const reservation = await reservationService.createReservation(reservationData);

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

// Exportar POST con validación
export const POST = withValidation(CreateReservationSchema, createReservationHandler);
