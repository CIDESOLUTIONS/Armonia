const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    viewportWidth: 1280,
    viewportHeight: 720,
    supportFile: false,
    specPattern: 'cypress/e2e/basic.cy.js',
    video: false,
    chromeWebSecurity: false,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 30000,
    pageLoadTimeout: 30000,
  },
  env: {
    // Credenciales de prueba (si las necesita)
    adminEmail: 'admin@armonia.com',
    adminPassword: 'Admin123',
  }
});
