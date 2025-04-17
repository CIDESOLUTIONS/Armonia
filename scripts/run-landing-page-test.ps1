#!/usr/bin/env pwsh
# Script para ejecutar la prueba de landing page

Write-Host "Ejecutando prueba de landing page para el proyecto Armonía..." -ForegroundColor Green

# 1. Asegurarse de que la aplicación esté en ejecución
$processName = "node"
$processInfo = Get-Process $processName -ErrorAction SilentlyContinue | Where-Object {$_.CommandLine -like "*frontend*"}

if ($null -eq $processInfo) {
    Write-Host "La aplicación no está en ejecución. Iniciando el servidor..." -ForegroundColor Yellow
    
    # Iniciar el servidor en una nueva ventana
    Start-Process powershell -ArgumentList "-Command", "cd C:\Users\meciz\Documents\armonia\frontend; npm run dev"
    
    # Esperar a que el servidor esté listo
    Write-Host "Esperando que el servidor esté listo..." -ForegroundColor Yellow
    Start-Sleep -Seconds 15
} else {
    Write-Host "La aplicación ya está en ejecución." -ForegroundColor Green
}

# 2. Preparar la base de datos con datos de prueba
Write-Host "Preparando la base de datos con datos de prueba..." -ForegroundColor Cyan
./initialize-database.ps1

# 3. Ejecutar la prueba específica
Write-Host "Ejecutando prueba de landing page..." -ForegroundColor Cyan
$env:CYPRESS_BASE_URL = "http://localhost:3000"

# Copiar la prueba landing-page al formato que funciona
Write-Host "Preparando archivo de prueba..." -ForegroundColor Cyan
$landingPageTest = @"
// Prueba de landing page para Armonía
describe('Landing Page de Armonía', () => {
  it('Debería mostrar el encabezado principal y la marca', () => {
    cy.visit('/');
    cy.contains('Armonía').should('exist');
    cy.contains('Gestión integral').should('exist');
  });

  it('Debería mostrar la navegación principal', () => {
    cy.visit('/');
    cy.contains('Funcionalidades').should('exist');
    cy.contains('Planes').should('exist');
    cy.contains('Contacto').should('exist');
  });

  it('Debería permitir navegar a la página de login', () => {
    cy.visit('/');
    cy.contains('Iniciar Sesión').click();
    cy.url().should('include', '/login');
  });
});
"@

Set-Content -Path "cypress\e2e\landing-test.cy.js" -Value $landingPageTest

# Ejecutar la prueba exactamente como se hizo con basic.cy.js
Write-Host "Ejecutando prueba..." -ForegroundColor Cyan
cd $PSScriptRoot
npx cypress run --spec "cypress/e2e/landing-test.cy.js"

$exitCode = $LASTEXITCODE

# Mostrar resultado
if ($exitCode -eq 0) {
    Write-Host "Prueba de landing page completada exitosamente." -ForegroundColor Green
} else {
    Write-Host "Prueba de landing page falló con código $exitCode." -ForegroundColor Red
}

exit $exitCode
