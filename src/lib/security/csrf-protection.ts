/**
 * CSRF Protection Middleware
 * 
 * Este middleware implementa protección contra ataques CSRF (Cross-Site Request Forgery)
 * utilizando tokens CSRF que deben ser incluidos en todas las solicitudes POST, PUT, DELETE.
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

// Nombre de la cookie y header para el token CSRF
const CSRF_COOKIE_NAME = 'armonia-csrf-token';
const CSRF_HEADER_NAME = 'x-csrf-token';

/**
 * Genera un token CSRF aleatorio
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Establece un token CSRF en las cookies
 */
export function setCsrfToken(response: NextResponse): string {
  const token = generateCsrfToken();
  
  // Configurar la cookie con opciones de seguridad
  response.cookies.set({
    name: CSRF_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  });
  
  return token;
}

/**
 * Obtiene el token CSRF actual de las cookies
 */
export function getCsrfToken(): string | undefined {
  const cookieStore = cookies();
  return cookieStore.get(CSRF_COOKIE_NAME)?.value;
}

/**
 * Middleware para validar tokens CSRF en solicitudes mutables
 */
export function validateCsrfToken(request: NextRequest): boolean {
  // Solo validar en métodos que modifican datos
  const mutableMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
  if (!mutableMethods.includes(request.method)) {
    return true;
  }
  
  // Obtener token de la cookie y del header
  const cookieToken = request.cookies.get(CSRF_COOKIE_NAME)?.value;
  const headerToken = request.headers.get(CSRF_HEADER_NAME);
  
  // Validar que ambos tokens existan y coincidan
  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return false;
  }
  
  return true;
}

/**
 * Middleware para protección CSRF
 */
export function csrfProtection(handler: Function) {
  return async (request: NextRequest, ...args: unknown[]) => {
    // Verificar si la protección CSRF está habilitada en la configuración
    const config = await import('@/config/security').then(mod => mod.default);
    if (!config.csrfProtection) {
      return handler(request, ...args);
    }
    
    // Validar token CSRF para métodos mutables
    if (!validateCsrfToken(request)) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'Invalid CSRF token',
          message: 'La solicitud no pudo ser procesada por razones de seguridad'
        }),
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Continuar con el handler si la validación es exitosa
    return handler(request, ...args);
  };
}

/**
 * Hook para usar en componentes del cliente para obtener y manejar tokens CSRF
 */
export function useCsrfToken() {
  const getCsrfTokenForRequest = async () => {
    try {
      // Implementación correcta para obtener el token CSRF
      const response = await fetch('/api/security/csrf-token');
      if (!response.ok) {
        throw new Error('Error al obtener token CSRF');
      }
      const data = await response.json();
      return data.csrfToken;
    } catch (error) {
      console.error('Error al obtener token CSRF:', error);
      return null;
    }
  };
  
  return { getCsrfTokenForRequest };
}
