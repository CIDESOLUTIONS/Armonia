/**
 * Pruebas unitarias para el servicio de métricas de PQR
 */

import { PQRMetricsService } from '../pqrMetricsService';
import { PrismaClient, PQRCategory, PQRPriority, PQRStatus } from '@prisma/client';
import { getPrisma } from '@/lib/prisma';

// Mock de PrismaClient
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    $queryRaw: jest.fn(),
    pQR: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn()
    },
    pQRStatusHistory: {
      findMany: jest.fn()
    },
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn()
    }
  };
  
  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
    PQRCategory: {
      MAINTENANCE: 'MAINTENANCE',
      SECURITY: 'SECURITY',
      ADMINISTRATIVE: 'ADMINISTRATIVE',
      FINANCIAL: 'FINANCIAL',
      COMMUNITY: 'COMMUNITY',
      SERVICES: 'SERVICES',
      SUGGESTION: 'SUGGESTION',
      COMPLAINT: 'COMPLAINT',
      OTHER: 'OTHER'
    },
    PQRPriority: {
      LOW: 'LOW',
      MEDIUM: 'MEDIUM',
      HIGH: 'HIGH',
      URGENT: 'URGENT'
    },
    PQRStatus: {
      OPEN: 'OPEN',
      CATEGORIZED: 'CATEGORIZED',
      ASSIGNED: 'ASSIGNED',
      IN_PROGRESS: 'IN_PROGRESS',
      WAITING: 'WAITING',
      RESOLVED: 'RESOLVED',
      CLOSED: 'CLOSED',
      REOPENED: 'REOPENED',
      CANCELLED: 'CANCELLED'
    }
  };
});

jest.mock('@/lib/prisma', () => ({
  getPrisma: jest.fn(() => ({
    pQR: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn()
    },
    pQRStatusHistory: {
      findMany: jest.fn()
    },
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn()
    },
    $queryRaw: jest.fn(),
  })),
  getSchemaFromRequest: jest.fn(() => ({
    pQR: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn()
    },
    pQRStatusHistory: {
      findMany: jest.fn()
    },
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn()
    },
    pQRSettings: {
      findFirst: jest.fn()
    },
    $queryRaw: jest.fn(),
  })),
}));

describe('PQRMetricsService', () => {
  let service: PQRMetricsService;
  let prisma: any;
  
  beforeEach(() => {
    // Limpiar todos los mocks
    jest.clearAllMocks();
    
    // Crear instancia del servicio con schema de prueba
    service = new PQRMetricsService('test_schema');
    
    // Obtener la instancia de prisma para configurar mocks
    prisma = getPrisma();
  });
  
  describe('getSummaryMetrics', () => {
    it('debe generar métricas de resumen correctamente', async () => {
      // Mock para conteo por estado
      prisma.pQR.groupBy.mockResolvedValueOnce([
        { status: 'OPEN', _count: { id: 5 } },
        { status: 'ASSIGNED', _count: { id: 3 } },
        { status: 'IN_PROGRESS', _count: { id: 2 } },
        { status: 'RESOLVED', _count: { id: 10 } },
        { status: 'CLOSED', _count: { id: 8 } }
      ]);
      
      // Mock para PQRs resueltos (para tiempos promedio)
      prisma.pQR.findMany.mockResolvedValueOnce([
        {
          submittedAt: new Date(Date.now() - 3600000), // 1 hora antes
          assignedAt: new Date(Date.now() - 3000000), // 50 minutos antes
          resolvedAt: new Date(Date.now() - 1800000), // 30 minutos antes
          satisfactionRating: 4
        },
        {
          submittedAt: new Date(Date.now() - 7200000), // 2 horas antes
          assignedAt: new Date(Date.now() - 6000000), // 100 minutos antes
          resolvedAt: new Date(Date.now() - 3600000), // 1 hora antes
          satisfactionRating: 5
        }
      ]);
      
      // Mock para SLA
      prisma.pQR.findMany.mockResolvedValueOnce([
        {
          resolvedAt: new Date(Date.now() - 1800000),
          dueDate: new Date(Date.now() - 900000),
          slaBreached: true
        },
        {
          resolvedAt: new Date(Date.now() - 3600000),
          dueDate: new Date(Date.now() + 3600000),
          slaBreached: false
        }
      ]);
      
      // Ejecutar el método
      const result = await service.getSummaryMetrics();
      
      // Verificar resultado
      expect(result).toHaveProperty('totalCount', 28);
      expect(result).toHaveProperty('openCount', 5);
      expect(result).toHaveProperty('inProgressCount', 2);
      expect(result).toHaveProperty('resolvedCount', 10);
      expect(result).toHaveProperty('closedCount', 8);
      expect(result).toHaveProperty('averageResponseTime');
      expect(result).toHaveProperty('averageResolutionTime');
      expect(result).toHaveProperty('slaComplianceRate');
      expect(result).toHaveProperty('satisfactionRate', 4.5); // Promedio de 4 y 5
      
      // Verificar que se llamaron los métodos correctos
      expect(prisma.pQR.groupBy).toHaveBeenCalledWith({
        by: ['status'],
        _count: { id: true },
        where: {}
      });
    });
    
    it('debe aplicar filtros correctamente', async () => {
      // Mock para conteo por estado
      prisma.pQR.groupBy.mockResolvedValueOnce([]);
      
      // Mock para PQRs resueltos
      prisma.pQR.findMany.mockResolvedValueOnce([]);
      
      // Mock para SLA
      prisma.pQR.findMany.mockResolvedValueOnce([]);
      
      // Filtro de prueba
      const testFilter = {
        category: PQRCategory.MAINTENANCE,
        priority: PQRPriority.HIGH
      };
      
      // Ejecutar el método con filtro
      await service.getSummaryMetrics(testFilter);
      
      // Verificar que se aplicó el filtro
      expect(prisma.pQR.groupBy).toHaveBeenCalledWith({
        by: ['status'],
        _count: { id: true },
        where: expect.objectContaining({
          category: PQRCategory.MAINTENANCE,
          priority: PQRPriority.HIGH
        })
      });
    });
    
    it('debe manejar errores correctamente', async () => {
      // Forzar error en la consulta
      prisma.pQR.groupBy.mockRejectedValue(new Error('Error de base de datos'));
      
      // Ejecutar el método
      const result = await service.getSummaryMetrics();
      
      // Verificar valores por defecto
      expect(result).toEqual({
        totalCount: 0,
        openCount: 0,
        inProgressCount: 0,
        resolvedCount: 0,
        closedCount: 0,
        averageResponseTime: 0,
        averageResolutionTime: 0,
        slaComplianceRate: 0,
        satisfactionRate: 0
      });
    });
  });
  
  describe('getCategoryDistribution', () => {
    it('debe calcular distribución por categoría correctamente', async () => {
      // Mock para conteo por categoría
      prisma.pQR.groupBy.mockResolvedValueOnce([
        { category: 'MAINTENANCE', _count: { id: 15 } },
        { category: 'SECURITY', _count: { id: 8 } },
        { category: 'ADMINISTRATIVE', _count: { id: 5 } }
      ]);
      
      // Ejecutar el método
      const result = await service.getCategoryDistribution();
      
      // Verificar resultado
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        category: 'MAINTENANCE',
        count: 15,
        percentage: (15 / 28) * 100
      });
      
      // Verificar que se llamó el método correcto
      expect(prisma.pQR.groupBy).toHaveBeenCalledWith({
        by: ['category'],
        _count: { id: true },
        where: {}
      });
    });
  });
  
  describe('getSLAMetrics', () => {
    it('debe calcular métricas de SLA correctamente', async () => {
      // Mock para PQRs con información de SLA
      prisma.pQR.findMany.mockResolvedValueOnce([
        {
          resolvedAt: new Date(Date.now() - 1800000),
          dueDate: new Date(Date.now() - 900000),
          slaBreached: true
        },
        {
          resolvedAt: new Date(Date.now() - 3600000),
          dueDate: new Date(Date.now() + 3600000),
          slaBreached: false
        },
        {
          resolvedAt: new Date(Date.now() - 2700000),
          dueDate: new Date(Date.now() + 1800000),
          slaBreached: false
        }
      ]);
      
      // Ejecutar el método
      const result = await service.getSLAMetrics();
      
      // Verificar resultado
      expect(result).toEqual({
        compliantCount: 2,
        nonCompliantCount: 1,
        complianceRate: (2 / 3) * 100,
        averageDeviationTime: expect.any(Number)
      });
    });
    
    it('debe calcular SLA cuando no hay campo slaBreached', async () => {
      // Mock para PQRs sin campo slaBreached
      prisma.pQR.findMany.mockResolvedValueOnce([
        {
          resolvedAt: new Date(Date.now() - 1800000),
          dueDate: new Date(Date.now() - 900000)
        },
        {
          resolvedAt: new Date(Date.now() - 3600000),
          dueDate: new Date(Date.now() + 3600000)
        }
      ]);
      
      // Ejecutar el método
      const result = await service.getSLAMetrics();
      
      // Verificar resultado
      expect(result).toEqual({
        compliantCount: 1,
        nonCompliantCount: 1,
        complianceRate: 50,
        averageDeviationTime: expect.any(Number)
      });
    });
  });
  
  describe('getTimeTrend', () => {
    it('debe generar tendencia temporal correctamente', async () => {
      // Mock para conteo de PQRs
      prisma.pQR.count.mockResolvedValue(5);
      
      // Mock para PQRs resueltos
      prisma.pQR.findMany.mockResolvedValue([]);
      
      // Ejecutar el método
      const result = await service.getTimeTrend();
      
      // Verificar resultado
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      
      // Verificar estructura de cada elemento
      result.forEach(item => {
        expect(item).toHaveProperty('period');
        expect(item).toHaveProperty('count');
        expect(item).toHaveProperty('resolvedCount');
        expect(item).toHaveProperty('averageResolutionTime');
      });
    });
  });
  
  describe('getTopAssignees', () => {
    it('debe obtener métricas de los principales asignados', async () => {
      // Mock para PQRs agrupados por asignado
      prisma.pQR.groupBy.mockResolvedValueOnce([
        { assignedToId: 10, assignedToName: 'Técnico 1', _count: { id: 8 } },
        { assignedToId: 11, assignedToName: 'Técnico 2', _count: { id: 5 } }
      ]);
      
      // Mock para conteo de PQRs resueltos
      prisma.pQR.count.mockResolvedValue(3);
      
      // Mock para PQRs resueltos con tiempos
      prisma.pQR.findMany.mockResolvedValue([
        {
          assignedAt: new Date(Date.now() - 3600000),
          resolvedAt: new Date(Date.now() - 1800000),
          dueDate: new Date(Date.now() + 3600000),
          slaBreached: false
        }
      ]);
      
      // Ejecutar el método
      const result = await service.getTopAssignees();
      
      // Verificar resultado
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        assigneeId: 10,
        assigneeName: 'Técnico 1',
        totalAssigned: 8,
        resolvedCount: 3,
        averageResolutionTime: expect.any(Number),
        slaComplianceRate: 100
      });
    });
  });
  
  describe('getRecentActivity', () => {
    it('debe obtener actividad reciente correctamente', async () => {
      // Mock para cambios de estado recientes
      prisma.pQRStatusHistory.findMany.mockResolvedValueOnce([
        {
          changedAt: new Date(),
          previousStatus: 'OPEN',
          newStatus: 'ASSIGNED',
          pqrId: 123,
          pqr: {
            id: 123,
            ticketNumber: 'PQR-20250602-001',
            title: 'Problema de mantenimiento'
          }
        },
        {
          changedAt: new Date(),
          previousStatus: 'ASSIGNED',
          newStatus: 'IN_PROGRESS',
          pqrId: 124,
          pqr: {
            id: 124,
            ticketNumber: 'PQR-20250602-002',
            title: 'Problema de seguridad'
          }
        }
      ]);
      
      // Ejecutar el método
      const result = await service.getRecentActivity();
      
      // Verificar resultado
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('date');
      expect(result[0]).toHaveProperty('action');
      expect(result[0]).toHaveProperty('pqrId', 123);
      expect(result[0]).toHaveProperty('ticketNumber', 'PQR-20250602-001');
      expect(result[0]).toHaveProperty('title', 'Problema de mantenimiento');
    });
  });
  
  describe('generateDashboardMetrics', () => {
    it('debe generar métricas completas para el dashboard', async () => {
      // Mocks para todos los métodos individuales
      jest.spyOn(service, 'getSummaryMetrics').mockResolvedValueOnce({
        totalCount: 28,
        openCount: 5,
        inProgressCount: 2,
        resolvedCount: 10,
        closedCount: 8,
        averageResponseTime: 30,
        averageResolutionTime: 120,
        slaComplianceRate: 75,
        satisfactionRate: 4.5
      });
      
      jest.spyOn(service, 'getCategoryDistribution').mockResolvedValueOnce([
        { category: 'MAINTENANCE', count: 15, percentage: 53.57 }
      ]);
      
      jest.spyOn(service, 'getPriorityDistribution').mockResolvedValueOnce([
        { priority: 'HIGH', count: 10, percentage: 35.71 }
      ]);
      
      jest.spyOn(service, 'getStatusDistribution').mockResolvedValueOnce([
        { status: 'OPEN', count: 5, percentage: 17.86 }
      ]);
      
      jest.spyOn(service, 'getTimeTrend').mockResolvedValueOnce([
        { period: '2025-06', count: 10, resolvedCount: 8, averageResolutionTime: 90 }
      ]);
      
      jest.spyOn(service, 'getSLAMetrics').mockResolvedValueOnce({
        compliantCount: 15,
        nonCompliantCount: 5,
        complianceRate: 75,
        averageDeviationTime: 60
      });
      
      jest.spyOn(service, 'getTopAssignees').mockResolvedValueOnce([
        {
          assigneeId: 10,
          assigneeName: 'Técnico 1',
          totalAssigned: 8,
          resolvedCount: 6,
          averageResolutionTime: 100,
          slaComplianceRate: 83.33
        }
      ]);
      
      jest.spyOn(service, 'getRecentActivity').mockResolvedValueOnce([
        {
          date: new Date(),
          action: 'Cambio de estado: OPEN → ASSIGNED',
          pqrId: 123,
          ticketNumber: 'PQR-20250602-001',
          title: 'Problema de mantenimiento'
        }
      ]);
      
      // Ejecutar el método
      const result = await service.generateDashboardMetrics();
      
      // Verificar resultado
      expect(result).toHaveProperty('summary');
      expect(result).toHaveProperty('categoryDistribution');
      expect(result).toHaveProperty('priorityDistribution');
      expect(result).toHaveProperty('statusDistribution');
      expect(result).toHaveProperty('timeTrend');
      expect(result).toHaveProperty('slaMetrics');
      expect(result).toHaveProperty('topAssignees');
      expect(result).toHaveProperty('recentActivity');
      
      // Verificar que se llamaron todos los métodos con el mismo filtro
      const testFilter = { category: PQRCategory.MAINTENANCE };
      await service.generateDashboardMetrics(testFilter);
      
      expect(service.getSummaryMetrics).toHaveBeenLastCalledWith(testFilter);
      expect(service.getCategoryDistribution).toHaveBeenLastCalledWith(testFilter);
      expect(service.getPriorityDistribution).toHaveBeenLastCalledWith(testFilter);
      expect(service.getStatusDistribution).toHaveBeenLastCalledWith(testFilter);
      expect(service.getTimeTrend).toHaveBeenLastCalledWith(testFilter);
      expect(service.getSLAMetrics).toHaveBeenLastCalledWith(testFilter);
      expect(service.getTopAssignees).toHaveBeenLastCalledWith(testFilter);
      expect(service.getRecentActivity).toHaveBeenLastCalledWith(testFilter);
    });
    
    it('debe manejar errores correctamente', async () => {
      // Forzar error
      jest.spyOn(service, 'getSummaryMetrics').mockRejectedValueOnce(new Error('Error de prueba'));
      
      // Ejecutar el método
      await expect(service.generateDashboardMetrics()).rejects.toThrow('Error de prueba');
    });
  });
});
