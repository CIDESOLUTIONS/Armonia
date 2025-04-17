#!/usr/bin/env pwsh
# Script completo para preparar el entorno y ejecutar las pruebas

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "   EJECUCIÓN COMPLETA DE PRUEBAS - PROYECTO ARMONÍA" -ForegroundColor Cyan  
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Definir variables
$baseDir = "C:\Users\meciz\Documents\armonia"
$scriptsDir = "$baseDir\scripts"

# 1. Verificar y corregir credenciales
Write-Host "Paso 1: Verificando y corregiendo credenciales..." -ForegroundColor Yellow
& "$scriptsDir\fix-test-credentials.ps1"

# 2. Verificar si la aplicación necesita reiniciarse
Write-Host "`nPaso 2: Verificando si es necesario reiniciar la aplicación..." -ForegroundColor Yellow
$processName = "node"
$processInfo = Get-Process $processName -ErrorAction SilentlyContinue | Where-Object {$_.CommandLine -like "*frontend*"}

if ($null -ne $processInfo) {
    Write-Host "Deteniendo la aplicación para aplicar los cambios..." -ForegroundColor Yellow
    Stop-Process -Id $processInfo.Id -Force
    Start-Sleep -Seconds 5
    Write-Host "Aplicación detenida." -ForegroundColor Green
}

# 3. Iniciar la aplicación
Write-Host "`nPaso 3: Iniciando la aplicación..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-Command", "cd $baseDir\frontend; npm run dev"
Write-Host "Esperando que la aplicación esté lista (30 segundos)..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# 4. Ejecutar las pruebas mejoradas
Write-Host "`nPaso 4: Ejecutando las pruebas..." -ForegroundColor Yellow
& "$scriptsDir\run-cypress-improved.ps1"

# 5. Comprimir resultados para subirlos
Write-Host "`nPaso 5: Comprimiendo resultados para subir..." -ForegroundColor Yellow
$resultsDir = "$baseDir\cypress\results"
$zipPath = "$baseDir\cypress\cypress-results.zip"

# Eliminar el archivo zip si ya existe
if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
}

# Comprimir los resultados
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory($resultsDir, $zipPath)

# 6. Mostrar resumen final
Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host "              PROCESO COMPLETADO                  " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "1. Credenciales verificadas y corregidas" -ForegroundColor Green
Write-Host "2. Aplicación reiniciada" -ForegroundColor Green
Write-Host "3. Pruebas ejecutadas" -ForegroundColor Green
Write-Host "4. Resultados comprimidos para subir" -ForegroundColor Green
Write-Host "`nArchivo ZIP con resultados: $zipPath" -ForegroundColor Yellow
Write-Host "`nPuede subir este archivo para compartir los resultados de las pruebas." -ForegroundColor White
Write-Host "==================================================" -ForegroundColor Cyan

# Mantener la ventana abierta
Write-Host "`nPresione cualquier tecla para salir..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")