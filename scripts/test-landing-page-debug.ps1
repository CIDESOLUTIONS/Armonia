#!/usr/bin/env pwsh
# Script para ejecutar la prueba de la landing page con depuración

# Directorio actual
$rootDir = $PSScriptRoot
$frontendDir = Join-Path $rootDir "frontend"

Write-Host "Verificando estado del frontend..." -ForegroundColor Cyan

# Verificar si el frontend está en ejecución
$backendRunning = $false
$processName = "node"
$processInfo = Get-Process $processName -ErrorAction SilentlyContinue | Where-Object {$_.CommandLine -like "*frontend*" -and $_.CommandLine -like "*dev*"}

if ($null -eq $processInfo) {
    Write-Host "El frontend no está en ejecución. Iniciando servidor..." -ForegroundColor Yellow
    
    # Iniciar el frontend en una nueva ventana
    Start-Process powershell -ArgumentList "-Command", "cd $frontendDir; npm run dev"
    
    # Esperar a que el servidor esté listo
    Write-Host "Esperando que el servidor esté listo (15 segundos)..." -ForegroundColor Yellow
    Start-Sleep -Seconds 15
} else {
    Write-Host "El frontend ya está en ejecución." -ForegroundColor Green
}

# Navegar al directorio frontend
Set-Location -Path $frontendDir

# Verificar la instalación de Cypress
Write-Host "Verificando instalación de Cypress..." -ForegroundColor Cyan

try {
    # Reinstalar Cypress siempre para asegurarnos
    Write-Host "Reinstalando Cypress..." -ForegroundColor Yellow
    npm uninstall cypress
    npm cache clean --force
    npm install cypress@13.17.0 --save-dev
} catch {
    Write-Host "Error al reinstalar Cypress: $_" -ForegroundColor Red
}

# Mostrar la estructura del directorio de pruebas
Write-Host "Estructura del directorio de pruebas:" -ForegroundColor Yellow
Get-ChildItem -Path (Join-Path $rootDir "cypress\e2e") -Recurse | Select-Object FullName

# Verificar el contenido del archivo de prueba
$specPath = Join-Path $rootDir "cypress\e2e\01-landing-page-final.cy.js"
Write-Host "Contenido del archivo de prueba:" -ForegroundColor Yellow
Get-Content -Path $specPath -Raw

# Ejecutar Cypress en modo verificación
Write-Host "Verificando Cypress..." -ForegroundColor Yellow
& npx cypress verify

# Intentar ejecutar en modo abierto con depuración
Write-Host "Intentando ejecutar Cypress en modo abierto..." -ForegroundColor Yellow
$env:DEBUG = "cypress:*"
& npx cypress open --project $frontendDir --e2e --browser chrome
