# Script para reiniciar Next.js y limpiar la caché
Write-Host "Reiniciando Next.js y limpiando caché..." -ForegroundColor Cyan

# Cambiar al directorio del frontend
Set-Location -Path "C:\Users\meciz\Documents\armonia\frontend"

# Limpiar la caché de Next.js
Write-Host "Eliminando carpeta .next..." -ForegroundColor Yellow
if (Test-Path -Path ".next") {
    Remove-Item -Recurse -Force ".next"
}

Write-Host "Limpiando caché de npm..." -ForegroundColor Yellow
npm cache clean --force

Write-Host "Operación completada. Por favor inicie el servidor de desarrollo manualmente:" -ForegroundColor Green
Write-Host "cd C:\Users\meciz\Documents\armonia\frontend" -ForegroundColor Gray
Write-Host "npm run dev" -ForegroundColor Gray
