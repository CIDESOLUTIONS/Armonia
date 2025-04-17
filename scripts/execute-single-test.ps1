#!/usr/bin/env pwsh
# Script para ejecutar una prueba individual de Cypress

param(
    [Parameter(Mandatory=$true, Position=0)]
    [string]$TestFile
)

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "     EJECUTANDO PRUEBA INDIVIDUAL: $TestFile    " -ForegroundColor Cyan  
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Definir variables
$baseDir = "C:\Users\meciz\Documents\armonia"
$cypressDir = "$baseDir\cypress"
$resultsDir = "$cypressDir\results"
$testPath = "$cypressDir\e2e\$TestFile"

# 1. Verificar si el archivo de prueba existe
Write-Host "Paso 1: Verificando archivo de prueba..." -ForegroundColor Yellow
if (-not (Test-Path -Path $testPath)) {
    Write-Host "Error: El archivo de prueba '$TestFile' no existe en $cypressDir\e2e\" -ForegroundColor Red
    Write-Host "Archivos disponibles:" -ForegroundColor Yellow
    Get-ChildItem -Path "$cypressDir\e2e" -Filter "*.cy.*" | ForEach-Object {
        Write-Host "  - $($_.Name)" -ForegroundColor White
    }
    exit 1
}

# 2. Ejecutar fix-test-credentials para asegurar que las credenciales sean correctas
Write-Host "`nPaso 2: Verificando credenciales..." -ForegroundColor Yellow
& "$baseDir\scripts\fix-test-credentials.ps1"

# 3. Verificar si la aplicación está en ejecución
Write-Host "`nPaso 3: Verificando si la aplicación está en ejecución..." -ForegroundColor Yellow
$processName = "node"
$processInfo = Get-Process $processName -ErrorAction SilentlyContinue | Where-Object {$_.CommandLine -like "*frontend*"}

if ($null -eq $processInfo) {
    Write-Host "La aplicación no está en ejecución. Iniciándola..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-Command", "cd $baseDir\frontend; npm run dev"
    Write-Host "Esperando que la aplicación esté lista (30 segundos)..." -ForegroundColor Yellow
    Start-Sleep -Seconds 30
} else {
    Write-Host "La aplicación ya está en ejecución." -ForegroundColor Green
}

# 4. Preparar directorio de resultados
Write-Host "`nPaso 4: Preparando directorio de resultados..." -ForegroundColor Yellow
# Crear directorio de resultados si no existe
if (-not (Test-Path -Path $resultsDir)) {
    New-Item -Path $resultsDir -ItemType Directory -Force | Out-Null
    Write-Host "Directorio de resultados creado." -ForegroundColor Green
}

# Nombre base del archivo de resultados
$testName = [System.IO.Path]::GetFileNameWithoutExtension($TestFile)
$resultPath = "$resultsDir\$testName-result.json"

# 5. Ejecutar la prueba
Write-Host "`nPaso 5: Ejecutando prueba: $TestFile" -ForegroundColor Yellow
$env:CYPRESS_BASE_URL = "http://localhost:3000"

# Cambiar al directorio base
cd $baseDir

# Ejecutar la prueba con Cypress
$output = npx cypress run --spec "cypress/e2e/$TestFile" --reporter json --reporter-options "output=$resultPath"

# Verificar resultado
if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Prueba completada exitosamente" -ForegroundColor Green
} else {
    Write-Host "`n❌ La prueba falló con el código de salida: $LASTEXITCODE" -ForegroundColor Red
}

# 6. Verificar y mostrar resultados
Write-Host "`nPaso 6: Verificando resultados..." -ForegroundColor Yellow
if (Test-Path $resultPath) {
    try {
        $resultJson = Get-Content -Path $resultPath -Raw | ConvertFrom-Json
        $stats = $resultJson.stats
        
        Write-Host "`n==================================================" -ForegroundColor Cyan
        Write-Host "               RESULTADOS DE LA PRUEBA             " -ForegroundColor Cyan
        Write-Host "==================================================" -ForegroundColor Cyan
        Write-Host "Archivo de prueba: $TestFile" -ForegroundColor White
        Write-Host "Total de pruebas: $($stats.tests)" -ForegroundColor White
        Write-Host "Pruebas exitosas: $($stats.passes)" -ForegroundColor Green
        Write-Host "Pruebas fallidas: $($stats.failures)" -ForegroundColor $(if ($stats.failures -gt 0) { "Red" } else { "Green" })
        Write-Host "Pruebas pendientes: $($stats.pending)" -ForegroundColor Yellow
        Write-Host "Pruebas omitidas: $($stats.skipped)" -ForegroundColor Yellow
        Write-Host "==================================================" -ForegroundColor Cyan
        
        # Mostrar detalles de fallos si existen
        if ($stats.failures -gt 0 -and $resultJson.failures.Length -gt 0) {
            Write-Host "`nDetalles de fallos:" -ForegroundColor Red
            foreach ($failure in $resultJson.failures) {
                Write-Host "  - $($failure.title)" -ForegroundColor Red
                Write-Host "    Error: $($failure.err.message)" -ForegroundColor Red
            }
        }
        
        Write-Host "`nInforme completo guardado en: $resultPath" -ForegroundColor Yellow
    } catch {
        Write-Host "Error al leer el archivo de resultados: $_" -ForegroundColor Red
        Write-Host "El archivo de resultados puede estar corrupto o en un formato inesperado." -ForegroundColor Red
    }
} else {
    Write-Host "No se encontró el archivo de resultados: $resultPath" -ForegroundColor Red
}

# 7. Comprimir resultados para facilitar su compartición
Write-Host "`nPaso 7: Comprimiendo resultados..." -ForegroundColor Yellow
$zipPath = "$resultsDir\$testName-result.zip"

# Eliminar el zip si ya existe
if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
}

# Crear un zip con el resultado
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zipFile = [System.IO.Compression.ZipFile]::Open($zipPath, 'Create')

# Añadir el archivo de resultados
if (Test-Path $resultPath) {
    $entry = [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zipFile, $resultPath, [System.IO.Path]::GetFileName($resultPath))
}

# Añadir capturas de pantalla si existen
$screenshotsDir = "$cypressDir\screenshots\$testName"
if (Test-Path $screenshotsDir) {
    Get-ChildItem -Path $screenshotsDir -Recurse -File | ForEach-Object {
        $entryName = "screenshots/" + $_.FullName.Substring($screenshotsDir.Length + 1)
        $entry = [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zipFile, $_.FullName, $entryName)
    }
}

# Añadir videos si existen
$videoPath = "$cypressDir\videos\$testName.mp4"
if (Test-Path $videoPath) {
    $entry = [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zipFile, $videoPath, [System.IO.Path]::GetFileName($videoPath))
}

# Cerrar el archivo zip
$zipFile.Dispose()

Write-Host "Resultados comprimidos en: $zipPath" -ForegroundColor Green
Write-Host "`nPuede compartir este archivo ZIP para mostrar los resultados de la prueba." -ForegroundColor White

# Mantener la ventana abierta
Write-Host "`nPresione cualquier tecla para salir..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")