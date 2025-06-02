import { NextRequest, NextResponse } from 'next/server';
import reservationService from '@/services/reservationService';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { serverLogger } from '@/lib/logging/server-logger';

/**
 * GET /api/common-areas/[id]/availability
 * Obtiene la configuración de disponibilidad de un área común
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

    // Obtener parámetros de consulta
    const searchParams = req.nextUrl.searchParams;
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
    } else {
      // Si no se proporciona fecha de inicio, usar fecha actual
      startDate = new Date();
    }

    if (endDateParam) {
      endDate = new Date(endDateParam);
      if (isNaN(endDate.getTime())) {
        return NextResponse.json(
          { error: 'Fecha de fin inválida' },
          { status: 400 }
        );
      }
    } else {
      // Si no se proporciona fecha de fin, usar fecha de inicio + 30 días
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 30);
    }

    // Verificar que la fecha de fin sea posterior a la de inicio
    if (endDate < startDate) {
      return NextResponse.json(
        { error: 'La fecha de fin debe ser posterior a la fecha de inicio' },
        { status: 400 }
      );
    }

    // Obtener disponibilidad
    const availability = await reservationService.checkAvailability(
      id,
      startDate,
      endDate
    );

    return NextResponse.json(availability);
  } catch (error) {
    serverLogger.error('Error al obtener disponibilidad', { error, id: params.id });
    
    // Manejar errores específicos
    if (error instanceof Error) {
      if (error.message === 'Área común no encontrada') {
        return NextResponse.json(
          { error: error.message },
          { status: 404 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Error al obtener disponibilidad' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/common-areas/[id]/availability
 * Actualiza la configuración de disponibilidad de un área común
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticación y permisos de administrador
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
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

    // Actualizar configuración de disponibilidad
    const availabilityConfig = await reservationService.setAvailabilityConfig(id, data);

    return NextResponse.json(availabilityConfig);
  } catch (error) {
    serverLogger.error('Error al actualizar disponibilidad', { error, id: params.id });
    return NextResponse.json(
      { error: 'Error al actualizar disponibilidad' },
      { status: 500 }
    );
  }
}
