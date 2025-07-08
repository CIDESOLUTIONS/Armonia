/**
 * Servicio de SMS para la aplicación Armonía
 * Proporciona funcionalidades para envío de mensajes SMS
 */

import { ServerLogger } from '../logging/server-logger';
import twilio from 'twilio';

const logger = ServerLogger;

// Configuración de Twilio
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER; // Tu número de Twilio

const client = twilio(accountSid, authToken);

/**
 * Envía un mensaje SMS a un número específico
 * @param options - Opciones del mensaje
 * @param options.to - Número de teléfono destinatario
 * @param options.message - Contenido del mensaje
 * @param options.from - Número o nombre del remitente (opcional)
 * @returns Resultado del envío
 */
export async function sendSMS(options: { to: string; message: string; from?: string }): Promise<any> {
  try {
    if (!options || !options.to || !options.message) {
      throw new Error('Datos de SMS incompletos');
    }

    if (!accountSid || !authToken || !twilioPhoneNumber) {
      logger.warn('Credenciales de Twilio no configuradas. Usando mock de SMS.');
      // Fallback a mock si las credenciales no están configuradas
      return {
        success: true,
        messageId: `mock_sms_${Date.now()}`,
        to: options.to,
        timestamp: new Date().toISOString()
      };
    }
    
    logger.info(`Enviando SMS a ${options.to}`);
    
    const message = await client.messages.create({
      body: options.message,
      from: options.from || twilioPhoneNumber,
      to: options.to,
    });
    
    const result = {
      success: true,
      messageId: message.sid,
      to: options.to,
      timestamp: new Date().toISOString()
    };
    
    logger.info(`SMS enviado correctamente: ${result.messageId}`);
    return result;
  } catch (error: any) {
    logger.error(`Error al enviar SMS: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Envía un mensaje SMS a múltiples números
 * @param phoneNumbers - Lista de números de teléfono
 * @param message - Contenido del mensaje
 * @param from - Número o nombre del remitente (opcional)
 * @returns Resultado del envío
 */
export async function sendBulkSMS(phoneNumbers: string[], message: string, from?: string): Promise<any> {
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
      results: [] as any[]
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
    
    logger.info(`SMS masivo enviado a ${results.sent}/${results.total} números`);
    return results;
  } catch (error: any) {
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