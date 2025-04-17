#!/usr/bin/env pwsh
# Script para ejecución automática de pruebas Cypress en modo headless
# Este script puede ser programado para ejecución periódica

# Configuración
$ErrorActionPreference = "Stop"
$logFolder = "C:\Users\meciz\Documents\armonia\cypress\logs"
$logFile = "$logFolder\$(Get-Date -Format 'yyyy-MM-dd-HH-mm-ss')-cypress-auto.log"
$specFile = "cypress/e2e/basic.cy.js"
$baseUrl = "http://localhost:3000"
$maxWaitSeconds = 30
$screenshotFolder = "C:\Users\meciz\Documents\armonia\cypress\screenshots"

# Crear carpeta de logs si no existe
if (-not (Test-Path $logFolder)) {
    New-Item -ItemType Directory -Path $logFolder -Force | Out-Null
}

# Función para escribir en el log y mostrar en consola
function Write-Log {
    param (
        [string]$Message,
        [System.ConsoleColor]$ForegroundColor = "White"
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] $Message"
    
    Write-Host $logMessage -ForegroundColor $ForegroundColor
    Add-Content -Path $logFile -Value $logMessage
}

# Iniciar el proceso de prueba
Write-Log "=== INICIANDO EJECUCIÓN AUTOMÁTICA DE PRUEBAS CYPRESS ===" -ForegroundColor Cyan
Write-Log "Archivo de prueba: $specFile" -ForegroundColor Cyan
Write-Log "URL base: $baseUrl" -ForegroundColor Cyan
Write-Log "Archivo de log: $logFile" -ForegroundColor Cyan

# Verificar si la aplicación está en ejecución
Write-Log "Verificando si la aplicación está en ejecución..." -ForegroundColor Yellow
$applicationRunning = $false
$startTime = Get-Date

try {
    $response = Invoke-WebRequest -Uri $baseUrl -UseBasicParsing -TimeoutSec 5 -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 200) {
        Write-Log "Aplicación verificada: Corriendo en $baseUrl" -ForegroundColor Green
        $applicationRunning = $true
    }
} catch {
    Write-Log "La aplicación no está respondiendo en $baseUrl" -ForegroundColor Yellow
}

# Si la aplicación no está en ejecución, intentar iniciarla
$appProcess = $null
if (-not $applicationRunning) {
    Write-Log "Intentando iniciar la aplicación..." -ForegroundColor Yellow
    try {
        # Inicia el servidor en un proceso separado
        $appProcess = Start-Process -FilePath "powershell" -ArgumentList "-Command", "cd 'C:\Users\meciz\Documents\armonia\frontend'; npm run dev" -PassThru -WindowStyle Hidden
        Write-Log "Proceso de aplicación iniciado (PID: $($appProcess.Id))" -ForegroundColor Cyan
        
        # Esperar a que el servidor esté disponible
        Write-Log "Esperando que la aplicación esté disponible (max $maxWaitSeconds segundos)..." -ForegroundColor Yellow
        $timeoutTime = (Get-Date).AddSeconds($maxWaitSeconds)
        $isReady = $false
        
        while ((Get-Date) -lt $timeoutTime -and -not $isReady) {
            Start-Sleep -Seconds 2
            try {
                $response = Invoke-WebRequest -Uri $baseUrl -UseBasicParsing -TimeoutSec 2 -ErrorAction SilentlyContinue
                if ($response.StatusCode -eq 200) {
                    $isReady = $true
                    Write-Log "¡Aplicación iniciada correctamente!" -ForegroundColor Green
                }
            } catch {
                Write-Log "." -NoNewline -ForegroundColor Yellow
            }
        }
        
        if (-not $isReady) {
            Write-Log "No se pudo iniciar la aplicación dentro del tiempo de espera." -ForegroundColor Red
            if ($null -ne $appProcess -and -not $appProcess.HasExited) {
                Stop-Process -Id $appProcess.Id -Force -ErrorAction SilentlyContinue
            }
            exit 1
        }
    } catch {
        Write-Log "Error al iniciar la aplicación: $_" -ForegroundColor Red
        exit 1
    }
}

# Establecer la URL base para Cypress si es necesario
$env:CYPRESS_BASE_URL = $baseUrl

# Ejecutar la prueba Cypress en modo headless
try {
    Write-Log "Ejecutando prueba Cypress en modo headless..." -ForegroundColor Cyan
    $cypressOutput = & npx cypress run --spec $specFile --headless 2>&1
    $exitCode = $LASTEXITCODE
    
    # Guardar la salida de Cypress en el log
    Write-Log "--- INICIO SALIDA CYPRESS ---" -ForegroundColor Gray
    foreach ($line in $cypressOutput) {
        Add-Content -Path $logFile -Value $line
    }
    Write-Log "--- FIN SALIDA CYPRESS ---" -ForegroundColor Gray
    
    # Verificar el resultado
    if ($exitCode -eq 0) {
        Write-Log "¡Pruebas ejecutadas exitosamente!" -ForegroundColor Green
    } else {
        Write-Log "Las pruebas fallaron con código de salida: $exitCode" -ForegroundColor Red
    }
    
    # Verificar y registrar screenshots generados
    if (Test-Path $screenshotFolder) {
        $screenshots = Get-ChildItem -Path $screenshotFolder -Recurse -File | Where-Object { $_.LastWriteTime -gt $startTime }
        if ($screenshots.Count -gt 0) {
            Write-Log "Screenshots generados:" -ForegroundColor Cyan
            foreach ($screenshot in $screenshots) {
                Write-Log "  - $($screenshot.FullName)" -ForegroundColor Cyan
            }
        }
    }
} catch {
    Write-Log "Error al ejecutar las pruebas Cypress: $_" -ForegroundColor Red
    $exitCode = 99
} finally {
    # Si iniciamos la aplicación, detenerla
    if ($null -ne $appProcess -and -not $appProcess.HasExited) {
        Write-Log "Deteniendo el proceso de la aplicación (PID: $($appProcess.Id))..." -ForegroundColor Yellow
        try {
            Stop-Process -Id $appProcess.Id -Force -ErrorAction SilentlyContinue
            Write-Log "Proceso de aplicación detenido correctamente." -ForegroundColor Green
        } catch {
            Write-Log "Error al detener el proceso de la aplicación: $_" -ForegroundColor Red
        }
    }
}

Write-Log "=== FIN DE EJECUCIÓN AUTOMÁTICA DE PRUEBAS CYPRESS ===" -ForegroundColor Cyan
exit $exitCode
