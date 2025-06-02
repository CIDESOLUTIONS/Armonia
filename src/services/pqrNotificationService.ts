/**
 * Servicio para la gestión de notificaciones de estado en el sistema PQR
 * 
 * Este servicio implementa la lógica para enviar notificaciones automáticas
 * cuando cambia el estado de una solicitud PQR, utilizando plantillas
 * personalizables y múltiples canales de comunicación.
 */

import { PrismaClient, PQRStatus, PQR } from '@prisma/client';
import { getSchemaFromRequest } from '@/lib/prisma';
import { sendEmail } from '@/lib/communications/email-service';
import { sendPushNotification } from '@/lib/communications/push-notification-service';
import { sendSMS } from '@/lib/communications/sms-service';

// Interfaz para datos de notificación
export interface PQRNotificationData {
  pqrId: number;
  ticketNumber: string;
  title: string;
  status: PQRStatus;
  previousStatus?: PQRStatus;
  recipientId: number;
  recipientEmail?: string;
  recipientName: string;
  recipientRole: string;
  comment?: string;
  dueDate?: Date;
}

// Interfaz para plantilla de notificación
interface NotificationTemplate {
  subject: string;
  content: string;
}

/**
 * Clase principal del servicio de notificaciones de PQR
 */
export class PQRNotificationService {
  private prisma: PrismaClient;
  private schema: string;

  constructor(schema: string) {
    this.prisma = new PrismaClient();
    this.schema = schema;
  }

  /**
   * Envía notificaciones cuando cambia el estado de un PQR
   */
  async notifyStatusChange(
    pqrId: number,
    newStatus: PQRStatus,
    previousStatus: PQRStatus,
    changedById: number,
    comment?: string
  ): Promise<boolean> {
    try {
      // 1. Obtener datos del PQR
      const pqr = await this.prisma.pQR.findUnique({
        where: { id: pqrId }
      });

      if (!pqr) {
        throw new Error(`PQR con ID ${pqrId} no encontrado`);
      }

      // 2. Obtener configuración de notificaciones
      const settings = await this.prisma.$queryRaw`
        SELECT * FROM "${this.schema}"."PQRSettings" LIMIT 1
      `;

      // Si las notificaciones automáticas están desactivadas, salir
      if (settings && settings[0] && !settings[0].autoNotifyEnabled) {
        return false;
      }

      // 3. Determinar destinatarios de la notificación
      const recipients = await this.getNotificationRecipients(pqr, newStatus);

      // 4. Enviar notificaciones a cada destinatario
      const notificationPromises = recipients.map(async (recipient) => {
        const notificationData: PQRNotificationData = {
          pqrId: pqr.id,
          ticketNumber: pqr.ticketNumber,
          title: pqr.title,
          status: newStatus,
          previousStatus,
          recipientId: recipient.id,
          recipientEmail: recipient.email,
          recipientName: recipient.name,
          recipientRole: recipient.role,
          comment,
          dueDate: pqr.dueDate
        };

        // Enviar notificaciones por los canales configurados
        await this.sendNotifications(notificationData, recipient.notificationChannels);

        // Registrar la notificación en la base de datos
        await this.logNotification(notificationData);
      });

      await Promise.all(notificationPromises);
      return true;
    } catch (error) {
      console.error('Error al enviar notificaciones de cambio de estado:', error);
      return false;
    }
  }

  /**
   * Envía notificaciones de recordatorio para PQRs próximos a vencer
   */
  async sendDueDateReminders(): Promise<number> {
    try {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Buscar PQRs que vencen en las próximas 24 horas y no están cerrados
      const dueSoonPQRs = await this.prisma.pQR.findMany({
        where: {
          dueDate: {
            gte: now,
            lt: tomorrow
          },
          status: {
            notIn: [PQRStatus.CLOSED, PQRStatus.RESOLVED, PQRStatus.CANCELLED]
          }
        }
      });

      let notificationCount = 0;

      // Enviar recordatorios para cada PQR
      for (const pqr of dueSoonPQRs) {
        // Obtener asignados y administradores
        const recipients = await this.getNotificationRecipients(pqr, pqr.status);

        // Enviar notificaciones de recordatorio
        for (const recipient of recipients) {
          const notificationData: PQRNotificationData = {
            pqrId: pqr.id,
            ticketNumber: pqr.ticketNumber,
            title: pqr.title,
            status: pqr.status,
            recipientId: recipient.id,
            recipientEmail: recipient.email,
            recipientName: recipient.name,
            recipientRole: recipient.role,
            dueDate: pqr.dueDate
          };

          // Enviar recordatorio
          await this.sendDueDateReminder(notificationData, recipient.notificationChannels);
          
          // Registrar la notificación
          await this.logNotification({
            ...notificationData,
            comment: 'Recordatorio de fecha límite'
          });
          
          notificationCount++;
        }
      }

      return notificationCount;
    } catch (error) {
      console.error('Error al enviar recordatorios de fecha límite:', error);
      return 0;
    }
  }

  /**
   * Envía notificación de satisfacción al cerrar un PQR
   */
  async sendSatisfactionSurvey(pqrId: number): Promise<boolean> {
    try {
      // Obtener datos del PQR
      const pqr = await this.prisma.pQR.findUnique({
        where: { id: pqrId }
      });

      if (!pqr || pqr.status !== PQRStatus.RESOLVED) {
        return false;
      }

      // Verificar si las encuestas de satisfacción están habilitadas
      const settings = await this.prisma.$queryRaw`
        SELECT * FROM "${this.schema}"."PQRSettings" LIMIT 1
      `;

      if (settings && settings[0] && !settings[0].satisfactionSurveyEnabled) {
        return false;
      }

      // Obtener datos del usuario que reportó el PQR
      const user = await this.prisma.user.findUnique({
        where: { id: pqr.userId }
      });

      if (!user || !user.email) {
        return false;
      }

      // Preparar datos para la notificación
      const notificationData: PQRNotificationData = {
        pqrId: pqr.id,
        ticketNumber: pqr.ticketNumber,
        title: pqr.title,
        status: pqr.status,
        recipientId: user.id,
        recipientEmail: user.email,
        recipientName: user.name || 'Residente',
        recipientRole: user.role
      };

      // Enviar encuesta de satisfacción
      await this.sendSatisfactionSurveyNotification(notificationData);
      
      // Registrar la notificación
      await this.logNotification({
        ...notificationData,
        comment: 'Encuesta de satisfacción'
      });

      return true;
    } catch (error) {
      console.error('Error al enviar encuesta de satisfacción:', error);
      return false;
    }
  }

  /**
   * Obtiene los destinatarios de una notificación según el estado del PQR
   */
  private async getNotificationRecipients(pqr: any, status: PQRStatus): Promise<any[]> {
    const recipients = [];

    // Siempre notificar al usuario que reportó el PQR
    const reporter = await this.prisma.user.findUnique({
      where: { id: pqr.userId }
    });

    if (reporter) {
      recipients.push({
        id: reporter.id,
        email: reporter.email,
        name: reporter.name || 'Usuario',
        role: reporter.role,
        notificationChannels: ['email', 'push']
      });
    }

    // Si está asignado a un usuario específico, notificarle
    if (pqr.assignedToId) {
      const assignee = await this.prisma.user.findUnique({
        where: { id: pqr.assignedToId }
      });

      if (assignee) {
        recipients.push({
          id: assignee.id,
          email: assignee.email,
          name: assignee.name || 'Asignado',
          role: assignee.role,
          notificationChannels: ['email', 'push']
        });
      }
    }

    // Si está asignado a un equipo, notificar a todos los miembros
    if (pqr.assignedTeamId) {
      const team = await this.prisma.$queryRaw`
        SELECT * FROM "${this.schema}"."PQRTeam" WHERE "id" = ${pqr.assignedTeamId}
      `;

      if (team && team[0] && team[0].memberIds) {
        const teamMembers = await this.prisma.user.findMany({
          where: {
            id: {
              in: team[0].memberIds
            }
          }
        });

        for (const member of teamMembers) {
          recipients.push({
            id: member.id,
            email: member.email,
            name: member.name || 'Miembro de equipo',
            role: member.role,
            notificationChannels: ['email', 'push']
          });
        }
      }
    }

    // Para ciertos estados, notificar también a administradores
    if ([PQRStatus.OPEN, PQRStatus.REOPENED, PQRStatus.WAITING].includes(status)) {
      const admins = await this.prisma.user.findMany({
        where: {
          role: 'COMPLEX_ADMIN',
          complexId: pqr.complexId,
          active: true
        }
      });

      for (const admin of admins) {
        // Evitar duplicados
        if (!recipients.some(r => r.id === admin.id)) {
          recipients.push({
            id: admin.id,
            email: admin.email,
            name: admin.name || 'Administrador',
            role: admin.role,
            notificationChannels: ['email', 'push']
          });
        }
      }
    }

    return recipients;
  }

  /**
   * Envía notificaciones por los canales especificados
   */
  private async sendNotifications(
    data: PQRNotificationData,
    channels: string[] = ['email', 'push']
  ): Promise<void> {
    const template = await this.getNotificationTemplate(data.status, data.previousStatus);
    
    const promises = [];
    
    // Enviar por email si está configurado y hay email disponible
    if (channels.includes('email') && data.recipientEmail) {
      promises.push(
        sendEmail({
          to: data.recipientEmail,
          subject: this.replaceVariables(template.subject, data),
          html: this.replaceVariables(template.content, data)
        })
      );
    }
    
    // Enviar notificación push si está configurado
    if (channels.includes('push')) {
      promises.push(
        sendPushNotification({
          userId: data.recipientId,
          title: this.replaceVariables(template.subject, data),
          body: this.replaceVariables(template.content, data),
          data: {
            pqrId: data.pqrId.toString(),
            status: data.status
          }
        })
      );
    }
    
    // Enviar SMS si está configurado
    if (channels.includes('sms')) {
      // Implementación pendiente
    }
    
    await Promise.all(promises);
  }

  /**
   * Envía recordatorio de fecha límite
   */
  private async sendDueDateReminder(
    data: PQRNotificationData,
    channels: string[] = ['email', 'push']
  ): Promise<void> {
    const subject = 'Recordatorio: PQR próximo a vencer';
    const content = `
      <p>Estimado/a ${data.recipientName},</p>
      <p>Le recordamos que el PQR <strong>${data.ticketNumber}</strong> "${data.title}" está próximo a vencer.</p>
      <p><strong>Fecha límite:</strong> ${data.dueDate?.toLocaleDateString()}</p>
      <p><strong>Estado actual:</strong> ${this.getStatusName(data.status)}</p>
      <p>Por favor, tome las acciones necesarias para resolver este PQR antes de la fecha límite.</p>
      <p>Gracias por su atención.</p>
    `;
    
    const promises = [];
    
    // Enviar por email si está configurado y hay email disponible
    if (channels.includes('email') && data.recipientEmail) {
      promises.push(
        sendEmail({
          to: data.recipientEmail,
          subject,
          html: content
        })
      );
    }
    
    // Enviar notificación push si está configurado
    if (channels.includes('push')) {
      promises.push(
        sendPushNotification({
          userId: data.recipientId,
          title: subject,
          body: `PQR ${data.ticketNumber} vence pronto: ${data.dueDate?.toLocaleDateString()}`,
          data: {
            pqrId: data.pqrId.toString(),
            status: data.status
          }
        })
      );
    }
    
    await Promise.all(promises);
  }

  /**
   * Envía encuesta de satisfacción
   */
  private async sendSatisfactionSurveyNotification(
    data: PQRNotificationData
  ): Promise<void> {
    const subject = 'Encuesta de satisfacción - PQR resuelto';
    const content = `
      <p>Estimado/a ${data.recipientName},</p>
      <p>Su solicitud PQR <strong>${data.ticketNumber}</strong> "${data.title}" ha sido resuelta.</p>
      <p>Nos gustaría conocer su nivel de satisfacción con la atención recibida.</p>
      <p>Por favor, califique su experiencia haciendo clic en uno de los siguientes enlaces:</p>
      <p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/pqr/satisfaction/${data.pqrId}?rating=5">⭐⭐⭐⭐⭐ Excelente</a><br>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/pqr/satisfaction/${data.pqrId}?rating=4">⭐⭐⭐⭐ Muy bueno</a><br>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/pqr/satisfaction/${data.pqrId}?rating=3">⭐⭐⭐ Bueno</a><br>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/pqr/satisfaction/${data.pqrId}?rating=2">⭐⭐ Regular</a><br>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/pqr/satisfaction/${data.pqrId}?rating=1">⭐ Deficiente</a>
      </p>
      <p>Su opinión es muy importante para nosotros y nos ayuda a mejorar nuestros servicios.</p>
      <p>Gracias por su colaboración.</p>
    `;
    
    // Enviar por email si hay email disponible
    if (data.recipientEmail) {
      await sendEmail({
        to: data.recipientEmail,
        subject,
        html: content
      });
    }
    
    // Enviar notificación push
    await sendPushNotification({
      userId: data.recipientId,
      title: subject,
      body: `Su PQR ${data.ticketNumber} ha sido resuelto. Por favor, califique su experiencia.`,
      data: {
        pqrId: data.pqrId.toString(),
        status: data.status,
        action: 'satisfaction_survey'
      }
    });
  }

  /**
   * Obtiene la plantilla de notificación según el estado
   */
  private async getNotificationTemplate(
    status: PQRStatus,
    previousStatus?: PQRStatus
  ): Promise<NotificationTemplate> {
    try {
      // Intentar obtener plantilla personalizada de la base de datos
      const eventType = previousStatus 
        ? `status_change_${previousStatus}_to_${status}` 
        : `status_${status}`;
      
      const template = await this.prisma.$queryRaw`
        SELECT * FROM "${this.schema}"."PQRResponseTemplate" 
        WHERE "name" = ${eventType} AND "isActive" = true
        LIMIT 1
      `;
      
      if (template && template[0]) {
        return {
          subject: template[0].subject,
          content: template[0].content
        };
      }
      
      // Si no hay plantilla personalizada, usar plantillas predeterminadas
      return this.getDefaultTemplate(status, previousStatus);
    } catch (error) {
      console.error('Error al obtener plantilla de notificación:', error);
      return this.getDefaultTemplate(status, previousStatus);
    }
  }

  /**
   * Obtiene plantilla predeterminada según el estado
   */
  private getDefaultTemplate(
    status: PQRStatus,
    previousStatus?: PQRStatus
  ): NotificationTemplate {
    switch (status) {
      case PQRStatus.OPEN:
        return {
          subject: 'PQR recibido: {{ticketNumber}}',
          content: `
            <p>Estimado/a {{recipientName}},</p>
            <p>Se ha recibido un nuevo PQR con número de ticket <strong>{{ticketNumber}}</strong>.</p>
            <p><strong>Título:</strong> {{title}}</p>
            <p>Este PQR ha sido registrado y será atendido a la brevedad posible.</p>
            <p>Puede hacer seguimiento a su solicitud ingresando a la plataforma.</p>
            <p>Gracias por su atención.</p>
          `
        };
      
      case PQRStatus.CATEGORIZED:
        return {
          subject: 'PQR categorizado: {{ticketNumber}}',
          content: `
            <p>Estimado/a {{recipientName}},</p>
            <p>El PQR <strong>{{ticketNumber}}</strong> ha sido categorizado y priorizado.</p>
            <p><strong>Título:</strong> {{title}}</p>
            <p>Su solicitud será atendida según la prioridad asignada.</p>
            <p>Puede hacer seguimiento a su solicitud ingresando a la plataforma.</p>
            <p>Gracias por su atención.</p>
          `
        };
      
      case PQRStatus.ASSIGNED:
        return {
          subject: 'PQR asignado: {{ticketNumber}}',
          content: `
            <p>Estimado/a {{recipientName}},</p>
            <p>El PQR <strong>{{ticketNumber}}</strong> ha sido asignado para su atención.</p>
            <p><strong>Título:</strong> {{title}}</p>
            <p>Su solicitud será atendida a la brevedad posible.</p>
            <p>Puede hacer seguimiento a su solicitud ingresando a la plataforma.</p>
            <p>Gracias por su atención.</p>
          `
        };
      
      case PQRStatus.IN_PROGRESS:
        return {
          subject: 'PQR en proceso: {{ticketNumber}}',
          content: `
            <p>Estimado/a {{recipientName}},</p>
            <p>El PQR <strong>{{ticketNumber}}</strong> está siendo atendido en este momento.</p>
            <p><strong>Título:</strong> {{title}}</p>
            <p>Le informaremos cuando haya novedades sobre su solicitud.</p>
            <p>Puede hacer seguimiento a su solicitud ingresando a la plataforma.</p>
            <p>Gracias por su atención.</p>
          `
        };
      
      case PQRStatus.WAITING:
        return {
          subject: 'PQR en espera: {{ticketNumber}}',
          content: `
            <p>Estimado/a {{recipientName}},</p>
            <p>El PQR <strong>{{ticketNumber}}</strong> está en espera de información adicional o acciones de terceros.</p>
            <p><strong>Título:</strong> {{title}}</p>
            <p>{{comment}}</p>
            <p>Le informaremos cuando se reanude la atención de su solicitud.</p>
            <p>Puede hacer seguimiento a su solicitud ingresando a la plataforma.</p>
            <p>Gracias por su atención.</p>
          `
        };
      
      case PQRStatus.RESOLVED:
        return {
          subject: 'PQR resuelto: {{ticketNumber}}',
          content: `
            <p>Estimado/a {{recipientName}},</p>
            <p>Nos complace informarle que el PQR <strong>{{ticketNumber}}</strong> ha sido resuelto.</p>
            <p><strong>Título:</strong> {{title}}</p>
            <p>{{comment}}</p>
            <p>Si considera que su solicitud no ha sido resuelta satisfactoriamente, puede reabrirla ingresando a la plataforma.</p>
            <p>Gracias por su atención.</p>
          `
        };
      
      case PQRStatus.CLOSED:
        return {
          subject: 'PQR cerrado: {{ticketNumber}}',
          content: `
            <p>Estimado/a {{recipientName}},</p>
            <p>El PQR <strong>{{ticketNumber}}</strong> ha sido cerrado.</p>
            <p><strong>Título:</strong> {{title}}</p>
            <p>Gracias por utilizar nuestro sistema de PQR.</p>
            <p>Si tiene alguna otra solicitud, no dude en contactarnos.</p>
          `
        };
      
      case PQRStatus.REOPENED:
        return {
          subject: 'PQR reabierto: {{ticketNumber}}',
          content: `
            <p>Estimado/a {{recipientName}},</p>
            <p>El PQR <strong>{{ticketNumber}}</strong> ha sido reabierto.</p>
            <p><strong>Título:</strong> {{title}}</p>
            <p>{{comment}}</p>
            <p>Su solicitud será revisada nuevamente y atendida a la brevedad posible.</p>
            <p>Puede hacer seguimiento a su solicitud ingresando a la plataforma.</p>
            <p>Gracias por su atención.</p>
          `
        };
      
      case PQRStatus.CANCELLED:
        return {
          subject: 'PQR cancelado: {{ticketNumber}}',
          content: `
            <p>Estimado/a {{recipientName}},</p>
            <p>El PQR <strong>{{ticketNumber}}</strong> ha sido cancelado.</p>
            <p><strong>Título:</strong> {{title}}</p>
            <p>{{comment}}</p>
            <p>Si tiene alguna otra solicitud, no dude en contactarnos.</p>
          `
        };
      
      default:
        return {
          subject: 'Actualización de PQR: {{ticketNumber}}',
          content: `
            <p>Estimado/a {{recipientName}},</p>
            <p>Ha habido una actualización en el PQR <strong>{{ticketNumber}}</strong>.</p>
            <p><strong>Título:</strong> {{title}}</p>
            <p><strong>Estado actual:</strong> ${this.getStatusName(status)}</p>
            <p>Puede hacer seguimiento a su solicitud ingresando a la plataforma.</p>
            <p>Gracias por su atención.</p>
          `
        };
    }
  }

  /**
   * Reemplaza variables en plantillas
   */
  private replaceVariables(template: string, data: PQRNotificationData): string {
    return template
      .replace(/{{ticketNumber}}/g, data.ticketNumber)
      .replace(/{{title}}/g, data.title)
      .replace(/{{recipientName}}/g, data.recipientName)
      .replace(/{{status}}/g, this.getStatusName(data.status))
      .replace(/{{previousStatus}}/g, data.previousStatus ? this.getStatusName(data.previousStatus) : '')
      .replace(/{{comment}}/g, data.comment || '')
      .replace(/{{dueDate}}/g, data.dueDate ? data.dueDate.toLocaleDateString() : '');
  }

  /**
   * Obtiene nombre legible del estado
   */
  private getStatusName(status: PQRStatus): string {
    const statusNames = {
      [PQRStatus.OPEN]: 'Abierto',
      [PQRStatus.CATEGORIZED]: 'Categorizado',
      [PQRStatus.ASSIGNED]: 'Asignado',
      [PQRStatus.IN_PROGRESS]: 'En proceso',
      [PQRStatus.WAITING]: 'En espera',
      [PQRStatus.RESOLVED]: 'Resuelto',
      [PQRStatus.CLOSED]: 'Cerrado',
      [PQRStatus.REOPENED]: 'Reabierto',
      [PQRStatus.CANCELLED]: 'Cancelado'
    };
    
    return statusNames[status] || status;
  }

  /**
   * Registra la notificación en la base de datos
   */
  private async logNotification(data: PQRNotificationData): Promise<void> {
    try {
      await this.prisma.pQRNotification.create({
        data: {
          pqrId: data.pqrId,
          type: 'email', // Por defecto email, pero podría ser variable
          recipientId: data.recipientId,
          recipientEmail: data.recipientEmail,
          recipientName: data.recipientName,
          subject: `Actualización PQR: ${data.ticketNumber}`,
          content: data.comment || `Cambio de estado a ${this.getStatusName(data.status)}`,
          status: 'sent'
        }
      });
    } catch (error) {
      console.error('Error al registrar notificación:', error);
    }
  }
}

/**
 * Crea una instancia del servicio de notificaciones de PQR para el esquema especificado
 */
export function createPQRNotificationService(req: Request): PQRNotificationService {
  const schema = getSchemaFromRequest(req);
  return new PQRNotificationService(schema);
}
