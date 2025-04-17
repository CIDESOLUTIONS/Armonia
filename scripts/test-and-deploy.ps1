#!/usr/bin/env pwsh
# Script maestro para verificar pruebas y desplegar actualizaciones para Armonía

param(
    [switch]$FixOnly = $false,
    [switch]$CleanTests = $true,
    [switch]$SyncGithub = $true,
    [switch]$ForceSequential = $false
)

# Colores para la salida
$infoColor = "Cyan"
$successColor = "Green"
$warningColor = "Yellow"
$errorColor = "Red"

# Función para mostrar título
function Show-Title {
    param([string]$Title)
    
    $length = $Title.Length + 4
    $border = "-" * $length
    
    Write-Host "`n$border" -ForegroundColor $infoColor
    Write-Host "| $Title |" -ForegroundColor $infoColor
    Write-Host "$border`n" -ForegroundColor $infoColor
}

# Función para preguntar sí/no
function Ask-YesNo {
    param([string]$Question)
    
    $response = Read-Host "$Question (S/N)"
    return ($response -eq "S" -or $response -eq "s")
}

# Inicio del script principal
Show-Title "PROCESO DE VERIFICACIÓN Y DESPLIEGUE DE ARMONÍA"

# 1. Limpiar archivos de prueba antiguos
if ($CleanTests) {
    Show-Title "LIMPIEZA DE ARCHIVOS DE PRUEBA"
    & "$PSScriptRoot\clean-test-files.ps1"
}

# 2. Arreglar credenciales
Show-Title "ARREGLANDO CREDENCIALES DE PRUEBA"
& "$PSScriptRoot\fix-test-credentials.ps1"

if ($FixOnly) {
    Write-Host "Modo solo arreglo de credenciales. Finalizando." -ForegroundColor $infoColor
    exit 0
}

# 3. Verificar si hay cambios en el repositorio local
Show-Title "VERIFICANDO CAMBIOS EN EL REPOSITORIO"
Set-Location -Path $PSScriptRoot

$gitStatus = git status --porcelain
if ([string]::IsNullOrEmpty($gitStatus)) {
    Write-Host "No hay cambios pendientes en el repositorio." -ForegroundColor $successColor
} else {
    Write-Host "Cambios detectados en el repositorio:" -ForegroundColor $warningColor
    git status --short
    
    $commitChanges = Ask-YesNo "¿Desea hacer commit de estos cambios antes de ejecutar las pruebas?"
    
    if ($commitChanges) {
        $commitMessage = Read-Host "Ingrese un mensaje para el commit"
        git add .
        git commit -m $commitMessage
        Write-Host "Cambios guardados en commit local." -ForegroundColor $successColor
    } else {
        Write-Host "Los cambios no se han guardado en commit." -ForegroundColor $warningColor
    }
}

# 4. Ejecutar pruebas
Show-Title "EJECUTANDO PRUEBAS DE CYPRESS"

if ($ForceSequential) {
    Write-Host "Ejecutando pruebas secuenciales..." -ForegroundColor $infoColor
    & "$PSScriptRoot\run-sequential-tests.ps1" -ContinueOnError
} else {
    Write-Host "¿Cómo desea ejecutar las pruebas?" -ForegroundColor $infoColor
    Write-Host "1. Validar solo pruebas básicas (landing page y login)" -ForegroundColor $infoColor
    Write-Host "2. Ejecutar todas las pruebas secuencialmente" -ForegroundColor $infoColor
    Write-Host "3. Ejecutar todo en modo headless" -ForegroundColor $infoColor
    $testOption = Read-Host "Seleccione una opción (1-3)"
    
    switch ($testOption) {
        "1" {
            & "$PSScriptRoot\validate-initial-tests.ps1"
        }
        "2" {
            & "$PSScriptRoot\run-sequential-tests.ps1" -ContinueOnError
        }
        "3" {
            & "$PSScriptRoot\run-cypress-headless.ps1"
        }
        default {
            Write-Host "Opción no válida. Ejecutando pruebas básicas." -ForegroundColor $warningColor
            & "$PSScriptRoot\validate-initial-tests.ps1"
        }
    }
}

$testResult = $LASTEXITCODE

# 5. Sincronizar con GitHub si se solicita
if ($SyncGithub -and $testResult -eq 0) {
    Show-Title "SINCRONIZANDO CON GITHUB"
    
    $syncNow = Ask-YesNo "Las pruebas han pasado exitosamente. ¿Desea sincronizar con GitHub ahora?"
    
    if ($syncNow) {
        & "$PSScriptRoot\sync-with-github.ps1"
    } else {
        Write-Host "Sincronización con GitHub omitida por el usuario." -ForegroundColor $infoColor
    }
} elseif ($SyncGithub -and $testResult -ne 0) {
    Write-Host "Las pruebas han fallado. No se sincronizará con GitHub." -ForegroundColor $warningColor
    $forceSyncGithub = Ask-YesNo "¿Desea forzar la sincronización con GitHub a pesar de los fallos en las pruebas?"
    
    if ($forceSyncGithub) {
        & "$PSScriptRoot\sync-with-github.ps1"
    }
}

# 6. Mostrar instrucciones para despliegue (si es necesario)
Show-Title "INSTRUCCIONES PARA PRODUCCIÓN"

Write-Host "Para preparar el despliegue en producción, siga las instrucciones en ESTRATEGIA_DESPLIEGUE.md" -ForegroundColor $infoColor

# Mantener abierta la ventana
Write-Host "`nPresione cualquier tecla para salir..." -ForegroundColor $infoColor
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
