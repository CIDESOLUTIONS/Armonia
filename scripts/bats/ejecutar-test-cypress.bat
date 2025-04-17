@echo off
echo Ejecutando prueba Cypress en modo headless...
cd /d %~dp0
powershell -ExecutionPolicy Bypass -File "run-cypress-test-auto.ps1"
pause
