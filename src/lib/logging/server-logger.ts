// src/lib/logging/server-logger.ts
/**
 * Módulo para logging en el servidor
 * Este archivo sirve como stub para las pruebas unitarias
 */

/**
 * Logger para el servidor
 */
export const ServerLogger = {
  /**
   * Registra un mensaje de información
   * @param message Mensaje a registrar
   * @param meta Metadatos adicionales
   */
  info: (message: string, meta?: any): void => {
    console.log(`[INFO] ${message}`, meta || '');
  },

  /**
   * Registra un mensaje de error
   * @param message Mensaje a registrar
   * @param error Error o metadatos adicionales
   */
  error: (message: string, error?: any): void => {
    console.error(`[ERROR] ${message}`, error || '');
  },

  /**
   * Registra un mensaje de advertencia
   * @param message Mensaje a registrar
   * @param meta Metadatos adicionales
   */
  warn: (message: string, meta?: any): void => {
    console.warn(`[WARN] ${message}`, meta || '');
  },

  /**
   * Registra un mensaje de depuración
   * @param message Mensaje a registrar
   * @param meta Metadatos adicionales
   */
  debug: (message: string, meta?: any): void => {
    console.debug(`[DEBUG] ${message}`, meta || '');
  }
};
