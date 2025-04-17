#!/usr/bin/env pwsh
# Script maestro para configurar Cypress, ejecutar pruebas y preparar para despliegue

# Colores para la salida
$infoColor = "Cyan"
$successColor = "Green"
$warningColor = "Yellow"
$errorColor = "Red"

# Función para mostrar título
function Show-Title {
    param([string]$Title)
    
    $length = $Title.Length + 4
    $border = "=" * $length
    
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
Show-Title "CONFIGURACIÓN DE CYPRESS Y PREPARACIÓN PARA DESPLIEGUE"

# 1. Limpiar archivos de prueba antiguos
Show-Title "LIMPIEZA DE PRUEBAS ANTIGUAS"
if (Ask-YesNo "¿Desea limpiar los archivos de prueba antiguos?") {
    & "$PSScriptRoot\clean-test-files.ps1"
}

# 2. Verificar instalación de Cypress
Show-Title "VERIFICACIÓN DE INSTALACIÓN DE CYPRESS"
try {
    $cypressVersion = npx cypress --version
    Write-Host "Cypress está instalado. Versión: $cypressVersion" -ForegroundColor $successColor
} catch {
    Write-Host "Error al verificar la versión de Cypress. Es posible que no esté instalado correctamente." -ForegroundColor $errorColor
    
    if (Ask-YesNo "¿Desea reinstalar Cypress?") {
        Write-Host "Reinstalando Cypress..." -ForegroundColor $infoColor
        & "$PSScriptRoot\reinstall-cypress.ps1"
    }
}

# 3. Inicializar la base de datos
Show-Title "INICIALIZACIÓN DE LA BASE DE DATOS"
if (Ask-YesNo "¿Desea inicializar la base de datos con datos de prueba?") {
    & "$PSScriptRoot\initialize-database.ps1"
}

# 4. Arreglar credenciales
Show-Title "CONFIGURACIÓN DE CREDENCIALES DE PRUEBA"
if (Ask-YesNo "¿Desea arreglar las credenciales de prueba?") {
    & "$PSScriptRoot\fix-test-credentials.ps1"
}

# 5. Generar informe de estado
Show-Title "GENERACIÓN DE INFORME DE ESTADO"
if (Ask-YesNo "¿Desea generar un informe del estado actual del proyecto?") {
    & "$PSScriptRoot\generate-report.ps1"
}

# 6. Ejecutar pruebas
Show-Title "EJECUCIÓN DE PRUEBAS"
if (Ask-YesNo "¿Desea ejecutar pruebas Cypress?") {
    Write-Host "Opciones de ejecución de pruebas:" -ForegroundColor $infoColor
    Write-Host "1. Ejecutar solo pruebas básicas (landing page y login)" -ForegroundColor $infoColor
    Write-Host "2. Ejecutar todas las pruebas secuencialmente" -ForegroundColor $infoColor
    Write-Host "3. Ejecutar todas las pruebas en modo headless" -ForegroundColor $infoColor
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
            Write-Host "Opción no válida. No se ejecutarán pruebas." -ForegroundColor $warningColor
        }
    }
}

# 7. Sincronizar con GitHub
Show-Title "SINCRONIZACIÓN CON GITHUB"
if (Ask-YesNo "¿Desea sincronizar los cambios con GitHub?") {
    & "$PSScriptRoot\sync-with-github.ps1"
}

# 8. Instrucciones para despliegue
Show-Title "INSTRUCCIONES PARA DESPLIEGUE"
Write-Host "Para preparar el despliegue en producción, siga las instrucciones en ESTRATEGIA_DESPLIEGUE.md" -ForegroundColor $infoColor
Write-Host "`nPara ejecutar el script completo de pruebas y despliegue, use:" -ForegroundColor $infoColor
Write-Host "  ./test-and-deploy.ps1" -ForegroundColor $infoColor

Show-Title "CONFIGURACIÓN COMPLETADA"
Write-Host "La configuración de Cypress y la preparación para despliegue se ha completado exitosamente." -ForegroundColor $successColor
Write-Host "Puede ejecutar las pruebas en cualquier momento utilizando los scripts disponibles." -ForegroundColor $successColor

# Mantener abierta la ventana
Write-Host "`nPresione cualquier tecla para salir..." -ForegroundColor $infoColor
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
