# Script simplificado para ejecutar todas las pruebas de Cypress

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "   EJECUTANDO PRUEBAS CYPRESS - PROYECTO ARMONÍA" -ForegroundColor Cyan  
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Definir variables
$baseDir = "C:\Users\meciz\Documents\armonia"
$resultsDir = "$baseDir\cypress\results"

# Crear directorio de resultados si no existe
if (-not (Test-Path -Path $resultsDir)) {
    New-Item -Path $resultsDir -ItemType Directory -Force | Out-Null
}

# Definir las pruebas a ejecutar
$testFiles = @(
    "basic.cy.js",
    "landing-page-basic.cy.js",
    "landing-page-updated.cy.ts",
    "02-login-updated.cy.ts",
    "03-admin-dashboard-updated.cy.ts",
    "04-resident-dashboard-updated.cy.ts",
    "05-reception-dashboard-updated.cy.ts",
    "06-integration-flow-updated.cy.ts"
)

# Contador de pruebas exitosas y fallidas
$passedTests = 0
$failedTests = 0

# Ejecutar cada prueba
foreach ($testFile in $testFiles) {
    Write-Host "Ejecutando prueba: $testFile..." -ForegroundColor Yellow
    
    # Ejecutar la prueba
    Set-Location -Path $baseDir
    npx cypress run --spec "cypress/e2e/$testFile" --headless
    
    # Verificar resultado
    if ($LASTEXITCODE -eq 0) {
        $passedTests++
        Write-Host "Prueba $testFile superada" -ForegroundColor Green
    } else {
        $failedTests++
        Write-Host "Prueba $testFile fallida" -ForegroundColor Red
    }
}

# Mostrar resumen
Write-Host "Total de pruebas: $($testFiles.Count)" -ForegroundColor White
Write-Host "Pruebas exitosas: $passedTests" -ForegroundColor Green
Write-Host "Pruebas fallidas: $failedTests" -ForegroundColor Red
