# Script para crear usuarios de prueba
Write-Host "Creando usuarios de prueba para Armonía..." -ForegroundColor Cyan

# Cambiar al directorio del frontend
Set-Location -Path ".\frontend"

# Ejecutar el script Node.js
Write-Host "Ejecutando script de creación de usuarios..." -ForegroundColor Yellow
node scripts/create-test-users.js

# Volver al directorio raíz
Set-Location -Path ".."

Write-Host "`nScript completado." -ForegroundColor Green
Write-Host "Puede iniciar sesión con estas credenciales:" -ForegroundColor Cyan
Write-Host "Portal Residente:" -ForegroundColor White
Write-Host "  Email: residente@test.com" -ForegroundColor White
Write-Host "  Contraseña: Residente123" -ForegroundColor White
Write-Host "Portal Recepción:" -ForegroundColor White
Write-Host "  Email: recepcion@test.com" -ForegroundColor White
Write-Host "  Contraseña: Recepcion123" -ForegroundColor White

Write-Host "`nPara acceder a los portales, visite: http://localhost:3000/portal-selector" -ForegroundColor Cyan

# Mantener la ventana abierta
Write-Host "Presione cualquier tecla para salir..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
