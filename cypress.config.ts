import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    // Ajusta `baseUrl` a la URL HTTPS de tu frontend
    baseUrl: 'https://localhost:3000', // Si tu frontend usa este puerto con HTTPS
    viewportWidth: 1280,
    viewportHeight: 720,
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    video: false,
    chromeWebSecurity: false, // Desactiva la seguridad web de Chrome para pruebas CORS
  },
  env: {
    // Asegúrate de que la URL del backend también es HTTPS
    apiUrl: 'https://localhost:443', // Ajusta según tu backend, ahora con HTTPS
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'webpack',
    },
  }
});