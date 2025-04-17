#!/usr/bin/env pwsh
# Script simple para ejecutar pruebas Cypress en modo headless automáticamente

$ErrorActionPreference = "Stop"
$specFile = "cypress/e2e/basic.cy.js"
$baseUrl = "http://localhost:3000"

Write-Host "=== INICIANDO PRUEBAS CYPRESS EN MODO HEADLESS ===" -ForegroundColor Cyan
Write-Host "Archivo de prueba: $specFile" -ForegroundColor Cyan
Write-Host "URL base: $baseUrl" -ForegroundColor Cyan

# Verificar conexión con la aplicación
try {
    $response = Invoke-WebRequest -Uri $baseUrl -TimeoutSec 5 -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 200) {
        Write-Host "Aplicación verificada en $baseUrl" -ForegroundColor Green
    }
} catch {
    Write-Host "ADVERTENCIA: No se puede conectar a $baseUrl" -ForegroundColor Yellow
    Write-Host "Asegúrate de que la aplicación esté en ejecución antes de continuar" -ForegroundColor Yellow
    $continue = Read-Host "¿Continuar de todos modos? (S/N)"
    if ($continue -ne "S" -and $continue -ne "s") {
        Write-Host "Operación cancelada." -ForegroundColor Red
        exit 1
    }
}

# Establecer URL base para Cypress
$env:CYPRESS_BASE_URL = $baseUrl

# Ejecutar la prueba
Write-Host "Ejecutando prueba Cypress..." -ForegroundColor Cyan
try {
    # Este es el mismo comando que usaste manualmente y funcionó
    npx cypress run --spec $specFile --headless
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "¡Prueba ejecutada exitosamente!" -ForegroundColor Green
    } else {
        Write-Host "La prueba falló con código de salida: $LASTEXITCODE" -ForegroundColor Red
    }
} catch {
    Write-Host "Error al ejecutar Cypress: $_" -ForegroundColor Red
}

Write-Host "=== FIN DE PRUEBAS CYPRESS ===" -ForegroundColor Cyan
