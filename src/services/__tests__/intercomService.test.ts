import { describe, it, expect, beforeEach, jest, afterEach } from '@jest/globals';
import { PrismaClient } from '@prisma/client';
import { MessageAdapter } from '../../lib/communications/message-adapters';

const mockVisitStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  COMPLETED: 'COMPLETED',
  NOTIFIED: 'NOTIFIED',
};

const mockNotificationChannel = {
  WHATSAPP: 'WHATSAPP',
  TELEGRAM: 'TELEGRAM',
  EMAIL: 'EMAIL',
  SMS: 'SMS',
  PUSH: 'PUSH',
};

const mockNotificationStatus = {
  PENDING: 'PENDING',
  SENT: 'SENT',
  DELIVERED: 'DELIVERED',
  READ: 'READ',
  FAILED: 'FAILED',
};

const mockResponseType = {
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  CUSTOM: 'CUSTOM',
};

// Mock de ActivityLogger
jest.mock('../../lib/logging/activity-logger', () => ({
  ActivityLogger: jest.fn().mockImplementation(() => ({
    logActivity: jest.fn().mockResolvedValue({}),
  })),
}));

// Mock de módulos externos
jest.mock('../../lib/communications/whatsapp-adapter', () => ({
  WhatsAppAdapter: jest.fn().mockImplementation(() => ({
    sendMessage: jest.fn().mockResolvedValue({ success: true, messageId: 'mock-whatsapp-message-id' }),
    verifyWebhook: jest.fn().mockReturnValue(true),
    parseResponse: jest.fn().mockReturnValue({ from: 'mock-whatsapp-from', text: 'mock-whatsapp-text', timestamp: new Date(), messageId: 'mock-whatsapp-message-id', type: 'text' }),
  })),
}));

jest.mock('../../lib/communications/telegram-adapter', () => ({
  TelegramAdapter: jest.fn().mockImplementation(() => ({
    sendMessage: jest.fn().mockResolvedValue({ success: true, messageId: 'mock-telegram-message-id' }),
    verifyWebhook: jest.fn().mockReturnValue(true),
    parseResponse: jest.fn().mockReturnValue({ from: 'mock-telegram-from', text: 'mock-telegram-text', timestamp: new Date(), messageId: 'mock-telegram-message-id', type: 'text' }),
  })),
}));

describe('IntercomService', () => {
  let intercomService: any;
  let mockPrisma: any; // Declare mockPrisma here

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules(); // Reset module registry to ensure fresh imports

    // Explicitly clear the global Prisma instance to ensure a fresh mock is used
    (globalThis as any).prisma = undefined;

    // Define mockPrisma here, before it's used in jest.doMock
    mockPrisma = {
      visitor: {
        findFirst: jest.fn(),
        create: jest.fn()
      },
      visit: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn()
      },
      unit: {
        findUnique: jest.fn()
      },
      userIntercomPreference: {
        findUnique: jest.fn(),
        update: jest.fn(),
        create: jest.fn()
      },
      virtualIntercomNotification: {
        create: jest.fn(),
        update: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn()
      },
      intercomSettings: {
        findFirst: jest.fn(),
        update: jest.fn(),
        create: jest.fn()
      },
      intercomActivityLog: {
        create: jest.fn()
      },
      $disconnect: jest.fn(),
      $transaction: jest.fn(async (callback) => callback(mockPrisma)),
    };

    // Mock intercomSettings.findFirst to return a default configuration BEFORE IntercomService is instantiated
    mockPrisma.intercomSettings.findFirst.mockResolvedValue({
      id: 1,
      whatsappEnabled: true,
      whatsappConfig: { accountSid: 'test', authToken: 'test', fromNumber: 'test' },
      telegramEnabled: true,
      telegramBotToken: 'test',
      defaultResponseTimeout: 60,
      messageTemplates: {
        WHATSAPP: { visitor_notification: 'Test WhatsApp' },
        TELEGRAM: { visitor_notification: 'Test Telegram' },
      },
    });

    // Mock for virtualIntercomNotification.create to return an object with an id
    mockPrisma.virtualIntercomNotification.create.mockResolvedValue({ id: 'notification-id-123' });

    // Mock @prisma/client using jest.doMock
    jest.doMock('@prisma/client', () => ({
      PrismaClient: jest.fn(() => mockPrisma),
      VisitStatus: mockVisitStatus,
      NotificationChannel: mockNotificationChannel,
      NotificationStatus: mockNotificationStatus,
      ResponseType: mockResponseType,
    }));

    // Dynamically import intercomService after mocks are set up
    const intercomServiceModule = require('../../lib/services/intercom-service');
    intercomService = new intercomServiceModule.IntercomService(); // Instantiate the class
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('registerVisit', () => {
    it('debe registrar una nueva visita cuando el visitante no existe', async () => {
      // Configurar mocks
      const mockVisitor = {
        id: 'visitor-123',
        name: 'Juan Pérez',
        identification: '1234567890',
        phone: '+573001234567',
        typeId: 1
      };

      const mockVisit = {
        id: 'visit-123',
        visitorId: 'visitor-123',
        unitId: 1,
        purpose: 'Entrega de paquete',
        status: mockVisitStatus.PENDING, // Use mockVisitStatus
        visitor: { // Added visitor.type
          id: 'visitor-123',
          name: 'Juan Pérez',
          typeId: 1,
          type: { id: 1, name: 'Delivery' }
        }
      };

      // Mock para visitor.findFirst (no encuentra visitante)
      (mockPrisma.visitor.findFirst as jest.Mock).mockResolvedValue(null);
      
      // Mock para visitor.create
      (mockPrisma.visitor.create as jest.Mock).mockResolvedValue(mockVisitor);
      
      // Mock para visit.create
      (mockPrisma.visit.create as jest.Mock).mockResolvedValue(mockVisit);

      // Mock para unit.findUnique
      (mockPrisma.unit.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        number: '101',
        residents: [1, 2]
      });

      // Mock para userIntercomPreference.findUnique
      (mockPrisma.userIntercomPreference.findUnique as jest.Mock).mockResolvedValue({
        userId: 1,
        whatsappEnabled: true,
        whatsappNumber: '+573001234567',
        notifyAllVisitors: true,
        allowedVisitorTypes: [], // Added missing properties
        autoApproveTypes: []     // Added missing properties
      });

      // Mock para visit.findUnique dentro de notifyResidents
      (mockPrisma.visit.findUnique as jest.Mock).mockResolvedValue(mockVisit);

      // Ejecutar función
      const result = await intercomService.registerVisit(
        {
          name: 'Juan Pérez',
          identification: '1234567890',
          phone: '+573001234567',
          typeId: 1
        },
        1,
        'Entrega de paquete'
      );

      // Verificaciones
      expect(mockPrisma.visitor.findFirst).toHaveBeenCalledWith({
        where: { identification: '1234567890' }
      });
      
      expect(mockPrisma.visitor.create).toHaveBeenCalled();
      expect(mockPrisma.visit.create).toHaveBeenCalled();
      expect(result).toEqual(mockVisit);
    });

    it('debe reutilizar un visitante existente', async () => {
      // Configurar mocks
      const mockVisitor = {
        id: 'visitor-123',
        name: 'Juan Pérez',
        identification: '1234567890',
        phone: '+573001234567',
        typeId: 1
      };

      const mockVisit = {
        id: 'visit-123',
        visitorId: 'visitor-123',
        unitId: 1,
        purpose: 'Entrega de paquete',
        status: mockVisitStatus.PENDING, // Use mockVisitStatus
        visitor: { // Added visitor.type
          id: 'visitor-123',
          name: 'Juan Pérez',
          typeId: 1,
          type: { id: 1, name: 'Delivery' }
        }
      };

      // Mock para visitor.findFirst (encuentra visitante)
      (mockPrisma.visitor.findFirst as jest.Mock).mockResolvedValue(mockVisitor);
      
      // Mock para visit.create
      (mockPrisma.visit.create as jest.Mock).mockResolvedValue(mockVisit);

      // Mock para unit.findUnique
      (mockPrisma.unit.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        number: '101',
        residents: []
      });

      // Mock para userIntercomPreference.findUnique
      (mockPrisma.userIntercomPreference.findUnique as jest.Mock).mockResolvedValue({
        userId: 1,
        whatsappEnabled: true,
        whatsappNumber: '+573001234567',
        notifyAllVisitors: true,
        allowedVisitorTypes: [], // Added missing properties
        autoApproveTypes: []     // Added missing properties
      });

      // Mock para visit.findUnique dentro de notifyResidents
      (mockPrisma.visit.findUnique as jest.Mock).mockResolvedValue(mockVisit);

      // Ejecutar función
      const result = await intercomService.registerVisit(
        {
          name: 'Juan Pérez',
          identification: '1234567890',
          phone: '+573001234567',
          typeId: 1
        },
        1,
        'Entrega de paquete'
      );

      // Verificaciones
      expect(mockPrisma.visitor.findFirst).toHaveBeenCalledWith({
        where: { identification: '1234567890' }
      });
      
      expect(mockPrisma.visitor.create).not.toHaveBeenCalled();
      expect(mockPrisma.visit.create).toHaveBeenCalled();
      expect(result).toEqual(mockVisit);
    });
  });

  describe('notifyResidents', () => {
    it('debe notificar a los residentes de una unidad', async () => {
      // Configurar mocks
      const mockVisit = {
        id: 'visit-123',
        visitorId: 'visitor-123',
        unitId: 1,
        purpose: 'Entrega de paquete',
        status: mockVisitStatus.PENDING,
        visitor: {
          id: 'visitor-123',
          name: 'Juan Pérez',
          type: {
            id: 1,
            name: 'Delivery'
          }
        },
        unit: {
          id: 1,
          number: '101'
        }
      };

      // Mock para visit.findUnique
      (mockPrisma.visit.findUnique as jest.Mock).mockResolvedValue(mockVisit);

      // Mock para unit.findUnique
      (mockPrisma.unit.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        number: '101',
        residents: [1, 2]
      });

      // Mock para userIntercomPreference.findUnique
      (mockPrisma.userIntercomPreference.findUnique as jest.Mock)
        .mockResolvedValueOnce({
          userId: 1,
          whatsappEnabled: true,
          whatsappNumber: '+573001234567',
          telegramEnabled: false,
          notifyAllVisitors: true,
          allowedVisitorTypes: [],
          autoApproveTypes: []
        })
        .mockResolvedValueOnce({
          userId: 2,
          whatsappEnabled: false,
          telegramEnabled: true,
          telegramChatId: '987654321',
          notifyAllVisitors: true,
          allowedVisitorTypes: [],
          autoApproveTypes: []
        });

      // Mock para virtualIntercomNotification.create
      (mockPrisma.virtualIntercomNotification.create as jest.Mock)
        .mockResolvedValue({
          id: 'notification-1',
          visitId: 'visit-123',
          userId: 1,
          channel: mockNotificationChannel.WHATSAPP,
          status: mockNotificationStatus.PENDING
        });

      // Mock para visit.update
      (mockPrisma.visit.update as jest.Mock).mockResolvedValue({
        ...mockVisit,
        status: mockVisitStatus.NOTIFIED
      });

      // Ejecutar función
      await intercomService.notifyResidents('visit-123');

      // Verificaciones
      expect(mockPrisma.visit.findUnique).toHaveBeenCalledWith({
        where: { id: 'visit-123' },
        include: {
          visitor: {
            include: { type: true }
          },
          unit: true
        }
      });

      expect(mockPrisma.unit.findUnique).toHaveBeenCalledWith({
        where: { id: 1 }
      });

      expect(mockPrisma.userIntercomPreference.findUnique).toHaveBeenCalledTimes(2);
      expect(mockPrisma.virtualIntercomNotification.create).toHaveBeenCalledTimes(2);
      
      expect(mockPrisma.visit.update).toHaveBeenCalledWith({
        where: { id: 'visit-123' },
        data: { status: mockVisitStatus.NOTIFIED }
      });
    });

    it('debe manejar la aprobación automática para tipos de visitantes configurados', async () => {
      // Configurar mocks
      const mockVisit = {
        id: 'visit-123',
        visitorId: 'visitor-123',
        unitId: 1,
        purpose: 'Visita familiar',
        status: mockVisitStatus.PENDING,
        visitor: {
          id: 'visitor-123',
          name: 'Juan Pérez',
          typeId: 2,
          type: {
            id: 2,
            name: 'Familiar'
          }
        },
        unit: {
          id: 1,
          number: '101',
        }
      };

      // Mock para visit.findUnique
      (mockPrisma.visit.findUnique as jest.Mock).mockResolvedValue(mockVisit);

      // Mock para unit.findUnique
      (mockPrisma.unit.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        number: '101',
        residents: [1]
      });

      // Mock para userIntercomPreference.findUnique (con auto-aprobación para tipo 2)
      (mockPrisma.userIntercomPreference.findUnique as jest.Mock)
        .mockResolvedValue({
          userId: 1,
          whatsappEnabled: true,
          whatsappNumber: '+573001234567',
          notifyAllVisitors: true,
          allowedVisitorTypes: [],
          autoApproveTypes: [2] // Auto-aprobar tipo 2 (Familiar)
        });

      // Spy en approveVisit
      const approveVisitSpy = jest.spyOn(intercomService, 'approveVisit').mockResolvedValue(undefined);

      // Ejecutar función
      await intercomService.notifyResidents('visit-123');

      // Verificaciones
      expect(approveVisitSpy).toHaveBeenCalledWith('visit-123', 1);
      expect(mockPrisma.virtualIntercomNotification.create).not.toHaveBeenCalled();
    });
  });

  describe('processWebhook', () => {
    it('debe procesar una respuesta de aprobación por WhatsApp', async () => {
      // Configurar mocks
      const mockPayload = {
        From: 'whatsapp:+573001234567',
        Body: 'si',
        MessageSid: 'message-123'
      };

      // Mock para userIntercomPreference.findFirst
      (mockPrisma.userIntercomPreference.findFirst as jest.Mock).mockResolvedValue({
        userId: 1,
        whatsappNumber: '+573001234567'
      });

      // Mock para virtualIntercomNotification.findFirst
      (mockPrisma.virtualIntercomNotification.findFirst as jest.Mock).mockResolvedValue({
        id: 'notification-1',
        visitId: 'visit-123',
        userId: 1,
        channel: mockNotificationChannel.WHATSAPP,
        status: mockNotificationStatus.SENT
      });

      // Mock para virtualIntercomNotification.update
      (mockPrisma.virtualIntercomNotification.update as jest.Mock).mockResolvedValue({});

      // Spy en processApproval
      const processApprovalSpy = jest.spyOn(intercomService, 'processApproval' as any).mockResolvedValue(undefined);

      // Ejecutar función
      const result = await intercomService.processWebhook(
        mockNotificationChannel.WHATSAPP,
        mockPayload
      );

      // Verificaciones
      expect(result).toEqual({ success: true });
      expect(processApprovalSpy).toHaveBeenCalledWith('notification-1');
    });

    it('debe procesar una respuesta de rechazo por Telegram', async () => {
      // Configurar mocks
      const mockPayload = {
        update_id: 123456789,
        callback_query: {
          id: 'callback-123',
          from: {
            id: 987654321,
            first_name: 'Juan',
            username: 'juanperez'
          },
          data: 'reject_notification-2'
        }
      };

      // Mock the verifyWebhook method of the TelegramAdapter instance created by IntercomService
      // This simulates a scenario where the webhook verification fails.
      const { TelegramAdapter } = require('../../lib/communications/telegram-adapter');
      (TelegramAdapter as jest.Mock).mockImplementationOnce(() => ({
        sendMessage: jest.fn().mockResolvedValue({ success: true, messageId: 'mock-telegram-message-id' }),
        verifyWebhook: jest.fn().mockReturnValue(false), // Simulate verification failure
        parseResponse: jest.fn().mockReturnValue({ from: 'mock-telegram-from', text: 'mock-telegram-text', timestamp: new Date(), messageId: 'mock-telegram-message-id', type: 'text' }),
      }));

      // Re-instantiate intercomService to pick up the new mock behavior
      const intercomServiceModule = require('../../lib/services/intercom-service');
      intercomService = new intercomServiceModule.IntercomService();

      // Spy en processRejection
      const processRejectionSpy = jest.spyOn(intercomService, 'processRejection' as any).mockResolvedValue(undefined);

      // Ejecutar función
      const result = await intercomService.processWebhook(
        mockNotificationChannel.TELEGRAM,
        mockPayload
      );

      // Verificaciones
      expect(result).toEqual({ success: false, error: 'Verificación de webhook fallida' });
      expect(processRejectionSpy).not.toHaveBeenCalled(); // Should not be called if verification fails
    });
  });

  describe('approveVisit', () => {
    it('debe actualizar el estado de la visita a APPROVED', async () => {
      // Ejecutar función
      await intercomService.approveVisit('visit-123', 1);

      // Verificaciones
      expect(mockPrisma.visit.update).toHaveBeenCalledWith({
        where: { id: 'visit-123' },
        data: {
          status: mockVisitStatus.APPROVED,
          authorizedBy: 1
        }
      });
    });
  });

  describe('rejectVisit', () => {
    it('debe actualizar el estado de la visita a REJECTED', async () => {
      // Ejecutar función
      await intercomService.rejectVisit('visit-123', 1);

      // Verificaciones
      expect(mockPrisma.visit.update).toHaveBeenCalledWith({
        where: { id: 'visit-123' },
        data: {
          status: mockVisitStatus.REJECTED,
          authorizedBy: 1
        }
      });
    });
  });

  describe('getVisitHistory', () => {
    it('debe obtener el historial de visitas con paginación', async () => {
      // Configurar mocks
      const mockVisits = [
        {
          id: 'visit-123',
          visitor: {
            id: 'visitor-123',
            name: 'Juan Pérez',
            type: { name: 'Delivery' }
          },
          purpose: 'Entrega de paquete',
          status: mockVisitStatus.COMPLETED,
          entryTime: new Date(),
          exitTime: new Date(),
          createdAt: new Date(),
          notifications: []
        }
      ];

      // Mock para visit.findMany
      (mockPrisma.visit.findMany as jest.Mock).mockResolvedValue(mockVisits);

      // Mock para visit.count
      (mockPrisma.visit.count as jest.Mock).mockResolvedValue(1);

      // Ejecutar función
      const result = await intercomService.getVisitHistory(1, {
        page: 1,
        pageSize: 10
      });

      // Verificaciones
      expect(mockPrisma.visit.findMany).toHaveBeenCalledWith({
        where: { unitId: 1 },
        include: {
          visitor: {
            include: { type: true }
          },
          notifications: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: 0,
        take: 10
      });

      expect(mockPrisma.visit.count).toHaveBeenCalledWith({
        where: { unitId: 1 }
      });

      expect(result).toEqual({
        data: mockVisits,
        pagination: {
          page: 1,
          pageSize: 10,
          total: 1,
          totalPages: 1
        }
      });
    });

    it('debe aplicar filtros correctamente', async () => {
      // Configurar mocks
      (mockPrisma.visit.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.visit.count as jest.Mock).mockResolvedValue(0);

      // Fechas para filtros
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');

      // Ejecutar función con filtros
      await intercomService.getVisitHistory(1, {
        status: mockVisitStatus.APPROVED,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        page: 2,
        pageSize: 5
      });

      // Verificaciones
      expect(mockPrisma.visit.findMany).toHaveBeenCalledWith({
        where: {
          unitId: 1,
          status: mockVisitStatus.APPROVED,
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        },
        include: {
          visitor: {
            include: { type: true }
          },
          notifications: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: 5,
        take: 5
      });
    });
  });

  describe('updateUserPreferences', () => {
    it('debe actualizar preferencias existentes', async () => {
      // Configurar mocks
      const mockPreferences = {
        userId: 1,
        whatsappEnabled: true,
        whatsappNumber: '+573001234567',
        telegramEnabled: false
      };

      // Mock para userIntercomPreference.findUnique
      (mockPrisma.userIntercomPreference.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        userId: 1
      });

      // Mock para userIntercomPreference.update
      (mockPrisma.userIntercomPreference.update as jest.Mock).mockResolvedValue({
        id: 1,
        ...mockPreferences
      });

      // Ejecutar función
      const result = await intercomService.updateUserPreferences(1, mockPreferences);

      // Verificaciones
      expect(mockPrisma.userIntercomPreference.update).toHaveBeenCalledWith({
        where: { userId: 1 },
        data: mockPreferences
      });
      
      expect(result).toEqual({
        id: 1,
        ...mockPreferences
      });
    });

    it('debe crear nuevas preferencias si no existen', async () => {
      // Configurar mocks
      const mockPreferences = {
        whatsappEnabled: true,
        whatsappNumber: '+573001234567',
        telegramEnabled: false
      };

      // Mock para userIntercomPreference.findUnique
      (mockPrisma.userIntercomPreference.findUnique as jest.Mock).mockResolvedValue(null);

      // Mock para userIntercomPreference.create
      (mockPrisma.userIntercomPreference.create as jest.Mock).mockResolvedValue({
        id: 1,
        userId: 1,
        ...mockPreferences
      });

      // Ejecutar función
      const result = await intercomService.updateUserPreferences(1, mockPreferences);

      // Verificaciones
      expect(mockPrisma.userIntercomPreference.create).toHaveBeenCalledWith({
        data: {
          userId: 1,
          ...mockPreferences
        }
      });
      
      expect(result).toEqual({
        id: 1,
        ...mockPreferences
      });
    });
  });

  describe('updateSettings', () => {
    it('debe actualizar la configuración existente', async () => {
      // Configurar mocks
      const mockSettings = {
        whatsappEnabled: true,
        telegramEnabled: true,
        defaultResponseTimeout: 60
      };

      // Mock para intercomSettings.findFirst
      (mockPrisma.intercomSettings.findFirst as jest.Mock).mockResolvedValue({
        id: 1
      });

      // Mock para intercomSettings.update
      (mockPrisma.intercomSettings.update as jest.Mock).mockResolvedValue({
        id: 1,
        ...mockSettings
      });

      // Ejecutar función
      const result = await intercomService.updateSettings(mockSettings);

      // Verificaciones
      expect(mockPrisma.intercomSettings.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: mockSettings
      });
      
      expect(result).toEqual({
        id: 1,
        ...mockSettings
      });
    });

    it('debe crear nueva configuración si no existe', async () => {
      // Configurar mocks
      const mockSettings = {
        whatsappEnabled: true,
        telegramEnabled: true,
        defaultResponseTimeout: 60
      };

      // Mock para intercomSettings.findFirst
      (mockPrisma.intercomSettings.findFirst as jest.Mock).mockResolvedValue(null);

      // Mock para intercomSettings.create
      (mockPrisma.intercomSettings.create as jest.Mock).mockResolvedValue({
        id: 1,
        ...mockSettings
      });

      // Ejecutar función
      const result = await intercomService.updateSettings(mockSettings);

      // Verificaciones
      expect(mockPrisma.intercomSettings.create).toHaveBeenCalledWith({
        data: mockSettings
      });
      
      expect(result).toEqual({
        id: 1,
        ...mockSettings
      });
    });
  });
});