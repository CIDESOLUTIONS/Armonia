import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { authMiddleware } from '@/lib/auth';
import { z } from 'zod';
import { ServerLogger } from '@/lib/logging/server-logger';

const PQRSchema = z.object({
  subject: z.string().min(1, "El asunto es requerido."),
  description: z.string().min(1, "La descripción es requerida."),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'CLOSED', 'REJECTED']).default('OPEN'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
  category: z.string().min(1, "La categoría es requerida."),
  reportedById: z.number().int().positive("ID de reportante inválido."),
  assignedToId: z.number().int().positive("ID de asignado inválido.").optional(),
});

const PQRCommentSchema = z.object({
  pqrId: z.number().int().positive("ID de PQR inválido."),
  comment: z.string().min(1, "El comentario no puede estar vacío."),
});

export async function GET(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request, ['ADMIN', 'COMPLEX_ADMIN', 'STAFF', 'RESIDENT']);
    if (!authResult.proceed) {
      return authResult.response;
    }
    const { payload } = authResult;

    const tenantPrisma = getPrisma(payload.schemaName);
    let where: any = { complexId: payload.complexId };

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const search = searchParams.get('search');
    const pqrId = searchParams.get('id');

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (pqrId) where.id = parseInt(pqrId);

    if (search) {
      where.OR = [
        { subject: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Si es residente, solo mostrar sus PQRs
    if (payload.role === 'RESIDENT') {
      where.reportedById = payload.id;
    }

    const pqrs = await tenantPrisma.pQR.findMany({
      where,
      include: {
        reportedBy: { select: { name: true } },
        assignedTo: { select: { name: true } },
        comments: { include: { author: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedPQRs = pqrs.map(pqr => ({
      ...pqr,
      reportedByName: pqr.reportedBy?.name || 'N/A',
      assignedToName: pqr.assignedTo?.name || 'N/A',
      comments: pqr.comments.map(comment => ({
        ...comment,
        authorName: comment.author?.name || 'N/A',
      })),
    }));

    ServerLogger.info(`PQRs listadas para el complejo ${payload.complexId}`);
    return NextResponse.json(formattedPQRs, { status: 200 });
  } catch (error) {
    ServerLogger.error('Error al obtener PQRs:', error);
    return NextResponse.json({ message: 'Error al obtener PQRs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request, ['ADMIN', 'COMPLEX_ADMIN', 'RESIDENT']);
    if (!authResult.proceed) {
      return authResult.response;
    }
    const { payload } = authResult;

    const body = await request.json();
    const validatedData = PQRSchema.parse({ ...body, reportedById: payload.id });

    const tenantPrisma = getPrisma(payload.schemaName);
    const newPQR = await tenantPrisma.pQR.create({ data: validatedData });

    ServerLogger.info(`PQR creada: ${newPQR.subject} por ${payload.email} en complejo ${payload.complexId}`);
    return NextResponse.json(newPQR, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Error de validación', errors: error.errors }, { status: 400 });
    }
    ServerLogger.error('Error al crear PQR:', error);
    return NextResponse.json({ message: 'Error al crear PQR' }, { status: 500 });
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
    const validatedData = PQRSchema.partial().parse(updateData); // Partial para actualizaciones

    if (!id) {
      return NextResponse.json({ message: 'ID de PQR requerido para actualizar' }, { status: 400 });
    }

    const tenantPrisma = getPrisma(payload.schemaName);
    const updatedPQR = await tenantPrisma.pQR.update({
      where: { id: parseInt(id) },
      data: validatedData,
    });

    ServerLogger.info(`PQR actualizada: ${updatedPQR.subject} en complejo ${payload.complexId}`);
    return NextResponse.json(updatedPQR, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Error de validación', errors: error.errors }, { status: 400 });
    }
    ServerLogger.error('Error al actualizar PQR:', error);
    return NextResponse.json({ message: 'Error al actualizar PQR' }, { status: 500 });
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
      return NextResponse.json({ message: 'ID de PQR requerido para eliminar' }, { status: 400 });
    }

    const tenantPrisma = getPrisma(payload.schemaName);
    await tenantPrisma.pQR.delete({ where: { id: parseInt(id) } });

    ServerLogger.info(`PQR eliminada: ID ${id} en complejo ${payload.complexId}`);
    return NextResponse.json({ message: 'PQR eliminada exitosamente' }, { status: 200 });
  } catch (error) {
    ServerLogger.error('Error al eliminar PQR:', error);
    return NextResponse.json({ message: 'Error al eliminar PQR' }, { status: 500 });
  }
}

export async function POST_COMMENT(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request, ['ADMIN', 'COMPLEX_ADMIN', 'STAFF', 'RESIDENT']);
    if (!authResult.proceed) {
      return authResult.response;
    }
    const { payload } = authResult;

    const body = await request.json();
    const validatedData = PQRCommentSchema.parse(body);

    const tenantPrisma = getPrisma(payload.schemaName);
    const newComment = await tenantPrisma.pQRComment.create({
      data: {
        pqrId: validatedData.pqrId,
        comment: validatedData.comment,
        authorId: payload.id,
      },
    });

    ServerLogger.info(`Comentario añadido a PQR ${validatedData.pqrId} por ${payload.email}`);
    return NextResponse.json(newComment, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Error de validación', errors: error.errors }, { status: 400 });
    }
    ServerLogger.error('Error al añadir comentario a PQR:', error);
    return NextResponse.json({ message: 'Error al añadir comentario' }, { status: 500 });
  }
}

export async function PUT_ASSIGN(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request, ['ADMIN', 'COMPLEX_ADMIN']);
    if (!authResult.proceed) {
      return authResult.response;
    }
    const { payload } = authResult;

    const { pqrId, assignedToId } = await request.json();

    if (!pqrId || !assignedToId) {
      return NextResponse.json({ message: 'ID de PQR y ID de asignado son requeridos' }, { status: 400 });
    }

    const tenantPrisma = getPrisma(payload.schemaName);
    const updatedPQR = await tenantPrisma.pQR.update({
      where: { id: parseInt(pqrId) },
      data: { assignedToId: parseInt(assignedToId) },
    });

    ServerLogger.info(`PQR ${pqrId} asignada a ${assignedToId} por ${payload.email}`);
    return NextResponse.json(updatedPQR, { status: 200 });
  } catch (error) {
    ServerLogger.error('Error al asignar PQR:', error);
    return NextResponse.json({ message: 'Error al asignar PQR' }, { status: 500 });
  }
}
