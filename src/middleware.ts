import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ServerLogger } from '@/lib/logging/server-logger';

export function middleware(request: NextRequest) {
  try {
    // Registrar solicitud HTTP
    ServerLogger.httpRequest({
      method: request.method,
      url: request.nextUrl.pathname,
      ip: request.ip || 'unknown'
    });

    // Verificar autenticación
    // Nota: En esta aplicación estamos usando localStorage para autenticación del lado del cliente
    // El middleware solo puede acceder a cookies, no a localStorage
    // Aceptamos cualquier solicitud y dejamos que el componente de cliente maneje la redirección si no está autenticado

    // Seguridad adicional: prevenir ataques
    const securityHeaders = {
      'X-XSS-Protection': '1; mode=block',
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    };

    const _response = NextResponse.next();

    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  } catch (error) {
    // Registrar cualquier error
    console.error('[Middleware] Error:', error);
    
    // En caso de error, permitir que la solicitud continúe
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    '/dashboard/:path*', 
    '/admin/:path*', 
    '/profile/:path*'
  ]
};
