const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    // Ajusta `baseUrl` a la URL de tu frontend
    baseUrl: 'http://localhost:3000',
    viewportWidth: 1280,
    viewportHeight: 720,
    supportFile: false, // Desactivamos completamente el supportFile
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    video: true, // Habilitar videos para tener registro visual
    videosFolder: 'cypress/videos',
    screenshotsFolder: 'cypress/screenshots',
    chromeWebSecurity: false, // Desactiva la seguridad web de Chrome para pruebas CORS
    retries: {
      runMode: 2,     // Reintentar 2 veces durante ejecución 'cypress run'
      openMode: 0     // No reintentar en modo interactivo 'cypress open'
    },
    defaultCommandTimeout: 10000, // Aumentar tiempo de espera para evitar fallos por tiempo
    requestTimeout: 10000,
    responseTimeout: 30000,
    pageLoadTimeout: 30000,
  },
  env: {
    // Credenciales de prueba
    adminEmail: 'admin@armonia.com',
    adminPassword: 'Admin123',
    residentEmail: 'residente@test.com',
    residentPassword: 'Residente123',
    receptionEmail: 'recepcion@test.com',
    receptionPassword: 'Recepcion123',
    // URL del backend
    apiUrl: 'https://localhost:443',
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'webpack',
    },
  }
});
