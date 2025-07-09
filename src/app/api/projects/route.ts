import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { authMiddleware } from '@/lib/auth';
import { z } from 'zod';
import { ServerLogger } from '@/lib/logging/server-logger';

const ProjectSchema = z.object({
  name: z.string().min(1, "El nombre del proyecto es requerido."),
  description: z.string().optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).default('PENDING'),
  startDate: z.string().datetime("Fecha de inicio inválida."),
  endDate: z.string().datetime("Fecha de fin inválida.").optional().nullable(),
  assignedToId: z.number().int().positive("ID de asignado inválido.").optional().nullable(),
});

export async function GET(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request, ['ADMIN', 'COMPLEX_ADMIN']);
    if (!authResult.proceed) {
      return authResult.response;
    }
    const { payload } = authResult;

    const tenantPrisma = getPrisma(payload.schemaName);
    let where: any = { complexId: payload.complexId };

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const projectId = searchParams.get('id');

    if (status) where.status = status;
    if (projectId) where.id = parseInt(projectId);

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const projects = await tenantPrisma.project.findMany({
      where,
      include: {
        assignedTo: { select: { name: true } },
        createdBy: { select: { name: true } },
      },
      orderBy: { startDate: 'desc' },
    });

    const formattedProjects = projects.map(project => ({
      ...project,
      assignedToName: project.assignedTo?.name || 'N/A',
      createdByName: project.createdBy?.name || 'N/A',
    }));

    ServerLogger.info(`Proyectos listados para el complejo ${payload.complexId}`);
    return NextResponse.json(formattedProjects, { status: 200 });
  } catch (error) {
    ServerLogger.error('Error al obtener proyectos:', error);
    return NextResponse.json({ message: 'Error al obtener proyectos' }, { status: 500 });
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
    const validatedData = ProjectSchema.parse(body);

    const tenantPrisma = getPrisma(payload.schemaName);
    const newProject = await tenantPrisma.project.create({
      data: {
        ...validatedData,
        complexId: payload.complexId,
        createdBy: payload.id,
      },
    });

    ServerLogger.info(`Proyecto creado: ${newProject.name} por ${payload.email} en complejo ${payload.complexId}`);
    return NextResponse.json(newProject, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Error de validación', errors: error.errors }, { status: 400 });
    }
    ServerLogger.error('Error al crear proyecto:', error);
    return NextResponse.json({ message: 'Error al crear proyecto' }, { status: 500 });
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
    const validatedData = ProjectSchema.partial().parse(updateData); // Partial para actualizaciones

    if (!id) {
      return NextResponse.json({ message: 'ID de proyecto requerido para actualizar' }, { status: 400 });
    }

    const tenantPrisma = getPrisma(payload.schemaName);
    const updatedProject = await tenantPrisma.project.update({
      where: { id: parseInt(id) },
      data: validatedData,
    });

    ServerLogger.info(`Proyecto actualizado: ${updatedProject.name} en complejo ${payload.complexId}`);
    return NextResponse.json(updatedProject, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Error de validación', errors: error.errors }, { status: 400 });
    }
    ServerLogger.error('Error al actualizar proyecto:', error);
    return NextResponse.json({ message: 'Error al actualizar proyecto' }, { status: 500 });
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
      return NextResponse.json({ message: 'ID de proyecto requerido para eliminar' }, { status: 400 });
    }

    const tenantPrisma = getPrisma(payload.schemaName);
    await tenantPrisma.project.delete({ where: { id: parseInt(id) } });

    ServerLogger.info(`Proyecto eliminado: ID ${id} en complejo ${payload.complexId}`);
    return NextResponse.json({ message: 'Proyecto eliminado exitosamente' }, { status: 200 });
  } catch (error) {
    ServerLogger.error('Error al eliminar proyecto:', error);
    return NextResponse.json({ message: 'Error al eliminar proyecto' }, { status: 500 });
  }
}