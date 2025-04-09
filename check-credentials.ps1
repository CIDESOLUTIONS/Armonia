#!/usr/bin/env pwsh
# Script para verificar las credenciales de usuarios en la base de datos

Write-Host "Verificando credenciales de usuarios en la base de datos Armonía..." -ForegroundColor Green

# Definir variables de conexión desde .env
$envFile = "C:\Users\meciz\Documents\armonia\frontend\.env"
$envContent = Get-Content $envFile

$DbHost = ($envContent | Select-String "DB_HOST=(.*)").Matches.Groups[1].Value
$DbName = ($envContent | Select-String "DB_NAME=(.*)").Matches.Groups[1].Value
$DbUser = ($envContent | Select-String "DB_USER=(.*)").Matches.Groups[1].Value
$DbPassword = ($envContent | Select-String "DB_PASSWORD=(.*)").Matches.Groups[1].Value
$DbPort = ($envContent | Select-String "DB_PORT=(.*)").Matches.Groups[1].Value

$Env:PGPASSWORD = $DbPassword

# Consultar usuarios en el esquema 'armonia'
Write-Host "Consultando usuarios en el esquema 'armonia'..." -ForegroundColor Cyan
$usersQuery = "SELECT id, email, name, role, password FROM armonia.""User"";"

Write-Host "Ejecutando: $usersQuery" -ForegroundColor Yellow
psql -h $DbHost -U $DbUser -d $DbName -c "$usersQuery"

# Consultar conjunto por defecto
Write-Host "Consultando conjuntos residenciales..." -ForegroundColor Cyan
$complexQuery = "SELECT id, name, ""schemaName"", ""adminEmail"" FROM armonia.""ResidentialComplex"";"

Write-Host "Ejecutando: $complexQuery" -ForegroundColor Yellow
psql -h $DbHost -U $DbUser -d $DbName -c "$complexQuery"

Write-Host "Verificación completada." -ForegroundColor Green
Write-Host "Utilice la información anterior para actualizar las pruebas Cypress." -ForegroundColor Green
