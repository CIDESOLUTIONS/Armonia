import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import InvoiceRuleService from '../../lib/services/invoice-rule-service';
import { getPrisma } from '@/lib/prisma';
import { ActivityLogger } from '../../lib/logging/activity-logger';
import { ServerLogger } from '../../lib/logging/server-logger';

// Mock de PrismaClient
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    invoiceRule: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    },
    property: {
      findMany: jest.fn()
    },
    invoice: {
      create: jest.fn()
    },
    invoiceSettings: {
      findFirst: jest.fn(),
      update: jest.fn()
    },
    invoiceTemplate: {
      findFirst: jest.fn()
    },
    $transaction: jest.fn((callback) => callback(mockPrismaClient))
  };
  
  return {
    PrismaClient: jest.fn(() => mockPrismaClient)
  };
});

// Mock de ActivityLogger
jest.mock('../../lib/logging/activity-logger', () => {
  return {
    ActivityLogger: jest.fn().mockImplementation(() => {
      return {
        logActivity: jest.fn().mockResolvedValue(true)
      };
    })
  };
});

// Mock de ServerLogger
jest.mock('../../lib/logging/server-logger', () => {
  return {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  };
});

describe('InvoiceRuleService', () => {
  let service;
  let mockPrisma;
  
  beforeEach(() => {
    // Limpiar todos los mocks antes de cada prueba
    jest.clearAllMocks();
    
    // Crear instancia del servicio
    service = new InvoiceRuleService('test_schema');
    
    // Obtener la instancia mock de PrismaClient
    mockPrisma = getPrisma();
  });
  
  describe('getRules', () => {
    it('debe devolver todas las reglas activas cuando includeInactive es false', async () => {
      // Configurar mock
      const mockRules = [
        { id: 1, name: 'Regla 1', isActive: true },
        { id: 2, name: 'Regla 2', isActive: true }
      ];
      
      mockPrisma.invoiceRule.findMany.mockResolvedValue(mockRules);
      
      // Ejecutar método
      const result = await service.getRules();
      
      // Verificar resultado
      expect(result).toEqual(mockRules);
      expect(mockPrisma.invoiceRule.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: [{ name: 'asc' }],
        include: expect.any(Object)
      });
    });
    
    it('debe devolver todas las reglas cuando includeInactive es true', async () => {
      // Configurar mock
      const mockRules = [
        { id: 1, name: 'Regla 1', isActive: true },
        { id: 2, name: 'Regla 2', isActive: false }
      ];
      
      mockPrisma.invoiceRule.findMany.mockResolvedValue(mockRules);
      
      // Ejecutar método
      const result = await service.getRules(true);
      
      // Verificar resultado
      expect(result).toEqual(mockRules);
      expect(mockPrisma.invoiceRule.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: [{ name: 'asc' }],
        include: expect.any(Object)
      });
    });
    
    it('debe manejar errores correctamente', async () => {
      // Configurar mock para lanzar error
      const mockError = new Error('Error de base de datos');
      mockPrisma.invoiceRule.findMany.mockRejectedValue(mockError);
      
      // Ejecutar método y verificar que lanza error
      await expect(service.getRules()).rejects.toThrow('Error al obtener reglas de facturación');
      
      // Verificar que se registró el error
      expect(ServerLogger.error).toHaveBeenCalledWith('Error al obtener reglas de facturación:', mockError);
    });
  });
  
  describe('getRuleById', () => {
    it('debe devolver una regla por ID', async () => {
      // Configurar mock
      const mockRule = { id: 1, name: 'Regla 1', isActive: true };
      mockPrisma.invoiceRule.findUnique.mockResolvedValue(mockRule);
      
      // Ejecutar método
      const result = await service.getRuleById(1);
      
      // Verificar resultado
      expect(result).toEqual(mockRule);
      expect(mockPrisma.invoiceRule.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: expect.any(Object)
      });
    });
    
    it('debe lanzar error si la regla no existe', async () => {
      // Configurar mock para devolver null
      mockPrisma.invoiceRule.findUnique.mockResolvedValue(null);
      
      // Ejecutar método y verificar que lanza error
      await expect(service.getRuleById(999)).rejects.toThrow('Regla con ID 999 no encontrada');
    });
    
    it('debe manejar errores correctamente', async () => {
      // Configurar mock para lanzar error
      const mockError = new Error('Error de base de datos');
      mockPrisma.invoiceRule.findUnique.mockRejectedValue(mockError);
      
      // Ejecutar método y verificar que lanza error
      await expect(service.getRuleById(1)).rejects.toThrow();
      
      // Verificar que se registró el error
      expect(ServerLogger.error).toHaveBeenCalledWith('Error al obtener regla de facturación con ID 1:', mockError);
    });
  });
  
  describe('createRule', () => {
    it('debe crear una nueva regla', async () => {
      // Datos de prueba
      const ruleData = {
        name: 'Nueva Regla',
        description: 'Descripción de prueba',
        isActive: true,
        frequency: 'MONTHLY',
        dayOfMonth: 1,
        startDate: new Date(),
        feeType: 'ORDINARY',
        amount: 50000,
        applyTo: 'ALL_PROPERTIES'
      };
      
      const userId = 1;
      
      // Configurar mock
      const createdRule = { id: 1, ...ruleData, nextRun: new Date() };
      mockPrisma.invoiceRule.create.mockResolvedValue(createdRule);
      
      // Ejecutar método
      const result = await service.createRule(ruleData, userId);
      
      // Verificar resultado
      expect(result).toEqual(createdRule);
      expect(mockPrisma.invoiceRule.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          ...ruleData,
          nextRun: expect.any(Date),
          createdById: userId
        })
      });
      
      // Verificar que se registró la actividad
      expect(service.activityLogger.logActivity).toHaveBeenCalledWith({
        userId,
        action: 'CREATE_INVOICE_RULE',
        resourceType: 'INVOICE_RULE',
        resourceId: 1,
        details: expect.any(Object)
      });
    });
    
    it('debe validar los datos de la regla', async () => {
      // Datos incompletos
      const ruleData = {
        // Sin nombre, que es obligatorio
        description: 'Descripción de prueba',
        isActive: true
      };
      
      // Ejecutar método y verificar que lanza error
      await expect(service.createRule(ruleData, 1)).rejects.toThrow('El nombre de la regla es obligatorio');
    });
    
    it('debe calcular correctamente la próxima ejecución', async () => {
      // Datos de prueba con frecuencia mensual
      const ruleData = {
        name: 'Regla Mensual',
        description: 'Descripción',
        isActive: true,
        frequency: 'MONTHLY',
        dayOfMonth: 15,
        startDate: new Date('2025-01-01'),
        feeType: 'ORDINARY',
        amount: 50000,
        applyTo: 'ALL_PROPERTIES'
      };
      
      // Configurar mock
      mockPrisma.invoiceRule.create.mockImplementation((args) => {
        return Promise.resolve({ id: 1, ...args.data });
      });
      
      // Ejecutar método
      const result = await service.createRule(ruleData, 1);
      
      // Verificar que nextRun se calculó correctamente
      expect(result.nextRun).toBeInstanceOf(Date);
      
      // Para una regla mensual con día 15, la próxima ejecución debería ser el día 15 del mes siguiente
      // a la fecha de inicio (o el mismo mes si aún no ha pasado el día 15)
      const expectedNextRun = new Date('2025-01-15');
      expectedNextRun.setHours(0, 0, 0, 0);
      
      // Comparar solo la fecha (ignorando la hora exacta)
      expect(result.nextRun.getFullYear()).toBe(expectedNextRun.getFullYear());
      expect(result.nextRun.getMonth()).toBe(expectedNextRun.getMonth());
      expect(result.nextRun.getDate()).toBe(expectedNextRun.getDate());
    });
    
    it('debe manejar errores correctamente', async () => {
      // Datos de prueba
      const ruleData = {
        name: 'Nueva Regla',
        description: 'Descripción de prueba',
        isActive: true,
        frequency: 'MONTHLY',
        dayOfMonth: 1,
        startDate: new Date(),
        feeType: 'ORDINARY',
        amount: 50000,
        applyTo: 'ALL_PROPERTIES'
      };
      
      // Configurar mock para lanzar error
      const mockError = new Error('Error de base de datos');
      mockPrisma.invoiceRule.create.mockRejectedValue(mockError);
      
      // Ejecutar método y verificar que lanza error
      await expect(service.createRule(ruleData, 1)).rejects.toThrow();
      
      // Verificar que se registró el error
      expect(ServerLogger.error).toHaveBeenCalledWith('Error al crear regla de facturación:', mockError);
    });
  });
  
  describe('updateRule', () => {
    it('debe actualizar una regla existente', async () => {
      // Datos de prueba
      const ruleId = 1;
      const ruleData = {
        name: 'Regla Actualizada',
        description: 'Descripción actualizada',
        isActive: true,
        frequency: 'MONTHLY',
        dayOfMonth: 5,
        feeType: 'ORDINARY',
        amount: 60000
      };
      
      const userId = 1;
      
      // Configurar mock para verificar existencia
      const existingRule = {
        id: ruleId,
        name: 'Regla Original',
        frequency: 'MONTHLY',
        dayOfMonth: 1,
        nextRun: new Date()
      };
      mockPrisma.invoiceRule.findUnique.mockResolvedValue(existingRule);
      
      // Configurar mock para actualización
      const updatedRule = { id: ruleId, ...ruleData, nextRun: new Date() };
      mockPrisma.invoiceRule.update.mockResolvedValue(updatedRule);
      
      // Ejecutar método
      const result = await service.updateRule(ruleId, ruleData, userId);
      
      // Verificar resultado
      expect(result).toEqual(updatedRule);
      expect(mockPrisma.invoiceRule.update).toHaveBeenCalledWith({
        where: { id: ruleId },
        data: expect.objectContaining({
          ...ruleData,
          nextRun: expect.any(Date)
        })
      });
      
      // Verificar que se registró la actividad
      expect(service.activityLogger.logActivity).toHaveBeenCalledWith({
        userId,
        action: 'UPDATE_INVOICE_RULE',
        resourceType: 'INVOICE_RULE',
        resourceId: ruleId,
        details: expect.any(Object)
      });
    });
    
    it('debe lanzar error si la regla no existe', async () => {
      // Configurar mock para devolver null
      mockPrisma.invoiceRule.findUnique.mockResolvedValue(null);
      
      // Ejecutar método y verificar que lanza error
      await expect(service.updateRule(999, {}, 1)).rejects.toThrow('Regla con ID 999 no encontrada');
    });
    
    it('debe validar los datos de la regla', async () => {
      // Configurar mock para verificar existencia
      mockPrisma.invoiceRule.findUnique.mockResolvedValue({ id: 1, name: 'Regla Original' });
      
      // Datos incompletos
      const ruleData = {
        name: '' // Nombre vacío, que no es válido
      };
      
      // Ejecutar método y verificar que lanza error
      await expect(service.updateRule(1, ruleData, 1)).rejects.toThrow('El nombre de la regla es obligatorio');
    });
    
    it('debe recalcular nextRun si cambian parámetros relevantes', async () => {
      // Configurar mock para verificar existencia
      const existingRule = {
        id: 1,
        name: 'Regla Original',
        frequency: 'MONTHLY',
        dayOfMonth: 1,
        startDate: new Date('2025-01-01'),
        nextRun: new Date('2025-02-01')
      };
      mockPrisma.invoiceRule.findUnique.mockResolvedValue(existingRule);
      
      // Datos con cambio de frecuencia
      const ruleData = {
        name: 'Regla Actualizada',
        frequency: 'WEEKLY', // Cambio de frecuencia
        dayOfWeek: 1, // Lunes
        startDate: new Date('2025-01-01')
      };
      
      // Configurar mock para actualización
      mockPrisma.invoiceRule.update.mockImplementation((args) => {
        return Promise.resolve({ id: 1, ...existingRule, ...args.data });
      });
      
      // Ejecutar método
      const result = await service.updateRule(1, ruleData, 1);
      
      // Verificar que nextRun se recalculó
      expect(result.nextRun).not.toEqual(existingRule.nextRun);
      
      // Para una regla semanal con día 1 (lunes), la próxima ejecución debería ser el próximo lunes
      // Verificar que es un lunes (getDay() devuelve 1 para lunes)
      expect(result.nextRun.getDay()).toBe(1);
    });
    
    it('debe mantener nextRun si no cambian parámetros relevantes', async () => {
      // Configurar mock para verificar existencia
      const existingRule = {
        id: 1,
        name: 'Regla Original',
        frequency: 'MONTHLY',
        dayOfMonth: 1,
        startDate: new Date('2025-01-01'),
        nextRun: new Date('2025-02-01')
      };
      mockPrisma.invoiceRule.findUnique.mockResolvedValue(existingRule);
      
      // Datos sin cambios relevantes para nextRun
      const ruleData = {
        name: 'Regla Actualizada',
        description: 'Nueva descripción'
      };
      
      // Configurar mock para actualización
      mockPrisma.invoiceRule.update.mockImplementation((args) => {
        return Promise.resolve({ id: 1, ...existingRule, ...args.data });
      });
      
      // Ejecutar método
      const result = await service.updateRule(1, ruleData, 1);
      
      // Verificar que nextRun no cambió
      expect(result.nextRun).toEqual(existingRule.nextRun);
    });
    
    it('debe manejar errores correctamente', async () => {
      // Configurar mock para verificar existencia
      mockPrisma.invoiceRule.findUnique.mockResolvedValue({ id: 1, name: 'Regla Original' });
      
      // Datos de prueba
      const ruleData = {
        name: 'Regla Actualizada'
      };
      
      // Configurar mock para lanzar error
      const mockError = new Error('Error de base de datos');
      mockPrisma.invoiceRule.update.mockRejectedValue(mockError);
      
      // Ejecutar método y verificar que lanza error
      await expect(service.updateRule(1, ruleData, 1)).rejects.toThrow();
      
      // Verificar que se registró el error
      expect(ServerLogger.error).toHaveBeenCalledWith('Error al actualizar regla de facturación con ID 1:', mockError);
    });
  });
  
  describe('deleteRule', () => {
    it('debe eliminar una regla existente', async () => {
      // Datos de prueba
      const ruleId = 1;
      const userId = 1;
      
      // Configurar mock para verificar existencia
      mockPrisma.invoiceRule.findUnique.mockResolvedValue({ id: ruleId, name: 'Regla a Eliminar' });
      
      // Configurar mock para eliminación
      mockPrisma.invoiceRule.delete.mockResolvedValue({ id: ruleId });
      
      // Ejecutar método
      const result = await service.deleteRule(ruleId, userId);
      
      // Verificar resultado
      expect(result).toEqual({ success: true, message: 'Regla eliminada correctamente' });
      expect(mockPrisma.invoiceRule.delete).toHaveBeenCalledWith({
        where: { id: ruleId }
      });
      
      // Verificar que se registró la actividad
      expect(service.activityLogger.logActivity).toHaveBeenCalledWith({
        userId,
        action: 'DELETE_INVOICE_RULE',
        resourceType: 'INVOICE_RULE',
        resourceId: ruleId,
        details: expect.any(Object)
      });
    });
    
    it('debe lanzar error si la regla no existe', async () => {
      // Configurar mock para devolver null
      mockPrisma.invoiceRule.findUnique.mockResolvedValue(null);
      
      // Ejecutar método y verificar que lanza error
      await expect(service.deleteRule(999, 1)).rejects.toThrow('Regla con ID 999 no encontrada');
    });
    
    it('debe manejar errores correctamente', async () => {
      // Configurar mock para verificar existencia
      mockPrisma.invoiceRule.findUnique.mockResolvedValue({ id: 1, name: 'Regla a Eliminar' });
      
      // Configurar mock para lanzar error
      const mockError = new Error('Error de base de datos');
      mockPrisma.invoiceRule.delete.mockRejectedValue(mockError);
      
      // Ejecutar método y verificar que lanza error
      await expect(service.deleteRule(1, 1)).rejects.toThrow();
      
      // Verificar que se registró el error
      expect(ServerLogger.error).toHaveBeenCalledWith('Error al eliminar regla de facturación con ID 1:', mockError);
    });
  });
  
  describe('toggleRuleActive', () => {
    it('debe activar una regla inactiva', async () => {
      // Datos de prueba
      const ruleId = 1;
      const userId = 1;
      
      // Configurar mock para verificar existencia
      mockPrisma.invoiceRule.findUnique.mockResolvedValue({ id: ruleId, name: 'Regla', isActive: false });
      
      // Configurar mock para actualización
      const updatedRule = { id: ruleId, name: 'Regla', isActive: true };
      mockPrisma.invoiceRule.update.mockResolvedValue(updatedRule);
      
      // Ejecutar método
      const result = await service.toggleRuleActive(ruleId, true, userId);
      
      // Verificar resultado
      expect(result).toEqual(updatedRule);
      expect(mockPrisma.invoiceRule.update).toHaveBeenCalledWith({
        where: { id: ruleId },
        data: { isActive: true }
      });
      
      // Verificar que se registró la actividad
      expect(service.activityLogger.logActivity).toHaveBeenCalledWith({
        userId,
        action: 'ACTIVATE_INVOICE_RULE',
        resourceType: 'INVOICE_RULE',
        resourceId: ruleId,
        details: expect.any(Object)
      });
    });
    
    it('debe desactivar una regla activa', async () => {
      // Datos de prueba
      const ruleId = 1;
      const userId = 1;
      
      // Configurar mock para verificar existencia
      mockPrisma.invoiceRule.findUnique.mockResolvedValue({ id: ruleId, name: 'Regla', isActive: true });
      
      // Configurar mock para actualización
      const updatedRule = { id: ruleId, name: 'Regla', isActive: false };
      mockPrisma.invoiceRule.update.mockResolvedValue(updatedRule);
      
      // Ejecutar método
      const result = await service.toggleRuleActive(ruleId, false, userId);
      
      // Verificar resultado
      expect(result).toEqual(updatedRule);
      expect(mockPrisma.invoiceRule.update).toHaveBeenCalledWith({
        where: { id: ruleId },
        data: { isActive: false }
      });
      
      // Verificar que se registró la actividad
      expect(service.activityLogger.logActivity).toHaveBeenCalledWith({
        userId,
        action: 'DEACTIVATE_INVOICE_RULE',
        resourceType: 'INVOICE_RULE',
        resourceId: ruleId,
        details: expect.any(Object)
      });
    });
    
    it('debe lanzar error si la regla no existe', async () => {
      // Configurar mock para devolver null
      mockPrisma.invoiceRule.findUnique.mockResolvedValue(null);
      
      // Ejecutar método y verificar que lanza error
      await expect(service.toggleRuleActive(999, true, 1)).rejects.toThrow('Regla con ID 999 no encontrada');
    });
    
    it('debe manejar errores correctamente', async () => {
      // Configurar mock para verificar existencia
      mockPrisma.invoiceRule.findUnique.mockResolvedValue({ id: 1, name: 'Regla', isActive: true });
      
      // Configurar mock para lanzar error
      const mockError = new Error('Error de base de datos');
      mockPrisma.invoiceRule.update.mockRejectedValue(mockError);
      
      // Ejecutar método y verificar que lanza error
      await expect(service.toggleRuleActive(1, false, 1)).rejects.toThrow();
      
      // Verificar que se registró el error
      expect(ServerLogger.error).toHaveBeenCalledWith('Error al desactivar regla 1:', mockError);
    });
  });
  
  describe('executeRule', () => {
    it('debe ejecutar una regla y generar facturas', async () => {
      // Datos de prueba
      const ruleId = 1;
      const userId = 1;
      
      // Configurar mock para obtener regla
      const mockRule = {
        id: ruleId,
        name: 'Regla de Prueba',
        isActive: true,
        frequency: 'MONTHLY',
        dayOfMonth: 1,
        amount: 50000,
        applyTo: 'ALL_PROPERTIES'
      };
      
      // Simular método getRuleById
      service.getRuleById = jest.fn().mockResolvedValue(mockRule);
      
      // Simular método processRule
      service.processRule = jest.fn().mockResolvedValue({
        invoicesGenerated: 3,
        invoiceIds: [101, 102, 103]
      });
      
      // Configurar mock para actualización
      mockPrisma.invoiceRule.update.mockResolvedValue({
        ...mockRule,
        lastRun: new Date()
      });
      
      // Ejecutar método
      const result = await service.executeRule(ruleId, userId);
      
      // Verificar resultado
      expect(result).toEqual({
        success: true,
        message: 'Regla ejecutada correctamente. Se generaron 3 facturas.',
        invoicesGenerated: 3,
        invoiceIds: [101, 102, 103]
      });
      
      // Verificar que se actualizó la última ejecución
      expect(mockPrisma.invoiceRule.update).toHaveBeenCalledWith({
        where: { id: ruleId },
        data: {
          lastRun: expect.any(Date)
        }
      });
      
      // Verificar que se registró la actividad
      expect(service.activityLogger.logActivity).toHaveBeenCalledWith({
        userId,
        action: 'EXECUTE_INVOICE_RULE',
        resourceType: 'INVOICE_RULE',
        resourceId: ruleId,
        details: expect.any(Object)
      });
    });
    
    it('debe lanzar error si la regla está inactiva', async () => {
      // Configurar mock para obtener regla inactiva
      service.getRuleById = jest.fn().mockResolvedValue({
        id: 1,
        name: 'Regla Inactiva',
        isActive: false
      });
      
      // Ejecutar método y verificar que lanza error
      await expect(service.executeRule(1, 1)).rejects.toThrow('No se puede ejecutar una regla inactiva');
    });
    
    it('debe manejar errores correctamente', async () => {
      // Configurar mock para obtener regla
      service.getRuleById = jest.fn().mockResolvedValue({
        id: 1,
        name: 'Regla de Prueba',
        isActive: true
      });
      
      // Configurar mock para lanzar error
      const mockError = new Error('Error al procesar regla');
      service.processRule = jest.fn().mockRejectedValue(mockError);
      
      // Ejecutar método y verificar que lanza error
      await expect(service.executeRule(1, 1)).rejects.toThrow();
      
      // Verificar que se registró el error
      expect(ServerLogger.error).toHaveBeenCalledWith('Error al ejecutar regla de facturación 1:', mockError);
    });
  });
  
  describe('processScheduledRules', () => {
    it('debe procesar todas las reglas programadas', async () => {
      // Configurar mock para obtener reglas programadas
      const mockRules = [
        { id: 1, name: 'Regla 1', isActive: true, nextRun: new Date('2025-01-01') },
        { id: 2, name: 'Regla 2', isActive: true, nextRun: new Date('2025-01-02') }
      ];
      
      mockPrisma.invoiceRule.findMany.mockResolvedValue(mockRules);
      
      // Simular método processRule
      service.processRule = jest.fn()
        .mockResolvedValueOnce({ invoicesGenerated: 2, invoiceIds: [101, 102] })
        .mockResolvedValueOnce({ invoicesGenerated: 3, invoiceIds: [103, 104, 105] });
      
      // Simular método calculateNextRun
      service.calculateNextRun = jest.fn()
        .mockReturnValueOnce(new Date('2025-02-01'))
        .mockReturnValueOnce(new Date('2025-02-02'));
      
      // Configurar mock para actualización
      mockPrisma.invoiceRule.update.mockResolvedValue({});
      
      // Ejecutar método
      const result = await service.processScheduledRules();
      
      // Verificar resultado
      expect(result).toEqual({
        rulesProcessed: 2,
        results: [
          {
            ruleId: 1,
            ruleName: 'Regla 1',
            success: true,
            invoicesGenerated: 2,
            nextRun: new Date('2025-02-01')
          },
          {
            ruleId: 2,
            ruleName: 'Regla 2',
            success: true,
            invoicesGenerated: 3,
            nextRun: new Date('2025-02-02')
          }
        ]
      });
      
      // Verificar que se procesaron ambas reglas
      expect(service.processRule).toHaveBeenCalledTimes(2);
      
      // Verificar que se actualizaron ambas reglas
      expect(mockPrisma.invoiceRule.update).toHaveBeenCalledTimes(2);
    });
    
    it('debe manejar errores en reglas individuales', async () => {
      // Configurar mock para obtener reglas programadas
      const mockRules = [
        { id: 1, name: 'Regla 1', isActive: true, nextRun: new Date('2025-01-01') },
        { id: 2, name: 'Regla 2', isActive: true, nextRun: new Date('2025-01-02') }
      ];
      
      mockPrisma.invoiceRule.findMany.mockResolvedValue(mockRules);
      
      // Simular método processRule con error en la segunda regla
      service.processRule = jest.fn()
        .mockResolvedValueOnce({ invoicesGenerated: 2, invoiceIds: [101, 102] })
        .mockRejectedValueOnce(new Error('Error al procesar regla 2'));
      
      // Simular método calculateNextRun
      service.calculateNextRun = jest.fn()
        .mockReturnValueOnce(new Date('2025-02-01'));
      
      // Configurar mock para actualización
      mockPrisma.invoiceRule.update.mockResolvedValue({});
      
      // Ejecutar método
      const result = await service.processScheduledRules();
      
      // Verificar resultado
      expect(result).toEqual({
        rulesProcessed: 2,
        results: [
          {
            ruleId: 1,
            ruleName: 'Regla 1',
            success: true,
            invoicesGenerated: 2,
            nextRun: new Date('2025-02-01')
          },
          {
            ruleId: 2,
            ruleName: 'Regla 2',
            success: false,
            error: 'Error al procesar regla 2'
          }
        ]
      });
      
      // Verificar que se intentó procesar ambas reglas
      expect(service.processRule).toHaveBeenCalledTimes(2);
      
      // Verificar que solo se actualizó la primera regla
      expect(mockPrisma.invoiceRule.update).toHaveBeenCalledTimes(1);
      
      // Verificar que se registró el error
      expect(ServerLogger.error).toHaveBeenCalledWith('Error al procesar regla 2:', expect.any(Error));
    });
    
    it('debe manejar errores generales correctamente', async () => {
      // Configurar mock para lanzar error
      const mockError = new Error('Error de base de datos');
      mockPrisma.invoiceRule.findMany.mockRejectedValue(mockError);
      
      // Ejecutar método y verificar que lanza error
      await expect(service.processScheduledRules()).rejects.toThrow();
      
      // Verificar que se registró el error
      expect(ServerLogger.error).toHaveBeenCalledWith('Error al procesar reglas programadas:', mockError);
    });
  });
});
