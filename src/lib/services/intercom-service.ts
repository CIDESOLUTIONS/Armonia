/**
 * Servicio de Citofonía Virtual
 * 
 * Este servicio implementa la funcionalidad de citofonía virtual con integraciones
 * a WhatsApp y Telegram para notificaciones de visitantes y control de accesos.
 */

import { PrismaClient } from '@prisma/client';
import { prisma } from '../prisma';
import { ActivityLogger } from '../logging/activity-logger';
import { NotificationChannel, NotificationStatus, ResponseType, VisitStatus } from '@prisma/client';

// Interfaces para los adaptadores de mensajería
interface MessageAdapter {
  sendMessage(to: string, message: string, options?: any): Promise<MessageResponse>;
  verifyWebhook(payload: any, signature?: string): boolean;
  parseResponse(payload: any): MessageEvent;
}

interface MessageResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

interface MessageEvent {
  from: string;
  text: string;
  timestamp: Date;
  messageId: string;
  type: 'text' | 'button' | 'media' | 'location';
  buttonPayload?: string;
}

// Adaptador para WhatsApp (usando Twilio como proveedor)
class WhatsAppAdapter implements MessageAdapter {
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

// Adaptador para Telegram
class TelegramAdapter implements MessageAdapter {
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

// Clase principal del servicio de citofonía virtual
export class IntercomService {
  private prisma: PrismaClient;
  private logger: ActivityLogger;
  private adapters: Map<NotificationChannel, MessageAdapter> = new Map();
  private messageQueue: any[] = [];
  private isProcessingQueue: boolean = false;

  constructor() {
    this.prisma = prisma;
    this.logger = new ActivityLogger();
    this.initializeAdapters();
    
    // Iniciar procesamiento de cola cada 5 segundos
    setInterval(() => this.processMessageQueue(), 5000);
  }

  /**
   * Inicializa los adaptadores de mensajería según la configuración
   */
  private async initializeAdapters() {
    try {
      // Obtener configuración de la base de datos
      const settings = await this.prisma.intercomSettings.findFirst();
      
      if (!settings) {
        console.error('No se encontró configuración para el servicio de citofonía');
        return;
      }
      
      // Inicializar adaptador de WhatsApp si está habilitado
      if (settings.whatsappEnabled && settings.whatsappConfig) {
        const config = settings.whatsappConfig as any;
        this.adapters.set(NotificationChannel.WHATSAPP, new WhatsAppAdapter(config));
      }
      
      // Inicializar adaptador de Telegram si está habilitado
      if (settings.telegramEnabled && settings.telegramBotToken) {
        const config = { botToken: settings.telegramBotToken };
        this.adapters.set(NotificationChannel.TELEGRAM, new TelegramAdapter(config));
      }
      
      console.log('Adaptadores de mensajería inicializados correctamente');
    } catch (error) {
      console.error('Error al inicializar adaptadores:', error);
    }
  }

  /**
   * Registra una nueva visita en el sistema
   */
  async registerVisit(visitorData: any, unitId: number, purpose: string): Promise<any> {
    const { name, identification, phone, typeId } = visitorData;
    
    try {
      // Transacción para asegurar consistencia
      return await this.prisma.$transaction(async (tx) => {
        // Buscar si el visitante ya existe
        let visitor = await tx.visitor.findFirst({
          where: {
            identification: identification
          }
        });
        
        // Si no existe, crearlo
        if (!visitor) {
          visitor = await tx.visitor.create({
            data: {
              name,
              identification,
              phone,
              typeId,
              isFrequent: false
            }
          });
        }
        
        // Crear la visita
        const visit = await tx.visit.create({
          data: {
            visitorId: visitor.id,
            unitId,
            purpose,
            status: VisitStatus.PENDING
          }
        });
        
        // Registrar actividad
        await this.logger.logActivity({
          module: 'intercom',
          action: 'register_visit',
          entityId: visit.id,
          details: { visitor: visitor.name, unit: unitId, purpose }
        });
        
        // Notificar a los residentes
        await this.notifyResidents(visit.id, tx);
        
        return visit;
      });
    } catch (error) {
      console.error('Error al registrar visita:', error);
      throw error;
    }
  }

  /**
   * Notifica a los residentes sobre una visita
   */
  async notifyResidents(visitId: string, prismaClient?: any): Promise<void> {
    const tx = prismaClient || this.prisma;
    
    try {
      // Obtener información de la visita
      const visit = await tx.visit.findUnique({
        where: { id: visitId },
        include: {
          visitor: {
            include: { type: true }
          },
          unit: true
        }
      });
      
      if (!visit) {
        throw new Error(`Visita con ID ${visitId} no encontrada`);
      }
      
      // Obtener residentes de la unidad
      const unit = await tx.unit.findUnique({
        where: { id: visit.unitId }
      });
      
      if (!unit || !unit.residents || unit.residents.length === 0) {
        console.warn(`No se encontraron residentes para la unidad ${visit.unitId}`);
        return;
      }
      
      // Obtener preferencias de citofonía de los residentes
      for (const residentId of unit.residents) {
        const preferences = await tx.userIntercomPreference.findUnique({
          where: { userId: residentId }
        });
        
        // Si no hay preferencias o el tipo de visitante está en la lista de auto-aprobación
        if (!preferences) continue;
        
        // Verificar si el tipo de visitante requiere notificación
        if (!preferences.notifyAllVisitors && 
            preferences.allowedVisitorTypes.includes(visit.visitor.typeId)) {
          continue;
        }
        
        // Verificar si estamos en horas de silencio
        if (this.isQuietHours(preferences)) {
          continue;
        }
        
        // Verificar si el tipo de visitante tiene aprobación automática
        if (preferences.autoApproveTypes.includes(visit.visitor.typeId)) {
          await this.approveVisit(visitId, residentId);
          continue;
        }
        
        // Enviar notificaciones según preferencias
        if (preferences.whatsappEnabled && preferences.whatsappNumber) {
          await this.queueNotification({
            visitId,
            userId: residentId,
            channel: NotificationChannel.WHATSAPP,
            to: preferences.whatsappNumber,
            visitor: visit.visitor,
            unit: visit.unit,
            purpose: visit.purpose
          });
        }
        
        if (preferences.telegramEnabled && preferences.telegramChatId) {
          await this.queueNotification({
            visitId,
            userId: residentId,
            channel: NotificationChannel.TELEGRAM,
            to: preferences.telegramChatId,
            visitor: visit.visitor,
            unit: visit.unit,
            purpose: visit.purpose
          });
        }
      }
      
      // Actualizar estado de la visita
      await tx.visit.update({
        where: { id: visitId },
        data: { status: VisitStatus.NOTIFIED }
      });
      
    } catch (error) {
      console.error('Error al notificar residentes:', error);
      throw error;
    }
  }

  /**
   * Verifica si estamos en horas de silencio para un usuario
   */
  private isQuietHours(preferences: any): boolean {
    if (!preferences.quietHoursStart || !preferences.quietHoursEnd) {
      return false;
    }
    
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    const [startHour, startMinute] = preferences.quietHoursStart.split(':').map(Number);
    const [endHour, endMinute] = preferences.quietHoursEnd.split(':').map(Number);
    
    const currentTime = currentHour * 60 + currentMinute;
    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;
    
    // Manejar caso donde el período cruza la medianoche
    if (startTime > endTime) {
      return currentTime >= startTime || currentTime < endTime;
    } else {
      return currentTime >= startTime && currentTime < endTime;
    }
  }

  /**
   * Encola una notificación para ser enviada
   */
  private async queueNotification(data: any): Promise<void> {
    try {
      // Crear registro de notificación en la base de datos
      const notification = await this.prisma.virtualIntercomNotification.create({
        data: {
          visitId: data.visitId,
          userId: data.userId,
          channel: data.channel,
          status: NotificationStatus.PENDING
        }
      });
      
      // Agregar a la cola de mensajes
      this.messageQueue.push({
        notificationId: notification.id,
        to: data.to,
        channel: data.channel,
        visitor: data.visitor,
        unit: data.unit,
        purpose: data.purpose
      });
      
      // Registrar actividad
      await this.logger.logActivity({
        module: 'intercom',
        action: 'queue_notification',
        entityId: notification.id,
        details: { channel: data.channel, userId: data.userId }
      });
    } catch (error) {
      console.error('Error al encolar notificación:', error);
    }
  }

  /**
   * Procesa la cola de mensajes pendientes
   */
  private async processMessageQueue(): Promise<void> {
    if (this.isProcessingQueue || this.messageQueue.length === 0) {
      return;
    }
    
    this.isProcessingQueue = true;
    
    try {
      // Obtener plantillas de mensajes
      const settings = await this.prisma.intercomSettings.findFirst();
      const templates = settings?.messageTemplates as any || {};
      
      // Procesar mensajes en cola
      while (this.messageQueue.length > 0) {
        const message = this.messageQueue.shift();
        
        // Obtener adaptador para el canal
        const adapter = this.adapters.get(message.channel);
        if (!adapter) {
          console.error(`No hay adaptador configurado para el canal ${message.channel}`);
          continue;
        }
        
        // Preparar mensaje según el canal
        const messageText = this.prepareMessage(message, templates);
        
        // Preparar opciones según el canal
        const options: any = {};
        
        if (message.channel === NotificationChannel.TELEGRAM) {
          options.buttons = [
            { text: '✅ Aprobar', payload: `approve_${message.notificationId}` },
            { text: '❌ Rechazar', payload: `reject_${message.notificationId}` }
          ];
        }
        
        if (message.visitor.photo) {
          options.mediaUrl = message.visitor.photo;
        }
        
        // Enviar mensaje
        const result = await adapter.sendMessage(message.to, messageText, options);
        
        // Actualizar estado de la notificación
        await this.prisma.virtualIntercomNotification.update({
          where: { id: message.notificationId },
          data: {
            status: result.success ? NotificationStatus.SENT : NotificationStatus.FAILED,
            messageId: result.messageId,
            errorMessage: result.error
          }
        });
        
        // Registrar actividad
        await this.logger.logActivity({
          module: 'intercom',
          action: result.success ? 'notification_sent' : 'notification_failed',
          entityId: message.notificationId,
          details: { channel: message.channel, success: result.success }
        });
      }
    } catch (error) {
      console.error('Error al procesar cola de mensajes:', error);
    } finally {
      this.isProcessingQueue = false;
    }
  }

  /**
   * Prepara el mensaje según la plantilla y los datos
   */
  private prepareMessage(data: any, templates: any): string {
    const { visitor, unit, purpose } = data;
    const channel = data.channel;
    
    // Obtener plantilla según el canal
    let template = templates[channel]?.visitor_notification || 
                  '¡Hola! Tienes un visitante: {{visitor.name}} para {{unit.number}}. Motivo: {{purpose}}';
    
    // Reemplazar variables en la plantilla
    return template
      .replace(/{{visitor\.name}}/g, visitor.name)
      .replace(/{{visitor\.type}}/g, visitor.type.name)
      .replace(/{{unit\.number}}/g, unit.number)
      .replace(/{{purpose}}/g, purpose);
  }

  /**
   * Procesa un webhook recibido de un proveedor de mensajería
   */
  async processWebhook(channel: NotificationChannel, payload: any, signature?: string): Promise<any> {
    try {
      // Obtener adaptador para el canal
      const adapter = this.adapters.get(channel);
      if (!adapter) {
        throw new Error(`No hay adaptador configurado para el canal ${channel}`);
      }
      
      // Verificar autenticidad del webhook
      if (!adapter.verifyWebhook(payload, signature)) {
        throw new Error('Verificación de webhook fallida');
      }
      
      // Parsear respuesta
      const event = adapter.parseResponse(payload);
      
      // Procesar según el tipo de evento
      if (event.type === 'button' && event.buttonPayload) {
        // Es una respuesta de botón (Telegram)
        const [action, notificationId] = event.buttonPayload.split('_');
        
        if (action === 'approve') {
          await this.processApproval(notificationId);
        } else if (action === 'reject') {
          await this.processRejection(notificationId);
        }
      } else if (event.type === 'text') {
        // Es un mensaje de texto (WhatsApp o Telegram)
        // Buscar notificación pendiente para este remitente
        const notification = await this.findPendingNotification(channel, event.from);
        
        if (notification) {
          // Procesar respuesta según el texto
          const text = event.text.toLowerCase().trim();
          
          if (text.includes('si') || text.includes('sí') || text.includes('aprobar') || 
              text.includes('aceptar') || text === '1') {
            await this.processApproval(notification.id);
          } else if (text.includes('no') || text.includes('rechazar') || 
                    text.includes('denegar') || text === '2') {
            await this.processRejection(notification.id);
          } else {
            // Respuesta no reconocida, guardar como personalizada
            await this.processCustomResponse(notification.id, event.text);
          }
        }
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error al procesar webhook:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Busca una notificación pendiente para un remitente
   */
  private async findPendingNotification(channel: NotificationChannel, from: string): Promise<any> {
    try {
      // Buscar usuario por número de WhatsApp o chat ID de Telegram
      const userPreference = await this.prisma.userIntercomPreference.findFirst({
        where: channel === NotificationChannel.WHATSAPP
          ? { whatsappNumber: from }
          : { telegramChatId: from }
      });
      
      if (!userPreference) return null;
      
      // Buscar notificación pendiente para este usuario
      const notification = await this.prisma.virtualIntercomNotification.findFirst({
        where: {
          userId: userPreference.userId,
          channel,
          status: {
            in: [NotificationStatus.SENT, NotificationStatus.DELIVERED, NotificationStatus.READ]
          }
        },
        orderBy: {
          sentAt: 'desc'
        },
        include: {
          visit: true
        }
      });
      
      return notification;
    } catch (error) {
      console.error('Error al buscar notificación pendiente:', error);
      return null;
    }
  }

  /**
   * Procesa una aprobación de visita
   */
  private async processApproval(notificationId: string): Promise<void> {
    try {
      // Obtener notificación
      const notification = await this.prisma.virtualIntercomNotification.findUnique({
        where: { id: notificationId },
        include: { visit: true }
      });
      
      if (!notification) {
        throw new Error(`Notificación con ID ${notificationId} no encontrada`);
      }
      
      // Actualizar notificación
      await this.prisma.virtualIntercomNotification.update({
        where: { id: notificationId },
        data: {
          status: NotificationStatus.RESPONDED,
          respondedAt: new Date(),
          response: 'Aprobado',
          responseType: ResponseType.APPROVE
        }
      });
      
      // Aprobar visita
      await this.approveVisit(notification.visitId, notification.userId);
      
    } catch (error) {
      console.error('Error al procesar aprobación:', error);
    }
  }

  /**
   * Procesa un rechazo de visita
   */
  private async processRejection(notificationId: string): Promise<void> {
    try {
      // Obtener notificación
      const notification = await this.prisma.virtualIntercomNotification.findUnique({
        where: { id: notificationId },
        include: { visit: true }
      });
      
      if (!notification) {
        throw new Error(`Notificación con ID ${notificationId} no encontrada`);
      }
      
      // Actualizar notificación
      await this.prisma.virtualIntercomNotification.update({
        where: { id: notificationId },
        data: {
          status: NotificationStatus.RESPONDED,
          respondedAt: new Date(),
          response: 'Rechazado',
          responseType: ResponseType.REJECT
        }
      });
      
      // Rechazar visita
      await this.rejectVisit(notification.visitId, notification.userId);
      
    } catch (error) {
      console.error('Error al procesar rechazo:', error);
    }
  }

  /**
   * Procesa una respuesta personalizada
   */
  private async processCustomResponse(notificationId: string, response: string): Promise<void> {
    try {
      // Actualizar notificación
      await this.prisma.virtualIntercomNotification.update({
        where: { id: notificationId },
        data: {
          status: NotificationStatus.RESPONDED,
          respondedAt: new Date(),
          response,
          responseType: ResponseType.CUSTOM
        }
      });
      
      // Registrar actividad
      await this.logger.logActivity({
        module: 'intercom',
        action: 'custom_response',
        entityId: notificationId,
        details: { response }
      });
      
    } catch (error) {
      console.error('Error al procesar respuesta personalizada:', error);
    }
  }

  /**
   * Aprueba una visita
   */
  async approveVisit(visitId: string, userId: number): Promise<void> {
    try {
      // Actualizar estado de la visita
      await this.prisma.visit.update({
        where: { id: visitId },
        data: {
          status: VisitStatus.APPROVED,
          authorizedBy: userId
        }
      });
      
      // Registrar actividad
      await this.logger.logActivity({
        module: 'intercom',
        action: 'approve_visit',
        entityId: visitId,
        details: { userId }
      });
      
    } catch (error) {
      console.error('Error al aprobar visita:', error);
      throw error;
    }
  }

  /**
   * Rechaza una visita
   */
  async rejectVisit(visitId: string, userId: number): Promise<void> {
    try {
      // Actualizar estado de la visita
      await this.prisma.visit.update({
        where: { id: visitId },
        data: {
          status: VisitStatus.REJECTED,
          authorizedBy: userId
        }
      });
      
      // Registrar actividad
      await this.logger.logActivity({
        module: 'intercom',
        action: 'reject_visit',
        entityId: visitId,
        details: { userId }
      });
      
    } catch (error) {
      console.error('Error al rechazar visita:', error);
      throw error;
    }
  }

  /**
   * Registra la entrada de un visitante
   */
  async registerEntry(visitId: string): Promise<void> {
    try {
      // Verificar que la visita esté aprobada
      const visit = await this.prisma.visit.findUnique({
        where: { id: visitId }
      });
      
      if (!visit) {
        throw new Error(`Visita con ID ${visitId} no encontrada`);
      }
      
      if (visit.status !== VisitStatus.APPROVED) {
        throw new Error(`La visita con ID ${visitId} no está aprobada`);
      }
      
      // Actualizar estado de la visita
      await this.prisma.visit.update({
        where: { id: visitId },
        data: {
          status: VisitStatus.IN_PROGRESS,
          entryTime: new Date()
        }
      });
      
      // Registrar actividad
      await this.logger.logActivity({
        module: 'intercom',
        action: 'register_entry',
        entityId: visitId,
        details: {}
      });
      
    } catch (error) {
      console.error('Error al registrar entrada:', error);
      throw error;
    }
  }

  /**
   * Registra la salida de un visitante
   */
  async registerExit(visitId: string): Promise<void> {
    try {
      // Verificar que la visita esté en progreso
      const visit = await this.prisma.visit.findUnique({
        where: { id: visitId }
      });
      
      if (!visit) {
        throw new Error(`Visita con ID ${visitId} no encontrada`);
      }
      
      if (visit.status !== VisitStatus.IN_PROGRESS) {
        throw new Error(`La visita con ID ${visitId} no está en progreso`);
      }
      
      // Actualizar estado de la visita
      await this.prisma.visit.update({
        where: { id: visitId },
        data: {
          status: VisitStatus.COMPLETED,
          exitTime: new Date()
        }
      });
      
      // Registrar actividad
      await this.logger.logActivity({
        module: 'intercom',
        action: 'register_exit',
        entityId: visitId,
        details: {}
      });
      
    } catch (error) {
      console.error('Error al registrar salida:', error);
      throw error;
    }
  }

  /**
   * Obtiene el historial de visitas para una unidad
   */
  async getVisitHistory(unitId: number, options: any = {}): Promise<any[]> {
    const { status, startDate, endDate, page = 1, pageSize = 10 } = options;
    
    try {
      // Construir filtros
      const where: any = { unitId };
      
      if (status) {
        where.status = status;
      }
      
      if (startDate || endDate) {
        where.createdAt = {};
        
        if (startDate) {
          where.createdAt.gte = new Date(startDate);
        }
        
        if (endDate) {
          where.createdAt.lte = new Date(endDate);
        }
      }
      
      // Obtener visitas
      const visits = await this.prisma.visit.findMany({
        where,
        include: {
          visitor: {
            include: { type: true }
          },
          notifications: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: (page - 1) * pageSize,
        take: pageSize
      });
      
      // Obtener total de registros para paginación
      const total = await this.prisma.visit.count({ where });
      
      return {
        data: visits,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize)
        }
      };
    } catch (error) {
      console.error('Error al obtener historial de visitas:', error);
      throw error;
    }
  }

  /**
   * Actualiza las preferencias de citofonía de un usuario
   */
  async updateUserPreferences(userId: number, preferences: any): Promise<any> {
    try {
      // Verificar si ya existen preferencias
      const existing = await this.prisma.userIntercomPreference.findUnique({
        where: { userId }
      });
      
      if (existing) {
        // Actualizar preferencias existentes
        return await this.prisma.userIntercomPreference.update({
          where: { userId },
          data: preferences
        });
      } else {
        // Crear nuevas preferencias
        return await this.prisma.userIntercomPreference.create({
          data: {
            userId,
            ...preferences
          }
        });
      }
    } catch (error) {
      console.error('Error al actualizar preferencias de usuario:', error);
      throw error;
    }
  }

  /**
   * Actualiza la configuración general del sistema de citofonía
   */
  async updateSettings(settings: any): Promise<any> {
    try {
      // Obtener configuración actual
      const current = await this.prisma.intercomSettings.findFirst();
      
      if (current) {
        // Actualizar configuración existente
        const updated = await this.prisma.intercomSettings.update({
          where: { id: current.id },
          data: settings
        });
        
        // Reinicializar adaptadores
        await this.initializeAdapters();
        
        return updated;
      } else {
        // Crear nueva configuración
        const created = await this.prisma.intercomSettings.create({
          data: settings
        });
        
        // Reinicializar adaptadores
        await this.initializeAdapters();
        
        return created;
      }
    } catch (error) {
      console.error('Error al actualizar configuración:', error);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas del sistema de citofonía
   */
  async getStatistics(options: any = {}): Promise<any> {
    const { startDate, endDate } = options;
    
    try {
      // Construir filtros de fecha
      const dateFilter: any = {};
      
      if (startDate) {
        dateFilter.gte = new Date(startDate);
      }
      
      if (endDate) {
        dateFilter.lte = new Date(endDate);
      }
      
      // Estadísticas de visitas
      const visitStats = await this.prisma.$transaction([
        // Total de visitas
        this.prisma.visit.count({
          where: dateFilter.gte || dateFilter.lte ? { createdAt: dateFilter } : {}
        }),
        
        // Visitas por estado
        this.prisma.visit.groupBy({
          by: ['status'],
          _count: true,
          where: dateFilter.gte || dateFilter.lte ? { createdAt: dateFilter } : {}
        }),
        
        // Tiempo promedio de respuesta (en segundos)
        this.prisma.virtualIntercomNotification.aggregate({
          _avg: {
            retries: true
          },
          where: {
            status: NotificationStatus.RESPONDED,
            sentAt: dateFilter.gte || dateFilter.lte ? dateFilter : {}
          }
        })
      ]);
      
      // Estadísticas de notificaciones
      const notificationStats = await this.prisma.$transaction([
        // Notificaciones por canal
        this.prisma.virtualIntercomNotification.groupBy({
          by: ['channel'],
          _count: true,
          where: dateFilter.gte || dateFilter.lte ? { sentAt: dateFilter } : {}
        }),
        
        // Notificaciones por estado
        this.prisma.virtualIntercomNotification.groupBy({
          by: ['status'],
          _count: true,
          where: dateFilter.gte || dateFilter.lte ? { sentAt: dateFilter } : {}
        })
      ]);
      
      // Formatear resultados
      const visitByStatus = visitStats[1].reduce((acc: any, item: any) => {
        acc[item.status] = item._count;
        return acc;
      }, {});
      
      const notificationByChannel = notificationStats[0].reduce((acc: any, item: any) => {
        acc[item.channel] = item._count;
        return acc;
      }, {});
      
      const notificationByStatus = notificationStats[1].reduce((acc: any, item: any) => {
        acc[item.status] = item._count;
        return acc;
      }, {});
      
      return {
        visits: {
          total: visitStats[0],
          byStatus: visitByStatus
        },
        notifications: {
          byChannel: notificationByChannel,
          byStatus: notificationByStatus
        },
        performance: {
          avgRetries: visitStats[2]._avg.retries || 0
        }
      };
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      throw error;
    }
  }
}

// Exportar instancia del servicio
export const intercomService = new IntercomService();
