import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { authMiddleware } from '@/lib/auth';
import { z } from 'zod';
import { ServerLogger } from '@/lib/logging/server-logger';

const VehicleSchema = z.object({
  licensePlate: z.string().min(1, "La placa es requerida."),
  brand: z.string().min(1, "La marca es requerida."),
  model: z.string().min(1, "El modelo es requerido."),
  color: z.string().min(1, "El color es requerido."),
  ownerName: z.string().min(1, "El nombre del propietario es requerido."),
  propertyId: z.number().int().positive("ID de propiedad inválido."),
  parkingSpace: z.string().optional(),
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
    const vehicles = await tenantPrisma.vehicle.findMany({
      include: {
        property: { select: { unitNumber: true } },
      },
    });

    const vehiclesWithUnitNumber = vehicles.map(vehicle => ({
      ...vehicle,
      unitNumber: vehicle.property?.unitNumber || 'N/A',
    }));

    ServerLogger.info(`Vehículos listados para el complejo ${payload.complexId}`);
    return NextResponse.json(vehiclesWithUnitNumber, { status: 200 });
  } catch (error) {
    ServerLogger.error('Error al obtener vehículos:', error);
    return NextResponse.json({ message: 'Error al obtener vehículos' }, { status: 500 });
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
    const validatedData = VehicleSchema.parse(body);

    const tenantPrisma = getPrisma(payload.schemaName);
    const newVehicle = await tenantPrisma.vehicle.create({ data: validatedData });

    ServerLogger.info(`Vehículo creado: ${newVehicle.licensePlate} en complejo ${payload.complexId}`);
    return NextResponse.json(newVehicle, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Error de validación', errors: error.errors }, { status: 400 });
    }
    ServerLogger.error('Error al crear vehículo:', error);
    return NextResponse.json({ message: 'Error al crear vehículo' }, { status: 500 });
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
    const validatedData = VehicleSchema.partial().parse(updateData); // Partial para actualizaciones

    if (!id) {
      return NextResponse.json({ message: 'ID de vehículo requerido para actualizar' }, { status: 400 });
    }

    const tenantPrisma = getPrisma(payload.schemaName);
    const updatedVehicle = await tenantPrisma.vehicle.update({
      where: { id: parseInt(id) },
      data: validatedData,
    });

    ServerLogger.info(`Vehículo actualizado: ${updatedVehicle.licensePlate} en complejo ${payload.complexId}`);
    return NextResponse.json(updatedVehicle, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Error de validación', errors: error.errors }, { status: 400 });
    }
    ServerLogger.error('Error al actualizar vehículo:', error);
    return NextResponse.json({ message: 'Error al actualizar vehículo' }, { status: 500 });
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
      return NextResponse.json({ message: 'ID de vehículo requerido para eliminar' }, { status: 400 });
    }

    const tenantPrisma = getPrisma(payload.schemaName);
    await tenantPrisma.vehicle.delete({ where: { id: parseInt(id) } });

    ServerLogger.info(`Vehículo eliminado: ID ${id} en complejo ${payload.complexId}`);
    return NextResponse.json({ message: 'Vehículo eliminado exitosamente' }, { status: 200 });
  } catch (error) {
    ServerLogger.error('Error al eliminar vehículo:', error);
    return NextResponse.json({ message: 'Error al eliminar vehículo' }, { status: 500 });
  }
}