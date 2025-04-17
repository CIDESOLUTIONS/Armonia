#!/usr/bin/env pwsh
# Script para ejecutar solo la prueba básica de landing page que sabemos que funciona

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "   PROBANDO LANDING PAGE - PROYECTO ARMONÍA" -ForegroundColor Cyan  
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Definir variables
$baseDir = "C:\Users\meciz\Documents\armonia"
$resultsDir = "$baseDir\cypress\results"

# Asegurarse de que la aplicación esté en ejecución
$processName = "node"
$processInfo = Get-Process $processName -ErrorAction SilentlyContinue | Where-Object {$_.CommandLine -like "*frontend*"}

if ($null -eq $processInfo) {
    Write-Host "La aplicación no está en ejecución. Iniciando el servidor..." -ForegroundColor Yellow
    
    # Iniciar el servidor en una nueva ventana
    Start-Process powershell -ArgumentList "-Command", "cd C:\Users\meciz\Documents\armonia\frontend; npm run dev"
    
    # Esperar a que el servidor esté listo
    Write-Host "Esperando que el servidor esté listo (15 segundos)..." -ForegroundColor Yellow
    Start-Sleep -Seconds 15
} else {
    Write-Host "La aplicación ya está en ejecución." -ForegroundColor Green
}

# Crear directorio de resultados si no existe
if (-not (Test-Path -Path $resultsDir)) {
    New-Item -Path $resultsDir -ItemType Directory -Force | Out-Null
    Write-Host "Directorio de resultados creado." -ForegroundColor Green
}

# Limpiar resultados anteriores de esta prueba específica
Write-Host "`nLimpiando resultados anteriores..." -ForegroundColor Yellow
Remove-Item -Path "$baseDir\cypress\videos\basic.cy.js.mp4" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "$baseDir\cypress\screenshots\basic.cy.js" -Recurse -Force -ErrorAction SilentlyContinue

# Ejecutar la prueba
Write-Host "`nEjecutando prueba básica..." -ForegroundColor Yellow
Set-Location -Path $baseDir
npx cypress run --spec "cypress/e2e/basic.cy.js" --headless

# Verificar resultado
$exitCode = $LASTEXITCODE

# Copiar resultados
if (Test-Path "$baseDir\cypress\videos\basic.cy.js.mp4") {
    Copy-Item -Path "$baseDir\cypress\videos\basic.cy.js.mp4" -Destination "$resultsDir\basic-video.mp4" -Force
    Write-Host "Video guardado en: $resultsDir\basic-video.mp4" -ForegroundColor Green
}

if (Test-Path "$baseDir\cypress\screenshots\basic.cy.js") {
    if (-not (Test-Path "$resultsDir\basic-screenshots")) {
        New-Item -Path "$resultsDir\basic-screenshots" -ItemType Directory -Force | Out-Null
    }
    
    Copy-Item -Path "$baseDir\cypress\screenshots\basic.cy.js\*" -Destination "$resultsDir\basic-screenshots" -Recurse -Force
    Write-Host "Capturas de pantalla guardadas en: $resultsDir\basic-screenshots" -ForegroundColor Green
}

# Crear un archivo de resultado simple
$resultContent = @{
    testName = "basic"
    testFile = "basic.cy.js"
    status = if ($exitCode -eq 0) { "passed" } else { "failed" }
    exitCode = $exitCode
    videoPath = if (Test-Path "$resultsDir\basic-video.mp4") { "$resultsDir\basic-video.mp4" } else { $null }
    timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
} | ConvertTo-Json

$resultPath = "$resultsDir\basic-result.json"
Set-Content -Path $resultPath -Value $resultContent

Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host "              PRUEBA COMPLETADA                   " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
if ($exitCode -eq 0) {
    Write-Host "✅ La prueba se ejecutó correctamente sin fallos." -ForegroundColor Green
} else {
    Write-Host "❌ La prueba falló con código de salida: $exitCode" -ForegroundColor Red
}
Write-Host "Resultados guardados en: $resultPath" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan

# Mantener la ventana abierta
Write-Host "`nPresione cualquier tecla para salir..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
