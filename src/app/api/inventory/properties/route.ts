import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { authMiddleware } from '@/lib/auth';
import { z } from 'zod';
import { ServerLogger } from '@/lib/logging/server-logger';

const PropertySchema = z.object({
  unitNumber: z.string().min(1, "El número de unidad es requerido."),
  address: z.string().min(1, "La dirección es requerida."),
  type: z.string().min(1, "El tipo es requerido."),
  area: z.number().min(0, "El área debe ser un número positivo."),
  bedrooms: z.number().int().min(0, "El número de habitaciones debe ser un entero positivo."),
  bathrooms: z.number().min(0, "El número de baños debe ser un número positivo."),
  parkingSpaces: z.number().int().min(0, "El número de parqueaderos debe ser un entero positivo."),
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
    const properties = await tenantPrisma.property.findMany();

    ServerLogger.info(`Propiedades listadas para el complejo ${payload.complexId}`);
    return NextResponse.json(properties, { status: 200 });
  } catch (error) {
    ServerLogger.error('Error al obtener propiedades:', error);
    return NextResponse.json({ message: 'Error al obtener propiedades' }, { status: 500 });
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
    const validatedData = PropertySchema.parse(body);

    const tenantPrisma = getPrisma(payload.schemaName);
    const newProperty = await tenantPrisma.property.create({ data: validatedData });

    ServerLogger.info(`Propiedad creada: ${newProperty.unitNumber} en complejo ${payload.complexId}`);
    return NextResponse.json(newProperty, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Error de validación', errors: error.errors }, { status: 400 });
    }
    ServerLogger.error('Error al crear propiedad:', error);
    return NextResponse.json({ message: 'Error al crear propiedad' }, { status: 500 });
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
    const validatedData = PropertySchema.partial().parse(updateData); // Partial para actualizaciones

    if (!id) {
      return NextResponse.json({ message: 'ID de propiedad requerido para actualizar' }, { status: 400 });
    }

    const tenantPrisma = getPrisma(payload.schemaName);
    const updatedProperty = await tenantPrisma.property.update({
      where: { id: parseInt(id) },
      data: validatedData,
    });

    ServerLogger.info(`Propiedad actualizada: ${updatedProperty.unitNumber} en complejo ${payload.complexId}`);
    return NextResponse.json(updatedProperty, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Error de validación', errors: error.errors }, { status: 400 });
    }
    ServerLogger.error('Error al actualizar propiedad:', error);
    return NextResponse.json({ message: 'Error al actualizar propiedad' }, { status: 500 });
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
      return NextResponse.json({ message: 'ID de propiedad requerido para eliminar' }, { status: 400 });
    }

    const tenantPrisma = getPrisma(payload.schemaName);
    await tenantPrisma.property.delete({ where: { id: parseInt(id) } });

    ServerLogger.info(`Propiedad eliminada: ID ${id} en complejo ${payload.complexId}`);
    return NextResponse.json({ message: 'Propiedad eliminada exitosamente' }, { status: 200 });
  } catch (error) {
    ServerLogger.error('Error al eliminar propiedad:', error);
    return NextResponse.json({ message: 'Error al eliminar propiedad' }, { status: 500 });
  }
}
