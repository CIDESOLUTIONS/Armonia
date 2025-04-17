#!/usr/bin/env pwsh
# Script mejorado para ejecutar las pruebas de Cypress

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "   EJECUTANDO PRUEBAS CYPRESS - PROYECTO ARMONÍA" -ForegroundColor Cyan  
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Definir variables
$baseDir = "C:\Users\meciz\Documents\armonia"
$frontendDir = "$baseDir\frontend"
$cypressDir = "$baseDir\cypress"
$resultsDir = "$cypressDir\results"

# 1. Verificar si el proyecto está en ejecución
Write-Host "Paso 1: Verificando si el proyecto está en ejecución..." -ForegroundColor Yellow
$processName = "node"
$processInfo = Get-Process $processName -ErrorAction SilentlyContinue | Where-Object {$_.CommandLine -like "*frontend*"}

if ($null -eq $processInfo) {
    Write-Host "La aplicación no está en ejecución. Iniciando el servidor..." -ForegroundColor Yellow
    
    # Iniciar el servidor en una nueva ventana
    Start-Process powershell -ArgumentList "-Command", "cd $frontendDir; npm run dev"
    
    # Esperar a que el servidor esté listo
    Write-Host "Esperando que el servidor esté listo (30 segundos)..." -ForegroundColor Yellow
    Start-Sleep -Seconds 30
} else {
    Write-Host "La aplicación ya está en ejecución." -ForegroundColor Green
}

# 2. Crear usuarios de prueba
Write-Host "`nPaso 2: Creando usuarios de prueba para Cypress..." -ForegroundColor Yellow
try {
    # Ejecutar el script Node.js personalizado para crear usuarios
    cd $frontendDir
    node createTestUsers.js
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error al crear usuarios de prueba: $LASTEXITCODE" -ForegroundColor Red
        Write-Host "Continuando de todos modos..." -ForegroundColor Yellow
    } else {
        Write-Host "Usuarios de prueba creados con éxito." -ForegroundColor Green
    }
    cd $baseDir
} catch {
    Write-Host "Error al crear usuarios de prueba: $_" -ForegroundColor Red
    Write-Host "Continuando de todos modos..." -ForegroundColor Yellow
}

# 3. Preparar entorno de Cypress
Write-Host "`nPaso 3: Preparando entorno de Cypress..." -ForegroundColor Yellow

# Crear directorio de resultados si no existe
if (-not (Test-Path -Path $resultsDir)) {
    New-Item -Path $resultsDir -ItemType Directory -Force | Out-Null
    Write-Host "Directorio de resultados creado." -ForegroundColor Green
}

# Limpieza de resultados anteriores
Write-Host "Limpiando resultados anteriores..." -ForegroundColor Yellow
Remove-Item -Path "$resultsDir\*.json" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "$cypressDir\videos\*" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "$cypressDir\screenshots\*" -Force -ErrorAction SilentlyContinue

# 4. Ejecutar pruebas individuales
Write-Host "`nPaso 4: Ejecutando pruebas individuales..." -ForegroundColor Yellow

$testFiles = @(
    "landing-page-updated.cy.ts",
    "02-login-updated.cy.ts",
    "03-admin-dashboard-updated.cy.ts",
    "04-resident-dashboard-updated.cy.ts",
    "05-reception-dashboard-updated.cy.ts",
    "06-integration-flow-updated.cy.ts"
)

$env:CYPRESS_BASE_URL = "http://localhost:3000"
$totalTests = $testFiles.Count
$passedTests = 0
$failedTests = 0

# Pruebas exitosas y fallidas
$successfulTests = @()
$failedTestsDetails = @()

foreach ($testFile in $testFiles) {
    $testName = [System.IO.Path]::GetFileNameWithoutExtension($testFile)
    $resultPath = "$resultsDir\$testName-result.json"
    
    Write-Host "`n>> Ejecutando prueba: $testFile" -ForegroundColor Magenta
    
    # Ejecutar la prueba individual
    cd $baseDir
    $output = npx cypress run --spec "cypress/e2e/$testFile" --reporter json --reporter-options "output=$resultPath"
    
    # Verificar resultado
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ Prueba completada con éxito" -ForegroundColor Green
        $passedTests++
        $successfulTests += $testName
    } else {
        Write-Host "  ✗ Prueba fallida" -ForegroundColor Red
        $failedTests++
        $failedTestsDetails += @{
            name = $testName
            exitCode = $LASTEXITCODE
        }
    }
    
    # Verificar si se creó el archivo de resultado
    if (Test-Path $resultPath) {
        Write-Host "  Informe de resultados generado en: $resultPath" -ForegroundColor Cyan
    } else {
        # Crear un archivo de resultado mínimo si no existe
        $errorResult = @{
            stats = @{
                tests = 1
                passes = 0
                failures = 1
                pending = 0
                skipped = 0
            }
            failures = @(
                @{
                    title = "Error al ejecutar la prueba"
                    message = "No se pudo generar un reporte de resultados"
                }
            )
        } | ConvertTo-Json -Depth 5
        
        Set-Content -Path $resultPath -Value $errorResult
        Write-Host "  Informe de resultados mínimo generado en: $resultPath" -ForegroundColor Yellow
    }
}

# 5. Generar informe consolidado
Write-Host "`nPaso 5: Generando informe consolidado..." -ForegroundColor Yellow

$combinedReport = @{
    summary = @{
        totalTests = $totalTests
        passedTests = $passedTests
        failedTests = $failedTests
        successRate = [math]::Round(($passedTests / $totalTests) * 100, 2)
    }
    successfulTests = $successfulTests
    failedTests = $failedTestsDetails
    timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
} | ConvertTo-Json -Depth 5

$combinedReportPath = "$resultsDir\full-report.json"
Set-Content -Path $combinedReportPath -Value $combinedReport

# 6. Copiar videos y capturas de pantalla
Write-Host "`nPaso 6: Copiando evidencias visuales..." -ForegroundColor Yellow

# Crear directorios de evidencias
$evidenceDir = "$resultsDir\evidence"
$videosDir = "$evidenceDir\videos"
$screenshotsDir = "$evidenceDir\screenshots"

if (-not (Test-Path -Path $evidenceDir)) {
    New-Item -Path $evidenceDir -ItemType Directory -Force | Out-Null
}
if (-not (Test-Path -Path $videosDir)) {
    New-Item -Path $videosDir -ItemType Directory -Force | Out-Null
}
if (-not (Test-Path -Path $screenshotsDir)) {
    New-Item -Path $screenshotsDir -ItemType Directory -Force | Out-Null
}

# Copiar videos
if (Test-Path "$cypressDir\videos") {
    Copy-Item -Path "$cypressDir\videos\*" -Destination $videosDir -Force -ErrorAction SilentlyContinue
    Write-Host "Videos copiados al directorio de evidencias." -ForegroundColor Green
}

# Copiar capturas de pantalla
if (Test-Path "$cypressDir\screenshots") {
    Copy-Item -Path "$cypressDir\screenshots\*" -Destination $screenshotsDir -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "Capturas de pantalla copiadas al directorio de evidencias." -ForegroundColor Green
}

# 7. Mostrar resumen
Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host "               RESUMEN DE PRUEBAS                " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "Total de pruebas ejecutadas: $totalTests" -ForegroundColor White
Write-Host "Pruebas exitosas: $passedTests" -ForegroundColor Green
Write-Host "Pruebas fallidas: $failedTests" -ForegroundColor Red
Write-Host "Tasa de éxito: $([math]::Round(($passedTests / $totalTests) * 100, 2))%" -ForegroundColor White
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "`nInforme consolidado guardado en: $combinedReportPath" -ForegroundColor Yellow

# 8. Mantener la ventana abierta
Write-Host "`nPresione cualquier tecla para salir..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
