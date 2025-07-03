#!/bin/bash

# Script de despliegue automático para Armonía
echo "🚀 Iniciando despliegue automático..."

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm ci

# Generar Prisma Client
echo "🔧 Generando Prisma Client..."
npx prisma generate

# Build de la aplicación
echo "🏗️ Construyendo aplicación..."
npm run build

# Configurar Python
echo "🐍 Configurando Python..."
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

echo "✅ Despliegue completado"
echo "🌐 URL: https://e5h6i7c0mde6.manus.space"

