/**
 * Servicio para gestión del sistema de monitoreo
 * Este servicio implementa la lógica de negocio para el monitoreo de infraestructura,
 * aplicación y experiencia de usuario, así como la gestión de alertas y notificaciones.
 */

import { PrismaClient } from '@prisma/client';
import { getTenantPrismaClient } from '@/lib/prisma';
import { ServerLogger } from '@/lib/logging/server-logger';
import { NotificationService } from '@/lib/services/notification-service';
import axios from 'axios';
import { performance } from 'perf_hooks';

// Tipos de monitoreo soportados
export enum MonitoringType {
  INFRASTRUCTURE = 'INFRASTRUCTURE',
  APPLICATION = 'APPLICATION',
  USER_EXPERIENCE = 'USER_EXPERIENCE'
}

// Estados de monitoreo
export enum MonitoringStatus {
  SUCCESS = 'SUCCESS',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL'
}

// Estados de alerta
export enum AlertStatus {
  ACTIVE = 'ACTIVE',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
  RESOLVED = 'RESOLVED'
}

// Severidad de alertas
export enum AlertSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL'
}

// Canales de notificación
export enum NotificationChannel {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  WEBHOOK = 'WEBHOOK'
}

// Interfaz para configuración de monitoreo
export interface MonitoringConfigData {
  name: string;
  description?: string;
  monitoringType: MonitoringType;
  checkInterval: number;
  targetResource: string;
  parameters?: any;
  alertThresholds: any;
  isActive?: boolean;
}

// Interfaz para resultados de monitoreo
export interface MonitoringResultData {
  status: MonitoringStatus;
  responseTime?: number;
  value?: number;
  details?: any;
  errorMessage?: string;
}

// Interfaz para alertas
export interface AlertData {
  configId: number;
  severity: AlertSeverity;
  message: string;
  details?: any;
}

/**
 * Clase principal del servicio de monitoreo
 */
export default class MonitoringService {
  private prisma: PrismaClient;
  private notificationService: NotificationService;
  private tenantId: string;

  /**
   * Constructor del servicio
   * @param schema Esquema del tenant
   */
  constructor(schema: string) {
    this.prisma = getTenantPrismaClient(schema);
    this.tenantId = schema;
    this.notificationService = new NotificationService(schema);
  }

  /**
   * Crea una nueva configuración de monitoreo
   * @param data Datos de la configuración
   * @param userId ID del usuario que crea la configuración
   * @returns Configuración creada
   */
  async createMonitoringConfig(data: MonitoringConfigData, userId: number) {
    try {
      const config = await this.prisma.monitoringConfig.create({
        data: {
          tenantId: this.tenantId,
          name: data.name,
          description: data.description,
          monitoringType: data.monitoringType,
          checkInterval: data.checkInterval,
          targetResource: data.targetResource,
          parameters: data.parameters || {},
          alertThresholds: data.alertThresholds,
          isActive: data.isActive !== undefined ? data.isActive : true
        }
      });

      ServerLogger.info(`Configuración de monitoreo creada: ${config.id}`, {
        userId,
        tenantId: this.tenantId,
        configId: config.id
      });

      return config;
    } catch (error) {
      ServerLogger.error('Error al crear configuración de monitoreo:', error);
      throw new Error('Error al crear configuración de monitoreo');
    }
  }

  /**
   * Actualiza una configuración de monitoreo existente
   * @param id ID de la configuración
   * @param data Datos actualizados
   * @param userId ID del usuario que actualiza la configuración
   * @returns Configuración actualizada
   */
  async updateMonitoringConfig(id: number, data: Partial<MonitoringConfigData>, userId: number) {
    try {
      const config = await this.prisma.monitoringConfig.update({
        where: { id },
        data: {
          name: data.name,
          description: data.description,
          monitoringType: data.monitoringType,
          checkInterval: data.checkInterval,
          targetResource: data.targetResource,
          parameters: data.parameters,
          alertThresholds: data.alertThresholds,
          isActive: data.isActive
        }
      });

      ServerLogger.info(`Configuración de monitoreo actualizada: ${id}`, {
        userId,
        tenantId: this.tenantId,
        configId: id
      });

      return config;
    } catch (error) {
      ServerLogger.error(`Error al actualizar configuración de monitoreo ${id}:`, error);
      throw new Error('Error al actualizar configuración de monitoreo');
    }
  }

  /**
   * Elimina una configuración de monitoreo
   * @param id ID de la configuración
   * @param userId ID del usuario que elimina la configuración
   * @returns Resultado de la operación
   */
  async deleteMonitoringConfig(id: number, userId: number) {
    try {
      // Primero eliminamos resultados y alertas asociadas
      await this.prisma.monitoringResult.deleteMany({
        where: { configId: id }
      });

      // Eliminamos notificaciones de alertas
      const alerts = await this.prisma.alert.findMany({
        where: { configId: id },
        select: { id: true }
      });

      const alertIds = alerts.map(alert => alert.id);
      
      await this.prisma.notificationLog.deleteMany({
        where: { alertId: { in: alertIds } }
      });

      // Eliminamos alertas
      await this.prisma.alert.deleteMany({
        where: { configId: id }
      });

      // Finalmente eliminamos la configuración
      await this.prisma.monitoringConfig.delete({
        where: { id }
      });

      ServerLogger.info(`Configuración de monitoreo eliminada: ${id}`, {
        userId,
        tenantId: this.tenantId,
        configId: id
      });

      return { success: true, message: 'Configuración eliminada correctamente' };
    } catch (error) {
      ServerLogger.error(`Error al eliminar configuración de monitoreo ${id}:`, error);
      throw new Error('Error al eliminar configuración de monitoreo');
    }
  }

  /**
   * Obtiene todas las configuraciones de monitoreo
   * @param includeInactive Incluir configuraciones inactivas
   * @returns Lista de configuraciones
   */
  async getMonitoringConfigs(includeInactive: boolean = false) {
    try {
      const where = {
        tenantId: this.tenantId,
        ...(includeInactive ? {} : { isActive: true })
      };

      const configs = await this.prisma.monitoringConfig.findMany({
        where,
        orderBy: { name: 'asc' }
      });

      return configs;
    } catch (error) {
      ServerLogger.error('Error al obtener configuraciones de monitoreo:', error);
      throw new Error('Error al obtener configuraciones de monitoreo');
    }
  }

  /**
   * Obtiene una configuración de monitoreo por ID
   * @param id ID de la configuración
   * @returns Configuración encontrada
   */
  async getMonitoringConfigById(id: number) {
    try {
      const config = await this.prisma.monitoringConfig.findUnique({
        where: { id }
      });

      if (!config) {
        throw new Error('Configuración de monitoreo no encontrada');
      }

      return config;
    } catch (error) {
      ServerLogger.error(`Error al obtener configuración de monitoreo ${id}:`, error);
      throw new Error('Error al obtener configuración de monitoreo');
    }
  }

  /**
   * Ejecuta una verificación de monitoreo para una configuración específica
   * @param configId ID de la configuración
   * @returns Resultado de la verificación
   */
  async executeCheck(configId: number) {
    try {
      const config = await this.getMonitoringConfigById(configId);
      
      if (!config.isActive) {
        return { skipped: true, message: 'Configuración inactiva' };
      }

      let result: MonitoringResultData;

      // Ejecutar verificación según el tipo de monitoreo
      switch (config.monitoringType) {
        case MonitoringType.INFRASTRUCTURE:
          result = await this.checkInfrastructure(config);
          break;
        case MonitoringType.APPLICATION:
          result = await this.checkApplication(config);
          break;
        case MonitoringType.USER_EXPERIENCE:
          result = await this.checkUserExperience(config);
          break;
        default:
          throw new Error(`Tipo de monitoreo no soportado: ${config.monitoringType}`);
      }

      // Guardar resultado
      const savedResult = await this.saveMonitoringResult(configId, result);

      // Verificar si se debe generar una alerta
      await this.checkForAlerts(config, result);

      return savedResult;
    } catch (error) {
      ServerLogger.error(`Error al ejecutar verificación para configuración ${configId}:`, error);
      
      // Guardar resultado de error
      const errorResult: MonitoringResultData = {
        status: MonitoringStatus.ERROR,
        errorMessage: error instanceof Error ? error.message : 'Error desconocido'
      };
      
      await this.saveMonitoringResult(configId, errorResult);
      
      throw new Error('Error al ejecutar verificación de monitoreo');
    }
  }

  /**
   * Ejecuta verificaciones para todas las configuraciones activas
   * @returns Resultados de las verificaciones
   */
  async executeAllChecks() {
    try {
      const configs = await this.getMonitoringConfigs(false);
      const results = [];

      for (const config of configs) {
        try {
          const result = await this.executeCheck(config.id);
          results.push({ configId: config.id, result });
        } catch (error) {
          results.push({ 
            configId: config.id, 
            error: error instanceof Error ? error.message : 'Error desconocido' 
          });
        }
      }

      return results;
    } catch (error) {
      ServerLogger.error('Error al ejecutar todas las verificaciones:', error);
      throw new Error('Error al ejecutar verificaciones de monitoreo');
    }
  }

  /**
   * Verifica infraestructura (servidores, bases de datos, etc.)
   * @param config Configuración de monitoreo
   * @returns Resultado de la verificación
   */
  private async checkInfrastructure(config: any): Promise<MonitoringResultData> {
    const startTime = performance.now();
    
    try {
      const { targetResource, parameters } = config;
      let value: number | undefined;
      let details: any = {};
      let status = MonitoringStatus.SUCCESS;

      // Implementación según el tipo de recurso
      if (targetResource.startsWith('server:')) {
        // Monitoreo de servidor (CPU, memoria, disco)
        const resource = targetResource.split(':')[1];
        
        // Aquí se implementaría la lógica real para obtener métricas del servidor
        // Este es un ejemplo simulado
        switch (resource) {
          case 'cpu':
            value = Math.random() * 100; // Simulación de uso de CPU
            break;
          case 'memory':
            value = Math.random() * 100; // Simulación de uso de memoria
            break;
          case 'disk':
            value = Math.random() * 100; // Simulación de uso de disco
            break;
          default:
            throw new Error(`Recurso de servidor no soportado: ${resource}`);
        }
        
        details = { resource, unit: '%' };
      } else if (targetResource.startsWith('database:')) {
        // Monitoreo de base de datos
        const dbResource = targetResource.split(':')[1];
        
        // Simulación de métricas de base de datos
        switch (dbResource) {
          case 'connections':
            value = Math.floor(Math.random() * 100);
            details = { resource: dbResource, unit: 'connections' };
            break;
          case 'queries':
            value = Math.floor(Math.random() * 1000);
            details = { resource: dbResource, unit: 'queries/sec' };
            break;
          case 'latency':
            value = Math.random() * 500;
            details = { resource: dbResource, unit: 'ms' };
            break;
          default:
            throw new Error(`Recurso de base de datos no soportado: ${dbResource}`);
        }
      } else {
        throw new Error(`Tipo de recurso de infraestructura no soportado: ${targetResource}`);
      }

      // Determinar estado según umbrales
      const thresholds = config.alertThresholds;
      if (value !== undefined) {
        if (thresholds.critical !== undefined && value >= thresholds.critical) {
          status = MonitoringStatus.CRITICAL;
        } else if (thresholds.error !== undefined && value >= thresholds.error) {
          status = MonitoringStatus.ERROR;
        } else if (thresholds.warning !== undefined && value >= thresholds.warning) {
          status = MonitoringStatus.WARNING;
        }
      }

      const responseTime = Math.round(performance.now() - startTime);
      
      return {
        status,
        responseTime,
        value,
        details
      };
    } catch (error) {
      ServerLogger.error(`Error en verificación de infraestructura:`, error);
      return {
        status: MonitoringStatus.ERROR,
        responseTime: Math.round(performance.now() - startTime),
        errorMessage: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Verifica aplicación (APIs, servicios, etc.)
   * @param config Configuración de monitoreo
   * @returns Resultado de la verificación
   */
  private async checkApplication(config: any): Promise<MonitoringResultData> {
    const startTime = performance.now();
    
    try {
      const { targetResource, parameters } = config;
      let responseTime: number | undefined;
      let details: any = {};
      let status = MonitoringStatus.SUCCESS;

      // Verificar endpoint de API
      if (targetResource.startsWith('api:')) {
        const endpoint = targetResource.split(':')[1];
        const method = parameters?.method || 'GET';
        const timeout = parameters?.timeout || 5000;
        const headers = parameters?.headers || {};
        const data = parameters?.data;
        
        try {
          const requestStartTime = performance.now();
          const response = await axios({
            method,
            url: endpoint,
            headers,
            data,
            timeout
          });
          
          responseTime = Math.round(performance.now() - requestStartTime);
          
          details = {
            statusCode: response.status,
            contentLength: response.headers['content-length'],
            contentType: response.headers['content-type']
          };
          
          // Verificar código de estado HTTP
          if (response.status >= 500) {
            status = MonitoringStatus.ERROR;
          } else if (response.status >= 400) {
            status = MonitoringStatus.WARNING;
          }
          
          // Verificar tiempo de respuesta contra umbrales
          const thresholds = config.alertThresholds;
          if (responseTime !== undefined) {
            if (thresholds.critical !== undefined && responseTime >= thresholds.critical) {
              status = MonitoringStatus.CRITICAL;
            } else if (thresholds.error !== undefined && responseTime >= thresholds.error) {
              status = MonitoringStatus.ERROR;
            } else if (thresholds.warning !== undefined && responseTime >= thresholds.warning) {
              status = MonitoringStatus.WARNING;
            }
          }
        } catch (error) {
          if (axios.isAxiosError(error)) {
            if (error.code === 'ECONNABORTED') {
              status = MonitoringStatus.CRITICAL;
              details = { error: 'Timeout' };
            } else if (error.response) {
              status = MonitoringStatus.ERROR;
              details = {
                statusCode: error.response.status,
                statusText: error.response.statusText
              };
            } else {
              status = MonitoringStatus.CRITICAL;
              details = { error: error.message };
            }
          } else {
            throw error;
          }
        }
      } else if (targetResource.startsWith('service:')) {
        // Verificar estado de servicio interno
        const service = targetResource.split(':')[1];
        
        // Aquí se implementaría la lógica real para verificar servicios internos
        // Este es un ejemplo simulado
        const serviceStatus = Math.random() > 0.9 ? 'error' : 'ok';
        status = serviceStatus === 'ok' ? MonitoringStatus.SUCCESS : MonitoringStatus.ERROR;
        details = { service, status: serviceStatus };
      } else {
        throw new Error(`Tipo de recurso de aplicación no soportado: ${targetResource}`);
      }

      const totalResponseTime = Math.round(performance.now() - startTime);
      
      return {
        status,
        responseTime: responseTime || totalResponseTime,
        details
      };
    } catch (error) {
      ServerLogger.error(`Error en verificación de aplicación:`, error);
      return {
        status: MonitoringStatus.ERROR,
        responseTime: Math.round(performance.now() - startTime),
        errorMessage: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Verifica experiencia de usuario (tiempos de carga, errores cliente, etc.)
   * @param config Configuración de monitoreo
   * @returns Resultado de la verificación
   */
  private async checkUserExperience(config: any): Promise<MonitoringResultData> {
    const startTime = performance.now();
    
    try {
      const { targetResource, parameters } = config;
      let value: number | undefined;
      let details: any = {};
      let status = MonitoringStatus.SUCCESS;

      // Implementación según el tipo de métrica de UX
      if (targetResource.startsWith('pageload:')) {
        // Simulación de tiempo de carga de página
        const page = targetResource.split(':')[1];
        value = Math.random() * 5000; // Tiempo en ms
        details = { page, unit: 'ms' };
      } else if (targetResource.startsWith('errors:')) {
        // Simulación de tasa de errores del cliente
        const errorType = targetResource.split(':')[1];
        value = Math.random() * 5; // Porcentaje de errores
        details = { errorType, unit: '%' };
      } else if (targetResource.startsWith('interaction:')) {
        // Simulación de métricas de interacción
        const interaction = targetResource.split(':')[1];
        value = Math.random() * 2000; // Tiempo en ms
        details = { interaction, unit: 'ms' };
      } else {
        throw new Error(`Tipo de métrica de experiencia de usuario no soportado: ${targetResource}`);
      }

      // Determinar estado según umbrales
      const thresholds = config.alertThresholds;
      if (value !== undefined) {
        if (thresholds.critical !== undefined && value >= thresholds.critical) {
          status = MonitoringStatus.CRITICAL;
        } else if (thresholds.error !== undefined && value >= thresholds.error) {
          status = MonitoringStatus.ERROR;
        } else if (thresholds.warning !== undefined && value >= thresholds.warning) {
          status = MonitoringStatus.WARNING;
        }
      }

      const responseTime = Math.round(performance.now() - startTime);
      
      return {
        status,
        responseTime,
        value,
        details
      };
    } catch (error) {
      ServerLogger.error(`Error en verificación de experiencia de usuario:`, error);
      return {
        status: MonitoringStatus.ERROR,
        responseTime: Math.round(performance.now() - startTime),
        errorMessage: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Guarda un resultado de monitoreo en la base de datos
   * @param configId ID de la configuración
   * @param result Resultado de la verificación
   * @returns Resultado guardado
   */
  private async saveMonitoringResult(configId: number, result: MonitoringResultData) {
    try {
      const savedResult = await this.prisma.monitoringResult.create({
        data: {
          configId,
          status: result.status,
          responseTime: result.responseTime,
          value: result.value,
          details: result.details || {},
          errorMessage: result.errorMessage
        }
      });

      return savedResult;
    } catch (error) {
      ServerLogger.error(`Error al guardar resultado de monitoreo para configuración ${configId}:`, error);
      throw new Error('Error al guardar resultado de monitoreo');
    }
  }

  /**
   * Verifica si se debe generar una alerta basada en el resultado de monitoreo
   * @param config Configuración de monitoreo
   * @param result Resultado de la verificación
   * @returns Alerta generada o null
   */
  private async checkForAlerts(config: any, result: MonitoringResultData) {
    try {
      // Determinar si se debe generar una alerta según el estado
      let severity: AlertSeverity | null = null;
      
      switch (result.status) {
        case MonitoringStatus.CRITICAL:
          severity = AlertSeverity.CRITICAL;
          break;
        case MonitoringStatus.ERROR:
          severity = AlertSeverity.ERROR;
          break;
        case MonitoringStatus.WARNING:
          severity = AlertSeverity.WARNING;
          break;
        default:
          // No generar alerta para estado SUCCESS
          return null;
      }

      // Verificar si ya existe una alerta activa para esta configuración
      const existingAlert = await this.prisma.alert.findFirst({
        where: {
          configId: config.id,
          status: AlertStatus.ACTIVE
        }
      });

      if (existingAlert) {
        // Si ya existe una alerta activa, no crear otra
        return null;
      }

      // Crear mensaje de alerta
      const message = this.generateAlertMessage(config, result);

      // Crear alerta
      const alert = await this.prisma.alert.create({
        data: {
          configId: config.id,
          severity,
          message,
          details: {
            result: result.details || {},
            value: result.value,
            errorMessage: result.errorMessage
          },
          status: AlertStatus.ACTIVE
        }
      });

      // Enviar notificaciones
      await this.sendAlertNotifications(alert);

      return alert;
    } catch (error) {
      ServerLogger.error(`Error al verificar alertas para configuración ${config.id}:`, error);
      // No propagar el error para no interrumpir el flujo principal
      return null;
    }
  }

  /**
   * Genera un mensaje descriptivo para una alerta
   * @param config Configuración de monitoreo
   * @param result Resultado de la verificación
   * @returns Mensaje de alerta
   */
  private generateAlertMessage(config: any, result: MonitoringResultData): string {
    const resourceName = config.name;
    const status = result.status;
    
    let message = `[${status}] ${resourceName}: `;
    
    if (result.errorMessage) {
      message += result.errorMessage;
    } else if (result.value !== undefined) {
      message += `Valor ${result.value}`;
      if (result.details?.unit) {
        message += ` ${result.details.unit}`;
      }
    } else {
      message += 'Problema detectado';
    }
    
    return message;
  }

  /**
   * Envía notificaciones para una alerta
   * @param alert Alerta generada
   */
  private async sendAlertNotifications(alert: any) {
    try {
      // Obtener configuración de monitoreo
      const config = await this.getMonitoringConfigById(alert.configId);
      
      // Obtener destinatarios de notificaciones (esto dependería de la implementación específica)
      const recipients = await this.getAlertRecipients(config);
      
      for (const recipient of recipients) {
        try {
          // Enviar notificación según el canal
          let status = 'SENT';
          let errorMessage = null;
          
          try {
            switch (recipient.channel) {
              case NotificationChannel.EMAIL:
                await this.notificationService.sendEmail({
                  to: recipient.address,
                  subject: `Alerta: ${alert.message}`,
                  body: this.formatAlertEmailBody(alert, config)
                });
                break;
              case NotificationChannel.SMS:
                await this.notificationService.sendSMS({
                  to: recipient.address,
                  message: alert.message
                });
                break;
              case NotificationChannel.WEBHOOK:
                await axios.post(recipient.address, {
                  alert: {
                    id: alert.id,
                    severity: alert.severity,
                    message: alert.message,
                    details: alert.details,
                    timestamp: alert.timestamp
                  },
                  config: {
                    id: config.id,
                    name: config.name,
                    type: config.monitoringType,
                    resource: config.targetResource
                  }
                });
                break;
              default:
                throw new Error(`Canal de notificación no soportado: ${recipient.channel}`);
            }
          } catch (error) {
            status = 'FAILED';
            errorMessage = error instanceof Error ? error.message : 'Error desconocido';
          }
          
          // Registrar notificación
          await this.prisma.notificationLog.create({
            data: {
              alertId: alert.id,
              channel: recipient.channel,
              recipient: recipient.address,
              status,
              errorMessage
            }
          });
        } catch (error) {
          ServerLogger.error(`Error al enviar notificación a ${recipient.address}:`, error);
          // Continuar con el siguiente destinatario
        }
      }
    } catch (error) {
      ServerLogger.error(`Error al enviar notificaciones para alerta ${alert.id}:`, error);
      // No propagar el error para no interrumpir el flujo principal
    }
  }

  /**
   * Obtiene los destinatarios de notificaciones para una configuración
   * @param config Configuración de monitoreo
   * @returns Lista de destinatarios
   */
  private async getAlertRecipients(config: any) {
    // Esta implementación dependería de la lógica específica de la aplicación
    // Por ejemplo, podría obtener administradores del sistema, usuarios suscritos, etc.
    
    // Ejemplo simplificado
    return [
      { channel: NotificationChannel.EMAIL, address: 'admin@example.com' },
      { channel: NotificationChannel.EMAIL, address: 'alerts@example.com' },
      // Otros destinatarios...
    ];
  }

  /**
   * Formatea el cuerpo de un email de alerta
   * @param alert Alerta generada
   * @param config Configuración de monitoreo
   * @returns Cuerpo del email formateado
   */
  private formatAlertEmailBody(alert: any, config: any): string {
    return `
      <h2>Alerta de Monitoreo</h2>
      <p><strong>Severidad:</strong> ${alert.severity}</p>
      <p><strong>Mensaje:</strong> ${alert.message}</p>
      <p><strong>Fecha y hora:</strong> ${new Date(alert.timestamp).toLocaleString()}</p>
      <h3>Detalles</h3>
      <p><strong>Recurso monitoreado:</strong> ${config.name} (${config.targetResource})</p>
      <p><strong>Tipo de monitoreo:</strong> ${config.monitoringType}</p>
      ${alert.details ? `<pre>${JSON.stringify(alert.details, null, 2)}</pre>` : ''}
      <p>Acceda al <a href="#">panel de monitoreo</a> para más información.</p>
    `;
  }

  /**
   * Obtiene alertas activas
   * @param includeAcknowledged Incluir alertas reconocidas
   * @returns Lista de alertas
   */
  async getActiveAlerts(includeAcknowledged: boolean = false) {
    try {
      const statuses = includeAcknowledged 
        ? [AlertStatus.ACTIVE, AlertStatus.ACKNOWLEDGED] 
        : [AlertStatus.ACTIVE];
      
      const alerts = await this.prisma.alert.findMany({
        where: {
          status: { in: statuses },
          config: {
            tenantId: this.tenantId
          }
        },
        include: {
          config: {
            select: {
              name: true,
              monitoringType: true,
              targetResource: true
            }
          }
        },
        orderBy: [
          { severity: 'desc' },
          { timestamp: 'desc' }
        ]
      });

      return alerts;
    } catch (error) {
      ServerLogger.error('Error al obtener alertas activas:', error);
      throw new Error('Error al obtener alertas');
    }
  }

  /**
   * Reconoce una alerta
   * @param alertId ID de la alerta
   * @param userId ID del usuario que reconoce la alerta
   * @returns Alerta actualizada
   */
  async acknowledgeAlert(alertId: number, userId: number) {
    try {
      const alert = await this.prisma.alert.update({
        where: { id: alertId },
        data: {
          status: AlertStatus.ACKNOWLEDGED,
          acknowledgedById: userId,
          acknowledgedAt: new Date()
        }
      });

      ServerLogger.info(`Alerta ${alertId} reconocida por usuario ${userId}`);
      return alert;
    } catch (error) {
      ServerLogger.error(`Error al reconocer alerta ${alertId}:`, error);
      throw new Error('Error al reconocer alerta');
    }
  }

  /**
   * Resuelve una alerta
   * @param alertId ID de la alerta
   * @param userId ID del usuario que resuelve la alerta
   * @returns Alerta actualizada
   */
  async resolveAlert(alertId: number, userId: number) {
    try {
      const alert = await this.prisma.alert.update({
        where: { id: alertId },
        data: {
          status: AlertStatus.RESOLVED,
          resolvedAt: new Date()
        }
      });

      ServerLogger.info(`Alerta ${alertId} resuelta por usuario ${userId}`);
      return alert;
    } catch (error) {
      ServerLogger.error(`Error al resolver alerta ${alertId}:`, error);
      throw new Error('Error al resolver alerta');
    }
  }

  /**
   * Obtiene el historial de resultados de monitoreo para una configuración
   * @param configId ID de la configuración
   * @param limit Límite de resultados
   * @param offset Desplazamiento para paginación
   * @returns Lista de resultados
   */
  async getMonitoringResults(configId: number, limit: number = 100, offset: number = 0) {
    try {
      const results = await this.prisma.monitoringResult.findMany({
        where: { configId },
        orderBy: { timestamp: 'desc' },
        take: limit,
        skip: offset
      });

      return results;
    } catch (error) {
      ServerLogger.error(`Error al obtener resultados de monitoreo para configuración ${configId}:`, error);
      throw new Error('Error al obtener resultados de monitoreo');
    }
  }

  /**
   * Obtiene estadísticas de monitoreo para una configuración
   * @param configId ID de la configuración
   * @param days Número de días para las estadísticas
   * @returns Estadísticas de monitoreo
   */
  async getMonitoringStats(configId: number, days: number = 7) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Obtener todos los resultados en el período
      const results = await this.prisma.monitoringResult.findMany({
        where: {
          configId,
          timestamp: { gte: startDate }
        },
        orderBy: { timestamp: 'asc' }
      });

      // Calcular estadísticas
      const totalChecks = results.length;
      const successChecks = results.filter(r => r.status === MonitoringStatus.SUCCESS).length;
      const warningChecks = results.filter(r => r.status === MonitoringStatus.WARNING).length;
      const errorChecks = results.filter(r => r.status === MonitoringStatus.ERROR).length;
      const criticalChecks = results.filter(r => r.status === MonitoringStatus.CRITICAL).length;

      // Calcular disponibilidad
      const availability = totalChecks > 0 
        ? (successChecks / totalChecks) * 100 
        : 0;

      // Calcular tiempo de respuesta promedio
      const responseTimes = results
        .filter(r => r.responseTime !== null && r.responseTime !== undefined)
        .map(r => r.responseTime as number);
      
      const avgResponseTime = responseTimes.length > 0 
        ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
        : 0;

      // Agrupar por día para gráficos
      const dailyStats = this.groupResultsByDay(results, startDate, new Date());

      return {
        totalChecks,
        successChecks,
        warningChecks,
        errorChecks,
        criticalChecks,
        availability,
        avgResponseTime,
        dailyStats
      };
    } catch (error) {
      ServerLogger.error(`Error al obtener estadísticas de monitoreo para configuración ${configId}:`, error);
      throw new Error('Error al obtener estadísticas de monitoreo');
    }
  }

  /**
   * Agrupa resultados de monitoreo por día
   * @param results Resultados de monitoreo
   * @param startDate Fecha de inicio
   * @param endDate Fecha de fin
   * @returns Estadísticas agrupadas por día
   */
  private groupResultsByDay(results: any[], startDate: Date, endDate: Date) {
    const dailyStats: any[] = [];
    const currentDate = new Date(startDate);
    
    // Iterar por cada día en el rango
    while (currentDate <= endDate) {
      const dayStart = new Date(currentDate);
      const dayEnd = new Date(currentDate);
      dayEnd.setHours(23, 59, 59, 999);
      
      // Filtrar resultados para este día
      const dayResults = results.filter(r => {
        const timestamp = new Date(r.timestamp);
        return timestamp >= dayStart && timestamp <= dayEnd;
      });
      
      // Calcular estadísticas del día
      const totalChecks = dayResults.length;
      const successChecks = dayResults.filter(r => r.status === MonitoringStatus.SUCCESS).length;
      const warningChecks = dayResults.filter(r => r.status === MonitoringStatus.WARNING).length;
      const errorChecks = dayResults.filter(r => r.status === MonitoringStatus.ERROR).length;
      const criticalChecks = dayResults.filter(r => r.status === MonitoringStatus.CRITICAL).length;
      
      // Calcular disponibilidad del día
      const availability = totalChecks > 0 
        ? (successChecks / totalChecks) * 100 
        : 0;
      
      // Calcular tiempo de respuesta promedio del día
      const responseTimes = dayResults
        .filter(r => r.responseTime !== null && r.responseTime !== undefined)
        .map(r => r.responseTime as number);
      
      const avgResponseTime = responseTimes.length > 0 
        ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
        : 0;
      
      // Añadir estadísticas del día
      dailyStats.push({
        date: new Date(currentDate).toISOString().split('T')[0],
        totalChecks,
        successChecks,
        warningChecks,
        errorChecks,
        criticalChecks,
        availability,
        avgResponseTime
      });
      
      // Avanzar al siguiente día
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dailyStats;
  }
}
