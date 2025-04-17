@echo off
echo Ejecutando pruebas Cypress en modo headless...
cd /d %~dp0
powershell -ExecutionPolicy Bypass -File "cypress-headless-automation.ps1"
if %ERRORLEVEL% EQU 0 (
  echo Pruebas ejecutadas exitosamente!
) else (
  echo Las pruebas fallaron con codigo de salida: %ERRORLEVEL%
)
pause
