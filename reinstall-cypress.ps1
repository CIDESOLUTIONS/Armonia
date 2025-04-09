# Script para reinstalar Cypress completamente
Write-Host "Reinstalando Cypress completamente..." -ForegroundColor Green

# 1. Eliminar la instalación actual de Cypress
Write-Host "Eliminando la instalación actual de Cypress..." -ForegroundColor Yellow
npm uninstall cypress

# 2. Limpiar la caché de Cypress
Write-Host "Limpiando la caché de Cypress..." -ForegroundColor Yellow
$cypressCachePath = "$env:APPDATA\Cypress\Cache"
if (Test-Path $cypressCachePath) {
    Write-Host "Eliminando caché en: $cypressCachePath" -ForegroundColor Yellow
    Remove-Item -Path $cypressCachePath -Recurse -Force
}

# 3. Reinstalar Cypress con una versión específica (más estable)
Write-Host "Reinstalando Cypress versión 12.17.4 (versión estable)..." -ForegroundColor Yellow
npm install cypress@12.17.4 --save-dev

# 4. Crear la estructura básica necesaria de Cypress
Write-Host "Creando estructura básica de Cypress..." -ForegroundColor Yellow

# Crear configuración simple sin supportFile
$configContent = @"
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: false,
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    video: false
  },
});
"@

Set-Content -Path "cypress.config.js" -Value $configContent -Force

# 5. Crear una prueba simple
$testContent = @"
// Prueba simple para verificar que Cypress funciona
describe('Verificación básica', () => {
  it('Debería cargar la página de inicio', () => {
    cy.visit('/');
    cy.contains('h1', 'Gestión integral').should('exist');
  });
});
"@

# Asegurar que el directorio existe
if (-not (Test-Path "cypress\e2e")) {
    New-Item -Path "cypress\e2e" -ItemType Directory -Force
}

Set-Content -Path "cypress\e2e\basic.cy.js" -Value $testContent -Force

Write-Host "Reinstalación completada. Intenta ejecutar Cypress con:" -ForegroundColor Green
Write-Host "npx cypress open" -ForegroundColor Cyan
