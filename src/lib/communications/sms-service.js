/**
 * Servicio de SMS para la aplicación Armonía
 * Proporciona funcionalidades para envío de mensajes SMS
 * Adaptado a CommonJS para compatibilidad con Jest
 */

const { ServerLogger } = require('../logging/server-logger');

const logger = new ServerLogger('SMSService');

/**
 * Envía un mensaje SMS a un número específico
 * @param {Object} options - Opciones del mensaje
 * @param {string} options.to - Número de teléfono destinatario
 * @param {string} options.message - Contenido del mensaje
 * @param {string} options.from - Número o nombre del remitente (opcional)
 * @returns {Promise<Object>} - Resultado del envío
 */
async function sendSMS(options) {
  try {
    if (!options || !options.to || !options.message) {
      throw new Error('Datos de SMS incompletos');
    }
    
    logger.info(`Enviando SMS a ${options.to}`);
    
    // En una implementación real, aquí se integraría con Twilio, AWS SNS, etc.
    
    // Simulación de envío exitoso para desarrollo y pruebas
    const result = {
      success: true,
      messageId: `mock_sms_${Date.now()}`,
      to: options.to,
      timestamp: new Date().toISOString()
    };
    
    logger.info(`SMS enviado correctamente: ${result.messageId}`);
    return result;
  } catch (error) {
    logger.error(`Error al enviar SMS: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Envía un mensaje SMS a múltiples números
 * @param {Array} phoneNumbers - Lista de números de teléfono
 * @param {string} message - Contenido del mensaje
 * @param {string} from - Número o nombre del remitente (opcional)
 * @returns {Promise<Object>} - Resultado del envío
 */
async function sendBulkSMS(phoneNumbers, message, from) {
  try {
    if (!phoneNumbers || !Array.isArray(phoneNumbers) || phoneNumbers.length === 0) {
      throw new Error('Se requiere al menos un número de teléfono');
    }
    
    if (!message) {
      throw new Error('Se requiere un mensaje');
    }
    
    logger.info(`Enviando SMS masivo a ${phoneNumbers.length} números`);
    
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
        const result = await sendSMS({
          to: phoneNumber,
          message,
          from
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
    
    logger.info(`SMS masivo enviado a ${results.sent}/${results.total} números`);
    return results;
  } catch (error) {
    logger.error(`Error al enviar SMS masivo: ${error.message}`);
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
  sendSMS,
  sendBulkSMS
};
