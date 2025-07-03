/**
 * Configuración de seguridad para la aplicación Armonía
 * Compatible con Next.js 15 y React 19
 */

export const securityConfig = {
  // Configuración CSRF
  csrf: {
    enabled: true,
    cookieName: 'armonia-csrf',
    headerName: 'X-CSRF-Token',
    cookieOptions: {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      path: '/'
    }
  },
  
  // Configuración XSS
  xss: {
    enabled: true,
    sanitizeHtml: true,
    sanitizeUrls: true,
    allowedTags: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'ul', 'ol', 'li',
      'b', 'i', 'strong', 'em', 'a', 'span', 'div'
    ],
    allowedAttributes: {
      'a': ['href', 'target', 'rel'],
      'span': ['class'],
      'div': ['class']
    }
  },
  
  // Configuración de headers de seguridad
  headers: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
  }
};

export default securityConfig;
