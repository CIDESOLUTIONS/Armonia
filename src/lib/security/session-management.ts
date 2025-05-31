/**
 * Session Management System
 * 
 * Este módulo implementa la gestión de sesiones de usuario con características
 * de seguridad como expiración configurable, rotación de tokens y detección
 * de sesiones concurrentes.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { logAuditAction, AuditActionType, AuditStatus } from './audit-trail';

// Cliente Prisma para operaciones de base de datos
const prisma = new PrismaClient();

/**
 * Verifica si una sesión ha expirado según la configuración
 */
export async function checkSessionExpiration(request: NextRequest): Promise<boolean> {
  try {
    // Obtener la sesión actual
    const session = await getServerSession(authOptions);
    if (!session) return true; // No hay sesión, considerar expirada
    
    // Obtener configuración de tiempo de expiración
    const config = await import('@/config/security').then(mod => mod.default);
    const { sessionTimeout } = config; // en minutos
    
    // Verificar si hay timestamp de última actividad
    const lastActivity = session.lastActivity as number;
    if (!lastActivity) return false; // Sin timestamp, sesión nueva
    
    // Calcular tiempo transcurrido en minutos
    const now = Date.now();
    const elapsedMinutes = (now - lastActivity) / (1000 * 60);
    
    // Verificar si ha expirado
    if (elapsedMinutes > sessionTimeout) {
      // Registrar expiración en auditoría
      await logAuditAction({
        action: AuditActionType.LOGOUT,
        details: 'Sesión expirada por inactividad',
        userId: session.user?.id as number,
        userName: session.user?.name || session.user?.email || 'Unknown',
        status: AuditStatus.SUCCESS
      }, request);
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error al verificar expiración de sesión:', error);
    return false; // En caso de error, permitir continuar
  }
}

/**
 * Actualiza el timestamp de última actividad de la sesión
 */
export async function updateSessionActivity(): Promise<void> {
  try {
    // Obtener la sesión actual
    const session = await getServerSession(authOptions);
    if (!session) return;
    
    // Actualizar timestamp de última actividad
    session.lastActivity = Date.now();
    
    // Actualizar en base de datos si es necesario
    if (session.user?.id) {
      await prisma.session.updateMany({
        where: { userId: session.user.id as number },
        data: { lastActivity: new Date() }
      });
    }
  } catch (error) {
    console.error('Error al actualizar actividad de sesión:', error);
  }
}

/**
 * Middleware para gestión de sesiones
 */
export function sessionManagement(handler: Function) {
  return async (request: NextRequest, ...args: any[]) => {
    // Verificar si la gestión de sesiones está habilitada
    const config = await import('@/config/security').then(mod => mod.default);
    if (!config.sessionManagement) {
      return handler(request, ...args);
    }
    
    // Verificar expiración de sesión
    const isExpired = await checkSessionExpiration(request);
    if (isExpired) {
      // Redirigir a página de login con mensaje de expiración
      return NextResponse.redirect(new URL('/login?expired=true', request.url));
    }
    
    // Actualizar timestamp de última actividad
    await updateSessionActivity();
    
    // Continuar con el handler
    return handler(request, ...args);
  };
}

/**
 * Registra un nuevo inicio de sesión
 */
export async function recordLoginActivity(userId: number, userName: string, success: boolean, request: NextRequest, failureReason?: string): Promise<void> {
  try {
    // Obtener información del cliente
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     request.ip || '0.0.0.0';
    
    const userAgent = request.headers.get('user-agent') || 'Unknown';
    
    // Registrar en la tabla de historial de inicios de sesión
    await prisma.loginHistory.create({
      data: {
        userId,
        userName,
        timestamp: new Date(),
        ipAddress: typeof ipAddress === 'string' ? ipAddress.split(',')[0].trim() : ipAddress,
        userAgent,
        status: success ? 'success' : 'failure',
        failureReason: failureReason || null
      }
    });
    
    // Registrar también en el sistema de auditoría
    await logAuditAction({
      action: success ? AuditActionType.LOGIN : AuditActionType.LOGIN_FAILED,
      details: success ? 'Inicio de sesión exitoso' : `Inicio de sesión fallido: ${failureReason}`,
      userId,
      userName,
      status: success ? AuditStatus.SUCCESS : AuditStatus.FAILURE
    }, request);
    
  } catch (error) {
    console.error('Error al registrar actividad de inicio de sesión:', error);
  }
}

/**
 * Obtiene el historial de inicios de sesión con filtros
 */
export async function getLoginHistory({
  page = 1,
  limit = 50,
  userId,
  status,
  startDate,
  endDate,
  searchQuery
}: {
  page?: number;
  limit?: number;
  userId?: number;
  status?: 'success' | 'failure';
  startDate?: Date;
  endDate?: Date;
  searchQuery?: string;
}) {
  try {
    // Construir filtros
    const where: any = {};
    
    if (userId) where.userId = userId;
    if (status) where.status = status;
    
    // Filtro de rango de fechas
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = startDate;
      if (endDate) where.timestamp.lte = endDate;
    }
    
    // Búsqueda por texto
    if (searchQuery) {
      where.OR = [
        { userName: { contains: searchQuery, mode: 'insensitive' } },
        { ipAddress: { contains: searchQuery } },
        { userAgent: { contains: searchQuery } },
        { failureReason: { contains: searchQuery, mode: 'insensitive' } }
      ];
    }
    
    // Obtener total de registros para paginación
    const total = await prisma.loginHistory.count({ where });
    
    // Obtener registros paginados
    const history = await prisma.loginHistory.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    });
    
    return {
      history,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
    
  } catch (error) {
    console.error('Error al obtener historial de inicios de sesión:', error);
    throw new Error('No se pudo recuperar el historial de inicios de sesión');
  }
}
