# Script muy simple para ejecutar la prueba básica

Write-Host "Ejecutando prueba básica..." -ForegroundColor Yellow
Set-Location -Path "C:\Users\meciz\Documents\armonia"
npx cypress run --spec "cypress/e2e/basic.cy.js" --headless

Write-Host "Prueba completada." -ForegroundColor Green
