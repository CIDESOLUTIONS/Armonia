/**
 * Mock de utilidades de fecha para pruebas unitarias y de integración
 * Proporciona funciones estándar de Date que pueden ser mockeadas
 */

// Guardar la implementación original de Date.now
const originalDateNow = Date.now;

// Asegurar que Date.now siempre sea una función
if (typeof Date.now !== 'function') {
  Date.now = function() {
    return new Date().getTime();
  };
}

// Función para restaurar la implementación original
function restoreDateNow() {
  Date.now = originalDateNow;
}

// Función para mockear Date.now con un valor específico
function mockDateNow(timestamp) {
  Date.now = jest.fn().mockReturnValue(timestamp);
}

// Exportar funciones usando CommonJS para compatibilidad con Jest
module.exports = {
  restoreDateNow,
  mockDateNow
};
