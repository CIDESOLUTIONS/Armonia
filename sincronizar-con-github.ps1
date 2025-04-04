# Script para sincronizar los cambios con GitHub
# Este script debe ejecutarse desde PowerShell

# Definimos colores para mejor legibilidad
$colorSuccess = "Green"
$colorWarning = "Yellow"
$colorError = "Red"
$colorInfo = "Cyan"

# Función para mostrar mensajes con formato
function Write-Step {
    param (
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host ""
    Write-Host "===> $Message" -ForegroundColor $Color
}

# Obtener la fecha y hora actual para el mensaje de commit
$fechaHora = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

# Paso 1: Verificar el estado actual
Write-Step "Verificando estado actual del repositorio..." $colorInfo
git status

# Paso 2: Agregar archivos modificados
Write-Step "¿Desea agregar todos los archivos modificados? (S/N)" $colorInfo
$respuesta = Read-Host
if ($respuesta -eq "S" -or $respuesta -eq "s") {
    git add .
    Write-Host "✓ Archivos agregados al staging" -ForegroundColor $colorSuccess
} else {
    Write-Host "Operación cancelada por el usuario." -ForegroundColor $colorWarning
    exit 0
}

# Paso 3: Solicitar mensaje de commit
Write-Step "Ingrese un mensaje para el commit (deje en blanco para usar mensaje predeterminado):" $colorInfo
$mensajeCommit = Read-Host
if ([string]::IsNullOrWhiteSpace($mensajeCommit)) {
    $mensajeCommit = "Actualización automática - $fechaHora - Correcciones de código"
}

# Paso 4: Crear commit
Write-Step "Creando commit con mensaje: '$mensajeCommit'..." $colorInfo
try {
    git commit -m $mensajeCommit
    Write-Host "✓ Commit creado correctamente" -ForegroundColor $colorSuccess
} catch {
    Write-Host "✗ Error creando commit: $_" -ForegroundColor $colorError
    exit 1
}

# Paso 5: Subir cambios a GitHub
Write-Step "¿Desea subir los cambios a GitHub ahora? (S/N)" $colorInfo
$respuesta = Read-Host
if ($respuesta -eq "S" -or $respuesta -eq "s") {
    Write-Step "Enviando cambios a GitHub..." $colorInfo
    try {
        git push origin main
        Write-Host "✓ Cambios enviados correctamente a GitHub" -ForegroundColor $colorSuccess
    } catch {
        Write-Host "✗ Error enviando cambios a GitHub: $_" -ForegroundColor $colorError
        
        # Ofrecer instrucciones para resolver manualmente
        Write-Step "Para enviar los cambios manualmente, ejecute:" $colorWarning
        Write-Host "git push origin main" -ForegroundColor $colorInfo
    }
} else {
    Write-Step "Commit realizado localmente. Para subir los cambios manualmente, ejecute:" $colorInfo
    Write-Host "git push origin main" -ForegroundColor $colorWarning
}

# Mensaje final
Write-Step "Proceso completado." $colorSuccess
