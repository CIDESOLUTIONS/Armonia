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

// Adaptador para Telegram
export class TelegramAdapter implements MessageAdapter {
  private botToken: string;
  private apiUrl: string = 'https://api.telegram.org/bot';
  private axios: any;

  constructor(config: any) {
    this.botToken = config.botToken;
    
    // Importamos axios solo cuando se instancia el adaptador
    this.axios = require('axios').default;
  }

  async sendMessage(to: string, message: string, options?: any): Promise<MessageResponse> {
    try {
      // Preparar datos para la API de Telegram
      const data: any = {
        chat_id: to,
        text: message,
        parse_mode: 'HTML'
      };

      // Agregar botones si están en las opciones
      if (options?.buttons) {
        data.reply_markup = {
          inline_keyboard: options.buttons.map((button: any) => [{
            text: button.text,
            callback_data: button.payload
          }])
        };
      }

      // Enviar el mensaje
      const response = await this.axios.post(
        `${this.apiUrl}${this.botToken}/sendMessage`,
        data
      );
      
      if (response.data.ok) {
        return {
          success: true,
          messageId: response.data.result.message_id.toString()
        };
      } else {
        return {
          success: false,
          error: response.data.description
        };
      }
    } catch (error) {
      console.error('Error al enviar mensaje de Telegram:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  verifyWebhook(payload: any): boolean {
    // Telegram no proporciona un mecanismo de firma para webhooks
    // pero podemos verificar que el payload tenga la estructura esperada
    return payload && payload.update_id && 
           (payload.message || payload.callback_query);
  }

  parseResponse(payload: any): MessageEvent {
    // Determinar si es un mensaje de texto o una respuesta de botón
    if (payload.callback_query) {
      // Es una respuesta de botón
      const { from, data } = payload.callback_query;
      
      return {
        from: from.id.toString(),
        text: '',
        timestamp: new Date(),
        messageId: payload.update_id.toString(),
        type: 'button',
        buttonPayload: data
      };
    } else if (payload.message) {
      // Es un mensaje de texto
      const { from, text, message_id } = payload.message;
      
      return {
        from: from.id.toString(),
        text: text || '',
        timestamp: new Date(payload.message.date * 1000),
        messageId: message_id.toString(),
        type: 'text'
      };
    }
    
    throw new Error('Formato de mensaje no reconocido');
  }
}
