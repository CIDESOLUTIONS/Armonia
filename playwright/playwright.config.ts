import { defineConfig, devices } from '@playwright/test';

/**
 * Configuración para pruebas E2E con Playwright
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: '../e2e',
  /* Tiempo máximo que puede ejecutarse una prueba */
  timeout: 30 * 1000,
  /* Esperar a que la página cargue completamente antes de ejecutar la prueba */
  expect: {
    timeout: 5000
  },
  /* Número de reintentos para pruebas fallidas */
  retries: process.env.CI ? 2 : 0,
  /* Reporteros para mostrar resultados de pruebas */
  reporter: 'html',
  /* Configuraciones compartidas para todos los proyectos */
  use: {
    /* Base URL para navegar */
    baseURL: 'http://localhost:3000',
    /* Capturar screenshot solo en fallos */
    screenshot: 'only-on-failure',
    /* Recolectar trazas en fallos */
    trace: 'on-first-retry',
  },
  /* Configuración de proyectos para diferentes navegadores */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  /* Servidor web para pruebas */
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
});
