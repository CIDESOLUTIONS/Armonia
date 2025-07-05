import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { withValidation, validateRequest } from '@/lib/validation';
import { verifyAuth } from '@/lib/auth';
import {
  GetPackagesSchema,
  CreatePackageSchema,
  type GetPackagesRequest,
  type CreatePackageRequest
} from '@/validators/correspondence/packages.validator';

// GET: Obtener paquetes con filtros
export async function GET(request: NextRequest) {
  try {
    const { auth, payload } = await verifyAuth(request);
    if (!auth || !payload) {
      return NextResponse.json({ message: 'Token requerido' }, { status: 401 });
    }

    if (!['ADMIN', 'COMPLEX_ADMIN', 'RECEPTION'].includes(payload.role)) {
      return NextResponse.json({ message: 'Permisos insuficientes' }, { status: 403 });
    }

    if (!payload.complexId) {
      return NextResponse.json({ message: 'Usuario sin complejo asociado' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const queryParams = {
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
      status: searchParams.get('status') || undefined,
      unit: searchParams.get('unit') || undefined
    };

    const validation = validateRequest(GetPackagesSchema, queryParams);
    if (!validation.success) return validation.response;

    const validatedParams = validation.data;
    const prisma = getPrisma();

    const where: any = { complexId: payload.complexId };
    if (validatedParams.status) where.status = validatedParams.status;
    if (validatedParams.unit) where.recipientUnit = validatedParams.unit;

    const offset = (validatedParams.page - 1) * validatedParams.limit;

    const [packages, total] = await Promise.all([
      prisma.package.findMany({
        where,
        skip: offset,
        take: validatedParams.limit,
        orderBy: { receivedAt: 'desc' }
      }),
      prisma.package.count({ where })
    ]);

    return NextResponse.json({
      data: packages,
      pagination: {
        page: validatedParams.page,
        limit: validatedParams.limit,
        total,
        totalPages: Math.ceil(total / validatedParams.limit)
      }
    });

  } catch (error) {
    console.error('[PACKAGES GET] Error:', error);
    return NextResponse.json({ message: 'Error interno' }, { status: 500 });
  }
}

// POST: Registrar nuevo paquete
async function createPackageHandler(validatedData: CreatePackageRequest, request: NextRequest) {
  try {
    const { auth, payload } = await verifyAuth(request);
    if (!auth || !payload) {
      return NextResponse.json({ message: 'Token requerido' }, { status: 401 });
    }

    if (!['ADMIN', 'COMPLEX_ADMIN', 'RECEPTION'].includes(payload.role)) {
      return NextResponse.json({ message: 'Solo recepción puede registrar paquetes' }, { status: 403 });
    }

    if (!payload.complexId) {
      return NextResponse.json({ message: 'Usuario sin complejo asociado' }, { status: 400 });
    }

    const prisma = getPrisma();
    
    const packageRecord = await prisma.package.create({
      data: {
        recipientName: validatedData.recipientName,
        recipientUnit: validatedData.recipientUnit,
        senderName: validatedData.senderName,
        trackingNumber: validatedData.trackingNumber,
        description: validatedData.description,
        receivedBy: validatedData.receivedBy,
        complexId: payload.complexId,
        status: 'RECEIVED',
        receivedAt: new Date()
      }
    });

    console.log(`[PACKAGES] Nuevo paquete registrado: ${packageRecord.id} por ${payload.email}`);
    return NextResponse.json(packageRecord, { status: 201 });

  } catch (error) {
    console.error('[PACKAGES POST] Error:', error);
    return NextResponse.json({ message: 'Error interno' }, { status: 500 });
  }
}

export const POST = withValidation(CreatePackageSchema, createPackageHandler);
