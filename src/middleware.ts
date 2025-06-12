import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ServerLogger } from '@/lib/logging/server-logger';
import { verifyToken } from '@/lib/auth';

// Rutas públicas que no requieren autenticación
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register-complex',
  '/portal-selector',
  '/checkout',
  '/api/auth/login',
  '/api/register-complex',
  '/api/contact',
  '/_next',
  '/favicon.ico',
  '/images',
  '/videos'
];

// Rutas que requieren roles específicos
const ROLE_ROUTES = {
  '/admin': ['ADMIN', 'COMPLEX_ADMIN'],
  '/dashboard': ['ADMIN', 'COMPLEX_ADMIN', 'RESIDENT'],
  '/reception': ['ADMIN', 'COMPLEX_ADMIN', 'RECEPTION'],
  '/api/admin': ['ADMIN'],
  '/api/complex': ['ADMIN', 'COMPLEX_ADMIN'],
  '/api/dashboard': ['ADMIN', 'COMPLEX_ADMIN', 'RESIDENT', 'RECEPTION']
};

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => 
    pathname.startsWith(route) || pathname === route
  );
}

function hasRequiredRole(pathname: string, userRole: string): boolean {
  for (const [route, allowedRoles] of Object.entries(ROLE_ROUTES)) {
    if (pathname.startsWith(route)) {
      return allowedRoles.includes(userRole);
    }
  }
  return true; // Si no está en rutas restringidas, permitir acceso
}

export async function middleware(request: NextRequest) {
  try {
    const pathname = request.nextUrl.pathname;
    
    // Registrar solicitud HTTP
    ServerLogger.httpRequest({
      method: request.method,
      url: pathname,
      ip: request.ip || 'unknown'
    });

    // Aplicar headers de seguridad a todas las respuestas
    const securityHeaders = {
      'X-XSS-Protection': '1; mode=block',
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'X-DNS-Prefetch-Control': 'off',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
    };

    // Si es ruta pública, aplicar headers de seguridad y continuar
    if (isPublicRoute(pathname)) {
      const response = NextResponse.next();
      Object.entries(securityHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
      return response;
    }

    // Verificar autenticación para rutas protegidas
    const authHeader = request.headers.get('authorization');
    const cookieToken = request.cookies.get('auth-token')?.value;
    
    const token = authHeader?.replace('Bearer ', '') || cookieToken;

    if (!token) {
      console.log(`[MIDDLEWARE] Token no encontrado para ruta protegida: ${pathname}`);
      
      // Si es API, retornar 401
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { message: 'Token de autorización requerido' },
          { status: 401 }
        );
      }
      
      // Si es página web, redirigir a login
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Verificar y decodificar token
    try {
      const payload = await verifyToken(token);
      
      if (!payload || !payload.role) {
        throw new Error('Token inválido o sin rol');
      }

      // Verificar autorización por rol
      if (!hasRequiredRole(pathname, payload.role)) {
        console.log(`[MIDDLEWARE] Acceso denegado para rol ${payload.role} en ruta ${pathname}`);
        
        if (pathname.startsWith('/api/')) {
          return NextResponse.json(
            { message: 'Permisos insuficientes para acceder a este recurso' },
            { status: 403 }
          );
        }
        
        // Redirigir a dashboard apropiado según rol
        const redirectUrl = payload.role === 'RESIDENT' ? '/dashboard' : 
                           payload.role === 'RECEPTION' ? '/reception' : '/admin';
        return NextResponse.redirect(new URL(redirectUrl, request.url));
      }

      // Agregar información del usuario a headers para las APIs
      const response = NextResponse.next();
      
      // Headers de seguridad
      Object.entries(securityHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
      
      // Headers de usuario para APIs
      if (pathname.startsWith('/api/')) {
        response.headers.set('X-User-Id', payload.id.toString());
        response.headers.set('X-User-Role', payload.role);
        response.headers.set('X-User-Email', payload.email);
        if (payload.complexId) {
          response.headers.set('X-Complex-Id', payload.complexId.toString());
          response.headers.set('X-Schema-Name', payload.schemaName || '');
        }
      }

      return response;

    } catch (error) {
      console.error(`[MIDDLEWARE] Error verificando token:`, error);
      
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { message: 'Token inválido' },
          { status: 401 }
        );
      }
      
      return NextResponse.redirect(new URL('/login', request.url));
    }

  } catch (error) {
    console.error('[MIDDLEWARE] Error general:', error);
    
    // En caso de error, aplicar headers de seguridad mínimos y continuar
    const response = NextResponse.next();
    response.headers.set('X-Content-Type-Options', 'nosniff');
    return response;
  }
}

export const config = {
  matcher: [
    // Páginas protegidas
    '/dashboard/:path*',
    '/admin/:path*', 
    '/reception/:path*',
    '/profile/:path*',
    // APIs protegidas
    '/api/dashboard/:path*',
    '/api/admin/:path*',
    '/api/complex/:path*',
    '/api/pqr/:path*',
    '/api/finances/:path*',
    '/api/financial/:path*',
    '/api/assemblies/:path*',
    '/api/reservations/:path*',
    '/api/common-areas/:path*',
    '/api/visitors/:path*',
    '/api/incidents/:path*',
    '/api/communications/:path*',
    '/api/correspondence/:path*',
    '/api/cameras/:path*',
    '/api/inventory/:path*',
    '/api/projects/:path*',
    '/api/payments/:path*',
    '/api/payment/:path*',
    '/api/services/:path*',
    '/api/common-services/:path*',
    '/api/notifications/:path*',
    '/api/user/:path*',
    '/api/verify-session/:path*',
    // Rutas públicas que necesitan headers de seguridad
    '/((?!_next/static|_next/image|favicon.ico).*)'
  ]
};
