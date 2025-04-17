#!/usr/bin/env pwsh
# Script para probar el login usando cURL

Write-Host "Probando login en la API de Armonía..." -ForegroundColor Green

# Datos de login para probar
$loginData = @{
    email = "admin@armonia.com"
    password = "password123"
} | ConvertTo-Json

# Guardar en un archivo temporal
$tempFile = "temp_login.json"
$loginData | Out-File -FilePath $tempFile

# URL de la API
$apiUrl = "http://localhost:3000/api/login"

Write-Host "Enviando solicitud a $apiUrl con los datos:" -ForegroundColor Yellow
Write-Host $loginData -ForegroundColor Yellow

# Realizar solicitud POST con curl
$response = curl -X POST -H "Content-Type: application/json" -d "@$tempFile" $apiUrl

# Imprimir respuesta
Write-Host "Respuesta:" -ForegroundColor Cyan
Write-Host $response

# Limpiar
Remove-Item -Path $tempFile

Write-Host "Prueba completada." -ForegroundColor Green
