import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

// Rutas públicas que no requieren autenticación
const publicRoutes = [
  '/',
  '/portal-selector',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/health',
  '/_next',
  '/favicon.ico',
  '/static'
];

// Función para verificar si una ruta es pública
function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some(route => {
    if (route === pathname) return true;
    if (route.endsWith('*')) {
      return pathname.startsWith(route.slice(0, -1));
    }
    if (pathname.startsWith(route + '/')) return true;
    return false;
  });
}

export async function middleware(request: NextRequest) {
  try {
    const pathname = request.nextUrl.pathname;
    
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
    const cookieToken = request.cookies.get('token')?.value;
    
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
      
      // Si es página web, redirigir al login
      return NextResponse.redirect(new URL('/portal-selector', request.url));
    }

    // Verificar validez del token
    const payload = await verifyToken(token);
    
    if (!payload) {
      console.log(`[MIDDLEWARE] Token inválido para ruta: ${pathname}`);
      
      // Si es API, retornar 401
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { message: 'Token inválido o expirado' },
          { status: 401 }
        );
      }
      
      // Si es página web, redirigir al login
      return NextResponse.redirect(new URL('/portal-selector', request.url));
    }

    // Token válido, continuar con headers de seguridad
    const response = NextResponse.next();
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    
    // Agregar información del usuario a los headers para las APIs
    response.headers.set('x-user-id', payload.id.toString());
    response.headers.set('x-user-role', payload.role);
    if (payload.complexId) {
      response.headers.set('x-complex-id', payload.complexId.toString());
    }
    
    return response;

  } catch (error) {
    console.error('[MIDDLEWARE] Error:', error);
    
    // En caso de error, aplicar headers de seguridad y continuar
    const response = NextResponse.next();
    const securityHeaders = {
      'X-XSS-Protection': '1; mode=block',
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff'
    };
    
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

