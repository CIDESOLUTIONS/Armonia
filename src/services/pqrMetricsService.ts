/**
 * Servicio para la generación de métricas y KPIs del sistema PQR
 * 
 * Este servicio implementa la lógica para calcular y generar métricas
 * e indicadores clave de rendimiento para el dashboard del sistema PQR.
 */

import { PrismaClient, PQRStatus, PQRCategory, PQRPriority } from '@prisma/client';
import { getSchemaFromRequest } from '@/lib/prisma';

// Interfaz para filtros de métricas
export interface PQRMetricsFilter {
  startDate?: Date;
  endDate?: Date;
  category?: PQRCategory;
  priority?: PQRPriority;
  status?: PQRStatus;
  assignedToId?: number;
  assignedTeamId?: number;
}

// Interfaz para resumen de métricas
export interface PQRMetricsSummary {
  totalCount: number;
  openCount: number;
  inProgressCount: number;
  resolvedCount: number;
  closedCount: number;
  averageResponseTime: number; // en minutos
  averageResolutionTime: number; // en minutos
  slaComplianceRate: number; // porcentaje
  satisfactionRate: number; // promedio de 1-5
}

// Interfaz para distribución por categoría
export interface CategoryDistribution {
  category: string;
  count: number;
  percentage: number;
}

// Interfaz para distribución por prioridad
export interface PriorityDistribution {
  priority: string;
  count: number;
  percentage: number;
}

// Interfaz para tendencia temporal
export interface TimeTrend {
  period: string;
  count: number;
  resolvedCount: number;
  averageResolutionTime: number;
}

// Interfaz para métricas de SLA
export interface SLAMetrics {
  compliantCount: number;
  nonCompliantCount: number;
  complianceRate: number;
  averageDeviationTime: number; // en minutos (positivo = antes de vencer, negativo = después de vencer)
}

// Interfaz para métricas de asignación
export interface AssignmentMetrics {
  assigneeId: number;
  assigneeName: string;
  totalAssigned: number;
  resolvedCount: number;
  averageResolutionTime: number;
  slaComplianceRate: number;
}

// Interfaz para métricas completas del dashboard
export interface PQRDashboardMetrics {
  summary: PQRMetricsSummary;
  categoryDistribution: CategoryDistribution[];
  priorityDistribution: PriorityDistribution[];
  statusDistribution: { status: string; count: number; percentage: number }[];
  timeTrend: TimeTrend[];
  slaMetrics: SLAMetrics;
  topAssignees: AssignmentMetrics[];
  recentActivity: {
    date: Date;
    action: string;
    pqrId: number;
    ticketNumber: string;
    title: string;
  }[];
}

/**
 * Clase principal del servicio de métricas de PQR
 */
export class PQRMetricsService {
  private prisma: PrismaClient;
  private schema: string;

  constructor(schema: string) {
    this.prisma = new PrismaClient();
    this.schema = schema;
  }

  /**
   * Genera métricas completas para el dashboard de PQR
   */
  async generateDashboardMetrics(filter: PQRMetricsFilter = {}): Promise<PQRDashboardMetrics> {
    try {
      // Construir filtro base para consultas
      const baseFilter = this.buildBaseFilter(filter);
      
      // Obtener datos en paralelo para optimizar rendimiento
      const [
        summary,
        categoryDistribution,
        priorityDistribution,
        statusDistribution,
        timeTrend,
        slaMetrics,
        topAssignees,
        recentActivity
      ] = await Promise.all([
        this.getSummaryMetrics(baseFilter),
        this.getCategoryDistribution(baseFilter),
        this.getPriorityDistribution(baseFilter),
        this.getStatusDistribution(baseFilter),
        this.getTimeTrend(baseFilter),
        this.getSLAMetrics(baseFilter),
        this.getTopAssignees(baseFilter),
        this.getRecentActivity(baseFilter)
      ]);
      
      return {
        summary,
        categoryDistribution,
        priorityDistribution,
        statusDistribution,
        timeTrend,
        slaMetrics,
        topAssignees,
        recentActivity
      };
    } catch (error) {
      console.error('Error al generar métricas del dashboard:', error);
      throw error;
    }
  }

  /**
   * Genera métricas de resumen para el sistema PQR
   */
  async getSummaryMetrics(baseFilter: any = {}): Promise<PQRMetricsSummary> {
    try {
      // Contar PQRs por estado
      const statusCounts = await this.prisma.pQR.groupBy({
        by: ['status'],
        _count: {
          id: true
        },
        where: baseFilter
      });
      
      // Calcular conteos por estado
      const totalCount = statusCounts.reduce((sum, item) => sum + item._count.id, 0);
      const openCount = statusCounts.find(item => item.status === 'OPEN')?._count.id || 0;
      const inProgressCount = statusCounts.find(item => item.status === 'IN_PROGRESS')?._count.id || 0;
      const resolvedCount = statusCounts.find(item => item.status === 'RESOLVED')?._count.id || 0;
      const closedCount = statusCounts.find(item => item.status === 'CLOSED')?._count.id || 0;
      
      // Calcular tiempos promedio
      const resolvedPQRs = await this.prisma.pQR.findMany({
        where: {
          ...baseFilter,
          status: {
            in: ['RESOLVED', 'CLOSED']
          },
          resolvedAt: {
            not: null
          },
          submittedAt: {
            not: null
          }
        },
        select: {
          submittedAt: true,
          assignedAt: true,
          resolvedAt: true,
          satisfactionRating: true
        }
      });
      
      // Calcular tiempo de respuesta (desde envío hasta asignación)
      let totalResponseTime = 0;
      let responsePQRCount = 0;
      
      // Calcular tiempo de resolución (desde envío hasta resolución)
      let totalResolutionTime = 0;
      let resolutionPQRCount = 0;
      
      // Calcular satisfacción promedio
      let totalSatisfaction = 0;
      let satisfactionCount = 0;
      
      for (const pqr of resolvedPQRs) {
        // Tiempo de respuesta
        if (pqr.assignedAt && pqr.submittedAt) {
          const responseTime = (pqr.assignedAt.getTime() - pqr.submittedAt.getTime()) / (1000 * 60); // en minutos
          totalResponseTime += responseTime;
          responsePQRCount++;
        }
        
        // Tiempo de resolución
        if (pqr.resolvedAt && pqr.submittedAt) {
          const resolutionTime = (pqr.resolvedAt.getTime() - pqr.submittedAt.getTime()) / (1000 * 60); // en minutos
          totalResolutionTime += resolutionTime;
          resolutionPQRCount++;
        }
        
        // Satisfacción
        if (pqr.satisfactionRating) {
          totalSatisfaction += pqr.satisfactionRating;
          satisfactionCount++;
        }
      }
      
      // Calcular promedios
      const averageResponseTime = responsePQRCount > 0 ? totalResponseTime / responsePQRCount : 0;
      const averageResolutionTime = resolutionPQRCount > 0 ? totalResolutionTime / resolutionPQRCount : 0;
      const satisfactionRate = satisfactionCount > 0 ? totalSatisfaction / satisfactionCount : 0;
      
      // Calcular cumplimiento de SLA
      const slaMetrics = await this.getSLAMetrics(baseFilter);
      
      return {
        totalCount,
        openCount,
        inProgressCount,
        resolvedCount,
        closedCount,
        averageResponseTime,
        averageResolutionTime,
        slaComplianceRate: slaMetrics.complianceRate,
        satisfactionRate
      };
    } catch (error) {
      console.error('Error al generar métricas de resumen:', error);
      return {
        totalCount: 0,
        openCount: 0,
        inProgressCount: 0,
        resolvedCount: 0,
        closedCount: 0,
        averageResponseTime: 0,
        averageResolutionTime: 0,
        slaComplianceRate: 0,
        satisfactionRate: 0
      };
    }
  }

  /**
   * Obtiene la distribución de PQRs por categoría
   */
  async getCategoryDistribution(baseFilter: any = {}): Promise<CategoryDistribution[]> {
    try {
      // Contar PQRs por categoría
      const categoryCounts = await this.prisma.pQR.groupBy({
        by: ['category'],
        _count: {
          id: true
        },
        where: baseFilter
      });
      
      // Calcular total para porcentajes
      const totalCount = categoryCounts.reduce((sum, item) => sum + item._count.id, 0);
      
      // Formatear resultados
      return categoryCounts.map(item => ({
        category: item.category,
        count: item._count.id,
        percentage: totalCount > 0 ? (item._count.id / totalCount) * 100 : 0
      }));
    } catch (error) {
      console.error('Error al obtener distribución por categoría:', error);
      return [];
    }
  }

  /**
   * Obtiene la distribución de PQRs por prioridad
   */
  async getPriorityDistribution(baseFilter: any = {}): Promise<PriorityDistribution[]> {
    try {
      // Contar PQRs por prioridad
      const priorityCounts = await this.prisma.pQR.groupBy({
        by: ['priority'],
        _count: {
          id: true
        },
        where: baseFilter
      });
      
      // Calcular total para porcentajes
      const totalCount = priorityCounts.reduce((sum, item) => sum + item._count.id, 0);
      
      // Formatear resultados
      return priorityCounts.map(item => ({
        priority: item.priority,
        count: item._count.id,
        percentage: totalCount > 0 ? (item._count.id / totalCount) * 100 : 0
      }));
    } catch (error) {
      console.error('Error al obtener distribución por prioridad:', error);
      return [];
    }
  }

  /**
   * Obtiene la distribución de PQRs por estado
   */
  async getStatusDistribution(baseFilter: any = {}): Promise<{ status: string; count: number; percentage: number }[]> {
    try {
      // Contar PQRs por estado
      const statusCounts = await this.prisma.pQR.groupBy({
        by: ['status'],
        _count: {
          id: true
        },
        where: baseFilter
      });
      
      // Calcular total para porcentajes
      const totalCount = statusCounts.reduce((sum, item) => sum + item._count.id, 0);
      
      // Formatear resultados
      return statusCounts.map(item => ({
        status: item.status,
        count: item._count.id,
        percentage: totalCount > 0 ? (item._count.id / totalCount) * 100 : 0
      }));
    } catch (error) {
      console.error('Error al obtener distribución por estado:', error);
      return [];
    }
  }

  /**
   * Obtiene la tendencia temporal de PQRs
   */
  async getTimeTrend(baseFilter: any = {}): Promise<TimeTrend[]> {
    try {
      // Determinar periodo de análisis
      const endDate = baseFilter.submittedAt?.lte || new Date();
      const startDate = baseFilter.submittedAt?.gte || new Date(endDate);
      startDate.setMonth(startDate.getMonth() - 6); // Por defecto, últimos 6 meses
      
      // Generar periodos mensuales
      const periods = [];
      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        periods.push({
          start: new Date(currentDate),
          end: new Date(currentDate.setMonth(currentDate.getMonth() + 1) - 1),
          label: `${currentDate.getFullYear()}-${String(currentDate.getMonth()).padStart(2, '0')}`
        });
        currentDate.setDate(1); // Reiniciar al primer día del mes
      }
      
      // Obtener datos para cada periodo
      const trendData = await Promise.all(periods.map(async period => {
        // Filtro para este periodo
        const periodFilter = {
          ...baseFilter,
          submittedAt: {
            gte: period.start,
            lte: period.end
          }
        };
        
        // Contar PQRs creados en este periodo
        const totalCount = await this.prisma.pQR.count({
          where: periodFilter
        });
        
        // Contar PQRs resueltos en este periodo
        const resolvedCount = await this.prisma.pQR.count({
          where: {
            ...periodFilter,
            status: {
              in: ['RESOLVED', 'CLOSED']
            }
          }
        });
        
        // Calcular tiempo promedio de resolución
        const resolvedPQRs = await this.prisma.pQR.findMany({
          where: {
            ...periodFilter,
            status: {
              in: ['RESOLVED', 'CLOSED']
            },
            resolvedAt: {
              not: null
            },
            submittedAt: {
              not: null
            }
          },
          select: {
            submittedAt: true,
            resolvedAt: true
          }
        });
        
        let totalResolutionTime = 0;
        for (const pqr of resolvedPQRs) {
          if (pqr.resolvedAt && pqr.submittedAt) {
            const resolutionTime = (pqr.resolvedAt.getTime() - pqr.submittedAt.getTime()) / (1000 * 60); // en minutos
            totalResolutionTime += resolutionTime;
          }
        }
        
        const averageResolutionTime = resolvedPQRs.length > 0 ? totalResolutionTime / resolvedPQRs.length : 0;
        
        return {
          period: period.label,
          count: totalCount,
          resolvedCount,
          averageResolutionTime
        };
      }));
      
      return trendData;
    } catch (error) {
      console.error('Error al obtener tendencia temporal:', error);
      return [];
    }
  }

  /**
   * Obtiene métricas de cumplimiento de SLA
   */
  async getSLAMetrics(baseFilter: any = {}): Promise<SLAMetrics> {
    try {
      // Obtener PQRs resueltos con información de SLA
      const resolvedPQRs = await this.prisma.pQR.findMany({
        where: {
          ...baseFilter,
          status: {
            in: ['RESOLVED', 'CLOSED']
          },
          resolvedAt: {
            not: null
          },
          dueDate: {
            not: null
          }
        },
        select: {
          resolvedAt: true,
          dueDate: true,
          slaBreached: true
        }
      });
      
      // Contar cumplimientos y no cumplimientos
      let compliantCount = 0;
      let nonCompliantCount = 0;
      let totalDeviationTime = 0;
      
      for (const pqr of resolvedPQRs) {
        // Si ya tiene el campo slaBreached, usarlo directamente
        if (pqr.slaBreached !== null && pqr.slaBreached !== undefined) {
          if (pqr.slaBreached) {
            nonCompliantCount++;
          } else {
            compliantCount++;
          }
        } 
        // Si no, calcularlo
        else if (pqr.resolvedAt && pqr.dueDate) {
          const deviationTime = (pqr.dueDate.getTime() - pqr.resolvedAt.getTime()) / (1000 * 60); // en minutos
          totalDeviationTime += deviationTime;
          
          if (pqr.resolvedAt <= pqr.dueDate) {
            compliantCount++;
          } else {
            nonCompliantCount++;
          }
        }
      }
      
      const totalCount = compliantCount + nonCompliantCount;
      const complianceRate = totalCount > 0 ? (compliantCount / totalCount) * 100 : 0;
      const averageDeviationTime = totalCount > 0 ? totalDeviationTime / totalCount : 0;
      
      return {
        compliantCount,
        nonCompliantCount,
        complianceRate,
        averageDeviationTime
      };
    } catch (error) {
      console.error('Error al obtener métricas de SLA:', error);
      return {
        compliantCount: 0,
        nonCompliantCount: 0,
        complianceRate: 0,
        averageDeviationTime: 0
      };
    }
  }

  /**
   * Obtiene métricas de los principales asignados
   */
  async getTopAssignees(baseFilter: any = {}): Promise<AssignmentMetrics[]> {
    try {
      // Obtener PQRs agrupados por asignado
      const assignedPQRs = await this.prisma.pQR.groupBy({
        by: ['assignedToId', 'assignedToName'],
        _count: {
          id: true
        },
        where: {
          ...baseFilter,
          assignedToId: {
            not: null
          }
        },
        orderBy: {
          _count: {
            id: 'desc'
          }
        },
        take: 10 // Top 10 asignados
      });
      
      // Obtener métricas detalladas para cada asignado
      const assigneeMetrics = await Promise.all(assignedPQRs.map(async assignee => {
        if (!assignee.assignedToId) return null;
        
        // Contar PQRs resueltos por este asignado
        const resolvedCount = await this.prisma.pQR.count({
          where: {
            ...baseFilter,
            assignedToId: assignee.assignedToId,
            status: {
              in: ['RESOLVED', 'CLOSED']
            }
          }
        });
        
        // Calcular tiempo promedio de resolución
        const resolvedPQRs = await this.prisma.pQR.findMany({
          where: {
            ...baseFilter,
            assignedToId: assignee.assignedToId,
            status: {
              in: ['RESOLVED', 'CLOSED']
            },
            assignedAt: {
              not: null
            },
            resolvedAt: {
              not: null
            }
          },
          select: {
            assignedAt: true,
            resolvedAt: true,
            dueDate: true,
            slaBreached: true
          }
        });
        
        let totalResolutionTime = 0;
        let slaCompliantCount = 0;
        
        for (const pqr of resolvedPQRs) {
          if (pqr.resolvedAt && pqr.assignedAt) {
            const resolutionTime = (pqr.resolvedAt.getTime() - pqr.assignedAt.getTime()) / (1000 * 60); // en minutos
            totalResolutionTime += resolutionTime;
          }
          
          // Verificar cumplimiento de SLA
          if (pqr.slaBreached === false || (pqr.dueDate && pqr.resolvedAt && pqr.resolvedAt <= pqr.dueDate)) {
            slaCompliantCount++;
          }
        }
        
        const averageResolutionTime = resolvedPQRs.length > 0 ? totalResolutionTime / resolvedPQRs.length : 0;
        const slaComplianceRate = resolvedPQRs.length > 0 ? (slaCompliantCount / resolvedPQRs.length) * 100 : 0;
        
        return {
          assigneeId: assignee.assignedToId,
          assigneeName: assignee.assignedToName || `Usuario ${assignee.assignedToId}`,
          totalAssigned: assignee._count.id,
          resolvedCount,
          averageResolutionTime,
          slaComplianceRate
        };
      }));
      
      // Filtrar valores nulos y ordenar por total asignado
      return assigneeMetrics
        .filter((metric): metric is AssignmentMetrics => metric !== null)
        .sort((a, b) => b.totalAssigned - a.totalAssigned);
    } catch (error) {
      console.error('Error al obtener métricas de asignados:', error);
      return [];
    }
  }

  /**
   * Obtiene actividad reciente en el sistema PQR
   */
  async getRecentActivity(baseFilter: any = {}): Promise<{ date: Date; action: string; pqrId: number; ticketNumber: string; title: string; }[]> {
    try {
      // Obtener cambios de estado recientes
      const recentStatusChanges = await this.prisma.pQRStatusHistory.findMany({
        where: baseFilter,
        orderBy: {
          changedAt: 'desc'
        },
        take: 10,
        include: {
          pqr: {
            select: {
              id: true,
              ticketNumber: true,
              title: true
            }
          }
        }
      });
      
      // Formatear resultados
      return recentStatusChanges.map(change => ({
        date: change.changedAt,
        action: `Cambio de estado: ${change.previousStatus || 'Nuevo'} → ${change.newStatus}`,
        pqrId: change.pqrId,
        ticketNumber: change.pqr.ticketNumber,
        title: change.pqr.title
      }));
    } catch (error) {
      console.error('Error al obtener actividad reciente:', error);
      return [];
    }
  }

  /**
   * Construye filtro base para consultas
   */
  private buildBaseFilter(filter: PQRMetricsFilter): any {
    const baseFilter: any = {};
    
    // Filtro por fecha
    if (filter.startDate || filter.endDate) {
      baseFilter.submittedAt = {};
      
      if (filter.startDate) {
        baseFilter.submittedAt.gte = filter.startDate;
      }
      
      if (filter.endDate) {
        baseFilter.submittedAt.lte = filter.endDate;
      }
    }
    
    // Filtros adicionales
    if (filter.category) {
      baseFilter.category = filter.category;
    }
    
    if (filter.priority) {
      baseFilter.priority = filter.priority;
    }
    
    if (filter.status) {
      baseFilter.status = filter.status;
    }
    
    if (filter.assignedToId) {
      baseFilter.assignedToId = filter.assignedToId;
    }
    
    if (filter.assignedTeamId) {
      baseFilter.assignedTeamId = filter.assignedTeamId;
    }
    
    return baseFilter;
  }
}

/**
 * Crea una instancia del servicio de métricas de PQR para el esquema especificado
 */
export function createPQRMetricsService(req: Request): PQRMetricsService {
  const schema = getSchemaFromRequest(req);
  return new PQRMetricsService(schema);
}
