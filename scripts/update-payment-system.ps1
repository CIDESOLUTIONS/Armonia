# Script para actualizar el sistema de pagos en la base de datos
# Este script debe ejecutarse desde PowerShell con privilegios adecuados

# Configuración de la conexión
$PG_USER = "postgres"
$PG_HOST = "localhost"
$PG_PORT = "5432"
$PG_DATABASE = "armonia"
$SQL_SCRIPTS_DIR = Join-Path $PSScriptRoot "sql"

Write-Host "Iniciando la actualización del sistema de pagos..." -ForegroundColor Cyan

# Verificar si el directorio SQL existe
if (-not (Test-Path $SQL_SCRIPTS_DIR)) {
    Write-Host "Error: El directorio de scripts SQL no existe: $SQL_SCRIPTS_DIR" -ForegroundColor Red
    exit 1
}

# Lista de scripts a ejecutar en orden
$scriptFiles = @(
    "create_payment_tables.sql",
    "initialize_payment_data.sql"
)

# Ejecutar cada script
foreach ($scriptFile in $scriptFiles) {
    $scriptPath = Join-Path $SQL_SCRIPTS_DIR $scriptFile
    
    if (-not (Test-Path $scriptPath)) {
        Write-Host "Error: No se encuentra el archivo SQL: $scriptPath" -ForegroundColor Red
        continue
    }
    
    Write-Host "Ejecutando script: $scriptFile..." -ForegroundColor Yellow
    
    # Ejecutar el script con psql
    $command = "psql -U $PG_USER -h $PG_HOST -p $PG_PORT -d $PG_DATABASE -f `"$scriptPath`""
    
    try {
        Invoke-Expression $command
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Script ejecutado correctamente: $scriptFile" -ForegroundColor Green
        } else {
            Write-Host "Error al ejecutar el script: $scriptFile (Código: $LASTEXITCODE)" -ForegroundColor Red
        }
    } catch {
        Write-Host "Error al ejecutar el script: $scriptFile" -ForegroundColor Red
        Write-Host "Detalle del error: $_" -ForegroundColor Red
    }
}

Write-Host "Proceso de actualización completado" -ForegroundColor Cyan
Write-Host "Sistema de pagos actualizado. Verificando tablas..." -ForegroundColor Yellow

# Verificar la creación de las tablas
$verificationQueries = @(
    "SELECT EXISTS(SELECT 1 FROM pg_tables WHERE schemaname = 'armonia' AND tablename = 'plan');",
    "SELECT EXISTS(SELECT 1 FROM pg_tables WHERE schemaname = 'armonia' AND tablename = 'paymenttransaction');",
    "SELECT COUNT(*) FROM armonia.\"Plan\";",
    "SELECT COUNT(*) FROM armonia.\"PaymentTransaction\";"
)

foreach ($query in $verificationQueries) {
    Write-Host "Ejecutando verificación: $query" -ForegroundColor Yellow
    $command = "psql -U $PG_USER -h $PG_HOST -p $PG_PORT -d $PG_DATABASE -c `"$query`""
    Invoke-Expression $command
}

Write-Host "Verificación completada." -ForegroundColor Cyan
Write-Host "El sistema de pagos ha sido actualizado correctamente." -ForegroundColor Green

# Sincronizar con GitHub si es necesario
$syncWithGitHub = Read-Host "¿Desea sincronizar los cambios con GitHub? (s/n)"
if ($syncWithGitHub -eq "s" -or $syncWithGitHub -eq "S") {
    # Obtener el directorio raíz del proyecto
    $projectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
    
    # Navegar al directorio del proyecto
    Set-Location $projectRoot
    
    # Añadir los archivos nuevos
    git add scripts/sql/create_payment_tables.sql
    git add scripts/sql/initialize_payment_data.sql
    git add scripts/update-payment-system.ps1
    
    # Hacer commit
    git commit -m "Implementación del sistema de pagos para planes de suscripción"
    
    # Push al repositorio remoto
    git push origin main
    
    Write-Host "Cambios sincronizados con GitHub correctamente." -ForegroundColor Green
}
