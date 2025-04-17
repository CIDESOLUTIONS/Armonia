# Script para reinstalar Cypress correctamente

Write-Host "Reinstalando Cypress..." -ForegroundColor Yellow

# Cambiar al directorio del proyecto
Set-Location -Path "C:\Users\meciz\Documents\armonia"

# Desinstalar Cypress completamente
npm uninstall cypress

# Limpiar la caché de npm
npm cache clean --force

# Eliminar directorio de caché de Cypress
Remove-Item -Path "$env:APPDATA\Cypress" -Recurse -Force -ErrorAction SilentlyContinue

# Instalar la versión específica de Cypress
npm install cypress@14.3.0 --save-dev

# Verificar la instalación
npx cypress verify

Write-Host "Reinstalación de Cypress completada." -ForegroundColor Green
