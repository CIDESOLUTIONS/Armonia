/**
 * Servicio para la gestión de notificaciones del sistema PQR
 * 
 * Este servicio maneja todas las notificaciones relacionadas con PQRs,
 * incluyendo cambios de estado, recordatorios y encuestas de satisfacción.
 */

import { PrismaClient } from '@prisma/client';
import { getSchemaFromRequest } from '../../lib/prisma';
import { sendEmail } from '../../lib/communications/email-service';
import { sendPushNotification } from '../../lib/communications/push-notification-service';
import { sendSMS } from '../../lib/communications/sms-service';
import { PQRStatus, PQRNotificationTemplate } from '../../lib/constants/pqr-constants';

/**
 * Clase que implementa el servicio de notificaciones para PQRs
 */
export class PQRNotificationService {
  private prisma: PrismaClient;
  private schema: string;
  private notificationTemplates: Record<string, { subject: string, content: string }>;

  /**
   * Constructor del servicio
   * @param schema Esquema de base de datos a utilizar
   */
  constructor(schema: string = 'public') {
    this.schema = schema;
    this.prisma = getSchemaFromRequest(schema);
    
    // Inicializar plantillas de notificación predeterminadas
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
      // Verificar si las notificaciones automáticas están habilitadas
      const settings = await this.prisma.$queryRaw`
        SELECT auto_notify_enabled as "autoNotifyEnabled"
        FROM pqr_settings
        WHERE schema_name = ${this.schema}
        LIMIT 1
      `;

      if (!settings || !settings[0] || !settings[0].autoNotifyEnabled) {
        return false;
      }

      // Obtener información del PQR
      const pqr = await this.prisma.pQR.findUnique({
        where: { id: pqrId }
      });

      if (!pqr) {
        return false;
      }

      // Obtener información del usuario que reportó
      const reporter = await this.prisma.user.findUnique({
        where: { id: pqr.userId }
      });

      // Obtener información del usuario asignado (si existe)
      let assignee = null;
      if (pqr.assignedToId) {
        assignee = await this.prisma.user.findUnique({
          where: { id: pqr.assignedToId }
        });
      }

      // Obtener plantilla de notificación
      const template = await this.getNotificationTemplate(newStatus, previousStatus);

      // Preparar datos para la plantilla
      const templateData = {
        ticketNumber: pqr.ticketNumber,
        title: pqr.title,
        status: newStatus,
        previousStatus: previousStatus || 'NUEVO',
        dueDate: pqr.dueDate ? new Date(pqr.dueDate).toLocaleDateString() : 'No definida',
        comment: comment || ''
      };

      // Enviar notificación al usuario que reportó
      if (reporter) {
        // Personalizar para el usuario que reportó
        const reporterData = {
          ...templateData,
          recipientName: reporter.name
        };

        // Enviar email
        await sendEmail({
          to: reporter.email,
          subject: this.replaceTemplateVars(template.subject, reporterData),
          html: this.replaceTemplateVars(template.content, reporterData)
        });

        // Enviar notificación push
        await sendPushNotification({
          userId: reporter.id,
          title: `PQR ${pqr.ticketNumber}: ${newStatus}`,
          body: this.replaceTemplateVars(template.content, reporterData),
          data: {
            pqrId: pqr.id.toString(),
            status: newStatus
          }
        });

        // Registrar notificación
        await this.prisma.pQRNotification.create({
          data: {
            pqrId,
            userId: reporter.id,
            type: 'STATUS_CHANGE',
            title: `Cambio de estado: ${previousStatus || 'NUEVO'} → ${newStatus}`,
            content: comment || '',
            sentAt: new Date()
          }
        });
      }

      // Enviar notificación al usuario asignado (si existe)
      if (assignee) {
        // Personalizar para el usuario asignado
        const assigneeData = {
          ...templateData,
          recipientName: assignee.name
        };

        // Enviar email
        await sendEmail({
          to: assignee.email,
          subject: this.replaceTemplateVars(template.subject, assigneeData),
          html: this.replaceTemplateVars(template.content, assigneeData)
        });

        // Enviar notificación push
        await sendPushNotification({
          userId: assignee.id,
          title: `PQR ${pqr.ticketNumber}: ${newStatus}`,
          body: this.replaceTemplateVars(template.content, assigneeData),
          data: {
            pqrId: pqr.id.toString(),
            status: newStatus
          }
        });

        // Registrar notificación
        await this.prisma.pQRNotification.create({
          data: {
            pqrId,
            userId: assignee.id,
            type: 'STATUS_CHANGE',
            title: `Cambio de estado: ${previousStatus || 'NUEVO'} → ${newStatus}`,
            content: comment || '',
            sentAt: new Date()
          }
        });
      }

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
      // Obtener PQRs que vencen en las próximas 24 horas
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const pqrs = await this.prisma.pQR.findMany({
        where: {
          status: {
            in: [PQRStatus.OPEN, PQRStatus.ASSIGNED, PQRStatus.IN_PROGRESS]
          },
          dueDate: {
            gte: now,
            lte: tomorrow
          }
        }
      });

      let reminderCount = 0;

      // Enviar recordatorios para cada PQR
      for (const pqr of pqrs) {
        // Obtener información del usuario que reportó
        const reporter = await this.prisma.user.findUnique({
          where: { id: pqr.userId }
        });

        // Obtener información del usuario asignado (si existe)
        let assignee = null;
        if (pqr.assignedToId) {
          assignee = await this.prisma.user.findUnique({
            where: { id: pqr.assignedToId }
          });
        }

        // Preparar datos para la plantilla
        const templateData = {
          ticketNumber: pqr.ticketNumber,
          title: pqr.title,
          status: pqr.status,
          dueDate: pqr.dueDate ? new Date(pqr.dueDate).toLocaleDateString() : 'No definida',
          hoursRemaining: Math.round((pqr.dueDate.getTime() - now.getTime()) / 3600000)
        };

        // Enviar recordatorio al usuario asignado (si existe)
        if (assignee) {
          // Personalizar para el usuario asignado
          const assigneeData = {
            ...templateData,
            recipientName: assignee.name
          };

          // Enviar email
          await sendEmail({
            to: assignee.email,
            subject: `Recordatorio: PQR ${pqr.ticketNumber} vence pronto`,
            html: `
              <p>Hola ${assignee.name},</p>
              <p>El PQR <strong>${pqr.ticketNumber}: ${pqr.title}</strong> vence en <strong>${templateData.hoursRemaining} horas</strong>.</p>
              <p>Por favor, toma las acciones necesarias para resolverlo antes de la fecha límite.</p>
            `
          });

          // Enviar notificación push
          await sendPushNotification({
            userId: assignee.id,
            title: `Recordatorio: PQR ${pqr.ticketNumber} vence pronto`,
            body: `El PQR vence en ${templateData.hoursRemaining} horas. Por favor, toma las acciones necesarias.`,
            data: {
              pqrId: pqr.id.toString(),
              status: pqr.status
            }
          });

          // Registrar notificación
          await this.prisma.pQRNotification.create({
            data: {
              pqrId: pqr.id,
              userId: assignee.id,
              type: 'DUE_DATE_REMINDER',
              title: `Recordatorio de vencimiento: ${templateData.hoursRemaining} horas restantes`,
              content: `El PQR ${pqr.ticketNumber} vence el ${templateData.dueDate}`,
              sentAt: new Date()
            }
          });

          reminderCount++;
        }
      }

      return reminderCount;
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
      // Obtener información del PQR
      const pqr = await this.prisma.pQR.findUnique({
        where: { id: pqrId }
      });

      if (!pqr || pqr.status !== PQRStatus.RESOLVED) {
        return false;
      }

      // Verificar si las encuestas de satisfacción están habilitadas
      const settings = await this.prisma.$queryRaw`
        SELECT satisfaction_survey_enabled as "satisfactionSurveyEnabled"
        FROM pqr_settings
        WHERE schema_name = ${this.schema}
        LIMIT 1
      `;

      if (!settings || !settings[0] || !settings[0].satisfactionSurveyEnabled) {
        return false;
      }

      // Obtener información del usuario que reportó
      const reporter = await this.prisma.user.findUnique({
        where: { id: pqr.userId }
      });

      if (!reporter) {
        return false;
      }

      // Generar URL de la encuesta
      const surveyUrl = `https://armonia.app/survey/${pqr.id}?token=${this.generateSurveyToken(pqr.id, reporter.id)}`;

      // Enviar email
      await sendEmail({
        to: reporter.email,
        subject: `Encuesta de satisfacción: PQR ${pqr.ticketNumber}`,
        html: `
          <p>Hola ${reporter.name},</p>
          <p>Tu solicitud <strong>${pqr.ticketNumber}: ${pqr.title}</strong> ha sido resuelta.</p>
          <p>Nos gustaría conocer tu opinión sobre la atención recibida. Por favor, completa la siguiente encuesta de satisfacción:</p>
          <p><a href="${surveyUrl}" style="padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Completar encuesta</a></p>
          <p>Tu opinión es muy importante para nosotros y nos ayuda a mejorar nuestro servicio.</p>
        `
      });

      // Enviar notificación push
      await sendPushNotification({
        userId: reporter.id,
        title: `Encuesta de satisfacción: PQR ${pqr.ticketNumber}`,
        body: `Tu solicitud ha sido resuelta. Por favor, completa la encuesta de satisfacción.`,
        data: {
          pqrId: pqr.id.toString(),
          status: pqr.status,
          surveyUrl
        }
      });

      // Registrar notificación
      await this.prisma.pQRNotification.create({
        data: {
          pqrId: pqr.id,
          userId: reporter.id,
          type: 'SATISFACTION_SURVEY',
          title: `Encuesta de satisfacción: PQR ${pqr.ticketNumber}`,
          content: `Por favor, completa la encuesta de satisfacción para el PQR resuelto.`,
          sentAt: new Date()
        }
      });

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
  private async getNotificationTemplate(newStatus: string, previousStatus?: string) {
    try {
      // Intentar obtener plantilla personalizada
      const templateName = previousStatus 
        ? `status_change_${previousStatus}_to_${newStatus}`
        : `status_change_to_${newStatus}`;
      
      const customTemplate = await this.prisma.$queryRaw`
        SELECT name, subject, content
        FROM notification_templates
        WHERE schema_name = ${this.schema}
        AND name = ${templateName}
        LIMIT 1
      `;

      if (customTemplate && customTemplate.length > 0) {
        return {
          subject: customTemplate[0].subject,
          content: customTemplate[0].content
        };
      }

      // Usar plantilla predeterminada según el estado
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
    } catch (error) {
      console.error('Error al obtener plantilla de notificación:', error);
      return this.notificationTemplates['DEFAULT'];
    }
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
