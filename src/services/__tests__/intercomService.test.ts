import { describe, it, expect, beforeEach, jest, afterEach } from '@jest/globals';
import { intercomService } from '../../lib/services/intercom-service';
import { prisma } from '../../lib/prisma';
import { VisitStatus, NotificationChannel, NotificationStatus, ResponseType } from '@prisma/client';

// Mock de Prisma
jest.mock('../../lib/prisma', () => ({
  prisma: {
    $transaction: jest.fn(async (callback) => callback({
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
    })),
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
    $disconnect: jest.fn()
  }
}));

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

describe('IntercomService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
        status: VisitStatus.PENDING
      };

      // Mock para visitor.findFirst (no encuentra visitante)
      prisma.visitor.findFirst = jest.fn().mockResolvedValue(null);
      
      // Mock para visitor.create
      prisma.visitor.create = jest.fn().mockResolvedValue(mockVisitor);
      
      // Mock para visit.create
      prisma.visit.create = jest.fn().mockResolvedValue(mockVisit);

      // Mock para unit.findUnique
      prisma.unit.findUnique = jest.fn().mockResolvedValue({
        id: 1,
        number: '101',
        residents: [1, 2]
      });

      // Mock para userIntercomPreference.findUnique
      prisma.userIntercomPreference.findUnique = jest.fn().mockResolvedValue({
        userId: 1,
        whatsappEnabled: true,
        whatsappNumber: '+573001234567',
        notifyAllVisitors: true
      });

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
      expect(prisma.visitor.findFirst).toHaveBeenCalledWith({
        where: { identification: '1234567890' }
      });
      
      expect(prisma.visitor.create).toHaveBeenCalled();
      expect(prisma.visit.create).toHaveBeenCalled();
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
        status: VisitStatus.PENDING
      };

      // Mock para visitor.findFirst (encuentra visitante)
      prisma.visitor.findFirst = jest.fn().mockResolvedValue(mockVisitor);
      
      // Mock para visit.create
      prisma.visit.create = jest.fn().mockResolvedValue(mockVisit);

      // Mock para unit.findUnique
      prisma.unit.findUnique = jest.fn().mockResolvedValue({
        id: 1,
        number: '101',
        residents: []
      });

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
      expect(prisma.visitor.findFirst).toHaveBeenCalledWith({
        where: { identification: '1234567890' }
      });
      
      expect(prisma.visitor.create).not.toHaveBeenCalled();
      expect(prisma.visit.create).toHaveBeenCalled();
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
        status: VisitStatus.PENDING,
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
      prisma.visit.findUnique = jest.fn().mockResolvedValue(mockVisit);

      // Mock para unit.findUnique
      prisma.unit.findUnique = jest.fn().mockResolvedValue({
        id: 1,
        number: '101',
        residents: [1, 2]
      });

      // Mock para userIntercomPreference.findUnique
      prisma.userIntercomPreference.findUnique = jest.fn()
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
      prisma.virtualIntercomNotification.create = jest.fn()
        .mockResolvedValue({
          id: 'notification-1',
          visitId: 'visit-123',
          userId: 1,
          channel: NotificationChannel.WHATSAPP,
          status: NotificationStatus.PENDING
        });

      // Mock para visit.update
      prisma.visit.update = jest.fn().mockResolvedValue({
        ...mockVisit,
        status: VisitStatus.NOTIFIED
      });

      // Ejecutar función
      await intercomService.notifyResidents('visit-123');

      // Verificaciones
      expect(prisma.visit.findUnique).toHaveBeenCalledWith({
        where: { id: 'visit-123' },
        include: {
          visitor: {
            include: { type: true }
          },
          unit: true
        }
      });

      expect(prisma.unit.findUnique).toHaveBeenCalledWith({
        where: { id: 1 }
      });

      expect(prisma.userIntercomPreference.findUnique).toHaveBeenCalledTimes(2);
      expect(prisma.virtualIntercomNotification.create).toHaveBeenCalledTimes(2);
      
      expect(prisma.visit.update).toHaveBeenCalledWith({
        where: { id: 'visit-123' },
        data: { status: VisitStatus.NOTIFIED }
      });
    });

    it('debe manejar la aprobación automática para tipos de visitantes configurados', async () => {
      // Configurar mocks
      const mockVisit = {
        id: 'visit-123',
        visitorId: 'visitor-123',
        unitId: 1,
        purpose: 'Visita familiar',
        status: VisitStatus.PENDING,
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
          number: '101'
        }
      };

      // Mock para visit.findUnique
      prisma.visit.findUnique = jest.fn().mockResolvedValue(mockVisit);

      // Mock para unit.findUnique
      prisma.unit.findUnique = jest.fn().mockResolvedValue({
        id: 1,
        number: '101',
        residents: [1]
      });

      // Mock para userIntercomPreference.findUnique (con auto-aprobación para tipo 2)
      prisma.userIntercomPreference.findUnique = jest.fn()
        .mockResolvedValue({
          userId: 1,
          whatsappEnabled: true,
          whatsappNumber: '+573001234567',
          notifyAllVisitors: true,
          allowedVisitorTypes: [],
          autoApproveTypes: [2] // Auto-aprobar tipo 2 (Familiar)
        });

      // Spy en approveVisit
      const approveVisitSpy = jest.spyOn(intercomService, 'approveVisit').mockResolvedValue();

      // Ejecutar función
      await intercomService.notifyResidents('visit-123');

      // Verificaciones
      expect(approveVisitSpy).toHaveBeenCalledWith('visit-123', 1);
      expect(prisma.virtualIntercomNotification.create).not.toHaveBeenCalled();
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
      prisma.userIntercomPreference.findFirst = jest.fn().mockResolvedValue({
        userId: 1,
        whatsappNumber: '+573001234567'
      });

      // Mock para virtualIntercomNotification.findFirst
      prisma.virtualIntercomNotification.findFirst = jest.fn().mockResolvedValue({
        id: 'notification-1',
        visitId: 'visit-123',
        userId: 1,
        channel: NotificationChannel.WHATSAPP,
        status: NotificationStatus.SENT
      });

      // Mock para virtualIntercomNotification.update
      prisma.virtualIntercomNotification.update = jest.fn().mockResolvedValue({});

      // Spy en processApproval
      const processApprovalSpy = jest.spyOn(intercomService, 'processApproval' as any).mockResolvedValue();

      // Ejecutar función
      const result = await intercomService.processWebhook(
        NotificationChannel.WHATSAPP,
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

      // Spy en processRejection
      const processRejectionSpy = jest.spyOn(intercomService, 'processRejection' as any).mockResolvedValue();

      // Ejecutar función
      const result = await intercomService.processWebhook(
        NotificationChannel.TELEGRAM,
        mockPayload
      );

      // Verificaciones
      expect(result).toEqual({ success: true });
      expect(processRejectionSpy).toHaveBeenCalledWith('notification-2');
    });
  });

  describe('approveVisit', () => {
    it('debe actualizar el estado de la visita a APPROVED', async () => {
      // Ejecutar función
      await intercomService.approveVisit('visit-123', 1);

      // Verificaciones
      expect(prisma.visit.update).toHaveBeenCalledWith({
        where: { id: 'visit-123' },
        data: {
          status: VisitStatus.APPROVED,
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
      expect(prisma.visit.update).toHaveBeenCalledWith({
        where: { id: 'visit-123' },
        data: {
          status: VisitStatus.REJECTED,
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
          status: VisitStatus.COMPLETED,
          entryTime: new Date(),
          exitTime: new Date(),
          createdAt: new Date(),
          notifications: []
        }
      ];

      // Mock para visit.findMany
      prisma.visit.findMany = jest.fn().mockResolvedValue(mockVisits);

      // Mock para visit.count
      prisma.visit.count = jest.fn().mockResolvedValue(1);

      // Ejecutar función
      const result = await intercomService.getVisitHistory(1, {
        page: 1,
        pageSize: 10
      });

      // Verificaciones
      expect(prisma.visit.findMany).toHaveBeenCalledWith({
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

      expect(prisma.visit.count).toHaveBeenCalledWith({
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
      prisma.visit.findMany = jest.fn().mockResolvedValue([]);
      prisma.visit.count = jest.fn().mockResolvedValue(0);

      // Fechas para filtros
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');

      // Ejecutar función con filtros
      await intercomService.getVisitHistory(1, {
        status: VisitStatus.APPROVED,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        page: 2,
        pageSize: 5
      });

      // Verificaciones
      expect(prisma.visit.findMany).toHaveBeenCalledWith({
        where: {
          unitId: 1,
          status: VisitStatus.APPROVED,
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
      prisma.userIntercomPreference.findUnique = jest.fn().mockResolvedValue({
        id: 1,
        userId: 1
      });

      // Mock para userIntercomPreference.update
      prisma.userIntercomPreference.update = jest.fn().mockResolvedValue({
        id: 1,
        ...mockPreferences
      });

      // Ejecutar función
      const result = await intercomService.updateUserPreferences(1, mockPreferences);

      // Verificaciones
      expect(prisma.userIntercomPreference.update).toHaveBeenCalledWith({
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
      prisma.userIntercomPreference.findUnique = jest.fn().mockResolvedValue(null);

      // Mock para userIntercomPreference.create
      prisma.userIntercomPreference.create = jest.fn().mockResolvedValue({
        id: 1,
        userId: 1,
        ...mockPreferences
      });

      // Ejecutar función
      const result = await intercomService.updateUserPreferences(1, mockPreferences);

      // Verificaciones
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
      prisma.intercomSettings.findFirst = jest.fn().mockResolvedValue({
        id: 1
      });

      // Mock para intercomSettings.update
      prisma.intercomSettings.update = jest.fn().mockResolvedValue({
        id: 1,
        ...mockSettings
      });

      // Ejecutar función
      const result = await intercomService.updateSettings(mockSettings);

      // Verificaciones
      expect(prisma.intercomSettings.update).toHaveBeenCalledWith({
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
      prisma.intercomSettings.findFirst = jest.fn().mockResolvedValue(null);

      // Mock para intercomSettings.create
      prisma.intercomSettings.create = jest.fn().mockResolvedValue({
        id: 1,
        ...mockSettings
      });

      // Ejecutar función
      const result = await intercomService.updateSettings(mockSettings);

      // Verificaciones
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
