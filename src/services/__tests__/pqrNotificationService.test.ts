/**
 * Pruebas unitarias para el servicio de notificaciones de PQR
 */

import { PQRNotificationService } from '../pqrNotificationService';
import { PrismaClient } from '@prisma/client';
import { PQRStatus, PQRNotificationTemplate } from '@/constants/pqr-constants';
import { sendEmail } from '@/lib/communications/email-service';
import { sendPushNotification } from '@/lib/communications/push-notification-service';

// Mock de PrismaClient
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    $queryRaw: jest.fn(),
    pQR: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn()
    },
    pQRNotification: {
      create: jest.fn()
    },
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn()
    }
  };
  
  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
    PQRStatus: {
      OPEN: 'OPEN',
      CATEGORIZED: 'CATEGORIZED',
      ASSIGNED: 'ASSIGNED',
      IN_PROGRESS: 'IN_PROGRESS',
      WAITING: 'WAITING',
      RESOLVED: 'RESOLVED',
      CLOSED: 'CLOSED',
      REOPENED: 'REOPENED',
      CANCELLED: 'CANCELLED'
    }
  };
});

// Mock de servicios de comunicación
jest.mock('@/lib/communications/email-service', () => ({
  sendEmail: jest.fn().mockResolvedValue(true)
}));

jest.mock('@/lib/communications/push-notification-service', () => ({
  sendPushNotification: jest.fn().mockResolvedValue(true)
}));

jest.mock('@/lib/communications/sms-service', () => ({
  sendSMS: jest.fn().mockResolvedValue(true)
}));

describe('PQRNotificationService', () => {
  let service: PQRNotificationService;
  let prisma: any;
  
  beforeEach(() => {
    // Limpiar todos los mocks
    jest.clearAllMocks();
    
    // Crear instancia del servicio con schema de prueba
    service = new PQRNotificationService('test_schema');
    
    // Obtener la instancia de prisma para configurar mocks
    prisma = (service as any).prisma;
  });
  
  describe('notifyStatusChange', () => {
    it('debe enviar notificaciones cuando cambia el estado de un PQR', async () => {
      // Mock para PQR
      prisma.pQR.findUnique.mockResolvedValue({
        id: 123,
        ticketNumber: 'PQR-20250602-001',
        title: 'Problema de mantenimiento',
        status: PQRStatus.ASSIGNED,
        userId: 1,
        assignedToId: 10,
        dueDate: new Date()
      });
      
      // Mock para configuración
      prisma.$queryRaw.mockResolvedValueOnce([{ autoNotifyEnabled: true }]);
      
      // Mock para usuario que reportó
      prisma.user.findUnique.mockResolvedValueOnce({
        id: 1,
        email: 'usuario@example.com',
        name: 'Usuario Test',
        role: 'RESIDENT'
      });
      
      // Mock para usuario asignado
      prisma.user.findUnique.mockResolvedValueOnce({
        id: 10,
        email: 'tecnico@example.com',
        name: 'Técnico Test',
        role: 'STAFF'
      });
      
      // Ejecutar el método
      const result = await service.notifyStatusChange(
        123,
        PQRStatus.IN_PROGRESS,
        PQRStatus.ASSIGNED,
        10,
        'Iniciando trabajo en la solicitud'
      );
      
      // Verificar resultado
      expect(result).toBe(true);
      
      // Verificar que se enviaron notificaciones
      expect(sendEmail).toHaveBeenCalledTimes(2); // A usuario y técnico
      expect(sendPushNotification).toHaveBeenCalledTimes(2); // A usuario y técnico
      
      // Verificar que se registró la notificación
      expect(prisma.pQRNotification.create).toHaveBeenCalledTimes(2);
    });
    
    it('no debe enviar notificaciones si están desactivadas', async () => {
      // Mock para PQR
      prisma.pQR.findUnique.mockResolvedValue({
        id: 123,
        ticketNumber: 'PQR-20250602-001',
        title: 'Problema de mantenimiento',
        status: PQRStatus.ASSIGNED,
        userId: 1
      });
      
      // Mock para configuración (notificaciones desactivadas)
      prisma.$queryRaw.mockResolvedValueOnce([{ autoNotifyEnabled: false }]);
      
      // Ejecutar el método
      const result = await service.notifyStatusChange(
        123,
        PQRStatus.IN_PROGRESS,
        PQRStatus.ASSIGNED,
        10
      );
      
      // Verificar resultado
      expect(result).toBe(false);
      
      // Verificar que no se enviaron notificaciones
      expect(sendEmail).not.toHaveBeenCalled();
      expect(sendPushNotification).not.toHaveBeenCalled();
    });
    
    it('debe manejar errores correctamente', async () => {
      // Forzar error en la consulta
      prisma.pQR.findUnique.mockRejectedValue(new Error('Error de base de datos'));
      
      // Ejecutar el método
      const result = await service.notifyStatusChange(
        123,
        PQRStatus.IN_PROGRESS,
        PQRStatus.ASSIGNED,
        10
      );
      
      // Verificar resultado
      expect(result).toBe(false);
      
      // Verificar que no se enviaron notificaciones
      expect(sendEmail).not.toHaveBeenCalled();
      expect(sendPushNotification).not.toHaveBeenCalled();
    });
  });
  
  describe('sendDueDateReminders', () => {
    it('debe enviar recordatorios para PQRs próximos a vencer', async () => {
      // Fecha actual
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      // Mock para PQRs que vencen pronto
      prisma.pQR.findMany.mockResolvedValue([
        {
          id: 123,
          ticketNumber: 'PQR-20250602-001',
          title: 'Problema de mantenimiento',
          status: PQRStatus.IN_PROGRESS,
          userId: 1,
          assignedToId: 10,
          dueDate: tomorrow
        }
      ]);
      
      // Mock para PQR específico
      prisma.pQR.findUnique.mockResolvedValue({
        id: 123,
        ticketNumber: 'PQR-20250602-001',
        title: 'Problema de mantenimiento',
        status: PQRStatus.IN_PROGRESS,
        userId: 1,
        assignedToId: 10,
        dueDate: tomorrow
      });
      
      // Mock para usuario que reportó
      prisma.user.findUnique.mockResolvedValueOnce({
        id: 1,
        email: 'usuario@example.com',
        name: 'Usuario Test',
        role: 'RESIDENT'
      });
      
      // Mock para usuario asignado
      prisma.user.findUnique.mockResolvedValueOnce({
        id: 10,
        email: 'tecnico@example.com',
        name: 'Técnico Test',
        role: 'STAFF'
      });
      
      // Ejecutar el método
      const reminderCount = await service.sendDueDateReminders();
      
      // Verificar resultado
      expect(reminderCount).toBeGreaterThan(0);
      
      // Verificar que se enviaron notificaciones
      expect(sendEmail).toHaveBeenCalled();
      expect(sendPushNotification).toHaveBeenCalled();
      
      // Verificar que se registraron las notificaciones
      expect(prisma.pQRNotification.create).toHaveBeenCalled();
    });
    
    it('debe manejar errores correctamente', async () => {
      // Forzar error en la consulta
      prisma.pQR.findMany.mockRejectedValue(new Error('Error de base de datos'));
      
      // Ejecutar el método
      const reminderCount = await service.sendDueDateReminders();
      
      // Verificar resultado
      expect(reminderCount).toBe(0);
      
      // Verificar que no se enviaron notificaciones
      expect(sendEmail).not.toHaveBeenCalled();
      expect(sendPushNotification).not.toHaveBeenCalled();
    });
  });
  
  describe('sendSatisfactionSurvey', () => {
    it('debe enviar encuesta de satisfacción para PQR resuelto', async () => {
      // Mock para PQR resuelto
      prisma.pQR.findUnique.mockResolvedValue({
        id: 123,
        ticketNumber: 'PQR-20250602-001',
        title: 'Problema de mantenimiento',
        status: PQRStatus.RESOLVED,
        userId: 1
      });
      
      // Mock para configuración
      prisma.$queryRaw.mockResolvedValueOnce([{ satisfactionSurveyEnabled: true }]);
      
      // Mock para usuario
      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        email: 'usuario@example.com',
        name: 'Usuario Test',
        role: 'RESIDENT'
      });
      
      // Ejecutar el método
      const result = await service.sendSatisfactionSurvey(123);
      
      // Verificar resultado
      expect(result).toBe(true);
      
      // Verificar que se envió la encuesta
      expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({
        to: 'usuario@example.com',
        subject: expect.stringContaining('Encuesta de satisfacción')
      }));
      
      expect(sendPushNotification).toHaveBeenCalledWith(expect.objectContaining({
        userId: 1,
        title: expect.stringContaining('Encuesta de satisfacción')
      }));
      
      // Verificar que se registró la notificación
      expect(prisma.pQRNotification.create).toHaveBeenCalled();
    });
    
    it('no debe enviar encuesta si el PQR no está resuelto', async () => {
      // Mock para PQR no resuelto
      prisma.pQR.findUnique.mockResolvedValue({
        id: 123,
        ticketNumber: 'PQR-20250602-001',
        title: 'Problema de mantenimiento',
        status: PQRStatus.IN_PROGRESS,
        userId: 1
      });
      
      // Ejecutar el método
      const result = await service.sendSatisfactionSurvey(123);
      
      // Verificar resultado
      expect(result).toBe(false);
      
      // Verificar que no se envió la encuesta
      expect(sendEmail).not.toHaveBeenCalled();
      expect(sendPushNotification).not.toHaveBeenCalled();
    });
    
    it('no debe enviar encuesta si están desactivadas', async () => {
      // Mock para PQR resuelto
      prisma.pQR.findUnique.mockResolvedValue({
        id: 123,
        ticketNumber: 'PQR-20250602-001',
        title: 'Problema de mantenimiento',
        status: PQRStatus.RESOLVED,
        userId: 1
      });
      
      // Mock para configuración (encuestas desactivadas)
      prisma.$queryRaw.mockResolvedValueOnce([{ satisfactionSurveyEnabled: false }]);
      
      // Ejecutar el método
      const result = await service.sendSatisfactionSurvey(123);
      
      // Verificar resultado
      expect(result).toBe(false);
      
      // Verificar que no se envió la encuesta
      expect(sendEmail).not.toHaveBeenCalled();
      expect(sendPushNotification).not.toHaveBeenCalled();
    });
  });
  
  describe('getNotificationTemplate', () => {
    it('debe obtener plantilla personalizada de la base de datos', async () => {
      // Mock para plantilla personalizada
      prisma.$queryRaw.mockResolvedValueOnce([{
        name: 'status_change_ASSIGNED_to_IN_PROGRESS',
        subject: 'Plantilla personalizada: {{ticketNumber}}',
        content: 'Contenido personalizado para {{recipientName}}'
      }]);
      
      // Ejecutar el método (es privado, así que usamos any)
      const template = await (service as any).getNotificationTemplate(
        PQRStatus.IN_PROGRESS,
        PQRStatus.ASSIGNED
      );
      
      // Verificar resultado
      expect(template).toEqual({
        subject: 'Plantilla personalizada: {{ticketNumber}}',
        content: 'Contenido personalizado para {{recipientName}}'
      });
    });
    
    it('debe usar plantilla predeterminada cuando no hay personalizada', async () => {
      // Mock para plantilla (vacío)
      prisma.$queryRaw.mockResolvedValueOnce([]);
      
      // Ejecutar el método para estado RESOLVED
      const template = await (service as any).getNotificationTemplate(
        PQRStatus.RESOLVED
      );
      
      // Verificar resultado
      expect(template).toHaveProperty('subject');
      expect(template).toHaveProperty('content');
      expect(template.subject).toContain('PQR resuelto');
    });
  });
});
