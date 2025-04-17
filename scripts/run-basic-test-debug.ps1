#!/usr/bin/env pwsh
# Script para ejecutar prueba básica con depuración

$ErrorActionPreference = "Stop"
$env:DEBUG = "cypress:*"

Write-Host "=== EJECUCIÓN DE PRUEBA BÁSICA CON DEPURACIÓN ===" -ForegroundColor Cyan

# Verificar que la aplicación esté en ejecución
Write-Host "Verificando si la aplicación está en ejecución en localhost:3000..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "La aplicación está en ejecución en localhost:3000." -ForegroundColor Green
    }
} catch {
    Write-Host "ADVERTENCIA: No se pudo conectar a la aplicación en localhost:3000" -ForegroundColor Red
    Write-Host "Asegúrate de que la aplicación esté en ejecución antes de ejecutar las pruebas." -ForegroundColor Red
    exit 1
}

# Establecer la URL base para Cypress
$env:CYPRESS_BASE_URL = "http://localhost:3000"

# Ejecutar la prueba básica directamente usando visit
Write-Host "Creando prueba temporal para visitar la página principal..." -ForegroundColor Yellow
$tempTestContent = @"
describe('Prueba básica de navegación', () => {
  it('Debería poder visitar la página principal', () => {
    cy.visit('http://localhost:3000');
    cy.log('Navegación completa a la URL principal');
  });
});
"@

$tempTestPath = "cypress\e2e\temp-basic.cy.js"
Set-Content -Path $tempTestPath -Value $tempTestContent

# Ejecutar la prueba temporal
Write-Host "Ejecutando prueba temporal..." -ForegroundColor Yellow
try {
    & npx cypress run --spec $tempTestPath
    $exitCode = $LASTEXITCODE
    
    if ($exitCode -eq 0) {
        Write-Host "Prueba temporal ejecutada correctamente." -ForegroundColor Green
    } else {
        Write-Host "Prueba temporal falló con código de salida: $exitCode" -ForegroundColor Red
    }
    
    # Limpiar archivo temporal
    if (Test-Path $tempTestPath) {
        Remove-Item -Force $tempTestPath
    }
    
    exit $exitCode
} catch {
    Write-Host "Error al ejecutar prueba: $_" -ForegroundColor Red
    if (Test-Path $tempTestPath) {
        Remove-Item -Force $tempTestPath
    }
    exit 1
}
