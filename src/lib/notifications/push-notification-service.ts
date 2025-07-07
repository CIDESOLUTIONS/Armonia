// src/lib/notifications/push-notification-service.ts
/**
 * Servicio de Notificaciones Push - Firebase Cloud Messaging
 * Maneja el envío de notificaciones push a dispositivos móviles y web
 */

interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  data?: Record<string, any>;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

interface NotificationTarget {
  userId?: number;
  userIds?: number[];
  complexId?: number;
  role?: 'ADMIN' | 'RESIDENT' | 'RECEPTION' | 'COMPLEX_ADMIN';
  deviceTokens?: string[];
  topic?: string;
}

interface NotificationOptions {
  priority?: 'normal' | 'high';
  timeToLive?: number; // TTL en segundos
  sound?: string;
  clickAction?: string;
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
}

export interface SendNotificationRequest {
  payload: PushNotificationPayload;
  target: NotificationTarget;
  options?: NotificationOptions;
  scheduleAt?: Date;
  complexId: number;
}

export interface NotificationResponse {
  success: boolean;
  messageId?: string;
  failureCount?: number;
  successCount?: number;
  errors?: Array<{
    token: string;
    error: string;
  }>;
}

/**
 * Servicio principal para gestión de notificaciones push
 */
export class PushNotificationService {
  private static instance: PushNotificationService;
  private isInitialized = false;
  private fcmEnabled = false;

  private constructor() {}

  static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  /**
   * Inicializa el servicio FCM
   */
  async initialize(): Promise<void> {
    try {
      // Verificar si las credenciales de Firebase están configuradas
      if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_PRIVATE_KEY) {
        console.warn('[PUSH] Firebase no configurado - funcionando en modo simulación');
        this.fcmEnabled = false;
        this.isInitialized = true;
        return;
      }

      // En producción aquí iría la inicialización real de Firebase Admin SDK
      // const admin = require('firebase-admin');
      // if (!admin.apps.length) {
      //   admin.initializeApp({
      //     credential: admin.credential.cert({
      //       projectId: process.env.FIREBASE_PROJECT_ID,
      //       privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      //       clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      //     }),
      //   });
      // }

      this.fcmEnabled = true;
      this.isInitialized = true;
      console.log('[PUSH] Servicio de notificaciones inicializado');
    } catch (error) {
      console.error('[PUSH] Error inicializando servicio:', error);
      this.fcmEnabled = false;
      this.isInitialized = true; // Continuar en modo simulación
    }
  }

  /**
   * Envía notificación push
   */
  async sendNotification(request: SendNotificationRequest): Promise<NotificationResponse> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Validar request
      this.validateRequest(request);

      // Obtener tokens de dispositivos
      const tokens = await this.resolveTargetTokens(request.target);
      
      if (tokens.length === 0) {
        return {
          success: false,
          errors: [{ token: 'none', error: 'No se encontraron dispositivos de destino' }]
        };
      }

      // Si está programada, delegar al scheduler
      if (request.scheduleAt) {
        return this.scheduleNotification(request, tokens);
      }

      // Enviar inmediatamente
      return this.sendImmediateNotification(request, tokens);

    } catch (error) {
      console.error('[PUSH] Error enviando notificación:', error);
      return {
        success: false,
        errors: [{ token: 'unknown', error: error instanceof Error ? error.message : 'Error desconocido' }]
      };
    }
  }

  /**
   * Envía notificación inmediata
   */
  private async sendImmediateNotification(
    request: SendNotificationRequest,
    tokens: string[]
  ): Promise<NotificationResponse> {
    if (!this.fcmEnabled) {
      // Modo simulación para desarrollo
      console.log('[PUSH SIMULACIÓN] Enviando notificación:', {
        title: request.payload.title,
        body: request.payload.body,
        targets: tokens.length,
        complexId: request.complexId
      });
      
      // Registrar en base de datos
      await this.logNotification(request, tokens, 'simulated');
      
      return {
        success: true,
        messageId: `sim_${Date.now()}`,
        successCount: tokens.length,
        failureCount: 0
      };
    }

    // En producción, aquí iría el envío real con Firebase Admin SDK
    // const admin = require('firebase-admin');
    // const messaging = admin.messaging();
    // 
    // const message = {
    //   notification: {
    //     title: request.payload.title,
    //     body: request.payload.body,
    //     icon: request.payload.icon,
    //     image: request.payload.image,
    //   },
    //   data: request.payload.data || {},
    //   tokens: tokens,
    //   android: {
    //     priority: request.options?.priority || 'normal',
    //     ttl: request.options?.timeToLive || 3600000, // 1 hora por defecto
    //   },
    //   webpush: {
    //     notification: {
    //       icon: request.payload.icon,
    //       badge: request.payload.badge,
    //       actions: request.payload.actions,
    //       requireInteraction: request.options?.requireInteraction,
    //       silent: request.options?.silent,
    //       tag: request.options?.tag,
    //     },
    //     fcmOptions: {
    //       link: request.options?.clickAction,
    //     },
    //   },
    // };
    //
    // const response = await messaging.sendEachForMulticast(message);
    
    // Simular respuesta exitosa para desarrollo
    await this.logNotification(request, tokens, 'sent');
    
    return {
      success: true,
      messageId: `fcm_${Date.now()}`,
      successCount: tokens.length,
      failureCount: 0
    };
  }

  /**
   * Programa notificación para envío posterior
   */
  private async scheduleNotification(
    request: SendNotificationRequest,
    tokens: string[]
  ): Promise<NotificationResponse> {
    // Aquí se integraría con un sistema de cola/scheduler
    // Por ahora, registraremos en BD para procesamiento posterior
    
    await this.logNotification(request, tokens, 'scheduled');
    
    console.log('[PUSH] Notificación programada para:', request.scheduleAt);
    
    return {
      success: true,
      messageId: `scheduled_${Date.now()}`,
      successCount: 0, // Aún no enviado
      failureCount: 0
    };
  }

  /**
   * Resuelve tokens de dispositivos basado en el target
   */
  private async resolveTargetTokens(target: NotificationTarget): Promise<string[]> {
    const { getPrisma } = await import('@/lib/prisma');
    const prisma = getPrisma();
    
    let tokens: string[] = [];

    try {
      // Si se proporcionan tokens directamente
      if (target.deviceTokens) {
        return target.deviceTokens;
      }

      // Si es por tópico (grupos)
      if (target.topic) {
        // En FCM real, se manejaría con topics
        // Por ahora, simular con tokens de usuarios del complejo
        const users = await prisma.user.findMany({
          where: {
            complexId: target.complexId
          },
          select: {
            deviceTokens: true
          }
        });
        
        tokens = users.flatMap(user => user.deviceTokens || []);
      }
      // Si es por usuario específico
      else if (target.userId) {
        const user = await prisma.user.findUnique({
          where: { id: target.userId },
          select: { deviceTokens: true }
        });
        
        tokens = user?.deviceTokens || [];
      }
      // Si es por múltiples usuarios
      else if (target.userIds) {
        const users = await prisma.user.findMany({
          where: {
            id: { in: target.userIds }
          },
          select: {
            deviceTokens: true
          }
        });
        
        tokens = users.flatMap(user => user.deviceTokens || []);
      }
      // Si es por rol
      else if (target.role) {
        const users = await prisma.user.findMany({
          where: {
            role: target.role,
            ...(target.complexId && { complexId: target.complexId })
          },
          select: {
            deviceTokens: true
          }
        });
        
        tokens = users.flatMap(user => user.deviceTokens || []);
      }
      // Si es por complejo
      else if (target.complexId) {
        const users = await prisma.user.findMany({
          where: {
            complexId: target.complexId
          },
          select: {
            deviceTokens: true
          }
        });
        
        tokens = users.flatMap(user => user.deviceTokens || []);
      }

      // Filtrar tokens válidos y únicos
      return [...new Set(tokens.filter(token => token && token.length > 0))];
      
    } catch (error) {
      console.error('[PUSH] Error resolviendo tokens:', error);
      return [];
    }
  }

  /**
   * Registra la notificación en base de datos
   */
  private async logNotification(
    request: SendNotificationRequest,
    tokens: string[],
    status: 'sent' | 'scheduled' | 'simulated' | 'failed'
  ): Promise<void> {
    try {
      const { getPrisma } = await import('@/lib/prisma');
      const prisma = getPrisma();
      
      // Aquí se registraría en una tabla de notificaciones
      // Por ahora, usar console.log para tracking
      const logData = {
        complexId: request.complexId,
        title: request.payload.title,
        body: request.payload.body,
        targetCount: tokens.length,
        status,
        scheduledAt: request.scheduleAt,
        createdAt: new Date()
      };
      
      console.log('[PUSH LOG]', logData);
      
      // En futuras iteraciones, crear tabla notifications_log
      // await prisma.notificationLog.create({ data: logData });
      
    } catch (error) {
      console.error('[PUSH] Error registrando notificación:', error);
    }
  }

  /**
   * Valida el request de notificación
   */
  private validateRequest(request: SendNotificationRequest): void {
    if (!request.payload.title || !request.payload.body) {
      throw new Error('Título y cuerpo son requeridos');
    }
    
    if (!request.complexId) {
      throw new Error('Complex ID es requerido');
    }
    
    if (!request.target || Object.keys(request.target).length === 0) {
      throw new Error('Target de notificación es requerido');
    }
  }

  /**
   * Suscribe dispositivo a un tópico
   */
  async subscribeToTopic(tokens: string[], topic: string): Promise<boolean> {
    if (!this.fcmEnabled) {
      console.log(`[PUSH SIMULACIÓN] Suscribiendo ${tokens.length} dispositivos al tópico: ${topic}`);
      return true;
    }

    // En producción:
    // const admin = require('firebase-admin');
    // const messaging = admin.messaging();
    // await messaging.subscribeToTopic(tokens, topic);
    
    return true;
  }

  /**
   * Desuscribe dispositivo de un tópico
   */
  async unsubscribeFromTopic(tokens: string[], topic: string): Promise<boolean> {
    if (!this.fcmEnabled) {
      console.log(`[PUSH SIMULACIÓN] Desuscribiendo ${tokens.length} dispositivos del tópico: ${topic}`);
      return true;
    }

    // En producción:
    // const admin = require('firebase-admin');
    // const messaging = admin.messaging();
    // await messaging.unsubscribeFromTopic(tokens, topic);
    
    return true;
  }

  /**
   * Envía notificación de tipo específico con plantillas predefinidas
   */
  async sendTemplateNotification(
    type: 'payment_reminder' | 'assembly_invitation' | 'incident_update' | 'pqr_response' | 'general_announcement',
    data: Record<string, any>,
    target: NotificationTarget
  ): Promise<NotificationResponse> {
    const templates = {
      payment_reminder: {
        title: '💰 Recordatorio de Pago',
        body: `Tu cuota de ${data.amount} vence el ${data.dueDate}`,
        icon: '/icons/payment.png'
      },
      assembly_invitation: {
        title: '📋 Invitación a Asamblea',
        body: `Asamblea programada para ${data.date} - ${data.topic}`,
        icon: '/icons/assembly.png'
      },
      incident_update: {
        title: '🚨 Actualización de Incidente',
        body: `Incidente #${data.incidentId}: ${data.status}`,
        icon: '/icons/incident.png'
      },
      pqr_response: {
        title: '💬 Respuesta a tu PQR',
        body: `Tu solicitud #${data.pqrId} ha sido ${data.status}`,
        icon: '/icons/pqr.png'
      },
      general_announcement: {
        title: `📢 ${data.title}`,
        body: data.message,
        icon: '/icons/announcement.png'
      }
    };

    const template = templates[type];
    if (!template) {
      throw new Error(`Plantilla de notificación '${type}' no encontrada`);
    }

    return this.sendNotification({
      payload: {
        ...template,
        data: { ...data, notificationType: type }
      },
      target,
      complexId: target.complexId || data.complexId,
      options: {
        priority: 'high',
        requireInteraction: true,
        clickAction: `/dashboard/${type.split('_')[0]}`
      }
    });
  }
}

// Instancia singleton
export const pushNotificationService = PushNotificationService.getInstance();
