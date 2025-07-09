import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { authMiddleware } from '@/lib/auth';
import { z } from 'zod';
import { ServerLogger } from '@/lib/logging/server-logger';

const CameraSchema = z.object({
  name: z.string().min(1, "El nombre es requerido."),
  ipAddress: z.string().ip({ version: 'v4', message: "Dirección IP inválida." }),
  port: z.number().int().min(1).max(65535, "Puerto inválido.").default(80),
  username: z.string().optional(),
  password: z.string().optional(),
  location: z.string().min(1, "La ubicación es requerida."),
  isActive: z.boolean().default(true),
});

export async function GET(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request, ['ADMIN', 'COMPLEX_ADMIN', 'STAFF']);
    if (!authResult.proceed) {
      return authResult.response;
    }
    const { payload } = authResult;

    const tenantPrisma = getPrisma(payload.schemaName);
    const cameras = await tenantPrisma.camera.findMany({
      where: { complexId: payload.complexId },
    });

    ServerLogger.info(`Cámaras listadas para el complejo ${payload.complexId}`);
    return NextResponse.json(cameras, { status: 200 });
  } catch (error) {
    ServerLogger.error('Error al obtener cámaras:', error);
    return NextResponse.json({ message: 'Error al obtener cámaras' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request, ['ADMIN', 'COMPLEX_ADMIN']);
    if (!authResult.proceed) {
      return authResult.response;
    }
    const { payload } = authResult;

    const body = await request.json();
    const validatedData = CameraSchema.parse(body);

    const tenantPrisma = getPrisma(payload.schemaName);
    const newCamera = await tenantPrisma.camera.create({
      data: {
        ...validatedData,
        complexId: payload.complexId,
      },
    });

    ServerLogger.info(`Cámara creada: ${newCamera.name} en complejo ${payload.complexId}`);
    return NextResponse.json(newCamera, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Error de validación', errors: error.errors }, { status: 400 });
    }
    ServerLogger.error('Error al crear cámara:', error);
    return NextResponse.json({ message: 'Error al crear cámara' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request, ['ADMIN', 'COMPLEX_ADMIN']);
    if (!authResult.proceed) {
      return authResult.response;
    }
    const { payload } = authResult;

    const { id, ...updateData } = await request.json();
    const validatedData = CameraSchema.partial().parse(updateData); // Partial para actualizaciones

    if (!id) {
      return NextResponse.json({ message: 'ID de cámara requerido para actualizar' }, { status: 400 });
    }

    const tenantPrisma = getPrisma(payload.schemaName);
    const updatedCamera = await tenantPrisma.camera.update({
      where: { id: parseInt(id) },
      data: validatedData,
    });

    ServerLogger.info(`Cámara actualizada: ${updatedCamera.name} en complejo ${payload.complexId}`);
    return NextResponse.json(updatedCamera, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Error de validación', errors: error.errors }, { status: 400 });
    }
    ServerLogger.error('Error al actualizar cámara:', error);
    return NextResponse.json({ message: 'Error al actualizar cámara' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request, ['ADMIN', 'COMPLEX_ADMIN']);
    if (!authResult.proceed) {
      return authResult.response;
    }
    const { payload } = authResult;

    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ message: 'ID de cámara requerido para eliminar' }, { status: 400 });
    }

    const tenantPrisma = getPrisma(payload.schemaName);
    await tenantPrisma.camera.delete({ where: { id: parseInt(id) } });

    ServerLogger.info(`Cámara eliminada: ID ${id} en complejo ${payload.complexId}`);
    return NextResponse.json({ message: 'Cámara eliminada exitosamente' }, { status: 200 });
  } catch (error) {
    ServerLogger.error('Error al eliminar cámara:', error);
    return NextResponse.json({ message: 'Error al eliminar cámara' }, { status: 500 });
  }
}
