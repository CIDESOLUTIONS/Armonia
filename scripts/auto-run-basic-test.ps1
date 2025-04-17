#!/usr/bin/env pwsh
# Script para automatizar la ejecución de pruebas básicas de Cypress
# Este script puede ser programado en el Programador de Tareas de Windows

$ErrorActionPreference = "Stop"
$logFile = "$PSScriptRoot\cypress\logs\basic-test-$(Get-Date -Format 'yyyy-MM-dd-HH-mm-ss').log"

# Crear directorio de logs si no existe
if (-not (Test-Path "$PSScriptRoot\cypress\logs")) {
    New-Item -ItemType Directory -Path "$PSScriptRoot\cypress\logs" -Force | Out-Null
}

# Función para escribir en el archivo de log y consola
function Write-Log {
    param (
        [string]$Message,
        [string]$ForegroundColor = "White"
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] $Message"
    
    Write-Host $logMessage -ForegroundColor $ForegroundColor
    Add-Content -Path $logFile -Value $logMessage
}

function Check-NextServer {
    Write-Log "Verificando si la aplicación está en ejecución..." -ForegroundColor "Yellow"
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-Log "La aplicación está en ejecución en localhost:3000." -ForegroundColor "Green"
            return $true
        }
    } catch {
        Write-Log "La aplicación no está respondiendo en localhost:3000." -ForegroundColor "Red"
        return $false
    }
}

function Start-NextServer {
    Write-Log "Intentando iniciar el servidor Next.js..." -ForegroundColor "Yellow"
    
    try {
        # Inicia el servidor en un nuevo proceso y no espera a que termine
        $processInfo = Start-Process -FilePath "powershell" -ArgumentList "-Command", "cd '$PSScriptRoot\frontend'; npm run dev" -PassThru -WindowStyle Hidden
        
        # Esperar a que el servidor esté disponible (máximo 30 segundos)
        $startTime = Get-Date
        $timeout = New-TimeSpan -Seconds 30
        $serverStarted = $false
        
        while ((Get-Date) - $startTime -lt $timeout) {
            Start-Sleep -Seconds 2
            if (Check-NextServer) {
                $serverStarted = $true
                break
            }
        }
        
        if ($serverStarted) {
            Write-Log "Servidor Next.js iniciado correctamente." -ForegroundColor "Green"
            return $processInfo
        } else {
            Write-Log "No se pudo iniciar el servidor Next.js dentro del tiempo de espera." -ForegroundColor "Red"
            if ($null -ne $processInfo) {
                Stop-Process -Id $processInfo.Id -Force -ErrorAction SilentlyContinue
            }
            return $null
        }
    } catch {
        Write-Log "Error al iniciar el servidor Next.js: $_" -ForegroundColor "Red"
        return $null
    }
}

# Inicio del script principal
Write-Log "=== INICIO DE EJECUCIÓN AUTOMÁTICA DE PRUEBAS CYPRESS ===" -ForegroundColor "Cyan"

# Verificar si el servidor está en funcionamiento
$serverRunning = Check-NextServer
$serverProcess = $null

if (-not $serverRunning) {
    Write-Log "Iniciando servidor Next.js..." -ForegroundColor "Yellow"
    $serverProcess = Start-NextServer
    
    if ($null -eq $serverProcess) {
        Write-Log "No se pudo iniciar el servidor. Abortando pruebas." -ForegroundColor "Red"
        exit 1
    }
}

# Establecer la URL base para Cypress
$env:CYPRESS_BASE_URL = "http://localhost:3000"

# Ejecutar la prueba básica en modo headless
Write-Log "Ejecutando prueba basic.cy.js en modo headless..." -ForegroundColor "Cyan"

try {
    # Ejecutar usando la configuración específica para prueba básica
    & npx cypress run --spec "cypress/e2e/basic.cy.js" --config-file "cypress/config/basic-test.config.js" --headless
    $exitCode = $LASTEXITCODE
    
    if ($exitCode -eq 0) {
        Write-Log "¡Prueba ejecutada exitosamente!" -ForegroundColor "Green"
    } else {
        Write-Log "La prueba falló con código de salida: $exitCode" -ForegroundColor "Red"
    }
} catch {
    Write-Log "Error al ejecutar la prueba: $_" -ForegroundColor "Red"
    $exitCode = 1
} finally {
    # Si iniciamos el servidor, lo detenemos
    if ($null -ne $serverProcess) {
        Write-Log "Deteniendo el servidor Next.js..." -ForegroundColor "Yellow"
        Stop-Process -Id $serverProcess.Id -Force -ErrorAction SilentlyContinue
    }
    
    Write-Log "=== FIN DE EJECUCIÓN AUTOMÁTICA DE PRUEBAS CYPRESS ===" -ForegroundColor "Cyan"
}

exit $exitCode
