#!/usr/bin/env pwsh
# Script para ejecutar las pruebas de Cypress

Write-Host "Ejecutando las pruebas de Cypress para el proyecto Armonía..." -ForegroundColor Green

# 1. Asegurarse de que la aplicación esté en ejecución
$processName = "node"
$processInfo = Get-Process $processName -ErrorAction SilentlyContinue | Where-Object {$_.CommandLine -like "*frontend*"}

if ($null -eq $processInfo) {
    Write-Host "La aplicación no está en ejecución. Iniciando el servidor..." -ForegroundColor Yellow
    
    # Iniciar el servidor en una nueva ventana
    Start-Process powershell -ArgumentList "-Command", "cd C:\Users\meciz\Documents\armonia\frontend; npm run dev"
    
    # Esperar a que el servidor esté listo
    Write-Host "Esperando que el servidor esté listo..." -ForegroundColor Yellow
    Start-Sleep -Seconds 15
} else {
    Write-Host "La aplicación ya está en ejecución." -ForegroundColor Green
}

# 2. Preparar la base de datos con datos de prueba
Write-Host "Preparando la base de datos con datos de prueba..." -ForegroundColor Cyan
./initialize-database.ps1

# 3. Ejecutar las pruebas de Cypress
Write-Host "Ejecutando todas las pruebas..." -ForegroundColor Cyan
$env:CYPRESS_BASE_URL = "http://localhost:3000"

# Ejecutar todas las pruebas en modo headless
Write-Host "Ejecutando pruebas en modo headless..." -ForegroundColor Cyan
cd $PSScriptRoot
npx cypress run

# 4. Generar reporte de pruebas
Write-Host "Generando reporte de pruebas..." -ForegroundColor Cyan
# Verificar si existe la carpeta de reportes
if (-not (Test-Path -Path "cypress/reports")) {
    New-Item -Path "cypress/reports" -ItemType Directory
}

# Mover los resultados a la carpeta de reportes
Copy-Item -Path "cypress/videos" -Destination "cypress/reports/videos" -Recurse -Force
Copy-Item -Path "cypress/screenshots" -Destination "cypress/reports/screenshots" -Recurse -Force

Write-Host "Pruebas completadas. El reporte está disponible en la carpeta cypress/reports." -ForegroundColor Green
