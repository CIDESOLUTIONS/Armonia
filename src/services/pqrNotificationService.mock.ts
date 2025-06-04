/**
 * Mock del servicio para la gestión de notificaciones del sistema PQR
 * 
 * Este servicio mockea todas las notificaciones relacionadas con PQRs,
 * incluyendo cambios de estado, recordatorios y encuestas de satisfacción.
 */

// Importar constantes desde nuestro archivo local en lugar de @prisma/client
import { PQRStatus, PQRNotificationTemplate } from '../lib/constants/pqr-constants';
import { sendEmail } from '../lib/communications/email-service';
import { sendPushNotification } from '../lib/communications/push-notification-service';

/**
 * Clase que implementa el mock del servicio de notificaciones para PQRs
 */
export class PQRNotificationService {
  private schema: string;
  private notificationTemplates: Record<string, { subject: string, content: string }>;

  /**
   * Constructor del servicio
   * @param schema Esquema de base de datos a utilizar
   */
  constructor(schema: string = 'public') {
    this.schema = schema;
    
    // Inicializar plantillas de notificación mock
    this.notificationTemplates = {
      'STATUS_CHANGE_ASSIGNED': {
        subject: 'PQR {{ticketNumber}} asignado',
        content: '<p>Hola {{recipientName}},</p><p>El PQR <strong>{{ticketNumber}}: {{title}}</strong> ha sido asignado.</p>'
      },
      'STATUS_CHANGE_IN_PROGRESS': {
        subject: 'PQR {{ticketNumber}} en progreso',
        content: '<p>Hola {{recipientName}},</p><p>El PQR <strong>{{ticketNumber}}: {{title}}</strong> está siendo atendido.</p>'
      },
      'STATUS_CHANGE_RESOLVED': {
        subject: 'PQR {{ticketNumber}} resuelto',
        content: '<p>Hola {{recipientName}},</p><p>El PQR <strong>{{ticketNumber}}: {{title}}</strong> ha sido resuelto.</p>'
      },
      'STATUS_CHANGE_CLOSED': {
        subject: 'PQR {{ticketNumber}} cerrado',
        content: '<p>Hola {{recipientName}},</p><p>El PQR <strong>{{ticketNumber}}: {{title}}</strong> ha sido cerrado.</p>'
      },
      'STATUS_CHANGE_REOPENED': {
        subject: 'PQR {{ticketNumber}} reabierto',
        content: '<p>Hola {{recipientName}},</p><p>El PQR <strong>{{ticketNumber}}: {{title}}</strong> ha sido reabierto.</p>'
      },
      'DEFAULT': {
        subject: 'Actualización de PQR {{ticketNumber}}',
        content: '<p>Hola {{recipientName}},</p><p>El PQR <strong>{{ticketNumber}}: {{title}}</strong> ha sido actualizado.</p>'
      }
    };
  }

  /**
   * Notifica un cambio de estado en un PQR
   * @param pqrId ID del PQR
   * @param newStatus Nuevo estado
   * @param previousStatus Estado anterior (opcional)
   * @param changedById ID del usuario que realizó el cambio
   * @param comment Comentario opcional sobre el cambio
   * @returns true si la notificación fue enviada correctamente
   */
  async notifyStatusChange(
    pqrId: number,
    newStatus: string,
    previousStatus?: string,
    changedById?: number,
    comment?: string
  ): Promise<boolean> {
    try {
      // Simular obtención de datos del PQR
      const pqr = {
        id: pqrId,
        ticketNumber: `PQR-${pqrId}`,
        title: `Solicitud de prueba ${pqrId}`,
        status: newStatus,
        userId: 1,
        assignedToId: 2,
        dueDate: new Date(new Date().getTime() + 7 * 24 * 60 * 60000) // 7 días en el futuro
      };

      // Simular obtención de datos de usuarios
      const reporter = {
        id: 1,
        name: 'Usuario Reportante',
        email: 'reportante@ejemplo.com'
      };

      const assignee = {
        id: 2,
        name: 'Usuario Asignado',
        email: 'asignado@ejemplo.com'
      };

      // Obtener plantilla de notificación
      const template = this.getNotificationTemplate(newStatus, previousStatus);

      // Preparar datos para la plantilla
      const templateData = {
        ticketNumber: pqr.ticketNumber,
        title: pqr.title,
        status: newStatus,
        previousStatus: previousStatus || 'NUEVO',
        dueDate: pqr.dueDate ? pqr.dueDate.toLocaleDateString() : 'No definida',
        comment: comment || ''
      };

      // Enviar notificación al usuario que reportó
      const reporterData = {
        ...templateData,
        recipientName: reporter.name
      };

      // Enviar email (simulado)
      await sendEmail({
        to: reporter.email,
        subject: this.replaceTemplateVars(template.subject, reporterData),
        html: this.replaceTemplateVars(template.content, reporterData)
      });

      // Enviar notificación push (simulada)
      await sendPushNotification({
        userId: reporter.id,
        title: `PQR ${pqr.ticketNumber}: ${newStatus}`,
        body: this.replaceTemplateVars(template.content, reporterData),
        data: {
          pqrId: pqr.id.toString(),
          status: newStatus
        }
      });

      // Enviar notificación al usuario asignado
      const assigneeData = {
        ...templateData,
        recipientName: assignee.name
      };

      // Enviar email (simulado)
      await sendEmail({
        to: assignee.email,
        subject: this.replaceTemplateVars(template.subject, assigneeData),
        html: this.replaceTemplateVars(template.content, assigneeData)
      });

      // Enviar notificación push (simulada)
      await sendPushNotification({
        userId: assignee.id,
        title: `PQR ${pqr.ticketNumber}: ${newStatus}`,
        body: this.replaceTemplateVars(template.content, assigneeData),
        data: {
          pqrId: pqr.id.toString(),
          status: newStatus
        }
      });

      return true;
    } catch (error) {
      console.error('Error al enviar notificación de cambio de estado:', error);
      return false;
    }
  }

  /**
   * Envía recordatorios para PQRs próximos a vencer
   * @returns Número de recordatorios enviados
   */
  async sendDueDateReminders(): Promise<number> {
    try {
      // Simular envío de recordatorios para 3 PQRs
      return 3;
    } catch (error) {
      console.error('Error al enviar recordatorios de vencimiento:', error);
      return 0;
    }
  }

  /**
   * Envía una encuesta de satisfacción para un PQR resuelto
   * @param pqrId ID del PQR
   * @returns true si la encuesta fue enviada correctamente
   */
  async sendSatisfactionSurvey(pqrId: number): Promise<boolean> {
    try {
      // Simular envío de encuesta de satisfacción
      return true;
    } catch (error) {
      console.error('Error al enviar encuesta de satisfacción:', error);
      return false;
    }
  }

  /**
   * Obtiene la plantilla de notificación para un cambio de estado
   * @param newStatus Nuevo estado
   * @param previousStatus Estado anterior (opcional)
   * @returns Plantilla de notificación
   */
  private getNotificationTemplate(newStatus: string, previousStatus?: string) {
    // Determinar la clave de la plantilla según el estado
    let templateKey = 'DEFAULT';
    
    switch (newStatus) {
      case PQRStatus.ASSIGNED:
        templateKey = 'STATUS_CHANGE_ASSIGNED';
        break;
      case PQRStatus.IN_PROGRESS:
        templateKey = 'STATUS_CHANGE_IN_PROGRESS';
        break;
      case PQRStatus.RESOLVED:
        templateKey = 'STATUS_CHANGE_RESOLVED';
        break;
      case PQRStatus.CLOSED:
        templateKey = 'STATUS_CHANGE_CLOSED';
        break;
      case PQRStatus.REOPENED:
        templateKey = 'STATUS_CHANGE_REOPENED';
        break;
    }
    
    // Devolver la plantilla correspondiente o la predeterminada
    return this.notificationTemplates[templateKey] || this.notificationTemplates['DEFAULT'];
  }

  /**
   * Reemplaza variables en una plantilla
   * @param template Texto de la plantilla
   * @param data Datos para reemplazar
   * @returns Texto con variables reemplazadas
   */
  private replaceTemplateVars(template: string, data: Record<string, any>): string {
    if (!template) return '';
    
    let result = template;
    
    // Reemplazar variables simples {{variable}}
    for (const [key, value] of Object.entries(data)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, value?.toString() || '');
    }
    
    // Procesar condicionales {{#if variable}}...{{/if}}
    const conditionalRegex = /{{#if ([^}]+)}}([\s\S]*?){{\/if}}/g;
    result = result.replace(conditionalRegex, (match, condition, content) => {
      return data[condition] ? content : '';
    });
    
    return result;
  }

  /**
   * Genera un token para la encuesta de satisfacción
   * @param pqrId ID del PQR
   * @param userId ID del usuario
   * @returns Token generado
   */
  private generateSurveyToken(pqrId: number, userId: number): string {
    // Simular generación de token
    return `survey-token-${pqrId}-${userId}-${Date.now()}`;
  }
}

// Exportar el servicio
export default PQRNotificationService;
