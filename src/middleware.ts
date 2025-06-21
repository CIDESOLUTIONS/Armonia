import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ServerLogger } from '@/lib/logging/server-logger';
import { verifyToken } from '@/lib/auth';
import { FreemiumService, FEATURES } from '@/lib/freemium-service';
import { getPrisma } from '@/lib/prisma';

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
  '/(admin)': ['ADMIN', 'COMPLEX_ADMIN'],
  '/(resident)': ['ADMIN', 'COMPLEX_ADMIN', 'RESIDENT'],
  '/(reception)': ['ADMIN', 'COMPLEX_ADMIN', 'RECEPTION'],
  '/api/admin': ['ADMIN'],
  '/api/complex': ['ADMIN', 'COMPLEX_ADMIN'],
  '/api/dashboard': ['ADMIN', 'COMPLEX_ADMIN', 'RESIDENT', 'RECEPTION']
};

// Mapeo de rutas a funcionalidades freemium
const FEATURE_ROUTES = {
  '/api/assemblies': FEATURES.ASSEMBLY_MANAGEMENT,
  '/(admin)/assemblies': FEATURES.ASSEMBLY_MANAGEMENT,
  '/api/finances': FEATURES.ADVANCED_FINANCIAL,
  '/api/financial': FEATURES.ADVANCED_FINANCIAL,
  '/(admin)/finances': FEATURES.ADVANCED_FINANCIAL,
  '/api/reservations': FEATURES.COMMON_AREAS_RESERVATIONS,
  '/api/common-areas': FEATURES.COMMON_AREAS_RESERVATIONS,
  '/api/correspondence': FEATURES.DIGITAL_CORRESPONDENCE,
  '/api/communications/whatsapp': FEATURES.VIRTUAL_INTERCOM,
  '/api/communications/telegram': FEATURES.VIRTUAL_INTERCOM
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

function getRequiredFeature(pathname: string): string | null {
  for (const [route, feature] of Object.entries(FEATURE_ROUTES)) {
    if (pathname.startsWith(route)) {
      return feature;
    }
  }
  return null;
}

async function hasFeatureAccess(complexId: number, requiredFeature: string): Promise<boolean> {
  try {
    const prisma = getPrisma();
    const complex = await prisma.residentialComplex.findUnique({
      where: { id: complexId },
      select: { 
        planType: true, 
        trialEndDate: true, 
        planEndDate: true,
        isTrialActive: true 
      }
    });

    if (!complex) return false;

    // Verificar si la suscripción está vencida
    const isExpired = FreemiumService.isSubscriptionExpired(
      complex.planEndDate, 
      complex.planType
    );
    
    if (isExpired) return false;

    // Verificar si el trial está activo y permite la funcionalidad
    const isTrialActive = FreemiumService.isTrialActive(complex.trialEndDate);
    
    // Durante el trial, permitir funcionalidades estándar
    if (isTrialActive) {
      return FreemiumService.hasFeatureAccess('STANDARD', requiredFeature);
    }

    // Verificar según el plan actual
    return FreemiumService.hasFeatureAccess(complex.planType, requiredFeature);
  } catch (error) {
    console.error('[MIDDLEWARE] Error verificando acceso a funcionalidad:', error);
    return false;
  }
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

      // Verificar acceso a funcionalidades freemium
      const requiredFeature = getRequiredFeature(pathname);
      if (requiredFeature && payload.complexId) {
        const hasAccess = await hasFeatureAccess(payload.complexId, requiredFeature);
        
        if (!hasAccess) {
          console.log(`[MIDDLEWARE] Acceso denegado a funcionalidad ${requiredFeature} para complejo ${payload.complexId}`);
          
          if (pathname.startsWith('/api/')) {
            return NextResponse.json(
              { 
                message: 'Esta funcionalidad no está disponible en su plan actual',
                requiredFeature,
                upgradeRequired: true
              },
              { status: 402 } // Payment Required
            );
          }
          
          // Para páginas web, redirigir a upgrade
          return NextResponse.redirect(new URL('/upgrade?feature=' + requiredFeature, request.url));
        }
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
    // Páginas protegidas (nuevos grupos de rutas)
    '/(admin)/:path*',
    '/(resident)/:path*', 
    '/(reception)/:path*',
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

