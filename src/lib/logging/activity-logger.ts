/**
 * Mock para el módulo de logging
 * 
 * Este archivo proporciona mocks para las funciones del módulo de logging
 * que son utilizadas por los servicios de PQR durante las pruebas.
 */

/**
 * Clase para registrar actividades en el sistema
 */
export class ActivityLogger {
  /**
   * Registra una actividad en el sistema
   * @param data Datos de la actividad a registrar
   * @returns Promesa que se resuelve cuando se ha registrado la actividad
   */
  static async log(data: any): Promise<void> {
    // En pruebas, simplemente simulamos el registro
    console.log('Mock ActivityLogger.log called with:', data);
    return Promise.resolve();
  }
}
