#!/usr/bin/env pwsh
# Script para sincronizar los cambios con el repositorio GitHub

# Colores para la salida
$infoColor = "Cyan"
$successColor = "Green"
$warningColor = "Yellow"
$errorColor = "Red"

# Función para preguntar sí/no
function Ask-YesNo {
    param([string]$Question)
    
    $response = Read-Host "$Question (S/N)"
    return ($response -eq "S" -or $response -eq "s")
}

# Inicio del script principal
Write-Host "Sincronizando cambios con el repositorio GitHub..." -ForegroundColor $infoColor

# 1. Verificar estado del repositorio
Set-Location -Path $PSScriptRoot
$gitStatus = git status --porcelain

if ([string]::IsNullOrEmpty($gitStatus)) {
    Write-Host "No hay cambios pendientes para sincronizar." -ForegroundColor $successColor
    exit 0
}

# 2. Mostrar cambios pendientes
Write-Host "`nCambios pendientes:" -ForegroundColor $infoColor
git status --short

# 3. Confirmar sincronización
if (-not (Ask-YesNo "`n¿Desea sincronizar estos cambios con GitHub?")) {
    Write-Host "Sincronización cancelada por el usuario." -ForegroundColor $warningColor
    exit 0
}

# 4. Agregar todos los cambios
Write-Host "`nAgregando todos los cambios..." -ForegroundColor $infoColor
git add .

# 5. Solicitar mensaje de commit
$commitMessage = Read-Host "`nIngrese un mensaje para el commit"
if ([string]::IsNullOrWhiteSpace($commitMessage)) {
    $commitMessage = "Actualización de configuración de Cypress y scripts de prueba"
}

# 6. Crear commit
Write-Host "`nCreando commit..." -ForegroundColor $infoColor
git commit -m $commitMessage

# 7. Verificar rama actual
$currentBranch = git rev-parse --abbrev-ref HEAD
Write-Host "`nRama actual: $currentBranch" -ForegroundColor $infoColor

# 8. Confirmar push
if (-not (Ask-YesNo "`n¿Desea hacer push a la rama '$currentBranch'?")) {
    Write-Host "Push cancelado por el usuario. Los cambios están en commit local." -ForegroundColor $warningColor
    exit 0
}

# 9. Realizar push
Write-Host "`nEnviando cambios a GitHub..." -ForegroundColor $infoColor
git push origin $currentBranch

# 10. Verificar resultado
if ($LASTEXITCODE -eq 0) {
    Write-Host "`nCambios sincronizados exitosamente con GitHub." -ForegroundColor $successColor
    Write-Host "Rama: $currentBranch" -ForegroundColor $successColor
    Write-Host "Mensaje de commit: $commitMessage" -ForegroundColor $successColor
} else {
    Write-Host "`nError al sincronizar con GitHub. Código de salida: $LASTEXITCODE" -ForegroundColor $errorColor
    Write-Host "Revise los mensajes de error anteriores para más detalles." -ForegroundColor $errorColor
}
