import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { authMiddleware } from '@/lib/auth';
import { z } from 'zod';
import { ServerLogger } from '@/lib/logging/server-logger';

const CommunityEventSchema = z.object({
  title: z.string().min(1, "El título es requerido."),
  description: z.string().optional(),
  startDateTime: z.string().datetime("Fecha y hora de inicio inválidas."),
  endDateTime: z.string().datetime("Fecha y hora de fin inválidas."),
  location: z.string().min(1, "La ubicación es requerida."),
  isPublic: z.boolean().default(true),
});

export async function GET(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request, ['ADMIN', 'COMPLEX_ADMIN', 'RESIDENT', 'STAFF']);
    if (!authResult.proceed) {
      return authResult.response;
    }
    const { payload } = authResult;

    const tenantPrisma = getPrisma(payload.schemaName);
    let where: any = { complexId: payload.complexId };

    // Si no es admin, solo mostrar eventos públicos o creados por el usuario
    if (!['ADMIN', 'COMPLEX_ADMIN'].includes(payload.role)) {
      where.OR = [
        { isPublic: true },
        { createdBy: payload.id },
      ];
    }

    const events = await tenantPrisma.communityEvent.findMany({
      where,
      orderBy: { startDateTime: 'asc' },
    });

    ServerLogger.info(`Eventos comunitarios listados para el complejo ${payload.complexId}`);
    return NextResponse.json(events, { status: 200 });
  } catch (error) {
    ServerLogger.error('Error al obtener eventos comunitarios:', error);
    return NextResponse.json({ message: 'Error al obtener eventos comunitarios' }, { status: 500 });
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
    const validatedData = CommunityEventSchema.parse(body);

    const tenantPrisma = getPrisma(payload.schemaName);
    const newEvent = await tenantPrisma.communityEvent.create({
      data: {
        ...validatedData,
        complexId: payload.complexId,
        createdBy: payload.id,
      },
    });

    ServerLogger.info(`Evento comunitario creado: ${newEvent.title} por ${payload.email} en complejo ${payload.complexId}`);
    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Error de validación', errors: error.errors }, { status: 400 });
    }
    ServerLogger.error('Error al crear evento comunitario:', error);
    return NextResponse.json({ message: 'Error al crear evento comunitario' }, { status: 500 });
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
    const validatedData = CommunityEventSchema.partial().parse(updateData); // Partial para actualizaciones

    if (!id) {
      return NextResponse.json({ message: 'ID de evento requerido para actualizar' }, { status: 400 });
    }

    const tenantPrisma = getPrisma(payload.schemaName);
    const updatedEvent = await tenantPrisma.communityEvent.update({
      where: { id: parseInt(id) },
      data: validatedData,
    });

    ServerLogger.info(`Evento comunitario actualizado: ${updatedEvent.title} en complejo ${payload.complexId}`);
    return NextResponse.json(updatedEvent, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Error de validación', errors: error.errors }, { status: 400 });
    }
    ServerLogger.error('Error al actualizar evento comunitario:', error);
    return NextResponse.json({ message: 'Error al actualizar evento comunitario' }, { status: 500 });
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
      return NextResponse.json({ message: 'ID de evento requerido para eliminar' }, { status: 400 });
    }

    const tenantPrisma = getPrisma(payload.schemaName);
    await tenantPrisma.communityEvent.delete({ where: { id: parseInt(id) } });

    ServerLogger.info(`Evento comunitario eliminado: ID ${id} en complejo ${payload.complexId}`);
    return NextResponse.json({ message: 'Evento comunitario eliminado exitosamente' }, { status: 200 });
  } catch (error) {
    ServerLogger.error('Error al eliminar evento comunitario:', error);
    return NextResponse.json({ message: 'Error al eliminar evento comunitario' }, { status: 500 });
  }
}
