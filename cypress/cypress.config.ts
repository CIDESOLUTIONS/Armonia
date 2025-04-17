import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    // Asegúrate de que este es el URL correcto para tu frontend
    baseUrl: 'http://localhost:3000',
    viewportWidth: 1280,
    viewportHeight: 720,
    // Verifica que este path sea correcto para tu estructura de archivos
    //supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}', // Ahora incluye archivos .js por si acaso
    video: false,
    // Añadimos chromeWebSecurity para manejar CORS en pruebas, si es necesario
    chromeWebSecurity: false,
    modifyObstructiveCode: false,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 30000,
    pageLoadTimeout: 30000,
  },
  env: {
    // Si tu backend corre en HTTPS, cambia esto a 'https://localhost:443' o el puerto correspondiente
    apiUrl: 'https://localhost:443', // Ajusta según tu backend
  },
  // Si estás usando TypeScript, puedes añadir esto para mejorar la integración
  component: {
    devServer: {
      framework: 'react',
      bundler: 'webpack',
    },
  }
});