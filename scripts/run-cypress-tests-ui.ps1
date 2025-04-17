#!/usr/bin/env pwsh
# Script para ejecutar las pruebas de Cypress a través de la interfaz gráfica

Write-Host "Preparando las pruebas de Cypress para el proyecto Armonía..." -ForegroundColor Green

# Verificar si la aplicación está en ejecución
$processExists = $null -ne (Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue)

if (-not $processExists) {
    Write-Host "La aplicación no está en ejecución. Por favor, inicie la aplicación con 'npm run dev' en el directorio frontend." -ForegroundColor Red
    exit 1
}

# Obtener directorio actual
$currentDir = Get-Location
Write-Host "Directorio actual: $currentDir" -ForegroundColor Yellow

# Establecer la URL base para Cypress
$env:CYPRESS_BASE_URL = "http://localhost:3000"

# Abrir Cypress para ejecutar pruebas interactivamente
Write-Host "Abriendo Cypress para ejecutar pruebas interactivamente..." -ForegroundColor Cyan
npx cypress open

Write-Host "Cypress ha sido cerrado. Esperamos que las pruebas se hayan ejecutado correctamente." -ForegroundColor Green
