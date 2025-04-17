#!/usr/bin/env pwsh
# Script simplificado para ejecutar la prueba de landing page

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "   EJECUTANDO PRUEBA DE LANDING PAGE" -ForegroundColor Cyan  
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
Write-Host "Ejecutando prueba de landing page..." -ForegroundColor Yellow
Set-Location -Path $baseDir
$env:CYPRESS_BASE_URL = "http://localhost:3000"

# Nombre del archivo de prueba
$testFile = "landing-page-updated.cy.ts"
$resultPath = "$resultsDir\landing-page-updated-result.json"

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
} else {
    Write-Host "No se generó el archivo de resultados." -ForegroundColor Red
}

Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host "              PRUEBA COMPLETADA                   " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
