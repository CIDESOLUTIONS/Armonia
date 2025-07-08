// src/app/api/inventory/pets/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { inventoryService } from '@/lib/services/inventory-service-refactored';
import { PetCreateSchema } from '@/lib/schemas/inventory-schemas';
import { z } from 'zod';

// Schema para parámetros de búsqueda
const PetSearchSchema = z.object({
  complexId: z.string().transform(val => parseInt(val)).pipe(z.number().positive()),
  propertyId: z.string().transform(val => parseInt(val)).pipe(z.number().positive()).optional()
});

// GET: Obtener mascotas de un complejo
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
    const validation = PetSearchSchema.safeParse(queryParams);
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

    // Obtener mascotas usando el servicio refactorizado
    const pets = await inventoryService.getPets(complexId, propertyId);

    console.log(`[INVENTORY PETS] ${pets.length} mascotas obtenidas para complejo ${complexId}`);

    return NextResponse.json({ 
      success: true,
      pets,
      total: pets.length
    });

  } catch (error) {
    console.error('[INVENTORY PETS GET] Error:', error);
    return NextResponse.json(
      { 
        message: error instanceof Error ? error.message : 'Error al obtener mascotas' 
      },
      { status: 500 }
    );
  }
}

// POST: Crear nueva mascota
export async function POST(request: NextRequest) {
  try {
    const { auth, payload } = await verifyAuth(request);
    if (!auth || !payload) {
      return NextResponse.json({ message: 'Token requerido' }, { status: 401 });
    }

    // Solo admins y personal autorizado pueden crear mascotas
    if (!['ADMIN', 'COMPLEX_ADMIN', 'RECEPTION'].includes(payload.role)) {
      return NextResponse.json({ 
        message: 'Sin permisos para registrar mascotas' 
      }, { status: 403 });
    }

    const body = await request.json();
    
    // Validar datos de entrada
    const validation = PetCreateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          message: 'Datos inválidos',
          errors: validation.error.format()
        },
        { status: 400 }
      );
    }

    const petData = validation.data;

    // Crear mascota usando el servicio refactorizado
    const pet = await inventoryService.createPet(petData);

    console.log(`[INVENTORY PETS] Mascota ${pet.name} creada por ${payload.email}`);

    return NextResponse.json({
      success: true,
      message: 'Mascota registrada exitosamente',
      pet
    });

  } catch (error) {
    console.error('[INVENTORY PETS POST] Error:', error);
    return NextResponse.json(
      { 
        message: error instanceof Error ? error.message : 'Error al registrar mascota' 
      },
      { status: 500 }
    );
  }
}