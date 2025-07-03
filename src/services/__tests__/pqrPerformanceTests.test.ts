/**
 * Pruebas de rendimiento y carga para el sistema PQR
 * 
 * Este archivo implementa pruebas de rendimiento y carga para evaluar
 * el comportamiento del sistema PQR bajo diferentes condiciones de uso.
 */

import { performance } from 'perf_hooks';
import { PrismaClient } from '@prisma/client';
import { PQRAssignmentService } from '../pqrAssignmentService';
import { PQRNotificationService } from '../pqrNotificationService';
import { PQRMetricsService } from '../pqrMetricsService';

// Configuración de pruebas
const TEST_CONFIG = {
  // Número de PQRs a crear para pruebas de carga
  numPQRs: 100,
  
  // Intervalo entre creaciones de PQR (ms)
  creationInterval: 50,
  
  // Tiempo máximo aceptable para operaciones críticas (ms)
  maxResponseTime: {
    creation: 200,
    assignment: 150,
    statusChange: 100,
    metricsGeneration: 500
  }
};

// Mock de PrismaClient para pruebas de rendimiento
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    $queryRaw: jest.fn().mockImplementation(() => Promise.resolve([])),
    pQR: {
      findUnique: jest.fn().mockImplementation(() => Promise.resolve({})),
      findMany: jest.fn().mockImplementation(() => Promise.resolve([])),
      create: jest.fn().mockImplementation((data) => Promise.resolve({ id: Math.floor(Math.random() * 1000), ...data.data })),
      update: jest.fn().mockImplementation((data) => Promise.resolve({ id: data.where.id, ...data.data })),
      count: jest.fn().mockImplementation(() => Promise.resolve(0)),
      groupBy: jest.fn().mockImplementation(() => Promise.resolve([]))
    },
    pQRStatusHistory: {
      create: jest.fn().mockImplementation(() => Promise.resolve({})),
      findMany: jest.fn().mockImplementation(() => Promise.resolve([]))
    },
    pQRNotification: {
      create: jest.fn().mockImplementation(() => Promise.resolve({})),
      findMany: jest.fn().mockImplementation(() => Promise.resolve([]))
    },
    user: {
      findUnique: jest.fn().mockImplementation(() => Promise.resolve({})),
      findMany: jest.fn().mockImplementation(() => Promise.resolve([]))
    }
  };
  
  return {
    PrismaClient: jest.fn(() => mockPrismaClient)
  };
});

// Mock de servicios de comunicación
jest.mock('@/lib/communications/email-service', () => ({
  sendEmail: jest.fn().mockImplementation(() => Promise.resolve(true))
}));

jest.mock('@/lib/communications/push-notification-service', () => ({
  sendPushNotification: jest.fn().mockImplementation(() => Promise.resolve(true))
}));

describe('PQR System Performance Tests', () => {
  let assignmentService: PQRAssignmentService;
  let notificationService: PQRNotificationService;
  let metricsService: PQRMetricsService;
  let prisma: any;
  
  beforeEach(() => {
    // Limpiar todos los mocks
    jest.clearAllMocks();
    
    // Crear instancias de los servicios con schema de prueba
    assignmentService = new PQRAssignmentService('test_schema');
    notificationService = new PQRNotificationService('test_schema');
    metricsService = new PQRMetricsService('test_schema');
    
    // Obtener la instancia de prisma para configurar mocks
    prisma = (assignmentService as any).prisma;
    
    // Configurar mocks comunes
    prisma.$queryRaw.mockResolvedValue([{ 
      autoCategorizeEnabled: true,
      autoAssignEnabled: true,
      autoNotifyEnabled: true
    }]);
  });
  
  describe('Pruebas de rendimiento para operaciones individuales', () => {
    it('debe procesar un PQR dentro del tiempo máximo aceptable', async () => {
      // Datos de prueba
      const pqrData = {
        type: 'COMPLAINT',
        title: 'Fuga de agua en baño comunal',
        description: 'Hay una fuga de agua importante en el baño del primer piso',
        userId: 1,
        userName: 'Juan Pérez',
        userRole: 'RESIDENT',
        unitId: 101,
        unitNumber: '101',
        complexId: 1
      };
      
      // Medir tiempo de procesamiento
      const startTime = performance.now();
      const result = await assignmentService.processPQR(pqrData);
      const endTime = performance.now();
      const processingTime = endTime - startTime;
      
      // Verificar resultado
      expect(result).toBeDefined();
      expect(processingTime).toBeLessThan(TEST_CONFIG.maxResponseTime.creation);
    });
    
    it('debe enviar notificaciones dentro del tiempo máximo aceptable', async () => {
      // Configurar mock para PQR
      prisma.pQR.findUnique.mockResolvedValue({
        id: 123,
        ticketNumber: 'PQR-20250602-001',
        title: 'Problema de mantenimiento',
        status: 'ASSIGNED',
        userId: 1,
        assignedToId: 10,
        dueDate: new Date()
      });
      
      // Usuario que reportó
      prisma.user.findUnique.mockResolvedValueOnce({
        id: 1,
        email: 'usuario@example.com',
        name: 'Usuario Test',
        role: 'RESIDENT'
      });
      
      // Usuario asignado
      prisma.user.findUnique.mockResolvedValueOnce({
        id: 10,
        email: 'tecnico@example.com',
        name: 'Técnico Test',
        role: 'STAFF'
      });
      
      // Medir tiempo de envío de notificación
      const startTime = performance.now();
      const result = await notificationService.notifyStatusChange(
        123,
        'IN_PROGRESS',
        'ASSIGNED',
        10,
        'Iniciando trabajo en la solicitud'
      );
      const endTime = performance.now();
      const processingTime = endTime - startTime;
      
      // Verificar resultado
      expect(result).toBe(true);
      expect(processingTime).toBeLessThan(TEST_CONFIG.maxResponseTime.statusChange);
    });
    
    it('debe generar métricas dentro del tiempo máximo aceptable', async () => {
      // Configurar mocks para métricas
      jest.spyOn(metricsService, 'getSummaryMetrics').mockResolvedValueOnce({
        totalCount: 28,
        openCount: 5,
        inProgressCount: 2,
        resolvedCount: 10,
        closedCount: 8,
        averageResponseTime: 30,
        averageResolutionTime: 120,
        slaComplianceRate: 75,
        satisfactionRate: 4.5
      });
      
      jest.spyOn(metricsService, 'getCategoryDistribution').mockResolvedValueOnce([
        { category: 'MAINTENANCE', count: 15, percentage: 53.57 }
      ]);
      
      jest.spyOn(metricsService, 'getPriorityDistribution').mockResolvedValueOnce([
        { priority: 'HIGH', count: 10, percentage: 35.71 }
      ]);
      
      jest.spyOn(metricsService, 'getStatusDistribution').mockResolvedValueOnce([
        { status: 'OPEN', count: 5, percentage: 17.86 }
      ]);
      
      jest.spyOn(metricsService, 'getTimeTrend').mockResolvedValueOnce([
        { period: '2025-06', count: 10, resolvedCount: 8, averageResolutionTime: 90 }
      ]);
      
      jest.spyOn(metricsService, 'getSLAMetrics').mockResolvedValueOnce({
        compliantCount: 15,
        nonCompliantCount: 5,
        complianceRate: 75,
        averageDeviationTime: 60
      });
      
      jest.spyOn(metricsService, 'getTopAssignees').mockResolvedValueOnce([
        {
          assigneeId: 10,
          assigneeName: 'Técnico 1',
          totalAssigned: 8,
          resolvedCount: 6,
          averageResolutionTime: 100,
          slaComplianceRate: 83.33
        }
      ]);
      
      jest.spyOn(metricsService, 'getRecentActivity').mockResolvedValueOnce([
        {
          date: new Date(),
          action: 'Cambio de estado: OPEN → ASSIGNED',
          pqrId: 123,
          ticketNumber: 'PQR-20250602-001',
          title: 'Problema de mantenimiento'
        }
      ]);
      
      // Medir tiempo de generación de métricas
      const startTime = performance.now();
      const result = await metricsService.generateDashboardMetrics();
      const endTime = performance.now();
      const processingTime = endTime - startTime;
      
      // Verificar resultado
      expect(result).toBeDefined();
      expect(processingTime).toBeLessThan(TEST_CONFIG.maxResponseTime.metricsGeneration);
    });
  });
  
  describe('Pruebas de carga para operaciones masivas', () => {
    it('debe manejar múltiples creaciones de PQR concurrentes', async () => {
      // Datos de prueba base
      const basePqrData = {
        type: 'COMPLAINT',
        title: 'Problema de prueba',
        description: 'Descripción de prueba para carga',
        userId: 1,
        userName: 'Usuario Prueba',
        userRole: 'RESIDENT',
        complexId: 1
      };
      
      // Crear array de promesas para procesamiento concurrente
      const startTime = performance.now();
      
      const promises = Array.from({ length: TEST_CONFIG.numPQRs }, (_, i) => {
        const pqrData = {
          ...basePqrData,
          title: `${basePqrData.title} ${i + 1}`,
          unitId: 100 + i,
          unitNumber: `${100 + i}`
        };
        
        // Simular intervalo entre creaciones
        return new Promise(resolve => {
          setTimeout(() => {
            resolve(assignmentService.processPQR(pqrData));
          }, i * TEST_CONFIG.creationInterval);
        });
      });
      
      // Esperar a que todas las promesas se resuelvan
      const results = await Promise.all(promises);
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      const averageTime = totalTime / TEST_CONFIG.numPQRs;
      
      // Verificar resultados
      expect(results.length).toBe(TEST_CONFIG.numPQRs);
      expect(results.every(r => r !== undefined)).toBe(true);
      
      // Registrar métricas de rendimiento
      console.log(`Procesamiento de ${TEST_CONFIG.numPQRs} PQRs:`);
      console.log(`- Tiempo total: ${totalTime.toFixed(2)} ms`);
      console.log(`- Tiempo promedio por PQR: ${averageTime.toFixed(2)} ms`);
      console.log(`- Tasa de procesamiento: ${(1000 * TEST_CONFIG.numPQRs / totalTime).toFixed(2)} PQRs/segundo`);
    });
    
    it('debe manejar múltiples notificaciones concurrentes', async () => {
      // Configurar mock para PQR
      prisma.pQR.findUnique.mockImplementation((query) => {
        return Promise.resolve({
          id: query.where.id,
          ticketNumber: `PQR-20250602-${String(query.where.id).padStart(3, '0')}`,
          title: 'Problema de prueba',
          status: 'ASSIGNED',
          userId: 1,
          assignedToId: 10,
          dueDate: new Date()
        });
      });
      
      // Usuario que reportó
      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        email: 'usuario@example.com',
        name: 'Usuario Test',
        role: 'RESIDENT'
      });
      
      // Crear array de promesas para notificaciones concurrentes
      const startTime = performance.now();
      
      const promises = Array.from({ length: TEST_CONFIG.numPQRs }, (_, i) => {
        const pqrId = i + 1;
        
        // Simular intervalo entre notificaciones
        return new Promise(resolve => {
          setTimeout(() => {
            resolve(notificationService.notifyStatusChange(
              pqrId,
              'IN_PROGRESS',
              'ASSIGNED',
              10,
              `Iniciando trabajo en la solicitud ${pqrId}`
            ));
          }, i * TEST_CONFIG.creationInterval / 2); // Intervalo más corto para notificaciones
        });
      });
      
      // Esperar a que todas las promesas se resuelvan
      const results = await Promise.all(promises);
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      const averageTime = totalTime / TEST_CONFIG.numPQRs;
      
      // Verificar resultados
      expect(results.length).toBe(TEST_CONFIG.numPQRs);
      expect(results.every(r => r === true)).toBe(true);
      
      // Registrar métricas de rendimiento
      console.log(`Envío de ${TEST_CONFIG.numPQRs} notificaciones:`);
      console.log(`- Tiempo total: ${totalTime.toFixed(2)} ms`);
      console.log(`- Tiempo promedio por notificación: ${averageTime.toFixed(2)} ms`);
      console.log(`- Tasa de envío: ${(1000 * TEST_CONFIG.numPQRs / totalTime).toFixed(2)} notificaciones/segundo`);
    });
    
    it('debe manejar múltiples consultas de métricas concurrentes con diferentes filtros', async () => {
      // Configurar mocks para métricas
      jest.spyOn(metricsService, 'getSummaryMetrics').mockResolvedValue({
        totalCount: 28,
        openCount: 5,
        inProgressCount: 2,
        resolvedCount: 10,
        closedCount: 8,
        averageResponseTime: 30,
        averageResolutionTime: 120,
        slaComplianceRate: 75,
        satisfactionRate: 4.5
      });
      
      jest.spyOn(metricsService, 'getCategoryDistribution').mockResolvedValue([
        { category: 'MAINTENANCE', count: 15, percentage: 53.57 }
      ]);
      
      jest.spyOn(metricsService, 'getPriorityDistribution').mockResolvedValue([
        { priority: 'HIGH', count: 10, percentage: 35.71 }
      ]);
      
      jest.spyOn(metricsService, 'getStatusDistribution').mockResolvedValue([
        { status: 'OPEN', count: 5, percentage: 17.86 }
      ]);
      
      jest.spyOn(metricsService, 'getTimeTrend').mockResolvedValue([
        { period: '2025-06', count: 10, resolvedCount: 8, averageResolutionTime: 90 }
      ]);
      
      jest.spyOn(metricsService, 'getSLAMetrics').mockResolvedValue({
        compliantCount: 15,
        nonCompliantCount: 5,
        complianceRate: 75,
        averageDeviationTime: 60
      });
      
      jest.spyOn(metricsService, 'getTopAssignees').mockResolvedValue([
        {
          assigneeId: 10,
          assigneeName: 'Técnico 1',
          totalAssigned: 8,
          resolvedCount: 6,
          averageResolutionTime: 100,
          slaComplianceRate: 83.33
        }
      ]);
      
      jest.spyOn(metricsService, 'getRecentActivity').mockResolvedValue([
        {
          date: new Date(),
          action: 'Cambio de estado: OPEN → ASSIGNED',
          pqrId: 123,
          ticketNumber: 'PQR-20250602-001',
          title: 'Problema de mantenimiento'
        }
      ]);
      
      // Categorías para filtros
      const categories = ['MAINTENANCE', 'SECURITY', 'ADMINISTRATIVE', 'FINANCIAL', 'COMMUNITY'];
      
      // Crear array de promesas para consultas concurrentes con diferentes filtros
      const startTime = performance.now();
      
      const promises = Array.from({ length: TEST_CONFIG.numPQRs }, (_, i) => {
        // Alternar entre diferentes filtros
        const filter = {
          category: categories[i % categories.length],
          startDate: new Date(2025, 0, 1),
          endDate: new Date()
        };
        
        // Simular intervalo entre consultas
        return new Promise(resolve => {
          setTimeout(() => {
            resolve(metricsService.generateDashboardMetrics(filter));
          }, i * TEST_CONFIG.creationInterval / 4); // Intervalo más corto para consultas
        });
      });
      
      // Esperar a que todas las promesas se resuelvan
      const results = await Promise.all(promises);
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      const averageTime = totalTime / TEST_CONFIG.numPQRs;
      
      // Verificar resultados
      expect(results.length).toBe(TEST_CONFIG.numPQRs);
      expect(results.every(r => r !== undefined)).toBe(true);
      
      // Registrar métricas de rendimiento
      console.log(`Generación de ${TEST_CONFIG.numPQRs} dashboards de métricas:`);
      console.log(`- Tiempo total: ${totalTime.toFixed(2)} ms`);
      console.log(`- Tiempo promedio por dashboard: ${averageTime.toFixed(2)} ms`);
      console.log(`- Tasa de generación: ${(1000 * TEST_CONFIG.numPQRs / totalTime).toFixed(2)} dashboards/segundo`);
    });
  });
  
  describe('Pruebas de estrés para límites del sistema', () => {
    it('debe manejar un pico de carga en creación de PQRs', async () => {
      // Aumentar el número de PQRs para prueba de estrés
      const stressTestConfig = {
        ...TEST_CONFIG,
        numPQRs: 500,
        creationInterval: 10 // Intervalo más corto para simular pico de carga
      };
      
      // Datos de prueba base
      const basePqrData = {
        type: 'COMPLAINT',
        title: 'Problema de prueba',
        description: 'Descripción de prueba para estrés',
        userId: 1,
        userName: 'Usuario Prueba',
        userRole: 'RESIDENT',
        complexId: 1
      };
      
      // Crear array de promesas para procesamiento concurrente
      const startTime = performance.now();
      
      const promises = Array.from({ length: stressTestConfig.numPQRs }, (_, i) => {
        const pqrData = {
          ...basePqrData,
          title: `${basePqrData.title} ${i + 1}`,
          unitId: 100 + i,
          unitNumber: `${100 + i}`
        };
        
        // Simular intervalo entre creaciones
        return new Promise(resolve => {
          setTimeout(() => {
            resolve(assignmentService.processPQR(pqrData));
          }, i * stressTestConfig.creationInterval);
        });
      });
      
      // Esperar a que todas las promesas se resuelvan
      const results = await Promise.all(promises);
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      const averageTime = totalTime / stressTestConfig.numPQRs;
      
      // Verificar resultados
      expect(results.length).toBe(stressTestConfig.numPQRs);
      expect(results.every(r => r !== undefined)).toBe(true);
      
      // Registrar métricas de rendimiento
      console.log(`Prueba de estrés - Procesamiento de ${stressTestConfig.numPQRs} PQRs:`);
      console.log(`- Tiempo total: ${totalTime.toFixed(2)} ms`);
      console.log(`- Tiempo promedio por PQR: ${averageTime.toFixed(2)} ms`);
      console.log(`- Tasa de procesamiento: ${(1000 * stressTestConfig.numPQRs / totalTime).toFixed(2)} PQRs/segundo`);
    });
  });
});
