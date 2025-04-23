# Script para sincronizar la implementación del sistema de pagos con GitHub
# Ejecutar desde PowerShell

$ErrorActionPreference = "Stop"
$projectRoot = "C:\Users\meciz\Documents\armonia"

Write-Host "Sincronizando cambios del sistema de pagos con GitHub..." -ForegroundColor Cyan

# Cambiar al directorio del proyecto
Set-Location $projectRoot

# Agregar archivos de API de pago
Write-Host "Agregando archivos API de pago..." -ForegroundColor Yellow
git add "frontend/src/app/api/payment/process/route.ts"
git add "frontend/src/app/api/payment/verify/route.ts"

# Agregar archivos de páginas
Write-Host "Agregando archivos de páginas..." -ForegroundColor Yellow
git add 'frontend/src/app/(public)/checkout/page.tsx'
git add 'frontend/src/app/(public)/register-complex/page.tsx'
git add "frontend/src/app/api/register-complex/route.ts"

# Agregar scripts SQL
Write-Host "Agregando scripts SQL..." -ForegroundColor Yellow
git add "scripts/sql/create_payment_tables.sql"
git add "scripts/sql/initialize_payment_data.sql"
git add "scripts/update-payment-system.ps1"
git add "scripts/sync-payment-system.ps1"

# Agregar documentación
Write-Host "Agregando documentación..." -ForegroundColor Yellow
git add "C:\Users\meciz\Documents\Desarrollos\Armonia_Info\Implementacion_Sistema_Pagos.md"

# Hacer commit
Write-Host "Creando commit..." -ForegroundColor Yellow
git commit -m "Implementación del sistema de pagos para planes de suscripción"

# Push al repositorio remoto
Write-Host "Haciendo push a GitHub..." -ForegroundColor Yellow
git push origin main

Write-Host "Sincronización completada!" -ForegroundColor Green
