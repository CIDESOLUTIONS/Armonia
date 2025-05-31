// src/services/__tests__/reservationService.test.ts
import { ReservationService } from '../reservationService';
import { PrismaClient } from '@prisma/client';

// Mock de PrismaClient
jest.mock('@prisma/client', () => {
  const mockQueryRawUnsafe = jest.fn();
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      $queryRawUnsafe: mockQueryRawUnsafe
    }))
  };
});

// Mock de ServerLogger
jest.mock('@/lib/logging/server-logger', () => ({
  ServerLogger: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn()
  }
}));

describe('ReservationService', () => {
  let service: ReservationService;
  let mockPrisma: any;
  
  beforeEach(() => {
    jest.clearAllMocks();
    service = new ReservationService('test_tenant');
    mockPrisma = (PrismaClient as jest.Mock).mock.results[0].value;
  });
  
  describe('getCommonAreas', () => {
    it('debe obtener áreas comunes con paginación', async () => {
      // Configurar mocks
      const mockAreas = [
        { id: 1, name: 'Salón Comunal', isActive: true },
        { id: 2, name: 'Piscina', isActive: true }
      ];
      
      mockPrisma.$queryRawUnsafe
        .mockResolvedValueOnce([{ count: '2' }])
        .mockResolvedValueOnce(mockAreas)
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);
      
      // Ejecutar método
      const result = await service.getCommonAreas({ isActive: true, page: 1, limit: 10 });
      
      // Verificar resultados
      expect(result.total).toBe(2);
      expect(result.areas).toHaveLength(2);
      expect(result.areas[0].name).toBe('Salón Comunal');
      expect(result.areas[1].name).toBe('Piscina');
      
      // Verificar que se llamó a queryRawUnsafe con los parámetros correctos
      expect(mockPrisma.$queryRawUnsafe).toHaveBeenCalledTimes(4);
      expect(mockPrisma.$queryRawUnsafe.mock.calls[0][0]).toContain('SELECT COUNT(*) as count');
      expect(mockPrisma.$queryRawUnsafe.mock.calls[0][0]).toContain('"test_tenant"."CommonArea"');
      expect(mockPrisma.$queryRawUnsafe.mock.calls[1][0]).toContain('SELECT *');
      expect(mockPrisma.$queryRawUnsafe.mock.calls[1][0]).toContain('LIMIT 10 OFFSET 0');
    });
    
    it('debe manejar errores correctamente', async () => {
      // Configurar mock para lanzar error
      mockPrisma.$queryRawUnsafe.mockRejectedValue(new Error('Error de base de datos'));
      
      // Verificar que se lanza el error
      await expect(service.getCommonAreas()).rejects.toThrow('Error de base de datos');
    });
  });
  
  describe('getCommonAreaById', () => {
    it('debe obtener un área común por ID con su configuración y reglas', async () => {
      // Configurar mocks
      const mockArea = [{ id: 1, name: 'Salón Comunal', isActive: true }];
      const mockConfig = [{ id: 1, commonAreaId: 1, mondayStart: '08:00', mondayEnd: '20:00' }];
      const mockRules = [
        { id: 1, commonAreaId: 1, name: 'Regla estándar', maxDurationHours: 4, isActive: true }
      ];
      
      mockPrisma.$queryRawUnsafe
        .mockResolvedValueOnce(mockArea)
        .mockResolvedValueOnce(mockConfig)
        .mockResolvedValueOnce(mockRules);
      
      // Ejecutar método
      const result = await service.getCommonAreaById(1);
      
      // Verificar resultados
      expect(result).toBeDefined();
      expect(result.id).toBe(1);
      expect(result.name).toBe('Salón Comunal');
      expect(result.availabilityConfig).toBeDefined();
      expect(result.availabilityConfig.mondayStart).toBe('08:00');
      expect(result.reservationRules).toHaveLength(1);
      expect(result.reservationRules[0].maxDurationHours).toBe(4);
      
      // Verificar que se llamó a queryRawUnsafe con los parámetros correctos
      expect(mockPrisma.$queryRawUnsafe).toHaveBeenCalledTimes(3);
      expect(mockPrisma.$queryRawUnsafe.mock.calls[0][0]).toContain('WHERE "id" = 1');
    });
    
    it('debe devolver null si el área no existe', async () => {
      // Configurar mock para devolver array vacío
      mockPrisma.$queryRawUnsafe.mockResolvedValueOnce([]);
      
      // Ejecutar método
      const result = await service.getCommonAreaById(999);
      
      // Verificar resultado
      expect(result).toBeNull();
    });
  });
  
  describe('checkAvailability', () => {
    it('debe verificar disponibilidad y devolver true si no hay conflictos', async () => {
      // Configurar mocks
      const mockArea = [{ id: 1, name: 'Salón Comunal', isActive: true }];
      const mockConfig = [{ 
        id: 1, 
        commonAreaId: 1, 
        mondayStart: '08:00', 
        mondayEnd: '20:00',
        tuesdayStart: '08:00',
        tuesdayEnd: '20:00',
        wednesdayStart: '08:00',
        wednesdayEnd: '20:00',
        thursdayStart: '08:00',
        thursdayEnd: '20:00',
        fridayStart: '08:00',
        fridayEnd: '20:00',
        saturdayStart: '10:00',
        saturdayEnd: '18:00',
        sundayStart: '10:00',
        sundayEnd: '18:00'
      }];
      const mockRules = [
        { id: 1, commonAreaId: 1, name: 'Regla estándar', maxDurationHours: 4, isActive: true }
      ];
      const mockConflicts = [];
      
      mockPrisma.$queryRawUnsafe
        .mockResolvedValueOnce(mockArea)
        .mockResolvedValueOnce(mockConfig)
        .mockResolvedValueOnce(mockRules)
        .mockResolvedValueOnce(mockConfig)
        .mockResolvedValueOnce(mockConflicts);
      
      // Crear fechas para prueba (un lunes a las 10:00 y 12:00)
      const startDateTime = new Date(2025, 5, 2, 10, 0); // Lunes 2 de junio de 2025 a las 10:00
      const endDateTime = new Date(2025, 5, 2, 12, 0);   // Lunes 2 de junio de 2025 a las 12:00
      
      // Ejecutar método
      const result = await service.checkAvailability(1, startDateTime, endDateTime);
      
      // Verificar resultados
      expect(result.available).toBe(true);
      expect(result.conflicts).toHaveLength(0);
      
      // Verificar que se llamó a queryRawUnsafe con los parámetros correctos
      expect(mockPrisma.$queryRawUnsafe).toHaveBeenCalledTimes(5);
    });
    
    it('debe devolver false si hay conflictos con otras reservas', async () => {
      // Configurar mocks
      const mockArea = [{ id: 1, name: 'Salón Comunal', isActive: true }];
      const mockConfig = [{ 
        id: 1, 
        commonAreaId: 1, 
        mondayStart: '08:00', 
        mondayEnd: '20:00',
        tuesdayStart: '08:00',
        tuesdayEnd: '20:00',
        wednesdayStart: '08:00',
        wednesdayEnd: '20:00',
        thursdayStart: '08:00',
        thursdayEnd: '20:00',
        fridayStart: '08:00',
        fridayEnd: '20:00',
        saturdayStart: '10:00',
        saturdayEnd: '18:00',
        sundayStart: '10:00',
        sundayEnd: '18:00'
      }];
      const mockRules = [
        { id: 1, commonAreaId: 1, name: 'Regla estándar', maxDurationHours: 4, isActive: true }
      ];
      const mockConflicts = [
        { id: 5, title: 'Reserva existente', startDateTime: '2025-06-02T09:00:00Z', endDateTime: '2025-06-02T11:00:00Z', status: 'APPROVED' }
      ];
      
      mockPrisma.$queryRawUnsafe
        .mockResolvedValueOnce(mockArea)
        .mockResolvedValueOnce(mockConfig)
        .mockResolvedValueOnce(mockRules)
        .mockResolvedValueOnce(mockConfig)
        .mockResolvedValueOnce(mockConflicts);
      
      // Crear fechas para prueba (un lunes a las 10:00 y 12:00)
      const startDateTime = new Date(2025, 5, 2, 10, 0); // Lunes 2 de junio de 2025 a las 10:00
      const endDateTime = new Date(2025, 5, 2, 12, 0);   // Lunes 2 de junio de 2025 a las 12:00
      
      // Ejecutar método
      const result = await service.checkAvailability(1, startDateTime, endDateTime);
      
      // Verificar resultados
      expect(result.available).toBe(false);
      expect(result.conflicts).toHaveLength(1);
      expect(result.reason).toBe('Existen reservas que se solapan con el horario solicitado');
      
      // Verificar que se llamó a queryRawUnsafe con los parámetros correctos
      expect(mockPrisma.$queryRawUnsafe).toHaveBeenCalledTimes(5);
    });
  });
  
  describe('createReservation', () => {
    it('debe crear una reserva exitosamente cuando está disponible', async () => {
      // Configurar mocks para checkAvailability
      const mockArea = [{ 
        id: 1, 
        name: 'Salón Comunal', 
        isActive: true,
        requiresApproval: false,
        hasFee: false
      }];
      const mockConfig = [{ 
        id: 1, 
        commonAreaId: 1, 
        mondayStart: '08:00', 
        mondayEnd: '20:00'
      }];
      const mockRules = [
        { 
          id: 1, 
          commonAreaId: 1, 
          name: 'Regla estándar', 
          maxDurationHours: 4,
          minDurationHours: 1,
          maxAdvanceDays: 30,
          minAdvanceDays: 1,
          maxReservationsPerMonth: 4,
          maxReservationsPerWeek: 2,
          maxConcurrentReservations: 1,
          isActive: true 
        }
      ];
      const mockConflicts = [];
      const mockWeeklyCount = [{ count: '0' }];
      const mockMonthlyCount = [{ count: '0' }];
      const mockConcurrentCount = [{ count: '0' }];
      const mockNewReservation = [{ 
        id: 10, 
        commonAreaId: 1,
        userId: 5,
        propertyId: 3,
        title: 'Reunión familiar',
        startDateTime: '2025-06-02T10:00:00Z',
        endDateTime: '2025-06-02T12:00:00Z',
        status: 'APPROVED'
      }];
      const mockNotification = [{ id: 1, reservationId: 10, userId: 5 }];
      
      mockPrisma.$queryRawUnsafe
        // Para checkAvailability
        .mockResolvedValueOnce(mockArea)
        .mockResolvedValueOnce(mockConfig)
        .mockResolvedValueOnce(mockRules)
        .mockResolvedValueOnce(mockConfig)
        .mockResolvedValueOnce(mockConflicts)
        // Para validateReservationRules
        .mockResolvedValueOnce(mockRules)
        .mockResolvedValueOnce(mockWeeklyCount)
        .mockResolvedValueOnce(mockMonthlyCount)
        .mockResolvedValueOnce(mockConcurrentCount)
        // Para getCommonAreaById
        .mockResolvedValueOnce(mockArea)
        .mockResolvedValueOnce(mockConfig)
        .mockResolvedValueOnce(mockRules)
        // Para createReservation
        .mockResolvedValueOnce(mockNewReservation)
        // Para createReservationNotification
        .mockResolvedValueOnce(mockNotification);
      
      // Crear fechas para prueba
      const startDateTime = new Date(2025, 5, 2, 10, 0);
      const endDateTime = new Date(2025, 5, 2, 12, 0);
      
      // Ejecutar método
      const result = await service.createReservation({
        commonAreaId: 1,
        userId: 5,
        propertyId: 3,
        title: 'Reunión familiar',
        startDateTime,
        endDateTime,
        attendees: 10
      });
      
      // Verificar resultados
      expect(result).toBeDefined();
      expect(result.id).toBe(10);
      expect(result.title).toBe('Reunión familiar');
      expect(result.status).toBe('APPROVED');
      
      // Verificar que se llamó a queryRawUnsafe con los parámetros correctos
      expect(mockPrisma.$queryRawUnsafe).toHaveBeenCalledTimes(13);
    });
    
    it('debe lanzar error si el área no está disponible', async () => {
      // Configurar mocks para checkAvailability que devuelve no disponible
      const mockArea = [{ id: 1, name: 'Salón Comunal', isActive: true }];
      const mockConfig = [{ 
        id: 1, 
        commonAreaId: 1, 
        mondayStart: '08:00', 
        mondayEnd: '20:00'
      }];
      const mockRules = [
        { id: 1, commonAreaId: 1, name: 'Regla estándar', maxDurationHours: 4, isActive: true }
      ];
      const mockConflicts = [
        { id: 5, title: 'Reserva existente', startDateTime: '2025-06-02T09:00:00Z', endDateTime: '2025-06-02T11:00:00Z', status: 'APPROVED' }
      ];
      
      mockPrisma.$queryRawUnsafe
        .mockResolvedValueOnce(mockArea)
        .mockResolvedValueOnce(mockConfig)
        .mockResolvedValueOnce(mockRules)
        .mockResolvedValueOnce(mockConfig)
        .mockResolvedValueOnce(mockConflicts);
      
      // Crear fechas para prueba
      const startDateTime = new Date(2025, 5, 2, 10, 0);
      const endDateTime = new Date(2025, 5, 2, 12, 0);
      
      // Verificar que se lanza el error
      await expect(service.createReservation({
        commonAreaId: 1,
        userId: 5,
        propertyId: 3,
        title: 'Reunión familiar',
        startDateTime,
        endDateTime,
        attendees: 10
      })).rejects.toThrow('Existen reservas que se solapan con el horario solicitado');
    });
  });
  
  describe('updateReservationStatus', () => {
    it('debe actualizar el estado de una reserva correctamente', async () => {
      // Configurar mocks
      const mockReservation = [{ 
        id: 10, 
        commonAreaId: 1,
        userId: 5,
        propertyId: 3,
        title: 'Reunión familiar',
        commonAreaName: 'Salón Comunal',
        startDateTime: '2025-06-02T10:00:00Z',
        endDateTime: '2025-06-02T12:00:00Z',
        status: 'PENDING'
      }];
      const mockUpdatedReservation = [{ 
        id: 10, 
        commonAreaId: 1,
        userId: 5,
        propertyId: 3,
        title: 'Reunión familiar',
        commonAreaName: 'Salón Comunal',
        startDateTime: '2025-06-02T10:00:00Z',
        endDateTime: '2025-06-02T12:00:00Z',
        status: 'APPROVED',
        approvedById: 1,
        approvedAt: '2025-06-01T12:00:00Z'
      }];
      const mockNotification = [{ id: 2, reservationId: 10, userId: 5 }];
      
      mockPrisma.$queryRawUnsafe
        .mockResolvedValueOnce(mockReservation)
        .mockResolvedValueOnce(mockUpdatedReservation)
        .mockResolvedValueOnce(mockNotification);
      
      // Ejecutar método
      const result = await service.updateReservationStatus({
        reservationId: 10,
        status: 'APPROVED',
        adminId: 1
      });
      
      // Verificar resultados
      expect(result).toBeDefined();
      expect(result.id).toBe(10);
      expect(result.status).toBe('APPROVED');
      expect(result.approvedById).toBe(1);
      
      // Verificar que se llamó a queryRawUnsafe con los parámetros correctos
      expect(mockPrisma.$queryRawUnsafe).toHaveBeenCalledTimes(3);
      expect(mockPrisma.$queryRawUnsafe.mock.calls[1][0]).toContain('UPDATE');
      expect(mockPrisma.$queryRawUnsafe.mock.calls[1][0]).toContain('"status" = \'APPROVED\'');
    });
    
    it('debe lanzar error si la transición de estado no está permitida', async () => {
      // Configurar mocks
      const mockReservation = [{ 
        id: 10, 
        commonAreaId: 1,
        userId: 5,
        propertyId: 3,
        title: 'Reunión familiar',
        commonAreaName: 'Salón Comunal',
        startDateTime: '2025-06-02T10:00:00Z',
        endDateTime: '2025-06-02T12:00:00Z',
        status: 'CANCELLED'
      }];
      
      mockPrisma.$queryRawUnsafe.mockResolvedValueOnce(mockReservation);
      
      // Verificar que se lanza el error
      await expect(service.updateReservationStatus({
        reservationId: 10,
        status: 'APPROVED'
      })).rejects.toThrow('No se puede cambiar el estado de CANCELLED a APPROVED');
    });
  });
  
  describe('getUserNotifications', () => {
    it('debe obtener las notificaciones de un usuario con paginación', async () => {
      // Configurar mocks
      const mockTotalCount = [{ count: '2' }];
      const mockNotifications = [
        { 
          id: 1, 
          reservationId: 10, 
          userId: 5, 
          type: 'reservation_confirmed', 
          message: 'Tu reserva ha sido confirmada',
          isRead: false,
          sentAt: '2025-06-01T10:00:00Z',
          reservationTitle: 'Reunión familiar',
          startDateTime: '2025-06-02T10:00:00Z',
          commonAreaName: 'Salón Comunal'
        },
        { 
          id: 2, 
          reservationId: 11, 
          userId: 5, 
          type: 'reservation_pending', 
          message: 'Tu reserva está pendiente de aprobación',
          isRead: true,
          sentAt: '2025-06-01T09:00:00Z',
          readAt: '2025-06-01T09:05:00Z',
          reservationTitle: 'Fiesta de cumpleaños',
          startDateTime: '2025-06-05T15:00:00Z',
          commonAreaName: 'Terraza'
        }
      ];
      
      mockPrisma.$queryRawUnsafe
        .mockResolvedValueOnce(mockTotalCount)
        .mockResolvedValueOnce(mockNotifications);
      
      // Ejecutar método
      const result = await service.getUserNotifications(5, 1, 10);
      
      // Verificar resultados
      expect(result.total).toBe(2);
      expect(result.notifications).toHaveLength(2);
      expect(result.notifications[0].type).toBe('reservation_confirmed');
      expect(result.notifications[1].type).toBe('reservation_pending');
      
      // Verificar que se llamó a queryRawUnsafe con los parámetros correctos
      expect(mockPrisma.$queryRawUnsafe).toHaveBeenCalledTimes(2);
      expect(mockPrisma.$queryRawUnsafe.mock.calls[0][0]).toContain('COUNT(*)');
      expect(mockPrisma.$queryRawUnsafe.mock.calls[0][0]).toContain('"userId" = 5');
      expect(mockPrisma.$queryRawUnsafe.mock.calls[1][0]).toContain('ORDER BY n."sentAt" DESC');
    });
  });
  
  describe('markNotificationAsRead', () => {
    it('debe marcar una notificación como leída', async () => {
      // Configurar mocks
      const mockUpdatedNotification = [{ 
        id: 1, 
        reservationId: 10, 
        userId: 5, 
        isRead: true,
        readAt: '2025-06-01T12:00:00Z'
      }];
      
      mockPrisma.$queryRawUnsafe.mockResolvedValueOnce(mockUpdatedNotification);
      
      // Ejecutar método
      const result = await service.markNotificationAsRead(1, 5);
      
      // Verificar resultados
      expect(result).toBeDefined();
      expect(result.id).toBe(1);
      expect(result.isRead).toBe(true);
      expect(result.readAt).toBeDefined();
      
      // Verificar que se llamó a queryRawUnsafe con los parámetros correctos
      expect(mockPrisma.$queryRawUnsafe).toHaveBeenCalledTimes(1);
      expect(mockPrisma.$queryRawUnsafe.mock.calls[0][0]).toContain('UPDATE');
      expect(mockPrisma.$queryRawUnsafe.mock.calls[0][0]).toContain('"isRead" = true');
      expect(mockPrisma.$queryRawUnsafe.mock.calls[0][0]).toContain('"id" = 1 AND "userId" = 5');
    });
    
    it('debe lanzar error si la notificación no existe o no pertenece al usuario', async () => {
      // Configurar mock para devolver array vacío
      mockPrisma.$queryRawUnsafe.mockResolvedValueOnce([]);
      
      // Verificar que se lanza el error
      await expect(service.markNotificationAsRead(999, 5)).rejects.toThrow('La notificación con ID 999 no existe o no pertenece al usuario 5');
    });
  });
});
