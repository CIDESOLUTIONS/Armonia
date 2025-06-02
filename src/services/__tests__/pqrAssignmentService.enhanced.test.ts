/**
 * Pruebas unitarias avanzadas para el servicio de asignación de PQR
 * 
 * Estas pruebas amplían la cobertura del servicio de asignación con casos
 * más complejos, escenarios límite y manejo de errores específicos.
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
    },
    pQRAssignmentRule: {
      findMany: jest.fn()
    },
    pQRTeam: {
      findMany: jest.fn(),
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
    }
  };
});

describe('PQRAssignmentService - Pruebas Avanzadas', () => {
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
  
  describe('processPQR - Escenarios Complejos', () => {
    it('debe manejar reglas de asignación complejas con múltiples condiciones', async () => {
      // Datos de entrada
      const pqrData = {
        type: 'COMPLAINT',
        title: 'Problema con ascensor',
        description: 'El ascensor del bloque 3 está fallando intermitentemente',
        userId: 1,
        userName: 'Juan Pérez',
        userRole: 'RESIDENT',
        unitId: 301,
        unitNumber: '301',
        complexId: 1,
        blockId: 3,
        blockName: 'Bloque 3'
      };
      
      // Configurar mocks para reglas complejas
      prisma.$queryRaw.mockResolvedValueOnce([{ autoCategorizeEnabled: true, autoAssignEnabled: true }]); // Settings
      
      // Reglas específicas para el bloque 3
      prisma.$queryRaw.mockResolvedValueOnce([{
        id: 5,
        name: 'Regla Bloque 3',
        conditions: JSON.stringify({
          blockId: 3,
          keywords: ['ascensor', 'elevador']
        }),
        category: 'MAINTENANCE',
        subcategory: 'Ascensores',
        priority: 'HIGH',
        assignToType: 'TEAM',
        assignToId: 7,
        assignToName: 'Equipo Ascensores'
      }]);
      
      // Mock para equipo específico
      prisma.$queryRaw.mockResolvedValueOnce([{
        id: 7,
        name: 'Equipo Ascensores',
        members: JSON.stringify([
          { id: 15, name: 'Técnico Ascensores 1', role: 'STAFF' },
          { id: 16, name: 'Técnico Ascensores 2', role: 'STAFF' }
        ])
      }]);
      
      // Ejecutar el método
      const result = await service.processPQR(pqrData);
      
      // Verificar resultado
      expect(result.category).toBe(PQRCategory.MAINTENANCE);
      expect(result.subcategory).toBe('Ascensores');
      expect(result.priority).toBe(PQRPriority.HIGH);
      expect(result.assignedTeamId).toBe(7);
      expect(result.assignedTeamName).toBe('Equipo Ascensores');
      expect(result.tags).toContain('ascensor');
      expect(result.tags).toContain('bloque 3');
    });
    
    it('debe manejar conflictos de asignación y seleccionar la regla más específica', async () => {
      // Datos de entrada
      const pqrData = {
        type: 'COMPLAINT',
        title: 'Problema con iluminación en zona común',
        description: 'Las luces de la piscina no funcionan correctamente',
        userId: 1,
        userName: 'Juan Pérez',
        userRole: 'RESIDENT',
        unitId: 101,
        unitNumber: '101',
        complexId: 1,
        amenityId: 2,
        amenityName: 'Piscina'
      };
      
      // Configurar mocks
      prisma.$queryRaw.mockResolvedValueOnce([{ autoCategorizeEnabled: true, autoAssignEnabled: true }]); // Settings
      
      // Múltiples reglas que podrían aplicar (conflicto)
      prisma.$queryRaw.mockResolvedValueOnce([
        {
          id: 1,
          name: 'Regla General Iluminación',
          conditions: JSON.stringify({
            keywords: ['luz', 'luces', 'iluminación']
          }),
          category: 'MAINTENANCE',
          subcategory: 'Eléctrico',
          priority: 'MEDIUM',
          assignToType: 'USER',
          assignToId: 10,
          assignToName: 'Técnico Eléctrico General'
        },
        {
          id: 2,
          name: 'Regla Específica Piscina',
          conditions: JSON.stringify({
            amenityId: 2,
            keywords: ['piscina']
          }),
          category: 'MAINTENANCE',
          subcategory: 'Zonas Comunes',
          priority: 'HIGH',
          assignToType: 'TEAM',
          assignToId: 5,
          assignToName: 'Equipo Zonas Comunes'
        }
      ]);
      
      // Mock para equipo específico
      prisma.$queryRaw.mockResolvedValueOnce([{
        id: 5,
        name: 'Equipo Zonas Comunes',
        members: JSON.stringify([
          { id: 20, name: 'Técnico Zonas Comunes 1', role: 'STAFF' },
          { id: 21, name: 'Técnico Zonas Comunes 2', role: 'STAFF' }
        ])
      }]);
      
      // Ejecutar el método
      const result = await service.processPQR(pqrData);
      
      // Verificar resultado - debe elegir la regla más específica (piscina)
      expect(result.category).toBe(PQRCategory.MAINTENANCE);
      expect(result.subcategory).toBe('Zonas Comunes');
      expect(result.priority).toBe(PQRPriority.HIGH);
      expect(result.assignedTeamId).toBe(5);
      expect(result.assignedTeamName).toBe('Equipo Zonas Comunes');
      expect(result.tags).toContain('piscina');
      expect(result.tags).toContain('iluminación');
    });
    
    it('debe manejar la reasignación automática cuando un PQR es reabierto', async () => {
      // Datos de entrada para un PQR reabierto
      const pqrData = {
        id: 123,
        type: 'COMPLAINT',
        title: 'Problema con cerradura',
        description: 'La cerradura de la puerta principal sigue fallando después de la reparación',
        userId: 1,
        userName: 'Juan Pérez',
        userRole: 'RESIDENT',
        unitId: 101,
        unitNumber: '101',
        complexId: 1,
        status: 'REOPENED',
        previousAssignedToId: 10,
        category: PQRCategory.MAINTENANCE,
        subcategory: 'Cerrajería',
        priority: PQRPriority.MEDIUM
      };
      
      // Configurar mocks
      prisma.$queryRaw.mockResolvedValueOnce([{ autoReassignEnabled: true }]); // Settings
      
      // Mock para PQR existente
      prisma.pQR.findUnique.mockResolvedValueOnce({
        id: 123,
        status: 'REOPENED',
        category: PQRCategory.MAINTENANCE,
        subcategory: 'Cerrajería',
        assignedToId: 10,
        assignedToName: 'Técnico Cerrajería',
        reopenCount: 1
      });
      
      // Mock para especialistas disponibles
      prisma.user.findMany.mockResolvedValueOnce([
        {
          id: 15,
          name: 'Especialista Cerrajería',
          role: 'SPECIALIST',
          specialties: JSON.stringify(['Cerrajería', 'Seguridad'])
        }
      ]);
      
      // Ejecutar el método
      const result = await service.processPQR(pqrData);
      
      // Verificar resultado - debe reasignar a un especialista
      expect(result.category).toBe(PQRCategory.MAINTENANCE);
      expect(result.subcategory).toBe('Cerrajería');
      expect(result.priority).toBe(PQRPriority.HIGH); // Debería aumentar la prioridad
      expect(result.assignedToId).toBe(15);
      expect(result.assignedToName).toBe('Especialista Cerrajería');
      expect(result.assignedToRole).toBe('SPECIALIST');
      expect(result.escalated).toBe(true);
    });
  });
  
  describe('balanceWorkload', () => {
    it('debe distribuir la carga de trabajo equitativamente entre los miembros del equipo', async () => {
      // Mock para equipo
      prisma.pQRTeam.findUnique.mockResolvedValueOnce({
        id: 5,
        name: 'Equipo Mantenimiento',
        members: JSON.stringify([
          { id: 10, name: 'Técnico 1', role: 'STAFF' },
          { id: 11, name: 'Técnico 2', role: 'STAFF' },
          { id: 12, name: 'Técnico 3', role: 'STAFF' }
        ])
      });
      
      // Mock para carga de trabajo actual
      prisma.pQR.count.mockImplementation((params) => {
        const userId = params.where.assignedToId;
        // Técnico 1: 5 PQRs, Técnico 2: 2 PQRs, Técnico 3: 1 PQR
        if (userId === 10) return Promise.resolve(5);
        if (userId === 11) return Promise.resolve(2);
        if (userId === 12) return Promise.resolve(1);
        return Promise.resolve(0);
      });
      
      // Ejecutar el método (es privado, así que usamos any)
      const result = await (service as any).balanceWorkload(5);
      
      // Verificar resultado - debe elegir al técnico con menos carga
      expect(result).toEqual({
        assignedToId: 12,
        assignedToName: 'Técnico 3',
        assignedToRole: 'STAFF'
      });
    });
    
    it('debe considerar la prioridad y complejidad al balancear la carga', async () => {
      // Mock para equipo
      prisma.pQRTeam.findUnique.mockResolvedValueOnce({
        id: 5,
        name: 'Equipo Mantenimiento',
        members: JSON.stringify([
          { id: 10, name: 'Técnico 1', role: 'STAFF', weightedCapacity: 10 },
          { id: 11, name: 'Técnico 2', role: 'STAFF', weightedCapacity: 8 },
          { id: 12, name: 'Técnico 3', role: 'STAFF', weightedCapacity: 5 }
        ])
      });
      
      // Mock para carga de trabajo ponderada actual
      prisma.$queryRaw.mockImplementation((query, params) => {
        const userId = params[0];
        // Técnico 1: 6 puntos, Técnico 2: 5 puntos, Técnico 3: 3 puntos
        if (userId === 10) return Promise.resolve([{ weighted_load: 6 }]);
        if (userId === 11) return Promise.resolve([{ weighted_load: 5 }]);
        if (userId === 12) return Promise.resolve([{ weighted_load: 3 }]);
        return Promise.resolve([{ weighted_load: 0 }]);
      });
      
      // Ejecutar el método con parámetros de complejidad
      const result = await (service as any).balanceWorkload(5, PQRPriority.HIGH, 'Complejo');
      
      // Verificar resultado - debe considerar capacidad ponderada y complejidad
      expect(result).toEqual({
        assignedToId: 10,
        assignedToName: 'Técnico 1',
        assignedToRole: 'STAFF'
      });
    });
  });
  
  describe('findSpecialist', () => {
    it('debe encontrar el especialista más adecuado según la categoría y subcategoría', async () => {
      // Mock para especialistas
      prisma.user.findMany.mockResolvedValueOnce([
        {
          id: 20,
          name: 'Especialista Plomería',
          role: 'SPECIALIST',
          specialties: JSON.stringify(['Plomería', 'Fontanería']),
          experienceYears: 5
        },
        {
          id: 21,
          name: 'Especialista Plomería Senior',
          role: 'SPECIALIST',
          specialties: JSON.stringify(['Plomería', 'Fontanería', 'Sistemas de agua']),
          experienceYears: 10
        }
      ]);
      
      // Ejecutar el método (es privado, así que usamos any)
      const result = await (service as any).findSpecialist(
        PQRCategory.MAINTENANCE,
        'Plomería',
        PQRPriority.HIGH
      );
      
      // Verificar resultado - debe elegir al especialista con más experiencia
      expect(result).toEqual({
        assignedToId: 21,
        assignedToName: 'Especialista Plomería Senior',
        assignedToRole: 'SPECIALIST'
      });
    });
    
    it('debe manejar el caso cuando no hay especialistas disponibles', async () => {
      // Mock para especialistas (vacío)
      prisma.user.findMany.mockResolvedValueOnce([]);
      
      // Mock para administradores (fallback)
      prisma.user.findMany.mockResolvedValueOnce([
        {
          id: 5,
          name: 'Admin Test',
          role: 'COMPLEX_ADMIN'
        }
      ]);
      
      // Ejecutar el método
      const result = await (service as any).findSpecialist(
        PQRCategory.SECURITY,
        'Alarmas',
        PQRPriority.URGENT
      );
      
      // Verificar resultado - debe usar administrador como fallback
      expect(result).toEqual({
        assignedToId: 5,
        assignedToName: 'Admin Test',
        assignedToRole: 'COMPLEX_ADMIN',
        escalated: true
      });
    });
  });
  
  describe('calculateDueDate - Casos Avanzados', () => {
    it('debe respetar horarios laborales para categorías específicas', async () => {
      // Mock para SLA con restricción de horario laboral
      prisma.$queryRaw.mockResolvedValueOnce([{
        resolutionTime: 480, // 8 horas
        businessHoursOnly: true,
        businessHoursStart: '08:00',
        businessHoursEnd: '18:00',
        businessDays: 'MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY'
      }]);
      
      // Fecha actual para prueba (viernes 5pm)
      const testDate = new Date('2025-06-06T17:00:00');
      jest.spyOn(global, 'Date').mockImplementation(() => testDate as any);
      
      // Ejecutar el método
      const result = await (service as any).calculateDueDate(PQRCategory.ADMINISTRATIVE, PQRPriority.MEDIUM);
      
      // Verificar resultado
      expect(result).toBeInstanceOf(Date);
      
      // Debería ser el lunes siguiente a las 3pm (8 horas laborales después)
      const expectedDate = new Date('2025-06-09T15:00:00');
      expect(result.getDate()).toBe(expectedDate.getDate());
      expect(result.getHours()).toBe(expectedDate.getHours());
      
      // Restaurar Date
      jest.spyOn(global, 'Date').mockRestore();
    });
    
    it('debe considerar días festivos en el cálculo de fechas límite', async () => {
      // Mock para SLA con días festivos
      prisma.$queryRaw.mockResolvedValueOnce([{
        resolutionTime: 240, // 4 horas
        businessHoursOnly: true,
        holidays: JSON.stringify(['2025-06-03']) // Día festivo
      }]);
      
      // Fecha actual para prueba (lunes 4pm, día antes del festivo)
      const testDate = new Date('2025-06-02T16:00:00');
      jest.spyOn(global, 'Date').mockImplementation(() => testDate as any);
      
      // Ejecutar el método
      const result = await (service as any).calculateDueDate(PQRCategory.ADMINISTRATIVE, PQRPriority.MEDIUM);
      
      // Verificar resultado
      expect(result).toBeInstanceOf(Date);
      
      // Debería saltar el día festivo
      const expectedDate = new Date('2025-06-04T12:00:00');
      expect(result.getDate()).toBe(expectedDate.getDate());
      
      // Restaurar Date
      jest.spyOn(global, 'Date').mockRestore();
    });
  });
  
  describe('Manejo de Errores Avanzado', () => {
    it('debe manejar errores de base de datos durante la asignación', async () => {
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
      
      // Configurar mocks para simular error en consulta de configuración
      prisma.$queryRaw.mockRejectedValueOnce(new Error('Error de conexión a base de datos'));
      
      // Configurar mock para log de errores
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // Ejecutar el método
      const result = await service.processPQR(pqrData);
      
      // Verificar resultado - debe usar valores por defecto
      expect(result).toEqual({
        category: PQRCategory.OTHER,
        priority: PQRPriority.MEDIUM
      });
      
      // Verificar que se registró el error
      expect(consoleSpy).toHaveBeenCalled();
      
      // Restaurar console.error
      consoleSpy.mockRestore();
    });
    
    it('debe manejar errores durante la búsqueda de especialistas', async () => {
      // Configurar mocks para simular error en búsqueda de especialistas
      prisma.user.findMany.mockRejectedValueOnce(new Error('Error al buscar especialistas'));
      
      // Configurar mock para administradores (fallback)
      prisma.user.findMany.mockResolvedValueOnce([
        {
          id: 5,
          name: 'Admin Test',
          role: 'COMPLEX_ADMIN'
        }
      ]);
      
      // Configurar mock para log de errores
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // Ejecutar el método
      const result = await (service as any).findSpecialist(
        PQRCategory.MAINTENANCE,
        'Plomería',
        PQRPriority.HIGH
      );
      
      // Verificar resultado - debe usar administrador como fallback
      expect(result).toEqual({
        assignedToId: 5,
        assignedToName: 'Admin Test',
        assignedToRole: 'COMPLEX_ADMIN',
        escalated: true
      });
      
      // Verificar que se registró el error
      expect(consoleSpy).toHaveBeenCalled();
      
      // Restaurar console.error
      consoleSpy.mockRestore();
    });
  });
});
