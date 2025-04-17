#!/usr/bin/env pwsh
# Script para ejecutar todas las pruebas en secuencia y validar cada módulo

param(
    [switch]$FixOnly = $false,
    [switch]$ContinueOnError = $false
)

# Colores para salida
$successColor = "Green"
$errorColor = "Red"
$infoColor = "Cyan"
$warningColor = "Yellow"

# Array de pruebas en orden de ejecución
$testSequence = @(
    @{
        Name = "01. Landing Page";
        Spec = "cypress/e2e/01-landing-page-final.cy.js";
        Description = "Prueba del funcionamiento de la página principal";
    },
    @{
        Name = "02. Login";
        Spec = "cypress/e2e/02-login-final.cy.js";
        Description = "Prueba del sistema de autenticación";
    },
    @{
        Name = "03. Admin Dashboard";
        Spec = "cypress/e2e/03-admin-dashboard-final.cy.js";
        Description = "Prueba del panel de administrador";
    },
    @{
        Name = "04. Resident Dashboard";
        Spec = "cypress/e2e/04-resident-dashboard.cy.ts";
        Description = "Prueba del panel de residentes";
    },
    @{
        Name = "05. Reception Dashboard";
        Spec = "cypress/e2e/05-reception-dashboard.cy.ts";
        Description = "Prueba del panel de recepción";
    },
    @{
        Name = "06. Integration Flow";
        Spec = "cypress/e2e/06-integration-flow.cy.ts";
        Description = "Prueba de flujo completo de integración";
    }
)

# Función para mostrar cabecera
function Show-Header {
    param([string]$Title)
    
    Write-Host "`n`n===================================================" -ForegroundColor $infoColor
    Write-Host "  $Title" -ForegroundColor $infoColor
    Write-Host "===================================================" -ForegroundColor $infoColor
}

# Función para mostrar resultados
function Show-Results {
    param(
        [array]$Results
    )
    
    Show-Header "RESUMEN DE RESULTADOS"
    
    $totalTests = $Results.Count
    $passedTests = ($Results | Where-Object { $_.Status -eq "Success" }).Count
    $failedTests = $totalTests - $passedTests
    
    Write-Host "Total de pruebas ejecutadas: $totalTests" -ForegroundColor White
    Write-Host "Pruebas exitosas: $passedTests" -ForegroundColor $successColor
    Write-Host "Pruebas fallidas: $failedTests" -ForegroundColor $errorColor
    
    Write-Host "`nDetalle de resultados:" -ForegroundColor White
    
    foreach ($result in $Results) {
        $statusColor = if ($result.Status -eq "Success") { $successColor } else { $errorColor }
        $statusText = if ($result.Status -eq "Success") { "ÉXITO" } else { "FALLO" }
        
        Write-Host "$($result.Name): " -NoNewline
        Write-Host $statusText -ForegroundColor $statusColor -NoNewline
        Write-Host " - $($result.Description)"
        
        if ($result.Status -eq "Failed") {
            Write-Host "  Detalles del error: $($result.Error)" -ForegroundColor $errorColor
        }
    }
    
    if ($failedTests -gt 0) {
        Write-Host "`nHay $failedTests pruebas fallidas. Se recomienda revisar y solucionar los problemas." -ForegroundColor $warningColor
    } else {
        Write-Host "`n¡Todas las pruebas han pasado exitosamente!" -ForegroundColor $successColor
    }
}

# Inicio del script principal
Show-Header "PRUEBAS SECUENCIALES DE ARMONÍA"

# 1. Arreglar credenciales de prueba
Write-Host "Arreglando credenciales de usuarios de prueba..." -ForegroundColor $infoColor
& "$PSScriptRoot\fix-test-credentials.ps1"

if ($FixOnly) {
    Write-Host "`nSolo se han arreglado las credenciales. No se ejecutarán pruebas." -ForegroundColor $infoColor
    exit 0
}

# 2. Verificar si el servidor está en ejecución e iniciarlo si es necesario
$processName = "node"
$processInfo = Get-Process $processName -ErrorAction SilentlyContinue | Where-Object {$_.CommandLine -like "*frontend*"}
$serverStarted = $false

if ($null -eq $processInfo) {
    Write-Host "La aplicación no está en ejecución. Iniciando el servidor..." -ForegroundColor $warningColor
    
    # Iniciar el servidor en una nueva ventana
    $serverJob = Start-Process powershell -ArgumentList "-Command", "cd C:\Users\meciz\Documents\armonia\frontend; npm run dev" -PassThru
    
    # Esperar a que el servidor esté listo
    Write-Host "Esperando que el servidor esté listo (15 segundos)..." -ForegroundColor $warningColor
    Start-Sleep -Seconds 15
    
    $serverStarted = $true
} else {
    Write-Host "La aplicación ya está en ejecución." -ForegroundColor $successColor
}

# 3. Inicializar la base de datos de prueba
Write-Host "Inicializando la base de datos con datos de prueba..." -ForegroundColor $infoColor
& "$PSScriptRoot\initialize-database.ps1"

# 4. Ejecutar pruebas en secuencia
$env:CYPRESS_BASE_URL = "http://localhost:3000"
$results = @()
$shouldStop = $false

foreach ($test in $testSequence) {
    if ($shouldStop) {
        $result = @{
            Name = $test.Name
            Status = "Skipped"
            Description = $test.Description
            Error = "Prueba anterior fallida, se omitió esta prueba"
        }
        $results += $result
        continue
    }
    
    Show-Header "EJECUTANDO PRUEBA: $($test.Name)"
    Write-Host $test.Description
    Write-Host "Archivo: $($test.Spec)`n"
    
    try {
        npx cypress run --spec "$PSScriptRoot\$($test.Spec)"
        $exitCode = $LASTEXITCODE
        
        if ($exitCode -eq 0) {
            Write-Host "Prueba completada exitosamente." -ForegroundColor $successColor
            $result = @{
                Name = $test.Name
                Status = "Success"
                Description = $test.Description
                Error = $null
            }
        } else {
            Write-Host "La prueba falló con código de salida: $exitCode" -ForegroundColor $errorColor
            $result = @{
                Name = $test.Name
                Status = "Failed"
                Description = $test.Description
                Error = "Código de salida: $exitCode"
            }
            
            if (-not $ContinueOnError) {
                $shouldStop = $true
            }
        }
    } catch {
        Write-Host "Error al ejecutar la prueba: $_" -ForegroundColor $errorColor
        $result = @{
            Name = $test.Name
            Status = "Failed"
            Description = $test.Description
            Error = $_
        }
        
        if (-not $ContinueOnError) {
            $shouldStop = $true
        }
    }
    
    $results += $result
}

# 5. Mostrar resultados
Show-Results -Results $results

# 6. Detener el servidor si lo iniciamos nosotros
if ($serverStarted) {
    Write-Host "`nDeteniendo el servidor Next.js..." -ForegroundColor $warningColor
    Stop-Process -Id $serverJob.Id -Force
}

# 7. Sincronizar con GitHub si todas las pruebas pasaron
if (($results | Where-Object { $_.Status -eq "Failed" }).Count -eq 0) {
    Write-Host "`n¿Desea sincronizar estos cambios con GitHub? (S/N)" -ForegroundColor $infoColor
    $response = Read-Host
    if ($response -eq "S" -or $response -eq "s") {
        Write-Host "Sincronizando con GitHub..." -ForegroundColor $infoColor
        & "$PSScriptRoot\sync-with-github.ps1"
    }
}

# Salir con código apropiado
if (($results | Where-Object { $_.Status -eq "Failed" }).Count -gt 0) {
    exit 1
} else {
    exit 0
}
