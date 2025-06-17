// src/app/api/inventory/vehicles/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { getPrisma } from '@/lib/prisma';
import { inventoryService, VehicleCreateSchema } from '@/lib/services/inventory-service-refactored';
import { z } from 'zod';

// Schema para parámetros de búsqueda
const VehicleSearchSchema = z.object({
  complexId: z.string().transform(val => parseInt(val)).pipe(z.number().positive()),
  propertyId: z.string().transform(val => parseInt(val)).pipe(z.number().positive()).optional()
});

// Schema para actualización de vehículo
const VehicleUpdateSchema = VehicleCreateSchema.partial().extend({
  id: z.number()
});

// GET: Obtener vehículos de un complejo
export async function GET(request: NextRequest) {
  try {
    const { auth, payload } = await verifyAuth(request);
    if (!auth || !payload) {
      return NextResponse.json({ message: 'Token requerido' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const queryParams = {
      complexId: searchParams.get('complexId') || '',
      propertyId: searchParams.get('propertyId') || undefined
    };

    // Validar parámetros
    const validation = VehicleSearchSchema.safeParse(queryParams);
    if (!validation.success) {
      return NextResponse.json(
        { 
          message: 'Parámetros inválidos',
          errors: validation.error.format()
        },
        { status: 400 }
      );
    }

    const { complexId, propertyId } = validation.data;

    // Verificar acceso al complejo
    if (payload.complexId && payload.complexId !== complexId) {
      return NextResponse.json({ 
        message: 'Sin acceso a este complejo' 
      }, { status: 403 });
    }

    // Obtener vehículos usando el servicio refactorizado
    const vehicles = await inventoryService.getVehicles(complexId, propertyId);

    console.log(`[INVENTORY VEHICLES] ${vehicles.length} vehículos obtenidos para complejo ${complexId}`);

    return NextResponse.json({ 
      success: true,
      vehicles,
      total: vehicles.length
    });

  } catch (error) {
    console.error('[INVENTORY VEHICLES GET] Error:', error);
    return NextResponse.json(
      { 
        message: error instanceof Error ? error.message : 'Error al obtener vehículos' 
      },
      { status: 500 }
    );
  }
}

// POST: Crear nuevo vehículo
export async function POST(request: NextRequest) {
  try {
    const { auth, payload } = await verifyAuth(request);
    if (!auth || !payload) {
      return NextResponse.json({ message: 'Token requerido' }, { status: 401 });
    }

    // Solo admins y personal autorizado pueden crear vehículos
    if (!['ADMIN', 'COMPLEX_ADMIN', 'RECEPTION'].includes(payload.role)) {
      return NextResponse.json({ 
        message: 'Sin permisos para registrar vehículos' 
      }, { status: 403 });
    }

    const body = await request.json();
    
    // Validar datos de entrada
    const validation = VehicleCreateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          message: 'Datos inválidos',
          errors: validation.error.format()
        },
        { status: 400 }
      );
    }

    const vehicleData = validation.data;

    // Crear vehículo usando el servicio refactorizado
    const vehicle = await inventoryService.createVehicle(vehicleData);

    console.log(`[INVENTORY VEHICLES] Vehículo ${vehicle.licensePlate} creado por ${payload.email}`);

    return NextResponse.json({
      success: true,
      message: 'Vehículo registrado exitosamente',
      vehicle
    });

  } catch (error) {
    console.error('[INVENTORY VEHICLES POST] Error:', error);
    return NextResponse.json(
      { 
        message: error instanceof Error ? error.message : 'Error al registrar vehículo' 
      },
      { status: 500 }
    );
  }
}

// PUT: Actualizar vehículo existente
export async function PUT(request: NextRequest) {
  try {
    const { auth, payload } = await verifyAuth(request);
    if (!auth || !payload) {
      return NextResponse.json({ message: 'Token requerido' }, { status: 401 });
    }

    // Solo admins y personal autorizado pueden actualizar vehículos
    if (!['ADMIN', 'COMPLEX_ADMIN', 'RECEPTION'].includes(payload.role)) {
      return NextResponse.json({ 
        message: 'Sin permisos para actualizar vehículos' 
      }, { status: 403 });
    }

    const body = await request.json();
    
    // Validar datos de entrada
    const validation = VehicleUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          message: 'Datos inválidos',
          errors: validation.error.format()
        },
        { status: 400 }
      );
    }

    const { id, ...updateData } = validation.data;

    // Actualizar vehículo usando Prisma directo (no implementado en servicio aún)
    const prisma = getPrisma();
    const vehicle = await prisma.vehicle.update({
      where: { id },
      data: updateData,
      include: {
        property: {
          select: { unitNumber: true }
        },
        resident: {
          select: { name: true }
        }
      }
    });

    console.log(`[INVENTORY VEHICLES] Vehículo ${vehicle.licensePlate} actualizado por ${payload.email}`);

    return NextResponse.json({
      success: true,
      message: 'Vehículo actualizado exitosamente',
      vehicle
    });

  } catch (error) {
    console.error('[INVENTORY VEHICLES PUT] Error:', error);
    return NextResponse.json(
      { 
        message: error instanceof Error ? error.message : 'Error al actualizar vehículo' 
      },
      { status: 500 }
    );
  }
}

// DELETE: Eliminar vehículo
export async function DELETE(request: NextRequest) {
  try {
    const { auth, payload } = await verifyAuth(request);
    if (!auth || !payload) {
      return NextResponse.json({ message: 'Token requerido' }, { status: 401 });
    }

    // Solo admins pueden eliminar vehículos
    if (!['ADMIN', 'COMPLEX_ADMIN'].includes(payload.role)) {
      return NextResponse.json({ 
        message: 'Solo administradores pueden eliminar vehículos' 
      }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const vehicleId = searchParams.get('id');

    if (!vehicleId || isNaN(Number(vehicleId))) {
      return NextResponse.json({ 
        message: 'ID de vehículo requerido' 
      }, { status: 400 });
    }

    // Eliminar vehículo
    const prisma = getPrisma();
    await prisma.vehicle.delete({
      where: { id: Number(vehicleId) }
    });

    console.log(`[INVENTORY VEHICLES] Vehículo ${vehicleId} eliminado por ${payload.email}`);

    return NextResponse.json({
      success: true,
      message: 'Vehículo eliminado exitosamente'
    });

  } catch (error) {
    console.error('[INVENTORY VEHICLES DELETE] Error:', error);
    return NextResponse.json(
      { 
        message: error instanceof Error ? error.message : 'Error al eliminar vehículo' 
      },
      { status: 500 }
    );
  }
}
