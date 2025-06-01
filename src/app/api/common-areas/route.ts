import { NextRequest, NextResponse } from 'next/server';
import reservationService from '@/services/reservationService';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { serverLogger } from '@/lib/logging/server-logger';

/**
 * GET /api/common-areas
 * Obtiene la lista de todas las áreas comunes disponibles
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
    const active = searchParams.get('active') === 'true' ? true : 
                  searchParams.get('active') === 'false' ? false : undefined;
    const requiresApproval = searchParams.get('requiresApproval') === 'true' ? true : 
                            searchParams.get('requiresApproval') === 'false' ? false : undefined;
    const hasFee = searchParams.get('hasFee') === 'true' ? true : 
                  searchParams.get('hasFee') === 'false' ? false : undefined;

    // Obtener áreas comunes
    const commonAreas = await reservationService.getCommonAreas({
      active,
      requiresApproval,
      hasFee,
    });

    return NextResponse.json(commonAreas);
  } catch (error) {
    serverLogger.error('Error al obtener áreas comunes', { error });
    return NextResponse.json(
      { error: 'Error al obtener áreas comunes' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/common-areas
 * Crea una nueva área común
 */
export async function POST(req: NextRequest) {
  try {
    // Verificar autenticación y permisos de administrador
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Obtener datos del cuerpo de la solicitud
    const data = await req.json();

    // Validar datos requeridos
    if (!data.name || !data.location) {
      return NextResponse.json(
        { error: 'Nombre y ubicación son requeridos' },
        { status: 400 }
      );
    }

    // Crear área común
    const commonArea = await reservationService.createCommonArea(data);

    return NextResponse.json(commonArea, { status: 201 });
  } catch (error) {
    serverLogger.error('Error al crear área común', { error });
    return NextResponse.json(
      { error: 'Error al crear área común' },
      { status: 500 }
    );
  }
}
