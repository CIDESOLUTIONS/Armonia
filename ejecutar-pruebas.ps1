# Script para ejecutar pruebas del proyecto
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

# Navegar al directorio frontend
Set-Location -Path .\frontend

# Paso 1: Ejecutar pruebas unitarias con Jest
Write-Step "Ejecutando pruebas unitarias con Jest..." $colorInfo
try {
    npm test
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Pruebas unitarias completadas exitosamente" -ForegroundColor $colorSuccess
    } else {
        Write-Host "✗ Algunas pruebas unitarias fallaron" -ForegroundColor $colorError
    }
} catch {
    Write-Host "✗ Error ejecutando pruebas unitarias: $_" -ForegroundColor $colorError
}

# Paso 2: Ejecutar pruebas e2e con Cypress
Write-Step "¿Desea ejecutar pruebas e2e con Cypress? (S/N)" $colorInfo
$respuesta = Read-Host
if ($respuesta -eq "S" -or $respuesta -eq "s") {
    Write-Step "Iniciando pruebas e2e..." $colorInfo
    try {
        # Primero aseguramos que la aplicación está construida
        npm run build
        
        # Ejecutamos las pruebas en modo headless
        npm run cypress:run
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Pruebas e2e completadas exitosamente" -ForegroundColor $colorSuccess
        } else {
            Write-Host "✗ Algunas pruebas e2e fallaron" -ForegroundColor $colorError
        }
    } catch {
        Write-Host "✗ Error ejecutando pruebas e2e: $_" -ForegroundColor $colorError
    }
} else {
    Write-Host "Pruebas e2e omitidas" -ForegroundColor $colorWarning
}

# Paso 3: Verificar errores de linting
Write-Step "Verificando errores de linting..." $colorInfo
try {
    npx next lint
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ No se encontraron errores de linting" -ForegroundColor $colorSuccess
    } else {
        Write-Host "✗ Se encontraron errores de linting" -ForegroundColor $colorError
    }
} catch {
    Write-Host "✗ Error verificando linting: $_" -ForegroundColor $colorError
}

# Paso 4: Verificar tipos de TypeScript
Write-Step "Verificando tipos de TypeScript..." $colorInfo
try {
    npx tsc --noEmit
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Verificación de tipos completada exitosamente" -ForegroundColor $colorSuccess
    } else {
        Write-Host "✗ Se encontraron errores de tipos" -ForegroundColor $colorError
    }
} catch {
    Write-Host "✗ Error verificando tipos: $_" -ForegroundColor $colorError
}

# Resumen final
Write-Step "Resumen de pruebas" $colorInfo
Write-Host "Para ejecutar pruebas específicas manualmente:" -ForegroundColor $colorWarning
Write-Host "- Pruebas unitarias: npm test" -ForegroundColor $colorInfo
Write-Host "- Pruebas e2e: npm run cypress:open" -ForegroundColor $colorInfo
Write-Host "- Linting: npx next lint" -ForegroundColor $colorInfo
Write-Host "- Verificación de tipos: npx tsc --noEmit" -ForegroundColor $colorInfo

# Volver al directorio principal
Set-Location -Path ..
