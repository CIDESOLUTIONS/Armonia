// src/app/api/pqr/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { withValidation, validateRequest } from '@/lib/validation';
import { verifyAuth } from '@/lib/auth';
import { 
  CreatePQRSchema, 
  GetPQRsSchema,
  type CreatePQRRequest,
  type GetPQRsRequest 
} from '@/validators/pqr/pqr.validator';

// GET: Obtener PQRs con filtros y paginación
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const { auth, payload } = await verifyAuth(request);
    if (!auth || !payload) {
      return NextResponse.json(
        { message: 'Token de autorización requerido' },
        { status: 401 }
      );
    }

    // Extraer y validar parámetros de consulta
    const { searchParams } = new URL(request.url);
    const queryParams = {
      filter: searchParams.get('filter') || 'all',
      priority: searchParams.get('priority') || undefined,
      type: searchParams.get('type') || undefined,
      assignedTo: searchParams.get('assignedTo') ? parseInt(searchParams.get('assignedTo')!) : undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
      search: searchParams.get('search') || undefined
    };

    // Validar parámetros
    const validation = validateRequest(GetPQRsSchema, queryParams);
    if (!validation.success) {
      return validation.response;
    }

    const validatedParams = validation.data;
    
    if (!payload.complexId) {
      return NextResponse.json(
        { message: 'Usuario no está asociado a un complejo residencial' },
        { status: 400 }
      );
    }

    const prisma = getPrisma();

    // Construir consulta con filtros multi-tenant
    const where: any = { 
      complexId: payload.complexId // CRÍTICO: Filtro multi-tenant
    };

    // Aplicar filtros adicionales
    if (validatedParams.filter !== 'all') {
      where.status = validatedParams.filter;
    }
    
    if (validatedParams.priority) {
      where.priority = validatedParams.priority;
    }
    
    if (validatedParams.type) {
      where.type = validatedParams.type;
    }
    
    if (validatedParams.assignedTo) {
      where.assignedTo = validatedParams.assignedTo;
    }
    
    if (validatedParams.search) {
      where.OR = [
        { title: { contains: validatedParams.search, mode: 'insensitive' } },
        { description: { contains: validatedParams.search, mode: 'insensitive' } }
      ];
    }

    // Aplicar filtro de autorización por rol
    if (payload.role === 'RESIDENT') {
      where.userId = payload.id; // Los residentes solo ven sus propios PQRs
    }

    // Calcular offset para paginación
    const offset = (validatedParams.page - 1) * validatedParams.limit;

    // Ejecutar consulta con include de relaciones
    const [pqrs, total] = await Promise.all([
      prisma.pQR.findMany({
        where,
        skip: offset,
        take: validatedParams.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, name: true, email: true }
          },
          assignedUser: {
            select: { id: true, name: true, email: true }
          }
        }
      }),
      prisma.pQR.count({ where })
    ]);

    return NextResponse.json({
      data: pqrs,
      pagination: {
        page: validatedParams.page,
        limit: validatedParams.limit,
        total,
        totalPages: Math.ceil(total / validatedParams.limit)
      }
    });

  } catch (error) {
    console.error('[PQR GET] Error:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST: Crear nuevo PQR
async function createPQRHandler(validatedData: CreatePQRRequest, request: NextRequest) {
  try {
    // Verificar autenticación
    const { auth, payload } = await verifyAuth(request);
    if (!auth || !payload) {
      return NextResponse.json(
        { message: 'Token de autorización requerido' },
        { status: 401 }
      );
    }

    if (!payload.complexId) {
      return NextResponse.json(
        { message: 'Usuario no está asociado a un complejo residencial' },
        { status: 400 }
      );
    }

    const prisma = getPrisma();

    // Verificar que el usuario pertenece al complejo
    const user = await prisma.user.findFirst({
      where: {
        id: payload.id,
        complexId: payload.complexId,
        active: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Usuario no encontrado o inactivo en este complejo' },
        { status: 404 }
      );
    }

    // Crear PQR con datos validados y sanitizados
    const pqr = await prisma.pQR.create({
      data: {
        type: validatedData.type,
        title: validatedData.title,
        description: validatedData.description,
        priority: validatedData.priority,
        status: 'OPEN', // Estado inicial fijo
        unitNumber: validatedData.unitNumber || null,
        userId: payload.id, // Del token autenticado
        complexId: payload.complexId, // Del token autenticado (multi-tenant)
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    console.log(`[PQR] Nuevo PQR creado: ${pqr.id} por usuario ${payload.email} en complejo ${payload.complexId}`);

    return NextResponse.json(pqr, { status: 201 });

  } catch (error) {
    console.error('[PQR POST] Error:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Exportar POST con validación
export const POST = withValidation(CreatePQRSchema, createPQRHandler);