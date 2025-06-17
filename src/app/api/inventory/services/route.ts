// src/app/api/inventory/services/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { inventoryService } from '@/lib/services/inventory-service-refactored';
import { z } from 'zod';

// Schema para parámetros de búsqueda de servicios
const ServiceSearchSchema = z.object({
  complexId: z.string().transform(val => parseInt(val)).pipe(z.number().positive())
});

// GET: Obtener servicios comunes de un complejo
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
    const validation = ServiceSearchSchema.safeParse(queryParams);
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

    // Obtener servicios usando el servicio refactorizado
    const services = await inventoryService.getServices(complexId);

    console.log(`[INVENTORY SERVICES] ${services.length} servicios obtenidos para complejo ${complexId}`);

    return NextResponse.json({ 
      success: true,
      services,
      total: services.length
    });

  } catch (error) {
    console.error('[INVENTORY SERVICES GET] Error:', error);
    return NextResponse.json(
      { 
        message: error instanceof Error ? error.message : 'Error al obtener servicios' 
      },
      { status: 500 }
    );
  }
}
