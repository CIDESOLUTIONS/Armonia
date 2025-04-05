# sincronizar-con-github.ps1
# Script para sincronizar los cambios con GitHub

Write-Host "Sincronizando cambios con GitHub..." -ForegroundColor Cyan

# Obtener la fecha actual para el mensaje de commit
$fecha = Get-Date -Format "yyyy-MM-dd HH:mm"
$mensaje = "Actualización automática: $fecha"

# Verificar si hay cambios para commit
git status
$hayNuevosCambios = (git status --porcelain).Length -gt 0

if ($hayNuevosCambios) {
    # Agregar todos los cambios
    Write-Host "Agregando cambios al staging..." -ForegroundColor Yellow
    git add .

    # Realizar commit
    Write-Host "Creando commit con los cambios..." -ForegroundColor Yellow
    git commit -m "$mensaje"

    # Sincronizar con el repositorio remoto
    Write-Host "Subiendo cambios a GitHub..." -ForegroundColor Green
    git push
    
    Write-Host "Sincronización completada exitosamente." -ForegroundColor Cyan
} else {
    Write-Host "No hay cambios para sincronizar." -ForegroundColor Cyan
}

# Mostrar el estado final
git status