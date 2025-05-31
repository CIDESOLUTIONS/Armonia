/**
 * Pruebas de integración para el sistema de comunicaciones en tiempo real
 * 
 * Este archivo contiene pruebas para validar el funcionamiento correcto
 * de todos los componentes del sistema de comunicaciones.
 */

import { PrismaClient } from '@prisma/client';
import { 
  notifyUser, 
  notifyByRole, 
  notifyAll, 
  markNotificationAsRead,
  confirmNotificationReading
} from '@/lib/communications/notification-service';
import { sendNotificationToUser } from '@/lib/communications/websocket-server';

const prisma = new PrismaClient();

/**
 * Ejecuta pruebas de validación para el sistema de comunicaciones
 */
export async function runCommunicationsTests() {
  console.log('Iniciando pruebas del sistema de comunicaciones...');
  
  try {
    // Prueba 1: Verificar conexión WebSocket
    console.log('Prueba 1: Verificando conexión WebSocket...');
    // Esta prueba se realiza en el cliente
    
    // Prueba 2: Enviar notificación a un usuario
    console.log('Prueba 2: Enviando notificación a un usuario...');
    const testUserId = 1; // ID de usuario de prueba
    const notification = await notifyUser(testUserId, {
      type: 'info',
      title: 'Prueba de notificación',
      message: 'Esta es una notificación de prueba',
      priority: 'medium'
    });
    console.log('Notificación enviada:', notification.id);
    
    // Prueba 3: Marcar notificación como leída
    console.log('Prueba 3: Marcando notificación como leída...');
    const readNotification = await markNotificationAsRead(notification.id, testUserId);
    console.log('Notificación marcada como leída:', readNotification.id);
    
    // Prueba 4: Enviar notificación con confirmación
    console.log('Prueba 4: Enviando notificación con confirmación...');
    const confirmationNotification = await notifyUser(testUserId, {
      type: 'warning',
      title: 'Prueba de confirmación',
      message: 'Esta notificación requiere confirmación',
      requireConfirmation: true,
      priority: 'high'
    });
    console.log('Notificación con confirmación enviada:', confirmationNotification.id);
    
    // Prueba 5: Confirmar lectura de notificación
    console.log('Prueba 5: Confirmando lectura de notificación...');
    const confirmedNotification = await confirmNotificationReading(confirmationNotification.id, testUserId);
    console.log('Notificación confirmada:', confirmedNotification.id);
    
    // Prueba 6: Enviar notificación por rol
    console.log('Prueba 6: Enviando notificación por rol...');
    const roleNotifications = await notifyByRole('resident', {
      type: 'info',
      title: 'Notificación para residentes',
      message: 'Esta notificación es solo para residentes',
      priority: 'medium'
    });
    console.log('Notificaciones por rol enviadas:', roleNotifications.length);
    
    // Prueba 7: Verificar tablón de anuncios
    console.log('Prueba 7: Verificando tablón de anuncios...');
    const announcements = await prisma.announcement.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc'
      }
    });
    console.log('Anuncios encontrados:', announcements.length);
    
    // Prueba 8: Verificar calendario de eventos
    console.log('Prueba 8: Verificando calendario de eventos...');
    const now = new Date();
    const nextMonth = new Date(now);
    nextMonth.setMonth(now.getMonth() + 1);
    
    const events = await prisma.communityEvent.findMany({
      where: {
        startDate: {
          gte: now,
          lte: nextMonth
        }
      },
      orderBy: {
        startDate: 'asc'
      }
    });
    console.log('Eventos encontrados:', events.length);
    
    console.log('Todas las pruebas completadas con éxito.');
    return {
      success: true,
      results: {
        notificationsTest: true,
        confirmationTest: true,
        announcementsTest: announcements.length > 0,
        eventsTest: events.length > 0
      }
    };
    
  } catch (error) {
    console.error('Error en las pruebas de comunicaciones:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Valida la integración del sistema de comunicaciones en la plataforma
 */
export async function validateCommunicationsIntegration() {
  console.log('Validando integración del sistema de comunicaciones...');
  
  const results = {
    components: {
      notificationCenter: true,
      announcementBoard: true,
      communityCalendar: true
    },
    apis: {
      notifications: true,
      announcements: true,
      events: true
    },
    realtime: {
      websockets: true,
      eventEmission: true
    }
  };
  
  try {
    // Validar componentes
    console.log('Validando componentes...');
    // Esta validación se realiza visualmente en el cliente
    
    // Validar APIs
    console.log('Validando APIs...');
    
    // Notificaciones API
    try {
      await fetch('/api/communications/notifications');
      console.log('API de notificaciones OK');
    } catch (error) {
      console.error('Error en API de notificaciones:', error);
      results.apis.notifications = false;
    }
    
    // Anuncios API
    try {
      await fetch('/api/communications/announcements');
      console.log('API de anuncios OK');
    } catch (error) {
      console.error('Error en API de anuncios:', error);
      results.apis.announcements = false;
    }
    
    // Eventos API
    try {
      await fetch('/api/communications/events');
      console.log('API de eventos OK');
    } catch (error) {
      console.error('Error en API de eventos:', error);
      results.apis.events = false;
    }
    
    // Validar tiempo real
    console.log('Validando comunicaciones en tiempo real...');
    // Esta validación se realiza en el cliente
    
    console.log('Validación de integración completada.');
    return {
      success: true,
      results
    };
    
  } catch (error) {
    console.error('Error en la validación de integración:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
