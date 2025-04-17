@echo off
echo Ejecutando prueba basica de Cypress en modo headless...
cd %~dp0
npm run cypress:basic
if %ERRORLEVEL% EQU 0 (
  echo Prueba ejecutada exitosamente!
) else (
  echo La prueba fallo con codigo de salida: %ERRORLEVEL%
)
pause
