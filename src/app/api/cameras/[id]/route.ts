import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { validateRequest } from '@/lib/validation';
import { verifyAuth } from '@/lib/auth';
import { ServerLogger } from '@/lib/logging/server-logger';
import { z } from 'zod';

// Esquema de validación para obtener cámara por ID
const cameraIdSchema = z.object({
  id: z.string().refine((val) => !isNaN(parseInt(val)), {
    message: "ID debe ser un número válido"
  })
});

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
    const { auth, payload } = await verifyAuth(req);
    if (!auth || !payload) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (!payload.complexId) {
      return NextResponse.json({ error: 'Usuario sin complejo asociado' }, { status: 400 });
    }

    // Validar ID
    const validationResult = cameraIdSchema.safeParse(params);
    if (!validationResult.success) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const id = parseInt(params.id);

    // Inicializar Prisma
    const prisma = getPrisma();

    // Obtener cámara con filtro multi-tenant
    const camera = await prisma.camera.findFirst({
      where: {
        id,
        complexId: payload.complexId
      }
    });

    if (!camera) {
      return NextResponse.json({ error: 'Cámara no encontrada' }, { status: 404 });
    }

    // Verificar permiso si no es admin
    if (payload.role !== 'ADMIN') {
      const permission = await prisma.cameraPermission.findFirst({
        where: {
          cameraId: id,
          userId: payload.id,
          permission: 'VIEW'
        }
      });

      if (!permission) {
        return NextResponse.json(
          { error: 'No tiene permiso para ver esta cámara' },
          { status: 403 }
        );
      }
    }

    // Devolver respuesta
    return NextResponse.json(camera);
  } catch (error) {
    ServerLogger.error(`Error en GET /api/cameras/${params.id}:`, error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Error al obtener la cámara',
      },
      { status: 500 }
    );
  }
}

// Esquema de validación para actualización de cámara
const cameraUpdateSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").optional(),
  location: z.string().min(1, "La ubicación es requerida").optional(),
  ipAddress: z.string().ip("Dirección IP inválida").optional(),
  port: z.number().int().positive().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
  model: z.string().optional(),
  brand: z.string().optional(),
  isActive: z.boolean().optional(),
  streamUrl: z.string().url("URL de stream inválida").optional(),
  type: z.enum(["PTZ", "FIXED", "DOME"]).optional(),
});

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
    const { auth, payload } = await verifyAuth(req);
    if (!auth || !payload) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar rol de administrador
    if (payload.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Se requiere rol de administrador' },
        { status: 403 }
      );
    }

    if (!payload.complexId) {
      return NextResponse.json({ error: 'Usuario sin complejo asociado' }, { status: 400 });
    }

    // Validar ID
    const validationResult = cameraIdSchema.safeParse(params);
    if (!validationResult.success) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const id = parseInt(params.id);

    // Obtener datos de la solicitud
    const data = await req.json();

    // Validar datos
    const updateValidation = cameraUpdateSchema.safeParse(data);
    if (!updateValidation.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: updateValidation.error.format() },
        { status: 400 }
      );
    }

    // Inicializar Prisma
    const prisma = getPrisma();

    // Verificar que la cámara existe y pertenece al complejo
    const existingCamera = await prisma.camera.findFirst({
      where: {
        id,
        complexId: payload.complexId
      }
    });

    if (!existingCamera) {
      return NextResponse.json({ error: 'Cámara no encontrada' }, { status: 404 });
    }

    // Actualizar cámara
    const camera = await prisma.camera.update({
      where: { id },
      data: updateValidation.data
    });

    // Registrar acción
    await prisma.activityLog.create({
      data: {
        action: 'UPDATE',
        entityType: 'CAMERA',
        entityId: camera.id.toString(),
        userId: payload.id,
        complexId: payload.complexId,
        details: `Cámara ${camera.name} actualizada`
      }
    });

    // Devolver respuesta
    return NextResponse.json(camera);
  } catch (error) {
    ServerLogger.error(`Error en PUT /api/cameras/${params.id}:`, error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Error al actualizar la cámara',
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
    const { auth, payload } = await verifyAuth(req);
    if (!auth || !payload) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar rol de administrador
    if (payload.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Se requiere rol de administrador' },
        { status: 403 }
      );
    }

    if (!payload.complexId) {
      return NextResponse.json({ error: 'Usuario sin complejo asociado' }, { status: 400 });
    }

    // Validar ID
    const validationResult = cameraIdSchema.safeParse(params);
    if (!validationResult.success) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const id = parseInt(params.id);

    // Inicializar Prisma
    const prisma = getPrisma();

    // Verificar que la cámara existe y pertenece al complejo
    const existingCamera = await prisma.camera.findFirst({
      where: {
        id,
        complexId: payload.complexId
      }
    });

    if (!existingCamera) {
      return NextResponse.json({ error: 'Cámara no encontrada' }, { status: 404 });
    }

    // Eliminar cámara (soft delete)
    const camera = await prisma.camera.update({
      where: { id },
      data: { isActive: false }
    });

    // Registrar acción
    await prisma.activityLog.create({
      data: {
        action: 'DELETE',
        entityType: 'CAMERA',
        entityId: camera.id.toString(),
        userId: payload.id,
        complexId: payload.complexId,
        details: `Cámara ${camera.name} desactivada`
      }
    });

    // Devolver respuesta
    return NextResponse.json({ success: true, message: 'Cámara desactivada correctamente' });
  } catch (error) {
    ServerLogger.error(`Error en DELETE /api/cameras/${params.id}:`, error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Error al eliminar la cámara',
      },
      { status: 500 }
    );
  }
}
