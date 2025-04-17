# Script para instalar dependencias faltantes
Write-Host "Instalando dependencias faltantes para Armonia..." -ForegroundColor Cyan

# Cambiar al directorio del frontend
Set-Location -Path "C:\Users\meciz\Documents\armonia\frontend"

# Instalar las dependencias faltantes
Write-Host "Instalando @radix-ui/react-popover..." -ForegroundColor Yellow
npm install @radix-ui/react-popover --save

Write-Host "Instalando react-day-picker..." -ForegroundColor Yellow
npm install react-day-picker --save

Write-Host "Instalación completada. Por favor reinicie el servidor de desarrollo." -ForegroundColor Green
