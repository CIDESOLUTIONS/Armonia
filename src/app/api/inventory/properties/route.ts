// src/app/api/inventory/properties/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { inventoryService, PropertyCreateSchema } from '@/lib/services/inventory-service-refactored';
import { z } from 'zod';

// Schema para parámetros de búsqueda
const PropertySearchSchema = z.object({
  complexId: z.string().transform(val => parseInt(val)).pipe(z.number().positive())
});

// GET: Obtener propiedades de un complejo
export async function GET(request: NextRequest) {
  try {
    const { auth, payload } = await verifyAuth(request);
    if (!auth || !payload) {
      return NextResponse.json({ message: 'Token requerido' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const queryParams = {
      complexId: searchParams.get('complexId') || ''
    };

    // Validar parámetros
    const validation = PropertySearchSchema.safeParse(queryParams);
    if (!validation.success) {
      return NextResponse.json(
        { 
          message: 'Parámetros inválidos',
          errors: validation.error.format()
        },
        { status: 400 }
      );
    }

    const { complexId } = validation.data;

    // Verificar acceso al complejo
    if (payload.complexId && payload.complexId !== complexId) {
      return NextResponse.json({ 
        message: 'Sin acceso a este complejo' 
      }, { status: 403 });
    }

    // Obtener propiedades usando el servicio refactorizado
    const properties = await inventoryService.getProperties(complexId);

    console.log(`[INVENTORY PROPERTIES] ${properties.length} propiedades obtenidas para complejo ${complexId}`);

    return NextResponse.json({ 
      success: true,
      properties,
      total: properties.length
    });

  } catch (error) {
    console.error('[INVENTORY PROPERTIES GET] Error:', error);
    return NextResponse.json(
      { 
        message: error instanceof Error ? error.message : 'Error al obtener propiedades' 
      },
      { status: 500 }
    );
  }
}

// POST: Crear nueva propiedad
export async function POST(request: NextRequest) {
  try {
    const { auth, payload } = await verifyAuth(request);
    if (!auth || !payload) {
      return NextResponse.json({ message: 'Token requerido' }, { status: 401 });
    }

    // Solo admins pueden crear propiedades
    if (!['ADMIN', 'COMPLEX_ADMIN'].includes(payload.role)) {
      return NextResponse.json({ 
        message: 'Solo administradores pueden crear propiedades' 
      }, { status: 403 });
    }

    const body = await request.json();
    
    // Validar datos de entrada
    const validation = PropertyCreateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          message: 'Datos inválidos',
          errors: validation.error.format()
        },
        { status: 400 }
      );
    }

    const propertyData = validation.data;

    // Verificar acceso al complejo
    if (payload.complexId && payload.complexId !== propertyData.complexId) {
      return NextResponse.json({ 
        message: 'Sin acceso a este complejo' 
      }, { status: 403 });
    }

    // Crear propiedad usando el servicio refactorizado
    const property = await inventoryService.createProperty(propertyData);

    console.log(`[INVENTORY PROPERTIES] Propiedad ${property.unitNumber} creada por ${payload.email}`);

    return NextResponse.json({
      success: true,
      message: 'Propiedad creada exitosamente',
      property
    });

  } catch (error) {
    console.error('[INVENTORY PROPERTIES POST] Error:', error);
    return NextResponse.json(
      { 
        message: error instanceof Error ? error.message : 'Error al crear propiedad' 
      },
      { status: 500 }
    );
  }
}

// PUT: Actualizar propiedad existente
export async function PUT(request: NextRequest) {
  try {
    const { auth, payload } = await verifyAuth(request);
    if (!auth || !payload) {
      return NextResponse.json({ message: 'Token requerido' }, { status: 401 });
    }

    // Solo admins pueden actualizar propiedades
    if (!['ADMIN', 'COMPLEX_ADMIN'].includes(payload.role)) {
      return NextResponse.json({ 
        message: 'Solo administradores pueden actualizar propiedades' 
      }, { status: 403 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ 
        message: 'ID de propiedad requerido' 
      }, { status: 400 });
    }

    // Validar datos de actualización
    const validation = PropertyCreateSchema.partial().safeParse(updateData);
    if (!validation.success) {
      return NextResponse.json(
        { 
          message: 'Datos inválidos',
          errors: validation.error.format()
        },
        { status: 400 }
      );
    }

    const validatedData = validation.data;

    // Actualizar propiedad usando el servicio refactorizado
    const property = await inventoryService.updateProperty(id, validatedData);

    console.log(`[INVENTORY PROPERTIES] Propiedad ${property.unitNumber} actualizada por ${payload.email}`);

    return NextResponse.json({
      success: true,
      message: 'Propiedad actualizada exitosamente',
      property
    });

  } catch (error) {
    console.error('[INVENTORY PROPERTIES PUT] Error:', error);
    return NextResponse.json(
      { 
        message: error instanceof Error ? error.message : 'Error al actualizar propiedad' 
      },
      { status: 500 }
    );
  }
}