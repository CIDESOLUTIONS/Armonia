// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Importar comandos.js usando ES2015 
import './commands'

// Configurar timeout global más largo para esperar elementos
Cypress.config('defaultCommandTimeout', 10000);
Cypress.config('pageLoadTimeout', 30000);

// Ignorar errores no controlados de la aplicación
Cypress.on('uncaught:exception', (err, runnable) => {
  // Regresar false previene que Cypress falle la prueba
  return false;
});

// Manejo para capturas de pantalla en caso de fallo
Cypress.on('test:after:run', (test, runnable) => {
  if (test.state === 'failed') {
    // El complemento de capturas de pantalla toma automáticamente una captura de pantalla
    // pero podemos agregar lógica adicional aquí si es necesario
    console.log(`Test fallido: ${runnable.parent.title} - ${test.title}`);
  }
});
