#!/usr/bin/env pwsh
# Script para automatizar la ejecución de pruebas Cypress en modo headless

param(
    [string]$SpecFile = "cypress/e2e/basic.cy.js",
    [switch]$Browser,
    [string]$BrowserType = "chrome",
    [switch]$Debug
)

$ErrorActionPreference = "Stop"
$logFile = "$(Get-Date -Format 'yyyy-MM-dd-HH-mm')-cypress-run.log"

# Función para escribir en el log y en la consola
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

Write-Log "=== INICIANDO AUTOMATIZACIÓN DE PRUEBAS CYPRESS ===" -ForegroundColor Cyan
Write-Log "Archivo de prueba: $SpecFile" -ForegroundColor Cyan
if ($Browser) {
    Write-Log "Navegador: $BrowserType" -ForegroundColor Cyan
}
if ($Debug) {
    Write-Log "Modo depuración: Activado" -ForegroundColor Cyan
}

# Verificar si la aplicación está en ejecución
Write-Log "Verificando si la aplicación está en ejecución..." -ForegroundColor Yellow
$applicationRunning = $false
try {
    $connection = Test-NetConnection -ComputerName localhost -Port 3000 -InformationLevel Quiet -ErrorAction SilentlyContinue
    if ($connection) {
        Write-Log "La aplicación está funcionando en http://localhost:3000" -ForegroundColor Green
        $applicationRunning = $true
    } else {
        Write-Log "La aplicación no está funcionando en http://localhost:3000" -ForegroundColor Red
        Write-Log "Intentando iniciar la aplicación..." -ForegroundColor Yellow
        
        # Iniciar la aplicación en una nueva ventana
        try {
            Start-Process powershell -ArgumentList "-Command", "cd '$PSScriptRoot\frontend'; npm run dev" -WindowStyle Normal
            
            # Esperar a que la aplicación esté lista
            $maxRetries = 15
            $retryCount = 0
            $applicationStarted = $false
            
            while ($retryCount -lt $maxRetries -and -not $applicationStarted) {
                $retryCount++
                Write-Log "Esperando que la aplicación inicie (intento $retryCount/$maxRetries)..." -ForegroundColor Yellow
                Start-Sleep -Seconds 2
                
                try {
                    $connection = Test-NetConnection -ComputerName localhost -Port 3000 -InformationLevel Quiet -ErrorAction SilentlyContinue
                    if ($connection) {
                        $applicationStarted = $true
                        Write-Log "¡Aplicación iniciada correctamente!" -ForegroundColor Green
                    }
                } catch {
                    # Continuar con el siguiente intento
                }
            }
            
            if (-not $applicationStarted) {
                Write-Log "No se pudo iniciar la aplicación después de $maxRetries intentos. Abortando." -ForegroundColor Red
                exit 1
            }
        } catch {
            Write-Log "Error al iniciar la aplicación: $_" -ForegroundColor Red
            exit 1
        }
    }
} catch {
    Write-Log "Error al verificar el estado de la aplicación: $_" -ForegroundColor Red
}

# Establecer la URL base para Cypress
$env:CYPRESS_BASE_URL = "http://localhost:3000"

# Habilitar depuración si es necesario
if ($Debug) {
    $env:DEBUG = "cypress:*"
    Write-Log "Habilitando modo debug para Cypress" -ForegroundColor Yellow
}

# Construir el comando para ejecutar Cypress
$cypressCommand = "npx cypress run --spec `"$SpecFile`" --headless"

if ($Browser) {
    $cypressCommand += " --browser $BrowserType"
}

# Ejecutar Cypress
Write-Log "Ejecutando pruebas Cypress..." -ForegroundColor Cyan
Write-Log "Comando: $cypressCommand" -ForegroundColor Yellow

try {
    Invoke-Expression $cypressCommand
    $exitCode = $LASTEXITCODE
    
    if ($exitCode -eq 0) {
        Write-Log "¡Pruebas ejecutadas exitosamente!" -ForegroundColor Green
    } else {
        Write-Log "Las pruebas fallaron con código de salida: $exitCode" -ForegroundColor Red
    }
    
    Write-Log "=== FINALIZACIÓN DE PRUEBAS CYPRESS ===" -ForegroundColor Cyan
    exit $exitCode
} catch {
    Write-Log "Error al ejecutar las pruebas: $_" -ForegroundColor Red
    Write-Log "=== FINALIZACIÓN CON ERROR DE PRUEBAS CYPRESS ===" -ForegroundColor Red
    exit 1
}
