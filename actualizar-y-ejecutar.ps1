# actualizar-y-ejecutar.ps1
# Script para actualizar dependencias y ejecutar la aplicación Armonía

Write-Host "Actualizando y ejecutando Armonía..." -ForegroundColor Cyan

# Verificar que estamos en la carpeta correcta
if (-not (Test-Path "frontend")) {
    Write-Host "Error: No se encontró la carpeta 'frontend'. Asegúrate de estar en la raíz del proyecto." -ForegroundColor Red
    exit 1
}

# Cambiar al directorio frontend
Set-Location frontend

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

# Actualizar dependencias
Write-Host "Actualizando dependencias..." -ForegroundColor Yellow
npm install

# Generar tipos de Prisma
Write-Host "Generando tipos de Prisma..." -ForegroundColor Yellow
npx prisma generate

# Verificar actualizaciones de esquema de base de datos
Write-Host "Verificando actualizaciones de esquema..." -ForegroundColor Yellow
npx prisma db push

# Ejecutar aplicación en modo desarrollo
Write-Host "Iniciando aplicación en modo desarrollo..." -ForegroundColor Green
Write-Host "La aplicación estará disponible en http://localhost:3000" -ForegroundColor Cyan
Write-Host "Presiona Ctrl+C para detener la aplicación" -ForegroundColor Yellow
npm run dev