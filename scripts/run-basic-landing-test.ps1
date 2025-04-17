#!/usr/bin/env pwsh
# Script para ejecutar la prueba básica de landing page

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "   EJECUTANDO PRUEBA BÁSICA DE LANDING PAGE" -ForegroundColor Cyan  
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Definir variables
$baseDir = "C:\Users\meciz\Documents\armonia"
$cypressDir = "$baseDir\cypress"
$resultsDir = "$cypressDir\results"

# 1. Crear directorio de resultados si no existe
if (-not (Test-Path -Path $resultsDir)) {
    Write-Host "Creando directorio de resultados..." -ForegroundColor Yellow
    New-Item -Path $resultsDir -ItemType Directory -Force | Out-Null
}

# 2. Ejecutar la prueba
Write-Host "Ejecutando prueba básica de landing page..." -ForegroundColor Yellow
Set-Location -Path $baseDir
$env:CYPRESS_BASE_URL = "http://localhost:3000"

# Nombre del archivo de prueba
$testFile = "landing-page-basic.cy.js"
$resultPath = "$resultsDir\landing-page-basic-result.json"

# Ejecutar Cypress
Write-Host "Ejecutando Cypress para: $testFile" -ForegroundColor Yellow
npx cypress run --spec "cypress/e2e/$testFile" --reporter json --reporter-options "output=$resultPath"

# 3. Verificar resultado
if ($LASTEXITCODE -eq 0) {
    Write-Host "Prueba completada exitosamente." -ForegroundColor Green
} else {
    Write-Host "Prueba falló con código de salida: $LASTEXITCODE" -ForegroundColor Red
}

# 4. Verificar archivo de resultados
if (Test-Path $resultPath) {
    Write-Host "Archivo de resultados generado: $resultPath" -ForegroundColor Green
    
    # Mostrar un resumen del resultado
    try {
        $resultJson = Get-Content -Path $resultPath -Raw | ConvertFrom-Json
        $stats = $resultJson.stats
        
        Write-Host "`n==================================================" -ForegroundColor Cyan
        Write-Host "               RESUMEN DE LA PRUEBA               " -ForegroundColor Cyan
        Write-Host "==================================================" -ForegroundColor Cyan
        Write-Host "Total de pruebas: $($stats.tests)" -ForegroundColor White
        Write-Host "Pruebas exitosas: $($stats.passes)" -ForegroundColor Green
        Write-Host "Pruebas fallidas: $($stats.failures)" -ForegroundColor $(if ($stats.failures -gt 0) { "Red" } else { "Green" })
    } catch {
        Write-Host "No se pudo leer el archivo de resultados: $_" -ForegroundColor Red
    }
} else {
    Write-Host "No se generó el archivo de resultados." -ForegroundColor Red
}

Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host "              PRUEBA COMPLETADA                   " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
