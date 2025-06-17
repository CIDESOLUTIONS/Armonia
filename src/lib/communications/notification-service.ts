/**
 * Servicio de notificaciones para el sistema de comunicaciones en tiempo real
 * 
 * Este módulo proporciona funciones para enviar notificaciones a usuarios específicos,
 * grupos de usuarios o roles, con soporte para confirmación de lectura y priorización.
 */

import { getPrisma } from '@/lib/prisma';
import { sendNotificationToUser } from './websocket-server';

const prisma = getPrisma();

// Tipos de notificaciones
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

// Prioridades de notificaciones
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

// Interfaz para notificaciones
export interface NotificationData {
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  requireConfirmation?: boolean;
  priority?: NotificationPriority;
  expiresAt?: Date;
  data?: Record<string, any>;
}

/**
 * Envía una notificación a un usuario específico
 */
export async function notifyUser(userId: number, notification: NotificationData) {
  try {
    // Verificar si el usuario existe
    const _user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      throw new Error(`Usuario con ID ${userId} no encontrado`);
    }
    
    // Crear registro de notificación en la base de datos
    const dbNotification = await prisma.notification.create({
      data: {
        recipientId: userId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        link: notification.link,
        requireConfirmation: notification.requireConfirmation || false,
        priority: notification.priority || 'medium',
        expiresAt: notification.expiresAt,
        data: notification.data ? JSON.stringify(notification.data) : null,
        read: false
      }
    });
    
    // Enviar notificación en tiempo real
    await sendNotificationToUser(userId, {
      type: notification.type,
      title: notification.title,
      message: notification.message,
      link: notification.link,
      data: {
        ...notification.data,
        notificationId: dbNotification.id,
        requireConfirmation: notification.requireConfirmation,
        priority: notification.priority,
        expiresAt: notification.expiresAt
      }
    });
    
    return dbNotification;
    
  } catch (error) {
    console.error('Error al enviar notificación al usuario:', error);
    throw new Error('No se pudo enviar la notificación');
  }
}

/**
 * Envía una notificación a múltiples usuarios
 */
export async function notifyUsers(userIds: number[], notification: NotificationData) {
  try {
    const results = [];
    
    for (const userId of userIds) {
      try {
        const _result = await notifyUser(userId, notification);
        results.push(result);
      } catch (error) {
        console.error(`Error al enviar notificación al usuario ${userId}:`, error);
      }
    }
    
    return results;
    
  } catch (error) {
    console.error('Error al enviar notificación a usuarios:', error);
    throw new Error('No se pudo enviar la notificación a algunos usuarios');
  }
}

/**
 * Envía una notificación a todos los usuarios con un rol específico
 */
export async function notifyByRole(role: string, notification: NotificationData) {
  try {
    // Obtener usuarios con el rol especificado
    const users = await prisma.user.findMany({
      where: { role },
      select: { id: true }
    });
    
    const userIds = users.map(user => user.id);
    
    return await notifyUsers(userIds, notification);
    
  } catch (error) {
    console.error(`Error al enviar notificación a usuarios con rol ${role}:`, error);
    throw new Error('No se pudo enviar la notificación por rol');
  }
}

/**
 * Envía una notificación a todos los usuarios
 */
export async function notifyAll(notification: NotificationData) {
  try {
    // Obtener todos los usuarios
    const users = await prisma.user.findMany({
      select: { id: true }
    });
    
    const userIds = users.map(user => user.id);
    
    return await notifyUsers(userIds, notification);
    
  } catch (error) {
    console.error('Error al enviar notificación a todos los usuarios:', error);
    throw new Error('No se pudo enviar la notificación a todos los usuarios');
  }
}

/**
 * Envía una notificación a todos los residentes de una unidad específica
 */
export async function notifyUnit(unitId: number, notification: NotificationData) {
  try {
    // Obtener residentes de la unidad
    const residents = await prisma.resident.findMany({
      where: { unitId },
      select: { userId: true }
    });
    
    const userIds = residents.map(resident => resident.userId);
    
    return await notifyUsers(userIds, notification);
    
  } catch (error) {
    console.error(`Error al enviar notificación a la unidad ${unitId}:`, error);
    throw new Error('No se pudo enviar la notificación a la unidad');
  }
}

/**
 * Marca una notificación como leída
 */
export async function markNotificationAsRead(notificationId: string, userId: number) {
  try {
    // Verificar que la notificación pertenezca al usuario
    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        recipientId: userId
      }
    });
    
    if (!notification) {
      throw new Error('Notificación no encontrada o no pertenece al usuario');
    }
    
    // Actualizar estado de lectura
    return await prisma.notification.update({
      where: { id: notificationId },
      data: { 
        read: true,
        readAt: new Date()
      }
    });
    
  } catch (error) {
    console.error('Error al marcar notificación como leída:', error);
    throw new Error('No se pudo marcar la notificación como leída');
  }
}

/**
 * Confirma la lectura de una notificación que requiere confirmación
 */
export async function confirmNotificationReading(notificationId: string, userId: number) {
  try {
    // Verificar que la notificación pertenezca al usuario y requiera confirmación
    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        recipientId: userId,
        requireConfirmation: true
      }
    });
    
    if (!notification) {
      throw new Error('Notificación no encontrada, no pertenece al usuario o no requiere confirmación');
    }
    
    // Registrar confirmación
    await prisma.notificationConfirmation.create({
      data: {
        notificationId,
        userId,
        confirmedAt: new Date()
      }
    });
    
    // Actualizar estado de lectura
    return await prisma.notification.update({
      where: { id: notificationId },
      data: { 
        read: true,
        readAt: new Date()
      }
    });
    
  } catch (error) {
    console.error('Error al confirmar lectura de notificación:', error);
    throw new Error('No se pudo confirmar la lectura de la notificación');
  }
}

/**
 * Obtiene estadísticas de confirmación de lectura para una notificación
 */
export async function getNotificationConfirmationStats(notificationId: string) {
  try {
    // Obtener notificación
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId }
    });
    
    if (!notification || !notification.requireConfirmation) {
      throw new Error('Notificación no encontrada o no requiere confirmación');
    }
    
    // Contar confirmaciones
    const confirmationsCount = await prisma.notificationConfirmation.count({
      where: { notificationId }
    });
    
    // Si la notificación fue enviada a un rol específico, obtener el total de usuarios con ese rol
    let totalRecipients = 1; // Por defecto, asumimos un solo destinatario
    
    if (notification.data) {
      const _data = JSON.parse(notification.data);
      if (data.recipientRole) {
        totalRecipients = await prisma.user.count({
          where: { role: data.recipientRole }
        });
      } else if (data.recipientUnitId) {
        totalRecipients = await prisma.resident.count({
          where: { unitId: data.recipientUnitId }
        });
      } else if (data.recipientAll) {
        totalRecipients = await prisma.user.count();
      }
    }
    
    return {
      total: totalRecipients,
      confirmed: confirmationsCount,
      percentage: Math.round((confirmationsCount / totalRecipients) * 100)
    };
    
  } catch (error) {
    console.error('Error al obtener estadísticas de confirmación:', error);
    throw new Error('No se pudieron obtener las estadísticas de confirmación');
  }
}

/**
 * Elimina notificaciones expiradas
 */
export async function cleanupExpiredNotifications() {
  try {
    const now = new Date();
    
    // Eliminar notificaciones expiradas
    const deleted = await prisma.notification.deleteMany({
      where: {
        expiresAt: {
          lt: now
        }
      }
    });
    
    return deleted.count;
    
  } catch (error) {
    console.error('Error al limpiar notificaciones expiradas:', error);
    throw new Error('No se pudieron limpiar las notificaciones expiradas');
  }
}
