#!/usr/bin/env pwsh
# Script para crear tareas programadas para ejecutar pruebas Cypress automáticamente

param(
    [string]$TaskName = "CypressTestsArmonia",
    [string]$ScriptPath = "$PSScriptRoot\ejecutar-prueba-automatica.ps1",
    [string]$Frequency = "Daily", # Daily, Weekly, Monthly
    [int]$Hour = 9,
    [int]$Minute = 0
)

$ErrorActionPreference = "Stop"

# Confirmar ruta completa al script
$ScriptPath = (Resolve-Path $ScriptPath).Path

# Mostrar cabecera
Write-Host "===== CONFIGURACIÓN DE TAREA PROGRAMADA PARA PRUEBAS CYPRESS =====" -ForegroundColor Cyan
Write-Host "Nombre de tarea: $TaskName" -ForegroundColor Cyan
Write-Host "Script a ejecutar: $ScriptPath" -ForegroundColor Cyan
Write-Host "Frecuencia: $Frequency a las $Hour`:$($Minute.ToString('00'))" -ForegroundColor Cyan

# Comprobar si la tarea ya existe
$taskExists = $false
try {
    $existingTask = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
    if ($existingTask) {
        $taskExists = $true
        Write-Host "La tarea '$TaskName' ya existe." -ForegroundColor Yellow
        $confirm = Read-Host "¿Desea reemplazarla? (S/N)"
        if ($confirm -ne "S" -and $confirm -ne "s") {
            Write-Host "Operación cancelada por el usuario." -ForegroundColor Yellow
            exit 0
        }
        
        # Eliminar la tarea existente
        Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
        Write-Host "Tarea existente eliminada." -ForegroundColor Green
    }
} catch {
    Write-Host "Error al verificar tarea existente: $_" -ForegroundColor Red
    # Continuamos de todos modos
}

# Crear el disparador según la frecuencia seleccionada
$triggerTime = (Get-Date).Date.AddHours($Hour).AddMinutes($Minute)

try {
    switch ($Frequency) {
        "Daily" {
            $trigger = New-ScheduledTaskTrigger -Daily -At $triggerTime
            Write-Host "Configurando ejecución diaria a las $Hour`:$($Minute.ToString('00'))" -ForegroundColor Green
        }
        "Weekly" {
            $trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Monday -At $triggerTime
            Write-Host "Configurando ejecución semanal (lunes) a las $Hour`:$($Minute.ToString('00'))" -ForegroundColor Green
        }
        "Monthly" {
            $trigger = New-ScheduledTaskTrigger -Monthly -DaysOfMonth 1 -At $triggerTime
            Write-Host "Configurando ejecución mensual (día 1) a las $Hour`:$($Minute.ToString('00'))" -ForegroundColor Green
        }
        default {
            $trigger = New-ScheduledTaskTrigger -Daily -At $triggerTime
            Write-Host "Frecuencia no reconocida, usando diaria a las $Hour`:$($Minute.ToString('00'))" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "Error al crear el disparador: $_" -ForegroundColor Red
    exit 1
}

# Crear la acción
try {
    $action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-ExecutionPolicy Bypass -File `"$ScriptPath`"" -WorkingDirectory $PSScriptRoot
    Write-Host "Acción configurada: powershell.exe -ExecutionPolicy Bypass -File `"$ScriptPath`"" -ForegroundColor Green
} catch {
    Write-Host "Error al crear la acción: $_" -ForegroundColor Red
    exit 1
}

# Configuración adicional de la tarea
try {
    $settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -DontStopOnIdleEnd

    # Crear la tarea
    $task = Register-ScheduledTask -TaskName $TaskName -Trigger $trigger -Action $action -Settings $settings -Description "Ejecuta pruebas automatizadas de Cypress en modo headless" -User $env:USERNAME
    
    if ($task) {
        Write-Host "`n¡Tarea programada creada exitosamente!" -ForegroundColor Green
        Write-Host "Nombre: $TaskName" -ForegroundColor Green
        Write-Host "Próxima ejecución: $($task.NextRunTime)" -ForegroundColor Green
        
        # Configuraciones adicionales (ejecutar con privilegios elevados)
        $taskPrincipal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType S4U -RunLevel Highest
        Set-ScheduledTask -TaskName $TaskName -Principal $taskPrincipal | Out-Null
        Write-Host "La tarea se ejecutará con privilegios elevados." -ForegroundColor Green
    } else {
        Write-Host "No se pudo crear la tarea programada." -ForegroundColor Red
    }
} catch {
    Write-Host "Error al registrar la tarea: $_" -ForegroundColor Red
    
    Write-Host "`n=== INSTRUCCIONES PARA CONFIGURACIÓN MANUAL ===" -ForegroundColor Yellow
    Write-Host "Si no se pudo crear la tarea automáticamente, sigue estos pasos:" -ForegroundColor Yellow
    Write-Host "1. Abre el Programador de tareas de Windows (taskschd.msc)" -ForegroundColor Yellow
    Write-Host "2. Selecciona 'Crear tarea básica' en el panel derecho" -ForegroundColor Yellow
    Write-Host "3. Nombre: $TaskName" -ForegroundColor Yellow
    Write-Host "4. Desencadenador: $Frequency" -ForegroundColor Yellow
    Write-Host "5. Hora de inicio: $Hour`:$($Minute.ToString('00'))" -ForegroundColor Yellow
    Write-Host "6. Acción: 'Iniciar un programa'" -ForegroundColor Yellow
    Write-Host "7. Programa/script: powershell.exe" -ForegroundColor Yellow
    Write-Host "8. Argumentos: -ExecutionPolicy Bypass -File `"$ScriptPath`"" -ForegroundColor Yellow
    Write-Host "9. Marcar la opción 'Ejecutar con privilegios más altos'" -ForegroundColor Yellow
}
