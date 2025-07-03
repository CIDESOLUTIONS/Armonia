import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import MonitoringService, { 
  MonitoringType, 
  MonitoringStatus, 
  AlertSeverity, 
  AlertStatus 
} from '@/lib/services/monitoring-service';
import { NotificationService } from '@/lib/services/notification-service';
import { ServerLogger } from '@/lib/logging/server-logger';
import axios from 'axios';
import { performance } from 'perf_hooks';

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  getTenantPrismaClient: jest.fn(() => ({
    monitoringConfig: {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn()
    },
    monitoringResult: {
      create: jest.fn(),
      findMany: jest.fn(),
      deleteMany: jest.fn()
    },
    alert: {
      create: jest.fn(),
      update: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      deleteMany: jest.fn()
    },
    notificationLog: {
      create: jest.fn(),
      deleteMany: jest.fn()
    }
  }))
}));

jest.mock('@/lib/services/notification-service');
jest.mock('@/lib/logging/server-logger');
jest.mock('axios');
jest.mock('perf_hooks', () => ({
  performance: {
    now: jest.fn(() => 1000)
  }
}));

describe('MonitoringService', () => {
  let monitoringService;
  let mockPrisma;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create service instance
    monitoringService = new MonitoringService('test_tenant');
    mockPrisma = monitoringService.prisma;
  });

  describe('createMonitoringConfig', () => {
    it('should create a monitoring configuration successfully', async () => {
      // Arrange
      const configData = {
        name: 'Test Config',
        monitoringType: MonitoringType.APPLICATION,
        checkInterval: 300,
        targetResource: 'api:https://example.com/status',
        alertThresholds: {
          warning: 1000,
          error: 3000,
          critical: 5000
        }
      };
      
      const mockCreatedConfig = {
        id: 1,
        ...configData,
        tenantId: 'test_tenant',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      mockPrisma.monitoringConfig.create.mockResolvedValue(mockCreatedConfig);
      
      // Act
      const result = await monitoringService.createMonitoringConfig(configData, 123);
      
      // Assert
      expect(mockPrisma.monitoringConfig.create).toHaveBeenCalledWith({
        data: {
          tenantId: 'test_tenant',
          name: configData.name,
          description: undefined,
          monitoringType: configData.monitoringType,
          checkInterval: configData.checkInterval,
          targetResource: configData.targetResource,
          parameters: {},
          alertThresholds: configData.alertThresholds,
          isActive: true
        }
      });
      
      expect(ServerLogger.info).toHaveBeenCalled();
      expect(result).toEqual(mockCreatedConfig);
    });

    it('should handle errors when creating a monitoring configuration', async () => {
      // Arrange
      const configData = {
        name: 'Test Config',
        monitoringType: MonitoringType.APPLICATION,
        checkInterval: 300,
        targetResource: 'api:https://example.com/status',
        alertThresholds: {
          warning: 1000,
          error: 3000,
          critical: 5000
        }
      };
      
      const mockError = new Error('Database error');
      mockPrisma.monitoringConfig.create.mockRejectedValue(mockError);
      
      // Act & Assert
      await expect(monitoringService.createMonitoringConfig(configData, 123))
        .rejects.toThrow('Error al crear configuración de monitoreo');
      
      expect(ServerLogger.error).toHaveBeenCalled();
    });
  });

  describe('updateMonitoringConfig', () => {
    it('should update a monitoring configuration successfully', async () => {
      // Arrange
      const configId = 1;
      const updateData = {
        name: 'Updated Config',
        checkInterval: 600
      };
      
      const mockUpdatedConfig = {
        id: configId,
        name: updateData.name,
        description: 'Test description',
        monitoringType: MonitoringType.APPLICATION,
        checkInterval: updateData.checkInterval,
        targetResource: 'api:https://example.com/status',
        parameters: {},
        alertThresholds: {
          warning: 1000,
          error: 3000,
          critical: 5000
        },
        tenantId: 'test_tenant',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      mockPrisma.monitoringConfig.update.mockResolvedValue(mockUpdatedConfig);
      
      // Act
      const result = await monitoringService.updateMonitoringConfig(configId, updateData, 123);
      
      // Assert
      expect(mockPrisma.monitoringConfig.update).toHaveBeenCalledWith({
        where: { id: configId },
        data: updateData
      });
      
      expect(ServerLogger.info).toHaveBeenCalled();
      expect(result).toEqual(mockUpdatedConfig);
    });

    it('should handle errors when updating a monitoring configuration', async () => {
      // Arrange
      const configId = 1;
      const updateData = {
        name: 'Updated Config',
        checkInterval: 600
      };
      
      const mockError = new Error('Database error');
      mockPrisma.monitoringConfig.update.mockRejectedValue(mockError);
      
      // Act & Assert
      await expect(monitoringService.updateMonitoringConfig(configId, updateData, 123))
        .rejects.toThrow('Error al actualizar configuración de monitoreo');
      
      expect(ServerLogger.error).toHaveBeenCalled();
    });
  });

  describe('deleteMonitoringConfig', () => {
    it('should delete a monitoring configuration and related data successfully', async () => {
      // Arrange
      const configId = 1;
      
      mockPrisma.alert.findMany.mockResolvedValue([
        { id: 101 },
        { id: 102 }
      ]);
      
      mockPrisma.monitoringResult.deleteMany.mockResolvedValue({ count: 5 });
      mockPrisma.notificationLog.deleteMany.mockResolvedValue({ count: 3 });
      mockPrisma.alert.deleteMany.mockResolvedValue({ count: 2 });
      mockPrisma.monitoringConfig.delete.mockResolvedValue({ id: configId });
      
      // Act
      const result = await monitoringService.deleteMonitoringConfig(configId, 123);
      
      // Assert
      expect(mockPrisma.monitoringResult.deleteMany).toHaveBeenCalledWith({
        where: { configId }
      });
      
      expect(mockPrisma.alert.findMany).toHaveBeenCalledWith({
        where: { configId },
        select: { id: true }
      });
      
      expect(mockPrisma.notificationLog.deleteMany).toHaveBeenCalledWith({
        where: { alertId: { in: [101, 102] } }
      });
      
      expect(mockPrisma.alert.deleteMany).toHaveBeenCalledWith({
        where: { configId }
      });
      
      expect(mockPrisma.monitoringConfig.delete).toHaveBeenCalledWith({
        where: { id: configId }
      });
      
      expect(ServerLogger.info).toHaveBeenCalled();
      expect(result).toEqual({
        success: true,
        message: 'Configuración eliminada correctamente'
      });
    });

    it('should handle errors when deleting a monitoring configuration', async () => {
      // Arrange
      const configId = 1;
      
      const mockError = new Error('Database error');
      mockPrisma.monitoringResult.deleteMany.mockRejectedValue(mockError);
      
      // Act & Assert
      await expect(monitoringService.deleteMonitoringConfig(configId, 123))
        .rejects.toThrow('Error al eliminar configuración de monitoreo');
      
      expect(ServerLogger.error).toHaveBeenCalled();
    });
  });

  describe('getMonitoringConfigs', () => {
    it('should get all active monitoring configurations', async () => {
      // Arrange
      const mockConfigs = [
        {
          id: 1,
          name: 'Config 1',
          monitoringType: MonitoringType.APPLICATION,
          isActive: true
        },
        {
          id: 2,
          name: 'Config 2',
          monitoringType: MonitoringType.INFRASTRUCTURE,
          isActive: true
        }
      ];
      
      mockPrisma.monitoringConfig.findMany.mockResolvedValue(mockConfigs);
      
      // Act
      const result = await monitoringService.getMonitoringConfigs();
      
      // Assert
      expect(mockPrisma.monitoringConfig.findMany).toHaveBeenCalledWith({
        where: {
          tenantId: 'test_tenant',
          isActive: true
        },
        orderBy: { name: 'asc' }
      });
      
      expect(result).toEqual(mockConfigs);
    });

    it('should include inactive configurations when specified', async () => {
      // Arrange
      const mockConfigs = [
        {
          id: 1,
          name: 'Config 1',
          monitoringType: MonitoringType.APPLICATION,
          isActive: true
        },
        {
          id: 2,
          name: 'Config 2',
          monitoringType: MonitoringType.INFRASTRUCTURE,
          isActive: false
        }
      ];
      
      mockPrisma.monitoringConfig.findMany.mockResolvedValue(mockConfigs);
      
      // Act
      const result = await monitoringService.getMonitoringConfigs(true);
      
      // Assert
      expect(mockPrisma.monitoringConfig.findMany).toHaveBeenCalledWith({
        where: {
          tenantId: 'test_tenant'
        },
        orderBy: { name: 'asc' }
      });
      
      expect(result).toEqual(mockConfigs);
    });

    it('should handle errors when getting monitoring configurations', async () => {
      // Arrange
      const mockError = new Error('Database error');
      mockPrisma.monitoringConfig.findMany.mockRejectedValue(mockError);
      
      // Act & Assert
      await expect(monitoringService.getMonitoringConfigs())
        .rejects.toThrow('Error al obtener configuraciones de monitoreo');
      
      expect(ServerLogger.error).toHaveBeenCalled();
    });
  });

  describe('executeCheck', () => {
    it('should execute a check for an application monitoring configuration', async () => {
      // Arrange
      const configId = 1;
      const mockConfig = {
        id: configId,
        name: 'API Status',
        monitoringType: MonitoringType.APPLICATION,
        targetResource: 'api:https://example.com/status',
        parameters: {
          method: 'GET',
          timeout: 5000
        },
        alertThresholds: {
          warning: 1000,
          error: 3000,
          critical: 5000
        },
        isActive: true
      };
      
      const mockResponse = {
        status: 200,
        headers: {
          'content-length': '1024',
          'content-type': 'application/json'
        }
      };
      
      const mockResult = {
        id: 101,
        configId,
        status: MonitoringStatus.SUCCESS,
        responseTime: 500,
        details: {
          statusCode: 200,
          contentLength: '1024',
          contentType: 'application/json'
        },
        timestamp: new Date()
      };
      
      mockPrisma.monitoringConfig.findUnique.mockResolvedValue(mockConfig);
      axios.mockResolvedValue(mockResponse);
      mockPrisma.monitoringResult.create.mockResolvedValue(mockResult);
      mockPrisma.alert.findFirst.mockResolvedValue(null);
      
      // Mock performance.now to simulate elapsed time
      performance.now.mockReturnValueOnce(1000).mockReturnValueOnce(1500);
      
      // Act
      const result = await monitoringService.executeCheck(configId);
      
      // Assert
      expect(mockPrisma.monitoringConfig.findUnique).toHaveBeenCalledWith({
        where: { id: configId }
      });
      
      expect(axios).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://example.com/status',
        headers: {},
        data: undefined,
        timeout: 5000
      });
      
      expect(mockPrisma.monitoringResult.create).toHaveBeenCalled();
      expect(mockPrisma.alert.findFirst).toHaveBeenCalled();
      
      expect(result).toEqual(mockResult);
    });

    it('should skip check for inactive configuration', async () => {
      // Arrange
      const configId = 1;
      const mockConfig = {
        id: configId,
        name: 'API Status',
        monitoringType: MonitoringType.APPLICATION,
        targetResource: 'api:https://example.com/status',
        parameters: {},
        alertThresholds: {},
        isActive: false
      };
      
      mockPrisma.monitoringConfig.findUnique.mockResolvedValue(mockConfig);
      
      // Act
      const result = await monitoringService.executeCheck(configId);
      
      // Assert
      expect(mockPrisma.monitoringConfig.findUnique).toHaveBeenCalledWith({
        where: { id: configId }
      });
      
      expect(axios).not.toHaveBeenCalled();
      expect(mockPrisma.monitoringResult.create).not.toHaveBeenCalled();
      
      expect(result).toEqual({
        skipped: true,
        message: 'Configuración inactiva'
      });
    });

    it('should create an alert when check result exceeds thresholds', async () => {
      // Arrange
      const configId = 1;
      const mockConfig = {
        id: configId,
        name: 'API Status',
        monitoringType: MonitoringType.APPLICATION,
        targetResource: 'api:https://example.com/status',
        parameters: {
          method: 'GET',
          timeout: 5000
        },
        alertThresholds: {
          warning: 1000,
          error: 3000,
          critical: 5000
        },
        isActive: true
      };
      
      const mockResponse = {
        status: 200,
        headers: {
          'content-length': '1024',
          'content-type': 'application/json'
        }
      };
      
      const mockResult = {
        id: 101,
        configId,
        status: MonitoringStatus.WARNING,
        responseTime: 2000, // Exceeds warning threshold
        details: {
          statusCode: 200,
          contentLength: '1024',
          contentType: 'application/json'
        },
        timestamp: new Date()
      };
      
      const mockAlert = {
        id: 201,
        configId,
        severity: AlertSeverity.WARNING,
        message: '[WARNING] API Status: Valor 2000 ms',
        details: {
          result: mockResult.details,
          value: undefined,
          errorMessage: undefined
        },
        status: AlertStatus.ACTIVE,
        timestamp: new Date()
      };
      
      mockPrisma.monitoringConfig.findUnique.mockResolvedValue(mockConfig);
      axios.mockResolvedValue(mockResponse);
      mockPrisma.monitoringResult.create.mockResolvedValue(mockResult);
      mockPrisma.alert.findFirst.mockResolvedValue(null);
      mockPrisma.alert.create.mockResolvedValue(mockAlert);
      
      // Mock performance.now to simulate elapsed time
      performance.now.mockReturnValueOnce(1000).mockReturnValueOnce(3000);
      
      // Act
      const result = await monitoringService.executeCheck(configId);
      
      // Assert
      expect(mockPrisma.monitoringConfig.findUnique).toHaveBeenCalledWith({
        where: { id: configId }
      });
      
      expect(axios).toHaveBeenCalled();
      expect(mockPrisma.monitoringResult.create).toHaveBeenCalled();
      expect(mockPrisma.alert.findFirst).toHaveBeenCalled();
      expect(mockPrisma.alert.create).toHaveBeenCalled();
      
      expect(result).toEqual(mockResult);
    });

    it('should handle errors during check execution', async () => {
      // Arrange
      const configId = 1;
      const mockConfig = {
        id: configId,
        name: 'API Status',
        monitoringType: MonitoringType.APPLICATION,
        targetResource: 'api:https://example.com/status',
        parameters: {
          method: 'GET',
          timeout: 5000
        },
        alertThresholds: {
          warning: 1000,
          error: 3000,
          critical: 5000
        },
        isActive: true
      };
      
      const mockError = new Error('Connection timeout');
      const mockResult = {
        id: 101,
        configId,
        status: MonitoringStatus.ERROR,
        errorMessage: 'Connection timeout',
        timestamp: new Date()
      };
      
      mockPrisma.monitoringConfig.findUnique.mockResolvedValue(mockConfig);
      axios.mockRejectedValue(mockError);
      mockPrisma.monitoringResult.create.mockResolvedValue(mockResult);
      
      // Act
      await expect(monitoringService.executeCheck(configId))
        .rejects.toThrow('Error al ejecutar verificación de monitoreo');
      
      // Assert
      expect(mockPrisma.monitoringConfig.findUnique).toHaveBeenCalledWith({
        where: { id: configId }
      });
      
      expect(axios).toHaveBeenCalled();
      expect(mockPrisma.monitoringResult.create).toHaveBeenCalled();
      expect(ServerLogger.error).toHaveBeenCalled();
    });
  });

  describe('getActiveAlerts', () => {
    it('should get active alerts', async () => {
      // Arrange
      const mockAlerts = [
        {
          id: 1,
          configId: 101,
          severity: AlertSeverity.ERROR,
          message: 'Error alert',
          status: AlertStatus.ACTIVE,
          timestamp: new Date(),
          config: {
            name: 'Config 1',
            monitoringType: MonitoringType.APPLICATION,
            targetResource: 'api:https://example.com/status'
          }
        },
        {
          id: 2,
          configId: 102,
          severity: AlertSeverity.CRITICAL,
          message: 'Critical alert',
          status: AlertStatus.ACTIVE,
          timestamp: new Date(),
          config: {
            name: 'Config 2',
            monitoringType: MonitoringType.INFRASTRUCTURE,
            targetResource: 'server:cpu'
          }
        }
      ];
      
      mockPrisma.alert.findMany.mockResolvedValue(mockAlerts);
      
      // Act
      const result = await monitoringService.getActiveAlerts();
      
      // Assert
      expect(mockPrisma.alert.findMany).toHaveBeenCalledWith({
        where: {
          status: { in: [AlertStatus.ACTIVE] },
          config: {
            tenantId: 'test_tenant'
          }
        },
        include: {
          config: {
            select: {
              name: true,
              monitoringType: true,
              targetResource: true
            }
          }
        },
        orderBy: [
          { severity: 'desc' },
          { timestamp: 'desc' }
        ]
      });
      
      expect(result).toEqual(mockAlerts);
    });

    it('should include acknowledged alerts when specified', async () => {
      // Arrange
      const mockAlerts = [
        {
          id: 1,
          configId: 101,
          severity: AlertSeverity.ERROR,
          message: 'Error alert',
          status: AlertStatus.ACTIVE,
          timestamp: new Date()
        },
        {
          id: 2,
          configId: 102,
          severity: AlertSeverity.WARNING,
          message: 'Warning alert',
          status: AlertStatus.ACKNOWLEDGED,
          timestamp: new Date()
        }
      ];
      
      mockPrisma.alert.findMany.mockResolvedValue(mockAlerts);
      
      // Act
      const result = await monitoringService.getActiveAlerts(true);
      
      // Assert
      expect(mockPrisma.alert.findMany).toHaveBeenCalledWith({
        where: {
          status: { in: [AlertStatus.ACTIVE, AlertStatus.ACKNOWLEDGED] },
          config: {
            tenantId: 'test_tenant'
          }
        },
        include: {
          config: {
            select: {
              name: true,
              monitoringType: true,
              targetResource: true
            }
          }
        },
        orderBy: [
          { severity: 'desc' },
          { timestamp: 'desc' }
        ]
      });
      
      expect(result).toEqual(mockAlerts);
    });

    it('should handle errors when getting active alerts', async () => {
      // Arrange
      const mockError = new Error('Database error');
      mockPrisma.alert.findMany.mockRejectedValue(mockError);
      
      // Act & Assert
      await expect(monitoringService.getActiveAlerts())
        .rejects.toThrow('Error al obtener alertas');
      
      expect(ServerLogger.error).toHaveBeenCalled();
    });
  });

  describe('acknowledgeAlert', () => {
    it('should acknowledge an alert', async () => {
      // Arrange
      const alertId = 1;
      const userId = 123;
      
      const mockUpdatedAlert = {
        id: alertId,
        status: AlertStatus.ACKNOWLEDGED,
        acknowledgedById: userId,
        acknowledgedAt: expect.any(Date)
      };
      
      mockPrisma.alert.update.mockResolvedValue(mockUpdatedAlert);
      
      // Act
      const result = await monitoringService.acknowledgeAlert(alertId, userId);
      
      // Assert
      expect(mockPrisma.alert.update).toHaveBeenCalledWith({
        where: { id: alertId },
        data: {
          status: AlertStatus.ACKNOWLEDGED,
          acknowledgedById: userId,
          acknowledgedAt: expect.any(Date)
        }
      });
      
      expect(ServerLogger.info).toHaveBeenCalled();
      expect(result).toEqual(mockUpdatedAlert);
    });

    it('should handle errors when acknowledging an alert', async () => {
      // Arrange
      const alertId = 1;
      const userId = 123;
      
      const mockError = new Error('Database error');
      mockPrisma.alert.update.mockRejectedValue(mockError);
      
      // Act & Assert
      await expect(monitoringService.acknowledgeAlert(alertId, userId))
        .rejects.toThrow('Error al reconocer alerta');
      
      expect(ServerLogger.error).toHaveBeenCalled();
    });
  });

  describe('resolveAlert', () => {
    it('should resolve an alert', async () => {
      // Arrange
      const alertId = 1;
      const userId = 123;
      
      const mockUpdatedAlert = {
        id: alertId,
        status: AlertStatus.RESOLVED,
        resolvedAt: expect.any(Date)
      };
      
      mockPrisma.alert.update.mockResolvedValue(mockUpdatedAlert);
      
      // Act
      const result = await monitoringService.resolveAlert(alertId, userId);
      
      // Assert
      expect(mockPrisma.alert.update).toHaveBeenCalledWith({
        where: { id: alertId },
        data: {
          status: AlertStatus.RESOLVED,
          resolvedAt: expect.any(Date)
        }
      });
      
      expect(ServerLogger.info).toHaveBeenCalled();
      expect(result).toEqual(mockUpdatedAlert);
    });

    it('should handle errors when resolving an alert', async () => {
      // Arrange
      const alertId = 1;
      const userId = 123;
      
      const mockError = new Error('Database error');
      mockPrisma.alert.update.mockRejectedValue(mockError);
      
      // Act & Assert
      await expect(monitoringService.resolveAlert(alertId, userId))
        .rejects.toThrow('Error al resolver alerta');
      
      expect(ServerLogger.error).toHaveBeenCalled();
    });
  });

  describe('getMonitoringStats', () => {
    it('should get monitoring statistics for a configuration', async () => {
      // Arrange
      const configId = 1;
      const days = 7;
      
      const mockResults = [
        {
          id: 101,
          configId,
          status: MonitoringStatus.SUCCESS,
          responseTime: 200,
          timestamp: new Date('2025-06-01T10:00:00Z')
        },
        {
          id: 102,
          configId,
          status: MonitoringStatus.SUCCESS,
          responseTime: 300,
          timestamp: new Date('2025-06-01T11:00:00Z')
        },
        {
          id: 103,
          configId,
          status: MonitoringStatus.WARNING,
          responseTime: 1200,
          timestamp: new Date('2025-06-02T10:00:00Z')
        },
        {
          id: 104,
          configId,
          status: MonitoringStatus.ERROR,
          responseTime: 3500,
          timestamp: new Date('2025-06-03T10:00:00Z')
        }
      ];
      
      mockPrisma.monitoringResult.findMany.mockResolvedValue(mockResults);
      
      // Act
      const result = await monitoringService.getMonitoringStats(configId, days);
      
      // Assert
      expect(mockPrisma.monitoringResult.findMany).toHaveBeenCalledWith({
        where: {
          configId,
          timestamp: { gte: expect.any(Date) }
        },
        orderBy: { timestamp: 'asc' }
      });
      
      expect(result).toHaveProperty('totalChecks', 4);
      expect(result).toHaveProperty('successChecks', 2);
      expect(result).toHaveProperty('warningChecks', 1);
      expect(result).toHaveProperty('errorChecks', 1);
      expect(result).toHaveProperty('criticalChecks', 0);
      expect(result).toHaveProperty('availability', 50);
      expect(result).toHaveProperty('avgResponseTime', 1300);
      expect(result).toHaveProperty('dailyStats');
      expect(Array.isArray(result.dailyStats)).toBe(true);
    });

    it('should handle empty results when getting statistics', async () => {
      // Arrange
      const configId = 1;
      const days = 7;
      
      mockPrisma.monitoringResult.findMany.mockResolvedValue([]);
      
      // Act
      const result = await monitoringService.getMonitoringStats(configId, days);
      
      // Assert
      expect(result).toHaveProperty('totalChecks', 0);
      expect(result).toHaveProperty('successChecks', 0);
      expect(result).toHaveProperty('warningChecks', 0);
      expect(result).toHaveProperty('errorChecks', 0);
      expect(result).toHaveProperty('criticalChecks', 0);
      expect(result).toHaveProperty('availability', 0);
      expect(result).toHaveProperty('avgResponseTime', 0);
      expect(result).toHaveProperty('dailyStats');
      expect(Array.isArray(result.dailyStats)).toBe(true);
    });

    it('should handle errors when getting statistics', async () => {
      // Arrange
      const configId = 1;
      const days = 7;
      
      const mockError = new Error('Database error');
      mockPrisma.monitoringResult.findMany.mockRejectedValue(mockError);
      
      // Act & Assert
      await expect(monitoringService.getMonitoringStats(configId, days))
        .rejects.toThrow('Error al obtener estadísticas de monitoreo');
      
      expect(ServerLogger.error).toHaveBeenCalled();
    });
  });
});
