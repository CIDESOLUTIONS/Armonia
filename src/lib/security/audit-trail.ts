/**
 * Audit Trail System
 * 
 * Este módulo implementa un sistema de auditoría para registrar acciones
 * importantes en el sistema, permitiendo trazabilidad y cumplimiento normativo.
 */

import { PrismaClient } from '@prisma/client';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// Tipos de acciones auditables
export enum AuditActionType {
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  LOGIN_FAILED = 'LOGIN_FAILED',
  DATA_CREATE = 'DATA_CREATE',
  DATA_UPDATE = 'DATA_UPDATE',
  DATA_DELETE = 'DATA_DELETE',
  SETTINGS_CHANGE = 'SETTINGS_CHANGE',
  USER_MANAGEMENT = 'USER_MANAGEMENT',
  ACCESS_ATTEMPT = 'ACCESS_ATTEMPT',
  API_ACCESS = 'API_ACCESS',
  BACKUP = 'BACKUP',
  SYSTEM_CHANGE = 'SYSTEM_CHANGE'
}

// Estados de los registros de auditoría
export enum AuditStatus {
  SUCCESS = 'success',
  FAILURE = 'failure',
  WARNING = 'warning'
}

// Interfaz para los datos de auditoría
export interface AuditData {
  action: AuditActionType;
  details: string;
  userId?: number;
  userName?: string;
  status: AuditStatus;
  metadata?: Record<string, any>;
}

// Cliente Prisma para operaciones de base de datos
const prisma = new PrismaClient();

/**
 * Registra una acción en el sistema de auditoría
 */
export async function logAuditAction(data: AuditData, request?: NextRequest): Promise<void> {
  try {
    // Verificar si la auditoría está habilitada en la configuración
    const config = await import('@/config/security').then(mod => mod.default);
    const { auditSettings } = config;
    
    // Verificar si este tipo de acción debe ser registrada
    if (
      (data.action.startsWith('LOGIN') && !auditSettings.logLogins) ||
      (data.action === AuditActionType.LOGIN_FAILED && !auditSettings.logFailedLogins) ||
      (data.action.startsWith('DATA_') && !auditSettings.logDataChanges) ||
      ((data.action === AuditActionType.SETTINGS_CHANGE || 
        data.action === AuditActionType.SYSTEM_CHANGE) && 
        !auditSettings.logSystemChanges)
    ) {
      return;
    }
    
    // Obtener información del cliente si hay una solicitud
    let ipAddress = '0.0.0.0';
    let userAgent = 'Unknown';
    
    if (request) {
      // Obtener IP real considerando proxies
      ipAddress = request.headers.get('x-forwarded-for') || 
                 request.headers.get('x-real-ip') || 
                 request.ip || '0.0.0.0';
      
      // Si hay múltiples IPs (proxy chain), tomar la primera
      if (typeof ipAddress === 'string' && ipAddress.includes(',')) {
        ipAddress = ipAddress.split(',')[0].trim();
      }
      
      userAgent = request.headers.get('user-agent') || 'Unknown';
    }
    
    // Si no se proporcionó usuario, intentar obtenerlo de la sesión
    if (!data.userId || !data.userName) {
      try {
        const session = request ? await getServerSession(authOptions) : null;
        if (session?.user) {
          data.userId = session.user.id as number;
          data.userName = session.user.name || session.user.email || 'Unknown';
        }
      } catch (error) {
        console.error('Error al obtener sesión para auditoría:', error);
      }
    }
    
    // Crear registro de auditoría en la base de datos
    await prisma.auditLog.create({
      data: {
        action: data.action,
        details: data.details,
        userId: data.userId || 0,
        userName: data.userName || 'system',
        ipAddress,
        userAgent,
        status: data.status,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null
      }
    });
    
  } catch (error) {
    // No fallar la operación principal si hay error en la auditoría
    console.error('Error al registrar acción de auditoría:', error);
  }
}

/**
 * Middleware para auditar acciones automáticamente
 */
export function auditMiddleware(actionType: AuditActionType, detailsGenerator: (_req:unknown) => string) {
  return async (handler: Function) => {
    return async (request: NextRequest, ...args: unknown[]) => {
      // Procesar la solicitud primero
      // Variable response eliminada por lint
      
      // Determinar el estado basado en la respuesta
      const status = response.status >= 400 
        ? AuditStatus.FAILURE 
        : (response.status >= 300 ? AuditStatus.WARNING : AuditStatus.SUCCESS);
      
      // Generar detalles para el registro
      const details = detailsGenerator(request);
      
      // Registrar la acción
      await logAuditAction({
        action: actionType,
        details,
        status
      }, request);
      
      return response;
    };
  };
}

/**
 * Obtiene registros de auditoría con filtros
 */
export async function getAuditLogs({
  page = 1,
  limit = 50,
  userId,
  action,
  status,
  startDate,
  endDate,
  searchQuery
}: {
  page?: number;
  limit?: number;
  userId?: number;
  action?: AuditActionType;
  status?: AuditStatus;
  startDate?: Date;
  endDate?: Date;
  searchQuery?: string;
}) {
  try {
    // Construir filtros
    const where: unknown = {};
    
    if (userId) where.userId = userId;
    if (action) where.action = action;
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
        { details: { contains: searchQuery, mode: 'insensitive' } },
        { ipAddress: { contains: searchQuery } }
      ];
    }
    
    // Obtener total de registros para paginación
    const total = await prisma.auditLog.count({ where });
    
    // Obtener registros paginados
    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    });
    
    return {
      logs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
    
  } catch (error) {
    console.error('Error al obtener logs de auditoría:', error);
    throw new Error('No se pudieron recuperar los registros de auditoría');
  }
}

/**
 * Limpia registros de auditoría antiguos según la política de retención
 */
export async function cleanupAuditLogs() {
  try {
    // Obtener configuración de retención
    const config = await import('@/config/security').then(mod => mod.default);
    const { retentionDays } = config.auditSettings;
    
    // Calcular fecha límite para retención
    const retentionDate = new Date();
    retentionDate.setDate(retentionDate.getDate() - retentionDays);
    
    // Eliminar registros antiguos
    const _result = await prisma.auditLog.deleteMany({
      where: {
        timestamp: {
          lt: retentionDate
        }
      }
    });
    
    return { deletedCount: result.count };
    
  } catch (error) {
    console.error('Error al limpiar logs de auditoría antiguos:', error);
    throw new Error('No se pudieron limpiar los registros de auditoría antiguos');
  }
}
