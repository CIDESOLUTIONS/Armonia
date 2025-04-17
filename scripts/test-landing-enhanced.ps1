# Script para probar la versión mejorada de la landing page de Armonía

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "   PROBANDO LANDING PAGE MEJORADA - ARMONÍA" -ForegroundColor Cyan  
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
Remove-Item -Path "$cypressDir\videos\landing-page-enhanced*.mp4" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "$cypressDir\screenshots\landing-page-enhanced*" -Recurse -Force -ErrorAction SilentlyContinue

# Ejecutar la prueba de landing page mejorada
Write-Host "Ejecutando prueba de landing page mejorada..." -ForegroundColor Yellow
Set-Location -Path $baseDir
npx cypress run --spec "cypress/e2e/landing-page-enhanced.cy.ts" --headless

# Verificar resultado
$testExitCode = $LASTEXITCODE
if ($testExitCode -eq 0) {
    Write-Host "`n✅ Prueba de landing page mejorada completada exitosamente." -ForegroundColor Green
} else {
    Write-Host "`n❌ Prueba de landing page mejorada falló con código: $testExitCode" -ForegroundColor Red
    
    # Buscar capturas de pantalla para mostrar detalles de error
    $screenshotsPath = "$cypressDir\screenshots\landing-page-enhanced.cy.ts"
    if (Test-Path $screenshotsPath) {
        Write-Host "`nCapturas de pantalla de errores disponibles en:" -ForegroundColor Yellow
        Write-Host $screenshotsPath -ForegroundColor White
        
        # Listar las capturas de pantalla
        Get-ChildItem -Path $screenshotsPath -Recurse | ForEach-Object {
            Write-Host "  - $($_.Name)" -ForegroundColor Red
        }
    }
}

# Copiar video si existe
$videoPath = "$cypressDir\videos\landing-page-enhanced.cy.ts.mp4"
if (Test-Path $videoPath) {
    Copy-Item -Path $videoPath -Destination "$resultsDir\landing-page-enhanced-video.mp4" -Force
    Write-Host "Video guardado en: $resultsDir\landing-page-enhanced-video.mp4" -ForegroundColor Green
}

# Copiar capturas de pantalla si existen
$screenshotsPath = "$cypressDir\screenshots\landing-page-enhanced.cy.ts"
if (Test-Path $screenshotsPath) {
    if (-not (Test-Path "$resultsDir\landing-page-enhanced-screenshots")) {
        New-Item -Path "$resultsDir\landing-page-enhanced-screenshots" -ItemType Directory -Force | Out-Null
    }
    Copy-Item -Path "$screenshotsPath\*" -Destination "$resultsDir\landing-page-enhanced-screenshots" -Recurse -Force
    Write-Host "Capturas de pantalla guardadas en: $resultsDir\landing-page-enhanced-screenshots" -ForegroundColor Green
}

Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host "              INFORME DE PRUEBAS                 " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "La prueba verifica si la landing page cumple con los requisitos" -ForegroundColor White
Write-Host "de marketing y comunicación del propósito de Armonía." -ForegroundColor White
Write-Host "`nAspectos verificados:" -ForegroundColor Yellow
Write-Host "1. Mensaje principal claro sobre gestión de conjuntos residenciales" -ForegroundColor White
Write-Host "2. Presentación de todos los módulos principales" -ForegroundColor White
Write-Host "3. Descripción de características específicas" -ForegroundColor White
Write-Host "4. Planes y precios claros" -ForegroundColor White
Write-Host "5. Formulario de registro para prueba gratuita" -ForegroundColor White
Write-Host "6. Elementos de credibilidad y confianza" -ForegroundColor White
Write-Host "==================================================" -ForegroundColor Cyan
