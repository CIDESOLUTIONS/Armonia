/**
 * Servicio para la gestión de PQR en el sistema Armonía
 * 
 * Este archivo contiene las funciones necesarias para la integración
 * del sistema PQR con el resto de la aplicación.
 */

import { PrismaClient } from '@prisma/client';
import { getSchemaFromRequest } from '../../lib/prisma';
import { ActivityLogger } from '../../lib/logging/activity-logger';

/**
 * Clase que implementa el servicio de integración de PQR
 */
export class PQRService {
  private prisma: PrismaClient;
  private schema: string;

  /**
   * Constructor del servicio
   * @param schema Esquema de base de datos a utilizar
   */
  constructor(schema: string = 'public') {
    this.schema = schema;
    this.prisma = getSchemaFromRequest(schema);
  }

  /**
   * Obtiene un resumen de PQRs para el dashboard
   * @param complexId ID del conjunto residencial
   * @returns Resumen de PQRs
   */
  async getDashboardSummary(complexId: number) {
    try {
      // Obtener conteos por estado
      const [open, inProgress, resolved, closed] = await Promise.all([
        this.prisma.pQR.count({
          where: {
            complexId,
            status: 'OPEN'
          }
        }),
        this.prisma.pQR.count({
          where: {
            complexId,
            status: 'IN_PROGRESS'
          }
        }),
        this.prisma.pQR.count({
          where: {
            complexId,
            status: 'RESOLVED'
          }
        }),
        this.prisma.pQR.count({
          where: {
            complexId,
            status: 'CLOSED'
          }
        })
      ]);

      // Obtener PQRs recientes
      const recentPQRs = await this.prisma.pQR.findMany({
        where: {
          complexId
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 5,
        select: {
          id: true,
          ticketNumber: true,
          title: true,
          status: true,
          priority: true,
          createdAt: true,
          user: {
            select: {
              name: true
            }
          }
        }
      });

      // Obtener PQRs próximos a vencer
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const dueSoonPQRs = await this.prisma.pQR.findMany({
        where: {
          complexId,
          status: {
            in: ['OPEN', 'ASSIGNED', 'IN_PROGRESS']
          },
          dueDate: {
            gte: now,
            lte: tomorrow
          }
        },
        orderBy: {
          dueDate: 'asc'
        },
        take: 5,
        select: {
          id: true,
          ticketNumber: true,
          title: true,
          status: true,
          priority: true,
          dueDate: true,
          assignedTo: {
            select: {
              name: true
            }
          }
        }
      });

      return {
        counts: {
          open,
          inProgress,
          resolved,
          closed,
          total: open + inProgress + resolved + closed
        },
        recentPQRs,
        dueSoonPQRs
      };
    } catch (error) {
      console.error('Error al obtener resumen de PQRs:', error);
      throw error;
    }
  }

  /**
   * Integra el sistema PQR con el sistema de notificaciones
   * @param pqrId ID del PQR
   * @param event Tipo de evento
   * @param data Datos adicionales
   */
  async integrateWithNotifications(pqrId: number, event: string, data: any) {
    try {
      // Obtener información del PQR
      const pqr = await this.prisma.pQR.findUnique({
        where: { id: pqrId },
        include: {
          user: true,
          assignedTo: true
        }
      });

      if (!pqr) {
        throw new Error(`PQR con ID ${pqrId} no encontrado`);
      }

      // Registrar actividad
      await ActivityLogger.log({
        action: `PQR_${event}`,
        entityId: pqrId,
        entityType: 'PQR',
        userId: data.userId || pqr.userId,
        userName: data.userName || pqr.user?.name || 'Sistema',
        userRole: data.userRole || 'SYSTEM',
        details: {
          ticketNumber: pqr.ticketNumber,
          title: pqr.title,
          status: pqr.status,
          ...data
        }
      });

      // Crear notificación en el sistema
      await this.prisma.notification.create({
        data: {
          userId: pqr.userId,
          title: `PQR ${pqr.ticketNumber}: ${this.getEventTitle(event)}`,
          content: this.getEventContent(event, pqr, data),
          type: 'PQR',
          read: false,
          entityId: pqrId,
          entityType: 'PQR',
          createdAt: new Date()
        }
      });

      // Si hay un usuario asignado, también notificarle
      if (pqr.assignedToId && pqr.assignedToId !== data.userId) {
        await this.prisma.notification.create({
          data: {
            userId: pqr.assignedToId,
            title: `PQR ${pqr.ticketNumber}: ${this.getEventTitle(event)}`,
            content: this.getEventContent(event, pqr, data),
            type: 'PQR',
            read: false,
            entityId: pqrId,
            entityType: 'PQR',
            createdAt: new Date()
          }
        });
      }

      return true;
    } catch (error) {
      console.error('Error al integrar con notificaciones:', error);
      return false;
    }
  }

  /**
   * Obtiene el título para un evento de PQR
   * @param event Tipo de evento
   * @returns Título del evento
   */
  private getEventTitle(event: string): string {
    switch (event) {
      case 'CREATED':
        return 'Nuevo PQR creado';
      case 'ASSIGNED':
        return 'PQR asignado';
      case 'STATUS_CHANGED':
        return 'Cambio de estado';
      case 'COMMENT_ADDED':
        return 'Nuevo comentario';
      case 'RESOLVED':
        return 'PQR resuelto';
      case 'CLOSED':
        return 'PQR cerrado';
      case 'REOPENED':
        return 'PQR reabierto';
      default:
        return 'Actualización de PQR';
    }
  }

  /**
   * Obtiene el contenido para un evento de PQR
   * @param event Tipo de evento
   * @param pqr Datos del PQR
   * @param data Datos adicionales
   * @returns Contenido del evento
   */
  private getEventContent(event: string, pqr: any, data: any): string {
    switch (event) {
      case 'CREATED':
        return `Se ha creado un nuevo PQR con número de ticket ${pqr.ticketNumber}: ${pqr.title}`;
      case 'ASSIGNED':
        return `El PQR ${pqr.ticketNumber} ha sido asignado a ${pqr.assignedTo?.name || 'un técnico'}`;
      case 'STATUS_CHANGED':
        return `El estado del PQR ${pqr.ticketNumber} ha cambiado de ${data.previousStatus || 'NUEVO'} a ${pqr.status}`;
      case 'COMMENT_ADDED':
        return `Se ha añadido un nuevo comentario al PQR ${pqr.ticketNumber}: "${data.comment || ''}"`;
      case 'RESOLVED':
        return `El PQR ${pqr.ticketNumber} ha sido resuelto. ${data.comment ? `Resolución: ${data.comment}` : ''}`;
      case 'CLOSED':
        return `El PQR ${pqr.ticketNumber} ha sido cerrado.`;
      case 'REOPENED':
        return `El PQR ${pqr.ticketNumber} ha sido reabierto. ${data.comment ? `Motivo: ${data.comment}` : ''}`;
      default:
        return `El PQR ${pqr.ticketNumber} ha sido actualizado.`;
    }
  }

  /**
   * Integra el sistema PQR con el sistema de reportes
   * @param complexId ID del conjunto residencial
   * @param period Período del reporte (DAILY, WEEKLY, MONTHLY)
   * @returns Datos para el reporte
   */
  async generateReportData(complexId: number, period: string) {
    try {
      // Determinar fechas según período
      const endDate = new Date();
      const startDate = new Date();
      
      switch (period) {
        case 'DAILY':
          startDate.setDate(startDate.getDate() - 1);
          break;
        case 'WEEKLY':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'MONTHLY':
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        default:
          startDate.setMonth(startDate.getMonth() - 1);
      }

      // Obtener PQRs del período
      const pqrs = await this.prisma.pQR.findMany({
        where: {
          complexId,
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        },
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          },
          assignedTo: {
            select: {
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      // Calcular estadísticas
      const totalCount = pqrs.length;
      
      const statusCounts = {
        OPEN: 0,
        ASSIGNED: 0,
        IN_PROGRESS: 0,
        RESOLVED: 0,
        CLOSED: 0,
        REOPENED: 0
      };

      const categoryCounts: Record<string, number> = {};
      const priorityCounts: Record<string, number> = {};
      
      let resolvedOnTime = 0;
      let resolvedLate = 0;

      for (const pqr of pqrs) {
        // Contar por estado
        statusCounts[pqr.status as keyof typeof statusCounts]++;
        
        // Contar por categoría
        if (pqr.category) {
          categoryCounts[pqr.category] = (categoryCounts[pqr.category] || 0) + 1;
        }
        
        // Contar por prioridad
        if (pqr.priority) {
          priorityCounts[pqr.priority] = (priorityCounts[pqr.priority] || 0) + 1;
        }
        
        // Verificar cumplimiento de SLA
        if (pqr.status === 'RESOLVED' || pqr.status === 'CLOSED') {
          if (pqr.resolvedAt && pqr.dueDate) {
            if (new Date(pqr.resolvedAt) <= new Date(pqr.dueDate)) {
              resolvedOnTime++;
            } else {
              resolvedLate++;
            }
          }
        }
      }

      // Calcular tiempo promedio de resolución
      let totalResolutionTime = 0;
      let resolvedCount = 0;
      
      for (const pqr of pqrs) {
        if (pqr.resolvedAt && pqr.assignedAt) {
          const resolutionTime = new Date(pqr.resolvedAt).getTime() - new Date(pqr.assignedAt).getTime();
          totalResolutionTime += resolutionTime;
          resolvedCount++;
        }
      }
      
      const averageResolutionTime = resolvedCount > 0 ? totalResolutionTime / resolvedCount / (1000 * 60 * 60) : 0;

      return {
        period,
        startDate,
        endDate,
        totalCount,
        statusCounts,
        categoryCounts,
        priorityCounts,
        slaCompliance: {
          onTime: resolvedOnTime,
          late: resolvedLate,
          rate: resolvedCount > 0 ? (resolvedOnTime / resolvedCount) * 100 : 0
        },
        averageResolutionTime,
        pqrs
      };
    } catch (error) {
      console.error('Error al generar datos para reporte:', error);
      throw error;
    }
  }
}
