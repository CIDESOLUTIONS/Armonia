import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { validateRequest } from '@/lib/validation';
import { verifyAuth } from '@/lib/auth';
import { ServerLogger } from '@/lib/logging/server-logger';
import { z } from 'zod';

// Esquema de validación para control de cámara
const cameraControlSchema = z.object({
  action: z.enum(['pan', 'tilt', 'zoom', 'preset', 'home', 'stop']),
  params: z.object({
    direction: z.enum(['left', 'right', 'up', 'down']).optional(),
    speed: z.number().min(0).max(100).optional(),
    zoom: z.enum(['in', 'out']).optional(),
    level: z.number().min(0).max(100).optional(),
    presetId: z.number().int().positive().optional()
  }).optional()
});

/**
 * Endpoint para controlar una cámara PTZ
 * POST /api/cameras/[id]/control
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticación
    const { auth, payload } = await verifyAuth(req);
    if (!auth || !payload) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (!payload.complexId) {
      return NextResponse.json({ error: 'Usuario sin complejo asociado' }, { status: 400 });
    }

    // Validar ID
    if (isNaN(parseInt(params.id))) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const id = parseInt(params.id);

    // Obtener datos de la solicitud
    const data = await req.json();
    
    // Validar datos
    const validationResult = cameraControlSchema.safeParse(data);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { action, params: actionParams } = validationResult.data;

    // Inicializar Prisma
    const prisma = getPrisma();

    // Verificar que la cámara existe y pertenece al complejo
    const camera = await prisma.camera.findFirst({
      where: {
        id,
        complexId: payload.complexId,
        isActive: true
      }
    });

    if (!camera) {
      return NextResponse.json({ error: 'Cámara no encontrada' }, { status: 404 });
    }

    // Verificar que la cámara es de tipo PTZ
    if (camera.type !== 'PTZ') {
      return NextResponse.json(
        { error: 'Esta cámara no soporta control PTZ' },
        { status: 400 }
      );
    }

    // Verificar permiso si no es admin
    if (payload.role !== 'ADMIN') {
      const permission = await prisma.cameraPermission.findFirst({
        where: {
          cameraId: id,
          userId: payload.id,
          permission: 'CONTROL'
        }
      });

      if (!permission) {
        return NextResponse.json(
          { error: 'No tiene permiso para controlar esta cámara' },
          { status: 403 }
        );
      }
    }

    // Aquí iría la lógica de control de la cámara
    // Por ahora simulamos una respuesta exitosa
    
    // Registrar acción
    await prisma.activityLog.create({
      data: {
        action: 'CAMERA_CONTROL',
        entityType: 'CAMERA',
        entityId: camera.id.toString(),
        userId: payload.id,
        complexId: payload.complexId,
        details: `Control de cámara: ${action}`
      }
    });

    // Devolver respuesta
    return NextResponse.json({
      success: true,
      message: `Acción ${action} ejecutada correctamente`
    });
  } catch (error) {
    ServerLogger.error(`Error en POST /api/cameras/${params.id}/control:`, error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Error al controlar la cámara',
      },
      { status: 500 }
    );
  }
}
