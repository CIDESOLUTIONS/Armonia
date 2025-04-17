#!/usr/bin/env pwsh
# Script para ejecutar la prueba básica de Cypress

Write-Host "Ejecutando prueba básica de Cypress..." -ForegroundColor Cyan

# Verificar si la aplicación está arrancada
$applicationRunning = $false
try {
    $connection = Test-NetConnection -ComputerName localhost -Port 3000 -InformationLevel Quiet -ErrorAction SilentlyContinue
    if ($connection) {
        Write-Host "La aplicación ya está arrancada en http://localhost:3000" -ForegroundColor Green
        $applicationRunning = $true
    } else {
        Write-Host "La aplicación no está arrancada en http://localhost:3000" -ForegroundColor Yellow
        Write-Host "Por favor, inicie la aplicación manualmente con 'npm run dev' en el directorio frontend" -ForegroundColor Yellow
        $startApp = Read-Host "¿Desea continuar con las pruebas? (S/N)"
        if ($startApp -ne "S" -and $startApp -ne "s") {
            Write-Host "Prueba cancelada." -ForegroundColor Red
            exit 1
        }
    }
} catch {
    Write-Host "Error al verificar la aplicación: $_" -ForegroundColor Red
}

# Ejecutar la prueba básica de Cypress
try {
    Write-Host "Iniciando prueba Cypress..." -ForegroundColor Cyan
    Set-Location -Path "C:\Users\meciz\Documents\armonia"
    
    # Establecer la URL base
    $env:CYPRESS_baseUrl = "http://localhost:3000"
    
    # Ejecutar la prueba básica
    npx cypress run --spec "cypress/e2e/basic.cy.js"
    
    # Verificar resultado
    $testResult = $LASTEXITCODE
    
    if ($testResult -eq 0) {
        Write-Host "Prueba básica completada con éxito." -ForegroundColor Green
    } else {
        Write-Host "Prueba básica falló con código: $testResult" -ForegroundColor Red
    }
    
    exit $testResult
} catch {
    Write-Host "Error al ejecutar la prueba de Cypress: $_" -ForegroundColor Red
    exit 1
}
