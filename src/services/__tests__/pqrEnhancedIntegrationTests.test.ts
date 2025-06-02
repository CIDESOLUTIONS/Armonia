/**
 * Pruebas de integración mejoradas para los flujos principales del sistema PQR
 * 
 * Estas pruebas verifican la interacción entre los diferentes servicios
 * del sistema PQR (asignación, notificaciones y métricas) en escenarios
 * completos de uso.
 */

import { PrismaClient, PQRCategory, PQRPriority, PQRStatus } from '@prisma/client';
import { PQRAssignmentService } from '../pqrAssignmentService';
import { PQRNotificationService } from '../pqrNotificationService';
import { PQRMetricsService } from '../pqrMetricsService';
import { ActivityLogger } from '@/lib/logging/activity-logger';

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
    },
    complex: {
      findUnique: jest.fn()
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

jest.mock('@/lib/logging/activity-logger', () => ({
  ActivityLogger: {
    log: jest.fn().mockResolvedValue(true)
  }
}));

describe('PQR System Integration Tests - Flujos Principales', () => {
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
  
  describe('Flujo completo de PQR con asignación inteligente', () => {
    it('debe procesar un PQR desde creación hasta resolución con asignación inteligente', async () => {
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
        name: 'Equipo de Mantenimiento',
        memberIds: [10, 11]
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
      
      prisma.pQR.create.mockResolvedValueOnce(mockPQR);
      
      // 5. Configurar mocks para el servicio de notificaciones
      // Mock para findUnique en notificaciones
      prisma.pQR.findUnique.mockResolvedValue(mockPQR);
      
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
      
      // 6. Enviar notificación de creación
      const notificationResult = await notificationService.notifyStatusChange(
        mockPQR.id,
        PQRStatus.OPEN,
        undefined,
        1, // userId
        'PQR creado correctamente'
      );
      
      // Verificar resultado de notificación
      expect(notificationResult).toBe(true);
      
      // 7. Simular asignación a un técnico específico
      const updatedPQR = {
        ...mockPQR,
        status: PQRStatus.ASSIGNED,
        assignedToId: 10,
        assignedToName: 'Técnico 1',
        assignedToRole: 'STAFF',
        assignedAt: new Date()
      };
      
      prisma.pQR.update.mockResolvedValueOnce(updatedPQR);
      prisma.pQR.findUnique.mockResolvedValue(updatedPQR);
      
      // 8. Enviar notificación de asignación
      const assignNotificationResult = await notificationService.notifyStatusChange(
        mockPQR.id,
        PQRStatus.ASSIGNED,
        PQRStatus.OPEN,
        5, // adminId
        'Asignado al técnico 1'
      );
      
      // Verificar resultado de notificación
      expect(assignNotificationResult).toBe(true);
      
      // 9. Simular cambio a estado en progreso
      const inProgressPQR = {
        ...updatedPQR,
        status: PQRStatus.IN_PROGRESS
      };
      
      prisma.pQR.update.mockResolvedValueOnce(inProgressPQR);
      prisma.pQR.findUnique.mockResolvedValue(inProgressPQR);
      
      // 10. Enviar notificación de cambio a en progreso
      const inProgressNotificationResult = await notificationService.notifyStatusChange(
        mockPQR.id,
        PQRStatus.IN_PROGRESS,
        PQRStatus.ASSIGNED,
        10, // técnicoId
        'Iniciando trabajos de reparación'
      );
      
      // Verificar resultado de notificación
      expect(inProgressNotificationResult).toBe(true);
      
      // 11. Simular resolución del PQR
      const resolvedPQR = {
        ...inProgressPQR,
        status: PQRStatus.RESOLVED,
        resolvedAt: new Date(),
        resolution: 'Se reparó la fuga de agua y se verificó su correcto funcionamiento'
      };
      
      prisma.pQR.update.mockResolvedValueOnce(resolvedPQR);
      prisma.pQR.findUnique.mockResolvedValue(resolvedPQR);
      
      // 12. Enviar notificación de resolución
      const resolvedNotificationResult = await notificationService.notifyStatusChange(
        mockPQR.id,
        PQRStatus.RESOLVED,
        PQRStatus.IN_PROGRESS,
        10, // técnicoId
        'Fuga reparada correctamente'
      );
      
      // Verificar resultado de notificación
      expect(resolvedNotificationResult).toBe(true);
      
      // 13. Configurar mocks para encuesta de satisfacción
      prisma.$queryRaw.mockResolvedValueOnce([{ satisfactionSurveyEnabled: true }]);
      
      // 14. Enviar encuesta de satisfacción
      const surveyResult = await notificationService.sendSatisfactionSurvey(mockPQR.id);
      
      // Verificar resultado de encuesta
      expect(surveyResult).toBe(true);
      
      // 15. Simular calificación y cierre del PQR
      const closedPQR = {
        ...resolvedPQR,
        status: PQRStatus.CLOSED,
        satisfactionRating: 5,
        satisfactionComment: 'Excelente servicio, muy rápido',
        closedAt: new Date()
      };
      
      prisma.pQR.update.mockResolvedValueOnce(closedPQR);
      prisma.pQR.findUnique.mockResolvedValue(closedPQR);
      
      // 16. Enviar notificación de cierre
      const closedNotificationResult = await notificationService.notifyStatusChange(
        mockPQR.id,
        PQRStatus.CLOSED,
        PQRStatus.RESOLVED,
        1, // userId
        'PQR cerrado con calificación 5/5'
      );
      
      // Verificar resultado de notificación
      expect(closedNotificationResult).toBe(true);
      
      // 17. Configurar mocks para métricas
      // Conteo por estado
      prisma.pQR.groupBy.mockResolvedValueOnce([
        { status: 'OPEN', _count: { id: 5 } },
        { status: 'ASSIGNED', _count: { id: 3 } },
        { status: 'IN_PROGRESS', _count: { id: 2 } },
        { status: 'RESOLVED', _count: { id: 10 } },
        { status: 'CLOSED', _count: { id: 8 } }
      ]);
      
      // PQRs resueltos para tiempos
      prisma.pQR.findMany.mockResolvedValueOnce([
        closedPQR,
        {
          submittedAt: new Date(Date.now() - 7200000), // 2 horas antes
          assignedAt: new Date(Date.now() - 6000000), // 100 minutos antes
          resolvedAt: new Date(Date.now() - 3600000), // 1 hora antes
          satisfactionRating: 4
        }
      ]);
      
      // Métricas de SLA
      prisma.pQR.findMany.mockResolvedValueOnce([
        {
          resolvedAt: closedPQR.resolvedAt,
          dueDate: closedPQR.dueDate,
          slaBreached: false
        },
        {
          resolvedAt: new Date(Date.now() - 1800000),
          dueDate: new Date(Date.now() - 900000),
          slaBreached: true
        }
      ]);
      
      // 18. Obtener métricas de resumen
      const metricsResult = await metricsService.getSummaryMetrics();
      
      // Verificar resultado de métricas
      expect(metricsResult.totalCount).toBe(28);
      expect(metricsResult.openCount).toBe(5);
      expect(metricsResult.resolvedCount).toBe(10);
      expect(metricsResult.closedCount).toBe(8);
      expect(metricsResult.averageResponseTime).toBeGreaterThan(0);
      expect(metricsResult.averageResolutionTime).toBeGreaterThan(0);
      expect(metricsResult.satisfactionRate).toBeGreaterThan(0);
      
      // 19. Verificar que se registraron todas las actividades
      expect(ActivityLogger.log).toHaveBeenCalledTimes(5); // Una por cada cambio de estado
    });
  });
  
  describe('Flujo de PQR con reapertura y escalamiento', () => {
    it('debe manejar correctamente la reapertura y escalamiento de un PQR', async () => {
      // 1. Configurar PQR resuelto
      const resolvedPQR = {
        id: 124,
        ticketNumber: 'PQR-20250602-002',
        title: 'Problema eléctrico',
        description: 'Falla en el sistema eléctrico del área común',
        category: PQRCategory.MAINTENANCE,
        subcategory: 'Eléctrico',
        priority: PQRPriority.MEDIUM,
        status: PQRStatus.RESOLVED,
        userId: 2,
        userName: 'María López',
        userRole: 'RESIDENT',
        unitId: 102,
        unitNumber: '102',
        complexId: 1,
        assignedToId: 11,
        assignedToName: 'Técnico 2',
        assignedToRole: 'STAFF',
        submittedAt: new Date(Date.now() - 86400000), // 1 día antes
        assignedAt: new Date(Date.now() - 72000000), // 20 horas antes
        resolvedAt: new Date(Date.now() - 43200000), // 12 horas antes
        resolution: 'Se reparó el sistema eléctrico'
      };
      
      prisma.pQR.findUnique.mockResolvedValue(resolvedPQR);
      
      // 2. Configurar mocks para notificaciones
      prisma.$queryRaw.mockResolvedValueOnce([{ autoNotifyEnabled: true }]);
      
      // Usuario que reportó
      prisma.user.findUnique.mockResolvedValueOnce({
        id: 2,
        email: 'maria.lopez@example.com',
        name: 'María López',
        role: 'RESIDENT'
      });
      
      // Técnico asignado
      prisma.user.findUnique.mockResolvedValueOnce({
        id: 11,
        email: 'tecnico2@example.com',
        name: 'Técnico 2',
        role: 'STAFF'
      });
      
      // Administradores
      prisma.user.findMany.mockResolvedValueOnce([
        {
          id: 5,
          email: 'admin@example.com',
          name: 'Administrador',
          role: 'COMPLEX_ADMIN'
        }
      ]);
      
      // 3. Simular reapertura del PQR
      const reopenedPQR = {
        ...resolvedPQR,
        status: PQRStatus.REOPENED,
        reopenReason: 'El problema persiste, sigue habiendo cortes de energía',
        reopenedAt: new Date()
      };
      
      prisma.pQR.update.mockResolvedValueOnce(reopenedPQR);
      prisma.pQR.findUnique.mockResolvedValue(reopenedPQR);
      
      // 4. Enviar notificación de reapertura
      const reopenNotificationResult = await notificationService.notifyStatusChange(
        reopenedPQR.id,
        PQRStatus.REOPENED,
        PQRStatus.RESOLVED,
        2, // userId
        'El problema persiste, sigue habiendo cortes de energía'
      );
      
      // Verificar resultado de notificación
      expect(reopenNotificationResult).toBe(true);
      
      // 5. Configurar mocks para escalamiento
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
      
      // Equipo especializado
      prisma.$queryRaw.mockResolvedValueOnce([{
        id: 3,
        name: 'Equipo Especializado',
        memberIds: [12, 13]
      }]);
      
      // 6. Procesar escalamiento con el servicio de asignación
      const escalationResult = await assignmentService.processPQR({
        ...reopenedPQR,
        description: reopenedPQR.description + ' ' + reopenedPQR.reopenReason,
        escalated: true
      });
      
      // Verificar resultado de escalamiento
      expect(escalationResult.priority).toBe(PQRPriority.HIGH); // Aumentó la prioridad
      expect(escalationResult.assignedTeamId).toBe(3); // Cambió el equipo asignado
      
      // 7. Simular actualización del PQR escalado
      const escalatedPQR = {
        ...reopenedPQR,
        status: PQRStatus.ASSIGNED,
        priority: PQRPriority.HIGH,
        assignedTeamId: 3,
        assignedToId: null,
        assignedToName: null,
        assignedAt: new Date()
      };
      
      prisma.pQR.update.mockResolvedValueOnce(escalatedPQR);
      prisma.pQR.findUnique.mockResolvedValue(escalatedPQR);
      
      // 8. Enviar notificación de escalamiento
      const escalationNotificationResult = await notificationService.notifyStatusChange(
        escalatedPQR.id,
        PQRStatus.ASSIGNED,
        PQRStatus.REOPENED,
        5, // adminId
        'Escalado a equipo especializado con prioridad alta'
      );
      
      // Verificar resultado de notificación
      expect(escalationNotificationResult).toBe(true);
      
      // 9. Simular asignación a técnico especializado
      const assignedEscalatedPQR = {
        ...escalatedPQR,
        assignedToId: 12,
        assignedToName: 'Especialista 1',
        assignedToRole: 'SPECIALIST'
      };
      
      prisma.pQR.update.mockResolvedValueOnce(assignedEscalatedPQR);
      prisma.pQR.findUnique.mockResolvedValue(assignedEscalatedPQR);
      
      // Miembros del equipo especializado
      prisma.user.findMany.mockResolvedValueOnce([
        {
          id: 12,
          email: 'especialista1@example.com',
          name: 'Especialista 1',
          role: 'SPECIALIST'
        },
        {
          id: 13,
          email: 'especialista2@example.com',
          name: 'Especialista 2',
          role: 'SPECIALIST'
        }
      ]);
      
      // 10. Enviar notificación de asignación a especialista
      const specialistAssignNotificationResult = await notificationService.notifyStatusChange(
        assignedEscalatedPQR.id,
        PQRStatus.ASSIGNED,
        PQRStatus.ASSIGNED,
        5, // adminId
        'Asignado a especialista eléctrico'
      );
      
      // Verificar resultado de notificación
      expect(specialistAssignNotificationResult).toBe(true);
      
      // 11. Simular resolución final del PQR
      const finalResolvedPQR = {
        ...assignedEscalatedPQR,
        status: PQRStatus.RESOLVED,
        resolvedAt: new Date(),
        resolution: 'Se identificó y reparó un problema en el tablero principal que causaba los cortes intermitentes'
      };
      
      prisma.pQR.update.mockResolvedValueOnce(finalResolvedPQR);
      prisma.pQR.findUnique.mockResolvedValue(finalResolvedPQR);
      
      // 12. Enviar notificación de resolución final
      const finalResolvedNotificationResult = await notificationService.notifyStatusChange(
        finalResolvedPQR.id,
        PQRStatus.RESOLVED,
        PQRStatus.ASSIGNED,
        12, // especialistaId
        'Problema resuelto definitivamente'
      );
      
      // Verificar resultado de notificación
      expect(finalResolvedNotificationResult).toBe(true);
      
      // 13. Configurar mocks para encuesta de satisfacción
      prisma.$queryRaw.mockResolvedValueOnce([{ satisfactionSurveyEnabled: true }]);
      
      // 14. Enviar encuesta de satisfacción
      const surveyResult = await notificationService.sendSatisfactionSurvey(finalResolvedPQR.id);
      
      // Verificar resultado de encuesta
      expect(surveyResult).toBe(true);
      
      // 15. Verificar que se registraron todas las actividades
      expect(ActivityLogger.log).toHaveBeenCalledTimes(4); // Una por cada cambio de estado
    });
  });
  
  describe('Flujo de recordatorios y alertas de SLA', () => {
    it('debe enviar recordatorios para PQRs próximos a vencer y generar alertas de SLA', async () => {
      // Fecha actual
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      // 1. Configurar PQRs que vencen pronto
      prisma.pQR.findMany.mockResolvedValueOnce([
        {
          id: 125,
          ticketNumber: 'PQR-20250602-003',
          title: 'Problema de seguridad',
          status: PQRStatus.IN_PROGRESS,
          userId: 3,
          assignedToId: 14,
          dueDate: tomorrow
        },
        {
          id: 126,
          ticketNumber: 'PQR-20250602-004',
          title: 'Solicitud administrativa',
          status: PQRStatus.ASSIGNED,
          userId: 4,
          assignedTeamId: 4,
          dueDate: tomorrow
        }
      ]);
      
      // 2. Configurar mocks para el primer PQR
      prisma.pQR.findUnique.mockResolvedValueOnce({
        id: 125,
        ticketNumber: 'PQR-20250602-003',
        title: 'Problema de seguridad',
        status: PQRStatus.IN_PROGRESS,
        userId: 3,
        assignedToId: 14,
        dueDate: tomorrow
      });
      
      // Usuario que reportó
      prisma.user.findUnique.mockResolvedValueOnce({
        id: 3,
        email: 'pedro.gomez@example.com',
        name: 'Pedro Gómez',
        role: 'RESIDENT'
      });
      
      // Usuario asignado
      prisma.user.findUnique.mockResolvedValueOnce({
        id: 14,
        email: 'seguridad@example.com',
        name: 'Oficial de Seguridad',
        role: 'SECURITY'
      });
      
      // 3. Configurar mocks para el segundo PQR
      prisma.pQR.findUnique.mockResolvedValueOnce({
        id: 126,
        ticketNumber: 'PQR-20250602-004',
        title: 'Solicitud administrativa',
        status: PQRStatus.ASSIGNED,
        userId: 4,
        assignedTeamId: 4,
        dueDate: tomorrow
      });
      
      // Usuario que reportó
      prisma.user.findUnique.mockResolvedValueOnce({
        id: 4,
        email: 'ana.martinez@example.com',
        name: 'Ana Martínez',
        role: 'RESIDENT'
      });
      
      // Equipo administrativo
      prisma.$queryRaw.mockResolvedValueOnce({
        id: 4,
        name: 'Equipo Administrativo',
        memberIds: [15, 16]
      });
      
      // Miembros del equipo
      prisma.user.findMany.mockResolvedValueOnce([
        {
          id: 15,
          email: 'admin1@example.com',
          name: 'Administrativo 1',
          role: 'STAFF'
        },
        {
          id: 16,
          email: 'admin2@example.com',
          name: 'Administrativo 2',
          role: 'STAFF'
        }
      ]);
      
      // 4. Enviar recordatorios
      const reminderCount = await notificationService.sendDueDateReminders();
      
      // Verificar resultado
      expect(reminderCount).toBeGreaterThan(0);
      
      // 5. Configurar mocks para métricas de SLA
      // Conteo por estado
      prisma.pQR.groupBy.mockResolvedValueOnce([
        { status: 'OPEN', _count: { id: 5 } },
        { status: 'ASSIGNED', _count: { id: 3 } },
        { status: 'IN_PROGRESS', _count: { id: 2 } },
        { status: 'RESOLVED', _count: { id: 10 } },
        { status: 'CLOSED', _count: { id: 8 } }
      ]);
      
      // PQRs resueltos para tiempos
      prisma.pQR.findMany.mockResolvedValueOnce([]);
      
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
      
      // 6. Obtener métricas de SLA
      const slaMetrics = await metricsService.getSLAMetrics();
      
      // Verificar resultado
      expect(slaMetrics.compliantCount).toBe(1);
      expect(slaMetrics.nonCompliantCount).toBe(1);
      expect(slaMetrics.complianceRate).toBe(50);
      
      // 7. Configurar mocks para actividad reciente
      prisma.pQRStatusHistory.findMany.mockResolvedValueOnce([
        {
          changedAt: new Date(),
          previousStatus: 'OPEN',
          newStatus: 'ASSIGNED',
          pqrId: 125,
          pqr: {
            id: 125,
            ticketNumber: 'PQR-20250602-003',
            title: 'Problema de seguridad'
          }
        },
        {
          changedAt: new Date(),
          previousStatus: 'ASSIGNED',
          newStatus: 'IN_PROGRESS',
          pqrId: 125,
          pqr: {
            id: 125,
            ticketNumber: 'PQR-20250602-003',
            title: 'Problema de seguridad'
          }
        }
      ]);
      
      // 8. Obtener actividad reciente
      const recentActivity = await metricsService.getRecentActivity();
      
      // Verificar resultado
      expect(recentActivity).toHaveLength(2);
      expect(recentActivity[0].pqrId).toBe(125);
      expect(recentActivity[0].action).toContain('Cambio de estado');
    });
  });
  
  describe('Generación de dashboard completo', () => {
    it('debe generar dashboard completo con todos los indicadores', async () => {
      // Mocks para todos los métodos individuales
      jest.spyOn(metricsService, 'getSummaryMetrics').mockResolvedValueOnce({
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
      
      jest.spyOn(metricsService, 'getCategoryDistribution').mockResolvedValueOnce([
        { category: 'MAINTENANCE', count: 15, percentage: 53.57 },
        { category: 'SECURITY', count: 8, percentage: 28.57 },
        { category: 'ADMINISTRATIVE', count: 5, percentage: 17.86 }
      ]);
      
      jest.spyOn(metricsService, 'getPriorityDistribution').mockResolvedValueOnce([
        { priority: 'HIGH', count: 10, percentage: 35.71 },
        { priority: 'MEDIUM', count: 12, percentage: 42.86 },
        { priority: 'LOW', count: 6, percentage: 21.43 }
      ]);
      
      jest.spyOn(metricsService, 'getStatusDistribution').mockResolvedValueOnce([
        { status: 'OPEN', count: 5, percentage: 17.86 },
        { status: 'ASSIGNED', count: 3, percentage: 10.71 },
        { status: 'IN_PROGRESS', count: 2, percentage: 7.14 },
        { status: 'RESOLVED', count: 10, percentage: 35.71 },
        { status: 'CLOSED', count: 8, percentage: 28.57 }
      ]);
      
      jest.spyOn(metricsService, 'getTimeTrend').mockResolvedValueOnce([
        { period: '2025-01', count: 8, resolvedCount: 7, averageResolutionTime: 110 },
        { period: '2025-02', count: 12, resolvedCount: 10, averageResolutionTime: 95 },
        { period: '2025-03', count: 15, resolvedCount: 12, averageResolutionTime: 105 },
        { period: '2025-04', count: 10, resolvedCount: 9, averageResolutionTime: 100 },
        { period: '2025-05', count: 14, resolvedCount: 11, averageResolutionTime: 90 },
        { period: '2025-06', count: 10, resolvedCount: 8, averageResolutionTime: 85 }
      ]);
      
      jest.spyOn(metricsService, 'getSLAMetrics').mockResolvedValueOnce({
        compliantCount: 15,
        nonCompliantCount: 5,
        complianceRate: 75,
        averageDeviationTime: 60
      });
      
      jest.spyOn(metricsService, 'getTopAssignees').mockResolvedValueOnce([
        {
          assigneeId: 10,
          assigneeName: 'Técnico 1',
          totalAssigned: 8,
          resolvedCount: 6,
          averageResolutionTime: 100,
          slaComplianceRate: 83.33
        },
        {
          assigneeId: 11,
          assigneeName: 'Técnico 2',
          totalAssigned: 5,
          resolvedCount: 4,
          averageResolutionTime: 120,
          slaComplianceRate: 75
        },
        {
          assigneeId: 12,
          assigneeName: 'Especialista 1',
          totalAssigned: 3,
          resolvedCount: 3,
          averageResolutionTime: 90,
          slaComplianceRate: 100
        }
      ]);
      
      jest.spyOn(metricsService, 'getRecentActivity').mockResolvedValueOnce([
        {
          date: new Date(),
          action: 'Cambio de estado: OPEN → ASSIGNED',
          pqrId: 123,
          ticketNumber: 'PQR-20250602-001',
          title: 'Problema de mantenimiento'
        },
        {
          date: new Date(),
          action: 'Cambio de estado: ASSIGNED → IN_PROGRESS',
          pqrId: 123,
          ticketNumber: 'PQR-20250602-001',
          title: 'Problema de mantenimiento'
        },
        {
          date: new Date(),
          action: 'Cambio de estado: RESOLVED → REOPENED',
          pqrId: 124,
          ticketNumber: 'PQR-20250602-002',
          title: 'Problema eléctrico'
        }
      ]);
      
      // Generar dashboard completo
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
      
      // Verificar datos específicos
      expect(dashboardMetrics.summary.totalCount).toBe(28);
      expect(dashboardMetrics.summary.satisfactionRate).toBe(4.5);
      expect(dashboardMetrics.categoryDistribution).toHaveLength(3);
      expect(dashboardMetrics.timeTrend).toHaveLength(6);
      expect(dashboardMetrics.topAssignees).toHaveLength(3);
      expect(dashboardMetrics.recentActivity).toHaveLength(3);
      
      // Verificar filtrado
      const categoryFilter = { category: PQRCategory.MAINTENANCE };
      await metricsService.generateDashboardMetrics(categoryFilter);
      
      expect(metricsService.getSummaryMetrics).toHaveBeenLastCalledWith(categoryFilter);
      expect(metricsService.getCategoryDistribution).toHaveBeenLastCalledWith(categoryFilter);
      
      // Verificar filtrado por fecha
      const dateFilter = { 
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-06-30')
      };
      await metricsService.generateDashboardMetrics(dateFilter);
      
      expect(metricsService.getSummaryMetrics).toHaveBeenLastCalledWith(dateFilter);
      expect(metricsService.getTimeTrend).toHaveBeenLastCalledWith(dateFilter);
    });
  });
});
