#!/usr/bin/env pwsh
# Script simplificado para ejecutar pruebas Cypress en modo headless

$ErrorActionPreference = "Stop"
$specFile = "cypress/e2e/basic.cy.js"
$baseUrl = "http://localhost:3000"

Write-Host "=== INICIANDO EJECUCION AUTOMATICA DE PRUEBAS CYPRESS ===" -ForegroundColor Cyan
Write-Host "Archivo de prueba: $specFile" -ForegroundColor Cyan
Write-Host "URL base: $baseUrl" -ForegroundColor Cyan

# Verificar si la aplicación está en ejecución
Write-Host "Verificando si la aplicacion esta en ejecucion..." -ForegroundColor Yellow
$applicationRunning = $false

try {
    $response = Invoke-WebRequest -Uri $baseUrl -UseBasicParsing -TimeoutSec 5 -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 200) {
        Write-Host "Aplicacion verificada: Corriendo en $baseUrl" -ForegroundColor Green
        $applicationRunning = $true
    }
} catch {
    Write-Host "La aplicacion no esta respondiendo en $baseUrl" -ForegroundColor Yellow
}

# Establecer la URL base para Cypress
$env:CYPRESS_BASE_URL = $baseUrl

# Ejecutar la prueba Cypress en modo headless
try {
    Write-Host "Ejecutando prueba Cypress en modo headless..." -ForegroundColor Cyan
    & npx cypress run --spec $specFile --headless
    $exitCode = $LASTEXITCODE
    
    # Verificar el resultado
    if ($exitCode -eq 0) {
        Write-Host "Pruebas ejecutadas exitosamente!" -ForegroundColor Green
    } else {
        Write-Host "Las pruebas fallaron con codigo de salida: $exitCode" -ForegroundColor Red
    }
} catch {
    Write-Host "Error al ejecutar las pruebas Cypress: $_" -ForegroundColor Red
    $exitCode = 99
}

Write-Host "=== FIN DE EJECUCION AUTOMATICA DE PRUEBAS CYPRESS ===" -ForegroundColor Cyan
exit $exitCode
