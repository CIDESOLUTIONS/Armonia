import { NextRequest, NextResponse } from 'next/server';
import reservationService from '@/services/reservationService';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { serverLogger } from '@/lib/logging/server-logger';

/**
 * GET /api/common-areas/[id]
 * Obtiene los detalles de un área común específica
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

    // Obtener área común
    const commonArea = await reservationService.getCommonAreaById(id);
    if (!commonArea) {
      return NextResponse.json(
        { error: 'Área común no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(commonArea);
  } catch (error) {
    serverLogger.error('Error al obtener área común', { error, id: params.id });
    return NextResponse.json(
      { error: 'Error al obtener área común' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/common-areas/[id]
 * Actualiza un área común existente
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

    // Actualizar área común
    const commonArea = await reservationService.updateCommonArea(id, data);

    return NextResponse.json(commonArea);
  } catch (error) {
    serverLogger.error('Error al actualizar área común', { error, id: params.id });
    return NextResponse.json(
      { error: 'Error al actualizar área común' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/common-areas/[id]
 * Desactiva un área común (no elimina, solo marca como inactiva)
 */
export async function DELETE(
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

    // Desactivar área común
    const commonArea = await reservationService.deactivateCommonArea(id);

    return NextResponse.json(commonArea);
  } catch (error) {
    serverLogger.error('Error al desactivar área común', { error, id: params.id });
    return NextResponse.json(
      { error: 'Error al desactivar área común' },
      { status: 500 }
    );
  }
}
