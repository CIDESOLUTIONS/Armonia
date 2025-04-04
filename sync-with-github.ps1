# Script para sincronizar el código del proyecto Armonía con GitHub

param (
    [string]$CommitMessage = "Actualización automática: Mejoras y correcciones",
    [switch]$ForceUpdate = $false
)

# Configuración
$RepoOwner = "meciz"
$RepoName = "Armonia"
$MainBranch = "main"

Write-Host "=== Sincronizando proyecto Armonía con GitHub ===" -ForegroundColor Cyan

# Verificar que estamos en el directorio correcto
$CurrentDirectory = Get-Location
$ExpectedPath = "C:\Users\meciz\Documents\armonia"
if ($CurrentDirectory.Path -ne $ExpectedPath) {
    Write-Host "   [INFO] Cambiando al directorio del proyecto: $ExpectedPath" -ForegroundColor Yellow
    Set-Location -Path $ExpectedPath
}

# Verificar si hay cambios locales sin confirmar
Write-Host "1. Verificando cambios locales..." -ForegroundColor Yellow
$Status = git status --porcelain

if ([string]::IsNullOrWhiteSpace($Status) -and -not $ForceUpdate) {
    Write-Host "   [INFO] No hay cambios locales para sincronizar." -ForegroundColor Green
    Write-Host "   Para forzar una actualización, use el parámetro -ForceUpdate" -ForegroundColor Gray
    exit 0
}

# Verificar conexión con GitHub
Write-Host "2. Verificando conexión con GitHub..." -ForegroundColor Yellow
$RemoteStatus = git remote -v
if (-not $RemoteStatus -or -not $RemoteStatus.Contains("github.com")) {
    Write-Host "   [ERROR] No se encontró una conexión remota a GitHub." -ForegroundColor Red
    Write-Host "   Ejecute: git remote add origin https://github.com/$RepoOwner/$RepoName.git" -ForegroundColor Yellow
    exit 1
}

# Actualizar desde el repositorio remoto
Write-Host "3. Actualizando desde el repositorio remoto..." -ForegroundColor Yellow
git fetch origin

# Verificar si hay cambios remotos que no tengamos
$LocalCommit = git rev-parse HEAD
$RemoteCommit = git rev-parse origin/$MainBranch

if ($LocalCommit -ne $RemoteCommit) {
    Write-Host "   [INFO] Hay cambios en el repositorio remoto. Intentando hacer merge..." -ForegroundColor Yellow
    
    # Intentar hacer merge
    git merge origin/$MainBranch
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   [ERROR] Conflicto al hacer merge. Resuélvalos manualmente y vuelva a intentar." -ForegroundColor Red
        git merge --abort
        exit 1
    }
    
    Write-Host "   [OK] Merge completado exitosamente." -ForegroundColor Green
}

# Agregar todos los cambios
Write-Host "4. Preparando cambios para commit..." -ForegroundColor Yellow
git add --all

# Realizar commit
Write-Host "5. Creando commit con el mensaje: $CommitMessage" -ForegroundColor Yellow
git commit -m $CommitMessage

if ($LASTEXITCODE -ne 0) {
    Write-Host "   [ERROR] Error al crear commit." -ForegroundColor Red
    exit 1
}

# Subir los cambios
Write-Host "6. Subiendo cambios a GitHub..." -ForegroundColor Yellow
git push origin $MainBranch

if ($LASTEXITCODE -ne 0) {
    Write-Host "   [ERROR] Error al subir cambios a GitHub." -ForegroundColor Red
    exit 1
}

Write-Host "=== Sincronización completada exitosamente ===" -ForegroundColor Green
Write-Host "Repositorio: https://github.com/$RepoOwner/$RepoName" -ForegroundColor Cyan
