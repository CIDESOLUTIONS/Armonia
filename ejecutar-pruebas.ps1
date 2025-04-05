# ejecutar-pruebas.ps1
# Script para ejecutar pruebas en el proyecto Armonía

Write-Host "Iniciando pruebas del proyecto Armonía..." -ForegroundColor Cyan

# Verificar que estamos en la carpeta correcta
if (-not (Test-Path "frontend")) {
    Write-Host "Error: No se encontró la carpeta 'frontend'. Asegúrate de estar en la raíz del proyecto." -ForegroundColor Red
    exit 1
}

# Cambiar al directorio frontend
Set-Location frontend

# Instalar dependencias si es necesario
Write-Host "Verificando dependencias..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    Write-Host "Instalando dependencias..." -ForegroundColor Yellow
    npm install
}

# Verificar configuración de entorno
Write-Host "Verificando configuración de entorno..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    Write-Host "Creando archivo .env a partir de .env.example..." -ForegroundColor Yellow
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" -Destination ".env"
    } else {
        Write-Host "Error: No se encontró el archivo .env.example" -ForegroundColor Red
        exit 1
    }
}

# Ejecutar lint para verificar errores de código
Write-Host "Ejecutando lint para verificar errores de código..." -ForegroundColor Yellow
npm run lint

# Ejecutar pruebas unitarias
Write-Host "Ejecutando pruebas unitarias..." -ForegroundColor Yellow
npm test -- --watchAll=false

# Ejecutar aplicación en modo desarrollo
Write-Host "Iniciando aplicación en modo desarrollo..." -ForegroundColor Green
Write-Host "La aplicación estará disponible en http://localhost:3000" -ForegroundColor Cyan
Write-Host "Presiona Ctrl+C para detener la aplicación" -ForegroundColor Yellow
npm run dev