# Script para probar la landing page de Armonía

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "   PROBANDO LANDING PAGE - PROYECTO ARMONÍA" -ForegroundColor Cyan  
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Definir variables
$baseDir = "C:\Users\meciz\Documents\armonia"
$cypressDir = "$baseDir\cypress"
$resultsDir = "$baseDir\cypress\results"

# Asegurarse de que existe el directorio de resultados
if (-not (Test-Path -Path $resultsDir)) {
    New-Item -Path $resultsDir -ItemType Directory -Force | Out-Null
}

# Limpiar resultados anteriores
Remove-Item -Path "$cypressDir\videos\landing-page*.mp4" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "$cypressDir\screenshots\landing-page*" -Recurse -Force -ErrorAction SilentlyContinue

# Ejecutar la prueba de landing page
Write-Host "Ejecutando prueba de landing page..." -ForegroundColor Yellow
Set-Location -Path $baseDir
npx cypress run --spec "cypress/e2e/landing-page-updated.cy.ts" --headless

# Verificar resultado
$testExitCode = $LASTEXITCODE
if ($testExitCode -eq 0) {
    Write-Host "`n✅ Prueba de landing page completada exitosamente." -ForegroundColor Green
} else {
    Write-Host "`n❌ Prueba de landing page falló con código: $testExitCode" -ForegroundColor Red
}

# Copiar video si existe
$videoPath = "$cypressDir\videos\landing-page-updated.cy.ts.mp4"
if (Test-Path $videoPath) {
    Copy-Item -Path $videoPath -Destination "$resultsDir\landing-page-video.mp4" -Force
    Write-Host "Video guardado en: $resultsDir\landing-page-video.mp4" -ForegroundColor Green
}

# Copiar capturas de pantalla si existen
$screenshotsPath = "$cypressDir\screenshots\landing-page-updated.cy.ts"
if (Test-Path $screenshotsPath) {
    Copy-Item -Path $screenshotsPath -Destination "$resultsDir\landing-page-screenshots" -Recurse -Force
    Write-Host "Capturas de pantalla guardadas en: $resultsDir\landing-page-screenshots" -ForegroundColor Green
}

Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host "Para probar la prueba básica de landing page:" -ForegroundColor White
Write-Host "npx cypress run --spec `"cypress/e2e/landing-page-basic.cy.js`" --headless" -ForegroundColor Yellow
Write-Host "==================================================" -ForegroundColor Cyan
