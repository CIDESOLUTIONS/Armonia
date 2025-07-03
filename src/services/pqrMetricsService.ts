/**
 * Servicio para la generación de métricas y análisis del sistema PQR
 * 
 * Este servicio implementa la lógica para generar métricas, indicadores
 * y análisis de rendimiento del sistema PQR.
 */

import { PrismaClient, PQRStatus, PQRPriority, PQRCategory } from '@prisma/client';
import { getSchemaFromRequest } from '../../lib/prisma';

// Interfaces para métricas
interface SummaryMetrics {
  totalCount: number;
  openCount: number;
  inProgressCount: number;
  resolvedCount: number;
  closedCount: number;
  averageResponseTime: number;
  averageResolutionTime: number;
  slaComplianceRate: number;
  satisfactionRate: number;
}

interface CategoryDistribution {
  category: string;
  count: number;
  percentage: number;
}

interface PriorityDistribution {
  priority: string;
  count: number;
  percentage: number;
}

interface StatusDistribution {
  status: string;
  count: number;
  percentage: number;
}

interface TimeTrend {
  period: string;
  count: number;
  resolvedCount: number;
  averageResolutionTime: number;
}

interface SLAMetrics {
  compliantCount: number;
  nonCompliantCount: number;
  complianceRate: number;
  averageDeviationTime: number;
}

interface AssigneeMetrics {
  assigneeId: number;
  assigneeName: string;
  totalAssigned: number;
  resolvedCount: number;
  averageResolutionTime: number;
  slaComplianceRate: number;
}

interface RecentActivity {
  date: Date;
  action: string;
  pqrId: number;
  ticketNumber: string;
  title: string;
}

interface DashboardMetrics {
  summary: SummaryMetrics;
  categoryDistribution: CategoryDistribution[];
  priorityDistribution: PriorityDistribution[];
  statusDistribution: StatusDistribution[];
  timeTrend: TimeTrend[];
  slaMetrics: SLAMetrics;
  topAssignees: AssigneeMetrics[];
  recentActivity: RecentActivity[];
}

interface MetricsFilter {
  startDate?: Date;
  endDate?: Date;
  category?: string;
  priority?: string;
  status?: string;
  assigneeId?: number;
  complexId?: number;
}

/**
 * Clase que implementa el servicio de métricas para PQRs
 */
export class PQRMetricsService {
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
   * Genera todas las métricas para el dashboard
   * @param filter Filtros opcionales para las métricas
   * @returns Objeto con todas las métricas del dashboard
   */
  async generateDashboardMetrics(filter?: MetricsFilter): Promise<DashboardMetrics> {
    try {
      // Ejecutar todas las consultas en paralelo para optimizar rendimiento
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
        this.getSummaryMetrics(filter),
        this.getCategoryDistribution(filter),
        this.getPriorityDistribution(filter),
        this.getStatusDistribution(filter),
        this.getTimeTrend(filter),
        this.getSLAMetrics(filter),
        this.getTopAssignees(filter),
        this.getRecentActivity(filter)
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
   * Obtiene métricas de resumen general
   * @param filter Filtros opcionales
   * @returns Métricas de resumen
   */
  async getSummaryMetrics(filter?: MetricsFilter): Promise<SummaryMetrics> {
    try {
      // Construir condiciones de filtro
      const whereConditions = this.buildWhereConditions(filter);

      // Obtener conteos por estado
      const totalCount = await this.prisma.pQR.count({ where: whereConditions });
      
      const openCount = await this.prisma.pQR.count({
        where: {
          ...whereConditions,
          status: PQRStatus.OPEN
        }
      });
      
      const inProgressCount = await this.prisma.pQR.count({
        where: {
          ...whereConditions,
          status: PQRStatus.IN_PROGRESS
        }
      });
      
      const resolvedCount = await this.prisma.pQR.count({
        where: {
          ...whereConditions,
          status: PQRStatus.RESOLVED
        }
      });
      
      const closedCount = await this.prisma.pQR.count({
        where: {
          ...whereConditions,
          status: PQRStatus.CLOSED
        }
      });

      // Calcular tiempos promedio
      const timeMetrics = await this.prisma.$queryRaw`
        SELECT 
          AVG(EXTRACT(EPOCH FROM (assigned_at - created_at)) / 3600) as "avgResponseTime",
          AVG(EXTRACT(EPOCH FROM (resolved_at - assigned_at)) / 3600) as "avgResolutionTime",
          COUNT(*) FILTER (WHERE resolved_at <= due_date) * 100.0 / NULLIF(COUNT(*), 0) as "slaComplianceRate"
        FROM pqr
        WHERE ${this.buildRawWhereConditions(filter)}
        AND assigned_at IS NOT NULL
        AND (resolved_at IS NOT NULL OR status = 'RESOLVED')
      `;

      // Calcular satisfacción promedio
      const satisfactionMetrics = await this.prisma.$queryRaw`
        SELECT AVG(satisfaction_rating) as "avgSatisfaction"
        FROM pqr_satisfaction_survey
        WHERE ${this.buildRawWhereConditions(filter, 'pqr_id')}
        AND satisfaction_rating IS NOT NULL
      `;

      return {
        totalCount,
        openCount,
        inProgressCount,
        resolvedCount,
        closedCount,
        averageResponseTime: timeMetrics[0]?.avgResponseTime || 0,
        averageResolutionTime: timeMetrics[0]?.avgResolutionTime || 0,
        slaComplianceRate: timeMetrics[0]?.slaComplianceRate || 0,
        satisfactionRate: satisfactionMetrics[0]?.avgSatisfaction || 0
      };
    } catch (error) {
      console.error('Error al obtener métricas de resumen:', error);
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
   * Obtiene distribución por categoría
   * @param filter Filtros opcionales
   * @returns Distribución por categoría
   */
  async getCategoryDistribution(filter?: MetricsFilter): Promise<CategoryDistribution[]> {
    try {
      // Construir condiciones de filtro
      const whereConditions = this.buildWhereConditions(filter);

      // Obtener conteo total para calcular porcentajes
      const totalCount = await this.prisma.pQR.count({ where: whereConditions });

      if (totalCount === 0) {
        return [];
      }

      // Agrupar por categoría
      const distribution = await this.prisma.pQR.groupBy({
        by: ['category'],
        where: whereConditions,
        _count: {
          category: true
        }
      });

      // Formatear resultados
      return distribution.map(item => ({
        category: item.category,
        count: item._count.category,
        percentage: parseFloat(((item._count.category * 100) / totalCount).toFixed(2))
      }));
    } catch (error) {
      console.error('Error al obtener distribución por categoría:', error);
      return [];
    }
  }

  /**
   * Obtiene distribución por prioridad
   * @param filter Filtros opcionales
   * @returns Distribución por prioridad
   */
  async getPriorityDistribution(filter?: MetricsFilter): Promise<PriorityDistribution[]> {
    try {
      // Construir condiciones de filtro
      const whereConditions = this.buildWhereConditions(filter);

      // Obtener conteo total para calcular porcentajes
      const totalCount = await this.prisma.pQR.count({ where: whereConditions });

      if (totalCount === 0) {
        return [];
      }

      // Agrupar por prioridad
      const distribution = await this.prisma.pQR.groupBy({
        by: ['priority'],
        where: whereConditions,
        _count: {
          priority: true
        }
      });

      // Formatear resultados
      return distribution.map(item => ({
        priority: item.priority,
        count: item._count.priority,
        percentage: parseFloat(((item._count.priority * 100) / totalCount).toFixed(2))
      }));
    } catch (error) {
      console.error('Error al obtener distribución por prioridad:', error);
      return [];
    }
  }

  /**
   * Obtiene distribución por estado
   * @param filter Filtros opcionales
   * @returns Distribución por estado
   */
  async getStatusDistribution(filter?: MetricsFilter): Promise<StatusDistribution[]> {
    try {
      // Construir condiciones de filtro
      const whereConditions = this.buildWhereConditions(filter);

      // Obtener conteo total para calcular porcentajes
      const totalCount = await this.prisma.pQR.count({ where: whereConditions });

      if (totalCount === 0) {
        return [];
      }

      // Agrupar por estado
      const distribution = await this.prisma.pQR.groupBy({
        by: ['status'],
        where: whereConditions,
        _count: {
          status: true
        }
      });

      // Formatear resultados
      return distribution.map(item => ({
        status: item.status,
        count: item._count.status,
        percentage: parseFloat(((item._count.status * 100) / totalCount).toFixed(2))
      }));
    } catch (error) {
      console.error('Error al obtener distribución por estado:', error);
      return [];
    }
  }

  /**
   * Obtiene tendencia temporal de PQRs
   * @param filter Filtros opcionales
   * @returns Tendencia temporal
   */
  async getTimeTrend(filter?: MetricsFilter): Promise<TimeTrend[]> {
    try {
      // Determinar período de análisis
      const startDate = filter?.startDate || new Date(new Date().setMonth(new Date().getMonth() - 6));
      const endDate = filter?.endDate || new Date();

      // Consulta SQL para obtener tendencia por mes
      const trend = await this.prisma.$queryRaw`
        SELECT 
          TO_CHAR(created_at, 'YYYY-MM') as period,
          COUNT(*) as count,
          COUNT(*) FILTER (WHERE status = 'RESOLVED' OR status = 'CLOSED') as resolved_count,
          AVG(EXTRACT(EPOCH FROM (resolved_at - assigned_at)) / 3600) FILTER (WHERE resolved_at IS NOT NULL) as avg_resolution_time
        FROM pqr
        WHERE ${this.buildRawWhereConditions(filter)}
        AND created_at >= ${startDate}
        AND created_at <= ${endDate}
        GROUP BY TO_CHAR(created_at, 'YYYY-MM')
        ORDER BY period ASC
      `;

      // Formatear resultados
      return (trend as any[]).map(item => ({
        period: item.period,
        count: parseInt(item.count),
        resolvedCount: parseInt(item.resolved_count || 0),
        averageResolutionTime: parseFloat(item.avg_resolution_time || 0)
      }));
    } catch (error) {
      console.error('Error al obtener tendencia temporal:', error);
      return [];
    }
  }

  /**
   * Obtiene métricas de cumplimiento de SLA
   * @param filter Filtros opcionales
   * @returns Métricas de SLA
   */
  async getSLAMetrics(filter?: MetricsFilter): Promise<SLAMetrics> {
    try {
      // Construir condiciones de filtro
      const whereConditions = this.buildWhereConditions(filter);

      // Obtener PQRs resueltos o cerrados
      const resolvedPQRs = await this.prisma.pQR.findMany({
        where: {
          ...whereConditions,
          status: {
            in: [PQRStatus.RESOLVED, PQRStatus.CLOSED]
          },
          resolvedAt: {
            not: null
          },
          dueDate: {
            not: null
          }
        },
        select: {
          id: true,
          resolvedAt: true,
          dueDate: true
        }
      });

      if (resolvedPQRs.length === 0) {
        return {
          compliantCount: 0,
          nonCompliantCount: 0,
          complianceRate: 0,
          averageDeviationTime: 0
        };
      }

      // Calcular métricas de SLA
      let compliantCount = 0;
      let totalDeviationHours = 0;

      for (const pqr of resolvedPQRs) {
        const resolvedAt = new Date(pqr.resolvedAt!);
        const dueDate = new Date(pqr.dueDate!);
        
        if (resolvedAt <= dueDate) {
          compliantCount++;
        } else {
          // Calcular desviación en horas
          const deviationMs = resolvedAt.getTime() - dueDate.getTime();
          const deviationHours = deviationMs / (1000 * 60 * 60);
          totalDeviationHours += deviationHours;
        }
      }

      const nonCompliantCount = resolvedPQRs.length - compliantCount;
      const complianceRate = (compliantCount * 100) / resolvedPQRs.length;
      const averageDeviationTime = nonCompliantCount > 0 ? totalDeviationHours / nonCompliantCount : 0;

      return {
        compliantCount,
        nonCompliantCount,
        complianceRate: parseFloat(complianceRate.toFixed(2)),
        averageDeviationTime: parseFloat(averageDeviationTime.toFixed(2))
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
   * @param filter Filtros opcionales
   * @param limit Límite de resultados
   * @returns Métricas de asignados
   */
  async getTopAssignees(filter?: MetricsFilter, limit: number = 5): Promise<AssigneeMetrics[]> {
    try {
      // Construir condiciones de filtro
      const whereConditions = this.buildWhereConditions(filter);

      // Obtener usuarios con PQRs asignados
      const assignees = await this.prisma.user.findMany({
        where: {
          role: 'STAFF',
          assignedPQRs: {
            some: whereConditions
          }
        },
        select: {
          id: true,
          name: true,
          _count: {
            select: {
              assignedPQRs: true
            }
          }
        },
        orderBy: {
          assignedPQRs: {
            _count: 'desc'
          }
        },
        take: limit
      });

      // Obtener métricas detalladas para cada asignado
      const assigneeMetrics = await Promise.all(
        assignees.map(async (assignee) => {
          // Contar PQRs resueltos
          const resolvedCount = await this.prisma.pQR.count({
            where: {
              ...whereConditions,
              assignedToId: assignee.id,
              status: {
                in: [PQRStatus.RESOLVED, PQRStatus.CLOSED]
              }
            }
          });

          // Calcular tiempo promedio de resolución
          const timeMetrics = await this.prisma.$queryRaw`
            SELECT 
              AVG(EXTRACT(EPOCH FROM (resolved_at - assigned_at)) / 3600) as "avgResolutionTime",
              COUNT(*) FILTER (WHERE resolved_at <= due_date) * 100.0 / NULLIF(COUNT(*), 0) as "slaComplianceRate"
            FROM pqr
            WHERE ${this.buildRawWhereConditions(filter)}
            AND assigned_to_id = ${assignee.id}
            AND resolved_at IS NOT NULL
          `;

          return {
            assigneeId: assignee.id,
            assigneeName: assignee.name,
            totalAssigned: assignee._count.assignedPQRs,
            resolvedCount,
            averageResolutionTime: parseFloat((timeMetrics[0]?.avgResolutionTime || 0).toFixed(2)),
            slaComplianceRate: parseFloat((timeMetrics[0]?.slaComplianceRate || 0).toFixed(2))
          };
        })
      );

      return assigneeMetrics;
    } catch (error) {
      console.error('Error al obtener métricas de asignados:', error);
      return [];
    }
  }

  /**
   * Obtiene actividad reciente de PQRs
   * @param filter Filtros opcionales
   * @param limit Límite de resultados
   * @returns Actividad reciente
   */
  async getRecentActivity(filter?: MetricsFilter, limit: number = 10): Promise<RecentActivity[]> {
    try {
      // Construir condiciones de filtro
      const whereConditions = this.buildWhereConditions(filter);

      // Obtener historial de estados reciente
      const statusHistory = await this.prisma.pQRStatusHistory.findMany({
        where: {
          pqr: whereConditions
        },
        include: {
          pqr: {
            select: {
              id: true,
              ticketNumber: true,
              title: true
            }
          }
        },
        orderBy: {
          changedAt: 'desc'
        },
        take: limit
      });

      // Formatear resultados
      return statusHistory.map(history => ({
        date: history.changedAt,
        action: `Cambio de estado: ${history.previousStatus || 'NUEVO'} → ${history.status}`,
        pqrId: history.pqrId,
        ticketNumber: history.pqr.ticketNumber,
        title: history.pqr.title
      }));
    } catch (error) {
      console.error('Error al obtener actividad reciente:', error);
      return [];
    }
  }

  /**
   * Construye condiciones WHERE para consultas Prisma
   * @param filter Filtros opcionales
   * @returns Condiciones WHERE
   */
  private buildWhereConditions(filter?: MetricsFilter): any {
    if (!filter) {
      return {};
    }

    const conditions: any = {};

    if (filter.startDate) {
      conditions.createdAt = {
        ...conditions.createdAt,
        gte: filter.startDate
      };
    }

    if (filter.endDate) {
      conditions.createdAt = {
        ...conditions.createdAt,
        lte: filter.endDate
      };
    }

    if (filter.category) {
      conditions.category = filter.category;
    }

    if (filter.priority) {
      conditions.priority = filter.priority;
    }

    if (filter.status) {
      conditions.status = filter.status;
    }

    if (filter.assigneeId) {
      conditions.assignedToId = filter.assigneeId;
    }

    if (filter.complexId) {
      conditions.complexId = filter.complexId;
    }

    return conditions;
  }

  /**
   * Construye condiciones WHERE para consultas SQL raw
   * @param filter Filtros opcionales
   * @param idField Nombre del campo ID (para joins)
   * @returns Condiciones WHERE en formato SQL
   */
  private buildRawWhereConditions(filter?: MetricsFilter, idField: string = 'id'): any {
    const conditions = ['1=1']; // Siempre verdadero como base

    if (!filter) {
      return this.prisma.$raw`1=1`;
    }

    if (filter.startDate) {
      conditions.push(`created_at >= '${filter.startDate.toISOString()}'`);
    }

    if (filter.endDate) {
      conditions.push(`created_at <= '${filter.endDate.toISOString()}'`);
    }

    if (filter.category) {
      conditions.push(`category = '${filter.category}'`);
    }

    if (filter.priority) {
      conditions.push(`priority = '${filter.priority}'`);
    }

    if (filter.status) {
      conditions.push(`status = '${filter.status}'`);
    }

    if (filter.assigneeId) {
      conditions.push(`assigned_to_id = ${filter.assigneeId}`);
    }

    if (filter.complexId) {
      conditions.push(`complex_id = ${filter.complexId}`);
    }

    return this.prisma.$raw`${conditions.join(' AND ')}`;
  }
}
