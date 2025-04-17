#!/usr/bin/env pwsh
# Script para verificar manualmente la landing page

Write-Host "Verificando landing page de Armonía..." -ForegroundColor Cyan

# Verificar si la aplicación está en ejecución
$processName = "node"
$processInfo = Get-Process $processName -ErrorAction SilentlyContinue | Where-Object {$_.CommandLine -like "*frontend*" -and $_.CommandLine -like "*dev*"}

if ($null -eq $processInfo) {
    Write-Host "La aplicación no está en ejecución. Iniciando el servidor..." -ForegroundColor Yellow
    
    # Iniciar el servidor en una nueva ventana
    Start-Process powershell -ArgumentList "-Command", "cd C:\Users\meciz\Documents\armonia\frontend; npm run dev"
    
    # Esperar a que el servidor esté listo
    Write-Host "Esperando que el servidor esté listo (15 segundos)..." -ForegroundColor Yellow
    Start-Sleep -Seconds 15
} else {
    Write-Host "La aplicación ya está en ejecución." -ForegroundColor Green
}

# Abre el navegador para verificar manualmente
try {
    Write-Host "Abriendo navegador para verificar la aplicación..." -ForegroundColor Yellow
    Start-Process "http://localhost:3000"
    
    # Solicitar verificación manual
    Write-Host "`nVerifique manualmente que la landing page funciona correctamente:" -ForegroundColor Green
    Write-Host "1. Debería ver el título 'Armonía'" -ForegroundColor White
    Write-Host "2. Debería ver texto sobre 'Gestión integral para conjuntos residenciales'" -ForegroundColor White
    Write-Host "3. Debería ver botones de navegación (Funcionalidades, Planes, etc.)" -ForegroundColor White
    Write-Host "4. Debería poder hacer clic en 'Iniciar Sesión'" -ForegroundColor White
    Write-Host "`nPor favor, confirme si todo funciona correctamente." -ForegroundColor Yellow
    
    $confirmation = Read-Host "¿La landing page funciona correctamente? (S/N)"
    
    if ($confirmation -eq "S" -or $confirmation -eq "s") {
        Write-Host "`n✅ Verificación manual exitosa. La landing page funciona correctamente." -ForegroundColor Green
    } else {
        Write-Host "`n❌ Verificación manual fallida. Hay problemas con la landing page." -ForegroundColor Red
    }
} catch {
    Write-Host "Error al intentar abrir el navegador: $_" -ForegroundColor Red
}
