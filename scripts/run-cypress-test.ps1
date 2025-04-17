#!/usr/bin/env pwsh
# Script para ejecutar pruebas de Cypress
param(
    [string]$SpecFile = "cypress/e2e/01-landing-page-final.cy.js"
)

# Colores para la salida
$infoColor = "Cyan"
$successColor = "Green"
$warningColor = "Yellow"
$errorColor = "Red"

Write-Host "Ejecutando prueba: $SpecFile" -ForegroundColor $infoColor

# Verificar si la aplicación está en ejecución
$processName = "node"
$processInfo = Get-Process $processName -ErrorAction SilentlyContinue | Where-Object {$_.CommandLine -like "*frontend*" -and $_.CommandLine -like "*dev*"}

if ($null -eq $processInfo) {
    Write-Host "La aplicación no está en ejecución. Iniciando el servidor..." -ForegroundColor $warningColor
    
    # Iniciar el servidor en una nueva ventana
    Start-Process powershell -ArgumentList "-Command", "cd C:\Users\meciz\Documents\armonia\frontend; npm run dev"
    
    # Esperar a que el servidor esté listo
    Write-Host "Esperando que el servidor esté listo (15 segundos)..." -ForegroundColor $warningColor
    Start-Sleep -Seconds 15
} else {
    Write-Host "La aplicación ya está en ejecución." -ForegroundColor $successColor
}

# Ejecutar prueba de Cypress
Write-Host "`nIniciando prueba con Cypress..." -ForegroundColor $infoColor
npx cypress run --spec $SpecFile

# Verificar resultado
if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Prueba ejecutada exitosamente." -ForegroundColor $successColor
} else {
    Write-Host "`n❌ Prueba fallida. Código de salida: $LASTEXITCODE" -ForegroundColor $errorColor
}
