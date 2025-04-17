#!/usr/bin/env pwsh
# Script para ejecutar pruebas Cypress en modo headless, secuencialmente y con reintentos

param(
    [string]$SpecPattern = "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    [int]$MaxRetries = 2,
    [switch]$FixCredentials = $true
)

$ErrorActionPreference = "Stop"
$global:TestResults = @()

function Start-NextJsServer {
    Write-Host "Verificando si la aplicación está en ejecución..." -ForegroundColor Yellow
    $processName = "node"
    $processInfo = Get-Process $processName -ErrorAction SilentlyContinue | Where-Object {$_.CommandLine -like "*frontend*"}

    if ($null -eq $processInfo) {
        Write-Host "La aplicación no está en ejecución. Iniciando el servidor..." -ForegroundColor Yellow
        
        # Iniciar el servidor en una nueva ventana
        $serverJob = Start-Process powershell -ArgumentList "-Command", "cd C:\Users\meciz\Documents\armonia\frontend; npm run dev" -PassThru
        
        # Esperar a que el servidor esté listo
        Write-Host "Esperando que el servidor esté listo (15 segundos)..." -ForegroundColor Yellow
        Start-Sleep -Seconds 15
        
        return $serverJob
    } else {
        Write-Host "La aplicación ya está en ejecución." -ForegroundColor Green
        return $null
    }
}

function Initialize-Database {
    Write-Host "Inicializando la base de datos con datos de prueba..." -ForegroundColor Cyan
    & "$PSScriptRoot\initialize-database.ps1"
    
    if ($FixCredentials) {
        Write-Host "Arreglando credenciales de usuarios de prueba..." -ForegroundColor Cyan
        & "$PSScriptRoot\fix-test-credentials.ps1"
    }
}

function Get-TestFilesList {
    param (
        [string]$Pattern
    )
    
    if ($Pattern -eq "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}") {
        # Obtener todos los archivos de prueba en orden
        $files = Get-ChildItem -Path "$PSScriptRoot\cypress\e2e" -Recurse -Include "*.cy.js", "*.cy.jsx", "*.cy.ts", "*.cy.tsx" | 
                 Where-Object { $_.Name -match "^\d{2}-" } | 
                 Sort-Object { [int]($_.Name -replace "^(\d{2}).*", '$1') }
        
        # Agregar archivos sin prefijo numérico al final
        $otherFiles = Get-ChildItem -Path "$PSScriptRoot\cypress\e2e" -Recurse -Include "*.cy.js", "*.cy.jsx", "*.cy.ts", "*.cy.tsx" | 
                      Where-Object { $_.Name -notmatch "^\d{2}-" }
        
        return $files + $otherFiles
    }
    else {
        # Si se especificó un patrón específico, usar ese
        return Get-ChildItem -Path "$PSScriptRoot\$Pattern"
    }
}

function Run-CypressTest {
    param (
        [string]$SpecFile,
        [int]$RetryCount = 0
    )
    
    $relativePath = $SpecFile -replace [regex]::Escape($PSScriptRoot), ""
    $relativePath = $relativePath -replace "^\\", ""
    
    Write-Host "`n`n=================================================" -ForegroundColor Cyan
    Write-Host "Ejecutando prueba: $relativePath (Intento: $($RetryCount + 1))" -ForegroundColor Cyan
    Write-Host "=================================================`n" -ForegroundColor Cyan
    
    $startTime = Get-Date
    $exitCode = 0
    
    try {
        & npx cypress run --spec $SpecFile --config video=false
        $exitCode = $LASTEXITCODE
    }
    catch {
        Write-Host "Error al ejecutar la prueba: $_" -ForegroundColor Red
        $exitCode = 1
    }
    
    $endTime = Get-Date
    $duration = $endTime - $startTime
    
    $testResult = @{
        "Spec" = $relativePath
        "Status" = if ($exitCode -eq 0) { "Passed" } else { "Failed" }
        "Duration" = $duration
        "RetryCount" = $RetryCount
    }
    
    if ($exitCode -ne 0 -and $RetryCount -lt $MaxRetries) {
        Write-Host "La prueba falló. Reintentando ($($RetryCount + 1)/$MaxRetries)..." -ForegroundColor Yellow
        $retryResult = Run-CypressTest -SpecFile $SpecFile -RetryCount ($RetryCount + 1)
        return $retryResult
    }
    
    $global:TestResults += $testResult
    
    return $testResult
}

function Show-TestResults {
    Write-Host "`n`n=================================================" -ForegroundColor Cyan
    Write-Host "RESUMEN DE PRUEBAS" -ForegroundColor Cyan
    Write-Host "=================================================`n" -ForegroundColor Cyan
    
    $passedTests = $global:TestResults | Where-Object { $_.Status -eq "Passed" }
    $failedTests = $global:TestResults | Where-Object { $_.Status -eq "Failed" }
    
    Write-Host "Total de pruebas: $($global:TestResults.Count)" -ForegroundColor White
    Write-Host "Pruebas exitosas: $($passedTests.Count)" -ForegroundColor Green
    Write-Host "Pruebas fallidas: $($failedTests.Count)" -ForegroundColor Red
    
    if ($failedTests.Count -gt 0) {
        Write-Host "`nPruebas fallidas:" -ForegroundColor Red
        foreach ($test in $failedTests) {
            Write-Host "  - $($test.Spec)" -ForegroundColor Red
        }
    }
    
    Write-Host "`nDetalles de las pruebas:" -ForegroundColor White
    foreach ($test in $global:TestResults) {
        $statusColor = if ($test.Status -eq "Passed") { "Green" } else { "Red" }
        $retryInfo = if ($test.RetryCount -gt 0) { " (después de $($test.RetryCount) reintentos)" } else { "" }
        
        Write-Host "  - $($test.Spec): " -NoNewline
        Write-Host "$($test.Status)$retryInfo" -ForegroundColor $statusColor -NoNewline
        Write-Host " - Duración: $($test.Duration.TotalSeconds.ToString("0.00")) segundos"
    }
    
    if ($failedTests.Count -gt 0) {
        return 1
    } else {
        return 0
    }
}

# INICIO DEL SCRIPT PRINCIPAL
Write-Host "Ejecutando pruebas de Cypress en modo headless para el proyecto Armonía..." -ForegroundColor Green

# 1. Iniciar servidor Next.js si no está en ejecución
$serverJob = Start-NextJsServer

# 2. Inicializar la base de datos
Initialize-Database

# 3. Establecer la URL base para Cypress
$env:CYPRESS_BASE_URL = "http://localhost:3000"

# 4. Obtener la lista de archivos de prueba
$testFiles = Get-TestFilesList -Pattern $SpecPattern

# 5. Ejecutar las pruebas secuencialmente
Write-Host "Ejecutando ${testFiles.Count} archivos de prueba en secuencia..." -ForegroundColor Cyan

foreach ($file in $testFiles) {
    $result = Run-CypressTest -SpecFile $file.FullName
}

# 6. Mostrar resultados
$exitCode = Show-TestResults

# 7. Detener el servidor si lo iniciamos nosotros
if ($null -ne $serverJob) {
    Write-Host "Deteniendo el servidor Next.js..." -ForegroundColor Yellow
    Stop-Process -Id $serverJob.Id -Force
}

Write-Host "`nPruebas completadas." -ForegroundColor Green
exit $exitCode
