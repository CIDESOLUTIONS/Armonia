# Script para ejecutar la prueba de la Landing Page

Write-Host "Iniciando prueba de la Landing Page de Armonía..." -ForegroundColor Green

# Cambiar al directorio del proyecto
Set-Location -Path "C:\Users\meciz\Documents\armonia"

# Asegurar que la aplicación esté en ejecución en una ventana separada
Write-Host "IMPORTANTE: Asegúrese de que la aplicación esté en ejecución con 'npm run dev' en otra terminal" -ForegroundColor Yellow
Write-Host "Presione cualquier tecla para continuar o Ctrl+C para cancelar..." -ForegroundColor Yellow
$null = $host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Ejecutar la prueba específica con Cypress
Write-Host "Ejecutando prueba de Landing Page..." -ForegroundColor Cyan

# Crear directorio para resultados si no existe
$resultDir = "cypress\results\landing-page-$(Get-Date -Format 'yyyy-MM-dd-HH-mm')"
if (-not (Test-Path $resultDir)) {
    New-Item -Path $resultDir -ItemType Directory -Force | Out-Null
}

# Ejecutar la prueba básica
try {
    $output = npx cypress run --spec "cypress\e2e\basic.cy.js" --config "video=true,screenshotOnRunFailure=true" 2>&1
    $output | Out-File -FilePath "$resultDir\resultado.txt" -Encoding utf8
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Prueba básica completada exitosamente." -ForegroundColor Green
    } else {
        Write-Host "❌ La prueba básica falló." -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error al ejecutar la prueba básica: $_" -ForegroundColor Red
}

# Informar sobre la ubicación de los resultados
Write-Host "`nLos resultados de la prueba se encuentran en:" -ForegroundColor Yellow
Write-Host " - Capturas de pantalla: cypress\screenshots" -ForegroundColor Yellow
Write-Host " - Videos: cypress\videos" -ForegroundColor Yellow
Write-Host " - Resultados: $resultDir" -ForegroundColor Yellow

# Esperar para que el usuario pueda ver el resultado
Write-Host "`nPresione cualquier tecla para salir..." -ForegroundColor Gray
$null = $host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
