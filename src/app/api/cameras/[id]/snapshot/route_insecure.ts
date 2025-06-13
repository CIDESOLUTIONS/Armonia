import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import CameraService from '@/lib/services/camera-service';
import { getTenantSchema } from '@/lib/db';
import { ServerLogger } from '@/lib/logging/server-logger';

/**
 * Endpoint para tomar una instantánea de una cámara
 * POST /api/cameras/[id]/snapshot
 */
export async function POST(
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

    // Obtener datos de la solicitud
    const data = await req.json();
    const { description } = data;

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

    // Tomar instantánea
    const snapshot = await cameraService.takeSnapshot(
      id,
      session.user.id,
      description
    );

    // Devolver respuesta
    return NextResponse.json(snapshot);
  } catch (error) {
    ServerLogger.error(`Error en POST /api/cameras/${params.id}/snapshot:`, error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Error al tomar instantánea',
      },
      { status: 500 }
    );
  }
}

/**
 * Endpoint para obtener instantáneas de una cámara
 * GET /api/cameras/[id]/snapshot
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

    // Obtener instantáneas
    const snapshots = await cameraService.getCameraSnapshots(id, {
      page: parseInt(page),
      limit: parseInt(limit),
      startDate,
      endDate
    });

    // Devolver respuesta
    return NextResponse.json(snapshots);
  } catch (error) {
    ServerLogger.error(`Error en GET /api/cameras/${params.id}/snapshot:`, error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Error al obtener instantáneas',
      },
      { status: 500 }
    );
  }
}
