# Script para actualizar dependencias y ejecutar la aplicación
# Este script debe ejecutarse desde PowerShell con permisos de administrador

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

# Navegar al directorio frontend
Set-Location -Path .\frontend

# Paso 1: Instalar dependencias faltantes
Write-Step "Instalando dependencias faltantes..." $colorInfo
try {
    npm install @radix-ui/react-dialog --save
    Write-Host "✓ @radix-ui/react-dialog instalado correctamente" -ForegroundColor $colorSuccess
} catch {
    Write-Host "✗ Error instalando @radix-ui/react-dialog: $_" -ForegroundColor $colorError
}

# Paso 2: Ejecutar linting y correcciones automáticas
Write-Step "Ejecutando ESLint con correcciones automáticas..." $colorInfo
try {
    npx next lint --fix
    Write-Host "✓ Linting completado" -ForegroundColor $colorSuccess
} catch {
    Write-Host "✗ Error en linting: $_" -ForegroundColor $colorError
}

# Paso 3: Generar cliente Prisma actualizado
Write-Step "Generando cliente Prisma..." $colorInfo
try {
    npx prisma generate
    Write-Host "✓ Cliente Prisma generado correctamente" -ForegroundColor $colorSuccess
} catch {
    Write-Host "✗ Error generando cliente Prisma: $_" -ForegroundColor $colorError
}

# Paso 4: Construir la aplicación
Write-Step "Construyendo la aplicación..." $colorInfo
try {
    npm run build
    Write-Host "✓ Aplicación construida correctamente" -ForegroundColor $colorSuccess
} catch {
    Write-Host "✗ Error construyendo la aplicación: $_" -ForegroundColor $colorError
    Write-Host "  Revise los errores específicos arriba" -ForegroundColor $colorWarning
    exit 1
}

# Paso 5: Iniciar la aplicación en modo desarrollo
Write-Step "¿Desea iniciar la aplicación en modo desarrollo? (S/N)" $colorInfo
$respuesta = Read-Host
if ($respuesta -eq "S" -or $respuesta -eq "s") {
    Write-Step "Iniciando aplicación en modo desarrollo..." $colorInfo
    Write-Host "Presione Ctrl+C para detener la aplicación" -ForegroundColor $colorWarning
    npm run dev
} else {
    Write-Step "Instalación y construcción completadas. Para iniciar la aplicación manualmente, ejecute:" $colorInfo
    Write-Host "cd frontend" -ForegroundColor $colorWarning
    Write-Host "npm run dev" -ForegroundColor $colorWarning
}

# Volver al directorio principal
Set-Location -Path ..
