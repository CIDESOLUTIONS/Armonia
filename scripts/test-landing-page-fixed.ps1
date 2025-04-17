# Script para probar la landing page con la corrección de redirección

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "   PROBANDO LANDING PAGE CON REDIRECCIONES CORREGIDAS" -ForegroundColor Cyan  
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
Remove-Item -Path "$cypressDir\videos\landing-*.mp4" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "$cypressDir\screenshots\landing-*" -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "Se han corregido los siguientes problemas:" -ForegroundColor Yellow
Write-Host "1. El botón 'Iniciar Sesión' ahora redirige a /portal-selector" -ForegroundColor Green
Write-Host "2. El menú desplegable de usuario ahora redirige a /portal-selector" -ForegroundColor Green
Write-Host "`nEjecutando pruebas actualizadas..." -ForegroundColor Yellow

# Probar ambas versiones de la prueba de landing page
$tests = @(
    "landing-page-updated.cy.ts",
    "landing-page-enhanced.cy.ts"
)

foreach ($test in $tests) {
    Write-Host "`nEjecutando prueba: $test" -ForegroundColor Yellow
    Set-Location -Path $baseDir
    npx cypress run --spec "cypress/e2e/$test" --headless
    
    # Verificar resultado
    $testExitCode = $LASTEXITCODE
    if ($testExitCode -eq 0) {
        Write-Host "✅ Prueba $test completada exitosamente." -ForegroundColor Green
    } else {
        Write-Host "❌ Prueba $test falló con código: $testExitCode" -ForegroundColor Red
    }
    
    # Copiar resultados
    $testName = [System.IO.Path]::GetFileNameWithoutExtension($test)
    
    # Copiar video si existe
    $videoPath = "$cypressDir\videos\$test.mp4"
    if (Test-Path $videoPath) {
        Copy-Item -Path $videoPath -Destination "$resultsDir\$testName-video.mp4" -Force
        Write-Host "Video guardado en: $resultsDir\$testName-video.mp4" -ForegroundColor Green
    }
    
    # Copiar capturas de pantalla si existen
    $screenshotsPath = "$cypressDir\screenshots\$test"
    if (Test-Path $screenshotsPath) {
        if (-not (Test-Path "$resultsDir\$testName-screenshots")) {
            New-Item -Path "$resultsDir\$testName-screenshots" -ItemType Directory -Force | Out-Null
        }
        Copy-Item -Path "$screenshotsPath\*" -Destination "$resultsDir\$testName-screenshots" -Recurse -Force
        Write-Host "Capturas de pantalla guardadas en: $resultsDir\$testName-screenshots" -ForegroundColor Green
    }
}

Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host "              RESUMEN DE CORRECCIONES             " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "Archivos modificados:" -ForegroundColor White
Write-Host "1. C:\Users\meciz\Documents\armonia\frontend\src\components\layout\header.tsx" -ForegroundColor Yellow
Write-Host "2. C:\Users\meciz\Documents\armonia\cypress\e2e\landing-page-updated.cy.ts" -ForegroundColor Yellow
Write-Host "3. C:\Users\meciz\Documents\armonia\cypress\e2e\landing-page-enhanced.cy.ts" -ForegroundColor Yellow
Write-Host "`nCambios realizados:" -ForegroundColor White
Write-Host "- Se modificó la redirección del botón 'Iniciar Sesión' para que lleve al selector de portal" -ForegroundColor Green
Write-Host "- Se modificó la redirección del menú de usuario para que lleve al selector de portal" -ForegroundColor Green
Write-Host "- Se actualizaron las pruebas para verificar la redirección correcta" -ForegroundColor Green
Write-Host "`nLos dos puntos de salto a login ahora redirigen correctamente al selector de portal." -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
