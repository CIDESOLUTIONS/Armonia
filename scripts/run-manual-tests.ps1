#!/usr/bin/env pwsh
# Script para guiar al usuario a través de las pruebas manuales

# Colores para la salida
$infoColor = "Cyan"
$titleColor = "Yellow"
$successColor = "Green"
$warningColor = "Red"
$promptColor = "White"

# Función para mostrar título
function Show-Title {
    param([string]$Title)
    
    Write-Host "`n=============================================" -ForegroundColor $titleColor
    Write-Host " $Title" -ForegroundColor $titleColor
    Write-Host "=============================================" -ForegroundColor $titleColor
}

# Función para mostrar los pasos
function Show-Steps {
    param([array]$Steps)
    
    Write-Host "Pasos a seguir:" -ForegroundColor $infoColor
    for ($i = 0; $i -lt $Steps.Count; $i++) {
        Write-Host "  $($i+1). $($Steps[$i])" -ForegroundColor $promptColor
    }
}

# Función para verificar criterios
function Check-Criteria {
    param([array]$Criteria)
    
    Write-Host "`nCriterios de aceptación:" -ForegroundColor $infoColor
    
    $results = @()
    
    for ($i = 0; $i -lt $Criteria.Count; $i++) {
        $result = Read-Host "¿Se cumple el criterio: $($Criteria[$i])? (S/N)"
        if ($result -eq "S" -or $result -eq "s") {
            Write-Host "  [✓] $($Criteria[$i])" -ForegroundColor $successColor
            $results += $true
        } else {
            Write-Host "  [✗] $($Criteria[$i])" -ForegroundColor $warningColor
            $results += $false
        }
    }
    
    return $results
}

# Función para mostrar resultado de la prueba
function Show-TestResult {
    param([string]$TestName, [array]$Results)
    
    $passedCount = ($Results | Where-Object { $_ -eq $true }).Count
    $totalCount = $Results.Count
    
    Write-Host "`nResultado de la prueba: " -NoNewline
    
    if ($passedCount -eq $totalCount) {
        Write-Host "EXITOSA" -ForegroundColor $successColor
        Write-Host "Todos los criterios ($passedCount/$totalCount) fueron satisfactorios." -ForegroundColor $successColor
    } else {
        Write-Host "FALLIDA" -ForegroundColor $warningColor
        Write-Host "Se cumplieron $passedCount de $totalCount criterios." -ForegroundColor $warningColor
    }
    
    return @{
        Name = $TestName
        PassedCriteria = $passedCount
        TotalCriteria = $totalCount
        Success = ($passedCount -eq $totalCount)
    }
}

# Iniciar aplicación si es necesario
function Start-Application {
    try {
        $connection = Test-NetConnection -ComputerName localhost -Port 3000 -InformationLevel Quiet -ErrorAction SilentlyContinue
        if ($connection) {
            Write-Host "La aplicación ya está en ejecución en http://localhost:3000" -ForegroundColor $successColor
            return $true
        } else {
            Write-Host "La aplicación no está en ejecución." -ForegroundColor $warningColor
            $startApp = Read-Host "¿Desea iniciar la aplicación manualmente e intentar de nuevo? (S/N)"
            
            if ($startApp -eq "S" -or $startApp -eq "s") {
                Write-Host "`nPor favor, inicie la aplicación ejecutando:" -ForegroundColor $infoColor
                Write-Host "cd C:\Users\meciz\Documents\armonia\frontend" -ForegroundColor $promptColor
                Write-Host "npm run dev" -ForegroundColor $promptColor
                
                $ready = Read-Host "`n¿Está lista la aplicación? (S/N)"
                return ($ready -eq "S" -or $ready -eq "s")
            } else {
                return $false
            }
        }
    } catch {
        Write-Host "Error al verificar la aplicación: $_" -ForegroundColor $warningColor
        return $false
    }
}

# Inicio del script principal
Show-Title "PLAN DE PRUEBAS MANUALES DE ARMONÍA"

Write-Host "Este script le guiará a través de las pruebas manuales para verificar el funcionamiento de Armonía.`n" -ForegroundColor $infoColor

# Verificar si la aplicación está en ejecución
$appRunning = Start-Application
if (-not $appRunning) {
    Write-Host "No se puede continuar sin la aplicación en ejecución." -ForegroundColor $warningColor
    exit 1
}

# Abrir el navegador con la aplicación
Start-Process "http://localhost:3000"

# Inicializar resultados
$allResults = @()

# Prueba 1: Landing Page
Show-Title "PRUEBA 1: LANDING PAGE"

$steps = @(
    "Acceder a http://localhost:3000",
    "Verificar que se muestra el título 'Armonía'",
    "Verificar que se muestra el texto 'Gestión integral para conjuntos residenciales'",
    "Verificar que existen los enlaces de navegación: Funcionalidades, Planes, Contacto",
    "Verificar que existen los botones 'Registrarse' e 'Iniciar Sesión'"
)

$criteria = @(
    "El título 'Armonía' es visible",
    "El texto 'Gestión integral para conjuntos residenciales' es visible",
    "Los enlaces de navegación están presentes",
    "Los botones 'Registrarse' e 'Iniciar Sesión' están presentes y funcionan"
)

Show-Steps -Steps $steps
$continueTest = Read-Host "`n¿Desea continuar con esta prueba? (S/N)"
if ($continueTest -eq "S" -or $continueTest -eq "s") {
    $results = Check-Criteria -Criteria $criteria
    $testResult = Show-TestResult -TestName "Landing Page" -Results $results
    $allResults += $testResult
} else {
    Write-Host "Prueba omitida." -ForegroundColor $warningColor
}

# Prueba 2: Inicio de Sesión
Show-Title "PRUEBA 2: INICIO DE SESIÓN"

$steps = @(
    "Hacer clic en 'Iniciar Sesión' en la página principal",
    "Verificar que se redirige a la página de login",
    "Introducir las credenciales (Email: admin@armonia.com, Contraseña: Admin123)",
    "Hacer clic en el botón 'Iniciar Sesión'",
    "Verificar que se redirige al dashboard"
)

$criteria = @(
    "La página de login se muestra correctamente",
    "Los campos de email y contraseña están presentes",
    "Se puede iniciar sesión con las credenciales proporcionadas",
    "Después de iniciar sesión, se redirige al dashboard"
)

Show-Steps -Steps $steps
$continueTest = Read-Host "`n¿Desea continuar con esta prueba? (S/N)"
if ($continueTest -eq "S" -or $continueTest -eq "s") {
    $results = Check-Criteria -Criteria $criteria
    $testResult = Show-TestResult -TestName "Inicio de Sesión" -Results $results
    $allResults += $testResult
} else {
    Write-Host "Prueba omitida." -ForegroundColor $warningColor
}

# Prueba 3: Dashboard de Administrador
Show-Title "PRUEBA 3: DASHBOARD DE ADMINISTRADOR"

$steps = @(
    "Iniciar sesión como administrador (admin@armonia.com / Admin123)",
    "Verificar que se muestra el dashboard",
    "Verificar que existe un menú lateral con las opciones especificadas",
    "Hacer clic en diferentes opciones del menú y verificar que se muestran las páginas correspondientes",
    "Cerrar sesión"
)

$criteria = @(
    "El dashboard muestra información general",
    "El menú lateral está presente con todas las opciones",
    "Se puede navegar entre las diferentes secciones",
    "Se puede cerrar sesión correctamente"
)

Show-Steps -Steps $steps
$continueTest = Read-Host "`n¿Desea continuar con esta prueba? (S/N)"
if ($continueTest -eq "S" -or $continueTest -eq "s") {
    $results = Check-Criteria -Criteria $criteria
    $testResult = Show-TestResult -TestName "Dashboard de Administrador" -Results $results
    $allResults += $testResult
} else {
    Write-Host "Prueba omitida." -ForegroundColor $warningColor
}

# Prueba 4: Dashboard de Residentes
Show-Title "PRUEBA 4: DASHBOARD DE RESIDENTES"

$steps = @(
    "Iniciar sesión como residente (residente@test.com / Residente123)",
    "Verificar que se muestra el dashboard de residentes",
    "Verificar que existe un menú con opciones relevantes para residentes",
    "Verificar que puede ver su estado de cuenta",
    "Verificar que puede reservar servicios comunes",
    "Verificar que puede crear PQRs",
    "Cerrar sesión"
)

$criteria = @(
    "El dashboard de residentes muestra información relevante",
    "Se puede ver el estado de cuenta",
    "Se pueden realizar reservas de servicios comunes",
    "Se pueden crear PQRs",
    "Se puede cerrar sesión correctamente"
)

Show-Steps -Steps $steps
$continueTest = Read-Host "`n¿Desea continuar con esta prueba? (S/N)"
if ($continueTest -eq "S" -or $continueTest -eq "s") {
    $results = Check-Criteria -Criteria $criteria
    $testResult = Show-TestResult -TestName "Dashboard de Residentes" -Results $results
    $allResults += $testResult
} else {
    Write-Host "Prueba omitida." -ForegroundColor $warningColor
}

# Prueba 5: Dashboard de Recepción
Show-Title "PRUEBA 5: DASHBOARD DE RECEPCIÓN/VIGILANCIA"

$steps = @(
    "Iniciar sesión como personal de recepción (recepcion@test.com / Recepcion123)",
    "Verificar que se muestra el dashboard de recepción/vigilancia",
    "Verificar que existe un menú con opciones relevantes para recepción",
    "Verificar que puede registrar visitantes",
    "Verificar que puede gestionar correspondencia",
    "Verificar que puede registrar novedades/incidentes",
    "Cerrar sesión"
)

$criteria = @(
    "El dashboard de recepción muestra información relevante",
    "Se pueden registrar visitantes",
    "Se puede gestionar correspondencia",
    "Se pueden registrar novedades/incidentes",
    "Se puede cerrar sesión correctamente"
)

Show-Steps -Steps $steps
$continueTest = Read-Host "`n¿Desea continuar con esta prueba? (S/N)"
if ($continueTest -eq "S" -or $continueTest -eq "s") {
    $results = Check-Criteria -Criteria $criteria
    $testResult = Show-TestResult -TestName "Dashboard de Recepción" -Results $results
    $allResults += $testResult
} else {
    Write-Host "Prueba omitida." -ForegroundColor $warningColor
}

# Prueba 6: Flujo Completo
Show-Title "PRUEBA 6: FLUJO COMPLETO"

$steps = @(
    "Iniciar sesión como administrador",
    "Crear una asamblea programada",
    "Cerrar sesión",
    "Iniciar sesión como residente",
    "Verificar que puede ver la asamblea programada",
    "Crear una PQR",
    "Cerrar sesión",
    "Iniciar sesión como recepcionista",
    "Registrar un visitante para el residente",
    "Cerrar sesión"
)

$criteria = @(
    "Se puede crear una asamblea como administrador",
    "El residente puede ver la asamblea programada",
    "El residente puede crear una PQR",
    "El recepcionista puede registrar visitantes",
    "Todo el flujo funciona correctamente"
)

Show-Steps -Steps $steps
$continueTest = Read-Host "`n¿Desea continuar con esta prueba? (S/N)"
if ($continueTest -eq "S" -or $continueTest -eq "s") {
    $results = Check-Criteria -Criteria $criteria
    $testResult = Show-TestResult -TestName "Flujo Completo" -Results $results
    $allResults += $testResult
} else {
    Write-Host "Prueba omitida." -ForegroundColor $warningColor
}

# Mostrar resumen final
Show-Title "RESUMEN DE RESULTADOS"

$totalTests = $allResults.Count
$passedTests = ($allResults | Where-Object { $_.Success -eq $true }).Count
$failedTests = $totalTests - $passedTests

Write-Host "Total de pruebas ejecutadas: $totalTests" -ForegroundColor $infoColor
Write-Host "Pruebas exitosas: $passedTests" -ForegroundColor $successColor
Write-Host "Pruebas fallidas: $failedTests" -ForegroundColor $warningColor

Write-Host "`nDetalle de resultados:" -ForegroundColor $infoColor
foreach ($result in $allResults) {
    $resultColor = if ($result.Success) { $successColor } else { $warningColor }
    $resultText = if ($result.Success) { "EXITOSA" } else { "FALLIDA" }
    
    Write-Host "  $($result.Name): " -NoNewline
    Write-Host $resultText -ForegroundColor $resultColor -NoNewline
    Write-Host " ($($result.PassedCriteria)/$($result.TotalCriteria) criterios)"
}

# Generar reporte
$reportDate = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$reportPath = "C:\Users\meciz\Documents\armonia\manual-test-results_$reportDate.md"

$reportContent = @"
# Resultados de Pruebas Manuales de Armonía

*Fecha: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")*

## Resumen

- **Total de pruebas ejecutadas**: $totalTests
- **Pruebas exitosas**: $passedTests
- **Pruebas fallidas**: $failedTests

## Detalle de Resultados

$(foreach ($result in $allResults) {
    $resultText = if ($result.Success) { "EXITOSA" } else { "FALLIDA" }
    "### $($result.Name): $resultText ($($result.PassedCriteria)/$($result.TotalCriteria) criterios)`n`n"
})

## Observaciones

*Las pruebas manuales fueron ejecutadas siguiendo el plan de pruebas definido en `manual-test-plan.md`.*
"@

$reportContent | Out-File -FilePath $reportPath -Encoding utf8

Write-Host "`nSe ha generado un reporte en: $reportPath" -ForegroundColor $infoColor
Write-Host "Pruebas manuales completadas." -ForegroundColor $successColor
