/**
 * Mock de NotificationService para pruebas unitarias y de integración
 * Implementado como clase constructora para compatibilidad con tests
 */

class NotificationService {
  constructor(schema) {
    this.schema = schema || 'public';
  }

  /**
   * Envía una notificación a un usuario
   * @param {Object} options - Opciones de la notificación
   * @returns {Promise<Object>} - Resultado del envío
   */
  async sendNotification(options) {
    return {
      success: true,
      id: `mock_notification_${Date.now()}`,
      sentAt: new Date().toISOString()
    };
  }

  /**
   * Envía una notificación a múltiples usuarios
   * @param {Array} userIds - IDs de usuarios destinatarios
   * @param {Object} options - Opciones de la notificación
   * @returns {Promise<Object>} - Resultado del envío
   */
  async sendBulkNotification(userIds, options) {
    return {
      success: true,
      total: userIds.length,
      sent: userIds.length,
      failed: 0
    };
  }

  /**
   * Envía una alerta de monitoreo
   * @param {Object} alert - Datos de la alerta
   * @returns {Promise<Object>} - Resultado del envío
   */
  async sendMonitoringAlert(alert) {
    return {
      success: true,
      id: `mock_alert_${Date.now()}`,
      sentAt: new Date().toISOString()
    };
  }

  /**
   * Registra una notificación en la base de datos
   * @param {Object} data - Datos de la notificación
   * @returns {Promise<Object>} - Notificación registrada
   */
  async logNotification(data) {
    return {
      id: Math.floor(Math.random() * 1000),
      ...data,
      createdAt: new Date().toISOString()
    };
  }
}

// Exportar la clase usando CommonJS para compatibilidad con Jest
module.exports = {
  NotificationService
};
