/**
 * Módulo de registro de actividad
 * Adaptado a CommonJS para compatibilidad con Jest
 */

const { ServerLogger } = require('./server-logger');
const logger = new ServerLogger('ActivityLogger');

/**
 * Registra una actividad en el sistema
 * @param {string} schemaName - Nombre del esquema
 * @param {string} userId - ID del usuario
 * @param {string} action - Acción realizada
 * @param {string} resourceType - Tipo de recurso
 * @param {string} resourceId - ID del recurso
 * @param {Object} details - Detalles adicionales
 */
function logActivity(schemaName, userId, action, resourceType, resourceId, details = {}) {
  try {
    logger.info(`[${schemaName}] Usuario ${userId} realizó ${action} en ${resourceType}:${resourceId}`);
    
    // Aquí se implementaría la lógica para guardar en base de datos
    // o enviar a un servicio de monitoreo externo
    
  } catch (error) {
    logger.error(`Error al registrar actividad: ${error.message}`);
  }
}

/**
 * Registra un acceso al sistema
 * @param {string} schemaName - Nombre del esquema
 * @param {string} userId - ID del usuario
 * @param {string} ipAddress - Dirección IP
 * @param {string} userAgent - Agente de usuario
 * @param {boolean} success - Si el acceso fue exitoso
 */
function logAccess(schemaName, userId, ipAddress, userAgent, success) {
  try {
    const status = success ? 'exitoso' : 'fallido';
    logger.info(`[${schemaName}] Acceso ${status} de usuario ${userId} desde ${ipAddress}`);
    
    // Aquí se implementaría la lógica para guardar en base de datos
    // o enviar a un servicio de monitoreo externo
    
  } catch (error) {
    logger.error(`Error al registrar acceso: ${error.message}`);
  }
}

/**
 * Registra un error en el sistema
 * @param {string} schemaName - Nombre del esquema
 * @param {string} userId - ID del usuario (opcional)
 * @param {Error} error - Error ocurrido
 * @param {string} context - Contexto donde ocurrió el error
 */
function logError(schemaName, userId, error, context) {
  try {
    const userInfo = userId ? `Usuario ${userId}` : 'Usuario anónimo';
    logger.error(`[${schemaName}] ${userInfo} - Error en ${context}: ${error.message}`);
    logger.debug(`Stack trace: ${error.stack}`);
    
    // Aquí se implementaría la lógica para guardar en base de datos
    // o enviar a un servicio de monitoreo externo
    
  } catch (err) {
    logger.error(`Error al registrar error: ${err.message}`);
  }
}

// Exportar funciones usando CommonJS para compatibilidad con Jest
module.exports = {
  logActivity,
  logAccess,
  logError
};
