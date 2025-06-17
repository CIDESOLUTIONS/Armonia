import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import CameraService from '@/lib/services/camera-service';
import { getTenantSchema } from '@/lib/db';
import { ServerLogger } from '@/lib/logging/server-logger';

/**
 * Endpoint para detener grabación de una cámara
 * POST /api/cameras/[id]/recording/stop
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

    // Obtener esquema del tenant
    const schema = getTenantSchema(req);

    // Inicializar servicio
    const cameraService = new CameraService(schema);

    // Verificar permiso
    const hasPermission = await cameraService.checkUserPermission(
      id,
      session.user.id,
      'record'
    );
    if (!hasPermission && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No tiene permiso para grabar esta cámara' },
        { status: 403 }
      );
    }

    // Detener grabación
    const recording = await cameraService.stopRecording(
      id,
      session.user.id
    );

    // Devolver respuesta
    return NextResponse.json(recording);
  } catch (error) {
    ServerLogger.error(`Error en POST /api/cameras/${params.id}/recording/stop:`, error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Error al detener grabación',
      },
      { status: 500 }
    );
  }
}
