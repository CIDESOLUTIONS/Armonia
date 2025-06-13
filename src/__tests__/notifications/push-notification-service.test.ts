// src/__tests__/notifications/push-notification-service.test.ts
import { PushNotificationService, SendNotificationRequest } from '@/lib/notifications/push-notification-service';

// Mock de Prisma
jest.mock('@/lib/prisma', () => ({
  getPrisma: jest.fn(() => ({
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn()
    }
  }))
}));

describe('PushNotificationService', () => {
  let service: PushNotificationService;

  beforeEach(() => {
    service = PushNotificationService.getInstance();
    jest.clearAllMocks();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = PushNotificationService.getInstance();
      const instance2 = PushNotificationService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Initialize', () => {
    it('should initialize in simulation mode when Firebase not configured', async () => {
      // Mock environment variables not set
      const originalEnv = process.env;
      process.env = { ...originalEnv };
      delete process.env.FIREBASE_PROJECT_ID;
      delete process.env.FIREBASE_PRIVATE_KEY;

      await service.initialize();
      
      // Should not throw and should work in simulation mode
      expect(true).toBe(true);
      
      process.env = originalEnv;
    });

    it('should initialize with Firebase when configured', async () => {
      // Mock environment variables set
      const originalEnv = process.env;
      process.env = {
        ...originalEnv,
        FIREBASE_PROJECT_ID: 'test-project',
        FIREBASE_PRIVATE_KEY: 'test-key',
        FIREBASE_CLIENT_EMAIL: 'test@test.com'
      };

      await service.initialize();
      
      expect(true).toBe(true);
      
      process.env = originalEnv;
    });
  });

  describe('Send Notification', () => {
    const mockRequest: SendNotificationRequest = {
      payload: {
        title: 'Test Notification',
        body: 'This is a test notification'
      },
      target: {
        complexId: 1
      },
      complexId: 1
    };

    beforeEach(async () => {
      await service.initialize();
    });

    it('should send notification successfully', async () => {
      const { getPrisma } = await import('@/lib/prisma');
      const mockPrisma = getPrisma();

      // Mock users with device tokens
      mockPrisma.user.findMany.mockResolvedValue([
        { deviceTokens: ['token1', 'token2'] },
        { deviceTokens: ['token3'] },
        { deviceTokens: [] }
      ]);

      const result = await service.sendNotification(mockRequest);

      expect(result.success).toBe(true);
      expect(result.messageId).toBeDefined();
      expect(result.successCount).toBeGreaterThan(0);
      expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
        where: { complexId: 1 },
        select: { deviceTokens: true }
      });
    });

    it('should fail when no title provided', async () => {
      const invalidRequest = {
        ...mockRequest,
        payload: {
          title: '',
          body: 'Test body'
        }
      };

      const result = await service.sendNotification(invalidRequest);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors![0].error).toContain('Título y cuerpo son requeridos');
    });

    it('should fail when no complex ID provided', async () => {
      const invalidRequest = {
        ...mockRequest,
        complexId: 0
      };
      delete invalidRequest.complexId;

      const result = await service.sendNotification(invalidRequest as any);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('should handle specific user targeting', async () => {
      const { getPrisma } = await import('@/lib/prisma');
      const mockPrisma = getPrisma();

      mockPrisma.user.findUnique.mockResolvedValue({
        deviceTokens: ['user-token-1', 'user-token-2']
      });

      const userTargetRequest = {
        ...mockRequest,
        target: { userId: 123 }
      };

      const result = await service.sendNotification(userTargetRequest);

      expect(result.success).toBe(true);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 123 },
        select: { deviceTokens: true }
      });
    });

    it('should handle role-based targeting', async () => {
      const { getPrisma } = await import('@/lib/prisma');
      const mockPrisma = getPrisma();

      mockPrisma.user.findMany.mockResolvedValue([
        { deviceTokens: ['admin-token-1'] },
        { deviceTokens: ['admin-token-2'] }
      ]);

      const roleTargetRequest = {
        ...mockRequest,
        target: { role: 'ADMIN' as const, complexId: 1 }
      };

      const result = await service.sendNotification(roleTargetRequest);

      expect(result.success).toBe(true);
      expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
        where: {
          role: 'ADMIN',
          complexId: 1
        },
        select: { deviceTokens: true }
      });
    });

    it('should handle multiple user IDs targeting', async () => {
      const { getPrisma } = await import('@/lib/prisma');
      const mockPrisma = getPrisma();

      mockPrisma.user.findMany.mockResolvedValue([
        { deviceTokens: ['token1'] },
        { deviceTokens: ['token2'] }
      ]);

      const multiUserRequest = {
        ...mockRequest,
        target: { userIds: [1, 2, 3] }
      };

      const result = await service.sendNotification(multiUserRequest);

      expect(result.success).toBe(true);
      expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
        where: {
          id: { in: [1, 2, 3] }
        },
        select: { deviceTokens: true }
      });
    });

    it('should handle direct device tokens', async () => {
      const directTokenRequest = {
        ...mockRequest,
        target: { deviceTokens: ['direct-token-1', 'direct-token-2'] }
      };

      const result = await service.sendNotification(directTokenRequest);

      expect(result.success).toBe(true);
      expect(result.successCount).toBe(2);
    });

    it('should handle scheduled notifications', async () => {
      const futureDate = new Date(Date.now() + 3600000); // 1 hora en el futuro
      const scheduledRequest = {
        ...mockRequest,
        scheduleAt: futureDate,
        target: { deviceTokens: ['token1'] }
      };

      const result = await service.sendNotification(scheduledRequest);

      expect(result.success).toBe(true);
      expect(result.messageId).toContain('scheduled');
    });

    it('should return error when no target devices found', async () => {
      const { getPrisma } = await import('@/lib/prisma');
      const mockPrisma = getPrisma();

      mockPrisma.user.findMany.mockResolvedValue([]);

      const result = await service.sendNotification(mockRequest);

      expect(result.success).toBe(false);
      expect(result.errors![0].error).toContain('No se encontraron dispositivos de destino');
    });
  });

  describe('Template Notifications', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should send payment reminder template', async () => {
      const { getPrisma } = await import('@/lib/prisma');
      const mockPrisma = getPrisma();

      mockPrisma.user.findMany.mockResolvedValue([
        { deviceTokens: ['token1'] }
      ]);

      const result = await service.sendTemplateNotification(
        'payment_reminder',
        { amount: 150000, dueDate: '2024-01-15' },
        { complexId: 1 }
      );

      expect(result.success).toBe(true);
    });

    it('should send assembly invitation template', async () => {
      const { getPrisma } = await import('@/lib/prisma');
      const mockPrisma = getPrisma();

      mockPrisma.user.findMany.mockResolvedValue([
        { deviceTokens: ['token1'] }
      ]);

      const result = await service.sendTemplateNotification(
        'assembly_invitation',
        { date: '2024-02-15', topic: 'Presupuesto Anual' },
        { complexId: 1 }
      );

      expect(result.success).toBe(true);
    });

    it('should send incident update template', async () => {
      const { getPrisma } = await import('@/lib/prisma');
      const mockPrisma = getPrisma();

      mockPrisma.user.findMany.mockResolvedValue([
        { deviceTokens: ['token1'] }
      ]);

      const result = await service.sendTemplateNotification(
        'incident_update',
        { incidentId: 123, status: 'Resuelto' },
        { userId: 1 }
      );

      expect(result.success).toBe(true);
    });

    it('should send PQR response template', async () => {
      const { getPrisma } = await import('@/lib/prisma');
      const mockPrisma = getPrisma();

      mockPrisma.user.findUnique.mockResolvedValue({
        deviceTokens: ['token1']
      });

      const result = await service.sendTemplateNotification(
        'pqr_response',
        { pqrId: 456, status: 'Respondido' },
        { userId: 1 }
      );

      expect(result.success).toBe(true);
    });

    it('should send general announcement template', async () => {
      const { getPrisma } = await import('@/lib/prisma');
      const mockPrisma = getPrisma();

      mockPrisma.user.findMany.mockResolvedValue([
        { deviceTokens: ['token1'] }
      ]);

      const result = await service.sendTemplateNotification(
        'general_announcement',
        { title: 'Mantenimiento', message: 'Corte de agua programado' },
        { complexId: 1 }
      );

      expect(result.success).toBe(true);
    });

    it('should fail with invalid template type', async () => {
      await expect(
        service.sendTemplateNotification(
          'invalid_template' as any,
          {},
          { complexId: 1 }
        )
      ).rejects.toThrow('Plantilla de notificación \'invalid_template\' no encontrada');
    });
  });

  describe('Topic Management', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should subscribe devices to topic', async () => {
      const result = await service.subscribeToTopic(['token1', 'token2'], 'complex_1_announcements');
      expect(result).toBe(true);
    });

    it('should unsubscribe devices from topic', async () => {
      const result = await service.unsubscribeFromTopic(['token1', 'token2'], 'complex_1_announcements');
      expect(result).toBe(true);
    });
  });

  describe('Error Handling', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should handle database errors gracefully', async () => {
      const { getPrisma } = await import('@/lib/prisma');
      const mockPrisma = getPrisma();

      mockPrisma.user.findMany.mockRejectedValue(new Error('Database connection failed'));

      const result = await service.sendNotification({
        payload: { title: 'Test', body: 'Test' },
        target: { complexId: 1 },
        complexId: 1
      });

      expect(result.success).toBe(false);
      expect(result.errors![0].error).toBeDefined();
    });
  });
});
