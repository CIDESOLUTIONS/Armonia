/**
 * Pruebas de integración para los flujos principales del sistema PQR
 * 
 * Estas pruebas verifican la interacción entre los diferentes servicios
 * del sistema PQR (asignación, notificaciones y métricas).
 */

import { PrismaClient, PQRCategory, PQRPriority, PQRStatus } from '@prisma/client';
import { PQRAssignmentService } from '../pqrAssignmentService';
import { PQRNotificationService } from '../pqrNotificationService';
import { PQRMetricsService } from '../pqrMetricsService';

// Mock de PrismaClient
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    $queryRaw: jest.fn(),
    pQR: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn()
    },
    pQRStatusHistory: {
      create: jest.fn(),
      findMany: jest.fn()
    },
    pQRNotification: {
      create: jest.fn(),
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

// Mock de servicios de comunicación
jest.mock('@/lib/communications/email-service', () => ({
  sendEmail: jest.fn().mockResolvedValue(true)
}));

jest.mock('@/lib/communications/push-notification-service', () => ({
  sendPushNotification: jest.fn().mockResolvedValue(true)
}));

describe('PQR System Integration Tests', () => {
  let assignmentService: PQRAssignmentService;
  let notificationService: PQRNotificationService;
  let metricsService: PQRMetricsService;
  let prisma: any;
  
  beforeEach(() => {
    // Limpiar todos los mocks
    jest.clearAllMocks();
    
    // Crear instancias de los servicios con schema de prueba
    assignmentService = new PQRAssignmentService('test_schema');
    notificationService = new PQRNotificationService('test_schema');
    metricsService = new PQRMetricsService('test_schema');
    
    // Obtener la instancia de prisma para configurar mocks
    prisma = (assignmentService as any).prisma;
  });
  
  describe('Flujo completo de PQR', () => {
    it('debe procesar un PQR desde creación hasta resolución', async () => {
      // 1. Datos de entrada para un nuevo PQR
      const pqrData = {
        type: 'COMPLAINT',
        title: 'Fuga de agua en baño comunal',
        description: 'Hay una fuga de agua importante en el baño del primer piso',
        userId: 1,
        userName: 'Juan Pérez',
        userRole: 'RESIDENT',
        unitId: 101,
        unitNumber: '101',
        complexId: 1
      };
      
      // 2. Configurar mocks para el servicio de asignación
      // Settings
      prisma.$queryRaw.mockResolvedValueOnce([{ 
        autoCategorizeEnabled: true,
        autoAssignEnabled: true 
      }]);
      
      // No hay reglas específicas
      prisma.$queryRaw.mockResolvedValueOnce([]);
      
      // Settings para asignación
      prisma.$queryRaw.mockResolvedValueOnce([{ autoAssignEnabled: true }]);
      
      // No hay reglas específicas para asignación
      prisma.$queryRaw.mockResolvedValueOnce([]);
      
      // Equipo de mantenimiento
      prisma.$queryRaw.mockResolvedValueOnce([{
        id: 2,
        name: 'Equipo de Mantenimiento'
      }]);
      
      // 3. Procesar el PQR con el servicio de asignación
      const assignmentResult = await assignmentService.processPQR(pqrData);
      
      // Verificar resultado de asignación
      expect(assignmentResult.category).toBe(PQRCategory.MAINTENANCE);
      expect(assignmentResult.subcategory).toBe('Plomería');
      expect(assignmentResult.priority).toBe(PQRPriority.HIGH);
      expect(assignmentResult.assignedTeamId).toBe(2);
      expect(assignmentResult.dueDate).toBeInstanceOf(Date);
      
      // 4. Simular creación de PQR en la base de datos
      const mockPQR = {
        id: 123,
        ticketNumber: 'PQR-20250602-001',
        type: pqrData.type,
        title: pqrData.title,
        description: pqrData.description,
        category: assignmentResult.category,
        subcategory: assignmentResult.subcategory,
        priority: assignmentResult.priority,
        status: PQRStatus.OPEN,
        assignedTeamId: assignmentResult.assignedTeamId,
        userId: pqrData.userId,
        userName: pqrData.userName,
        userRole: pqrData.userRole,
        unitId: pqrData.unitId,
        unitNumber: pqrData.unitNumber,
        complexId: pqrData.complexId,
        submittedAt: new Date(),
        dueDate: assignmentResult.dueDate
      };
      
      // Mock para findUnique en notificaciones
      prisma.pQR.findUnique.mockResolvedValue(mockPQR);
      
      // 5. Configurar mocks para el servicio de notificaciones
      // Settings
      prisma.$queryRaw.mockResolvedValueOnce([{ autoNotifyEnabled: true }]);
      
      // Usuario que reportó
      prisma.user.findUnique.mockResolvedValueOnce({
        id: 1,
        email: 'juan.perez@example.com',
        name: 'Juan Pérez',
        role: 'RESIDENT'
      });
      
      // Miembros del equipo
      prisma.$queryRaw.mockResolvedValueOnce({
        id: 2,
        name: 'Equipo de Mantenimiento',
        memberIds: [10, 11]
      });
      
      prisma.user.findMany.mockResolvedValueOnce([
        {
          id: 10,
          email: 'tecnico1@example.com',
          name: 'Técnico 1',
          role: 'STAFF'
        },
        {
          id: 11,
          email: 'tecnico2@example.com',
          name: 'Técnico 2',
          role: 'STAFF'
        }
      ]);
      
      // Administradores
      prisma.user.findMany.mockResolvedValueOnce([
        {
          id: 5,
          email: 'admin@example.com',
          name: 'Administrador',
          role: 'COMPLEX_ADMIN'
        }
      ]);
      
      // 6. Enviar notificación de cambio de estado
      const notificationResult = await notificationService.notifyStatusChange(
        mockPQR.id,
        PQRStatus.ASSIGNED,
        PQRStatus.OPEN,
        5, // adminId
        'Asignado al equipo de mantenimiento'
      );
      
      // Verificar resultado de notificación
      expect(notificationResult).toBe(true);
      
      // 7. Configurar mocks para métricas
      // Contar PQRs por estado
      prisma.pQR.groupBy.mockResolvedValueOnce([
        { status: 'OPEN', _count: { id: 5 } },
        { status: 'ASSIGNED', _count: { id: 3 } },
        { status: 'IN_PROGRESS', _count: { id: 2 } },
        { status: 'RESOLVED', _count: { id: 10 } },
        { status: 'CLOSED', _count: { id: 8 } }
      ]);
      
      // PQRs resueltos para tiempos
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
      
      // Métricas de SLA
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
      
      // 8. Obtener métricas de resumen
      const metricsResult = await metricsService.getSummaryMetrics();
      
      // Verificar resultado de métricas
      expect(metricsResult.totalCount).toBe(28);
      expect(metricsResult.openCount).toBe(5);
      expect(metricsResult.resolvedCount).toBe(10);
      expect(metricsResult.averageResponseTime).toBeGreaterThan(0);
      expect(metricsResult.averageResolutionTime).toBeGreaterThan(0);
      expect(metricsResult.satisfactionRate).toBe(4.5); // Promedio de 4 y 5
    });
  });
  
  describe('Flujo de notificaciones y seguimiento', () => {
    it('debe enviar recordatorios para PQRs próximos a vencer', async () => {
      // Fecha actual
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      // PQRs que vencen pronto
      prisma.pQR.findMany.mockResolvedValueOnce([
        {
          id: 123,
          ticketNumber: 'PQR-20250602-001',
          title: 'Fuga de agua',
          status: PQRStatus.IN_PROGRESS,
          dueDate: tomorrow
        },
        {
          id: 124,
          ticketNumber: 'PQR-20250602-002',
          title: 'Problema eléctrico',
          status: PQRStatus.ASSIGNED,
          dueDate: tomorrow
        }
      ]);
      
      // Para cada PQR, configurar mocks de destinatarios
      // PQR 1
      prisma.pQR.findUnique.mockResolvedValueOnce({
        id: 123,
        ticketNumber: 'PQR-20250602-001',
        title: 'Fuga de agua',
        status: PQRStatus.IN_PROGRESS,
        userId: 1,
        assignedToId: 10
      });
      
      prisma.user.findUnique.mockResolvedValueOnce({
        id: 1,
        email: 'juan.perez@example.com',
        name: 'Juan Pérez',
        role: 'RESIDENT'
      });
      
      prisma.user.findUnique.mockResolvedValueOnce({
        id: 10,
        email: 'tecnico1@example.com',
        name: 'Técnico 1',
        role: 'STAFF'
      });
      
      // PQR 2
      prisma.pQR.findUnique.mockResolvedValueOnce({
        id: 124,
        ticketNumber: 'PQR-20250602-002',
        title: 'Problema eléctrico',
        status: PQRStatus.ASSIGNED,
        userId: 2,
        assignedTeamId: 2
      });
      
      prisma.user.findUnique.mockResolvedValueOnce({
        id: 2,
        email: 'maria.lopez@example.com',
        name: 'María López',
        role: 'RESIDENT'
      });
      
      prisma.$queryRaw.mockResolvedValueOnce({
        id: 2,
        name: 'Equipo de Mantenimiento',
        memberIds: [10, 11]
      });
      
      prisma.user.findMany.mockResolvedValueOnce([
        {
          id: 10,
          email: 'tecnico1@example.com',
          name: 'Técnico 1',
          role: 'STAFF'
        },
        {
          id: 11,
          email: 'tecnico2@example.com',
          name: 'Técnico 2',
          role: 'STAFF'
        }
      ]);
      
      // Enviar recordatorios
      const reminderCount = await notificationService.sendDueDateReminders();
      
      // Verificar resultado
      expect(reminderCount).toBeGreaterThan(0);
    });
    
    it('debe enviar encuesta de satisfacción al resolver un PQR', async () => {
      // PQR resuelto
      prisma.pQR.findUnique.mockResolvedValueOnce({
        id: 123,
        ticketNumber: 'PQR-20250602-001',
        title: 'Fuga de agua',
        status: PQRStatus.RESOLVED,
        userId: 1
      });
      
      // Settings
      prisma.$queryRaw.mockResolvedValueOnce([{ satisfactionSurveyEnabled: true }]);
      
      // Usuario
      prisma.user.findUnique.mockResolvedValueOnce({
        id: 1,
        email: 'juan.perez@example.com',
        name: 'Juan Pérez',
        role: 'RESIDENT'
      });
      
      // Enviar encuesta
      const surveyResult = await notificationService.sendSatisfactionSurvey(123);
      
      // Verificar resultado
      expect(surveyResult).toBe(true);
    });
  });
  
  describe('Generación de métricas y KPIs', () => {
    it('debe generar métricas completas para el dashboard', async () => {
      // Mocks para resumen
      prisma.pQR.groupBy.mockResolvedValueOnce([
        { status: 'OPEN', _count: { id: 5 } },
        { status: 'ASSIGNED', _count: { id: 3 } },
        { status: 'IN_PROGRESS', _count: { id: 2 } },
        { status: 'RESOLVED', _count: { id: 10 } },
        { status: 'CLOSED', _count: { id: 8 } }
      ]);
      
      prisma.pQR.findMany.mockResolvedValueOnce([
        {
          submittedAt: new Date(Date.now() - 3600000),
          assignedAt: new Date(Date.now() - 3000000),
          resolvedAt: new Date(Date.now() - 1800000),
          satisfactionRating: 4
        }
      ]);
      
      // Mocks para distribución por categoría
      prisma.pQR.groupBy.mockResolvedValueOnce([
        { category: 'MAINTENANCE', _count: { id: 15 } },
        { category: 'SECURITY', _count: { id: 8 } },
        { category: 'ADMINISTRATIVE', _count: { id: 5 } }
      ]);
      
      // Mocks para distribución por prioridad
      prisma.pQR.groupBy.mockResolvedValueOnce([
        { priority: 'HIGH', _count: { id: 10 } },
        { priority: 'MEDIUM', _count: { id: 12 } },
        { priority: 'LOW', _count: { id: 6 } }
      ]);
      
      // Mocks para distribución por estado
      prisma.pQR.groupBy.mockResolvedValueOnce([
        { status: 'OPEN', _count: { id: 5 } },
        { status: 'ASSIGNED', _count: { id: 3 } },
        { status: 'IN_PROGRESS', _count: { id: 2 } },
        { status: 'RESOLVED', _count: { id: 10 } },
        { status: 'CLOSED', _count: { id: 8 } }
      ]);
      
      // Mocks para tendencia temporal (simplificado)
      prisma.pQR.count.mockResolvedValue(5);
      prisma.pQR.findMany.mockResolvedValue([]);
      
      // Mocks para SLA
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
      
      // Mocks para asignados
      prisma.pQR.groupBy.mockResolvedValueOnce([
        { assignedToId: 10, assignedToName: 'Técnico 1', _count: { id: 8 } },
        { assignedToId: 11, assignedToName: 'Técnico 2', _count: { id: 5 } }
      ]);
      
      prisma.pQR.count.mockResolvedValue(3);
      prisma.pQR.findMany.mockResolvedValue([]);
      
      // Mocks para actividad reciente
      prisma.pQRStatusHistory.findMany.mockResolvedValueOnce([
        {
          changedAt: new Date(),
          previousStatus: 'OPEN',
          newStatus: 'ASSIGNED',
          pqrId: 123,
          pqr: {
            id: 123,
            ticketNumber: 'PQR-20250602-001',
            title: 'Fuga de agua'
          }
        }
      ]);
      
      // Generar métricas completas
      const dashboardMetrics = await metricsService.generateDashboardMetrics();
      
      // Verificar resultado
      expect(dashboardMetrics).toHaveProperty('summary');
      expect(dashboardMetrics).toHaveProperty('categoryDistribution');
      expect(dashboardMetrics).toHaveProperty('priorityDistribution');
      expect(dashboardMetrics).toHaveProperty('statusDistribution');
      expect(dashboardMetrics).toHaveProperty('timeTrend');
      expect(dashboardMetrics).toHaveProperty('slaMetrics');
      expect(dashboardMetrics).toHaveProperty('topAssignees');
      expect(dashboardMetrics).toHaveProperty('recentActivity');
    });
  });
});
