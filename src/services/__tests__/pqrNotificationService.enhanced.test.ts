/**
 * Pruebas unitarias avanzadas para el servicio de notificaciones de PQR
 * 
 * Estas pruebas amplían la cobertura del servicio de notificaciones con casos
 * más complejos, múltiples canales y escenarios de error.
 */

import { PQRNotificationService } from '../pqrNotificationService';
import { PrismaClient, PQRStatus, NotificationChannel } from '@prisma/client';
import { sendEmail } from '@/lib/communications/email-service';
import { sendPushNotification } from '@/lib/communications/push-notification-service';
import { sendSMS } from '@/lib/communications/sms-service';
import { sendWhatsAppMessage } from '@/lib/communications/whatsapp-service';

// Mock de PrismaClient
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    $queryRaw: jest.fn(),
    pQR: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn()
    },
    pQRNotification: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn()
    },
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn()
    },
    userNotificationPreference: {
      findUnique: jest.fn()
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
    NotificationChannel: {
      EMAIL: 'EMAIL',
      PUSH: 'PUSH',
      SMS: 'SMS',
      WHATSAPP: 'WHATSAPP',
      IN_APP: 'IN_APP'
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

jest.mock('@/lib/communications/whatsapp-service', () => ({
  sendWhatsAppMessage: jest.fn().mockResolvedValue(true)
}));

describe('PQRNotificationService - Pruebas Avanzadas', () => {
  let service: PQRNotificationService;
  let prisma: any;
  
  beforeEach(() => {
    // Limpiar todos los mocks
    jest.clearAllMocks();
    
    // Crear instancia del servicio con schema de prueba
    service = new PQRNotificationService('test_schema');
    
    // Obtener la instancia de prisma para configurar mocks
    prisma = (service as any).prisma;
  });
  
  describe('notifyStatusChange - Canales Múltiples', () => {
    it('debe enviar notificaciones por múltiples canales según preferencias del usuario', async () => {
      // Mock para PQR
      prisma.pQR.findUnique.mockResolvedValue({
        id: 123,
        ticketNumber: 'PQR-20250602-001',
        title: 'Problema de mantenimiento',
        status: PQRStatus.ASSIGNED,
        userId: 1,
        assignedToId: 10,
        dueDate: new Date()
      });
      
      // Mock para configuración
      prisma.$queryRaw.mockResolvedValueOnce([{ 
        autoNotifyEnabled: true,
        enabledChannels: JSON.stringify(['EMAIL', 'PUSH', 'SMS', 'WHATSAPP'])
      }]);
      
      // Mock para usuario que reportó con preferencias
      prisma.user.findUnique.mockResolvedValueOnce({
        id: 1,
        email: 'usuario@example.com',
        name: 'Usuario Test',
        role: 'RESIDENT',
        phone: '+573001234567'
      });
      
      // Mock para preferencias de notificación del usuario
      prisma.userNotificationPreference.findUnique.mockResolvedValueOnce({
        userId: 1,
        channels: JSON.stringify(['EMAIL', 'WHATSAPP']),
        pqrStatusUpdates: true
      });
      
      // Mock para usuario asignado con preferencias
      prisma.user.findUnique.mockResolvedValueOnce({
        id: 10,
        email: 'tecnico@example.com',
        name: 'Técnico Test',
        role: 'STAFF',
        phone: '+573007654321'
      });
      
      // Mock para preferencias de notificación del técnico
      prisma.userNotificationPreference.findUnique.mockResolvedValueOnce({
        userId: 10,
        channels: JSON.stringify(['PUSH', 'SMS']),
        pqrAssignments: true
      });
      
      // Ejecutar el método
      const result = await service.notifyStatusChange(
        123,
        PQRStatus.IN_PROGRESS,
        PQRStatus.ASSIGNED,
        10,
        'Iniciando trabajo en la solicitud'
      );
      
      // Verificar resultado
      expect(result).toBe(true);
      
      // Verificar que se enviaron notificaciones por los canales correctos
      // Para el usuario residente (EMAIL, WHATSAPP)
      expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({
        to: 'usuario@example.com'
      }));
      expect(sendWhatsAppMessage).toHaveBeenCalledWith(expect.objectContaining({
        to: '+573001234567'
      }));
      expect(sendPushNotification).not.toHaveBeenCalledWith(expect.objectContaining({
        userId: 1
      }));
      
      // Para el técnico (PUSH, SMS)
      expect(sendPushNotification).toHaveBeenCalledWith(expect.objectContaining({
        userId: 10
      }));
      expect(sendSMS).toHaveBeenCalledWith(expect.objectContaining({
        to: '+573007654321'
      }));
      expect(sendEmail).not.toHaveBeenCalledWith(expect.objectContaining({
        to: 'tecnico@example.com'
      }));
      
      // Verificar que se registraron las notificaciones
      expect(prisma.pQRNotification.create).toHaveBeenCalledTimes(4); // 2 usuarios x 2 canales cada uno
    });
    
    it('debe respetar horarios de no molestar para notificaciones', async () => {
      // Configurar fecha actual para simular horario nocturno
      const nightTime = new Date('2025-06-02T23:30:00');
      jest.spyOn(global, 'Date').mockImplementation(() => nightTime as any);
      
      // Mock para PQR
      prisma.pQR.findUnique.mockResolvedValue({
        id: 123,
        ticketNumber: 'PQR-20250602-001',
        title: 'Problema de mantenimiento',
        status: PQRStatus.ASSIGNED,
        userId: 1,
        assignedToId: 10,
        dueDate: new Date()
      });
      
      // Mock para configuración
      prisma.$queryRaw.mockResolvedValueOnce([{ 
        autoNotifyEnabled: true,
        enabledChannels: JSON.stringify(['EMAIL', 'PUSH', 'SMS', 'WHATSAPP']),
        respectDoNotDisturb: true
      }]);
      
      // Mock para usuario con horario de no molestar
      prisma.user.findUnique.mockResolvedValueOnce({
        id: 1,
        email: 'usuario@example.com',
        name: 'Usuario Test',
        role: 'RESIDENT',
        phone: '+573001234567'
      });
      
      // Mock para preferencias con horario de no molestar
      prisma.userNotificationPreference.findUnique.mockResolvedValueOnce({
        userId: 1,
        channels: JSON.stringify(['EMAIL', 'PUSH', 'SMS', 'WHATSAPP']),
        pqrStatusUpdates: true,
        doNotDisturbStart: '22:00',
        doNotDisturbEnd: '08:00'
      });
      
      // Mock para técnico sin horario de no molestar
      prisma.user.findUnique.mockResolvedValueOnce({
        id: 10,
        email: 'tecnico@example.com',
        name: 'Técnico Test',
        role: 'STAFF',
        phone: '+573007654321'
      });
      
      // Mock para preferencias sin horario de no molestar
      prisma.userNotificationPreference.findUnique.mockResolvedValueOnce({
        userId: 10,
        channels: JSON.stringify(['EMAIL', 'PUSH', 'SMS']),
        pqrAssignments: true
      });
      
      // Ejecutar el método
      const result = await service.notifyStatusChange(
        123,
        PQRStatus.IN_PROGRESS,
        PQRStatus.ASSIGNED,
        10,
        'Iniciando trabajo en la solicitud'
      );
      
      // Verificar resultado
      expect(result).toBe(true);
      
      // Verificar que solo se envió email al usuario (respetando no molestar)
      expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({
        to: 'usuario@example.com'
      }));
      expect(sendPushNotification).not.toHaveBeenCalledWith(expect.objectContaining({
        userId: 1
      }));
      expect(sendSMS).not.toHaveBeenCalledWith(expect.objectContaining({
        to: '+573001234567'
      }));
      expect(sendWhatsAppMessage).not.toHaveBeenCalledWith(expect.objectContaining({
        to: '+573001234567'
      }));
      
      // Verificar que se enviaron todas las notificaciones al técnico
      expect(sendPushNotification).toHaveBeenCalledWith(expect.objectContaining({
        userId: 10
      }));
      expect(sendSMS).toHaveBeenCalledWith(expect.objectContaining({
        to: '+573007654321'
      }));
      expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({
        to: 'tecnico@example.com'
      }));
      
      // Restaurar Date
      jest.spyOn(global, 'Date').mockRestore();
    });
    
    it('debe enviar notificaciones de alta prioridad incluso en horario de no molestar', async () => {
      // Configurar fecha actual para simular horario nocturno
      const nightTime = new Date('2025-06-02T23:30:00');
      jest.spyOn(global, 'Date').mockImplementation(() => nightTime as any);
      
      // Mock para PQR urgente
      prisma.pQR.findUnique.mockResolvedValue({
        id: 123,
        ticketNumber: 'PQR-20250602-001',
        title: 'URGENTE: Fuga de agua',
        status: PQRStatus.OPEN,
        priority: 'URGENT',
        userId: 1,
        assignedToId: 10,
        dueDate: new Date()
      });
      
      // Mock para configuración
      prisma.$queryRaw.mockResolvedValueOnce([{ 
        autoNotifyEnabled: true,
        enabledChannels: JSON.stringify(['EMAIL', 'PUSH', 'SMS', 'WHATSAPP']),
        respectDoNotDisturb: true,
        bypassDoNotDisturbForUrgent: true
      }]);
      
      // Mock para usuario con horario de no molestar
      prisma.user.findUnique.mockResolvedValueOnce({
        id: 1,
        email: 'usuario@example.com',
        name: 'Usuario Test',
        role: 'RESIDENT',
        phone: '+573001234567'
      });
      
      // Mock para preferencias con horario de no molestar
      prisma.userNotificationPreference.findUnique.mockResolvedValueOnce({
        userId: 1,
        channels: JSON.stringify(['EMAIL', 'PUSH', 'SMS', 'WHATSAPP']),
        pqrStatusUpdates: true,
        doNotDisturbStart: '22:00',
        doNotDisturbEnd: '08:00'
      });
      
      // Ejecutar el método
      const result = await service.notifyStatusChange(
        123,
        PQRStatus.ASSIGNED,
        PQRStatus.OPEN,
        10,
        'Asignando técnico para atender urgencia'
      );
      
      // Verificar resultado
      expect(result).toBe(true);
      
      // Verificar que se enviaron todas las notificaciones a pesar del horario
      expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({
        to: 'usuario@example.com'
      }));
      expect(sendPushNotification).toHaveBeenCalledWith(expect.objectContaining({
        userId: 1
      }));
      expect(sendSMS).toHaveBeenCalledWith(expect.objectContaining({
        to: '+573001234567'
      }));
      expect(sendWhatsAppMessage).toHaveBeenCalledWith(expect.objectContaining({
        to: '+573001234567'
      }));
      
      // Restaurar Date
      jest.spyOn(global, 'Date').mockRestore();
    });
  });
  
  describe('sendDueDateReminders - Escenarios Avanzados', () => {
    it('debe enviar recordatorios escalonados según proximidad a la fecha límite', async () => {
      // Fecha actual
      const now = new Date();
      
      // Fechas límite en diferentes rangos
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const inFourHours = new Date(now);
      inFourHours.setHours(inFourHours.getHours() + 4);
      
      const inOneHour = new Date(now);
      inOneHour.setHours(inOneHour.getHours() + 1);
      
      // Mock para PQRs que vencen pronto
      prisma.pQR.findMany.mockResolvedValue([
        {
          id: 123,
          ticketNumber: 'PQR-20250602-001',
          title: 'Problema 1',
          status: PQRStatus.IN_PROGRESS,
          userId: 1,
          assignedToId: 10,
          dueDate: tomorrow,
          priority: 'MEDIUM'
        },
        {
          id: 124,
          ticketNumber: 'PQR-20250602-002',
          title: 'Problema 2',
          status: PQRStatus.IN_PROGRESS,
          userId: 2,
          assignedToId: 11,
          dueDate: inFourHours,
          priority: 'HIGH'
        },
        {
          id: 125,
          ticketNumber: 'PQR-20250602-003',
          title: 'Problema 3',
          status: PQRStatus.IN_PROGRESS,
          userId: 3,
          assignedToId: 12,
          dueDate: inOneHour,
          priority: 'URGENT'
        }
      ]);
      
      // Mock para verificar notificaciones previas
      prisma.pQRNotification.count.mockImplementation((params) => {
        const pqrId = params.where.pqrId;
        const type = params.where.type;
        
        // Simular que ya se envió un recordatorio para el PQR 123
        if (pqrId === 123 && type === 'DUE_DATE_REMINDER') {
          return Promise.resolve(1);
        }
        
        return Promise.resolve(0);
      });
      
      // Mock para usuarios
      prisma.user.findUnique.mockImplementation((params) => {
        const userId = params.where.id;
        
        if (userId === 10 || userId === 11 || userId === 12) {
          return Promise.resolve({
            id: userId,
            email: `tecnico${userId}@example.com`,
            name: `Técnico ${userId}`,
            role: 'STAFF',
            phone: `+57300${userId}00000`
          });
        }
        
        return Promise.resolve(null);
      });
      
      // Ejecutar el método
      const reminderCount = await service.sendDueDateReminders();
      
      // Verificar resultado
      expect(reminderCount).toBe(2); // Solo 2 porque uno ya tenía recordatorio
      
      // Verificar que se enviaron notificaciones con diferentes niveles de urgencia
      expect(sendEmail).toHaveBeenCalledTimes(2);
      expect(sendPushNotification).toHaveBeenCalledTimes(2);
      
      // Verificar que el PQR más urgente tiene mensaje más enfático
      const emailCalls = (sendEmail as jest.Mock).mock.calls;
      const urgentCall = emailCalls.find(call => 
        call[0].subject.includes('URGENTE') || 
        call[0].text.includes('URGENTE')
      );
      expect(urgentCall).toBeTruthy();
    });
    
    it('debe escalar notificaciones para PQRs con SLA incumplido', async () => {
      // Fecha actual
      const now = new Date();
      
      // Fecha vencida
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      
      // Mock para PQRs vencidos
      prisma.pQR.findMany.mockResolvedValueOnce([]);
      prisma.pQR.findMany.mockResolvedValueOnce([
        {
          id: 126,
          ticketNumber: 'PQR-20250602-004',
          title: 'Problema vencido',
          status: PQRStatus.IN_PROGRESS,
          userId: 4,
          assignedToId: 13,
          dueDate: yesterday,
          priority: 'HIGH',
          slaBreached: true
        }
      ]);
      
      // Mock para usuario asignado
      prisma.user.findUnique.mockResolvedValueOnce({
        id: 13,
        email: 'tecnico13@example.com',
        name: 'Técnico 13',
        role: 'STAFF',
        phone: '+573001300000'
      });
      
      // Mock para supervisor
      prisma.user.findMany.mockResolvedValueOnce([
        {
          id: 5,
          email: 'supervisor@example.com',
          name: 'Supervisor',
          role: 'SUPERVISOR',
          phone: '+573005000000'
        }
      ]);
      
      // Ejecutar el método
      const escalationCount = await (service as any).escalateBreachedSLA();
      
      // Verificar resultado
      expect(escalationCount).toBe(1);
      
      // Verificar que se notificó al técnico y al supervisor
      expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({
        to: 'tecnico13@example.com'
      }));
      expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({
        to: 'supervisor@example.com'
      }));
      
      // Verificar que se registraron las notificaciones
      expect(prisma.pQRNotification.create).toHaveBeenCalledTimes(2);
    });
  });
  
  describe('sendSatisfactionSurvey - Personalización', () => {
    it('debe enviar encuesta personalizada según tipo y categoría de PQR', async () => {
      // Mock para PQR resuelto
      prisma.pQR.findUnique.mockResolvedValue({
        id: 123,
        ticketNumber: 'PQR-20250602-001',
        title: 'Problema de mantenimiento',
        status: PQRStatus.RESOLVED,
        userId: 1,
        category: 'MAINTENANCE',
        subcategory: 'Plomería',
        type: 'COMPLAINT'
      });
      
      // Mock para configuración
      prisma.$queryRaw.mockResolvedValueOnce([{ 
        satisfactionSurveyEnabled: true,
        customSurveys: JSON.stringify({
          'MAINTENANCE': {
            template: 'maintenance_survey',
            questions: [
              'Califique la rapidez de respuesta',
              'Califique la calidad del trabajo realizado',
              'Califique la limpieza después del trabajo'
            ]
          }
        })
      }]);
      
      // Mock para usuario
      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        email: 'usuario@example.com',
        name: 'Usuario Test',
        role: 'RESIDENT'
      });
      
      // Ejecutar el método
      const result = await service.sendSatisfactionSurvey(123);
      
      // Verificar resultado
      expect(result).toBe(true);
      
      // Verificar que se envió la encuesta personalizada
      expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({
        to: 'usuario@example.com',
        subject: expect.stringContaining('Encuesta de satisfacción'),
        text: expect.stringContaining('Califique la rapidez de respuesta')
      }));
      
      // Verificar que se registró la notificación
      expect(prisma.pQRNotification.create).toHaveBeenCalled();
    });
    
    it('debe programar recordatorio si la encuesta no se completa', async () => {
      // Mock para PQR resuelto
      prisma.pQR.findUnique.mockResolvedValue({
        id: 123,
        ticketNumber: 'PQR-20250602-001',
        title: 'Problema de mantenimiento',
        status: PQRStatus.RESOLVED,
        userId: 1,
        resolvedAt: new Date(Date.now() - 86400000) // Resuelto hace 1 día
      });
      
      // Mock para configuración
      prisma.$queryRaw.mockResolvedValueOnce([{ 
        satisfactionSurveyEnabled: true,
        surveyReminderEnabled: true,
        surveyReminderDelay: 48 // 48 horas
      }]);
      
      // Mock para usuario
      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        email: 'usuario@example.com',
        name: 'Usuario Test',
        role: 'RESIDENT'
      });
      
      // Mock para verificar si ya se envió la encuesta
      prisma.pQRNotification.findMany.mockResolvedValueOnce([
        {
          id: 500,
          pqrId: 123,
          userId: 1,
          type: 'SATISFACTION_SURVEY',
          sentAt: new Date(Date.now() - 86400000) // Enviada hace 1 día
        }
      ]);
      
      // Mock para verificar si ya se completó la encuesta
      prisma.pQR.findUnique.mockResolvedValueOnce({
        id: 123,
        satisfactionRating: null, // No se ha completado
        satisfactionComment: null
      });
      
      // Ejecutar el método para enviar recordatorios
      const reminderCount = await (service as any).sendSurveyReminders();
      
      // Verificar resultado
      expect(reminderCount).toBe(0); // Aún no han pasado las 48 horas
      
      // Modificar el mock para simular que pasaron 3 días
      prisma.pQRNotification.findMany.mockResolvedValueOnce([
        {
          id: 500,
          pqrId: 123,
          userId: 1,
          type: 'SATISFACTION_SURVEY',
          sentAt: new Date(Date.now() - 3 * 86400000) // Enviada hace 3 días
        }
      ]);
      
      // Ejecutar el método nuevamente
      const reminderCount2 = await (service as any).sendSurveyReminders();
      
      // Verificar resultado
      expect(reminderCount2).toBe(1);
      
      // Verificar que se envió el recordatorio
      expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({
        to: 'usuario@example.com',
        subject: expect.stringContaining('Recordatorio')
      }));
    });
  });
  
  describe('getNotificationTemplate - Personalización Avanzada', () => {
    it('debe aplicar variables complejas en plantillas personalizadas', async () => {
      // Mock para plantilla personalizada con variables complejas
      prisma.$queryRaw.mockResolvedValueOnce([{
        name: 'status_change_IN_PROGRESS_to_RESOLVED',
        subject: '✅ {{ticketNumber}} - Solicitud resuelta',
        content: `
          Hola {{recipientName}},
          
          Nos complace informarte que tu solicitud {{ticketNumber}} "{{ticketTitle}}" ha sido resuelta.
          
          Detalles:
          - Fecha de solicitud: {{submittedDate}}
          - Tiempo de resolución: {{resolutionTime}}
          - Resuelto por: {{resolvedByName}}
          
          Por favor, califica nuestro servicio en el siguiente enlace:
          {{surveyLink}}
          
          Atentamente,
          El equipo de {{complexName}}
        `
      }]);
      
      // Mock para PQR
      prisma.pQR.findUnique.mockResolvedValueOnce({
        id: 123,
        ticketNumber: 'PQR-20250602-001',
        title: 'Problema de mantenimiento',
        submittedAt: new Date('2025-06-01T10:00:00'),
        resolvedAt: new Date('2025-06-02T14:30:00'),
        resolvedById: 10,
        resolvedByName: 'Técnico Juan',
        complexId: 1,
        complexName: 'Conjunto Armonía'
      });
      
      // Ejecutar el método
      const template = await (service as any).getNotificationTemplate(
        PQRStatus.RESOLVED,
        PQRStatus.IN_PROGRESS
      );
      
      // Verificar resultado
      expect(template).toEqual({
        subject: '✅ {{ticketNumber}} - Solicitud resuelta',
        content: expect.stringContaining('Hola {{recipientName}}')
      });
      
      // Verificar aplicación de variables
      const processedContent = await (service as any).processTemplateVariables(
        template.content,
        {
          ticketNumber: 'PQR-20250602-001',
          ticketTitle: 'Problema de mantenimiento',
          recipientName: 'Juan Pérez',
          submittedDate: '01/06/2025 10:00',
          resolutionTime: '28 horas 30 minutos',
          resolvedByName: 'Técnico Juan',
          complexName: 'Conjunto Armonía',
          surveyLink: 'https://armonia.com/survey/123'
        }
      );
      
      expect(processedContent).toContain('Hola Juan Pérez');
      expect(processedContent).toContain('PQR-20250602-001');
      expect(processedContent).toContain('28 horas 30 minutos');
      expect(processedContent).toContain('Técnico Juan');
      expect(processedContent).toContain('Conjunto Armonía');
    });
  });
  
  describe('Manejo de Errores Avanzado', () => {
    it('debe reintentar envío de notificaciones fallidas', async () => {
      // Mock para PQR
      prisma.pQR.findUnique.mockResolvedValue({
        id: 123,
        ticketNumber: 'PQR-20250602-001',
        title: 'Problema de mantenimiento',
        status: PQRStatus.ASSIGNED,
        userId: 1,
        assignedToId: 10
      });
      
      // Mock para configuración
      prisma.$queryRaw.mockResolvedValueOnce([{ autoNotifyEnabled: true }]);
      
      // Mock para usuario
      prisma.user.findUnique.mockResolvedValueOnce({
        id: 1,
        email: 'usuario@example.com',
        name: 'Usuario Test',
        role: 'RESIDENT'
      });
      
      // Mock para usuario asignado
      prisma.user.findUnique.mockResolvedValueOnce({
        id: 10,
        email: 'tecnico@example.com',
        name: 'Técnico Test',
        role: 'STAFF'
      });
      
      // Simular fallo en envío de email
      (sendEmail as jest.Mock).mockRejectedValueOnce(new Error('Error de servidor SMTP'));
      
      // Configurar mock para log de errores
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // Ejecutar el método
      const result = await service.notifyStatusChange(
        123,
        PQRStatus.IN_PROGRESS,
        PQRStatus.ASSIGNED,
        10
      );
      
      // Verificar resultado
      expect(result).toBe(true); // Debería ser true porque al menos una notificación se envió
      
      // Verificar que se registró el error
      expect(consoleSpy).toHaveBeenCalled();
      
      // Verificar que se intentó reenviar
      expect(sendEmail).toHaveBeenCalledTimes(2);
      
      // Verificar que se registró la notificación fallida
      expect(prisma.pQRNotification.create).toHaveBeenCalledWith(expect.objectContaining({
        status: 'FAILED',
        errorDetails: expect.any(String)
      }));
      
      // Restaurar console.error
      consoleSpy.mockRestore();
    });
    
    it('debe manejar errores en la obtención de plantillas', async () => {
      // Forzar error en la consulta de plantillas
      prisma.$queryRaw.mockRejectedValueOnce(new Error('Error de base de datos'));
      
      // Configurar mock para log de errores
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // Ejecutar el método
      const template = await (service as any).getNotificationTemplate(
        PQRStatus.RESOLVED,
        PQRStatus.IN_PROGRESS
      );
      
      // Verificar resultado - debe usar plantilla por defecto
      expect(template).toHaveProperty('subject');
      expect(template).toHaveProperty('content');
      
      // Verificar que se registró el error
      expect(consoleSpy).toHaveBeenCalled();
      
      // Restaurar console.error
      consoleSpy.mockRestore();
    });
  });
});
