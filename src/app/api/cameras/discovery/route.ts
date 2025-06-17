// src/app/api/cameras/discovery/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { cameraService } from '@/lib/services/camera-service-onvif';
import { z } from 'zod';

// Schema para discovery de cámaras
const DiscoverySchema = z.object({
  timeout: z.number().min(5000).max(60000).optional().default(30000)
});

// POST: Descubrir cámaras en la red
export async function POST(request: NextRequest) {
  try {
    const { auth, payload } = await verifyAuth(request);
    if (!auth || !payload) {
      return NextResponse.json({ message: 'Token requerido' }, { status: 401 });
    }

    // Solo admins y personal de seguridad pueden descubrir cámaras
    if (!['ADMIN', 'COMPLEX_ADMIN', 'RECEPTION'].includes(payload.role)) {
      return NextResponse.json({ 
        message: 'Solo administradores pueden descubrir cámaras' 
      }, { status: 403 });
    }

    if (!payload.complexId) {
      return NextResponse.json({ 
        message: 'Usuario sin complejo asociado' 
      }, { status: 400 });
    }

    const body = await request.json();
    const validation = DiscoverySchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          message: 'Datos inválidos', 
          errors: validation.error.format() 
        },
        { status: 400 }
      );
    }

    const { timeout } = validation.data;

    console.log(`[CAMERA DISCOVERY API] Iniciado por ${payload.email} para complejo ${payload.complexId}`);

    // Ejecutar discovery
    const discoveredCameras = await cameraService.discoverCameras(payload.complexId, timeout);

    return NextResponse.json({
      success: true,
      message: `${discoveredCameras.length} cámaras descubiertas`,
      cameras: discoveredCameras,
      discoveredAt: new Date().toISOString(),
      timeout
    });

  } catch (error) {
    console.error('[CAMERA DISCOVERY API] Error:', error);
    return NextResponse.json({ 
      message: error instanceof Error ? error.message : 'Error interno del servidor' 
    }, { status: 500 });
  }
}

// GET: Obtener último resultado de discovery
export async function GET(request: NextRequest) {
  try {
    const { auth, payload } = await verifyAuth(request);
    if (!auth || !payload) {
      return NextResponse.json({ message: 'Token requerido' }, { status: 401 });
    }

    if (!['ADMIN', 'COMPLEX_ADMIN', 'RECEPTION'].includes(payload.role)) {
      return NextResponse.json({ 
        message: 'Sin permisos para ver cámaras' 
      }, { status: 403 });
    }

    if (!payload.complexId) {
      return NextResponse.json({ 
        message: 'Usuario sin complejo asociado' 
      }, { status: 400 });
    }

    // Obtener estadísticas de cámaras
    const stats = await cameraService.getCameraStats(payload.complexId);

    return NextResponse.json({
      success: true,
      stats,
      lastCheck: new Date().toISOString()
    });

  } catch (error) {
    console.error('[CAMERA DISCOVERY STATS] Error:', error);
    return NextResponse.json({ 
      message: 'Error obteniendo estadísticas' 
    }, { status: 500 });
  }
}
