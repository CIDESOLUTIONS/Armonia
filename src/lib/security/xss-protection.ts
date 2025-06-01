/**
 * XSS Protection Middleware
 * 
 * Este middleware implementa protección contra ataques XSS (Cross-Site Scripting)
 * sanitizando las entradas de usuario y estableciendo headers de seguridad apropiados.
 */

import { NextRequest, NextResponse } from 'next/server';
import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitiza un objeto recursivamente para prevenir XSS
 */
export function sanitizeData(data: unknown): unknown {
  if (typeof data === 'string') {
    return DOMPurify.sanitize(data);
  } else if (Array.isArray(data)) {
    return data.map(item => sanitizeData(item));
  } else if (data !== null && typeof data === 'object') {
    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeData(value);
    }
    return sanitized;
  }
  return data;
}

/**
 * Establece headers de seguridad para prevenir XSS
 */
export function setSecurityHeaders(response: NextResponse): NextResponse {
  // Content-Security-Policy para restringir fuentes de contenido
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://*; connect-src 'self' https://api.armonia.com;"
  );
  
  // X-XSS-Protection para navegadores antiguos
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // X-Content-Type-Options para prevenir MIME sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  // Referrer-Policy para controlar información de referencia
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  return response;
}

/**
 * Middleware para protección XSS
 */
export function xssProtection(handler: Function) {
  return async (request: NextRequest, ...args: unknown[]) => {
    // Verificar si la protección XSS está habilitada en la configuración
    const config = await import('@/config/security').then(mod => mod.default);
    if (!config.xssProtection) {
      return handler(request, ...args);
    }
    
    // Para solicitudes con cuerpo JSON, sanitizar los datos
    if (request.headers.get('content-type')?.includes('application/json')) {
      try {
        const body = await request.json();
        const sanitizedBody = sanitizeData(body);
        
        // Crear una nueva solicitud con el cuerpo sanitizado
        const newRequest = new NextRequest(request, {
          body: JSON.stringify(sanitizedBody),
          headers: request.headers,
        });
        
        // Procesar la solicitud con el handler
        const response = await handler(newRequest, ...args);
        
        // Establecer headers de seguridad en la respuesta
        return setSecurityHeaders(response);
      } catch (error) {
        console.error('Error al procesar protección XSS:', error);
        return handler(request, ...args);
      }
    }
    
    // Para otros tipos de solicitudes, solo establecer headers de seguridad
    const response = await handler(request, ...args);
    return setSecurityHeaders(response);
  };
}
