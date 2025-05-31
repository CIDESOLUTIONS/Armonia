// src/app/api/common-areas/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ReservationService } from '@/services/reservationService';
import { ServerLogger } from '@/lib/logging/server-logger';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';

/**
 * GET /api/common-areas
 * Obtiene las áreas comunes disponibles
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
    const isActive = searchParams.get('isActive') !== 'false';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    
    // Obtener esquema del tenant
    const schema = session.user.tenantSchema || 'tenant';
    
    // Crear servicio de reservas
    const reservationService = new ReservationService(schema);
    
    // Obtener áreas comunes
    const result = await reservationService.getCommonAreas({
      isActive,
      page,
      limit
    });
    
    return NextResponse.json(result);
  } catch (error: any) {
    ServerLogger.error(`Error al obtener áreas comunes: ${error.message}`);
    
    return NextResponse.json(
      { error: 'Error al obtener áreas comunes', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/common-areas
 * Crea un área común (solo administradores)
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
    
    // Verificar que el usuario es administrador
    if (!session.user.isAdmin) {
      return NextResponse.json(
        { error: 'No tienes permisos para crear áreas comunes' },
        { status: 403 }
      );
    }
    
    // Obtener datos del cuerpo de la solicitud
    const body = await request.json();
    
    // Validar datos requeridos
    if (!body.name || !body.location) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: name, location' },
        { status: 400 }
      );
    }
    
    // Obtener esquema del tenant
    const schema = session.user.tenantSchema || 'tenant';
    
    // Crear servicio de reservas
    const reservationService = new ReservationService(schema);
    
    // Crear área común
    // Nota: Esta funcionalidad no está implementada en el servicio actual
    // Se debe implementar en una iteración futura
    
    return NextResponse.json(
      { error: 'Funcionalidad no implementada' },
      { status: 501 }
    );
  } catch (error: any) {
    ServerLogger.error(`Error al crear área común: ${error.message}`);
    
    return NextResponse.json(
      { error: 'Error al crear área común', details: error.message },
      { status: 500 }
    );
  }
}
