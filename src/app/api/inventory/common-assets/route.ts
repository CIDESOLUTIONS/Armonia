import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { authMiddleware } from '@/lib/auth';
import { z } from 'zod';
import { ServerLogger } from '@/lib/logging/server-logger';

const CommonAssetSchema = z.object({
  name: z.string().min(1, "El nombre es requerido."),
  description: z.string().optional(),
  location: z.string().min(1, "La ubicación es requerida."),
  assetType: z.string().min(1, "El tipo de activo es requerido."),
  purchaseDate: z.string().datetime().optional(),
  value: z.number().min(0).optional(),
  isActive: z.boolean().default(true),
});

export async function GET(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request, ['ADMIN', 'COMPLEX_ADMIN']);
    if (!authResult.proceed) {
      return authResult.response;
    }
    const { payload } = authResult;

    const tenantPrisma = getPrisma(payload.schemaName);
    const commonAssets = await tenantPrisma.commonAsset.findMany();

    ServerLogger.info(`Bienes comunes listados para el complejo ${payload.complexId}`);
    return NextResponse.json(commonAssets, { status: 200 });
  } catch (error) {
    ServerLogger.error('Error al obtener bienes comunes:', error);
    return NextResponse.json({ message: 'Error al obtener bienes comunes' }, { status: 500 });
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
    const validatedData = CommonAssetSchema.parse(body);

    const tenantPrisma = getPrisma(payload.schemaName);
    const newCommonAsset = await tenantPrisma.commonAsset.create({ data: validatedData });

    ServerLogger.info(`Bien común creado: ${newCommonAsset.name} en complejo ${payload.complexId}`);
    return NextResponse.json(newCommonAsset, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Error de validación', errors: error.errors }, { status: 400 });
    }
    ServerLogger.error('Error al crear bien común:', error);
    return NextResponse.json({ message: 'Error al crear bien común' }, { status: 500 });
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
    const validatedData = CommonAssetSchema.partial().parse(updateData); // Partial para actualizaciones

    if (!id) {
      return NextResponse.json({ message: 'ID de bien común requerido para actualizar' }, { status: 400 });
    }

    const tenantPrisma = getPrisma(payload.schemaName);
    const updatedCommonAsset = await tenantPrisma.commonAsset.update({
      where: { id: parseInt(id) },
      data: validatedData,
    });

    ServerLogger.info(`Bien común actualizado: ${updatedCommonAsset.name} en complejo ${payload.complexId}`);
    return NextResponse.json(updatedCommonAsset, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Error de validación', errors: error.errors }, { status: 400 });
    }
    ServerLogger.error('Error al actualizar bien común:', error);
    return NextResponse.json({ message: 'Error al actualizar bien común' }, { status: 500 });
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
      return NextResponse.json({ message: 'ID de bien común requerido para eliminar' }, { status: 400 });
    }

    const tenantPrisma = getPrisma(payload.schemaName);
    await tenantPrisma.commonAsset.delete({ where: { id: parseInt(id) } });

    ServerLogger.info(`Bien común eliminado: ID ${id} en complejo ${payload.complexId}`);
    return NextResponse.json({ message: 'Bien común eliminado exitosamente' }, { status: 200 });
  } catch (error) {
    ServerLogger.error('Error al eliminar bien común:', error);
    return NextResponse.json({ message: 'Error al eliminar bien común' }, { status: 500 });
  }
}
