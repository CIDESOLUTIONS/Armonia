import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { authMiddleware } from '@/lib/auth';
import { z } from 'zod';
import { ServerLogger } from '@/lib/logging/server-logger';

const AmenitySchema = z.object({
  name: z.string().min(1, "El nombre es requerido."),
  description: z.string().optional(),
  location: z.string().min(1, "La ubicación es requerida."),
  capacity: z.number().int().min(0, "La capacidad debe ser un número positivo."),
  requiresApproval: z.boolean().default(false),
  hasFee: z.boolean().default(false),
  feeAmount: z.number().optional(),
  isActive: z.boolean().default(true),
}).refine(data => !data.hasFee || (data.hasFee && data.feeAmount !== undefined && data.feeAmount >= 0), {
  message: "El monto de la tarifa es requerido si tiene costo.",
  path: ["feeAmount"],
});

export async function GET(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request, ['ADMIN', 'COMPLEX_ADMIN']);
    if (!authResult.proceed) {
      return authResult.response;
    }
    const { payload } = authResult;

    const tenantPrisma = getPrisma(payload.schemaName);
    const amenities = await tenantPrisma.commonArea.findMany();

    ServerLogger.info(`Amenidades listadas para el complejo ${payload.complexId}`);
    return NextResponse.json(amenities, { status: 200 });
  } catch (error) {
    ServerLogger.error('Error al obtener amenidades:', error);
    return NextResponse.json({ message: 'Error al obtener amenidades' }, { status: 500 });
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
    const validatedData = AmenitySchema.parse(body);

    const tenantPrisma = getPrisma(payload.schemaName);
    const newAmenity = await tenantPrisma.commonArea.create({ data: validatedData });

    ServerLogger.info(`Amenidad creada: ${newAmenity.name} en complejo ${payload.complexId}`);
    return NextResponse.json(newAmenity, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Error de validación', errors: error.errors }, { status: 400 });
    }
    ServerLogger.error('Error al crear amenidad:', error);
    return NextResponse.json({ message: 'Error al crear amenidad' }, { status: 500 });
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
    const validatedData = AmenitySchema.partial().parse(updateData); // Partial para actualizaciones

    if (!id) {
      return NextResponse.json({ message: 'ID de amenidad requerido para actualizar' }, { status: 400 });
    }

    const tenantPrisma = getPrisma(payload.schemaName);
    const updatedAmenity = await tenantPrisma.commonArea.update({
      where: { id: parseInt(id) },
      data: validatedData,
    });

    ServerLogger.info(`Amenidad actualizada: ${updatedAmenity.name} en complejo ${payload.complexId}`);
    return NextResponse.json(updatedAmenity, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Error de validación', errors: error.errors }, { status: 400 });
    }
    ServerLogger.error('Error al actualizar amenidad:', error);
    return NextResponse.json({ message: 'Error al actualizar amenidad' }, { status: 500 });
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
      return NextResponse.json({ message: 'ID de amenidad requerido para eliminar' }, { status: 400 });
    }

    const tenantPrisma = getPrisma(payload.schemaName);
    await tenantPrisma.commonArea.delete({ where: { id: parseInt(id) } });

    ServerLogger.info(`Amenidad eliminada: ID ${id} en complejo ${payload.complexId}`);
    return NextResponse.json({ message: 'Amenidad eliminada exitosamente' }, { status: 200 });
  } catch (error) {
    ServerLogger.error('Error al eliminar amenidad:', error);
    return NextResponse.json({ message: 'Error al eliminar amenidad' }, { status: 500 });
  }
}
