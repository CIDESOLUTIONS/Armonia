// src/app/api/inventory/residents/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { withValidation, validateRequest } from '@/lib/validation';
import { verifyAuth } from '@/lib/auth';
import * as bcrypt from 'bcrypt';
import { 
  GetResidentsSchema, 
  CreateResidentSchema,
  type GetResidentsRequest,
  type CreateResidentRequest 
} from '@/validators/inventory/residents.validator';

// GET: Obtener residentes con filtros y paginación
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

    // Verificar autorización - Solo admins pueden ver todos los residentes
    if (payload.role !== 'ADMIN' && payload.role !== 'COMPLEX_ADMIN') {
      return NextResponse.json(
        { message: 'Permisos insuficientes para acceder a esta información' },
        { status: 403 }
      );
    }

    if (!payload.complexId) {
      return NextResponse.json(
        { message: 'Usuario no está asociado a un complejo residencial' },
        { status: 400 }
      );
    }

    // Extraer y validar parámetros de consulta
    const { searchParams } = new URL(request.url);
    const queryParams = {
      propertyId: searchParams.get('propertyId') || undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
      search: searchParams.get('search') || undefined,
      status: searchParams.get('status') || undefined
    };

    // Validar parámetros
    const validation = validateRequest(GetResidentsSchema, queryParams);
    if (!validation.success) {
      return validation.response;
    }

    const validatedParams = validation.data;
    const prisma = getPrisma();

    // Construir consulta con filtros multi-tenant
    const where: any = { 
      complexId: payload.complexId // CRÍTICO: Filtro multi-tenant
    };

    // Aplicar filtros adicionales
    if (validatedParams.propertyId) {
      where.propertyId = validatedParams.propertyId;
    }
    
    if (validatedParams.status) {
      where.status = validatedParams.status;
    }
    
    if (validatedParams.search) {
      where.OR = [
        { user: { name: { contains: validatedParams.search, mode: 'insensitive' } } },
        { user: { email: { contains: validatedParams.search, mode: 'insensitive' } } },
        { dni: { contains: validatedParams.search, mode: 'insensitive' } }
      ];
    }

    // Calcular offset para paginación
    const offset = (validatedParams.page - 1) * validatedParams.limit;

    // Ejecutar consulta con include de relaciones
    const [residents, total] = await Promise.all([
      prisma.resident.findMany({
        where,
        skip: offset,
        take: validatedParams.limit,
        orderBy: { property: { unitNumber: 'asc' } },
        include: {
          user: {
            select: { 
              id: true, 
              name: true, 
              email: true, 
              role: true 
            }
          },
          property: {
            select: { 
              id: true, 
              unitNumber: true, 
              type: true 
            }
          }
        }
      }),
      prisma.resident.count({ where })
    ]);

    return NextResponse.json({
      data: residents,
      pagination: {
        page: validatedParams.page,
        limit: validatedParams.limit,
        total,
        totalPages: Math.ceil(total / validatedParams.limit)
      }
    });

  } catch (error) {
    console.error('[RESIDENTS GET] Error:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST: Crear nuevo residente
async function createResidentHandler(validatedData: CreateResidentRequest, request: NextRequest) {
  try {
    // Verificar autenticación
    const { auth, payload } = await verifyAuth(request);
    if (!auth || !payload) {
      return NextResponse.json(
        { message: 'Token de autorización requerido' },
        { status: 401 }
      );
    }

    // Verificar autorización - Solo admins pueden crear residentes
    if (payload.role !== 'ADMIN' && payload.role !== 'COMPLEX_ADMIN') {
      return NextResponse.json(
        { message: 'Permisos insuficientes para crear residentes' },
        { status: 403 }
      );
    }

    if (!payload.complexId) {
      return NextResponse.json(
        { message: 'Usuario no está asociado a un complejo residencial' },
        { status: 400 }
      );
    }

    const prisma = getPrisma();

    // Verificar que la propiedad existe y pertenece al complejo
    const property = await prisma.property.findFirst({
      where: {
        id: validatedData.propertyId,
        complexId: payload.complexId // CRÍTICO: Filtro multi-tenant
      }
    });

    if (!property) {
      return NextResponse.json(
        { message: 'Propiedad no encontrada en este complejo' },
        { status: 404 }
      );
    }

    // Verificar que el email no esté en uso en este complejo
    const existingUser = await prisma.user.findFirst({
      where: {
        email: validatedData.email,
        complexId: payload.complexId
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'El email ya está registrado en este complejo' },
        { status: 409 }
      );
    }

    // Verificar que el DNI no esté en uso en este complejo
    const existingResident = await prisma.resident.findFirst({
      where: {
        dni: validatedData.dni,
        complexId: payload.complexId
      }
    });

    if (existingResident) {
      return NextResponse.json(
        { message: 'El DNI ya está registrado en este complejo' },
        { status: 409 }
      );
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    // Crear usuario y residente en una transacción
    const result = await prisma.$transaction(async (tx) => {
      // Crear usuario
      const user = await tx.user.create({
        data: {
          email: validatedData.email,
          name: validatedData.name,
          password: hashedPassword,
          complexId: payload.complexId!,
          role: 'RESIDENT'
        }
      });

      // Crear residente
      const resident = await tx.resident.create({
        data: {
          userId: user.id,
          propertyId: validatedData.propertyId,
          complexId: payload.complexId!,
          dni: validatedData.dni,
          whatsapp: validatedData.whatsapp,
          isPrimary: validatedData.isPrimary,
          status: validatedData.status
        },
        include: {
          user: {
            select: { 
              id: true, 
              name: true, 
              email: true, 
              role: true 
            }
          },
          property: {
            select: { 
              id: true, 
              unitNumber: true, 
              type: true 
            }
          }
        }
      });

      return resident;
    });

    console.log(`[RESIDENTS] Nuevo residente creado: ${result.id} por usuario ${payload.email} en complejo ${payload.complexId}`);

    return NextResponse.json(result, { status: 201 });

  } catch (error) {
    console.error('[RESIDENTS POST] Error:', error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { message: 'Datos duplicados: el email o DNI ya existe' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Exportar POST con validación
export const POST = withValidation(CreateResidentSchema, createResidentHandler);