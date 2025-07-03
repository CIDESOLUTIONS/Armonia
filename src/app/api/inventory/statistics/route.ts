// src/app/api/inventory/statistics/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { inventoryService } from '@/lib/services/inventory-service-refactored';
import { z } from 'zod';

// Schema para parámetros de estadísticas
const StatisticsSearchSchema = z.object({
  complexId: z.string().transform(val => parseInt(val)).pipe(z.number().positive())
});

// GET: Obtener estadísticas de inventario del complejo
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
    const validation = StatisticsSearchSchema.safeParse(queryParams);
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

    // Obtener estadísticas usando el servicio refactorizado
    const stats = await inventoryService.getInventoryStats(complexId);

    console.log(`[INVENTORY STATISTICS] Estadísticas obtenidas para complejo ${complexId}`);

    return NextResponse.json({ 
      success: true,
      statistics: stats,
      complexId,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('[INVENTORY STATISTICS GET] Error:', error);
    return NextResponse.json(
      { 
        message: error instanceof Error ? error.message : 'Error al obtener estadísticas' 
      },
      { status: 500 }
    );
  }
}
