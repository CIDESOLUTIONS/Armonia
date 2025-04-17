# Script para ejecutar la primera prueba de Cypress (Landing Page)

Write-Host "Iniciando prueba básica de Landing Page..." -ForegroundColor Green

# Cambiar al directorio del proyecto
Set-Location -Path "C:\Users\meciz\Documents\armonia"

# Asegurarse de que la aplicación esté en ejecución en una ventana separada
# Para esto, el usuario debe haber iniciado la aplicación con "npm run dev" en una terminal aparte

# Ejecutar la prueba específica con Cypress
Write-Host "Ejecutando prueba de Landing Page..." -ForegroundColor Cyan
npx cypress run --spec "cypress/e2e/01-landing-page.cy.js"

# Verificar el resultado
if ($LASTEXITCODE -eq 0) {
    Write-Host "Prueba completada con éxito!" -ForegroundColor Green
} else {
    Write-Host "La prueba falló con código de salida: $LASTEXITCODE" -ForegroundColor Red
}

# Informar sobre la ubicación de los resultados
Write-Host "`nLos resultados de la prueba se encuentran en:" -ForegroundColor Yellow
Write-Host " - Capturas de pantalla: C:\Users\meciz\Documents\armonia\cypress\screenshots" -ForegroundColor Yellow
Write-Host " - Videos: C:\Users\meciz\Documents\armonia\cypress\videos" -ForegroundColor Yellow
Write-Host " - Reportes: C:\Users\meciz\Documents\armonia\cypress\results" -ForegroundColor Yellow

# Esperar para que el usuario pueda ver el resultado
Write-Host "`nPresione cualquier tecla para salir..." -ForegroundColor Gray
$null = $host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
