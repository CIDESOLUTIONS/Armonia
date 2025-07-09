import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { authMiddleware } from '@/lib/auth';
import { z } from 'zod';
import { ServerLogger } from '@/lib/logging/server-logger';

const DigitalLogSchema = z.object({
  title: z.string().min(1, "El título es requerido."),
  content: z.string().min(1, "El contenido es requerido."),
  logDate: z.string().datetime("Fecha y hora inválidas."),
});

export async function GET(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request, ['ADMIN', 'COMPLEX_ADMIN', 'STAFF']);
    if (!authResult.proceed) {
      return authResult.response;
    }
    const { payload } = authResult;

    const tenantPrisma = getPrisma(payload.schemaName);
    const logs = await tenantPrisma.digitalLog.findMany({
      where: { complexId: payload.complexId },
      include: {
        createdBy: { select: { name: true } },
      },
      orderBy: { logDate: 'desc' },
    });

    const logsWithCreatedByName = logs.map(log => ({
      ...log,
      createdByName: log.createdBy?.name || 'N/A',
    }));

    ServerLogger.info(`Minutas digitales listadas para el complejo ${payload.complexId}`);
    return NextResponse.json(logsWithCreatedByName, { status: 200 });
  } catch (error) {
    ServerLogger.error('Error al obtener minutas digitales:', error);
    return NextResponse.json({ message: 'Error al obtener minutas digitales' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request, ['ADMIN', 'COMPLEX_ADMIN', 'STAFF']);
    if (!authResult.proceed) {
      return authResult.response;
    }
    const { payload } = authResult;

    const body = await request.json();
    const validatedData = DigitalLogSchema.parse(body);

    const tenantPrisma = getPrisma(payload.schemaName);
    const newLog = await tenantPrisma.digitalLog.create({
      data: {
        ...validatedData,
        complexId: payload.complexId,
        createdBy: payload.id,
      },
    });

    ServerLogger.info(`Minuta digital creada: ${newLog.title} por ${payload.email} en complejo ${payload.complexId}`);
    return NextResponse.json(newLog, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Error de validación', errors: error.errors }, { status: 400 });
    }
    ServerLogger.error('Error al crear minuta digital:', error);
    return NextResponse.json({ message: 'Error al crear minuta digital' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request, ['ADMIN', 'COMPLEX_ADMIN', 'STAFF']);
    if (!authResult.proceed) {
      return authResult.response;
    }
    const { payload } = authResult;

    const { id, ...updateData } = await request.json();
    const validatedData = DigitalLogSchema.partial().parse(updateData); // Partial para actualizaciones

    if (!id) {
      return NextResponse.json({ message: 'ID de minuta digital requerido para actualizar' }, { status: 400 });
    }

    const tenantPrisma = getPrisma(payload.schemaName);
    const updatedLog = await tenantPrisma.digitalLog.update({
      where: { id: parseInt(id) },
      data: validatedData,
    });

    ServerLogger.info(`Minuta digital actualizada: ${updatedLog.title} en complejo ${payload.complexId}`);
    return NextResponse.json(updatedLog, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Error de validación', errors: error.errors }, { status: 400 });
    }
    ServerLogger.error('Error al actualizar minuta digital:', error);
    return NextResponse.json({ message: 'Error al actualizar minuta digital' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request, ['ADMIN', 'COMPLEX_ADMIN', 'STAFF']);
    if (!authResult.proceed) {
      return authResult.response;
    }
    const { payload } = authResult;

    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ message: 'ID de minuta digital requerido para eliminar' }, { status: 400 });
    }

    const tenantPrisma = getPrisma(payload.schemaName);
    await tenantPrisma.digitalLog.delete({ where: { id: parseInt(id) } });

    ServerLogger.info(`Minuta digital eliminada: ID ${id} en complejo ${payload.complexId}`);
    return NextResponse.json({ message: 'Minuta digital eliminada exitosamente' }, { status: 200 });
  } catch (error) {
    ServerLogger.error('Error al eliminar minuta digital:', error);
    return NextResponse.json({ message: 'Error al eliminar minuta digital' }, { status: 500 });
  }
}