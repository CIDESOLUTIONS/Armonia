#!/usr/bin/env pwsh
# Script para reinstalar completamente Cypress según la documentación oficial

$ErrorActionPreference = "Stop"

Write-Host "=== REINSTALACIÓN COMPLETA DE CYPRESS ===" -ForegroundColor Cyan
Write-Host "Paso 1: Limpiando la caché de Cypress..." -ForegroundColor Yellow
try {
    npx cypress cache clear
    Write-Host "Caché de Cypress limpiada con éxito." -ForegroundColor Green
} catch {
    Write-Host "No se pudo limpiar la caché de Cypress: $_" -ForegroundColor Red
}

Write-Host "Paso 2: Borrando node_modules..." -ForegroundColor Yellow
if (Test-Path node_modules) {
    try {
        Remove-Item -Recurse -Force node_modules
        Write-Host "node_modules eliminado correctamente." -ForegroundColor Green
    } catch {
        Write-Host "Error al eliminar node_modules: $_" -ForegroundColor Red
        Write-Host "Intentando con comandos alternativos..." -ForegroundColor Yellow
        
        # Intenta usar rimraf si está disponible
        npx rimraf node_modules
    }
}

Write-Host "Paso 3: Eliminando package-lock.json..." -ForegroundColor Yellow
if (Test-Path package-lock.json) {
    try {
        Remove-Item -Force package-lock.json
        Write-Host "package-lock.json eliminado correctamente." -ForegroundColor Green
    } catch {
        Write-Host "Error al eliminar package-lock.json: $_" -ForegroundColor Red
    }
}

Write-Host "Paso 4: Limpiando la carpeta de Cypress App Data..." -ForegroundColor Yellow
$cypressAppData = "$env:APPDATA\cypress\cy\production"
if (Test-Path $cypressAppData) {
    try {
        Remove-Item -Recurse -Force $cypressAppData
        Write-Host "Cypress App Data limpiados correctamente." -ForegroundColor Green
    } catch {
        Write-Host "Error al limpiar Cypress App Data: $_" -ForegroundColor Red
    }
}

Write-Host "Paso 5: Reinstalando todas las dependencias..." -ForegroundColor Yellow
try {
    npm install
    Write-Host "Dependencias reinstaladas correctamente." -ForegroundColor Green
} catch {
    Write-Host "Error al reinstalar dependencias: $_" -ForegroundColor Red
    exit 1
}

Write-Host "Paso 6: Instalando Cypress específicamente..." -ForegroundColor Yellow
try {
    npm install cypress@latest --save-dev
    Write-Host "Cypress instalado correctamente." -ForegroundColor Green
} catch {
    Write-Host "Error al instalar Cypress: $_" -ForegroundColor Red
    exit 1
}

Write-Host "Paso 7: Verificando la instalación de Cypress..." -ForegroundColor Yellow
try {
    npx cypress verify
    Write-Host "Verificación de Cypress completada exitosamente." -ForegroundColor Green
} catch {
    Write-Host "Error al verificar Cypress: $_" -ForegroundColor Red
    exit 1
}

Write-Host "`n=== REINSTALACIÓN COMPLETADA ===" -ForegroundColor Cyan
Write-Host "Para ejecutar la prueba básica, use: npm run cypress:basic" -ForegroundColor Green
