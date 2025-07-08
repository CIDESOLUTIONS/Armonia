import { NotificationChannel } from '@prisma/client';

// Interfaces para los adaptadores de mensajería
export interface MessageAdapter {
  sendMessage(to: string, message: string, options?: any): Promise<MessageResponse>;
  verifyWebhook(payload: any, signature?: string): boolean;
  parseResponse(payload: any): MessageEvent;
}

export interface MessageResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface MessageEvent {
  from: string;
  text: string;
  timestamp: Date;
  messageId: string;
  type: 'text' | 'button' | 'media' | 'location';
  buttonPayload?: string;
}

// Adaptador para WhatsApp (usando Twilio como proveedor)
export class WhatsAppAdapter implements MessageAdapter {
  private accountSid: string;
  private authToken: string;
  private fromNumber: string;
  private client: any;

  constructor(config: any) {
    this.accountSid = config.accountSid;
    this.authToken = config.authToken;
    this.fromNumber = config.fromNumber;
    
    // Importamos Twilio solo cuando se instancia el adaptador
    const twilio = require('twilio');
    this.client = twilio(this.accountSid, this.authToken);
  }

  async sendMessage(to: string, message: string, options?: any): Promise<MessageResponse> {
    try {
      // Normalizar el número de teléfono
      const normalizedNumber = this.normalizePhoneNumber(to);
      
      // Preparar opciones para el mensaje
      const messageOptions: any = {
        from: `whatsapp:${this.fromNumber}`,
        to: `whatsapp:${normalizedNumber}`,
        body: message
      };

      // Agregar imagen si está en las opciones
      if (options?.mediaUrl) {
        messageOptions.mediaUrl = [options.mediaUrl];
      }

      // Enviar el mensaje
      const twilioMessage = await this.client.messages.create(messageOptions);
      
      return {
        success: true,
        messageId: twilioMessage.sid
      };
    } catch (error) {
      console.error('Error al enviar mensaje de WhatsApp:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  verifyWebhook(payload: any, signature?: string): boolean {
    try {
      // Implementar verificación de firma para webhooks de Twilio
      if (!signature) return false;
      
      const twilio = require('twilio');
      const { url, method, headers } = payload;
      
      return twilio.validateRequest(
        this.authToken,
        signature,
        url,
        payload.body
      );
    } catch (error) {
      console.error('Error al verificar webhook de WhatsApp:', error);
      return false;
    }
  }

  parseResponse(payload: any): MessageEvent {
    // Extraer información relevante del webhook de Twilio
    const from = payload.From.replace('whatsapp:', '');
    const text = payload.Body;
    const messageId = payload.MessageSid;
    
    return {
      from,
      text,
      timestamp: new Date(),
      messageId,
      type: 'text'
    };
  }

  private normalizePhoneNumber(phone: string): string {
    // Eliminar espacios, guiones y paréntesis
    let normalized = phone.replace(/[\s\-\(\)]/g, '');
    
    // Asegurar que tenga el código de país
    if (!normalized.startsWith('+')) {
      normalized = '+57' + normalized; // Asumimos Colombia como país por defecto
    }
    
    return normalized;
  }
}
