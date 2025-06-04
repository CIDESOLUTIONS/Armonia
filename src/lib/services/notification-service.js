/**
 * Servicio de Notificaciones para la aplicación Armonía
 * Proporciona funcionalidades para envío y gestión de notificaciones
 * Adaptado a CommonJS para compatibilidad con Jest
 */

const { ServerLogger } = require('../logging/server-logger');
const websocketService = require('../../communications/websocket-service');
const emailService = require('../communications/email-service');
const { NOTIFICATION_TYPES } = require('../constants');

const logger = new ServerLogger('NotificationService');

/**
 * Envía una notificación a través de múltiples canales
 * @param {Object} notification - Datos de la notificación
 * @param {string} notification.userId - ID del usuario destinatario
 * @param {string} notification.schemaName - Nombre del esquema/comunidad
 * @param {string} notification.title - Título de la notificación
 * @param {string} notification.message - Mensaje de la notificación
 * @param {string} notification.type - Tipo de notificación (PQR, ASSEMBLY, etc.)
 * @param {Object} notification.data - Datos adicionales específicos del tipo
 * @param {Array} notification.channels - Canales de envío (websocket, email, sms, push)
 * @returns {Promise<Object>} - Resultado del envío
 */
async function sendNotification(notification) {
  try {
    if (!notification || !notification.userId || !notification.schemaName) {
      throw new Error('Datos de notificación incompletos');
    }
    
    // Canales por defecto si no se especifican
    const channels = notification.channels || ['websocket'];
    
    logger.info(`Enviando notificación a usuario ${notification.userId} por canales: ${channels.join(', ')}`);
    
    const results = {
      success: false,
      channels: {}
    };
    
    // Procesar cada canal de notificación
    for (const channel of channels) {
      try {
        switch (channel) {
          case 'websocket':
            results.channels.websocket = await sendWebSocketNotification(notification);
            break;
            
          case 'email':
            results.channels.email = await sendEmailNotification(notification);
            break;
            
          case 'sms':
            results.channels.sms = await sendSMSNotification(notification);
            break;
            
          case 'push':
            results.channels.push = await sendPushNotification(notification);
            break;
            
          default:
            logger.warn(`Canal de notificación no soportado: ${channel}`);
            results.channels[channel] = { success: false, error: 'Canal no soportado' };
        }
      } catch (channelError) {
        logger.error(`Error en canal ${channel}: ${channelError.message}`);
        results.channels[channel] = { success: false, error: channelError.message };
      }
    }
    
    // Determinar éxito general basado en al menos un canal exitoso
    results.success = Object.values(results.channels).some(channel => channel.success);
    
    return results;
  } catch (error) {
    logger.error(`Error al enviar notificación: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Envía una notificación por WebSocket
 * @param {Object} notification - Datos de la notificación
 * @returns {Promise<Object>} - Resultado del envío
 */
async function sendWebSocketNotification(notification) {
  try {
    const success = websocketService.sendToClient(
      notification.schemaName,
      notification.userId,
      {
        type: 'NOTIFICATION',
        title: notification.title,
        message: notification.message,
        notificationType: notification.type,
        data: notification.data,
        timestamp: new Date().toISOString()
      }
    );
    
    return {
      success,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    logger.error(`Error al enviar notificación WebSocket: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Envía una notificación por Email
 * @param {Object} notification - Datos de la notificación
 * @returns {Promise<Object>} - Resultado del envío
 */
async function sendEmailNotification(notification) {
  try {
    if (!notification.user || !notification.user.email) {
      throw new Error('Se requiere email del usuario para notificación por correo');
    }
    
    const emailResult = await emailService.sendEmail({
      to: notification.user.email,
      subject: notification.title,
      text: notification.message,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>${notification.title}</h2>
          <p>${notification.message}</p>
          ${notification.data ? `<p>Información adicional: ${JSON.stringify(notification.data)}</p>` : ''}
          <p style="color: #777; font-size: 12px;">Esta notificación fue enviada desde la plataforma Armonía.</p>
        </div>
      `
    });
    
    return emailResult;
  } catch (error) {
    logger.error(`Error al enviar notificación Email: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Envía una notificación por SMS (mock)
 * @param {Object} notification - Datos de la notificación
 * @returns {Promise<Object>} - Resultado del envío
 */
async function sendSMSNotification(notification) {
  try {
    if (!notification.user || !notification.user.phone) {
      throw new Error('Se requiere número de teléfono para notificación SMS');
    }
    
    // Mock de envío de SMS (en producción se integraría con un proveedor real)
    logger.info(`[MOCK] SMS enviado a ${notification.user.phone}: ${notification.title}`);
    
    return {
      success: true,
      messageId: `mock_sms_${Date.now()}`,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    logger.error(`Error al enviar notificación SMS: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Envía una notificación Push (mock)
 * @param {Object} notification - Datos de la notificación
 * @returns {Promise<Object>} - Resultado del envío
 */
async function sendPushNotification(notification) {
  try {
    if (!notification.user || !notification.user.deviceToken) {
      throw new Error('Se requiere token de dispositivo para notificación Push');
    }
    
    // Mock de envío de notificación Push (en producción se integraría con FCM o similar)
    logger.info(`[MOCK] Push enviado a dispositivo ${notification.user.deviceToken}: ${notification.title}`);
    
    return {
      success: true,
      notificationId: `mock_push_${Date.now()}`,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    logger.error(`Error al enviar notificación Push: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Envía una notificación de PQR
 * @param {Object} pqr - Datos de la PQR
 * @param {Object} user - Datos del usuario
 * @param {string} schemaName - Nombre del esquema/comunidad
 * @param {string} action - Acción realizada (created, updated, resolved, etc.)
 * @returns {Promise<Object>} - Resultado del envío
 */
async function sendPQRNotification(pqr, user, schemaName, action) {
  try {
    if (!pqr || !user || !schemaName) {
      throw new Error('Datos incompletos para notificación de PQR');
    }
    
    let title, message;
    
    switch (action) {
      case 'created':
        title = `Nueva PQR: ${pqr.title}`;
        message = `Se ha creado una nueva PQR con ID #${pqr.id}. ${pqr.description}`;
        break;
        
      case 'updated':
        title = `Actualización de PQR #${pqr.id}`;
        message = `La PQR "${pqr.title}" ha sido actualizada. Estado actual: ${pqr.status}`;
        break;
        
      case 'resolved':
        title = `PQR #${pqr.id} resuelta`;
        message = `La PQR "${pqr.title}" ha sido marcada como resuelta.`;
        break;
        
      case 'closed':
        title = `PQR #${pqr.id} cerrada`;
        message = `La PQR "${pqr.title}" ha sido cerrada.`;
        break;
        
      default:
        title = `Actualización de PQR #${pqr.id}`;
        message = `La PQR "${pqr.title}" ha sido actualizada.`;
    }
    
    return await sendNotification({
      userId: user.id,
      schemaName,
      title,
      message,
      type: NOTIFICATION_TYPES.PQR,
      data: {
        pqrId: pqr.id,
        status: pqr.status,
        action
      },
      user,
      channels: ['websocket', 'email']
    });
  } catch (error) {
    logger.error(`Error al enviar notificación de PQR: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Envía una notificación de asamblea
 * @param {Object} assembly - Datos de la asamblea
 * @param {Object} user - Datos del usuario
 * @param {string} schemaName - Nombre del esquema/comunidad
 * @param {string} action - Acción realizada (scheduled, reminder, started, etc.)
 * @returns {Promise<Object>} - Resultado del envío
 */
async function sendAssemblyNotification(assembly, user, schemaName, action) {
  try {
    if (!assembly || !user || !schemaName) {
      throw new Error('Datos incompletos para notificación de asamblea');
    }
    
    let title, message;
    const dateOptions = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    const formattedDate = new Date(assembly.date).toLocaleDateString('es-ES', dateOptions);
    
    switch (action) {
      case 'scheduled':
        title = `Nueva asamblea: ${assembly.title}`;
        message = `Se ha programado una nueva asamblea para el ${formattedDate}. Lugar: ${assembly.location}`;
        break;
        
      case 'reminder':
        title = `Recordatorio: ${assembly.title}`;
        message = `Recordatorio: La asamblea "${assembly.title}" se realizará mañana ${formattedDate}. Lugar: ${assembly.location}`;
        break;
        
      case 'started':
        title = `Asamblea iniciada: ${assembly.title}`;
        message = `La asamblea "${assembly.title}" ha comenzado. Puede unirse ahora.`;
        break;
        
      case 'ended':
        title = `Asamblea finalizada: ${assembly.title}`;
        message = `La asamblea "${assembly.title}" ha finalizado. Gracias por su participación.`;
        break;
        
      default:
        title = `Actualización de asamblea: ${assembly.title}`;
        message = `La asamblea "${assembly.title}" ha sido actualizada.`;
    }
    
    return await sendNotification({
      userId: user.id,
      schemaName,
      title,
      message,
      type: NOTIFICATION_TYPES.ASSEMBLY,
      data: {
        assemblyId: assembly.id,
        status: assembly.status,
        date: assembly.date,
        action
      },
      user,
      channels: ['websocket', 'email']
    });
  } catch (error) {
    logger.error(`Error al enviar notificación de asamblea: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Envía una notificación de pago
 * @param {Object} payment - Datos del pago
 * @param {Object} user - Datos del usuario
 * @param {string} schemaName - Nombre del esquema/comunidad
 * @param {string} action - Acción realizada (received, confirmed, rejected, etc.)
 * @returns {Promise<Object>} - Resultado del envío
 */
async function sendPaymentNotification(payment, user, schemaName, action) {
  try {
    if (!payment || !user || !schemaName) {
      throw new Error('Datos incompletos para notificación de pago');
    }
    
    let title, message;
    const amount = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(payment.amount);
    
    switch (action) {
      case 'received':
        title = `Pago recibido: ${amount}`;
        message = `Se ha recibido un pago por ${amount}. Referencia: ${payment.reference}`;
        break;
        
      case 'confirmed':
        title = `Pago confirmado: ${amount}`;
        message = `El pago por ${amount} ha sido confirmado. Referencia: ${payment.reference}`;
        break;
        
      case 'rejected':
        title = `Pago rechazado: ${amount}`;
        message = `El pago por ${amount} ha sido rechazado. Motivo: ${payment.rejectionReason || 'No especificado'}`;
        break;
        
      default:
        title = `Actualización de pago: ${amount}`;
        message = `El estado del pago por ${amount} ha sido actualizado a ${payment.status}.`;
    }
    
    return await sendNotification({
      userId: user.id,
      schemaName,
      title,
      message,
      type: NOTIFICATION_TYPES.PAYMENT,
      data: {
        paymentId: payment.id,
        status: payment.status,
        amount: payment.amount,
        action
      },
      user,
      channels: ['websocket', 'email']
    });
  } catch (error) {
    logger.error(`Error al enviar notificación de pago: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Envía una notificación de anuncio
 * @param {Object} announcement - Datos del anuncio
 * @param {Array} users - Lista de usuarios destinatarios
 * @param {string} schemaName - Nombre del esquema/comunidad
 * @returns {Promise<Object>} - Resultado del envío
 */
async function sendAnnouncementNotification(announcement, users, schemaName) {
  try {
    if (!announcement || !users || !Array.isArray(users) || users.length === 0 || !schemaName) {
      throw new Error('Datos incompletos para notificación de anuncio');
    }
    
    const title = `Anuncio: ${announcement.title}`;
    const message = announcement.content;
    
    const results = {
      success: true,
      total: users.length,
      sent: 0,
      failed: 0,
      details: []
    };
    
    // Enviar a cada usuario
    for (const user of users) {
      try {
        const result = await sendNotification({
          userId: user.id,
          schemaName,
          title,
          message,
          type: NOTIFICATION_TYPES.ANNOUNCEMENT,
          data: {
            announcementId: announcement.id,
            priority: announcement.priority
          },
          user,
          channels: ['websocket', 'email']
        });
        
        results.details.push({
          userId: user.id,
          success: result.success
        });
        
        if (result.success) {
          results.sent++;
        } else {
          results.failed++;
        }
      } catch (userError) {
        logger.error(`Error al enviar anuncio a usuario ${user.id}: ${userError.message}`);
        results.failed++;
        results.details.push({
          userId: user.id,
          success: false,
          error: userError.message
        });
      }
    }
    
    results.success = results.sent > 0;
    
    return results;
  } catch (error) {
    logger.error(`Error al enviar notificación de anuncio: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

// Exportar funciones usando CommonJS para compatibilidad con Jest
module.exports = {
  sendNotification,
  sendPQRNotification,
  sendAssemblyNotification,
  sendPaymentNotification,
  sendAnnouncementNotification,
  sendWebSocketNotification,
  sendEmailNotification,
  sendSMSNotification,
  sendPushNotification
};
