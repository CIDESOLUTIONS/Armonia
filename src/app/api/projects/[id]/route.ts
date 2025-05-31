import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getCurrentSchemaClient } from '@/lib/db';
import { z } from 'zod';

// Schema para validación de proyectos
const projectUpdateSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').optional(),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres').optional(),
  budget: z.number().min(0, 'El presupuesto no puede ser negativo').optional(),
  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Fecha de inicio inválida',
  }).optional(),
  endDate: z.string().nullable().optional(),
  status: z.enum(['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  progress: z.number().min(0, 'El progreso no puede ser negativo').max(100, 'El progreso no puede ser mayor a 100').optional(),
});

// GET - Obtener un proyecto específico
export async function GET(
  _req:unknown,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    
    const id = params.id;
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID de proyecto requerido' },
        { status: 400 }
      );
    }
    
    const prisma = getCurrentSchemaClient();
    
    const project = await prisma.project.findUnique({
      where: { id: parseInt(id) },
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
export async function PUT(
  _req:unknown,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    
    const id = params.id;
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID de proyecto requerido' },
        { status: 400 }
      );
    }
    
    const _data = await req.json();
    
    // Validar datos
    try {
      projectUpdateSchema.parse(data);
    } catch (error) {
      return NextResponse.json(
        { error: 'Datos de proyecto inválidos', details: error },
        { status: 400 }
      );
    }
    
    const prisma = getCurrentSchemaClient();
    
    // Comprobar que el proyecto existe
    const existingProject = await prisma.project.findUnique({
      where: { id: parseInt(id) },
    });
    
    if (!existingProject) {
      return NextResponse.json(
        { error: 'Proyecto no encontrado' },
        { status: 404 }
      );
    }
    
    // Convertir fechas si están presentes
    const updateData: unknown = { ...data };
    if (data.startDate) {
      updateData.startDate = new Date(data.startDate);
    }
    if (data.endDate !== undefined) {
      updateData.endDate = data.endDate ? new Date(data.endDate) : null;
    }
    
    const updatedProject = await prisma.project.update({
      where: { id: parseInt(id) },
      data: updateData,
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
  _req:unknown,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    
    const id = params.id;
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID de proyecto requerido' },
        { status: 400 }
      );
    }
    
    const prisma = getCurrentSchemaClient();
    
    // Comprobar que el proyecto existe
    const existingProject = await prisma.project.findUnique({
      where: { id: parseInt(id) },
    });
    
    if (!existingProject) {
      return NextResponse.json(
        { error: 'Proyecto no encontrado' },
        { status: 404 }
      );
    }
    
    // Eliminar el proyecto
    await prisma.project.delete({
      where: { id: parseInt(id) },
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
