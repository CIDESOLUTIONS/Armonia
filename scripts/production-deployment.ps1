#!/usr/bin/env pwsh
# Script para preparar y realizar el paso a producción del proyecto Armonía

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "   ESTRATEGIA DE PASO A PRODUCCIÓN - ARMONÍA" -ForegroundColor Cyan  
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Definir variables
$baseDir = "C:\Users\meciz\Documents\armonia"
$frontendDir = "$baseDir\frontend"
$dockerDir = "$baseDir\docker"

# 1. Verificar si Docker está instalado
Write-Host "Paso 1: Verificando si Docker está instalado..." -ForegroundColor Yellow
$dockerInstalled = $false
try {
    $dockerVersion = docker --version
    Write-Host "Docker instalado: $dockerVersion" -ForegroundColor Green
    $dockerInstalled = $true
} catch {
    Write-Host "Docker no está instalado o no está en el PATH." -ForegroundColor Red
    Write-Host "Por favor, instale Docker antes de continuar." -ForegroundColor Red
}

if (-not $dockerInstalled) {
    Write-Host "`nPara continuar con el despliegue, instale Docker Desktop:" -ForegroundColor Yellow
    Write-Host "https://www.docker.com/products/docker-desktop/" -ForegroundColor White
    exit 1
}

# 2. Crear directorio para archivos Docker
Write-Host "`nPaso 2: Creando directorio para archivos Docker..." -ForegroundColor Yellow
if (-not (Test-Path -Path $dockerDir)) {
    New-Item -Path $dockerDir -ItemType Directory -Force | Out-Null
    Write-Host "Directorio Docker creado: $dockerDir" -ForegroundColor Green
} else {
    Write-Host "El directorio Docker ya existe: $dockerDir" -ForegroundColor Green
}

# 3. Crear Dockerfile para el frontend
Write-Host "`nPaso 3: Creando Dockerfile para el frontend..." -ForegroundColor Yellow
$frontendDockerfile = @'
# Etapa de construcción
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar archivos de proyecto
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Construir la aplicación
RUN npm run build

# Etapa de producción
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copiar archivos necesarios para la ejecución
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/package.json ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules

# Usuario para ejecutar la aplicación
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
RUN chown -R nextjs:nodejs /app
USER nextjs

# Exponer puerto y definir comando de inicio
EXPOSE 3000
CMD ["npm", "start"]
'@

Set-Content -Path "$dockerDir\frontend.Dockerfile" -Value $frontendDockerfile
Write-Host "Dockerfile para frontend creado: $dockerDir\frontend.Dockerfile" -ForegroundColor Green

# 4. Crear Dockerfile para la base de datos
Write-Host "`nPaso 4: Creando Dockerfile para la base de datos..." -ForegroundColor Yellow
$dbDockerfile = @'
FROM postgres:14-alpine

# Variables de entorno para la base de datos
ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=postgres
ENV POSTGRES_DB=armonia

# Copiar scripts de inicialización
COPY ./db_init/*.sql /docker-entrypoint-initdb.d/

# Exponer puerto
EXPOSE 5432
'@

Set-Content -Path "$dockerDir\db.Dockerfile" -Value $dbDockerfile
Write-Host "Dockerfile para base de datos creado: $docker