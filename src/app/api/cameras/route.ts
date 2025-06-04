import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import CameraService from '@/lib/services/camera-service';
import { getTenantSchema } from '@/lib/db';
import { ServerLogger } from '@/lib/logging/server-logger';

/**
 * Endpoint para obtener todas las cámaras
 * GET /api/cameras
 */
export async function GET(req: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Obtener parámetros
    const searchParams = req.nextUrl.searchParams;
    const includeInactive = searchParams.get('includeInactive') === 'true';
    
    // Obtener esquema del tenant
    const schema = getTenantSchema(req);
    
    // Inicializar servicio
    const cameraService = new CameraService(schema);
    
    // Obtener cámaras
    const cameras = await cameraService.getCameras(includeInactive);
    
    // Devolver respuesta
    return NextResponse.json(cameras);
  } catch (error) {
    ServerLogger.error('Error en GET /api/cameras:', error);
    return NextResponse.json(
      { error: 'Error al obtener cámaras' },
      { status: 500 }
    );
  }
}

/**
 * Endpoint para crear una nueva cámara
 * POST /api/cameras
 */
export async function POST(req: NextRequest) {
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
    
    // Obtener datos de la solicitud
    const data = await req.json();
    
    // Obtener esquema del tenant
    const schema = getTenantSchema(req);
    
    // Inicializar servicio
    const cameraService = new CameraService(schema);
    
    // Crear cámara
    const camera = await cameraService.createCamera(data, session.user.id);
    
    // Devolver respuesta
    return NextResponse.json(camera, { status: 201 });
  } catch (error) {
    ServerLogger.error('Error en POST /api/cameras:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al crear cámara' },
      { status: 500 }
    );
  }
}

/**
 * Endpoint para descubrir cámaras en la red
 * POST /api/cameras/discover
 */
export async function handleDiscoverAction(req: NextRequest, { params }: { params: { action: string } }) {
  // Verificar que la acción es discover
  if (params.action !== 'discover') {
    return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
  }
  
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
    
    // Obtener esquema del tenant
    const schema = getTenantSchema(req);
    
    // Inicializar servicio
    const cameraService = new CameraService(schema);
    
    // Descubrir cámaras
    const discoveredCameras = await cameraService.discoverCameras();
    
    // Devolver respuesta
    return NextResponse.json({
      success: true,
      cameras: discoveredCameras
    });
  } catch (error) {
    ServerLogger.error('Error en POST /api/cameras/discover:', error);
    return NextResponse.json(
      { error: 'Error al descubrir cámaras' },
      { status: 500 }
    );
  }
}
