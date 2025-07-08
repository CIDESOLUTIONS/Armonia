/**
 * Mock de utilidades de fecha para pruebas unitarias y de integración
 * Proporciona funciones estándar de Date que pueden ser mockeadas
 */

// Guardar la implementación original de Date.now
const originalDateNow = Date.now;

// Asegurar que Date.now siempre sea una función
if (typeof Date.now !== 'function') {
  Date.now = function(): number {
    return new Date().getTime();
  };
}

// Función para restaurar la implementación original
export function restoreDateNow(): void {
  Date.now = originalDateNow;
}

// Función para mockear Date.now con un valor específico
export function mockDateNow(timestamp: number): void {
  Date.now = jest.fn().mockReturnValue(timestamp);
}