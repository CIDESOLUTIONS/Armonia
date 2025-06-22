import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getCurrentSchemaClient } from '@/lib/db';
import { withValidation, validateRequest } from '@/lib/validation';
import { 
  ProjectSchema, 
  GetProjectsSchema,
  type ProjectRequest,
  type GetProjectsRequest
} from '@/validators/projects/project.validator';

// GET - Obtener todos los proyectos
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    
    // Obtener parámetros de consulta
    const { searchParams } = new URL(req.url);
    const queryParams = {
      status: searchParams.get('status'),
      priority: searchParams.get('priority'),
      responsibleId: searchParams.get('responsibleId'),
      search: searchParams.get('search'),
      page: searchParams.get('page'),
      limit: searchParams.get('limit')
    };
    
    // Validar parámetros
    const validation = validateRequest(GetProjectsSchema, queryParams);
    if (!validation.success) {
      return validation.response;
    }

    const validatedParams = validation.data;
    
    const prisma = getCurrentSchemaClient();
    
    // Construir filtros
    const where: any = {};
    if (validatedParams.status) where.status = validatedParams.status;
    if (validatedParams.priority) where.priority = validatedParams.priority;
    if (validatedParams.responsibleId) where.responsibleId = validatedParams.responsibleId;
    if (validatedParams.search) {
      where.OR = [
        { name: { contains: validatedParams.search, mode: 'insensitive' } },
        { description: { contains: validatedParams.search, mode: 'insensitive' } }
      ];
    }
    
    // Calcular offset para paginación
    const page = validatedParams.page || 1;
    const limit = validatedParams.limit || 20;
    const offset = (page - 1) * limit;
    
    // Ejecutar consulta con paginación
    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          responsible: {
            select: { id: true, name: true, email: true }
          }
        }
      }),
      prisma.project.count({ where })
    ]);
    
    return NextResponse.json({
      data: projects,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error al obtener proyectos:', error);
    return NextResponse.json(
      { error: 'Error al obtener proyectos' },
      { status: 500 }
    );
  }
}

// POST - Crear un nuevo proyecto
async function createProjectHandler(validatedData: ProjectRequest, req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    
    const prisma = getCurrentSchemaClient();
    
    // Convertir fechas
    const projectData = {
      ...validatedData,
      startDate: new Date(validatedData.startDate),
      endDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
      createdById: session.user.id // Agregar el ID del usuario que crea el proyecto
    };
    
    const project = await prisma.project.create({
      data: projectData,
      include: {
        responsible: {
          select: { id: true, name: true, email: true }
        }
      }
    });
    
    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('Error al crear proyecto:', error);
    return NextResponse.json(
      { error: 'Error al crear proyecto' },
      { status: 500 }
    );
  }
}

// Exportar POST con validación
export const POST = withValidation(ProjectSchema, createProjectHandler);
