# Script para inicializar la base de datos con datos de prueba
Write-Host "Inicializando base de datos para el proyecto Armonía..." -ForegroundColor Green

# Definir variables de conexión desde .env
$envFile = "C:\Users\meciz\Documents\armonia\frontend\.env"
$envContent = Get-Content $envFile

$DbHost = ($envContent | Select-String "DB_HOST=(.*)").Matches.Groups[1].Value
$DbName = ($envContent | Select-String "DB_NAME=(.*)").Matches.Groups[1].Value
$DbUser = ($envContent | Select-String "DB_USER=(.*)").Matches.Groups[1].Value
$DbPassword = ($envContent | Select-String "DB_PASSWORD=(.*)").Matches.Groups[1].Value
$DbPort = ($envContent | Select-String "DB_PORT=(.*)").Matches.Groups[1].Value

$Env:PGPASSWORD = $DbPassword

Write-Host "Actualizando información de los conjuntos residenciales..." -ForegroundColor Cyan
psql -h $DbHost -U $DbUser -d $DbName -f "C:\Users\meciz\Documents\armonia\db_initialize.sql"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error al ejecutar el script de inicialización: $LASTEXITCODE" -ForegroundColor Red
    exit 1
}

Write-Host "Insertando datos de prueba (parte 1)..." -ForegroundColor Cyan
psql -h $DbHost -U $DbUser -d $DbName -f "C:\Users\meciz\Documents\armonia\db_test_data.sql"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error al ejecutar el script de datos de prueba (parte 1): $LASTEXITCODE" -ForegroundColor Red
    exit 1
}

Write-Host "Insertando datos de prueba (parte 2)..." -ForegroundColor Cyan
psql -h $DbHost -U $DbUser -d $DbName -f "C:\Users\meciz\Documents\armonia\db_test_data_part2.sql"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error al ejecutar el script de datos de prueba (parte 2): $LASTEXITCODE" -ForegroundColor Red
    exit 1
}

Write-Host "Base de datos inicializada con éxito." -ForegroundColor Green
Write-Host "Datos de prueba insertados para tres conjuntos residenciales:" -ForegroundColor Green
Write-Host "1. Conjunto Residencial Casas del Bosque - 8 casas" -ForegroundColor Yellow
Write-Host "2. Conjunto Residencial Villa del Mar - 10 casas" -ForegroundColor Yellow
Write-Host "3. Conjunto Residencial Torres del Parque - 12 apartamentos" -ForegroundColor Yellow
