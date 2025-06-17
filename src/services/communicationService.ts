// communicationService.ts
// Servicio unificado para el sistema de comunicaciones

import { getPrisma } from '@/lib/prisma';
import { sendNotificationToUser } from '@/lib/communications/websocket-server';

const prisma = getPrisma();

// Tipos para notificaciones
export type NotificationType = 'info' | 'success' | 'warning' | 'error';
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';
export type NotificationSourceType = 'system' | 'reservation' | 'assembly' | 'financial' | 'security' | 'message';

// Interfaces para datos
export interface NotificationData {
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  data?: Record<string, any>;
  sourceType: NotificationSourceType;
  sourceId?: string;
  priority?: NotificationPriority;
  requireConfirmation?: boolean;
  expiresAt?: Date;
}

export interface AnnouncementData {
  title: string;
  content: string;
  type?: 'general' | 'important' | 'emergency';
  visibility?: 'public' | 'private' | 'role-based';
  targetRoles?: string[];
  requiresConfirmation?: boolean;
  expiresAt?: Date;
  attachments?: {
    name: string;
    url: string;
    type: string;
    size?: number;
  }[];
}

export interface MessageData {
  content: string;
  attachments?: {
    name: string;
    url: string;
    type: string;
    size?: number;
  }[];
}

export interface EventData {
  title: string;
  description: string;
  location: string;
  startDateTime: Date;
  endDateTime: Date;
  type?: 'general' | 'meeting' | 'social' | 'maintenance';
  visibility?: 'public' | 'private' | 'role-based';
  targetRoles?: string[];
  maxAttendees?: number;
  attachments?: {
    name: string;
    url: string;
    type: string;
    size?: number;
  }[];
}

/**
 * Clase de servicio para el sistema de comunicaciones
 */
export class CommunicationService {
  /**
   * NOTIFICACIONES
   */

  /**
   * Envía una notificación a un usuario específico
   */
  async notifyUser(userId: number, notification: NotificationData) {
    try {
      // Verificar si el usuario existe
      const user = await prisma.user.findUnique({
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
          data: notification.data,
          sourceType: notification.sourceType,
          sourceId: notification.sourceId,
          priority: notification.priority || 'medium',
          requireConfirmation: notification.requireConfirmation || false,
          expiresAt: notification.expiresAt,
          read: false
        }
      });
      
      // Enviar notificación en tiempo real
      await sendNotificationToUser(userId, {
        id: dbNotification.id,
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
  async notifyUsers(userIds: number[], notification: NotificationData) {
    try {
      const results = [];
      
      for (const userId of userIds) {
        try {
          const result = await this.notifyUser(userId, notification);
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
  async notifyByRole(role: string, notification: NotificationData) {
    try {
      // Obtener usuarios con el rol especificado
      const users = await prisma.user.findMany({
        where: { role },
        select: { id: true }
      });
      
      const userIds = users.map(user => user.id);
      
      return await this.notifyUsers(userIds, notification);
      
    } catch (error) {
      console.error(`Error al enviar notificación a usuarios con rol ${role}:`, error);
      throw new Error('No se pudo enviar la notificación por rol');
    }
  }

  /**
   * Obtiene las notificaciones de un usuario
   */
  async getUserNotifications(userId: number, filters: {
    read?: boolean;
    type?: string;
    sourceType?: string;
    priority?: string;
    limit?: number;
  } = {}) {
    try {
      const { read, type, sourceType, priority, limit } = filters;
      
      return await prisma.notification.findMany({
        where: {
          recipientId: userId,
          ...(read !== undefined && { read }),
          ...(type !== undefined && { type }),
          ...(sourceType !== undefined && { sourceType }),
          ...(priority !== undefined && { priority })
        },
        orderBy: {
          createdAt: 'desc'
        },
        ...(limit !== undefined && { take: limit })
      });
      
    } catch (error) {
      console.error('Error al obtener notificaciones del usuario:', error);
      throw new Error('No se pudieron obtener las notificaciones');
    }
  }

  /**
   * Marca una notificación como leída
   */
  async markNotificationAsRead(notificationId: string, userId: number) {
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
      // Preservar el mensaje de error original si es uno de nuestros errores controlados
      if (error instanceof Error && 
          (error.message === 'Notificación no encontrada o no pertenece al usuario')) {
        throw error;
      }
      throw new Error('No se pudo marcar la notificación como leída');
    }
  }

  /**
   * Marca todas las notificaciones de un usuario como leídas
   */
  async markAllNotificationsAsRead(userId: number) {
    try {
      return await prisma.notification.updateMany({
        where: {
          recipientId: userId,
          read: false
        },
        data: {
          read: true,
          readAt: new Date()
        }
      });
      
    } catch (error) {
      console.error('Error al marcar todas las notificaciones como leídas:', error);
      throw new Error('No se pudieron marcar las notificaciones como leídas');
    }
  }

  /**
   * Confirma la lectura de una notificación que requiere confirmación
   */
  async confirmNotificationReading(notificationId: string, userId: number) {
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
          userId
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
   * ANUNCIOS
   */

  /**
   * Obtiene todos los anuncios disponibles para un usuario
   */
  async getAnnouncements(userId: number, userRole: string, filters: {
    type?: string;
    read?: boolean;
    limit?: number;
  } = {}) {
    try {
      const { type, read, limit } = filters;
      
      // Construir consulta base
      const queryOptions: any = {
        where: {},
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              image: true
            }
          },
          readBy: {
            where: {
              userId
            },
            select: {
              userId: true,
              readAt: true
            }
          },
          attachments: true
        }
      };
      
      // Aplicar filtros
      if (type) {
        queryOptions.where.type = type;
      }
      
      if (read === true) {
        queryOptions.where.readBy = {
          some: {
            userId
          }
        };
      } else if (read === false) {
        queryOptions.where.readBy = {
          none: {
            userId
          }
        };
      }
      
      // Aplicar límite si se especifica
      if (limit && !isNaN(Number(limit))) {
        queryOptions.take = Number(limit);
      }
      
      // Obtener anuncios según el rol del usuario
      let announcements;
      
      if (userRole === 'admin' || userRole === 'super_admin') {
        // Los administradores ven todos los anuncios
        announcements = await prisma.announcement.findMany(queryOptions);
      } else {
        // Los demás usuarios ven anuncios públicos o dirigidos a su rol
        queryOptions.where.OR = [
          { visibility: 'public' },
          { targetRoles: { has: userRole } }
        ];
        
        announcements = await prisma.announcement.findMany(queryOptions);
      }
      
      // Formatear respuesta
      return announcements.map(announcement => ({
        id: announcement.id,
        title: announcement.title,
        content: announcement.content,
        type: announcement.type,
        createdAt: announcement.createdAt,
        expiresAt: announcement.expiresAt,
        createdBy: announcement.createdBy,
        attachments: announcement.attachments.map(attachment => ({
          id: attachment.id,
          name: attachment.name,
          url: attachment.url,
          type: attachment.type,
          size: attachment.size
        })),
        readBy: announcement.readBy,
        requiresConfirmation: announcement.requiresConfirmation,
        isRead: announcement.readBy.length > 0
      }));
      
    } catch (error) {
      console.error('Error al obtener anuncios:', error);
      throw new Error('No se pudieron obtener los anuncios');
    }
  }

  /**
   * Crea un nuevo anuncio
   */
  async createAnnouncement(userId: number, data: AnnouncementData) {
    try {
      // Crear anuncio en la base de datos
      const announcement = await prisma.announcement.create({
        data: {
          title: data.title,
          content: data.content,
          type: data.type || 'general',
          visibility: data.visibility || 'public',
          targetRoles: data.targetRoles || [],
          requiresConfirmation: data.requiresConfirmation || false,
          expiresAt: data.expiresAt,
          createdById: userId
        }
      });
      
      // Procesar archivos adjuntos si existen
      if (data.attachments && data.attachments.length > 0) {
        const attachmentRecords = data.attachments.map(attachment => ({
          announcementId: announcement.id,
          name: attachment.name,
          url: attachment.url,
          type: attachment.type,
          size: attachment.size
        }));
        
        await prisma.announcementAttachment.createMany({
          data: attachmentRecords
        });
      }
      
      // Obtener anuncio completo con relaciones
      const completeAnnouncement = await prisma.announcement.findUnique({
        where: { id: announcement.id },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              image: true
            }
          },
          attachments: true
        }
      });
      
      // Notificar a usuarios según visibilidad y roles
      let targetUserIds: number[] = [];
      
      if (completeAnnouncement.visibility === 'public') {
        // Obtener todos los usuarios
        const users = await prisma.user.findMany({
          select: { id: true }
        });
        targetUserIds = users.map(user => user.id);
      } else if (completeAnnouncement.visibility === 'role-based' && completeAnnouncement.targetRoles.length > 0) {
        // Obtener usuarios con los roles especificados
        const users = await prisma.user.findMany({
          where: {
            role: {
              in: completeAnnouncement.targetRoles
            }
          },
          select: { id: true }
        });
        targetUserIds = users.map(user => user.id);
      }
      
      // Enviar notificaciones
      if (targetUserIds.length > 0) {
        await this.notifyUsers(targetUserIds, {
          type: completeAnnouncement.type === 'emergency' ? 'error' : 
                completeAnnouncement.type === 'important' ? 'warning' : 'info',
          title: completeAnnouncement.title,
          message: `Nuevo anuncio: ${completeAnnouncement.title}`,
          link: `/announcements/${completeAnnouncement.id}`,
          sourceType: 'system',
          sourceId: completeAnnouncement.id,
          priority: completeAnnouncement.type === 'emergency' ? 'urgent' : 
                   completeAnnouncement.type === 'important' ? 'high' : 'medium',
          requireConfirmation: completeAnnouncement.requiresConfirmation,
          expiresAt: completeAnnouncement.expiresAt
        });
      }
      
      return completeAnnouncement;
      
    } catch (error) {
      console.error('Error al crear anuncio:', error);
      throw new Error('No se pudo crear el anuncio');
    }
  }

  /**
   * Marca un anuncio como leído por un usuario
   */
  async markAnnouncementAsRead(announcementId: string, userId: number) {
    try {
      // Verificar si ya está marcado como leído
      const existingRead = await prisma.announcementRead.findUnique({
        where: {
          announcementId_userId: {
            announcementId,
            userId
          }
        }
      });
      
      if (existingRead) {
        return existingRead;
      }
      
      // Marcar como leído
      return await prisma.announcementRead.create({
        data: {
          announcementId,
          userId
        }
      });
      
    } catch (error) {
      console.error('Error al marcar anuncio como leído:', error);
      throw new Error('No se pudo marcar el anuncio como leído');
    }
  }

  /**
   * MENSAJES
   */

  /**
   * Obtiene o crea una conversación entre dos usuarios
   */
  async getOrCreateDirectConversation(userId1: number, userId2: number) {
    try {
      // Buscar conversación existente entre los usuarios
      const existingConversation = await prisma.conversation.findFirst({
        where: {
          type: 'direct',
          participants: {
            every: {
              userId: {
                in: [userId1, userId2]
              }
            }
          },
          AND: [
            {
              participants: {
                some: {
                  userId: userId1
                }
              }
            },
            {
              participants: {
                some: {
                  userId: userId2
                }
              }
            }
          ]
        },
        include: {
          participants: true
        }
      });
      
      if (existingConversation) {
        return existingConversation;
      }
      
      // Crear nueva conversación
      const newConversation = await prisma.conversation.create({
        data: {
          type: 'direct',
          participants: {
            create: [
              {
                userId: userId1,
                role: 'member'
              },
              {
                userId: userId2,
                role: 'member'
              }
            ]
          }
        },
        include: {
          participants: true
        }
      });
      
      return newConversation;
      
    } catch (error) {
      console.error('Error al obtener o crear conversación:', error);
      throw new Error('No se pudo obtener o crear la conversación');
    }
  }

  /**
   * Envía un mensaje en una conversación
   */
  async sendMessage(conversationId: string, senderId: number, data: MessageData) {
    try {
      // Verificar que el remitente pertenece a la conversación
      const participant = await prisma.conversationParticipant.findFirst({
        where: {
          conversationId,
          userId: senderId
        }
      });
      
      if (!participant) {
        throw new Error('El usuario no pertenece a esta conversación');
      }
      
      // Crear mensaje
      const message = await prisma.message.create({
        data: {
          conversationId,
          senderId,
          content: data.content,
          status: 'sent'
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              image: true
            }
          }
        }
      });
      
      // Procesar archivos adjuntos si existen
      if (data.attachments && data.attachments.length > 0) {
        const attachmentRecords = data.attachments.map(attachment => ({
          messageId: message.id,
          name: attachment.name,
          url: attachment.url,
          type: attachment.type,
          size: attachment.size
        }));
        
        await prisma.messageAttachment.createMany({
          data: attachmentRecords
        });
      }
      
      // Actualizar conversación
      await prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() }
      });
      
      // Notificar a otros participantes
      const otherParticipants = await prisma.conversationParticipant.findMany({
        where: {
          conversationId,
          userId: {
            not: senderId
          }
        }
      });
      
      for (const participant of otherParticipants) {
        await this.notifyUser(participant.userId, {
          type: 'info',
          title: 'Nuevo mensaje',
          message: `${message.sender.name}: ${data.content.substring(0, 50)}${data.content.length > 50 ? '...' : ''}`,
          link: `/messages/${conversationId}`,
          sourceType: 'message',
          sourceId: message.id,
          priority: 'medium'
        });
      }
      
      return message;
      
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      throw new Error('No se pudo enviar el mensaje');
    }
  }

  /**
   * Obtiene los mensajes de una conversación
   */
  async getConversationMessages(conversationId: string, userId: number, options: {
    limit?: number;
    before?: Date;
  } = {}) {
    try {
      // Verificar que el usuario pertenece a la conversación
      const participant = await prisma.conversationParticipant.findFirst({
        where: {
          conversationId,
          userId
        }
      });
      
      if (!participant) {
        throw new Error('El usuario no pertenece a esta conversación');
      }
      
      // Construir consulta
      const queryOptions: any = {
        where: {
          conversationId
        },
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              image: true
            }
          },
          attachments: true,
          readBy: {
            where: {
              userId
            }
          }
        }
      };
      
      // Aplicar filtros
      if (options.before) {
        queryOptions.where.createdAt = {
          lt: options.before
        };
      }
      
      if (options.limit) {
        queryOptions.take = options.limit;
      }
      
      // Obtener mensajes
      const messages = await prisma.message.findMany(queryOptions);
      
      // Marcar mensajes como entregados si no son del usuario actual
      const messagesToUpdate = messages.filter(m => m.senderId !== userId && m.status === 'sent');
      
      if (messagesToUpdate.length > 0) {
        await prisma.message.updateMany({
          where: {
            id: {
              in: messagesToUpdate.map(m => m.id)
            }
          },
          data: {
            status: 'delivered'
          }
        });
      }
      
      return messages;
      
    } catch (error) {
      console.error('Error al obtener mensajes de conversación:', error);
      throw new Error('No se pudieron obtener los mensajes');
    }
  }

  /**
   * Marca un mensaje como leído
   */
  async markMessageAsRead(messageId: string, userId: number) {
    try {
      // Verificar que el mensaje existe
      const message = await prisma.message.findUnique({
        where: { id: messageId },
        include: {
          conversation: {
            include: {
              participants: {
                where: {
                  userId
                }
              }
            }
          }
        }
      });
      
      if (!message) {
        throw new Error('Mensaje no encontrado');
      }
      
      // Verificar que el usuario pertenece a la conversación
      if (message.conversation.participants.length === 0) {
        throw new Error('El usuario no pertenece a esta conversación');
      }
      
      // Verificar si ya está marcado como leído
      const existingRead = await prisma.messageRead.findUnique({
        where: {
          messageId_userId: {
            messageId,
            userId
          }
        }
      });
      
      if (existingRead) {
        return existingRead;
      }
      
      // Marcar como leído
      const messageRead = await prisma.messageRead.create({
        data: {
          messageId,
          userId
        }
      });
      
      // Actualizar estado del mensaje si todos los participantes lo han leído
      const allParticipants = await prisma.conversationParticipant.findMany({
        where: {
          conversationId: message.conversationId,
          userId: {
            not: message.senderId
          }
        }
      });
      
      const allReads = await prisma.messageRead.findMany({
        where: {
          messageId
        }
      });
      
      if (allReads.length >= allParticipants.length) {
        await prisma.message.update({
          where: { id: messageId },
          data: { status: 'read' }
        });
      }
      
      return messageRead;
      
    } catch (error) {
      console.error('Error al marcar mensaje como leído:', error);
      throw new Error('No se pudo marcar el mensaje como leído');
    }
  }

  /**
   * EVENTOS COMUNITARIOS
   */

  /**
   * Crea un nuevo evento comunitario
   */
  async createEvent(organizerId: number, data: EventData) {
    try {
      // Crear evento en la base de datos
      const event = await prisma.communityEvent.create({
        data: {
          title: data.title,
          description: data.description,
          location: data.location,
          startDateTime: data.startDateTime,
          endDateTime: data.endDateTime,
          type: data.type || 'general',
          visibility: data.visibility || 'public',
          targetRoles: data.targetRoles || [],
          maxAttendees: data.maxAttendees,
          organizerId
        }
      });
      
      // Procesar archivos adjuntos si existen
      if (data.attachments && data.attachments.length > 0) {
        const attachmentRecords = data.attachments.map(attachment => ({
          eventId: event.id,
          name: attachment.name,
          url: attachment.url,
          type: attachment.type,
          size: attachment.size
        }));
        
        await prisma.eventAttachment.createMany({
          data: attachmentRecords
        });
      }
      
      // Obtener evento completo con relaciones
      const completeEvent = await prisma.communityEvent.findUnique({
        where: { id: event.id },
        include: {
          organizer: {
            select: {
              id: true,
              name: true,
              image: true
            }
          },
          attachments: true
        }
      });
      
      // Notificar a usuarios según visibilidad y roles
      let targetUserIds: number[] = [];
      
      if (completeEvent.visibility === 'public') {
        // Obtener todos los usuarios
        const users = await prisma.user.findMany({
          select: { id: true }
        });
        targetUserIds = users.map(user => user.id);
      } else if (completeEvent.visibility === 'role-based' && completeEvent.targetRoles.length > 0) {
        // Obtener usuarios con los roles especificados
        const users = await prisma.user.findMany({
          where: {
            role: {
              in: completeEvent.targetRoles
            }
          },
          select: { id: true }
        });
        targetUserIds = users.map(user => user.id);
      }
      
      // Enviar notificaciones
      if (targetUserIds.length > 0) {
        await this.notifyUsers(targetUserIds, {
          type: 'info',
          title: 'Nuevo evento',
          message: `${completeEvent.title} - ${new Date(completeEvent.startDateTime).toLocaleDateString()}`,
          link: `/events/${completeEvent.id}`,
          sourceType: 'system',
          sourceId: completeEvent.id,
          priority: 'medium'
        });
      }
      
      return completeEvent;
      
    } catch (error) {
      console.error('Error al crear evento:', error);
      throw new Error('No se pudo crear el evento');
    }
  }

  /**
   * Obtiene eventos comunitarios
   */
  async getEvents(userId: number, userRole: string, filters: {
    type?: string;
    upcoming?: boolean;
    limit?: number;
    startDate?: Date;
    endDate?: Date;
  } = {}) {
    try {
      const { type, upcoming, limit, startDate, endDate } = filters;
      
      // Construir consulta base
      const queryOptions: any = {
        where: {},
        orderBy: {
          startDateTime: upcoming ? 'asc' : 'desc'
        },
        include: {
          organizer: {
            select: {
              id: true,
              name: true,
              image: true
            }
          },
          attendees: {
            where: {
              userId
            }
          },
          attachments: true
        }
      };
      
      // Aplicar filtros
      if (type) {
        queryOptions.where.type = type;
      }
      
      if (upcoming) {
        queryOptions.where.startDateTime = {
          gte: new Date()
        };
      }
      
      if (startDate) {
        queryOptions.where.startDateTime = {
          ...queryOptions.where.startDateTime,
          gte: startDate
        };
      }
      
      if (endDate) {
        queryOptions.where.endDateTime = {
          lte: endDate
        };
      }
      
      // Aplicar límite si se especifica
      if (limit && !isNaN(Number(limit))) {
        queryOptions.take = Number(limit);
      }
      
      // Obtener eventos según el rol del usuario
      let events;
      
      if (userRole === 'admin' || userRole === 'super_admin') {
        // Los administradores ven todos los eventos
        events = await prisma.communityEvent.findMany(queryOptions);
      } else {
        // Los demás usuarios ven eventos públicos o dirigidos a su rol
        queryOptions.where.OR = [
          { visibility: 'public' },
          { targetRoles: { has: userRole } }
        ];
        
        events = await prisma.communityEvent.findMany(queryOptions);
      }
      
      // Formatear respuesta
      return events.map(event => ({
        id: event.id,
        title: event.title,
        description: event.description,
        location: event.location,
        startDateTime: event.startDateTime,
        endDateTime: event.endDateTime,
        type: event.type,
        visibility: event.visibility,
        maxAttendees: event.maxAttendees,
        organizer: event.organizer,
        attachments: event.attachments.map(attachment => ({
          id: attachment.id,
          name: attachment.name,
          url: attachment.url,
          type: attachment.type,
          size: attachment.size
        })),
        userAttendance: event.attendees.length > 0 ? event.attendees[0] : null
      }));
      
    } catch (error) {
      console.error('Error al obtener eventos:', error);
      throw new Error('No se pudieron obtener los eventos');
    }
  }

  /**
   * Registra asistencia a un evento
   */
  async registerEventAttendance(eventId: string, userId: number, status: 'confirmed' | 'tentative' | 'declined') {
    try {
      // Verificar que el evento existe
      const event = await prisma.communityEvent.findUnique({
        where: { id: eventId },
        include: {
          attendees: {
            where: {
              userId
            }
          }
        }
      });
      
      if (!event) {
        throw new Error('Evento no encontrado');
      }
      
      // Verificar límite de asistentes si está confirmando
      if (status === 'confirmed' && event.maxAttendees) {
        const confirmedCount = await prisma.eventAttendee.count({
          where: {
            eventId,
            status: 'confirmed'
          }
        });
        
        if (confirmedCount >= event.maxAttendees && event.attendees.length === 0) {
          throw new Error('El evento ha alcanzado su capacidad máxima');
        }
      }
      
      // Actualizar o crear registro de asistencia
      if (event.attendees.length > 0) {
        return await prisma.eventAttendee.update({
          where: {
            id: event.attendees[0].id
          },
          data: {
            status
          }
        });
      } else {
        return await prisma.eventAttendee.create({
          data: {
            eventId,
            userId,
            status
          }
        });
      }
      
    } catch (error) {
      console.error('Error al registrar asistencia:', error);
      throw new Error('No se pudo registrar la asistencia');
    }
  }

  /**
   * UTILIDADES
   */

  /**
   * Elimina notificaciones y anuncios expirados
   */
  async cleanupExpiredItems() {
    try {
      const now = new Date();
      
      // Eliminar notificaciones expiradas
      const deletedNotifications = await prisma.notification.deleteMany({
        where: {
          expiresAt: {
            lt: now
          }
        }
      });
      
      // Marcar anuncios expirados como inactivos
      const updatedAnnouncements = await prisma.announcement.updateMany({
        where: {
          expiresAt: {
            lt: now
          }
        },
        data: {
          // No eliminamos anuncios, solo los marcamos como expirados en los datos
          data: {
            expired: true
          }
        }
      });
      
      return {
        deletedNotifications: deletedNotifications.count,
        updatedAnnouncements: updatedAnnouncements.count
      };
      
    } catch (error) {
      console.error('Error al limpiar elementos expirados:', error);
      throw new Error('No se pudieron limpiar los elementos expirados');
    }
  }

  /**
   * Migra notificaciones del sistema antiguo al nuevo
   */
  async migrateReservationNotifications() {
    try {
      // Obtener notificaciones de reservas no migradas
      const reservationNotifications = await prisma.reservationNotification.findMany({
        where: {
          // Agregar campo para marcar como migradas
          migrated: false
        },
        include: {
          reservation: true
        }
      });
      
      let migratedCount = 0;
      
      // Migrar cada notificación
      for (const oldNotification of reservationNotifications) {
        try {
          // Determinar tipo de notificación
          let type: NotificationType = 'info';
          if (oldNotification.type === 'rejection') type = 'error';
          if (oldNotification.type === 'cancellation') type = 'warning';
          
          // Crear nueva notificación
          await prisma.notification.create({
            data: {
              recipientId: oldNotification.userId,
              type,
              title: 'Notificación de reserva',
              message: oldNotification.message,
              sourceType: 'reservation',
              sourceId: oldNotification.reservationId?.toString(),
              read: oldNotification.isRead || false,
              readAt: oldNotification.readAt,
              data: {
                reservationId: oldNotification.reservationId,
                notificationType: oldNotification.type
              }
            }
          });
          
          // Marcar como migrada
          await prisma.reservationNotification.update({
            where: { id: oldNotification.id },
            data: { migrated: true }
          });
          
          migratedCount++;
        } catch (error) {
          console.error(`Error al migrar notificación ${oldNotification.id}:`, error);
        }
      }
      
      return { migratedCount };
      
    } catch (error) {
      console.error('Error al migrar notificaciones de reservas:', error);
      throw new Error('No se pudieron migrar las notificaciones');
    }
  }
}

// Exportar instancia del servicio
export default new CommunicationService();
