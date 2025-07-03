/**
 * Pruebas de integración avanzadas para el sistema PQR
 * 
 * Estas pruebas verifican la integración entre los diferentes servicios
 * del sistema PQR, asegurando que funcionen correctamente en conjunto.
 */

import { PrismaClient, PQRStatus, PQRCategory, PQRPriority } from '@prisma/client';
import { PQRAssignmentService } from '../pqrAssignmentService';
import { PQRNotificationService } from '../pqrNotificationService';
import { PQRMetricsService } from '../pqrMetricsService';
import { sendEmail } from '@/lib/communications/email-service';
import { sendPushNotification } from '@/lib/communications/push-notification-service';

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
    pQRNotification: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn()
    },
    pQRStatusHistory: {
      create: jest.fn(),
      findMany: jest.fn()
    },
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn()
    },
    userNotificationPreference: {
      findUnique: jest.fn()
    },
    pQRTeam: {
      findUnique: jest.fn(),
      findMany: jest.fn()
    }
  };
  
  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
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
    },
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

jest.mock('@/lib/communications/sms-service', () => ({
  sendSMS: jest.fn().mockResolvedValue(true)
}));

describe('Sistema PQR - Pruebas de Integración Avanzadas', () => {
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
      // 1. Datos de entrada para nuevo PQR
      const pqrData = {
        type: 'COMPLAINT',
        title: 'Fuga de agua en baño comunal',
        description: 'Hay una fuga de agua importante en el baño del primer piso que requiere atención urgente.',
        userId: 1,
        userName: 'Juan Pérez',
        userRole: 'RESIDENT',
        unitId: 101,
        unitNumber: '101',
        complexId: 1,
        location: 'Baño primer piso'
      };
      
      // 2. Mock para configuración de asignación
      prisma.$queryRaw.mockResolvedValueOnce([{ 
        autoCategorizeEnabled: true, 
        autoAssignEnabled: true 
      }]);
      
      // 3. Mock para reglas de asignación
      prisma.$queryRaw.mockResolvedValueOnce([{
        id: 1,
        name: 'Regla Plomería',
        conditions: JSON.stringify({
          keywords: ['fuga', 'agua', 'baño']
        }),
        category: 'MAINTENANCE',
        subcategory: 'Plomería',
        priority: 'HIGH',
        assignToType: 'TEAM',
        assignToId: 5,
        assignToName: 'Equipo Plomería'
      }]);
      
      // 4. Mock para equipo de plomería
      prisma.$queryRaw.mockResolvedValueOnce([{
        id: 5,
        name: 'Equipo Plomería',
        members: JSON.stringify([
          { id: 10, name: 'Técnico Plomería', role: 'STAFF' }
        ])
      }]);
      
      // 5. Mock para creación de PQR
      const createdPQR = {
        id: 123,
        ticketNumber: 'PQR-20250602-001',
        ...pqrData,
        status: PQRStatus.OPEN,
        submittedAt: new Date(),
        dueDate: null
      };
      
      prisma.pQR.create.mockResolvedValueOnce(createdPQR);
      
      // 6. Procesar PQR (categorización y asignación)
      const processResult = await assignmentService.processPQR(pqrData);
      
      // Verificar resultado de procesamiento
      expect(processResult.category).toBe(PQRCategory.MAINTENANCE);
      expect(processResult.subcategory).toBe('Plomería');
      expect(processResult.priority).toBe(PQRPriority.HIGH);
      expect(processResult.assignedTeamId).toBe(5);
      
      // 7. Mock para actualización de PQR con categoría y asignación
      const categorizedPQR = {
        ...createdPQR,
        id: 123,
        status: PQRStatus.CATEGORIZED,
        category: processResult.category,
        subcategory: processResult.subcategory,
        priority: processResult.priority,
        assignedTeamId: processResult.assignedTeamId,
        assignedTeamName: 'Equipo Plomería'
      };
      
      prisma.pQR.update.mockResolvedValueOnce(categorizedPQR);
      prisma.pQR.findUnique.mockResolvedValueOnce(categorizedPQR);
      
      // 8. Mock para configuración de notificaciones
      prisma.$queryRaw.mockResolvedValueOnce([{ autoNotifyEnabled: true }]);
      
      // 9. Mock para usuario que reportó
      prisma.user.findUnique.mockResolvedValueOnce({
        id: 1,
        email: 'usuario@example.com',
        name: 'Juan Pérez',
        role: 'RESIDENT'
      });
      
      // 10. Notificar cambio de estado a CATEGORIZED
      const notifyResult1 = await notificationService.notifyStatusChange(
        123,
        PQRStatus.CATEGORIZED,
        PQRStatus.OPEN,
        null,
        'PQR categorizado automáticamente'
      );
      
      // Verificar notificación
      expect(notifyResult1).toBe(true);
      expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({
        to: 'usuario@example.com'
      }));
      
      // 11. Mock para asignación a técnico específico
      const assignedPQR = {
        ...categorizedPQR,
        status: PQRStatus.ASSIGNED,
        assignedToId: 10,
        assignedToName: 'Técnico Plomería',
        assignedToRole: 'STAFF',
        assignedAt: new Date()
      };
      
      prisma.pQR.update.mockResolvedValueOnce(assignedPQR);
      prisma.pQR.findUnique.mockResolvedValueOnce(assignedPQR);
      
      // 12. Mock para configuración de notificaciones (segunda llamada)
      prisma.$queryRaw.mockResolvedValueOnce([{ autoNotifyEnabled: true }]);
      
      // 13. Mock para usuario asignado
      prisma.user.findUnique.mockResolvedValueOnce({
        id: 10,
        email: 'tecnico@example.com',
        name: 'Técnico Plomería',
        role: 'STAFF'
      });
      
      // 14. Notificar asignación
      const notifyResult2 = await notificationService.notifyStatusChange(
        123,
        PQRStatus.ASSIGNED,
        PQRStatus.CATEGORIZED,
        10,
        'PQR asignado a técnico'
      );
      
      // Verificar notificación
      expect(notifyResult2).toBe(true);
      expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({
        to: 'tecnico@example.com'
      }));
      
      // 15. Mock para cambio a estado IN_PROGRESS
      const inProgressPQR = {
        ...assignedPQR,
        status: PQRStatus.IN_PROGRESS,
        startedAt: new Date()
      };
      
      prisma.pQR.update.mockResolvedValueOnce(inProgressPQR);
      prisma.pQR.findUnique.mockResolvedValueOnce(inProgressPQR);
      
      // 16. Mock para configuración de notificaciones (tercera llamada)
      prisma.$queryRaw.mockResolvedValueOnce([{ autoNotifyEnabled: true }]);
      
      // 17. Notificar inicio de trabajo
      const notifyResult3 = await notificationService.notifyStatusChange(
        123,
        PQRStatus.IN_PROGRESS,
        PQRStatus.ASSIGNED,
        10,
        'Iniciando trabajo en la solicitud'
      );
      
      // Verificar notificación
      expect(notifyResult3).toBe(true);
      
      // 18. Mock para resolución de PQR
      const resolvedPQR = {
        ...inProgressPQR,
        status: PQRStatus.RESOLVED,
        resolvedAt: new Date(),
        resolution: 'Se reparó la fuga de agua y se verificó su correcto funcionamiento'
      };
      
      prisma.pQR.update.mockResolvedValueOnce(resolvedPQR);
      prisma.pQR.findUnique.mockResolvedValueOnce(resolvedPQR);
      
      // 19. Mock para configuración de notificaciones (cuarta llamada)
      prisma.$queryRaw.mockResolvedValueOnce([{ autoNotifyEnabled: true }]);
      
      // 20. Notificar resolución
      const notifyResult4 = await notificationService.notifyStatusChange(
        123,
        PQRStatus.RESOLVED,
        PQRStatus.IN_PROGRESS,
        10,
        'PQR resuelto satisfactoriamente'
      );
      
      // Verificar notificación
      expect(notifyResult4).toBe(true);
      
      // 21. Mock para configuración de encuesta
      prisma.$queryRaw.mockResolvedValueOnce([{ satisfactionSurveyEnabled: true }]);
      
      // 22. Enviar encuesta de satisfacción
      const surveyResult = await notificationService.sendSatisfactionSurvey(123);
      
      // Verificar envío de encuesta
      expect(surveyResult).toBe(true);
      expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({
        to: 'usuario@example.com',
        subject: expect.stringContaining('Encuesta de satisfacción')
      }));
      
      // 23. Mock para cierre de PQR
      const closedPQR = {
        ...resolvedPQR,
        status: PQRStatus.CLOSED,
        closedAt: new Date(),
        satisfactionRating: 5,
        satisfactionComment: 'Excelente servicio, rápido y efectivo'
      };
      
      prisma.pQR.update.mockResolvedValueOnce(closedPQR);
      prisma.pQR.findUnique.mockResolvedValueOnce(closedPQR);
      
      // 24. Mock para configuración de notificaciones (quinta llamada)
      prisma.$queryRaw.mockResolvedValueOnce([{ autoNotifyEnabled: true }]);
      
      // 25. Notificar cierre
      const notifyResult5 = await notificationService.notifyStatusChange(
        123,
        PQRStatus.CLOSED,
        PQRStatus.RESOLVED,
        1,
        'PQR cerrado por el usuario'
      );
      
      // Verificar notificación
      expect(notifyResult5).toBe(true);
      
      // 26. Mock para métricas
      prisma.pQR.groupBy.mockResolvedValueOnce([
        { status: 'CLOSED', _count: { id: 1 } }
      ]);
      
      prisma.pQR.findMany.mockResolvedValueOnce([closedPQR]);
      prisma.pQR.findMany.mockResolvedValueOnce([closedPQR]);
      
      // 27. Generar métricas
      const metrics = await metricsService.getSummaryMetrics();
      
      // Verificar métricas
      expect(metrics.totalCount).toBe(1);
      expect(metrics.closedCount).toBe(1);
      expect(metrics.satisfactionRate).toBe(5);
    });
  });
  
  describe('Escenarios de integración avanzados', () => {
    it('debe manejar correctamente la reapertura y escalamiento de un PQR', async () => {
      // 1. Mock para PQR resuelto que será reabierto
      const resolvedPQR = {
        id: 124,
        ticketNumber: 'PQR-20250602-002',
        type: 'COMPLAINT',
        title: 'Problema con cerradura',
        description: 'La cerradura de la puerta principal no funciona correctamente',
        userId: 2,
        userName: 'María López',
        userRole: 'RESIDENT',
        unitId: 202,
        unitNumber: '202',
        complexId: 1,
        status: PQRStatus.RESOLVED,
        category: PQRCategory.MAINTENANCE,
        subcategory: 'Cerrajería',
        priority: PQRPriority.MEDIUM,
        assignedToId: 11,
        assignedToName: 'Técnico Cerrajería',
        assignedToRole: 'STAFF',
        submittedAt: new Date(Date.now() - 172800000), // 2 días atrás
        resolvedAt: new Date(Date.now() - 86400000) // 1 día atrás
      };
      
      prisma.pQR.findUnique.mockResolvedValueOnce(resolvedPQR);
      
      // 2. Mock para reapertura de PQR
      const reopenedPQR = {
        ...resolvedPQR,
        status: PQRStatus.REOPENED,
        reopenReason: 'La cerradura sigue fallando después de la reparación',
        reopenCount: 1,
        reopenedAt: new Date()
      };
      
      prisma.pQR.update.mockResolvedValueOnce(reopenedPQR);
      prisma.pQR.findUnique.mockResolvedValueOnce(reopenedPQR);
      
      // 3. Mock para configuración de notificaciones
      prisma.$queryRaw.mockResolvedValueOnce([{ autoNotifyEnabled: true }]);
      
      // 4. Mock para usuario que reportó
      prisma.user.findUnique.mockResolvedValueOnce({
        id: 2,
        email: 'maria@example.com',
        name: 'María López',
        role: 'RESIDENT'
      });
      
      // 5. Mock para técnico original
      prisma.user.findUnique.mockResolvedValueOnce({
        id: 11,
        email: 'cerrajero@example.com',
        name: 'Técnico Cerrajería',
        role: 'STAFF'
      });
      
      // 6. Notificar reapertura
      const notifyResult1 = await notificationService.notifyStatusChange(
        124,
        PQRStatus.REOPENED,
        PQRStatus.RESOLVED,
        2,
        'PQR reabierto por el usuario'
      );
      
      // Verificar notificación
      expect(notifyResult1).toBe(true);
      expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({
        to: 'cerrajero@example.com',
        subject: expect.stringContaining('reabierto')
      }));
      
      // 7. Mock para configuración de reasignación
      prisma.$queryRaw.mockResolvedValueOnce([{ 
        autoReassignEnabled: true,
        escalateOnReopen: true
      }]);
      
      // 8. Mock para especialistas disponibles
      prisma.user.findMany.mockResolvedValueOnce([
        {
          id: 15,
          name: 'Especialista Cerrajería',
          role: 'SPECIALIST',
          email: 'especialista@example.com',
          specialties: JSON.stringify(['Cerrajería', 'Seguridad']),
          experienceYears: 10
        }
      ]);
      
      // 9. Procesar PQR reabierto (reasignación)
      const processResult = await assignmentService.processPQR({
        ...reopenedPQR,
        previousAssignedToId: 11
      });
      
      // Verificar resultado de procesamiento
      expect(processResult.category).toBe(PQRCategory.MAINTENANCE);
      expect(processResult.subcategory).toBe('Cerrajería');
      expect(processResult.priority).toBe(PQRPriority.HIGH); // Aumentó la prioridad
      expect(processResult.assignedToId).toBe(15);
      expect(processResult.assignedToName).toBe('Especialista Cerrajería');
      expect(processResult.assignedToRole).toBe('SPECIALIST');
      expect(processResult.escalated).toBe(true);
      
      // 10. Mock para actualización de PQR con nueva asignación
      const escalatedPQR = {
        ...reopenedPQR,
        status: PQRStatus.ASSIGNED,
        priority: processResult.priority,
        assignedToId: processResult.assignedToId,
        assignedToName: processResult.assignedToName,
        assignedToRole: processResult.assignedToRole,
        escalated: true,
        escalatedAt: new Date(),
        escalationReason: 'Reapertura de solicitud'
      };
      
      prisma.pQR.update.mockResolvedValueOnce(escalatedPQR);
      prisma.pQR.findUnique.mockResolvedValueOnce(escalatedPQR);
      
      // 11. Mock para configuración de notificaciones
      prisma.$queryRaw.mockResolvedValueOnce([{ 
        autoNotifyEnabled: true,
        notifyEscalations: true
      }]);
      
      // 12. Mock para especialista
      prisma.user.findUnique.mockResolvedValueOnce({
        id: 15,
        email: 'especialista@example.com',
        name: 'Especialista Cerrajería',
        role: 'SPECIALIST'
      });
      
      // 13. Mock para supervisor
      prisma.user.findMany.mockResolvedValueOnce([
        {
          id: 5,
          email: 'supervisor@example.com',
          name: 'Supervisor',
          role: 'SUPERVISOR'
        }
      ]);
      
      // 14. Notificar escalamiento y reasignación
      const notifyResult2 = await notificationService.notifyStatusChange(
        124,
        PQRStatus.ASSIGNED,
        PQRStatus.REOPENED,
        15,
        'PQR escalado y reasignado a especialista'
      );
      
      // Verificar notificación
      expect(notifyResult2).toBe(true);
      expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({
        to: 'especialista@example.com'
      }));
      expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({
        to: 'supervisor@example.com',
        subject: expect.stringContaining('escalado')
      }));
      
      // 15. Mock para métricas de escalamiento
      prisma.pQR.groupBy.mockResolvedValueOnce([
        { status: 'ASSIGNED', _count: { id: 1 } }
      ]);
      
      prisma.pQR.findMany.mockResolvedValueOnce([escalatedPQR]);
      prisma.pQR.findMany.mockResolvedValueOnce([]);
      
      // 16. Generar métricas
      const metrics = await metricsService.getSummaryMetrics();
      
      // Verificar métricas
      expect(metrics.totalCount).toBe(1);
      expect(metrics.openCount).toBe(0);
      expect(metrics.inProgressCount).toBe(0);
      expect(metrics.resolvedCount).toBe(0);
      expect(metrics.closedCount).toBe(0);
      
      // 17. Mock para métricas de escalamiento
      prisma.pQR.count.mockResolvedValueOnce(1); // Total de PQRs
      prisma.pQR.count.mockResolvedValueOnce(1); // PQRs escalados
      
      // 18. Verificar tasa de escalamiento
      const escalationRate = await (metricsService as any).getEscalationRate();
      expect(escalationRate).toBe(100); // 100% de escalamiento
    });
    
    it('debe generar correctamente métricas de SLA y rendimiento', async () => {
      // 1. Mock para PQRs con información de SLA
      const pqrList = [
        {
          id: 101,
          ticketNumber: 'PQR-20250601-001',
          status: PQRStatus.CLOSED,
          category: PQRCategory.MAINTENANCE,
          priority: PQRPriority.HIGH,
          submittedAt: new Date(Date.now() - 172800000), // 2 días atrás
          assignedAt: new Date(Date.now() - 168400000), // 1 día y 23 horas atrás
          resolvedAt: new Date(Date.now() - 86400000), // 1 día atrás
          dueDate: new Date(Date.now() - 90000000), // 1 día y 1 hora atrás
          slaBreached: false
        },
        {
          id: 102,
          ticketNumber: 'PQR-20250601-002',
          status: PQRStatus.CLOSED,
          category: PQRCategory.SECURITY,
          priority: PQRPriority.URGENT,
          submittedAt: new Date(Date.now() - 86400000), // 1 día atrás
          assignedAt: new Date(Date.now() - 82800000), // 23 horas atrás
          resolvedAt: new Date(Date.now() - 43200000), // 12 horas atrás
          dueDate: new Date(Date.now() - 50400000), // 14 horas atrás
          slaBreached: true
        },
        {
          id: 103,
          ticketNumber: 'PQR-20250602-001',
          status: PQRStatus.IN_PROGRESS,
          category: PQRCategory.ADMINISTRATIVE,
          priority: PQRPriority.MEDIUM,
          submittedAt: new Date(Date.now() - 43200000), // 12 horas atrás
          assignedAt: new Date(Date.now() - 39600000), // 11 horas atrás
          dueDate: new Date(Date.now() + 43200000), // 12 horas adelante
          slaBreached: false
        }
      ];
      
      // 2. Mock para conteo por estado
      prisma.pQR.groupBy.mockResolvedValueOnce([
        { status: 'CLOSED', _count: { id: 2 } },
        { status: 'IN_PROGRESS', _count: { id: 1 } }
      ]);
      
      // 3. Mock para PQRs resueltos (para tiempos promedio)
      prisma.pQR.findMany.mockResolvedValueOnce([pqrList[0], pqrList[1]]);
      
      // 4. Mock para SLA
      prisma.pQR.findMany.mockResolvedValueOnce([pqrList[0], pqrList[1]]);
      
      // 5. Generar métricas de resumen
      const summaryMetrics = await metricsService.getSummaryMetrics();
      
      // Verificar métricas de resumen
      expect(summaryMetrics.totalCount).toBe(3);
      expect(summaryMetrics.closedCount).toBe(2);
      expect(summaryMetrics.inProgressCount).toBe(1);
      expect(summaryMetrics.averageResponseTime).toBeGreaterThan(0);
      expect(summaryMetrics.averageResolutionTime).toBeGreaterThan(0);
      expect(summaryMetrics.slaComplianceRate).toBe(50); // 1 de 2 cumplió SLA
      
      // 6. Mock para PQRs con información de SLA (para métricas específicas)
      prisma.pQR.findMany.mockResolvedValueOnce([pqrList[0], pqrList[1]]);
      
      // 7. Generar métricas de SLA
      const slaMetrics = await metricsService.getSLAMetrics();
      
      // Verificar métricas de SLA
      expect(slaMetrics.compliantCount).toBe(1);
      expect(slaMetrics.nonCompliantCount).toBe(1);
      expect(slaMetrics.complianceRate).toBe(50);
      expect(slaMetrics.averageDeviationTime).toBeGreaterThan(0);
      
      // 8. Mock para conteo por categoría
      prisma.pQR.groupBy.mockResolvedValueOnce([
        { category: 'MAINTENANCE', _count: { id: 1 } },
        { category: 'SECURITY', _count: { id: 1 } },
        { category: 'ADMINISTRATIVE', _count: { id: 1 } }
      ]);
      
      // 9. Generar distribución por categoría
      const categoryDistribution = await metricsService.getCategoryDistribution();
      
      // Verificar distribución por categoría
      expect(categoryDistribution).toHaveLength(3);
      expect(categoryDistribution[0].category).toBe('MAINTENANCE');
      expect(categoryDistribution[0].count).toBe(1);
      expect(categoryDistribution[0].percentage).toBe((1/3) * 100);
      
      // 10. Mock para conteo por prioridad
      prisma.pQR.groupBy.mockResolvedValueOnce([
        { priority: 'MEDIUM', _count: { id: 1 } },
        { priority: 'HIGH', _count: { id: 1 } },
        { priority: 'URGENT', _count: { id: 1 } }
      ]);
      
      // 11. Generar distribución por prioridad
      const priorityDistribution = await metricsService.getPriorityDistribution();
      
      // Verificar distribución por prioridad
      expect(priorityDistribution).toHaveLength(3);
      
      // 12. Mock para tendencia temporal
      prisma.pQR.count.mockResolvedValue(1);
      prisma.pQR.findMany.mockResolvedValue([pqrList[0]]);
      
      // 13. Generar tendencia temporal
      const timeTrend = await metricsService.getTimeTrend();
      
      // Verificar tendencia temporal
      expect(Array.isArray(timeTrend)).toBe(true);
      expect(timeTrend.length).toBeGreaterThan(0);
      
      // 14. Mock para dashboard completo
      jest.spyOn(metricsService, 'getSummaryMetrics').mockResolvedValueOnce(summaryMetrics);
      jest.spyOn(metricsService, 'getCategoryDistribution').mockResolvedValueOnce(categoryDistribution);
      jest.spyOn(metricsService, 'getPriorityDistribution').mockResolvedValueOnce(priorityDistribution);
      jest.spyOn(metricsService, 'getStatusDistribution').mockResolvedValueOnce([]);
      jest.spyOn(metricsService, 'getTimeTrend').mockResolvedValueOnce(timeTrend);
      jest.spyOn(metricsService, 'getSLAMetrics').mockResolvedValueOnce(slaMetrics);
      jest.spyOn(metricsService, 'getTopAssignees').mockResolvedValueOnce([]);
      jest.spyOn(metricsService, 'getRecentActivity').mockResolvedValueOnce([]);
      
      // 15. Generar dashboard completo
      const dashboard = await metricsService.generateDashboardMetrics();
      
      // Verificar dashboard
      expect(dashboard).toHaveProperty('summary', summaryMetrics);
      expect(dashboard).toHaveProperty('categoryDistribution', categoryDistribution);
      expect(dashboard).toHaveProperty('priorityDistribution', priorityDistribution);
      expect(dashboard).toHaveProperty('timeTrend', timeTrend);
      expect(dashboard).toHaveProperty('slaMetrics', slaMetrics);
    });
  });
  
  describe('Manejo de errores en integración', () => {
    it('debe manejar errores durante el flujo completo sin interrumpir el proceso', async () => {
      // 1. Datos de entrada para nuevo PQR
      const pqrData = {
        type: 'COMPLAINT',
        title: 'Problema con iluminación',
        description: 'Las luces del pasillo no funcionan',
        userId: 3,
        userName: 'Carlos Gómez',
        userRole: 'RESIDENT',
        unitId: 303,
        unitNumber: '303',
        complexId: 1
      };
      
      // 2. Mock para configuración de asignación (error)
      prisma.$queryRaw.mockRejectedValueOnce(new Error('Error de base de datos'));
      
      // 3. Procesar PQR (debe usar valores por defecto)
      const processResult = await assignmentService.processPQR(pqrData);
      
      // Verificar resultado de procesamiento
      expect(processResult).toEqual({
        category: PQRCategory.OTHER,
        priority: PQRPriority.MEDIUM
      });
      
      // 4. Mock para creación de PQR
      const createdPQR = {
        id: 125,
        ticketNumber: 'PQR-20250602-003',
        ...pqrData,
        status: PQRStatus.OPEN,
        category: PQRCategory.OTHER,
        priority: PQRPriority.MEDIUM,
        submittedAt: new Date()
      };
      
      prisma.pQR.create.mockResolvedValueOnce(createdPQR);
      prisma.pQR.findUnique.mockResolvedValueOnce(createdPQR);
      
      // 5. Mock para configuración de notificaciones (error)
      prisma.$queryRaw.mockRejectedValueOnce(new Error('Error de configuración'));
      
      // 6. Notificar creación (debe fallar silenciosamente)
      const notifyResult = await notificationService.notifyStatusChange(
        125,
        PQRStatus.OPEN,
        null,
        null,
        'Nuevo PQR creado'
      );
      
      // Verificar resultado
      expect(notifyResult).toBe(false);
      
      // 7. Mock para actualización manual de categoría
      const categorizedPQR = {
        ...createdPQR,
        status: PQRStatus.CATEGORIZED,
        category: PQRCategory.MAINTENANCE,
        subcategory: 'Eléctrico',
        priority: PQRPriority.MEDIUM
      };
      
      prisma.pQR.update.mockResolvedValueOnce(categorizedPQR);
      prisma.pQR.findUnique.mockResolvedValueOnce(categorizedPQR);
      
      // 8. Mock para configuración de notificaciones
      prisma.$queryRaw.mockResolvedValueOnce([{ autoNotifyEnabled: true }]);
      
      // 9. Mock para usuario que reportó
      prisma.user.findUnique.mockResolvedValueOnce({
        id: 3,
        email: 'carlos@example.com',
        name: 'Carlos Gómez',
        role: 'RESIDENT'
      });
      
      // 10. Notificar categorización manual
      const notifyResult2 = await notificationService.notifyStatusChange(
        125,
        PQRStatus.CATEGORIZED,
        PQRStatus.OPEN,
        null,
        'PQR categorizado manualmente'
      );
      
      // Verificar notificación
      expect(notifyResult2).toBe(true);
      
      // 11. Mock para métricas (error en una consulta)
      prisma.pQR.groupBy.mockRejectedValueOnce(new Error('Error en métricas'));
      
      // 12. Generar métricas (debe usar valores por defecto)
      const metrics = await metricsService.getSummaryMetrics();
      
      // Verificar métricas por defecto
      expect(metrics).toEqual({
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
});
