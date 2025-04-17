#!/usr/bin/env pwsh
# Script simplificado para ejecutar todas las pruebas de Cypress

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "   EJECUTANDO PRUEBAS CYPRESS - PROYECTO ARMONÍA" -ForegroundColor Cyan  
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Definir variables
$baseDir = "C:\Users\meciz\Documents\armonia"
$resultsDir = "$baseDir\cypress\results"

# 1. Asegurarse de que la aplicación esté en ejecución
$processName = "node"
$processInfo = Get-Process $processName -ErrorAction SilentlyContinue | Where-Object {$_.CommandLine -like "*frontend*"}

if ($null -eq $processInfo) {
    Write-Host "La aplicación no está en ejecución. Iniciando el servidor..." -ForegroundColor Yellow
    
    # Iniciar el servidor en una nueva ventana
    Start-Process powershell -ArgumentList "-Command", "cd $baseDir\frontend; npm run dev"
    
    # Esperar a que el servidor esté listo
    Write-Host "Esperando que el servidor esté listo (15 segundos)..." -ForegroundColor Yellow
    Start-Sleep -Seconds 15
} else {
    Write-Host "La aplicación ya está en ejecución." -ForegroundColor Green
}

# 2. Crear directorio de resultados si no existe
if (-not (Test-Path -Path $resultsDir)) {
    New-Item -Path $resultsDir -ItemType Directory -Force | Out-Null
    Write-Host "Directorio de resultados creado." -ForegroundColor Green
}

# 3. Ejecutar script de creación de usuarios de prueba
Write-Host "`nCreando usuarios de prueba..." -ForegroundColor Yellow
Set-Location -Path $baseDir\frontend
node createTestUsers.js
Set-Location -Path $baseDir

# 4. Limpiar resultados anteriores
Write-Host "`nLimpiando resultados anteriores..." -ForegroundColor Yellow
Remove-Item -Path "$baseDir\cypress\videos\*" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "$baseDir\cypress\screenshots\*" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "$resultsDir\*" -Force -ErrorAction SilentlyContinue

# 5. Definir las pruebas a ejecutar
$testFiles = @(
    "basic.cy.js",  # Prueba básica que ya verificamos que funciona
    "landing-page-basic.cy.js",  # Prueba básica de landing page
    "landing-page-updated.cy.ts",  # Prueba completa de landing page
    "02-login-updated.cy.ts",  # Prueba de login
    "03-admin-dashboard-updated.cy.ts",  # Prueba de panel admin
    "04-resident-dashboard-updated.cy.ts",  # Prueba de panel residente
    "05-reception-dashboard-updated.cy.ts",  # Prueba de panel recepción
    "06-integration-flow-updated.cy.ts"  # Prueba de flujo de integración
)

# 6. Ejecutar cada prueba individual
$successful = @()
$failed = @()

foreach ($testFile in $testFiles) {
    Write-Host "`n-------------------------------------------------" -ForegroundColor Cyan
    Write-Host "Ejecutando prueba: $testFile" -ForegroundColor Yellow
    Write-Host "-------------------------------------------------" -ForegroundColor Cyan
    
    # Ejecutar la prueba
    Set-Location -Path $baseDir
    npx cypress run --spec "cypress/e2e/$testFile" --headless
    
    # Verificar resultado
    $testExitCode = $LASTEXITCODE
    $testName = [System.IO.Path]::GetFileNameWithoutExtension($testFile)
    
    # Crear resultado de la prueba
    $testResult = @{
        testName = $testName
        testFile = $testFile
        status = if ($testExitCode -eq 0) { "passed" } else { "failed" }
        exitCode = $testExitCode
        timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    }
    
    # Guardar resultado
    $resultPath = "$resultsDir\$testName-result.json"
    $testResult | ConvertTo-Json | Set-Content -Path $resultPath
    
    # Actualizar contadores
    if ($testExitCode -eq 0) {
        $successful += $testName
        Write-Host "✅ Prueba superada: $testName" -ForegroundColor Green
    } else {
        $failed += $testName
        Write-Host "❌ Prueba fallida: $testName (código: $testExitCode)" -ForegroundColor Red
    }
    
    # Copiar el video de la prueba si existe
    $videoSource = "$baseDir\cypress\videos\$testFile.mp4"
    if (Test-Path $videoSource) {
        Copy-Item -Path $videoSource -Destination "$resultsDir\$testName-video.mp4" -Force
    }
    
    # Copiar capturas de pantalla si existen
    $screenshotsSource = "$baseDir\cypress\screenshots\$testFile"
    if (Test-Path $screenshotsSource) {
        Copy-Item -Path $screenshotsSource -Destination "$resultsDir\$testName-screenshots" -Recurse -Force
    }
}

# 7. Crear informe final
Write-Host "`nGenerando informe final..." -ForegroundColor Yellow

$reportData = @{
    summary = @{
        totalTests = $testFiles.Count
        successful = $successful.Count
        failed = $failed.Count
        successRate = [math]::Round(($successful.Count / $testFiles.Count) * 100, 2)
        timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    }
    successful = $successful
    failed = $failed
    allTests = $testFiles
}

$reportPath = "$resultsDir\full-report.json"
$reportData | ConvertTo-Json -Depth 3 | Set-Content -Path $reportPath

$zipPath = "$resultsDir\all-results.zip"
if (Test-Path $zipPath) {
    Remove-Item -Path $zipPath -Force
}

Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory($resultsDir, $zipPath)

# 8. Mostrar resumen
Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host "              RESUMEN DE PRUEBAS" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "Total de pruebas: $($testFiles.Count)" -ForegroundColor White
Write-Host "Pruebas exitosas: $($successful.Count)" -ForegroundColor Green
Write-Host "Pruebas fallidas: $($failed.Count)" -ForegroundColor $(if ($failed.Count -gt 0) { "Red" } else { "Green" })
Write-Host "Tasa de éxito: $([math]::Round(($successful.Count / $testFiles.Count) * 100, 2))%" -ForegroundColor White
Write-Host "==================================================" -ForegroundColor Cyan

if ($successful.Count -gt 0) {
    Write-Host "`nPruebas exitosas:" -ForegroundColor Green
    foreach ($test in $successful) {
        Write-Host "  ✓ $test" -ForegroundColor Green
    }
}

if ($failed.Count -gt 0) {
    Write-Host "`nPruebas fallidas:" -ForegroundColor Red
    foreach ($test in $failed) {
        Write-Host "  ✗ $test" -ForegroundColor Red
    }
}

Write-Host "`nInforme guardado en: $reportPath" -ForegroundColor Yellow
Write-Host "Zip con todos los resultados: $zipPath" -ForegroundColor Yellow
Write-Host "`nPuedes subir el archivo ZIP para compartir los resultados completos." -ForegroundColor White
Write-Host "==================================================" -ForegroundColor Cyan

# Mantener la ventana abierta
Write-Host "`nPresione cualquier tecla para salir..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
