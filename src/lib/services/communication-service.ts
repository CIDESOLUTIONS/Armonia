/**
 * Servicio para la gestión del Sistema de Comunicaciones
 * Incluye funcionalidades para anuncios y notificaciones
 */

import { prisma } from '@/lib/prisma';
import { ServerLogger } from '@/lib/logging/server-logger';
import { ActivityLogger } from '@/lib/logging/activity-logger';
import { NotificationService } from '@/lib/communications/notification-service';
import { 
  AnnouncementStatus, 
  NotificationType,
  NotificationStatus
} from '@prisma/client';

export interface CreateAnnouncementDto {
  title: string;
  content: string;
  categoryId: number;
  authorId: number;
  authorName: string;
  isPinned?: boolean;
  isImportant?: boolean;
  publishDate?: Date;
  expiryDate?: Date | null;
  attachments?: string[];
  visibleToRoles?: string[];
  visibleToUnits?: string[];
}

export interface UpdateAnnouncementDto {
  title?: string;
  content?: string;
  categoryId?: number;
  isPinned?: boolean;
  isImportant?: boolean;
  publishDate?: Date;
  expiryDate?: Date | null;
  attachments?: string[];
  visibleToRoles?: string[];
  visibleToUnits?: string[];
  status?: AnnouncementStatus;
}

export interface CreateNotificationDto {
  userId: number;
  title: string;
  content: string;
  type: NotificationType;
  relatedEntityType?: string;
  relatedEntityId?: number;
  actionUrl?: string;
  expiresAt?: Date;
}

export class CommunicationService {
  /**
   * Crea un nuevo anuncio
   */
  static async createAnnouncement(data: CreateAnnouncementDto) {
    try {
      const announcement = await prisma.announcement.create({
        data: {
          title: data.title,
          content: data.content,
          categoryId: data.categoryId,
          authorId: data.authorId,
          authorName: data.authorName,
          isPinned: data.isPinned || false,
          isImportant: data.isImportant || false,
          publishDate: data.publishDate || new Date(),
          expiryDate: data.expiryDate,
          attachments: data.attachments || [],
          visibleToRoles: data.visibleToRoles || [],
          visibleToUnits: data.visibleToUnits || [],
          status: AnnouncementStatus.PUBLISHED
        },
        include: {
          category: true
        }
      });

      // Registrar actividad
      await ActivityLogger.log({
        action: 'announcement.create',
        userId: data.authorId,
        entityType: 'announcement',
        entityId: announcement.id,
        details: { title: announcement.title }
      });

      // Enviar notificaciones a usuarios relevantes
      await this.notifyUsersAboutAnnouncement(announcement);

      return announcement;
    } catch (error) {
      ServerLogger.error('Error al crear anuncio', error);
      throw new Error('No se pudo crear el anuncio');
    }
  }

  /**
   * Actualiza un anuncio existente
   */
  static async updateAnnouncement(id: number, data: UpdateAnnouncementDto, userId: number) {
    try {
      const announcement = await prisma.announcement.update({
        where: { id },
        data: {
          ...(data.title && { title: data.title }),
          ...(data.content && { content: data.content }),
          ...(data.categoryId && { categoryId: data.categoryId }),
          ...(data.isPinned !== undefined && { isPinned: data.isPinned }),
          ...(data.isImportant !== undefined && { isImportant: data.isImportant }),
          ...(data.publishDate && { publishDate: data.publishDate }),
          ...(data.expiryDate !== undefined && { expiryDate: data.expiryDate }),
          ...(data.attachments && { attachments: data.attachments }),
          ...(data.visibleToRoles && { visibleToRoles: data.visibleToRoles }),
          ...(data.visibleToUnits && { visibleToUnits: data.visibleToUnits }),
          ...(data.status && { status: data.status }),
          updatedAt: new Date()
        },
        include: {
          category: true
        }
      });

      // Registrar actividad
      await ActivityLogger.log({
        action: 'announcement.update',
        userId,
        entityType: 'announcement',
        entityId: announcement.id,
        details: { title: announcement.title }
      });

      // Si el anuncio fue modificado significativamente, notificar a los usuarios
      if (data.title || data.content || data.isImportant) {
        await this.notifyUsersAboutAnnouncementUpdate(announcement);
      }

      return announcement;
    } catch (error) {
      ServerLogger.error(`Error al actualizar anuncio ${id}`, error);
      throw new Error('No se pudo actualizar el anuncio');
    }
  }

  /**
   * Obtiene un anuncio por su ID
   */
  static async getAnnouncementById(id: number, userId: number) {
    try {
      const announcement = await prisma.announcement.findUnique({
        where: { id },
        include: {
          category: true,
          comments: {
            where: { isApproved: true },
            orderBy: { createdAt: 'desc' }
          }
        }
      });

      if (!announcement) {
        throw new Error('Anuncio no encontrado');
      }

      // Registrar vista si el usuario no ha visto el anuncio antes
      const hasRead = await prisma.announcementRead.findUnique({
        where: {
          announcementId_userId: {
            announcementId: id,
            userId
          }
        }
      });

      if (!hasRead) {
        await prisma.$transaction([
          // Incrementar contador de vistas
          prisma.announcement.update({
            where: { id },
            data: { views: { increment: 1 } }
          }),
          // Registrar lectura
          prisma.announcementRead.create({
            data: {
              announcementId: id,
              userId,
              readAt: new Date()
            }
          })
        ]);
      }

      return announcement;
    } catch (error) {
      ServerLogger.error(`Error al obtener anuncio ${id}`, error);
      throw new Error('No se pudo obtener el anuncio');
    }
  }

  /**
   * Obtiene anuncios filtrados y paginados
   */
  static async getAnnouncements({
    page = 1,
    limit = 10,
    categoryId,
    status = AnnouncementStatus.PUBLISHED,
    isPinned,
    isImportant,
    search,
    userId,
    userRoles,
    userUnit
  }: {
    page?: number;
    limit?: number;
    categoryId?: number;
    status?: AnnouncementStatus;
    isPinned?: boolean;
    isImportant?: boolean;
    search?: string;
    userId: number;
    userRoles: string[];
    userUnit?: string;
  }) {
    try {
      const skip = (page - 1) * limit;
      
      // Construir filtros
      const where: any = {
        status,
        ...(categoryId && { categoryId }),
        ...(isPinned !== undefined && { isPinned }),
        ...(isImportant !== undefined && { isImportant }),
        ...(search && {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { content: { contains: search, mode: 'insensitive' } }
          ]
        }),
        // Filtrar por roles visibles
        OR: [
          { visibleToRoles: { isEmpty: true } }, // Visible para todos
          { visibleToRoles: { hasSome: userRoles } } // Visible para alguno de los roles del usuario
        ]
      };
      
      // Filtrar por unidad si está especificada
      if (userUnit) {
        where.OR.push(
          { visibleToUnits: { isEmpty: true } }, // Visible para todas las unidades
          { visibleToUnits: { has: userUnit } } // Visible para la unidad del usuario
        );
      }

      // Obtener total de anuncios con los filtros
      const total = await prisma.announcement.count({ where });
      
      // Obtener anuncios paginados
      const announcements = await prisma.announcement.findMany({
        where,
        include: {
          category: true,
          _count: {
            select: {
              comments: true,
              readBy: true
            }
          }
        },
        orderBy: [
          { isPinned: 'desc' },
          { publishDate: 'desc' }
        ],
        skip,
        take: limit
      });

      // Verificar cuáles ha leído el usuario
      const readStatus = await prisma.announcementRead.findMany({
        where: {
          userId,
          announcementId: { in: announcements.map(a => a.id) }
        },
        select: {
          announcementId: true
        }
      });

      const readAnnouncementIds = new Set(readStatus.map(r => r.announcementId));

      // Añadir información de lectura a cada anuncio
      const enrichedAnnouncements = announcements.map(announcement => ({
        ...announcement,
        isRead: readAnnouncementIds.has(announcement.id)
      }));

      return {
        data: enrichedAnnouncements,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      ServerLogger.error('Error al obtener anuncios', error);
      throw new Error('No se pudieron obtener los anuncios');
    }
  }

  /**
   * Elimina un anuncio (cambio de estado a DELETED)
   */
  static async deleteAnnouncement(id: number, userId: number) {
    try {
      const announcement = await prisma.announcement.update({
        where: { id },
        data: {
          status: AnnouncementStatus.DELETED,
          updatedAt: new Date()
        }
      });

      // Registrar actividad
      await ActivityLogger.log({
        action: 'announcement.delete',
        userId,
        entityType: 'announcement',
        entityId: id,
        details: { title: announcement.title }
      });

      return { success: true };
    } catch (error) {
      ServerLogger.error(`Error al eliminar anuncio ${id}`, error);
      throw new Error('No se pudo eliminar el anuncio');
    }
  }

  /**
   * Añade un comentario a un anuncio
   */
  static async addComment(announcementId: number, userId: number, authorName: string, content: string) {
    try {
      const comment = await prisma.announcementComment.create({
        data: {
          announcementId,
          authorId: userId,
          authorName,
          content,
          isApproved: true // Por defecto aprobado, podría cambiarse según configuración
        }
      });

      // Registrar actividad
      await ActivityLogger.log({
        action: 'announcement.comment',
        userId,
        entityType: 'announcement',
        entityId: announcementId,
        details: { commentId: comment.id }
      });

      // Notificar al autor del anuncio
      const announcement = await prisma.announcement.findUnique({
        where: { id: announcementId },
        select: { authorId: true, title: true }
      });

      if (announcement && announcement.authorId !== userId) {
        await this.createNotification({
          userId: announcement.authorId,
          title: 'Nuevo comentario en tu anuncio',
          content: `${authorName} ha comentado en tu anuncio "${announcement.title}"`,
          type: NotificationType.ANNOUNCEMENT,
          relatedEntityType: 'announcement',
          relatedEntityId: announcementId,
          actionUrl: `/announcements/${announcementId}`
        });
      }

      return comment;
    } catch (error) {
      ServerLogger.error(`Error al añadir comentario al anuncio ${announcementId}`, error);
      throw new Error('No se pudo añadir el comentario');
    }
  }

  /**
   * Crea una nueva notificación
   */
  static async createNotification(data: CreateNotificationDto) {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId: data.userId,
          title: data.title,
          content: data.content,
          type: data.type,
          relatedEntityType: data.relatedEntityType,
          relatedEntityId: data.relatedEntityId,
          actionUrl: data.actionUrl,
          status: NotificationStatus.UNREAD,
          expiresAt: data.expiresAt
        }
      });

      // Enviar notificación según preferencias del usuario
      await NotificationService.sendNotification({
        userId: data.userId,
        title: data.title,
        content: data.content,
        type: data.type,
        actionUrl: data.actionUrl
      });

      return notification;
    } catch (error) {
      ServerLogger.error('Error al crear notificación', error);
      throw new Error('No se pudo crear la notificación');
    }
  }

  /**
   * Obtiene notificaciones de un usuario
   */
  static async getUserNotifications(userId: number, page = 1, limit = 20, status?: NotificationStatus) {
    try {
      const skip = (page - 1) * limit;
      
      const where = {
        userId,
        ...(status && { status })
      };

      const total = await prisma.notification.count({ where });
      
      const notifications = await prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      });

      return {
        data: notifications,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      ServerLogger.error(`Error al obtener notificaciones del usuario ${userId}`, error);
      throw new Error('No se pudieron obtener las notificaciones');
    }
  }

  /**
   * Marca una notificación como leída
   */
  static async markNotificationAsRead(id: number, userId: number) {
    try {
      const notification = await prisma.notification.update({
        where: {
          id,
          userId // Asegurar que la notificación pertenece al usuario
        },
        data: {
          status: NotificationStatus.READ,
          isRead: true,
          readAt: new Date()
        }
      });

      return notification;
    } catch (error) {
      ServerLogger.error(`Error al marcar notificación ${id} como leída`, error);
      throw new Error('No se pudo marcar la notificación como leída');
    }
  }

  /**
   * Marca todas las notificaciones de un usuario como leídas
   */
  static async markAllNotificationsAsRead(userId: number) {
    try {
      await prisma.notification.updateMany({
        where: {
          userId,
          status: NotificationStatus.UNREAD
        },
        data: {
          status: NotificationStatus.READ,
          isRead: true,
          readAt: new Date()
        }
      });

      return { success: true };
    } catch (error) {
      ServerLogger.error(`Error al marcar todas las notificaciones como leídas para el usuario ${userId}`, error);
      throw new Error('No se pudieron marcar las notificaciones como leídas');
    }
  }

  /**
   * Obtiene categorías de anuncios
   */
  static async getAnnouncementCategories() {
    try {
      const categories = await prisma.announcementCategory.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' }
      });

      return categories;
    } catch (error) {
      ServerLogger.error('Error al obtener categorías de anuncios', error);
      throw new Error('No se pudieron obtener las categorías');
    }
  }

  /**
   * Crea una categoría de anuncios
   */
  static async createAnnouncementCategory(data: {
    name: string;
    description?: string;
    color?: string;
    icon?: string;
    isDefault?: boolean;
  }, userId: number) {
    try {
      // Si esta categoría será la predeterminada, quitar ese estado de otras categorías
      if (data.isDefault) {
        await prisma.announcementCategory.updateMany({
          where: { isDefault: true },
          data: { isDefault: false }
        });
      }

      const category = await prisma.announcementCategory.create({
        data: {
          name: data.name,
          description: data.description,
          color: data.color || '#3B82F6',
          icon: data.icon || 'announcement',
          isDefault: data.isDefault || false
        }
      });

      // Registrar actividad
      await ActivityLogger.log({
        action: 'announcement.category.create',
        userId,
        entityType: 'announcementCategory',
        entityId: category.id,
        details: { name: category.name }
      });

      return category;
    } catch (error) {
      ServerLogger.error('Error al crear categoría de anuncios', error);
      throw new Error('No se pudo crear la categoría');
    }
  }

  /**
   * Actualiza una categoría de anuncios
   */
  static async updateAnnouncementCategory(id: number, data: {
    name?: string;
    description?: string;
    color?: string;
    icon?: string;
    isDefault?: boolean;
    isActive?: boolean;
  }, userId: number) {
    try {
      // Si esta categoría será la predeterminada, quitar ese estado de otras categorías
      if (data.isDefault) {
        await prisma.announcementCategory.updateMany({
          where: { 
            isDefault: true,
            id: { not: id }
          },
          data: { isDefault: false }
        });
      }

      const category = await prisma.announcementCategory.update({
        where: { id },
        data: {
          ...(data.name && { name: data.name }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.color && { color: data.color }),
          ...(data.icon && { icon: data.icon }),
          ...(data.isDefault !== undefined && { isDefault: data.isDefault }),
          ...(data.isActive !== undefined && { isActive: data.isActive }),
          updatedAt: new Date()
        }
      });

      // Registrar actividad
      await ActivityLogger.log({
        action: 'announcement.category.update',
        userId,
        entityType: 'announcementCategory',
        entityId: id,
        details: { name: category.name }
      });

      return category;
    } catch (error) {
      ServerLogger.error(`Error al actualizar categoría de anuncios ${id}`, error);
      throw new Error('No se pudo actualizar la categoría');
    }
  }

  /**
   * Obtiene estadísticas de anuncios
   */
  static async getAnnouncementStats(dateFrom?: Date, dateTo?: Date) {
    try {
      const now = new Date();
      const fromDate = dateFrom || new Date(now.setMonth(now.getMonth() - 1));
      const toDate = dateTo || new Date();

      // Total de anuncios publicados en el período
      const totalPublished = await prisma.announcement.count({
        where: {
          status: AnnouncementStatus.PUBLISHED,
          publishDate: {
            gte: fromDate,
            lte: toDate
          }
        }
      });

      // Total de vistas en el período
      const viewsData = await prisma.announcement.aggregate({
        where: {
          status: AnnouncementStatus.PUBLISHED,
          publishDate: {
            gte: fromDate,
            lte: toDate
          }
        },
        _sum: {
          views: true
        }
      });

      // Total de comentarios en el período
      const totalComments = await prisma.announcementComment.count({
        where: {
          createdAt: {
            gte: fromDate,
            lte: toDate
          }
        }
      });

      // Anuncios por categoría
      const byCategory = await prisma.announcement.groupBy({
        by: ['categoryId'],
        where: {
          status: AnnouncementStatus.PUBLISHED,
          publishDate: {
            gte: fromDate,
            lte: toDate
          }
        },
        _count: true
      });

      // Obtener nombres de categorías
      const categories = await prisma.announcementCategory.findMany({
        where: {
          id: {
            in: byCategory.map(item => item.categoryId)
          }
        },
        select: {
          id: true,
          name: true
        }
      });

      // Mapear IDs a nombres
      const categoryMap = new Map(categories.map(cat => [cat.id, cat.name]));
      const announcementsByCategory = byCategory.map(item => ({
        categoryId: item.categoryId,
        categoryName: categoryMap.get(item.categoryId) || 'Desconocida',
        count: item._count
      }));

      // Anuncios más vistos
      const topAnnouncements = await prisma.announcement.findMany({
        where: {
          status: AnnouncementStatus.PUBLISHED,
          publishDate: {
            gte: fromDate,
            lte: toDate
          }
        },
        select: {
          id: true,
          title: true,
          views: true,
          publishDate: true,
          _count: {
            select: {
              comments: true,
              readBy: true
            }
          }
        },
        orderBy: {
          views: 'desc'
        },
        take: 5
      });

      return {
        totalPublished,
        totalViews: viewsData._sum.views || 0,
        totalComments,
        announcementsByCategory,
        topAnnouncements,
        period: {
          from: fromDate,
          to: toDate
        }
      };
    } catch (error) {
      ServerLogger.error('Error al obtener estadísticas de anuncios', error);
      throw new Error('No se pudieron obtener las estadísticas');
    }
  }

  /**
   * Método privado para notificar a usuarios sobre un nuevo anuncio
   */
  private static async notifyUsersAboutAnnouncement(announcement: any) {
    try {
      // Implementación simplificada - en producción se buscarían los usuarios según roles y unidades
      // y se enviarían notificaciones según sus preferencias
      
      // Ejemplo: Notificar a administradores sobre anuncios importantes
      if (announcement.isImportant) {
        // Buscar usuarios con rol de administrador
        const adminUsers = await prisma.user.findMany({
          where: {
            roles: {
              hasSome: ['ADMIN']
            }
          },
          select: {
            id: true
          }
        });
        
        // Enviar notificaciones
        for (const user of adminUsers) {
          await this.createNotification({
            userId: user.id,
            title: 'Nuevo anuncio importante',
            content: `Se ha publicado un anuncio importante: "${announcement.title}"`,
            type: NotificationType.ANNOUNCEMENT,
            relatedEntityType: 'announcement',
            relatedEntityId: announcement.id,
            actionUrl: `/announcements/${announcement.id}`
          });
        }
      }
      
      // En una implementación completa, aquí se enviarían notificaciones a todos los usuarios
      // según sus roles, unidades y preferencias de notificación
      
    } catch (error) {
      ServerLogger.error('Error al enviar notificaciones sobre anuncio', error);
      // No lanzamos error para no interrumpir el flujo principal
    }
  }

  /**
   * Método privado para notificar a usuarios sobre actualización de un anuncio
   */
  private static async notifyUsersAboutAnnouncementUpdate(announcement: any) {
    try {
      // Buscar usuarios que ya han leído el anuncio
      const readers = await prisma.announcementRead.findMany({
        where: {
          announcementId: announcement.id
        },
        select: {
          userId: true
        }
      });
      
      // Enviar notificaciones a los usuarios que ya lo habían leído
      for (const reader of readers) {
        await this.createNotification({
          userId: reader.userId,
          title: 'Anuncio actualizado',
          content: `El anuncio "${announcement.title}" ha sido actualizado`,
          type: NotificationType.ANNOUNCEMENT,
          relatedEntityType: 'announcement',
          relatedEntityId: announcement.id,
          actionUrl: `/announcements/${announcement.id}`
        });
      }
      
    } catch (error) {
      ServerLogger.error('Error al enviar notificaciones sobre actualización de anuncio', error);
      // No lanzamos error para no interrumpir el flujo principal
    }
  }
}
