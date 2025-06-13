import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { withValidation, validateRequest } from '@/lib/validation';
import { verifyAuth } from '@/lib/auth';
import {
  GetAssembliesSchema,
  CreateAssemblySchema,
  type GetAssembliesRequest,
  type CreateAssemblyRequest
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
        title: data.title,
        type: data.type,
        date: new Date(data.date),
        description: data.description,
        quorum: data.quorum,
        complexId: data.complexId,
        organizerId: data.organizerId,
        status: 'PENDING',
      },
    });
    return NextResponse.json(assembly);
  } catch (error) {
    console.error('Error creating assembly:', error);
    return NextResponse.json({ error: error.message || 'Error al crear asamblea' }, { status: 500 });
  }
}

export async function PUT(request: Request) { // Agregué ': Request' para tipado
  try {
    const _data = await request.json();
    const tenantId = request.headers.get('x-tenant-id');
    const tenant = await prismaGlobal.tenant.findUnique({ where: { id: parseInt(tenantId) } });
    if (!tenant) return NextResponse.json({ error: 'Tenant no encontrado' }, { status: 404 });

    const prisma = getPrismaClient(tenant.schemaName);
    const { id } = data;
    const complex = await prisma.residentialComplex.findUnique({ where: { id: data.complexId } });
    if (!complex) throw new Error('Conjunto residencial no encontrado');
    
    const assembly = await prisma.assembly.update({
      where: { id: parseInt(id) },
      data: {
        title: data.title,
        type: data.type,
        date: new Date(data.date),
        description: data.description,
        quorum: data.quorum,
        complexId: data.complexId,
        organizerId: data.organizerId,
      },
    });
    return NextResponse.json(assembly);
  } catch (error) {
    console.error('Error updating assembly:', error);
    return NextResponse.json({ error: error.message || 'Error al actualizar asamblea' }, { status: 500 });
  }
}