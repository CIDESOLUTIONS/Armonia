import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import InvoiceTemplateService from '../../lib/services/invoice-template-service';
import { getPrisma } from '@/lib/prisma';
import { ActivityLogger } from '../../lib/logging/activity-logger';
import { ServerLogger } from '../../lib/logging/server-logger';

// Mock de PrismaClient
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    invoiceTemplate: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
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

describe('InvoiceTemplateService', () => {
  let service;
  let mockPrisma;
  
  beforeEach(() => {
    // Limpiar todos los mocks antes de cada prueba
    jest.clearAllMocks();
    
    // Crear instancia del servicio
    service = new InvoiceTemplateService('test_schema');
    
    // Obtener la instancia mock de PrismaClient
    mockPrisma = getPrisma();
  });
  
  describe('getTemplates', () => {
    it('debe devolver todas las plantillas activas cuando includeInactive es false', async () => {
      // Configurar mock
      const mockTemplates = [
        { id: 1, name: 'Plantilla 1', isActive: true },
        { id: 2, name: 'Plantilla 2', isActive: true }
      ];
      
      mockPrisma.invoiceTemplate.findMany.mockResolvedValue(mockTemplates);
      
      // Ejecutar método
      const result = await service.getTemplates();
      
      // Verificar resultado
      expect(result).toEqual(mockTemplates);
      expect(mockPrisma.invoiceTemplate.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: [{ name: 'asc' }],
        include: expect.any(Object)
      });
    });
    
    it('debe devolver todas las plantillas cuando includeInactive es true', async () => {
      // Configurar mock
      const mockTemplates = [
        { id: 1, name: 'Plantilla 1', isActive: true },
        { id: 2, name: 'Plantilla 2', isActive: false }
      ];
      
      mockPrisma.invoiceTemplate.findMany.mockResolvedValue(mockTemplates);
      
      // Ejecutar método
      const result = await service.getTemplates(true);
      
      // Verificar resultado
      expect(result).toEqual(mockTemplates);
      expect(mockPrisma.invoiceTemplate.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: [{ name: 'asc' }],
        include: expect.any(Object)
      });
    });
    
    it('debe manejar errores correctamente', async () => {
      // Configurar mock para lanzar error
      const mockError = new Error('Error de base de datos');
      mockPrisma.invoiceTemplate.findMany.mockRejectedValue(mockError);
      
      // Ejecutar método y verificar que lanza error
      await expect(service.getTemplates()).rejects.toThrow('Error al obtener plantillas');
      
      // Verificar que se registró el error
      expect(ServerLogger.error).toHaveBeenCalledWith('Error al obtener plantillas:', mockError);
    });
  });
  
  describe('getTemplateById', () => {
    it('debe devolver una plantilla por ID', async () => {
      // Configurar mock
      const mockTemplate = { id: 1, name: 'Plantilla 1', isActive: true };
      mockPrisma.invoiceTemplate.findUnique.mockResolvedValue(mockTemplate);
      
      // Ejecutar método
      const result = await service.getTemplateById(1);
      
      // Verificar resultado
      expect(result).toEqual(mockTemplate);
      expect(mockPrisma.invoiceTemplate.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: expect.any(Object)
      });
    });
    
    it('debe lanzar error si la plantilla no existe', async () => {
      // Configurar mock para devolver null
      mockPrisma.invoiceTemplate.findUnique.mockResolvedValue(null);
      
      // Ejecutar método y verificar que lanza error
      await expect(service.getTemplateById(999)).rejects.toThrow('Plantilla con ID 999 no encontrada');
    });
    
    it('debe manejar errores correctamente', async () => {
      // Configurar mock para lanzar error
      const mockError = new Error('Error de base de datos');
      mockPrisma.invoiceTemplate.findUnique.mockRejectedValue(mockError);
      
      // Ejecutar método y verificar que lanza error
      await expect(service.getTemplateById(1)).rejects.toThrow();
      
      // Verificar que se registró el error
      expect(ServerLogger.error).toHaveBeenCalledWith('Error al obtener plantilla con ID 1:', mockError);
    });
  });
  
  describe('createTemplate', () => {
    it('debe crear una nueva plantilla', async () => {
      // Datos de prueba
      const templateData = {
        name: 'Nueva Plantilla',
        description: 'Descripción de prueba',
        isActive: true,
        headerHtml: '<header>Test</header>',
        bodyHtml: '<body>Test</body>',
        footerHtml: '<footer>Test</footer>',
        cssStyles: 'body { color: black; }'
      };
      
      const userId = 1;
      
      // Configurar mock
      const createdTemplate = { id: 1, ...templateData };
      mockPrisma.invoiceTemplate.create.mockResolvedValue(createdTemplate);
      
      // Ejecutar método
      const result = await service.createTemplate(templateData, userId);
      
      // Verificar resultado
      expect(result).toEqual(createdTemplate);
      expect(mockPrisma.invoiceTemplate.create).toHaveBeenCalledWith({
        data: templateData
      });
      
      // Verificar que se registró la actividad
      expect(service.activityLogger.logActivity).toHaveBeenCalledWith({
        userId,
        action: 'CREATE_INVOICE_TEMPLATE',
        resourceType: 'INVOICE_TEMPLATE',
        resourceId: 1,
        details: expect.any(Object)
      });
    });
    
    it('debe validar los datos de la plantilla', async () => {
      // Datos incompletos
      const templateData = {
        // Sin nombre, que es obligatorio
        description: 'Descripción de prueba',
        isActive: true
      };
      
      // Ejecutar método y verificar que lanza error
      await expect(service.createTemplate(templateData, 1)).rejects.toThrow('El nombre de la plantilla es obligatorio');
    });
    
    it('debe manejar errores correctamente', async () => {
      // Datos de prueba
      const templateData = {
        name: 'Nueva Plantilla',
        description: 'Descripción de prueba',
        isActive: true,
        headerHtml: '<header>Test</header>',
        bodyHtml: '<body>Test</body>',
        footerHtml: '<footer>Test</footer>',
        cssStyles: 'body { color: black; }'
      };
      
      // Configurar mock para lanzar error
      const mockError = new Error('Error de base de datos');
      mockPrisma.invoiceTemplate.create.mockRejectedValue(mockError);
      
      // Ejecutar método y verificar que lanza error
      await expect(service.createTemplate(templateData, 1)).rejects.toThrow();
      
      // Verificar que se registró el error
      expect(ServerLogger.error).toHaveBeenCalledWith('Error al crear plantilla:', mockError);
    });
  });
  
  describe('updateTemplate', () => {
    it('debe actualizar una plantilla existente', async () => {
      // Datos de prueba
      const templateId = 1;
      const templateData = {
        name: 'Plantilla Actualizada',
        description: 'Descripción actualizada',
        isActive: true,
        headerHtml: '<header>Updated</header>',
        bodyHtml: '<body>Updated</body>',
        footerHtml: '<footer>Updated</footer>',
        cssStyles: 'body { color: blue; }'
      };
      
      const userId = 1;
      
      // Configurar mock para verificar existencia
      mockPrisma.invoiceTemplate.findUnique.mockResolvedValue({ id: templateId, name: 'Plantilla Original' });
      
      // Configurar mock para actualización
      const updatedTemplate = { id: templateId, ...templateData };
      mockPrisma.invoiceTemplate.update.mockResolvedValue(updatedTemplate);
      
      // Ejecutar método
      const result = await service.updateTemplate(templateId, templateData, userId);
      
      // Verificar resultado
      expect(result).toEqual(updatedTemplate);
      expect(mockPrisma.invoiceTemplate.update).toHaveBeenCalledWith({
        where: { id: templateId },
        data: templateData
      });
      
      // Verificar que se registró la actividad
      expect(service.activityLogger.logActivity).toHaveBeenCalledWith({
        userId,
        action: 'UPDATE_INVOICE_TEMPLATE',
        resourceType: 'INVOICE_TEMPLATE',
        resourceId: templateId,
        details: expect.any(Object)
      });
    });
    
    it('debe lanzar error si la plantilla no existe', async () => {
      // Configurar mock para devolver null
      mockPrisma.invoiceTemplate.findUnique.mockResolvedValue(null);
      
      // Ejecutar método y verificar que lanza error
      await expect(service.updateTemplate(999, {}, 1)).rejects.toThrow('Plantilla con ID 999 no encontrada');
    });
    
    it('debe validar los datos de la plantilla', async () => {
      // Configurar mock para verificar existencia
      mockPrisma.invoiceTemplate.findUnique.mockResolvedValue({ id: 1, name: 'Plantilla Original' });
      
      // Datos incompletos
      const templateData = {
        name: '' // Nombre vacío, que no es válido
      };
      
      // Ejecutar método y verificar que lanza error
      await expect(service.updateTemplate(1, templateData, 1)).rejects.toThrow('El nombre de la plantilla es obligatorio');
    });
    
    it('debe manejar errores correctamente', async () => {
      // Configurar mock para verificar existencia
      mockPrisma.invoiceTemplate.findUnique.mockResolvedValue({ id: 1, name: 'Plantilla Original' });
      
      // Datos de prueba
      const templateData = {
        name: 'Plantilla Actualizada'
      };
      
      // Configurar mock para lanzar error
      const mockError = new Error('Error de base de datos');
      mockPrisma.invoiceTemplate.update.mockRejectedValue(mockError);
      
      // Ejecutar método y verificar que lanza error
      await expect(service.updateTemplate(1, templateData, 1)).rejects.toThrow();
      
      // Verificar que se registró el error
      expect(ServerLogger.error).toHaveBeenCalledWith('Error al actualizar plantilla con ID 1:', mockError);
    });
  });
  
  describe('deleteTemplate', () => {
    it('debe eliminar una plantilla existente', async () => {
      // Datos de prueba
      const templateId = 1;
      const userId = 1;
      
      // Configurar mock para verificar existencia
      mockPrisma.invoiceTemplate.findUnique.mockResolvedValue({ id: templateId, name: 'Plantilla a Eliminar' });
      
      // Configurar mock para eliminación
      mockPrisma.invoiceTemplate.delete.mockResolvedValue({ id: templateId });
      
      // Ejecutar método
      const result = await service.deleteTemplate(templateId, userId);
      
      // Verificar resultado
      expect(result).toEqual({ success: true, message: 'Plantilla eliminada correctamente' });
      expect(mockPrisma.invoiceTemplate.delete).toHaveBeenCalledWith({
        where: { id: templateId }
      });
      
      // Verificar que se registró la actividad
      expect(service.activityLogger.logActivity).toHaveBeenCalledWith({
        userId,
        action: 'DELETE_INVOICE_TEMPLATE',
        resourceType: 'INVOICE_TEMPLATE',
        resourceId: templateId,
        details: expect.any(Object)
      });
    });
    
    it('debe lanzar error si la plantilla no existe', async () => {
      // Configurar mock para devolver null
      mockPrisma.invoiceTemplate.findUnique.mockResolvedValue(null);
      
      // Ejecutar método y verificar que lanza error
      await expect(service.deleteTemplate(999, 1)).rejects.toThrow('Plantilla con ID 999 no encontrada');
    });
    
    it('debe manejar errores correctamente', async () => {
      // Configurar mock para verificar existencia
      mockPrisma.invoiceTemplate.findUnique.mockResolvedValue({ id: 1, name: 'Plantilla a Eliminar' });
      
      // Configurar mock para lanzar error
      const mockError = new Error('Error de base de datos');
      mockPrisma.invoiceTemplate.delete.mockRejectedValue(mockError);
      
      // Ejecutar método y verificar que lanza error
      await expect(service.deleteTemplate(1, 1)).rejects.toThrow();
      
      // Verificar que se registró el error
      expect(ServerLogger.error).toHaveBeenCalledWith('Error al eliminar plantilla con ID 1:', mockError);
    });
  });
  
  describe('setDefaultTemplate', () => {
    it('debe establecer una plantilla como predeterminada', async () => {
      // Datos de prueba
      const templateId = 1;
      const userId = 1;
      
      // Configurar mock para verificar existencia
      mockPrisma.invoiceTemplate.findUnique.mockResolvedValue({ id: templateId, name: 'Plantilla', isDefault: false });
      
      // Configurar mock para transacción
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        return await callback(mockPrisma);
      });
      
      // Configurar mock para actualización
      mockPrisma.invoiceTemplate.update.mockResolvedValueOnce({ id: templateId, name: 'Plantilla', isDefault: true });
      
      // Ejecutar método
      const result = await service.setDefaultTemplate(templateId, userId);
      
      // Verificar resultado
      expect(result).toEqual({ id: templateId, name: 'Plantilla', isDefault: true });
      
      // Verificar que se actualizaron todas las plantillas primero
      expect(mockPrisma.invoiceTemplate.update).toHaveBeenCalledWith({
        where: { isDefault: true },
        data: { isDefault: false }
      });
      
      // Verificar que se actualizó la plantilla específica
      expect(mockPrisma.invoiceTemplate.update).toHaveBeenCalledWith({
        where: { id: templateId },
        data: { isDefault: true }
      });
      
      // Verificar que se registró la actividad
      expect(service.activityLogger.logActivity).toHaveBeenCalledWith({
        userId,
        action: 'SET_DEFAULT_INVOICE_TEMPLATE',
        resourceType: 'INVOICE_TEMPLATE',
        resourceId: templateId,
        details: expect.any(Object)
      });
    });
    
    it('debe lanzar error si la plantilla no existe', async () => {
      // Configurar mock para devolver null
      mockPrisma.invoiceTemplate.findUnique.mockResolvedValue(null);
      
      // Ejecutar método y verificar que lanza error
      await expect(service.setDefaultTemplate(999, 1)).rejects.toThrow('Plantilla con ID 999 no encontrada');
    });
    
    it('debe manejar errores correctamente', async () => {
      // Configurar mock para verificar existencia
      mockPrisma.invoiceTemplate.findUnique.mockResolvedValue({ id: 1, name: 'Plantilla', isDefault: false });
      
      // Configurar mock para lanzar error
      const mockError = new Error('Error de base de datos');
      mockPrisma.$transaction.mockRejectedValue(mockError);
      
      // Ejecutar método y verificar que lanza error
      await expect(service.setDefaultTemplate(1, 1)).rejects.toThrow();
      
      // Verificar que se registró el error
      expect(ServerLogger.error).toHaveBeenCalledWith('Error al establecer plantilla 1 como predeterminada:', mockError);
    });
  });
  
  describe('renderInvoice', () => {
    it('debe renderizar una factura con la plantilla especificada', async () => {
      // Datos de prueba
      const invoiceId = 1;
      const templateId = 2;
      
      // Mock de datos de factura
      const mockInvoice = {
        id: invoiceId,
        invoiceNumber: 'INV-001',
        title: 'Factura de prueba',
        issueDate: new Date(),
        dueDate: new Date(),
        totalAmount: 100000,
        property: {
          number: 'A101',
          owner: {
            name: 'Juan Pérez',
            email: 'juan@example.com'
          }
        },
        items: [
          { description: 'Item 1', quantity: 1, unitPrice: 50000, subtotal: 50000 },
          { description: 'Item 2', quantity: 2, unitPrice: 25000, subtotal: 50000 }
        ]
      };
      
      // Mock de plantilla
      const mockTemplate = {
        id: templateId,
        name: 'Plantilla de Prueba',
        headerHtml: '<div>{{complex.name}}</div>',
        bodyHtml: '<div>Factura #{{invoice.invoiceNumber}}</div>',
        footerHtml: '<div>{{complex.address}}</div>',
        cssStyles: 'body { font-family: Arial; }'
      };
      
      // Mock de configuración del complejo
      const mockComplex = {
        name: 'Conjunto Residencial Prueba',
        address: 'Calle 123',
        phone: '123456789',
        email: 'info@ejemplo.com',
        logoUrl: 'https://ejemplo.com/logo.png'
      };
      
      // Configurar mocks
      mockPrisma.invoiceTemplate.findUnique.mockResolvedValue(mockTemplate);
      
      // Simular método getInvoiceById
      service.getInvoiceById = jest.fn().mockResolvedValue(mockInvoice);
      
      // Simular método getComplexSettings
      service.getComplexSettings = jest.fn().mockResolvedValue(mockComplex);
      
      // Ejecutar método
      const result = await service.renderInvoice(invoiceId, templateId);
      
      // Verificar resultado
      expect(result).toContain('<!DOCTYPE html>');
      expect(result).toContain('<style>');
      expect(result).toContain(mockTemplate.cssStyles);
      expect(result).toContain('>Conjunto Residencial Prueba<');
      expect(result).toContain('>Factura #INV-001<');
      expect(result).toContain('>Calle 123<');
      
      // Verificar que se obtuvieron los datos necesarios
      expect(service.getInvoiceById).toHaveBeenCalledWith(invoiceId);
      expect(service.getComplexSettings).toHaveBeenCalled();
      expect(mockPrisma.invoiceTemplate.findUnique).toHaveBeenCalledWith({
        where: { id: templateId }
      });
    });
    
    it('debe usar la plantilla predeterminada si no se especifica templateId', async () => {
      // Datos de prueba
      const invoiceId = 1;
      
      // Mock de datos de factura
      const mockInvoice = {
        id: invoiceId,
        invoiceNumber: 'INV-001',
        templateId: null // Sin plantilla asignada
      };
      
      // Mock de plantilla predeterminada
      const mockDefaultTemplate = {
        id: 3,
        name: 'Plantilla Predeterminada',
        headerHtml: '<div>Header</div>',
        bodyHtml: '<div>Body</div>',
        footerHtml: '<div>Footer</div>',
        cssStyles: 'body { color: black; }'
      };
      
      // Configurar mocks
      mockPrisma.invoiceTemplate.findFirst.mockResolvedValue(mockDefaultTemplate);
      
      // Simular método getInvoiceById
      service.getInvoiceById = jest.fn().mockResolvedValue(mockInvoice);
      
      // Simular método getComplexSettings
      service.getComplexSettings = jest.fn().mockResolvedValue({});
      
      // Simular método renderTemplate
      const originalRenderTemplate = service.renderTemplate;
      service.renderTemplate = jest.fn().mockReturnValue('HTML renderizado');
      
      // Ejecutar método
      await service.renderInvoice(invoiceId);
      
      // Verificar que se buscó la plantilla predeterminada
      expect(mockPrisma.invoiceTemplate.findFirst).toHaveBeenCalledWith({
        where: { isDefault: true, isActive: true }
      });
      
      // Restaurar método original
      service.renderTemplate = originalRenderTemplate;
    });
    
    it('debe manejar errores correctamente', async () => {
      // Configurar mock para lanzar error
      const mockError = new Error('Error al renderizar');
      service.getInvoiceById = jest.fn().mockRejectedValue(mockError);
      
      // Ejecutar método y verificar que lanza error
      await expect(service.renderInvoice(1, 2)).rejects.toThrow();
      
      // Verificar que se registró el error
      expect(ServerLogger.error).toHaveBeenCalledWith('Error al renderizar factura 1 con plantilla 2:', mockError);
    });
  });
});
