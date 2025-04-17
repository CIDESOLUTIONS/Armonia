#!/usr/bin/env pwsh
# Script interactivo para pruebas manuales

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
Show-Title "PRUEBAS INTERACTIVAS DE ARMONIA"

# Verificar si la aplicación está en ejecución
try {
    $connection = Test-NetConnection -Com