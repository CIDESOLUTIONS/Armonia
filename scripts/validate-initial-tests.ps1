#!/usr/bin/env pwsh
# Script para validar las primeras pruebas de Cypress (landing page y login)

Write-Host "Validando las pruebas iniciales de Cypress para Armonía..." -ForegroundColor Green

# 1. Arreglar credenciales
Write-Host "Arreglando credenciales de usuarios de prueba..." -ForegroundColor Cyan
& "$PSScriptRoot\fix-test-credentials.ps1"

# 2. Verificar si el servidor está en ejecución
$processName = "node"
$processInfo = Get-Process $processName -ErrorAction SilentlyContinue | Where-Object {$_.CommandLine -like "*frontend*"}
$serverStarted = $false

if ($null -eq $processInfo) {
    Write-Host "La aplicación no está en ejecución. Iniciando el servidor..." -ForegroundColor Yellow
    
    # Iniciar el servidor en una nueva ventana
    $serverJob = Start-Process powershell -ArgumentList "-Command", "cd C:\Users\meciz\Documents\armonia\frontend; npm run dev" -PassThru
    
    # Esperar a que el servidor esté listo
    Write-Host "Esperando que el servidor esté listo (15 segundos)..." -ForegroundColor Yellow
    Start-Sleep -Seconds 15
    
    $serverStarted = $true
} else {
    Write-Host "La aplicación ya está en ejecución." -ForegroundColor Green
}

# 3. Ejecutar prueba de landing page
Write-Host "`nEjecutando prueba de landing page..." -ForegroundColor Cyan
npx cypress run --spec "cypress/e2e/01-landing-page-final.cy.js"

$landingPageResult = $LASTEXITCODE

# 4. Ejecutar prueba de login
Write-Host "`nEjecutando prueba de login..." -ForegroundColor Cyan
npx cypress run --spec "cypress/e2e/02-login-final.cy.js"

$loginResult = $LASTEXITCODE

# 5. Mostrar resultados
Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host "RESULTADOS DE VALIDACIÓN" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

Write-Host "Landing Page: " -NoNewline
if ($landingPageResult -eq 0) {
    Write-Host "ÉXITO" -ForegroundColor Green
} else {
    Write-Host "FALLO" -ForegroundColor Red
}

Write-Host "Login: " -NoNewline
if ($loginResult -eq 0) {
    Write-Host "ÉXITO" -ForegroundColor Green
} else {
    Write-Host "FALLO" -ForegroundColor Red
}

# 6. Detener el servidor si lo iniciamos nosotros
if ($serverStarted) {
    Write-Host "`nDeteniendo el servidor Next.js..." -ForegroundColor Yellow
    Stop-Process -Id $serverJob.Id -Force
}

# 7. Mostrar pasos siguientes
Write-Host "`nPróximos pasos:" -ForegroundColor Cyan
if ($landingPageResult -eq 0 -and $loginResult -eq 0) {
    Write-Host "  ✓ Las pruebas básicas funcionan correctamente" -ForegroundColor Green
    Write-Host "  ✓ Ahora puede continuar con las pruebas completas usando: ./run-cypress-headless.ps1" -ForegroundColor Green
} else {
    Write-Host "  ✗ Hay problemas con las pruebas básicas" -ForegroundColor Red
    Write-Host "  ✗ Revise los errores y solucione los problemas antes de continuar" -ForegroundColor Red
}

# Salir con un código de estado apropiado
if ($landingPageResult -ne 0 -or $loginResult -ne 0) {
    exit 1
} else {
    exit 0
}
