/**
 * Mock de ServerLogger para pruebas unitarias y de integración
 * Proporciona funcionalidades de logging sin dependencias externas
 */

class ServerLogger {
  constructor(moduleName) {
    this.moduleName = moduleName || 'Unknown';
  }

  info(message, ...args) {
    console.log(`[INFO][${this.moduleName}] ${message}`, ...args);
  }

  error(message, ...args) {
    console.error(`[ERROR][${this.moduleName}] ${message}`, ...args);
  }

  warn(message, ...args) {
    console.warn(`[WARN][${this.moduleName}] ${message}`, ...args);
  }

  debug(message, ...args) {
    console.debug(`[DEBUG][${this.moduleName}] ${message}`, ...args);
  }
}

// Métodos estáticos para uso sin instancia
ServerLogger.info = function(message, ...args) {
  console.log(`[INFO][Global] ${message}`, ...args);
};

ServerLogger.error = function(message, ...args) {
  console.error(`[ERROR][Global] ${message}`, ...args);
};

ServerLogger.warn = function(message, ...args) {
  console.warn(`[WARN][Global] ${message}`, ...args);
};

ServerLogger.debug = function(message, ...args) {
  console.debug(`[DEBUG][Global] ${message}`, ...args);
};

// Exportar la clase usando CommonJS para compatibilidad con Jest
module.exports = {
  ServerLogger
};
