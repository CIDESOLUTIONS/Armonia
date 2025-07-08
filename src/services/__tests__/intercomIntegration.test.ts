import { describe, it, expect, beforeEach, jest, afterEach } from '@jest/globals';
import { intercomService } from '../../lib/services/intercom-service';
import { prisma } from '../../lib/prisma';
import { VisitStatus, NotificationChannel, NotificationStatus, ResponseType } from '@prisma/client';

// Mock de Prisma
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    visitor: {
      findFirst: jest.fn(),
      create: jest.fn()
    },
    visit: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn()
    },
    unit: {
      findUnique: jest.fn()
    },
    userIntercomPreference: {
      findUnique: jest.fn()
    },
    virtualIntercomNotification: {
      create: jest.fn(),
      update: jest.fn(),
      findFirst: jest.fn()
    },
    intercomSettings: {
      findFirst: jest.fn()
    }
  };

  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
    VisitStatus: {
      PENDING: 'PENDING',
      APPROVED: 'APPROVED',
      REJECTED: 'REJECTED',
      IN_PROGRESS: 'IN_PROGRESS',
      COMPLETED: 'COMPLETED',
      CANCELLED: 'CANCELLED'
    },
    NotificationChannel: {
      WHATSAPP: 'WHATSAPP',
      TELEGRAM: 'TELEGRAM',
      EMAIL: 'EMAIL',
      SMS: 'SMS'
    },
    NotificationStatus: {
      PENDING: 'PENDING',
      SENT: 'SENT',
      DELIVERED: 'DELIVERED',
      READ: 'READ',
      RESPONDED: 'RESPONDED',
      FAILED: 'FAILED'
    },
    ResponseType: {
      APPROVE: 'APPROVE',
      REJECT: 'REJECT',
      UNKNOWN: 'UNKNOWN'
    }
  };
});

// Mock de ActivityLogger
jest.mock('../../lib/logging/activity-logger', () => ({
  ActivityLogger: jest.fn().mockImplementation(() => ({
    logActivity: jest.fn().mockResolvedValue({})
  }))
}));

// Mock de módulos externos
jest.mock('twilio', () => jest.fn().mockImplementation(() => ({
  messages: {
    create: jest.fn().mockResolvedValue({ sid: 'test-message-id' })
  },
  validateRequest: jest.fn().mockReturnValue(true)
})));

jest.mock('axios', () => ({
  default: {
    post: jest.fn().mockResolvedValue({ data: { ok: true, result: { message_id: 123 } } })
  }
}));

describe('IntercomService - Pruebas de integración', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Flujo completo de visita', () => {
    it('debe manejar el flujo completo desde registro hasta salida', async () => {
      // Configurar mocks para el flujo completo
      const mockVisitor = {
        id: 'visitor-123',
        name: 'Juan Pérez',
        identification: '1234567890',
        phone: '+573001234567',
        typeId: 1,
        type: {
          id: 1,
          name: 'Delivery'
        }
      };

      const mockVisit = {
        id: 'visit-123',
        visitorId: 'visitor-123',
        unitId: 1,
        purpose: 'Entrega de paquete',
        status: VisitStatus.PENDING,
        visitor: mockVisitor,
        unit: {
          id: 1,
          number: '101'
        }
      };

      const mockUnit = {
        id: 1,
        number: '101',
        residents: [1]
      };

      const mockPreference = {
        userId: 1,
        whatsappEnabled: true,
        whatsappNumber: '+573001234567',
        telegramEnabled: false,
        notifyAllVisitors: true,
        allowedVisitorTypes: [],
        autoApproveTypes: []
      };

      const mockNotification = {
        id: 'notification-1',
        visitId: 'visit-123',
        userId: 1,
        channel: NotificationChannel.WHATSAPP,
        status: NotificationStatus.PENDING
      };

      const mockSettings = {
        id: 1,
        whatsappEnabled: true,
        whatsappProvider: 'twilio',
        whatsappConfig: {
          accountSid: 'test-sid',
          authToken: 'test-token',
          fromNumber: '+573009876543'
        },
        telegramEnabled: true,
        telegramBotToken: 'test-bot-token',
        defaultResponseTimeout: 60,
        maxRetries: 2,
        retryDelay: 30,
        messageTemplates: {
          WHATSAPP: {
            visitor_notification: '¡Hola! Tienes un visitante: {{visitor.name}} para {{unit.number}}. Motivo: {{purpose}}'
          }
        }
      };

      // 1. Configurar mocks para registro de visita
      prisma.visitor.findFirst = jest.fn().mockResolvedValue(null);
      prisma.visitor.create = jest.fn().mockResolvedValue(mockVisitor);
      prisma.visit.create = jest.fn().mockResolvedValue(mockVisit);
      prisma.unit.findUnique = jest.fn().mockResolvedValue(mockUnit);
      prisma.userIntercomPreference.findUnique = jest.fn().mockResolvedValue(mockPreference);
      prisma.virtualIntercomNotification.create = jest.fn().mockResolvedValue(mockNotification);
      prisma.intercomSettings.findFirst = jest.fn().mockResolvedValue(mockSettings);

      // 2. Registrar visita
      const visitResult = await intercomService.registerVisit(
        {
          name: 'Juan Pérez',
          identification: '1234567890',
          phone: '+573001234567',
          typeId: 1
        },
        1,
        'Entrega de paquete'
      );

      // Verificar registro de visita
      expect(visitResult).toEqual(mockVisit);
      expect(prisma.visitor.create).toHaveBeenCalled();
      expect(prisma.visit.create).toHaveBeenCalled();

      // 3. Configurar mocks para procesamiento de webhook (aprobación)
      const mockWhatsAppPayload = {
        From: 'whatsapp:+573001234567',
        Body: 'si',
        MessageSid: 'message-123'
      };

      prisma.userIntercomPreference.findFirst = jest.fn().mockResolvedValue(mockPreference);
      prisma.virtualIntercomNotification.findFirst = jest.fn().mockResolvedValue(mockNotification);
      prisma.virtualIntercomNotification.findUnique = jest.fn().mockResolvedValue({
        ...mockNotification,
        visit: mockVisit
      });
      prisma.virtualIntercomNotification.update = jest.fn().mockResolvedValue({
        ...mockNotification,
        status: NotificationStatus.RESPONDED,
        respondedAt: new Date(),
        response: 'Aprobado',
        responseType: ResponseType.APPROVE
      });
      prisma.visit.update = jest.fn()
        .mockResolvedValueOnce({
          ...mockVisit,
          status: VisitStatus.APPROVED,
          authorizedBy: 1
        })
        .mockResolvedValueOnce({
          ...mockVisit,
          status: VisitStatus.IN_PROGRESS,
          entryTime: new Date(),
          authorizedBy: 1
        })
        .mockResolvedValueOnce({
          ...mockVisit,
          status: VisitStatus.COMPLETED,
          entryTime: new Date(),
          exitTime: new Date(),
          authorizedBy: 1
        });

      // 4. Procesar webhook de aprobación
      const webhookResult = await intercomService.processWebhook(
        NotificationChannel.WHATSAPP,
        mockWhatsAppPayload
      );

      // Verificar procesamiento de webhook
      expect(webhookResult).toEqual({ success: true });
      expect(prisma.virtualIntercomNotification.update).toHaveBeenCalled();
      expect(prisma.visit.update).toHaveBeenCalledWith({
        where: { id: 'visit-123' },
        data: {
          status: VisitStatus.APPROVED,
          authorizedBy: 1
        }
      });

      // 5. Registrar entrada
      await intercomService.registerEntry('visit-123');

      // Verificar registro de entrada
      expect(prisma.visit.update).toHaveBeenCalledWith({
        where: { id: 'visit-123' },
        data: {
          status: VisitStatus.IN_PROGRESS,
          entryTime: expect.any(Date)
        }
      });

      // 6. Registrar salida
      await intercomService.registerExit('visit-123');

      // Verificar registro de salida
      expect(prisma.visit.update).toHaveBeenCalledWith({
        where: { id: 'visit-123' },
        data: {
          status: VisitStatus.COMPLETED,
          exitTime: expect.any(Date)
        }
      });

      // 7. Configurar mocks para historial de visitas
      prisma.visit.findMany = jest.fn().mockResolvedValue([
        {
          ...mockVisit,
          status: VisitStatus.COMPLETED,
          entryTime: new Date(),
          exitTime: new Date(),
          authorizedBy: 1,
          createdAt: new Date(),
          notifications: [mockNotification]
        }
      ]);
      prisma.visit.count = jest.fn().mockResolvedValue(1);

      // 8. Obtener historial de visitas
      const historyResult = await intercomService.getVisitHistory(1, {
        page: 1,
        pageSize: 10
      });

      // Verificar historial de visitas
      expect(historyResult.data).toHaveLength(1);
      expect(historyResult.pagination).toEqual({
        page: 1,
        pageSize: 10,
        total: 1,
        totalPages: 1
      });
    });
  });

  describe('Escenarios de error', () => {
    it('debe manejar errores en el registro de visita', async () => {
      // Configurar mock para simular error
      prisma.visitor.findFirst = jest.fn().mockRejectedValue(new Error('Error de base de datos'));

      // Verificar que se captura la excepción
      await expect(intercomService.registerVisit(
        {
          name: 'Juan Pérez',
          identification: '1234567890',
          phone: '+573001234567',
          typeId: 1
        },
        1,
        'Entrega de paquete'
      )).rejects.toThrow('Error de base de datos');
    });

    it('debe manejar errores en la notificación a residentes', async () => {
      // Configurar mock para simular error
      prisma.visit.findUnique = jest.fn().mockRejectedValue(new Error('Error al buscar visita'));

      // Verificar que se captura la excepción
      await expect(intercomService.notifyResidents('visit-123')).rejects.toThrow('Error al buscar visita');
    });

    it('debe manejar errores en el procesamiento de webhooks', async () => {
      // Configurar mock para simular error de verificación
      const mockAdapter = {
        verifyWebhook: jest.fn().mockReturnValue(false)
      };

      // Forzar error de verificación
      jest.spyOn(intercomService as any, 'adapters').mockReturnValue(new Map([
        [NotificationChannel.WHATSAPP, mockAdapter]
      ]));

      // Verificar que se maneja el error
      const result = await intercomService.processWebhook(
        NotificationChannel.WHATSAPP,
        { body: 'test' }
      );

      expect(result).toEqual({
        success: false,
        error: 'Verificación de webhook fallida'
      });
    });
  });

  describe('Configuración y preferencias', () => {
    it('debe actualizar correctamente las preferencias de usuario', async () => {
      // Configurar mocks
      const mockPreferences = {
        whatsappEnabled: true,
        whatsappNumber: '+573001234567',
        telegramEnabled: true,
        telegramUsername: '@usuario',
        telegramChatId: '123456789',
        notifyAllVisitors: false,
        allowedVisitorTypes: [1, 2],
        autoApproveTypes: [3],
        quietHoursEnabled: true,
        quietHoursStart: '22:00',
        quietHoursEnd: '07:00'
      };

      prisma.userIntercomPreference.findUnique = jest.fn().mockResolvedValue(null);
      prisma.userIntercomPreference.create = jest.fn().mockResolvedValue({
        id: 1,
        userId: 1,
        ...mockPreferences
      });

      // Actualizar preferencias
      const result = await intercomService.updateUserPreferences(1, mockPreferences);

      // Verificar actualización
      expect(prisma.userIntercomPreference.create).toHaveBeenCalledWith({
        data: {
          userId: 1,
          ...mockPreferences
        }
      });
      expect(result).toEqual({
        id: 1,
        userId: 1,
        ...mockPreferences
      });
    });

    it('debe actualizar correctamente la configuración del sistema', async () => {
      // Configurar mocks
      const mockSettings = {
        whatsappEnabled: true,
        whatsappProvider: 'twilio',
        whatsappConfig: {
          accountSid: 'test-sid',
          authToken: 'test-token',
          fromNumber: '+573009876543'
        },
        telegramEnabled: true,
        telegramBotToken: 'test-bot-token',
        defaultResponseTimeout: 60,
        maxRetries: 2,
        retryDelay: 30,
        messageTemplates: {
          WHATSAPP: {
            visitor_notification: '¡Hola! Tienes un visitante: {{visitor.name}} para {{unit.number}}. Motivo: {{purpose}}'
          },
          TELEGRAM: {
            visitor_notification: '🔔 <b>Nuevo visitante</b>\n\nNombre: {{visitor.name}}\nTipo: {{visitor.type}}\nUnidad: {{unit.number}}\nMotivo: {{purpose}}'
          }
        }
      };

      prisma.intercomSettings.findFirst = jest.fn().mockResolvedValue(null);
      prisma.intercomSettings.create = jest.fn().mockResolvedValue({
        id: 1,
        ...mockSettings
      });

      // Actualizar configuración
      const result = await intercomService.updateSettings(mockSettings);

      // Verificar actualización
      expect(prisma.intercomSettings.create).toHaveBeenCalledWith({
        data: mockSettings
      });
      expect(result).toEqual({
        id: 1,
        ...mockSettings
      });
    });
  });
});
