// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { ServerLogger } from '@/lib/logging/server-logger';

// Función para obtener el token de diferentes fuentes (autorización o cookies)
function getToken(request: NextRequest): string | null {
  // Verificar primero en las cabeceras de autorización
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }
  
  // Si no está en las cabeceras, verificar en cookies
  const tokenCookie = request.cookies.get('token');
  if (tokenCookie) {
    return tokenCookie.value;
  }
  
  // Como última opción, revisar en localStorage (para clientes)
  // Este código solo se ejecutará en el navegador
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  
  return null;
}

export async function middleware(request: NextRequest) {
  try {
    // Obtener la ruta actual
    const path = request.nextUrl.pathname;
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    
    console.log('[Middleware] Verificando ruta:', path);

    // Determinar si es una ruta protegida
    const isProtectedRoute = 
      path.startsWith('/admin') || 
      path.startsWith('/resident') ||
      path.startsWith('/reception') ||
      path.startsWith('/app-admin');
      
    // Ruta de redirección por defecto
    const loginUrl = new URL('/auth/login', request.url);
    
    // Si es una ruta protegida, verificar autenticación
    if (isProtectedRoute) {
      // Obtener el token
      const token = getToken(request);
      
      if (!token) {
        console.warn('Intento de acceso no autorizado', { path, ip });
        console.log('[Middleware] Redirigiendo a login - no autenticado');
        return NextResponse.redirect(loginUrl);
      }
      
      try {
        // Verificar el token
        const secretKey = new TextEncoder().encode(process.env.JWT_SECRET || 'default_secret');
        const jwtVerification = await jwtVerify(token, secretKey);
        
        // Registrar información del usuario autenticado (opcional)
        if (jwtVerification.payload.email) {
          console.log(`Usuario autenticado: ${jwtVerification.payload.email}`);
        }
        
        // Token válido, continuar
        return NextResponse.next();
      } catch (error) {
        console.warn('Token inválido', { path, ip, error: (error as Error).message });
        console.log('[Middleware] Token inválido - redirigiendo a login');
        
        // Crear una respuesta de redirección
        const response = NextResponse.redirect(loginUrl);
        
        // Limpiar la cookie del token para evitar ciclos infinitos
        response.cookies.delete('token');
        
        return response;
      }
    }

    // Para rutas no protegidas, continuar
    return NextResponse.next();
  } catch (error) {
    // Capturar cualquier error que pueda ocurrir en el middleware
    console.error('[Middleware] Error inesperado:', (error as Error).message);
    
    // En caso de error, permitir que la solicitud continúe
    // El manejo específico del error se puede hacer en el controlador de la ruta
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    // Proteger todas las rutas de dashboard y resident
    '/admin/:path*',
    '/resident/:path*',
    '/reception/:path*',
    '/app-admin/:path*',
  ],
};