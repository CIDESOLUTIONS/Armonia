@echo off
echo Ejecutando pruebas automaticas Cypress en modo headless...
cd /d %~dp0
powershell -ExecutionPolicy Bypass -File "ejecutar-prueba-automatica.ps1"
if %ERRORLEVEL% EQU 0 (
  echo Pruebas ejecutadas exitosamente!
) else (
  echo Las pruebas fallaron con codigo de salida: %ERRORLEVEL%
)
pause
