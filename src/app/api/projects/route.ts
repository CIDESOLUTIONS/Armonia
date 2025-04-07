import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getCurrentSchemaClient } from '@/lib/db';
import { z } from 'zod';

// Schema para validación de proyectos
const projectSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  budget: z.number().min(0, 'El presupuesto no puede ser negativo'),
  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Fecha de inicio inválida',
  }),
  endDate: z.string().nullable().optional(),
  status: z.enum(['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
  progress: z.number().min(0, 'El progreso no puede ser negativo').max(100, 'El progreso no puede ser mayor a 100'),
});

// GET - Obtener todos los proyectos
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    
    const prisma = getCurrentSchemaClient();
    
    const projects = await prisma.project.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error al obtener proyectos:', error);
    return NextResponse.json(
      { error: 'Error al obtener proyectos' },
      { status: 500 }
    );
  }
}

// POST - Crear un nuevo proyecto
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    
    const data = await req.json();
    
    // Validar datos
    try {
      projectSchema.parse(data);
    } catch (error) {
      return NextResponse.json(
        { error: 'Datos de proyecto inválidos', details: error },
        { status: 400 }
      );
    }
    
    const prisma = getCurrentSchemaClient();
    
    // Convertir fechas
    const projectData = {
      ...data,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : null,
    };
    
    const project = await prisma.project.create({
      data: projectData,
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
