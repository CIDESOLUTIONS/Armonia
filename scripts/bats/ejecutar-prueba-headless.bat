@echo off
echo Ejecutando prueba basica de Cypress en modo headless...
cd /d %~dp0
set CYPRESS_BASE_URL=http://localhost:3000
npx cypress run --spec "cypress/e2e/basic.cy.js" --headless
if %ERRORLEVEL% EQU 0 (
  echo Prueba ejecutada exitosamente!
) else (
  echo La prueba fallo con codigo de salida: %ERRORLEVEL%
)
pause
