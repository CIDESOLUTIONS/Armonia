// src/app/api/verify-session/route.ts
import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { ServerLogger } from '@/lib/logging/server-logger';

export async function GET(_req: unknown) {
  try {
    ServerLogger.info(`Verificando sesión`);

    // Verificar autenticación
    const { auth, payload } = await verifyAuth(req);
    
    if (!auth || !payload) {
      ServerLogger.warn('Verificación de sesión fallida: Token inválido o expirado');
      return NextResponse.json({ 
        valid: false, 
        message: "Sesión no válida o expirada" 
      }, { status: 401 });
    }
    
    // Sesión válida
    ServerLogger.info(`Sesión verificada para usuario ID: ${payload.id}`);
    return NextResponse.json({ 
      valid: true,
      user: {
        id: payload.id,
        email: payload.email,
        role: payload.role
      }
    });
  } catch (error) {
    ServerLogger.error(`Error verificando sesión:`, error);
    return NextResponse.json({ 
      valid: false, 
      message: "Error al verificar la sesión" 
    }, { status: 500 });
  }
}