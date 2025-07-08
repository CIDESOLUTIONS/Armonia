/**
 * Servicio de WhatsApp para la aplicación Armonía
 * Proporciona funcionalidades para envío de mensajes WhatsApp
 */

import { ServerLogger } from '../logging/server-logger';
import twilio from 'twilio';

const logger = ServerLogger;

// Configuración de Twilio
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER; // Tu número de WhatsApp de Twilio

const client = twilio(accountSid, authToken);

/**
 * Envía un mensaje de WhatsApp a un número específico
 * @param options - Opciones del mensaje
 * @param options.to - Número de teléfono destinatario
 * @param options.message - Contenido del mensaje
 * @param options.media - Objeto con información de medios adjuntos (opcional)
 * @returns Resultado del envío
 */
export async function sendWhatsAppMessage(options: { to: string; message: string; media?: any }): Promise<any> {
  try {
    if (!options || !options.to || !options.message) {
      throw new Error('Datos de WhatsApp incompletos');
    }

    if (!accountSid || !authToken || !twilioWhatsAppNumber) {
      logger.warn('Credenciales de Twilio para WhatsApp no configuradas. Usando mock de WhatsApp.');
      // Fallback a mock si las credenciales no están configuradas
      return {
        success: true,
        messageId: `mock_whatsapp_${Date.now()}`,
        to: options.to,
        timestamp: new Date().toISOString()
      };
    }
    
    logger.info(`Enviando WhatsApp a ${options.to}`);
    
    const messageOptions: any = {
      body: options.message,
      from: `whatsapp:${twilioWhatsAppNumber}`,
      to: `whatsapp:${options.to}`,
    };

    if (options.media && options.media.url) {
      messageOptions.mediaUrl = [options.media.url];
    }

    const message = await client.messages.create(messageOptions);
    
    const result = {
      success: true,
      messageId: message.sid,
      to: options.to,
      timestamp: new Date().toISOString()
    };
    
    logger.info(`WhatsApp enviado correctamente: ${result.messageId}`);
    return result;
  } catch (error: any) {
    logger.error(`Error al enviar WhatsApp: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Envía un mensaje de WhatsApp a múltiples números
 * @param phoneNumbers - Lista de números de teléfono
 * @param message - Contenido del mensaje
 * @param media - Objeto con información de medios adjuntos (opcional)
 * @returns Resultado del envío
 */
export async function sendBulkWhatsAppMessage(phoneNumbers: string[], message: string, media?: any): Promise<any> {
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
      results: [] as any[]
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
      } catch (phoneError: any) {
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
  } catch (error: any) {
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