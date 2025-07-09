import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify, SignJWT } from 'jose';
import { ServerLogger } from './logging/server-logger';
import { authOptions } from './authOptions'; // Importar authOptions

// Interfaz para el payload del token JWT
export interface JWTPayload {
  id: number;
  email: string;
  role: string;
  name?: string;
  complexId?: number;
  schemaName?: string;
  complexName?: string;
  isGlobalAdmin?: boolean;
  iat?: number;
  exp?: number;
  type?: string; // Añadir tipo para diferenciar tokens (ej. 'auth', 'password-reset')
}

// Obtener secreto JWT
export function getJwtSecret() {
  const secretKey = process.env.JWT_SECRET || 'default_secret';
  return new TextEncoder().encode(secretKey);
}

// Obtener token de diferentes fuentes
export function getToken(request: NextRequest): string | null {
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
  
  return null;
}

// Generar token JWT
export async function generateToken(payload: Partial<JWTPayload>): Promise<string> {
  try {
    const encodedSecret = getJwtSecret();
    
    // Crear token con jose
    const token = await new SignJWT({ ...payload, type: 'auth' })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(encodedSecret);
    
    return token;
  } catch (error) {
    ServerLogger.error('Error generando token JWT:', error);
    throw new Error('Error en la generación del token');
  }
}

// Generar token de restablecimiento de contraseña
export async function generatePasswordResetToken(userId: number, email: string, schemaName?: string): Promise<string> {
  try {
    const encodedSecret = getJwtSecret();
    const token = await new SignJWT({
      id: userId,
      email: email,
      schemaName: schemaName,
      type: 'password-reset',
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1h') // Token válido por 1 hora
      .sign(encodedSecret);
    return token;
  } catch (error) {
    ServerLogger.error('Error generando token de restablecimiento de contraseña:', error);
    throw new Error('Error en la generación del token de restablecimiento');
  }
}

// Función para verificar solo el token (sin Request)
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const secretKey = getJwtSecret();
    const { payload } = await jwtVerify(token, secretKey);
    
    // Asegurar que el payload tenga los campos mínimos requeridos
    if (!payload.id || !payload.email || !payload.role) {
      ServerLogger.warn('Token JWT con datos incompletos');
      return null;
    }
    
    return payload as JWTPayload;
  } catch (error) {
    ServerLogger.warn('Token JWT inválido', { error });
    return null;
  }
}

// Función para verificar token de restablecimiento de contraseña
export async function verifyPasswordResetToken(token: string): Promise<JWTPayload | null> {
  try {
    const secretKey = getJwtSecret();
    const { payload } = await jwtVerify(token, secretKey);

    if (payload.type !== 'password-reset') {
      ServerLogger.warn('Token de restablecimiento de contraseña inválido: tipo incorrecto');
      return null;
    }

    if (!payload.id || !payload.email) {
      ServerLogger.warn('Token de restablecimiento de contraseña con datos incompletos');
      return null;
    }

    return payload as JWTPayload;
  } catch (error) {
    ServerLogger.warn('Token de restablecimiento de contraseña inválido o expirado', { error });
    return null;
  }
}

// Función para verificar autenticación
export async function verifyAuth(request: NextRequest) {
  try {
    // Obtener el token
    const token = getToken(request);
    
    if (!token) {
      ServerLogger.warn('Autenticación fallida: No hay token');
      return { auth: false, payload: null };
    }

    // Verificar el token usando la función anterior
    const payload = await verifyToken(token);
    
    if (!payload) {
      return { auth: false, payload: null };
    }
    
    ServerLogger.debug('Token verificado correctamente', { userId: payload.id });
    return { auth: true, payload };
    
  } catch (error) {
    ServerLogger.error('Error verificando autenticación', { error });
    return { auth: false, payload: null };
  }
}

// Función de middleware para proteger rutas
export async function authMiddleware(
  request: NextRequest,
  allowedRoles: string[] = ['ADMIN', 'COMPLEX_ADMIN', 'RESIDENT', 'STAFF']
) {
  const { auth, payload } = await verifyAuth(request);
  
  if (!auth || !payload) {
    return NextResponse.json(
      { error: 'No autorizado: Token inválido o expirado' },
      { status: 401 }
    );
  }
  
  // Verificar roles
  if (!allowedRoles.includes(payload.role)) {
    ServerLogger.warn('Acceso denegado por rol', { 
      userId: payload.id, 
      role: payload.role, 
      allowedRoles 
    });
    
    return NextResponse.json(
      { error: 'Prohibido: No tiene permisos para esta acción' },
      { status: 403 }
    );
  }
  
  return { proceed: true, payload };
}

// Función para devolver respuesta con error de autenticación
export function authError(message = 'No autorizado') {
  return NextResponse.json({ error: message }, { status: 401 });
}

export { authOptions }; // Exportar authOptions
