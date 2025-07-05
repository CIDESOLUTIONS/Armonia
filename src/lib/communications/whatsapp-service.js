/**
 * Servicio de WhatsApp para la aplicación Armonía
 * Proporciona funcionalidades para envío de mensajes WhatsApp
 * Adaptado a CommonJS para compatibilidad con Jest
 */

const { ServerLogger } = require('../logging/server-logger');

const logger = new ServerLogger('WhatsAppService');

/**
 * Envía un mensaje de WhatsApp a un número específico
 * @param {Object} options - Opciones del mensaje
 * @param {string} options.to - Número de teléfono destinatario
 * @param {string} options.message - Contenido del mensaje
 * @param {Object} options.media - Objeto con información de medios adjuntos (opcional)
 * @returns {Promise<Object>} - Resultado del envío
 */
async function sendWhatsAppMessage(options) {
  try {
    if (!options || !options.to || !options.message) {
      throw new Error('Datos de WhatsApp incompletos');
    }
    
    logger.info(`Enviando WhatsApp a ${options.to}`);
    
    // En una implementación real, aquí se integraría con Twilio, Meta Business API, etc.
    
    // Simulación de envío exitoso para desarrollo y pruebas
    const result = {
      success: true,
      messageId: `mock_whatsapp_${Date.now()}`,
      to: options.to,
      timestamp: new Date().toISOString()
    };
    
    logger.info(`WhatsApp enviado correctamente: ${result.messageId}`);
    return result;
  } catch (error) {
    logger.error(`Error al enviar WhatsApp: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Envía un mensaje de WhatsApp a múltiples números
 * @param {Array} phoneNumbers - Lista de números de teléfono
 * @param {string} message - Contenido del mensaje
 * @param {Object} media - Objeto con información de medios adjuntos (opcional)
 * @returns {Promise<Object>} - Resultado del envío
 */
async function sendBulkWhatsAppMessage(phoneNumbers, message, media) {
  try {
    if (!phoneNumbers || !Array.isArray(phoneNumbers) || phoneNumbers.length === 0) {
      throw new Error('Se requiere al menos un número de teléfono');
    }
    
    if (!message) {
      throw new Error('Se requiere un mensaje');
    }
    
    logger.info(`Enviando WhatsApp masivo a ${phoneNumbers.length} números`);
    
    const results = {
      success: true,
      total: phoneNumbers.length,
      sent: 0,
      failed: 0,
      results: []
    };
    
    // Enviar a cada número
    for (const phoneNumber of phoneNumbers) {
      try {
        const result = await sendWhatsAppMessage({
          to: phoneNumber,
          message,
          media
        });
        
        results.results.push({
          phoneNumber,
          success: result.success,
          messageId: result.messageId
        });
        
        if (result.success) {
          results.sent++;
        } else {
          results.failed++;
        }
      } catch (phoneError) {
        logger.error(`Error al enviar a número ${phoneNumber}: ${phoneError.message}`);
        results.failed++;
        results.results.push({
          phoneNumber,
          success: false,
          error: phoneError.message
        });
      }
    }
    
    results.success = results.sent > 0;
    
    logger.info(`WhatsApp masivo enviado a ${results.sent}/${results.total} números`);
    return results;
  } catch (error) {
    logger.error(`Error al enviar WhatsApp masivo: ${error.message}`);
    return {
      success: false,
      error: error.message,
      total: phoneNumbers ? phoneNumbers.length : 0,
      sent: 0,
      failed: phoneNumbers ? phoneNumbers.length : 0
    };
  }
}

// Exportar funciones usando CommonJS para compatibilidad con Jest
module.exports = {
  sendWhatsAppMessage,
  sendBulkWhatsAppMessage
};
