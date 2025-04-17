#!/usr/bin/env pwsh
# Script para ejecutar las pruebas de Cypress de forma manual

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "   EJECUTANDO PRUEBAS CYPRESS - PROYECTO ARMONÍA" -ForegroundColor Cyan  
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

# Verificar Cypress
Write-Host "`nVerificando instalación de Cypress..." -ForegroundColor Yellow
Set-Location -Path $baseDir
Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd $baseDir; npx cypress verify" -Wait

# Limpiar resultados anteriores
Write-Host "`nLimpiando resultados anteriores..." -ForegroundColor Yellow
Remove-Item -Path "$baseDir\cypress\videos\*" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "$baseDir\cypress\screenshots\*" -Force -ErrorAction SilentlyContinue

# Ejecutar pruebas una por una
$testFiles = @(
    "basic.cy.js",
    "landing-page-updated.cy.ts",
    "02-login-updated.cy.ts",
    "03-admin-dashboard-updated.cy.ts",
    "04-resident-dashboard-updated.cy.ts",
    "05-reception-dashboard-updated.cy.ts",
    "06-integration-flow-updated.cy.ts"
)

foreach ($testFile in $testFiles) {
    Write-Host "`nEjecutando prueba: $testFile..." -ForegroundColor Yellow
    
    # Ejecutar la prueba utilizando el comando que funciona manualmente
    $testPath = "cypress/e2e/$testFile"
    Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd $baseDir; npx cypress run --spec `"$testPath`" --headless" -Wait
    
    # Copiar resultados
    $testName = [System.IO.Path]::GetFileNameWithoutExtension($testFile)
    $videoSource = "$baseDir\cypress\videos\$testFile.mp4"
    $videoDestination = "$resultsDir\$testName-video.mp4"
    
    if (Test-Path $videoSource) {
        Copy-Item -Path $videoSource -Destination $videoDestination -Force
        Write-Host "Video guardado en: $videoDestination" -ForegroundColor Green
    }
    
    # Copiar capturas de pantalla si existen
    $screenshotsSource = "$baseDir\cypress\screenshots\$testFile"
    $screenshotsDestination = "$resultsDir\$testName-screenshots"
    
    if (Test-Path $screenshotsSource) {
        if (-not (Test-Path $screenshotsDestination)) {
            New-Item -Path $screenshotsDestination -ItemType Directory -Force | Out-Null
        }
        
        Copy-Item -Path "$screenshotsSource\*" -Destination $screenshotsDestination -Recurse -Force
        Write-Host "Capturas de pantalla guardadas en: $screenshotsDestination" -ForegroundColor Green
    }
    
    # Crear un archivo de resultado simple
    $resultContent = @{
        testName = $testName
        testFile = $testFile
        status = "executed"
        videoPath = $videoDestination
        timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    } | ConvertTo-Json
    
    $resultPath = "$resultsDir\$testName-result.json"
    Set-Content -Path $resultPath -Value $resultContent
    Write-Host "Resultado guardado en: $resultPath" -ForegroundColor Green
}

# Crear informe combinado
Write-Host "`nGenerando informe combinado..." -ForegroundColor Yellow

$combinedReport = @{
    summary = @{
        totalTests = $testFiles.Count
        executedTests = $testFiles.Count
        timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    }
    tests = @()
}

foreach ($testFile in $testFiles) {
    $testName = [System.IO.Path]::GetFileNameWithoutExtension($testFile)
    $resultPath = "$resultsDir\$testName-result.json"
    
    if (Test-Path $resultPath) {
        $testResult = Get-Content -Path $resultPath -Raw | ConvertFrom-Json
        $combinedReport.tests += $testResult
    }
}

$combinedReportPath = "$resultsDir\full-report.json"
Set-Content -Path $combinedReportPath -Value ($combinedReport | ConvertTo-Json -Depth 5)

Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host "              PRUEBAS COMPLETADAS                 " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "Se han ejecutado todas las pruebas disponibles." -ForegroundColor Green
Write-Host "Informe combinado guardado en: $combinedReportPath" -ForegroundColor Green
Write-Host "Todos los resultados están en: $resultsDir" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan

# Mantener la ventana abierta
Write-Host "`nPresione cualquier tecla para salir..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
