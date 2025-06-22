import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getCurrentSchemaClient } from '@/lib/db';
import { withValidation, validateRequest } from '@/lib/validation';
import { 
  ProjectIdSchema,
  ProjectUpdateSchema,
  type ProjectIdRequest,
  type ProjectUpdateRequest
} from '@/validators/projects/project-id.validator';

// GET - Obtener un proyecto específico
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    
    // Validar parámetros de ruta
    const validation = validateRequest(ProjectIdSchema, params);
    if (!validation.success) {
      return validation.response;
    }

    const validatedParams = validation.data;
    const id = parseInt(validatedParams.id);
    
    const prisma = getCurrentSchemaClient();
    
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        responsible: {
          select: { id: true, name: true, email: true }
        }
      }
    });
    
    if (!project) {
      return NextResponse.json(
        { error: 'Proyecto no encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(project);
  } catch (error) {
    console.error('Error al obtener proyecto:', error);
    return NextResponse.json(
      { error: 'Error al obtener proyecto' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar un proyecto
async function updateProjectHandler(
  validatedData: ProjectUpdateRequest,
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    
    // Validar parámetros de ruta
    const routeValidation = validateRequest(ProjectIdSchema, params);
    if (!routeValidation.success) {
      return routeValidation.response;
    }

    const validatedParams = routeValidation.data;
    const id = parseInt(validatedParams.id);
    
    const prisma = getCurrentSchemaClient();
    
    // Comprobar que el proyecto existe
    const existingProject = await prisma.project.findUnique({
      where: { id },
    });
    
    if (!existingProject) {
      return NextResponse.json(
        { error: 'Proyecto no encontrado' },
        { status: 404 }
      );
    }
    
    // Convertir fechas si están presentes
    const updateData: any = { ...validatedData };
    if (validatedData.startDate) {
      updateData.startDate = new Date(validatedData.startDate);
    }
    if (validatedData.endDate !== undefined) {
      updateData.endDate = validatedData.endDate ? new Date(validatedData.endDate) : null;
    }
    
    // Registrar quién actualizó el proyecto
    updateData.updatedById = session.user.id;
    updateData.updatedAt = new Date();
    
    const updatedProject = await prisma.project.update({
      where: { id },
      data: updateData,
      include: {
        responsible: {
          select: { id: true, name: true, email: true }
        }
      }
    });
    
    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error('Error al actualizar proyecto:', error);
    return NextResponse.json(
      { error: 'Error al actualizar proyecto' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar un proyecto
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    
    // Validar parámetros de ruta
    const validation = validateRequest(ProjectIdSchema, params);
    if (!validation.success) {
      return validation.response;
    }

    const validatedParams = validation.data;
    const id = parseInt(validatedParams.id);
    
    const prisma = getCurrentSchemaClient();
    
    // Comprobar que el proyecto existe
    const existingProject = await prisma.project.findUnique({
      where: { id },
    });
    
    if (!existingProject) {
      return NextResponse.json(
        { error: 'Proyecto no encontrado' },
        { status: 404 }
      );
    }
    
    // Verificar permisos (solo administradores pueden eliminar)
    if (session.user.role !== 'ADMIN' && session.user.role !== 'COMPLEX_ADMIN') {
      return NextResponse.json(
        { error: 'No tiene permisos para eliminar proyectos' },
        { status: 403 }
      );
    }
    
    // Eliminar el proyecto
    await prisma.project.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar proyecto:', error);
    return NextResponse.json(
      { error: 'Error al eliminar proyecto' },
      { status: 500 }
    );
  }
}

// Exportar PUT con validación
export const PUT = withValidation(ProjectUpdateSchema, updateProjectHandler);
