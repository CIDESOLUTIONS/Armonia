/**
 * Integraciones del sistema de comunicaciones con el módulo de seguridad
 * 
 * Este archivo proporciona funciones para enviar notificaciones automáticas
 * relacionadas con eventos del módulo de seguridad y auditoría.
 */

import { notifyUser, notifyByRole, notifyAll, NotificationType, NotificationPriority } from '@/lib/communications/notification-service';
import { getPrisma } from '@/lib/prisma';
import { AuditActionType, AuditStatus } from '@/lib/security/audit-trail';

const prisma = getPrisma();

/**
 * Envía notificación de intento de acceso fallido
 */
export async function notifyFailedLoginAttempt(userId: number, ipAddress: string, userAgent: string, attemptCount: number) {
  try {
    // Notificar al usuario afectado
    await notifyUser(userId, {
      type: 'warning',
      title: 'Intento de acceso fallido',
      message: `Se ha detectado un intento de acceso fallido a su cuenta desde la dirección IP ${ipAddress}. Este es el intento número ${attemptCount}.`,
      priority: 'high',
      requireConfirmation: attemptCount > 3,
      data: {
        ipAddress,
        userAgent,
        attemptCount,
        timestamp: new Date().toISOString()
      }
    });
    
    // Si hay muchos intentos fallidos, notificar también a los administradores
    if (attemptCount > 5) {
      await notifyByRole('admin', {
        type: 'error',
        title: 'Múltiples intentos de acceso fallidos',
        message: `Se han detectado ${attemptCount} intentos de acceso fallidos para el usuario ID: ${userId} desde la IP ${ipAddress}.`,
        priority: 'high',
        link: `/dashboard/security/audit-logs?userId=${userId}&action=${AuditActionType.LOGIN_FAILED}`,
        data: {
          userId,
          ipAddress,
          userAgent,
          attemptCount,
          timestamp: new Date().toISOString()
        }
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error al enviar notificación de intento de acceso fallido:', error);
    throw error;
  }
}

/**
 * Envía notificación de acceso desde ubicación nueva o inusual
 */
export async function notifyUnusualAccess(userId: number, ipAddress: string, location: string, deviceInfo: string) {
  try {
    // Notificar al usuario afectado
    await notifyUser(userId, {
      type: 'warning',
      title: 'Acceso desde ubicación nueva',
      message: `Se ha detectado un acceso a su cuenta desde una ubicación nueva o inusual: ${location} (IP: ${ipAddress}). Si no fue usted, por favor cambie su contraseña inmediatamente.`,
      priority: 'urgent',
      requireConfirmation: true,
      link: '/resident/profile/security',
      data: {
        ipAddress,
        location,
        deviceInfo,
        timestamp: new Date().toISOString()
      }
    });
    
    return true;
  } catch (error) {
    console.error('Error al enviar notificación de acceso inusual:', error);
    throw error;
  }
}

/**
 * Envía notificación de cambio de contraseña
 */
export async function notifyPasswordChanged(userId: number) {
  try {
    // Notificar al usuario afectado
    await notifyUser(userId, {
      type: 'success',
      title: 'Contraseña actualizada',
      message: 'Su contraseña ha sido actualizada correctamente. Si no realizó este cambio, contacte al administrador inmediatamente.',
      priority: 'high',
      requireConfirmation: true,
      data: {
        timestamp: new Date().toISOString()
      }
    });
    
    return true;
  } catch (error) {
    console.error('Error al enviar notificación de cambio de contraseña:', error);
    throw error;
  }
}

/**
 * Envía notificación de cambio en permisos de usuario
 */
export async function notifyPermissionChange(userId: number, changedBy: number, oldRole: string, newRole: string) {
  try {
    // Notificar al usuario afectado
    await notifyUser(userId, {
      type: 'info',
      title: 'Cambio en sus permisos',
      message: `Sus permisos en el sistema han sido modificados de "${oldRole}" a "${newRole}".`,
      priority: 'high',
      data: {
        oldRole,
        newRole,
        changedBy,
        timestamp: new Date().toISOString()
      }
    });
    
    return true;
  } catch (error) {
    console.error('Error al enviar notificación de cambio de permisos:', error);
    throw error;
  }
}

/**
 * Envía notificación de actividad sospechosa
 */
export async function notifySuspiciousActivity(details: string, severity: 'low' | 'medium' | 'high' | 'critical', affectedUserId?: number) {
  try {
    // Determinar tipo de notificación según severidad
    let notificationType: NotificationType = 'info';
    let priority: NotificationPriority = 'medium';
    
    switch (severity) {
      case 'low':
        notificationType = 'info';
        priority = 'low';
        break;
      case 'medium':
        notificationType = 'warning';
        priority = 'medium';
        break;
      case 'high':
        notificationType = 'warning';
        priority = 'high';
        break;
      case 'critical':
        notificationType = 'error';
        priority = 'urgent';
        break;
    }
    
    // Notificar a administradores
    await notifyByRole('admin', {
      type: notificationType,
      title: 'Actividad sospechosa detectada',
      message: details,
      priority,
      link: '/dashboard/security/audit-logs',
      data: {
        severity,
        affectedUserId,
        timestamp: new Date().toISOString()
      }
    });
    
    // Si hay un usuario afectado, notificarle también
    if (affectedUserId) {
      await notifyUser(affectedUserId, {
        type: notificationType,
        title: 'Alerta de seguridad',
        message: 'Se ha detectado actividad inusual en su cuenta. Por favor verifique sus accesos recientes.',
        priority,
        link: '/resident/profile/security',
        data: {
          severity,
          timestamp: new Date().toISOString()
        }
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error al enviar notificación de actividad sospechosa:', error);
    throw error;
  }
}

/**
 * Envía notificación de sesión cerrada por inactividad
 */
export async function notifySessionTimeout(userId: number) {
  try {
    // Notificar al usuario afectado
    await notifyUser(userId, {
      type: 'info',
      title: 'Sesión cerrada por inactividad',
      message: 'Su sesión ha sido cerrada automáticamente por inactividad. Por favor inicie sesión nuevamente.',
      priority: 'low',
      data: {
        timestamp: new Date().toISOString()
      }
    });
    
    return true;
  } catch (error) {
    console.error('Error al enviar notificación de sesión cerrada:', error);
    throw error;
  }
}

/**
 * Envía notificación de actualización de seguridad del sistema
 */
export async function notifySecurityUpdate(title: string, details: string, requiresAction: boolean) {
  try {
    // Notificar a todos los usuarios
    await notifyAll({
      type: 'info',
      title: `Actualización de seguridad: ${title}`,
      message: details,
      priority: requiresAction ? 'high' : 'medium',
      requireConfirmation: requiresAction,
      data: {
        requiresAction,
        timestamp: new Date().toISOString()
      }
    });
    
    return true;
  } catch (error) {
    console.error('Error al enviar notificación de actualización de seguridad:', error);
    throw error;
  }
}

/**
 * Procesa eventos de auditoría y envía notificaciones según sea necesario
 */
export async function processAuditEvent(
  action: AuditActionType,
  details: string,
  userId: number | undefined,
  userName: string | undefined,
  status: AuditStatus,
  metadata?: Record<string, any>
) {
  try {
    // Determinar si este evento de auditoría requiere notificación
    switch (action) {
      case AuditActionType.LOGIN_FAILED:
        if (userId) {
          const attemptCount = metadata?.attemptCount || 1;
          await notifyFailedLoginAttempt(
            userId,
            metadata?.ipAddress || 'Unknown',
            metadata?.userAgent || 'Unknown',
            attemptCount
          );
        }
        break;
        
      case AuditActionType.ACCESS_ATTEMPT:
        if (userId && status === AuditStatus.FAILURE) {
          await notifySuspiciousActivity(
            details,
            'medium',
            userId
          );
        }
        break;
        
      case AuditActionType.SETTINGS_CHANGE:
      case AuditActionType.SYSTEM_CHANGE:
        // Notificar a administradores sobre cambios importantes en el sistema
        if (status === AuditStatus.SUCCESS) {
          await notifyByRole('admin', {
            type: 'info',
            title: 'Cambio en configuración del sistema',
            message: details,
            priority: 'medium',
            data: {
              action,
              userId,
              userName,
              timestamp: new Date().toISOString(),
              ...metadata
            }
          });
        }
        break;
        
      case AuditActionType.USER_MANAGEMENT:
        // Si es un cambio de rol, notificar al usuario afectado
        if (metadata?.changeType === 'role' && metadata?.targetUserId) {
          await notifyPermissionChange(
            metadata.targetUserId,
            userId || 0,
            metadata.oldRole || 'Unknown',
            metadata.newRole || 'Unknown'
          );
        }
        break;
    }
    
    return true;
  } catch (error) {
    console.error('Error al procesar evento de auditoría para notificaciones:', error);
    // No propagar el error para evitar interrumpir el flujo principal
    return false;
  }
}
