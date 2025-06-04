/**
 * Servicio de Notificaciones Push para la aplicación Armonía
 * Proporciona funcionalidades para envío de notificaciones push a dispositivos móviles
 * Adaptado a CommonJS para compatibilidad con Jest
 */

const { ServerLogger } = require('../logging/server-logger');

const logger = new ServerLogger('PushNotificationService');

/**
 * Envía una notificación push a un dispositivo específico
 * @param {Object} options - Opciones de la notificación
 * @param {string} options.deviceToken - Token del dispositivo destinatario
 * @param {string} options.title - Título de la notificación
 * @param {string} options.body - Cuerpo de la notificación
 * @param {Object} options.data - Datos adicionales para la notificación (opcional)
 * @param {string} options.icon - URL del icono (opcional)
 * @param {string} options.sound - Sonido a reproducir (opcional)
 * @param {string} options.clickAction - Acción al hacer clic (opcional)
 * @returns {Promise<Object>} - Resultado del envío
 */
async function sendPushNotification(options) {
  try {
    if (!options || !options.deviceToken || !options.title || !options.body) {
      throw new Error('Datos de notificación push incompletos');
    }
    
    logger.info(`Enviando notificación push a dispositivo: ${options.deviceToken}`);
    
    // En una implementación real, aquí se integraría con Firebase Cloud Messaging (FCM)
    // o algún otro servicio de notificaciones push como OneSignal, etc.
    
    // Simulación de envío exitoso para desarrollo y pruebas
    const result = {
      success: true,
      messageId: `mock_push_${Date.now()}`,
      deviceToken: options.deviceToken,
      timestamp: new Date().toISOString()
    };
    
    logger.info(`Notificación push enviada correctamente: ${result.messageId}`);
    return result;
  } catch (error) {
    logger.error(`Error al enviar notificación push: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Envía una notificación push a múltiples dispositivos
 * @param {Array} deviceTokens - Lista de tokens de dispositivos
 * @param {Object} notification - Datos de la notificación
 * @returns {Promise<Object>} - Resultado del envío
 */
async function sendMulticastPushNotification(deviceTokens, notification) {
  try {
    if (!deviceTokens || !Array.isArray(deviceTokens) || deviceTokens.length === 0) {
      throw new Error('Se requiere al menos un token de dispositivo');
    }
    
    if (!notification || !notification.title || !notification.body) {
      throw new Error('Datos de notificación push incompletos');
    }
    
    logger.info(`Enviando notificación push a ${deviceTokens.length} dispositivos`);
    
    const results = {
      success: true,
      total: deviceTokens.length,
      sent: 0,
      failed: 0,
      results: []
    };
    
    // Enviar a cada dispositivo
    for (const token of deviceTokens) {
      try {
        const result = await sendPushNotification({
          deviceToken: token,
          ...notification
        });
        
        results.results.push({
          deviceToken: token,
          success: result.success,
          messageId: result.messageId
        });
        
        if (result.success) {
          results.sent++;
        } else {
          results.failed++;
        }
      } catch (deviceError) {
        logger.error(`Error al enviar a dispositivo ${token}: ${deviceError.message}`);
        results.failed++;
        results.results.push({
          deviceToken: token,
          success: false,
          error: deviceError.message
        });
      }
    }
    
    results.success = results.sent > 0;
    
    logger.info(`Notificación push enviada a ${results.sent}/${results.total} dispositivos`);
    return results;
  } catch (error) {
    logger.error(`Error al enviar notificación push multicast: ${error.message}`);
    return {
      success: false,
      error: error.message,
      total: deviceTokens ? deviceTokens.length : 0,
      sent: 0,
      failed: deviceTokens ? deviceTokens.length : 0
    };
  }
}

/**
 * Envía una notificación push por tema
 * @param {string} topic - Tema al que enviar la notificación
 * @param {Object} notification - Datos de la notificación
 * @returns {Promise<Object>} - Resultado del envío
 */
async function sendTopicPushNotification(topic, notification) {
  try {
    if (!topic) {
      throw new Error('Se requiere un tema para la notificación');
    }
    
    if (!notification || !notification.title || !notification.body) {
      throw new Error('Datos de notificación push incompletos');
    }
    
    logger.info(`Enviando notificación push al tema: ${topic}`);
    
    // En una implementación real, aquí se enviaría a FCM o similar
    
    // Simulación de envío exitoso para desarrollo y pruebas
    const result = {
      success: true,
      messageId: `mock_topic_push_${Date.now()}`,
      topic,
      timestamp: new Date().toISOString()
    };
    
    logger.info(`Notificación push a tema enviada correctamente: ${result.messageId}`);
    return result;
  } catch (error) {
    logger.error(`Error al enviar notificación push a tema: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Envía una notificación push de PQR
 * @param {Object} pqr - Datos de la PQR
 * @param {string} deviceToken - Token del dispositivo
 * @param {string} action - Acción realizada (created, updated, resolved, etc.)
 * @returns {Promise<Object>} - Resultado del envío
 */
async function sendPQRPushNotification(pqr, deviceToken, action) {
  try {
    if (!pqr || !deviceToken) {
      throw new Error('Datos incompletos para notificación push de PQR');
    }
    
    let title, body;
    
    switch (action) {
      case 'created':
        title = `Nueva PQR: ${pqr.title}`;
        body = `Se ha creado una nueva PQR con ID #${pqr.id}`;
        break;
        
      case 'updated':
        title = `Actualización de PQR #${pqr.id}`;
        body = `La PQR "${pqr.title}" ha sido actualizada. Estado: ${pqr.status}`;
        break;
        
      case 'resolved':
        title = `PQR #${pqr.id} resuelta`;
        body = `La PQR "${pqr.title}" ha sido marcada como resuelta`;
        break;
        
      case 'closed':
        title = `PQR #${pqr.id} cerrada`;
        body = `La PQR "${pqr.title}" ha sido cerrada`;
        break;
        
      default:
        title = `Actualización de PQR #${pqr.id}`;
        body = `La PQR "${pqr.title}" ha sido actualizada`;
    }
    
    return await sendPushNotification({
      deviceToken,
      title,
      body,
      data: {
        type: 'PQR',
        pqrId: pqr.id,
        action,
        status: pqr.status
      },
      clickAction: 'OPEN_PQR_DETAIL'
    });
  } catch (error) {
    logger.error(`Error al enviar notificación push de PQR: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Envía una notificación push de asamblea
 * @param {Object} assembly - Datos de la asamblea
 * @param {string} deviceToken - Token del dispositivo
 * @param {string} action - Acción realizada (scheduled, reminder, started, etc.)
 * @returns {Promise<Object>} - Resultado del envío
 */
async function sendAssemblyPushNotification(assembly, deviceToken, action) {
  try {
    if (!assembly || !deviceToken) {
      throw new Error('Datos incompletos para notificación push de asamblea');
    }
    
    let title, body;
    const dateOptions = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    const formattedDate = new Date(assembly.date).toLocaleDateString('es-ES', dateOptions);
    
    switch (action) {
      case 'scheduled':
        title = `Nueva asamblea: ${assembly.title}`;
        body = `Se ha programado una nueva asamblea para el ${formattedDate}`;
        break;
        
      case 'reminder':
        title = `Recordatorio: ${assembly.title}`;
        body = `La asamblea "${assembly.title}" se realizará mañana ${formattedDate}`;
        break;
        
      case 'started':
        title = `Asamblea iniciada: ${assembly.title}`;
        body = `La asamblea "${assembly.title}" ha comenzado`;
        break;
        
      case 'ended':
        title = `Asamblea finalizada: ${assembly.title}`;
        body = `La asamblea "${assembly.title}" ha finalizado`;
        break;
        
      default:
        title = `Actualización de asamblea: ${assembly.title}`;
        body = `La asamblea "${assembly.title}" ha sido actualizada`;
    }
    
    return await sendPushNotification({
      deviceToken,
      title,
      body,
      data: {
        type: 'ASSEMBLY',
        assemblyId: assembly.id,
        action,
        date: assembly.date
      },
      clickAction: 'OPEN_ASSEMBLY_DETAIL'
    });
  } catch (error) {
    logger.error(`Error al enviar notificación push de asamblea: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Suscribe un dispositivo a un tema
 * @param {string} deviceToken - Token del dispositivo
 * @param {string} topic - Tema al que suscribirse
 * @returns {Promise<Object>} - Resultado de la suscripción
 */
async function subscribeToTopic(deviceToken, topic) {
  try {
    if (!deviceToken || !topic) {
      throw new Error('Se requieren token de dispositivo y tema para suscripción');
    }
    
    logger.info(`Suscribiendo dispositivo ${deviceToken} al tema ${topic}`);
    
    // En una implementación real, aquí se integraría con FCM o similar
    
    // Simulación de suscripción exitosa para desarrollo y pruebas
    const result = {
      success: true,
      deviceToken,
      topic,
      timestamp: new Date().toISOString()
    };
    
    logger.info(`Dispositivo suscrito correctamente al tema ${topic}`);
    return result;
  } catch (error) {
    logger.error(`Error al suscribir dispositivo a tema: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Cancela la suscripción de un dispositivo a un tema
 * @param {string} deviceToken - Token del dispositivo
 * @param {string} topic - Tema del que cancelar suscripción
 * @returns {Promise<Object>} - Resultado de la cancelación
 */
async function unsubscribeFromTopic(deviceToken, topic) {
  try {
    if (!deviceToken || !topic) {
      throw new Error('Se requieren token de dispositivo y tema para cancelar suscripción');
    }
    
    logger.info(`Cancelando suscripción de dispositivo ${deviceToken} al tema ${topic}`);
    
    // En una implementación real, aquí se integraría con FCM o similar
    
    // Simulación de cancelación exitosa para desarrollo y pruebas
    const result = {
      success: true,
      deviceToken,
      topic,
      timestamp: new Date().toISOString()
    };
    
    logger.info(`Suscripción cancelada correctamente del tema ${topic}`);
    return result;
  } catch (error) {
    logger.error(`Error al cancelar suscripción de dispositivo a tema: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

// Exportar funciones usando CommonJS para compatibilidad con Jest
module.exports = {
  sendPushNotification,
  sendMulticastPushNotification,
  sendTopicPushNotification,
  sendPQRPushNotification,
  sendAssemblyPushNotification,
  subscribeToTopic,
  unsubscribeFromTopic
};
