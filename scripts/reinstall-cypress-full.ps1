#!/usr/bin/env pwsh
# Script para reinstalar completamente Cypress

Write-Host "Iniciando reinstalación completa de Cypress..." -ForegroundColor Cyan

# 1. Eliminar caché de Cypress
Write-Host "Limpiando caché de Cypress..." -ForegroundColor Yellow
npx cypress cache clear

# 2. Eliminar node_modules
Write-Host "Eliminando node_modules..." -ForegroundColor Yellow
if (Test-Path node_modules) {
    Remove-Item -Recurse -Force node_modules
}

# 3. Eliminar package-lock.json para una instalación limpia
Write-Host "Eliminando package-lock.json..." -ForegroundColor Yellow
if (Test-Path package-lock.json) {
    Remove-Item -Force package-lock.json
}

# 4. Reinstalar todas las dependencias
Write-Host "Reinstalando todas las dependencias..." -ForegroundColor Yellow
npm install

# 5. Instalar Cypress específicamente
Write-Host "Instalando Cypress versión 14.2.1..." -ForegroundColor Yellow
npm install cypress@14.2.1 --save-dev

# 6. Verificar la instalación
Write-Host "Verificando la instalación de Cypress..." -ForegroundColor Yellow
npx cypress verify

Write-Host "`nReintalación completada. Ejecuta la prueba básica con: npm run cypress:basic" -ForegroundColor Green
