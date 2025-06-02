import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import CameraService from '@/lib/services/camera-service';
import { getTenantSchema } from '@/lib/db';
import { ServerLogger } from '@/lib/logging/server-logger';

/**
 * Endpoint para obtener una cámara específica
 * GET /api/cameras/[id]
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

    // Obtener cámara
    const camera = await cameraService.getCameraById(id);

    // Devolver respuesta
    return NextResponse.json(camera);
  } catch (error) {
    ServerLogger.error(`Error en GET /api/cameras/${params.id}:`, error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Error al obtener la cámara',
      },
      { status: 500 }
    );
  }
}

/**
 * Endpoint para actualizar una cámara
 * PUT /api/cameras/[id]
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar rol de administrador
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Se requiere rol de administrador' },
        { status: 403 }
      );
    }

    // Obtener ID de la cámara
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    // Obtener datos de la solicitud
    const data = await req.json();

    // Obtener esquema del tenant
    const schema = getTenantSchema(req);

    // Inicializar servicio
    const cameraService = new CameraService(schema);

    // Actualizar cámara
    const camera = await cameraService.updateCamera(
      id,
      data,
      session.user.id
    );

    // Devolver respuesta
    return NextResponse.json(camera);
  } catch (error) {
    ServerLogger.error(`Error en PUT /api/cameras/${params.id}:`, error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Error al actualizar la cámara',
      },
      { status: 500 }
    );
  }
}

/**
 * Endpoint para eliminar una cámara
 * DELETE /api/cameras/[id]
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar rol de administrador
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Se requiere rol de administrador' },
        { status: 403 }
      );
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

    // Eliminar cámara
    const result = await cameraService.deleteCamera(id, session.user.id);

    // Devolver respuesta
    return NextResponse.json(result);
  } catch (error) {
    ServerLogger.error(`Error en DELETE /api/cameras/${params.id}:`, error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Error al eliminar la cámara',
      },
      { status: 500 }
    );
  }
}
