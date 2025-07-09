import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { authMiddleware } from '@/lib/auth';
import { z } from 'zod';
import { ServerLogger } from '@/lib/logging/server-logger';

const AnnouncementSchema = z.object({
  title: z.string().min(1, "El título es requerido."),
  content: z.string().min(1, "El contenido es requerido."),
  publishedAt: z.string().datetime("Fecha de publicación inválida."),
  expiresAt: z.string().datetime("Fecha de expiración inválida.").optional().nullable(),
  isActive: z.boolean().default(true),
  targetRoles: z.array(z.string()).default([]), // Roles a los que va dirigido el anuncio
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

    // Si no es admin, filtrar por roles objetivo y anuncios activos
    if (!['ADMIN', 'COMPLEX_ADMIN'].includes(payload.role)) {
      where.isActive = true;
      where.targetRoles = { has: payload.role };
      where.publishedAt = { lte: new Date() };
      where.OR = [
        { expiresAt: { gte: new Date() } },
        { expiresAt: null },
      ];
    }

    const announcements = await tenantPrisma.announcement.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
    });

    ServerLogger.info(`Anuncios listados para el complejo ${payload.complexId}`);
    return NextResponse.json(announcements, { status: 200 });
  } catch (error) {
    ServerLogger.error('Error al obtener anuncios:', error);
    return NextResponse.json({ message: 'Error al obtener anuncios' }, { status: 500 });
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
    const validatedData = AnnouncementSchema.parse(body);

    const tenantPrisma = getPrisma(payload.schemaName);
    const newAnnouncement = await tenantPrisma.announcement.create({
      data: {
        ...validatedData,
        complexId: payload.complexId,
        createdBy: payload.id,
      },
    });

    ServerLogger.info(`Anuncio creado: ${newAnnouncement.title} por ${payload.email} en complejo ${payload.complexId}`);
    return NextResponse.json(newAnnouncement, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Error de validación', errors: error.errors }, { status: 400 });
    }
    ServerLogger.error('Error al crear anuncio:', error);
    return NextResponse.json({ message: 'Error al crear anuncio' }, { status: 500 });
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
    const validatedData = AnnouncementSchema.partial().parse(updateData); // Partial para actualizaciones

    if (!id) {
      return NextResponse.json({ message: 'ID de anuncio requerido para actualizar' }, { status: 400 });
    }

    const tenantPrisma = getPrisma(payload.schemaName);
    const updatedAnnouncement = await tenantPrisma.announcement.update({
      where: { id: parseInt(id) },
      data: validatedData,
    });

    ServerLogger.info(`Anuncio actualizado: ${updatedAnnouncement.title} en complejo ${payload.complexId}`);
    return NextResponse.json(updatedAnnouncement, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Error de validación', errors: error.errors }, { status: 400 });
    }
    ServerLogger.error('Error al actualizar anuncio:', error);
    return NextResponse.json({ message: 'Error al actualizar anuncio' }, { status: 500 });
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
      return NextResponse.json({ message: 'ID de anuncio requerido para eliminar' }, { status: 400 });
    }

    const tenantPrisma = getPrisma(payload.schemaName);
    await tenantPrisma.announcement.delete({ where: { id: parseInt(id) } });

    ServerLogger.info(`Anuncio eliminado: ID ${id} en complejo ${payload.complexId}`);
    return NextResponse.json({ message: 'Anuncio eliminado exitosamente' }, { status: 200 });
  } catch (error) {
    ServerLogger.error('Error al eliminar anuncio:', error);
    return NextResponse.json({ message: 'Error al eliminar anuncio' }, { status: 500 });
  }
}