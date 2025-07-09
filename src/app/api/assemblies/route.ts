import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { withValidation, validateRequest } from '@/lib/validation';
import { verifyAuth } from '@/lib/auth';
import {
  GetAssembliesSchema,
  CreateAssemblySchema,
  UpdateAssemblySchema,
  DeleteAssemblySchema,
  type GetAssembliesRequest,
  type CreateAssemblyRequest,
  type UpdateAssemblyRequest,
  type DeleteAssemblyRequest
} from '@/validators/assemblies/assemblies.validator';

// GET: Obtener asambleas con filtros
export async function GET(request: NextRequest) {
  try {
    const { auth, payload } = await verifyAuth(request);
    if (!auth || !payload) {
      return NextResponse.json({ message: 'Token requerido' }, { status: 401 });
    }

    if (!['ADMIN', 'COMPLEX_ADMIN', 'RESIDENT'].includes(payload.role)) {
      return NextResponse.json({ message: 'Permisos insuficientes' }, { status: 403 });
    }

    if (!payload.complexId) {
      return NextResponse.json({ message: 'Usuario sin complejo asociado' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const queryParams = {
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
      status: searchParams.get('status') || undefined
    };

    const validation = validateRequest(GetAssembliesSchema, queryParams);
    if (!validation.success) return validation.response;

    const validatedParams = validation.data;
    const prisma = getPrisma();

    const where: any = { complexId: payload.complexId };
    if (validatedParams.status) where.status = validatedParams.status;

    const offset = (validatedParams.page - 1) * validatedParams.limit;

    const [assemblies, total] = await Promise.all([
      prisma.assembly.findMany({
        where,
        skip: offset,
        take: validatedParams.limit,
        orderBy: { scheduledDate: 'desc' }
      }),
      prisma.assembly.count({ where })
    ]);

    return NextResponse.json({
      data: assemblies,
      pagination: {
        page: validatedParams.page,
        limit: validatedParams.limit,
        total,
        totalPages: Math.ceil(total / validatedParams.limit)
      }
    });

  } catch (error) {
    console.error('[ASSEMBLIES GET] Error:', error);
    return NextResponse.json({ message: 'Error interno' }, { status: 500 });
  }
}

// POST: Crear asamblea
async function createAssemblyHandler(validatedData: CreateAssemblyRequest, request: NextRequest) {
  try {
    const { auth, payload } = await verifyAuth(request);
    if (!auth || !payload) {
      return NextResponse.json({ message: 'Token requerido' }, { status: 401 });
    }

    if (!['ADMIN', 'COMPLEX_ADMIN'].includes(payload.role)) {
      return NextResponse.json({ message: 'Solo admins pueden crear asambleas' }, { status: 403 });
    }

    if (!payload.complexId) {
      return NextResponse.json({ message: 'Usuario sin complejo asociado' }, { status: 400 });
    }

    const prisma = getPrisma();
    
    const assembly = await prisma.assembly.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        scheduledDate: new Date(validatedData.scheduledDate),
        location: validatedData.location,
        type: validatedData.type,
        agenda: validatedData.agenda,
        complexId: payload.complexId,
        status: 'PLANNED',
        createdBy: payload.userId
      }
    });

    console.log(`[ASSEMBLIES] Nueva asamblea creada: ${assembly.id} por ${payload.email}`);
    return NextResponse.json(assembly, { status: 201 });

  } catch (error) {
    console.error('[ASSEMBLIES POST] Error:', error);
    return NextResponse.json({ message: 'Error interno' }, { status: 500 });
  }
}

export const POST = withValidation(CreateAssemblySchema, createAssemblyHandler);

// PUT: Actualizar asamblea
export async function PUT(request: NextRequest) {
  try {
    const { auth, payload } = await verifyAuth(request);
    if (!auth || !payload) {
      return NextResponse.json({ message: 'Token requerido' }, { status: 401 });
    }

    if (!['ADMIN', 'COMPLEX_ADMIN'].includes(payload.role)) {
      return NextResponse.json({ message: 'Permisos insuficientes' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = UpdateAssemblySchema.parse(body);

    if (!validatedData.id) {
      return NextResponse.json({ message: 'ID de asamblea requerido para actualizar' }, { status: 400 });
    }

    const prisma = getPrisma();
    const updatedAssembly = await prisma.assembly.update({
      where: { id: validatedData.id, complexId: payload.complexId },
      data: {
        title: validatedData.title,
        description: validatedData.description,
        scheduledDate: validatedData.scheduledDate ? new Date(validatedData.scheduledDate) : undefined,
        location: validatedData.location,
        type: validatedData.type,
        agenda: validatedData.agenda,
        status: validatedData.status,
      },
    });

    console.log(`[ASSEMBLIES] Asamblea actualizada: ${updatedAssembly.id} por ${payload.email}`);
    return NextResponse.json(updatedAssembly, { status: 200 });
  } catch (error) {
    console.error('[ASSEMBLIES PUT] Error:', error);
    return NextResponse.json({ message: 'Error interno' }, { status: 500 });
  }
}

// DELETE: Eliminar asamblea
export async function DELETE(request: NextRequest) {
  try {
    const { auth, payload } = await verifyAuth(request);
    if (!auth || !payload) {
      return NextResponse.json({ message: 'Token requerido' }, { status: 401 });
    }

    if (!['ADMIN', 'COMPLEX_ADMIN'].includes(payload.role)) {
      return NextResponse.json({ message: 'Permisos insuficientes' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = DeleteAssemblySchema.parse(body);

    if (!validatedData.id) {
      return NextResponse.json({ message: 'ID de asamblea requerido para eliminar' }, { status: 400 });
    }

    const prisma = getPrisma();
    await prisma.assembly.delete({
      where: { id: validatedData.id, complexId: payload.complexId },
    });

    console.log(`[ASSEMBLIES] Asamblea eliminada: ${validatedData.id} por ${payload.email}`);
    return NextResponse.json({ message: 'Asamblea eliminada exitosamente' }, { status: 200 });
  } catch (error) {
    console.error('[ASSEMBLIES DELETE] Error:', error);
    return NextResponse.json({ message: 'Error interno' }, { status: 500 });
  }
}