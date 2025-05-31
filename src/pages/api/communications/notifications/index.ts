import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { notifyUser, notifyByRole, notifyAll } from '@/lib/communications/notification-service';

const prisma = new PrismaClient();

/**
 * API para gestionar notificaciones
 * 
 * GET: Obtiene notificaciones del usuario actual
 * POST: Crea una nueva notificación (solo administradores)
 */
export default async function handler(_req:unknown, res: NextApiResponse) {
  // Verificar autenticación
  const session = await getServerSession(req, res, authOptions);
  
  if (!session || !session.user) {
    return res.status(401).json({ error: 'No autorizado' });
  }
  
  const userId = session.user.id;
  const userRole = session.user.role;
  
  // Manejar solicitud según método
  switch (req.method) {
    case 'GET':
      return getNotifications(req, res, userId);
    case 'POST':
      return createNotification(req, res, userId, userRole);
    default:
      return res.status(405).json({ error: 'Método no permitido' });
  }
}

/**
 * Obtiene notificaciones del usuario actual
 */
async function getNotifications(
  _req:unknown,
  res: NextApiResponse,
  userId: number
) {
  try {
    // Parámetros de filtrado opcionales
    const { type, read, limit } = req.query;
    
    // Construir consulta base
    const queryOptions: unknown = {
      where: {
        recipientId: userId
      },
      orderBy: {
        createdAt: 'desc'
      }
    };
    
    // Aplicar filtros
    if (type) {
      queryOptions.where.type = type;
    }
    
    if (read === 'true') {
      queryOptions.where.read = true;
    } else if (read === 'false') {
      queryOptions.where.read = false;
    }
    
    // Aplicar límite si se especifica
    if (limit && !isNaN(Number(limit))) {
      queryOptions.take = Number(limit);
    }
    
    // Obtener notificaciones
    const notifications = await prisma.notification.findMany(queryOptions);
    
    // Formatear respuesta
    const formattedNotifications = notifications.map(notification => ({
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      timestamp: notification.createdAt,
      read: notification.read,
      link: notification.link,
      data: notification.data ? JSON.parse(notification.data) : undefined
    }));
    
    return res.status(200).json(formattedNotifications);
    
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    return res.status(500).json({ error: 'Error al obtener notificaciones' });
  }
}

/**
 * Crea una nueva notificación (solo administradores)
 */
async function createNotification(
  _req:unknown,
  res: NextApiResponse,
  userId: number,
  userRole: string
) {
  try {
    // Verificar permisos
    if (userRole !== 'admin' && userRole !== 'super_admin') {
      return res.status(403).json({ error: 'No tiene permisos para crear notificaciones' });
    }
    
    const {
      type = 'info',
      title,
      message,
      link,
      requireConfirmation = false,
      priority = 'medium',
      expiresAt,
      data,
      recipientId,
      recipientRole,
      sendToAll = false
    } = req.body;
    
    // Validar datos requeridos
    if (!title || !message) {
      return res.status(400).json({ error: 'Título y mensaje son obligatorios' });
    }
    
    // Preparar datos de notificación
    const notificationData = {
      type,
      title,
      message,
      link,
      requireConfirmation,
      priority,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      data: {
        ...data,
        createdBy: userId,
        recipientRole,
        recipientAll: sendToAll
      }
    };
    
    let result;
    
    // Enviar notificación según destinatario
    if (sendToAll) {
      // Enviar a todos los usuarios
      result = await notifyAll(notificationData);
    } else if (recipientRole) {
      // Enviar a usuarios con un rol específico
      result = await notifyByRole(recipientRole, notificationData);
    } else if (recipientId) {
      // Enviar a un usuario específico
      result = await notifyUser(recipientId, notificationData);
    } else {
      return res.status(400).json({ error: 'Debe especificar al menos un destinatario' });
    }
    
    return res.status(201).json({
      success: true,
      result
    });
    
  } catch (error) {
    console.error('Error al crear notificación:', error);
    return res.status(500).json({ error: 'Error al crear notificación' });
  }
}
