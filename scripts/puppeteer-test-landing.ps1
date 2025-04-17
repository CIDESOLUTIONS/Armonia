#!/usr/bin/env pwsh
# Script para probar la landing page usando puppeteer directamente

Write-Host "Comprobando la landing page de Armonía con puppeteer..." -ForegroundColor Cyan

Write-Host "Verificando si la aplicación está en ejecución..." -ForegroundColor Yellow
try {
    $connection = Test-NetConnection -ComputerName "localhost" -Port 3000 -InformationLevel Quiet
    if ($connection) {
        Write-Host "La aplicación está en ejecución en http://localhost:3000." -ForegroundColor Green
    } else {
        Write-Host "La aplicación no está en ejecución. Iniciando el servidor..." -ForegroundColor Yellow
        Start-Process powershell -ArgumentList "-Command", "cd C:\Users\meciz\Documents\armonia\frontend; npm run dev"
        Write-Host "Esperando que el servidor esté listo (15 segundos)..." -ForegroundColor Yellow
        Start-Sleep -Seconds 15
    }
} catch {
    Write-Host "Error al verificar el estado de la aplicación: $_" -ForegroundColor Red
}

# Usar puppeteer directamente a través de la API de Claude
Write-Host "`nRealizando pruebas con puppeteer:" -ForegroundColor Cyan

Write-Host "`n1. Prueba: Verificando título y encabezado principal" -ForegroundColor Yellow
try {
    Write-Host "Cargando página principal..." -ForegroundColor White
    
    # Crear informe de resultados
    $results = @()
    
    # Prueba 1: Verificar el título y encabezado principal
    $testResult = @{
        "Test" = "Verificar título y encabezado principal"
        "Status" = "Pendiente"
        "Details" = ""
    }
    
    # Ejecutar la prueba
    $testResult.Status = "En progreso"
    puppeteer_navigate -url "http://localhost:3000"
    
    # Tomar captura de pantalla
    puppeteer_screenshot -name "landing-page-main" -width 1280 -height 800
    
    # Verificar contenido
    $content = puppeteer_get_text
    if ($content -like "*Armonía*" -and $content -like "*Gestión integral*") {
        $testResult.Status = "Exitoso"
        $testResult.Details = "Título y encabezado principal encontrados correctamente"
    } else {
        $testResult.Status = "Fallido"
        $testResult.Details = "No se encontró el título o encabezado principal"
    }
    
    $results += $testResult
} catch {
    Write-Host "Error en la prueba 1: $_" -ForegroundColor Red
    $testResult.Status = "Error"
    $testResult.Details = $_
    $results += $testResult
}

Write-Host "`n2. Prueba: Verificando elementos de navegación" -ForegroundColor Yellow
try {
    # Prueba 2: Verificar los elementos de navegación
    $testResult = @{
        "Test" = "Verificar elementos de navegación"
        "Status" = "Pendiente"
        "Details" = ""
    }
    
    # Ejecutar la prueba
    $testResult.Status = "En progreso"
    puppeteer_navigate -url "http://localhost:3000"
    
    # Verificar contenido
    $content = puppeteer_get_text
    if ($content -like "*Funcionalidades*" -and $content -like "*Planes*" -and $content -like "*Contacto*") {
        $testResult.Status = "Exitoso"
        $testResult.Details = "Elementos de navegación encontrados correctamente"
    } else {
        $testResult.Status = "Fallido"
        $testResult.Details = "No se encontraron todos los elementos de navegación"
    }
    
    $results += $testResult
} catch {
    Write-Host "Error en la prueba 2: $_" -ForegroundColor Red
    $testResult.Status = "Error"
    $testResult.Details = $_
    $results += $testResult
}

Write-Host "`n3. Prueba: Verificando navegación a página de login" -ForegroundColor Yellow
try {
    # Prueba 3: Verificar la navegación a la página de login
    $testResult = @{
        "Test" = "Verificar navegación a página de login"
        "Status" = "Pendiente"
        "Details" = ""
    }
    
    # Ejecutar la prueba
    $testResult.Status = "En progreso"
    puppeteer_navigate -url "http://localhost:3000"
    
    # Tomar captura de pantalla antes del clic
    puppeteer_screenshot -name "landing-page-before-login" -width 1280 -height 800
    
    # Buscar y hacer clic en el botón de inicio de sesión
    puppeteer_click -selector "a[href='/login']"
    
    # Esperar a que cargue la página de login
    Start-Sleep -Seconds 2
    
    # Tomar captura de pantalla después del clic
    puppeteer_screenshot -name "login-page" -width 1280 -height 800
    
    # Verificar URL
    $url = puppeteer_evaluate -script "window.location.href"
    if ($url -like "*login*") {
        $testResult.Status = "Exitoso"
        $testResult.Details = "Navegación a página de login exitosa. URL: $url"
    } else {
        $testResult.Status = "Fallido"
        $testResult.Details = "No se pudo navegar a la página de login. URL actual: $url"
    }
    
    $results += $testResult
} catch {
    Write-Host "Error en la prueba 3: $_" -ForegroundColor Red
    $testResult.Status = "Error"
    $testResult.Details = $_
    $results += $testResult
}

# Mostrar resultados
Write-Host "`n=======================================" -ForegroundColor Cyan
Write-Host "RESULTADOS DE PRUEBAS DE LANDING PAGE" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan

$exitCode = 0
foreach ($result in $results) {
    $statusColor = "White"
    switch ($result.Status) {
        "Exitoso" { $statusColor = "Green" }
        "Fallido" { $statusColor = "Red"; $exitCode = 1 }
        "Error" { $statusColor = "Red"; $exitCode = 1 }
        default { $statusColor = "Yellow" }
    }
    
    Write-Host "`nPrueba: $($result.Test)" -ForegroundColor Cyan
    Write-Host "Estado: " -NoNewline
    Write-Host $result.Status -ForegroundColor $statusColor
    Write-Host "Detalles: $($result.Details)" -ForegroundColor White
}

Write-Host "`n---------------------------------------" -ForegroundColor Cyan
$totalTests = $results.Count
$passedTests = ($results | Where-Object { $_.Status -eq "Exitoso" }).Count
$failedTests = $totalTests - $passedTests

Write-Host "Total de pruebas: $totalTests" -ForegroundColor White
Write-Host "Pruebas exitosas: $passedTests" -ForegroundColor Green
Write-Host "Pruebas fallidas: $failedTests" -ForegroundColor Red

if ($exitCode -eq 0) {
    Write-Host "`n✅ Todas las pruebas pasaron exitosamente!" -ForegroundColor Green
} else {
    Write-Host "`n❌ Hay pruebas fallidas. Revise los resultados." -ForegroundColor Red
}

exit $exitCode
