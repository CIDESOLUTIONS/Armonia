import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import CameraService from '@/lib/services/camera-service';
import { getTenantSchema } from '@/lib/db';
import { ServerLogger } from '@/lib/logging/server-logger';

/**
 * Endpoint para obtener grabaciones de una cámara
 * GET /api/cameras/[id]/recording
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Obtener ID de la cámara
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    // Obtener parámetros
    const searchParams = req.nextUrl.searchParams;
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const status = searchParams.get('status');

    // Obtener esquema del tenant
    const schema = getTenantSchema(req);

    // Inicializar servicio
    const cameraService = new CameraService(schema);

    // Verificar permiso
    const hasPermission = await cameraService.checkUserPermission(
      id,
      session.user.id,
      'view'
    );
    if (!hasPermission && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No tiene permiso para ver esta cámara' },
        { status: 403 }
      );
    }

    // Obtener grabaciones
    const recordings = await cameraService.getCameraRecordings(id, {
      page: parseInt(page),
      limit: parseInt(limit),
      startDate,
      endDate,
      status
    });

    // Devolver respuesta
    return NextResponse.json(recordings);
  } catch (error) {
    ServerLogger.error(`Error en GET /api/cameras/${params.id}/recording:`, error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Error al obtener grabaciones',
      },
      { status: 500 }
    );
  }
}
