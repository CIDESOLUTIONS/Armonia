/**
 * Módulo de registro de servidor
 * Adaptado a CommonJS para compatibilidad con Jest
 */

class ServerLogger {
  /**
   * Constructor del logger
   * @param {string} module - Nombre del módulo que utiliza el logger
   */
  constructor(module) {
    this.module = module;
    this.logLevel = process.env.LOG_LEVEL || 'info';
    
    // Niveles de log y sus valores numéricos
    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3
    };
  }

  /**
   * Determina si un nivel de log debe ser registrado
   * @param {string} level - Nivel de log a verificar
   * @returns {boolean} - Si debe registrarse o no
   */
  shouldLog(level) {
    return this.levels[level] <= this.levels[this.logLevel];
  }

  /**
   * Formatea un mensaje de log
   * @param {string} level - Nivel de log
   * @param {string} message - Mensaje a formatear
   * @returns {string} - Mensaje formateado
   */
  formatMessage(level, message) {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level.toUpperCase()}] [${this.module}] ${message}`;
  }

  /**
   * Registra un mensaje de error
   * @param {string} message - Mensaje a registrar
   */
  error(message) {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message));
    }
  }

  /**
   * Registra un mensaje de advertencia
   * @param {string} message - Mensaje a registrar
   */
  warn(message) {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message));
    }
  }

  /**
   * Registra un mensaje informativo
   * @param {string} message - Mensaje a registrar
   */
  info(message) {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message));
    }
  }

  /**
   * Registra un mensaje de depuración
   * @param {string} message - Mensaje a registrar
   */
  debug(message) {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message));
    }
  }
}

// Exportar la clase usando CommonJS para compatibilidad con Jest
module.exports = {
  ServerLogger
};
