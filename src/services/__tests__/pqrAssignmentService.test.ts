/**
 * Pruebas unitarias para el servicio de asignación de PQR
 */

import { PQRAssignmentService } from '../pqrAssignmentService';
import { PrismaClient, PQRCategory, PQRPriority } from '@prisma/client';

// Mock de PrismaClient
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    $queryRaw: jest.fn(),
    pQR: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn()
    },
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn()
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
    }
  };
});

describe('PQRAssignmentService', () => {
  let service: PQRAssignmentService;
  let prisma: any;
  
  beforeEach(() => {
    // Limpiar todos los mocks
    jest.clearAllMocks();
    
    // Crear instancia del servicio con schema de prueba
    service = new PQRAssignmentService('test_schema');
    
    // Obtener la instancia de prisma para configurar mocks
    prisma = (service as any).prisma;
  });
  
  describe('processPQR', () => {
    it('debe procesar un PQR completo con categoría y prioridad ya definidas', async () => {
      // Datos de entrada
      const pqrData = {
        type: 'COMPLAINT',
        title: 'Problema con la iluminación',
        description: 'Las luces del pasillo no funcionan',
        category: PQRCategory.MAINTENANCE,
        priority: PQRPriority.HIGH,
        userId: 1,
        userName: 'Juan Pérez',
        userRole: 'RESIDENT',
        unitId: 101,
        unitNumber: '101',
        complexId: 1
      };
      
      // Configurar mocks para simular que no hay reglas de asignación
      prisma.$queryRaw.mockResolvedValueOnce([{ autoAssignEnabled: true }]); // Settings
      prisma.$queryRaw.mockResolvedValueOnce([]); // No hay reglas específicas
      prisma.$queryRaw.mockResolvedValueOnce([]); // No hay equipos específicos
      
      // Mock para administradores
      prisma.$queryRaw.mockResolvedValueOnce([]);
      
      // Ejecutar el método
      const result = await service.processPQR(pqrData);
      
      // Verificar resultado
      expect(result).toEqual({
        category: PQRCategory.MAINTENANCE,
        priority: PQRPriority.HIGH,
        tags: expect.any(Array)
      });
      
      // Verificar que se respetaron la categoría y prioridad
      expect(result.category).toBe(PQRCategory.MAINTENANCE);
      expect(result.priority).toBe(PQRPriority.HIGH);
    });
    
    it('debe categorizar automáticamente un PQR basado en palabras clave', async () => {
      // Datos de entrada sin categoría ni prioridad
      const pqrData = {
        type: 'COMPLAINT',
        title: 'Problema con la iluminación',
        description: 'Las luces del pasillo no funcionan correctamente',
        userId: 1,
        userName: 'Juan Pérez',
        userRole: 'RESIDENT',
        unitId: 101,
        unitNumber: '101',
        complexId: 1
      };
      
      // Configurar mocks
      prisma.$queryRaw.mockResolvedValueOnce([{ autoCategorizeEnabled: true }]); // Settings
      prisma.$queryRaw.mockResolvedValueOnce([]); // No hay reglas específicas
      prisma.$queryRaw.mockResolvedValueOnce([{ autoAssignEnabled: true }]); // Settings para asignación
      prisma.$queryRaw.mockResolvedValueOnce([]); // No hay reglas específicas para asignación
      prisma.$queryRaw.mockResolvedValueOnce([]); // No hay equipos específicos
      
      // Mock para administradores
      prisma.$queryRaw.mockResolvedValueOnce([{
        id: 5,
        name: 'Admin Test',
        role: 'COMPLEX_ADMIN'
      }]);
      
      // Ejecutar el método
      const result = await service.processPQR(pqrData);
      
      // Verificar resultado
      expect(result.category).toBe(PQRCategory.MAINTENANCE); // Debería detectar "luces" como mantenimiento
      expect(result.subcategory).toBe('Eléctrico'); // Debería detectar subcategoría
      expect(result.priority).toBe(PQRPriority.MEDIUM); // Prioridad por defecto para mantenimiento
      expect(result.assignedToId).toBe(5); // Asignado al admin
      expect(result.assignedToName).toBe('Admin Test');
      expect(result.assignedToRole).toBe('COMPLEX_ADMIN');
      expect(result.tags).toContain('eléctrico');
    });
    
    it('debe asignar prioridad URGENT cuando se detectan palabras clave de urgencia', async () => {
      // Datos de entrada con palabras de urgencia
      const pqrData = {
        type: 'COMPLAINT',
        title: 'URGENTE: Fuga de agua',
        description: 'Hay una emergencia con una fuga de agua en el baño',
        userId: 1,
        userName: 'Juan Pérez',
        userRole: 'RESIDENT',
        unitId: 101,
        unitNumber: '101',
        complexId: 1
      };
      
      // Configurar mocks
      prisma.$queryRaw.mockResolvedValueOnce([{ autoCategorizeEnabled: true }]); // Settings
      prisma.$queryRaw.mockResolvedValueOnce([]); // No hay reglas específicas
      prisma.$queryRaw.mockResolvedValueOnce([{ autoAssignEnabled: true }]); // Settings para asignación
      prisma.$queryRaw.mockResolvedValueOnce([]); // No hay reglas específicas para asignación
      prisma.$queryRaw.mockResolvedValueOnce([]); // No hay equipos específicos
      
      // Mock para administradores
      prisma.$queryRaw.mockResolvedValueOnce([{
        id: 5,
        name: 'Admin Test',
        role: 'COMPLEX_ADMIN'
      }]);
      
      // Ejecutar el método
      const result = await service.processPQR(pqrData);
      
      // Verificar resultado
      expect(result.category).toBe(PQRCategory.MAINTENANCE); // Debería detectar "fuga" como mantenimiento
      expect(result.subcategory).toBe('Plomería'); // Debería detectar subcategoría
      expect(result.priority).toBe(PQRPriority.URGENT); // Debería ser urgente por las palabras clave
      expect(result.tags).toContain('urgente');
      expect(result.tags).toContain('plomería');
    });
    
    it('debe asignar a un equipo específico cuando hay coincidencia de categoría', async () => {
      // Datos de entrada
      const pqrData = {
        type: 'COMPLAINT',
        title: 'Problema de seguridad',
        description: 'Hay una cámara de seguridad que no funciona',
        userId: 1,
        userName: 'Juan Pérez',
        userRole: 'RESIDENT',
        unitId: 101,
        unitNumber: '101',
        complexId: 1
      };
      
      // Configurar mocks
      prisma.$queryRaw.mockResolvedValueOnce([{ autoCategorizeEnabled: true }]); // Settings
      prisma.$queryRaw.mockResolvedValueOnce([]); // No hay reglas específicas
      prisma.$queryRaw.mockResolvedValueOnce([{ autoAssignEnabled: true }]); // Settings para asignación
      prisma.$queryRaw.mockResolvedValueOnce([]); // No hay reglas específicas para asignación
      
      // Mock para equipos
      prisma.$queryRaw.mockResolvedValueOnce([{
        id: 3,
        name: 'Equipo de Seguridad'
      }]);
      
      // Ejecutar el método
      const result = await service.processPQR(pqrData);
      
      // Verificar resultado
      expect(result.category).toBe(PQRCategory.SECURITY); // Debería detectar "seguridad" y "cámara"
      expect(result.subcategory).toBe('Videovigilancia'); // Debería detectar subcategoría
      expect(result.priority).toBe(PQRPriority.HIGH); // Prioridad por defecto para seguridad
      expect(result.assignedTeamId).toBe(3); // Asignado al equipo de seguridad
      expect(result.tags).toContain('cámaras');
    });
    
    it('debe manejar errores y devolver valores por defecto', async () => {
      // Datos de entrada
      const pqrData = {
        type: 'COMPLAINT',
        title: 'Problema general',
        description: 'Descripción del problema',
        userId: 1,
        userName: 'Juan Pérez',
        userRole: 'RESIDENT',
        unitId: 101,
        unitNumber: '101',
        complexId: 1
      };
      
      // Forzar error en la consulta
      prisma.$queryRaw.mockRejectedValueOnce(new Error('Error de base de datos'));
      
      // Ejecutar el método
      const result = await service.processPQR(pqrData);
      
      // Verificar resultado
      expect(result).toEqual({
        category: PQRCategory.OTHER,
        priority: PQRPriority.MEDIUM
      });
    });
  });
  
  describe('calculateDueDate', () => {
    it('debe calcular fecha límite según SLA específico', async () => {
      // Mock para SLA
      prisma.$queryRaw.mockResolvedValueOnce([{
        resolutionTime: 240, // 4 horas
        businessHoursOnly: false
      }]);
      
      // Fecha actual para comparación
      const now = new Date();
      
      // Ejecutar el método (es privado, así que usamos any)
      const result = await (service as any).calculateDueDate(PQRCategory.MAINTENANCE, PQRPriority.HIGH);
      
      // Verificar resultado
      expect(result).toBeInstanceOf(Date);
      
      // Debería ser aproximadamente 4 horas después (con margen de 1 minuto para la ejecución del test)
      const expectedTime = new Date(now.getTime() + 240 * 60000);
      const diffInMinutes = Math.abs((result.getTime() - expectedTime.getTime()) / 60000);
      expect(diffInMinutes).toBeLessThan(1);
    });
    
    it('debe usar valores predeterminados cuando no hay SLA específico', async () => {
      // Mock para SLA (vacío)
      prisma.$queryRaw.mockResolvedValueOnce([]);
      
      // Fecha actual para comparación
      const now = new Date();
      
      // Ejecutar el método para prioridad URGENT
      const result = await (service as any).calculateDueDate(PQRCategory.SECURITY, PQRPriority.URGENT);
      
      // Verificar resultado
      expect(result).toBeInstanceOf(Date);
      
      // Para URGENT debería ser 4 horas después
      const expectedTime = new Date(now.getTime() + 4 * 60 * 60000);
      const diffInMinutes = Math.abs((result.getTime() - expectedTime.getTime()) / 60000);
      expect(diffInMinutes).toBeLessThan(1);
    });
  });
});
