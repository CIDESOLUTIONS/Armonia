const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    // Ajusta `baseUrl` a la URL de tu frontend
    baseUrl: 'http://localhost:3000',
    viewportWidth: 1280,
    viewportHeight: 720,
    supportFile: false, // Desactivamos completamente el supportFile
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    video: false,
    chromeWebSecurity: false, // Desactiva la seguridad web de Chrome para pruebas CORS
  },
  env: {
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
