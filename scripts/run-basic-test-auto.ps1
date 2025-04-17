#!/usr/bin/env pwsh
# Script para ejecutar automáticamente la prueba básica de Cypress en modo headless

$ErrorActionPreference = "Stop"

function Check-NextServer {
    Write-Host "Verificando si la aplicación está en ejecución..." -ForegroundColor Yellow
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-Host "La aplicación está en ejecución en localhost:3000." -ForegroundColor Green
            return $true
        }
    } catch {
        Write-Host "La aplicación no está respondiendo en localhost:3000." -ForegroundColor Red
        return $false
    }
}

# Verificar si el servidor está en funcionamiento
$serverRunning = Check-NextServer

if (-not $serverRunning) {
    Write-Host "ADVERTENCIA: La aplicación debe estar en ejecución en localhost:3000" -ForegroundColor Yellow
    Write-Host "Por favor asegúrate de iniciar la aplicación antes de ejecutar este script." -ForegroundColor Yellow
    exit 1
}

# Establecer la URL base para Cypress
$env:CYPRESS_BASE_URL = "http://localhost:3000"

# Ejecutar la prueba básica en modo headless
Write-Host "Ejecutando prueba basic.cy.js en modo headless..." -ForegroundColor Cyan
try {
    & npx cypress run --spec "cypress/e2e/basic.cy.js" --config video=false --headless
    $exitCode = $LASTEXITCODE
    
    if ($exitCode -eq 0) {
        Write-Host "`n¡Prueba ejecutada exitosamente!" -ForegroundColor Green
    } else {
        Write-Host "`nLa prueba falló con código de salida: $exitCode" -ForegroundColor Red
    }
    
    exit $exitCode
} catch {
    Write-Host "Error al ejecutar la prueba: $_" -ForegroundColor Red
    exit 1
}
