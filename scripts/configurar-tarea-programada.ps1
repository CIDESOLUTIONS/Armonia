#!/usr/bin/env pwsh
# Script para configurar una tarea programada para ejecutar pruebas Cypress

$ErrorActionPreference = "Stop"

# Obtener la ruta completa al script de automatización
$scriptPath = Join-Path $PSScriptRoot "cypress-headless-automation.ps1"
$scriptPath = (Resolve-Path $scriptPath).Path

# Nombre de la tarea
$taskName = "CypressTestsArmonia"

# Parámetros para la tarea
$taskDescription = "Ejecuta pruebas automatizadas de Cypress en modo headless"
$taskAuthor = $env:USERNAME

# Programación (por defecto, diariamente a las 9:00 AM)
$triggerTime = (Get-Date).Date.AddHours(9) # 9:00 AM
$trigger = New-ScheduledTaskTrigger -Daily -At $triggerTime

# Acción a ejecutar
$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-ExecutionPolicy Bypass -File `"$scriptPath`"" -WorkingDirectory $PSScriptRoot

# Configuración adicional
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -DontStopOnIdleEnd -RestartInterval (New-TimeSpan -Minutes 1) -RestartCount 3

# Eliminar la tarea si ya existe
if (Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue) {
    Write-Host "Eliminando tarea programada existente: $taskName" -ForegroundColor Yellow
    Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
}

# Crear la tarea
try {
    $task = Register-ScheduledTask -TaskName $taskName -Trigger $trigger -Action $action -Settings $settings -Description $taskDescription -User $env:USERNAME
    
    if ($task) {
        Write-Host "Tarea programada creada exitosamente:" -ForegroundColor Green
        Write-Host "  Nombre: $taskName" -ForegroundColor Green
        Write-Host "  Programación: Diariamente a las $($triggerTime.ToString('HH:mm'))" -ForegroundColor Green
        Write-Host "  Script: $scriptPath" -ForegroundColor Green
    } else {
        Write-Host "Error al crear la tarea programada." -ForegroundColor Red
    }
} catch {
    Write-Host "Error al crear la tarea programada: $_" -ForegroundColor Red
    
    Write-Host "`nPuedes crear la tarea manualmente desde el Programador de tareas de Windows:" -ForegroundColor Yellow
    Write-Host "1. Abre el Programador de tareas (taskschd.msc)" -ForegroundColor Yellow
    Write-Host "2. Crea una nueva tarea básica" -ForegroundColor Yellow
    Write-Host "3. Nombre: $taskName" -ForegroundColor Yellow
    Write-Host "4. Desencadenador: Diario" -ForegroundColor Yellow
    Write-Host "5. Acción: Iniciar un programa" -ForegroundColor Yellow
    Write-Host "6. Programa/script: powershell.exe" -ForegroundColor Yellow
    Write-Host "7. Argumentos: -ExecutionPolicy Bypass -File `"$scriptPath`"" -ForegroundColor Yellow
    Write-Host "8. Directorio de inicio: $PSScriptRoot" -ForegroundColor Yellow
}
