# Script para ejecutar pruebas y verificar errores en el proyecto Armonía

Write-Host "=== Iniciando pruebas del proyecto Armonía ===" -ForegroundColor Cyan

# Paso 1: Verificar que los servicios necesarios estén activos
Write-Host "1. Verificando servicios requeridos..." -ForegroundColor Yellow

# Comprobar si PostgreSQL está corriendo
$pgService = Get-Process -Name postgres -ErrorAction SilentlyContinue
if (-not $pgService) {
    Write-Host "   [ERROR] PostgreSQL no está activo. Inicie el servicio antes de continuar." -ForegroundColor Red
    exit 1
}
Write-Host "   [OK] PostgreSQL está activo" -ForegroundColor Green

# Paso 2: Verificar conexión a la base de datos
Write-Host "2. Verificando conexión a base de datos..." -ForegroundColor Yellow
$env:PGPASSWORD = "Meciza1964!"
$testConnection = & psql -U postgres -d armonia -c "SELECT 1" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "   [ERROR] No se pudo conectar a la base de datos 'armonia'." -ForegroundColor Red
    Write-Host "   Error: $testConnection" -ForegroundColor Red
    exit 1
}
Write-Host "   [OK] Conexión a base de datos exitosa" -ForegroundColor Green

# Paso 3: Ejecutar linting para detectar errores
Write-Host "3. Ejecutando verificación de código..." -ForegroundColor Yellow
Set-Location -Path "./frontend"
$lintResult = npm run lint
if ($LASTEXITCODE -ne 0) {
    Write-Host "   [ADVERTENCIA] Se encontraron problemas en el código. Revise los errores y corríjalos." -ForegroundColor Yellow
    Write-Host $lintResult
} else {
    Write-Host "   [OK] No se encontraron problemas en el código" -ForegroundColor Green
}

# Paso 4: Ejecutar pruebas de Cypress
Write-Host "4. Preparando para ejecutar pruebas end-to-end..." -ForegroundColor Yellow

# Iniciar el servidor en modo desarrollo
$serverProcess = Start-Process -FilePath "npm" -ArgumentList "run dev" -NoNewWindow -PassThru
Write-Host "   Esperando a que el servidor inicie (20 segundos)..." -ForegroundColor Yellow
Start-Sleep -Seconds 20

# Ejecutar pruebas de Cypress
Write-Host "   Ejecutando pruebas de Cypress..." -ForegroundColor Yellow
$cypressResult = npm run cypress:run

# Detener el servidor
Stop-Process -Id $serverProcess.Id -Force
Write-Host "   Servidor detenido" -ForegroundColor Yellow

if ($LASTEXITCODE -ne 0) {
    Write-Host "   [ERROR] Las pruebas end-to-end fallaron. Revise los errores." -ForegroundColor Red
} else {
    Write-Host "   [OK] Todas las pruebas end-to-end pasaron correctamente" -ForegroundColor Green
}

# Paso 5: Verificar rendimiento y accesibilidad
Write-Host "5. Ejecutando análisis de rendimiento y accesibilidad..." -ForegroundColor Yellow

# Iniciar el servidor nuevamente
$serverProcess = Start-Process -FilePath "npm" -ArgumentList "run dev" -NoNewWindow -PassThru
Write-Host "   Esperando a que el servidor inicie (10 segundos)..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Ejecutar Lighthouse a través de Cypress
Write-Host "   Ejecutando análisis Lighthouse..." -ForegroundColor Yellow
$lighthouseResult = npm run cypress:lighthouse

# Detener el servidor
Stop-Process -Id $serverProcess.Id -Force
Write-Host "   Servidor detenido" -ForegroundColor Yellow

Write-Host "=== Pruebas finalizadas ===" -ForegroundColor Cyan
