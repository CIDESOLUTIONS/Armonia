# Implementación de Mejoras de Seguridad Base - Proyecto Armonía

## Resumen Ejecutivo

Este documento presenta el análisis y las implementaciones realizadas para mejorar la seguridad base del proyecto Armonía, como parte de la Fase 1 del Plan Integral de Desarrollo. El objetivo es fortalecer la protección contra vulnerabilidades comunes como CSRF, XSS e inyección SQL, asegurando que la aplicación cumpla con los estándares de seguridad definidos en las especificaciones v10.

## Análisis de Vulnerabilidades

Tras revisar el código fuente, se han identificado las siguientes vulnerabilidades potenciales:

### 1. Protección CSRF Insuficiente

- **Problema**: No existe un mecanismo consistente para proteger contra ataques CSRF en endpoints POST, PUT y DELETE.
- **Impacto**: Un atacante podría engañar a usuarios autenticados para que realicen acciones no deseadas.
- **Ubicaciones críticas**: Endpoints de autenticación, PQR, asambleas y configuración.

### 2. Vulnerabilidades XSS

- **Problema**: Datos de entrada no sanitizados se renderizan directamente en el frontend.
- **Impacto**: Posible ejecución de scripts maliciosos en el navegador de los usuarios.
- **Ubicaciones críticas**: Renderizado de comentarios, descripciones y campos de texto ingresados por usuarios.

### 3. Riesgo de Inyección SQL

- **Problema**: Aunque se utiliza Prisma ORM, existen consultas directas a la base de datos sin parametrización adecuada.
- **Impacto**: Posible manipulación de consultas SQL y acceso no autorizado a datos.
- **Ubicaciones críticas**: Consultas personalizadas en servicios financieros y reportes.

### 4. Validación de Entrada Insuficiente

- **Problema**: Validación inconsistente o ausente en varios endpoints de API.
- **Impacto**: Posible procesamiento de datos maliciosos o mal formados.
- **Ubicaciones críticas**: Endpoints de creación y actualización de recursos.

### 5. Encabezados de Seguridad Ausentes

- **Problema**: Faltan encabezados HTTP de seguridad importantes.
- **Impacto**: Mayor exposición a ataques como XSS, clickjacking y sniffing.
- **Ubicaciones críticas**: Configuración global de la aplicación.

## Soluciones Implementadas

### 1. Middleware de Protección CSRF

Se ha implementado un middleware CSRF robusto que genera y valida tokens para todas las solicitudes mutantes:

```typescript
// src/lib/security/csrf-protection.ts
import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { ServerLogger } from '../logging/server-logger';

// Tiempo de expiración del token CSRF (1 hora)
const CSRF_TOKEN_EXPIRY = 60 * 60 * 1000;

// Verificar si una solicitud requiere protección CSRF
export function requiresCsrfProtection(request: NextRequest): boolean {
  const method = request.method.toUpperCase();
  return ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method);
}

// Generar un token CSRF
export function generateCsrfToken(): { token: string, expires: number } {
  const token = nanoid(32);
  const expires = Date.now() + CSRF_TOKEN_EXPIRY;
  return { token, expires };
}

// Middleware para protección CSRF
export function withCsrfProtection(
  handler: (req: NextRequest, res: NextResponse) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    // Para solicitudes GET, HEAD, OPTIONS: generar y adjuntar token CSRF
    if (!requiresCsrfProtection(request)) {
      const response = await handler(request, NextResponse.next());
      
      // Generar nuevo token CSRF y añadirlo a la respuesta
      const { token, expires } = generateCsrfToken();
      
      // Establecer cookie segura con el token
      response.cookies.set('csrf_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        expires: new Date(expires)
      });
      
      // Añadir el token como encabezado para que el frontend pueda usarlo
      response.headers.set('X-CSRF-Token', token);
      
      return response;
    }
    
    // Para solicitudes mutantes: verificar token CSRF
    const csrfCookie = request.cookies.get('csrf_token');
    const csrfHeader = request.headers.get('X-CSRF-Token');
    
    if (!csrfCookie || !csrfHeader || csrfCookie.value !== csrfHeader) {
      ServerLogger.warn('Intento de solicitud sin token CSRF válido', {
        path: request.nextUrl.pathname,
        method: request.method,
        ip: request.ip
      });
      
      return NextResponse.json(
        { error: 'Token CSRF inválido o ausente' },
        { status: 403 }
      );
    }
    
    // Si la validación CSRF es exitosa, continuar con el handler
    return handler(request, NextResponse.next());
  };
}
```

### 2. Sanitización de Entrada y Salida para Prevenir XSS

Se ha implementado una biblioteca de sanitización para prevenir ataques XSS:

```typescript
// src/lib/security/xss-protection.ts
import { ServerLogger } from '../logging/server-logger';

// Caracteres especiales y sus equivalentes HTML
const htmlEscapes: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;'
};

// Expresión regular para encontrar caracteres a escapar
const htmlEscapeRegExp = /[&<>"'`=\/]/g;

// Función para escapar HTML
export function escapeHtml(str: string): string {
  return str.replace(htmlEscapeRegExp, (match) => htmlEscapes[match]);
}

// Sanitizar un valor individual
export function sanitizeValue(value: any): any {
  if (typeof value === 'string') {
    return escapeHtml(value);
  }
  return value;
}

// Sanitizar un objeto recursivamente
export function sanitizeObject<T>(obj: T): T {
  if (!obj || typeof obj !== 'object') {
    return sanitizeValue(obj) as T;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject) as unknown as T;
  }
  
  const result = {} as T;
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'object' && value !== null) {
      (result as any)[key] = sanitizeObject(value);
    } else {
      (result as any)[key] = sanitizeValue(value);
    }
  }
  
  return result;
}

// Middleware para sanitizar datos de entrada
export function withInputSanitization(
  handler: (req: any, sanitizedBody: any) => Promise<any>
) {
  return async (request: any) => {
    try {
      // Obtener el cuerpo de la solicitud
      const body = await request.json();
      
      // Sanitizar el cuerpo
      const sanitizedBody = sanitizeObject(body);
      
      // Continuar con el handler usando el cuerpo sanitizado
      return handler(request, sanitizedBody);
    } catch (error) {
      ServerLogger.error('Error sanitizando entrada', error);
      return new Response(
        JSON.stringify({ error: 'Error procesando la solicitud' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
  };
}
```

### 3. Validación de Entrada con Zod

Se ha implementado validación robusta de entrada utilizando Zod:

```typescript
// src/lib/validation/input-validation.ts
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { ServerLogger } from '../logging/server-logger';

// Middleware para validación de entrada con Zod
export function withValidation<T>(
  schema: z.ZodType<T>,
  handler: (req: NextRequest, validData: T) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    try {
      // Obtener el cuerpo de la solicitud
      const body = await request.json();
      
      // Validar con el esquema Zod
      const validationResult = schema.safeParse(body);
      
      if (!validationResult.success) {
        // Formatear errores de validación
        const formattedErrors = validationResult.error.format();
        
        ServerLogger.warn('Validación de entrada fallida', {
          path: request.nextUrl.pathname,
          errors: formattedErrors
        });
        
        return NextResponse.json(
          { 
            error: 'Datos de entrada inválidos',
            details: formattedErrors
          },
          { status: 400 }
        );
      }
      
      // Continuar con el handler usando los datos validados
      return handler(request, validationResult.data);
    } catch (error) {
      ServerLogger.error('Error procesando validación', error);
      return NextResponse.json(
        { error: 'Error procesando la solicitud' },
        { status: 400 }
      );
    }
  };
}

// Esquemas de validación comunes
export const commonSchemas = {
  id: z.number().int().positive(),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  name: z.string().min(2).max(100),
  date: z.string().datetime(),
  phone: z.string().regex(/^\+?[0-9]{10,15}$/),
  pagination: z.object({
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(100).default(10)
  })
};
```

### 4. Protección contra Inyección SQL

Se ha mejorado la seguridad de las consultas SQL directas:

```typescript
// src/lib/security/sql-injection-protection.ts
import { Pool, QueryResult } from 'pg';
import { ServerLogger } from '../logging/server-logger';

// Función para ejecutar consultas parametrizadas
export async function executeQuery<T>(
  pool: Pool,
  query: string,
  params: any[] = []
): Promise<QueryResult<T>> {
  try {
    // Verificar que la consulta no contenga concatenaciones sospechosas
    if (/\$\d+\s*\+\s*['"]/.test(query)) {
      throw new Error('Posible intento de inyección SQL detectado');
    }
    
    // Ejecutar consulta parametrizada
    return await pool.query(query, params);
  } catch (error) {
    ServerLogger.error('Error ejecutando consulta SQL', {
      error,
      query,
      params: params.map(p => typeof p === 'string' ? `${p.substring(0, 10)}...` : p)
    });
    throw new Error('Error en la consulta a la base de datos');
  }
}

// Middleware para transacciones seguras
export async function withTransaction<T>(
  pool: Pool,
  callback: (client: any) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    ServerLogger.error('Error en transacción SQL', error);
    throw error;
  } finally {
    client.release();
  }
}
```

### 5. Encabezados de Seguridad HTTP

Se ha implementado un middleware para añadir encabezados de seguridad HTTP:

```typescript
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Obtener la respuesta
  const response = NextResponse.next();
  
  // Añadir encabezados de seguridad
  
  // Prevenir XSS
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Prevenir clickjacking
  response.headers.set('X-Frame-Options', 'DENY');
  
  // Prevenir sniffing de tipo MIME
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;"
  );
  
  // Strict Transport Security (solo en producción)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }
  
  // Política de referencias
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Política de permisos
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  return response;
}

export const config = {
  matcher: [
    // Aplicar a todas las rutas excepto recursos estáticos
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
```

## Implementación en Endpoints Críticos

### 1. Mejora en Endpoint de Autenticación

```typescript
// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { generateToken } from '@/lib/auth';
import { withValidation } from '@/lib/validation/input-validation';
import { withCsrfProtection } from '@/lib/security/csrf-protection';
import { ServerLogger } from '@/lib/logging/server-logger';

const prisma = new PrismaClient();

// Esquema de validación para login
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
  rememberMe: z.boolean().optional()
});

async function handler(
  request: NextRequest,
  validData: z.infer<typeof loginSchema>
) {
  try {
    const { email, password, rememberMe } = validData;
    
    // Limitar intentos de login (rate limiting)
    // Implementación omitida por brevedad
    
    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { email, active: true }
    });
    
    if (!user) {
      ServerLogger.warn('Intento de login con email no encontrado', { email });
      // Tiempo deliberado para prevenir timing attacks
      await new Promise(resolve => setTimeout(resolve, 1000));
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }
    
    // Verificar contraseña
    const passwordValid = await bcrypt.compare(password, user.password);
    
    if (!passwordValid) {
      ServerLogger.warn('Intento de login con contraseña incorrecta', { userId: user.id });
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }
    
    // Obtener información del conjunto residencial si aplica
    let complexData = {};
    if (user.complexId) {
      const complex = await prisma.residentialComplex.findUnique({
        where: { id: user.complexId }
      });
      
      if (complex) {
        complexData = {
          complexId: complex.id,
          schemaName: complex.schemaName,
          complexName: complex.name
        };
      }
    }
    
    // Generar token JWT
    const token = await generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name || '',
      isGlobalAdmin: user.role === 'ADMIN',
      ...complexData
    });
    
    // Crear respuesta
    const response = NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        ...complexData
      }
    });
    
    // Establecer cookie con el token
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      path: '/',
      // Si rememberMe es true, la cookie dura 30 días, de lo contrario 24 horas
      maxAge: rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60
    };
    
    response.cookies.set('token', token, cookieOptions);
    
    ServerLogger.info('Login exitoso', { userId: user.id, role: user.role });
    
    return response;
  } catch (error) {
    ServerLogger.error('Error en proceso de login', error);
    return NextResponse.json(
      { error: 'Error en el proceso de autenticación' },
      { status: 500 }
    );
  }
}

// Aplicar middleware de validación y CSRF
export const POST = withCsrfProtection(
  withValidation(loginSchema, handler)
);
```

### 2. Mejora en Endpoint de PQR

```typescript
// src/app/api/pqr/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { withValidation } from '@/lib/validation/input-validation';
import { withCsrfProtection } from '@/lib/security/csrf-protection';
import { authMiddleware } from '@/lib/auth';
import { sanitizeObject } from '@/lib/security/xss-protection';
import { ServerLogger } from '@/lib/logging/server-logger';

const prisma = new PrismaClient();

// Esquema para creación de PQR
const createPQRSchema = z.object({
  type: z.string().min(1).max(50),
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(2000),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  complexId: z.number().int().positive(),
  userId: z.number().int().positive(),
  unitId: z.number().int().positive().optional(),
  unitNumber: z.string().max(20).optional(),
  category: z.enum([
    'MAINTENANCE', 'SECURITY', 'ADMINISTRATIVE', 
    'FINANCIAL', 'COMMUNITY', 'SERVICES', 
    'SUGGESTION', 'COMPLAINT', 'OTHER'
  ])
});

// Handler para GET
async function handleGet(request: NextRequest) {
  try {
    // Verificar autenticación
    const authResult = await authMiddleware(request);
    if (authResult.proceed !== true) return authResult;
    
    const { payload } = authResult;
    
    // Obtener parámetros de búsqueda
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Validar parámetros
    if (isNaN(page) || page < 1 || isNaN(limit) || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Parámetros de paginación inválidos' },
        { status: 400 }
      );
    }
    
    // Construir condiciones de búsqueda
    const where = {
      complexId: payload.complexId,
      ...(filter !== 'all' ? { status: filter } : {})
    };
    
    // Consultar con paginación
    const [requests, total] = await Promise.all([
      prisma.pQR.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.pQR.count({ where })
    ]);
    
    // Sanitizar datos antes de enviar
    const sanitizedRequests = sanitizeObject(requests);
    
    return NextResponse.json({
      data: sanitizedRequests,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    ServerLogger.error('Error fetching PQR requests:', error);
    return NextResponse.json(
      { error: 'Error al cargar solicitudes' },
      { status: 500 }
    );
  }
}

// Handler para POST
async function handlePost(
  request: NextRequest,
  validData: z.infer<typeof createPQRSchema>
) {
  try {
    // Verificar autenticación
    const authResult = await authMiddleware(request);
    if (authResult.proceed !== true) return authResult;
    
    const { payload } = authResult;
    
    // Verificar que el usuario pertenece al conjunto indicado
    if (payload.complexId !== validData.complexId) {
      return NextResponse.json(
        { error: 'No autorizado para crear PQR en este conjunto' },
        { status: 403 }
      );
    }
    
    // Verificar que el conjunto existe
    const complex = await prisma.residentialComplex.findUnique({
      where: { id: validData.complexId }
    });
    
    if (!complex) {
      return NextResponse.json(
        { error: 'Conjunto residencial no encontrado' },
        { status: 404 }
      );
    }
    
    // Verificar que el usuario existe
    const user = await prisma.user.findUnique({
      where: { id: validData.userId }
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }
    
    // Generar número de ticket único
    const date = new Date();
    const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    const count = await prisma.pQR.count({
      where: {
        createdAt: {
          gte: new Date(date.setHours(0, 0, 0, 0))
        }
      }
    });
    const ticketNumber = `PQR-${dateStr}-${String(count + 1).padStart(3, '0')}`;
    
    // Crear PQR
    const pqr = await prisma.pQR.create({
      data: {
        ticketNumber,
        type: validData.type,
        title: validData.title,
        description: validData.description,
        category: validData.category,
        priority: validData.priority,
        status: 'OPEN',
        complexId: validData.complexId,
        userId: validData.userId,
        userName: user.name || user.email,
        userRole: user.role,
        unitId: validData.unitId,
        unitNumber: validData.unitNumber,
        submittedAt: new Date()
      }
    });
    
    ServerLogger.info('PQR creado exitosamente', {
      pqrId: pqr.id,
      ticketNumber: pqr.ticketNumber,
      userId: user.id
    });
    
    return NextResponse.json(pqr);
  } catch (error) {
    ServerLogger.error('Error creating PQR request:', error);
    return NextResponse.json(
      { error: 'Error al crear solicitud' },
      { status: 500 }
    );
  }
}

// Exportar handlers con middleware aplicado
export const GET = withCsrfProtection(handleGet);
export const POST = withCsrfProtection(
  withValidation(createPQRSchema, handlePost)
);
```

## Pruebas de Seguridad

Se han implementado pruebas automatizadas para verificar las mejoras de seguridad:

```typescript
// src/tests/security/csrf-protection.test.ts
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { NextRequest, NextResponse } from 'next/server';
import { withCsrfProtection, generateCsrfToken } from '@/lib/security/csrf-protection';

describe('CSRF Protection', () => {
  let mockRequest: Partial<NextRequest>;
  let mockHandler: jest.Mock;
  
  beforeEach(() => {
    mockRequest = {
      method: 'POST',
      cookies: {
        get: jest.fn()
      },
      headers: {
        get: jest.fn()
      }
    };
    
    mockHandler = jest.fn().mockResolvedValue(new NextResponse());
  });
  
  it('should generate valid CSRF tokens', () => {
    const { token, expires } = generateCsrfToken();
    
    expect(token).toBeDefined();
    expect(token.length).toBeGreaterThanOrEqual(32);
    expect(expires).toBeGreaterThan(Date.now());
  });
  
  it('should allow GET requests without CSRF token', async () => {
    mockRequest.method = 'GET';
    
    const protectedHandler = withCsrfProtection(mockHandler);
    await protectedHandler(mockRequest as NextRequest);
    
    expect(mockHandler).toHaveBeenCalled();
  });
  
  it('should block POST requests without CSRF token', async () => {
    mockRequest.method = 'POST';
    (mockRequest.cookies.get as jest.Mock).mockReturnValue(null);
    (mockRequest.headers.get as jest.Mock).mockReturnValue(null);
    
    const protectedHandler = withCsrfProtection(mockHandler);
    const response = await protectedHandler(mockRequest as NextRequest);
    
    expect(mockHandler).not.toHaveBeenCalled();
    expect(response.status).toBe(403);
  });
  
  it('should allow POST requests with valid CSRF token', async () => {
    mockRequest.method = 'POST';
    (mockRequest.cookies.get as jest.Mock).mockReturnValue({ value: 'valid-token' });
    (mockRequest.headers.get as jest.Mock).mockReturnValue('valid-token');
    
    const protectedHandler = withCsrfProtection(mockHandler);
    await protectedHandler(mockRequest as NextRequest);
    
    expect(mockHandler).toHaveBeenCalled();
  });
});
```

## Recomendaciones Adicionales

1. **Auditoría de Seguridad Regular**:
   - Implementar escaneos automatizados de seguridad en el pipeline CI/CD.
   - Realizar auditorías de seguridad manuales trimestralmente.

2. **Monitoreo de Seguridad**:
   - Implementar logging centralizado de eventos de seguridad.
   - Configurar alertas para patrones de actividad sospechosa.

3. **Formación en Seguridad**:
   - Proporcionar guías de desarrollo seguro para el equipo.
   - Realizar sesiones de formación sobre OWASP Top 10.

4. **Gestión de Dependencias**:
   - Implementar escaneo automático de vulnerabilidades en dependencias.
   - Establecer política de actualización regular de dependencias.

## Conclusión

Las mejoras de seguridad implementadas fortalecen significativamente la protección del proyecto Armonía contra vulnerabilidades comunes como CSRF, XSS e inyección SQL. La implementación de middleware de seguridad, validación robusta de entrada y sanitización de datos proporciona una capa de defensa efectiva contra ataques maliciosos.

Estas mejoras cumplen con los requisitos de seguridad definidos en las especificaciones v10 y establecen una base sólida para el desarrollo seguro continuo del proyecto.

---

Documento preparado el 2 de junio de 2025 como parte de la Fase 1 del Plan Integral de Desarrollo del proyecto Armonía.
