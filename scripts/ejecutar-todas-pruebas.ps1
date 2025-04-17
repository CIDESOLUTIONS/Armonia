# Script para ejecutar todas las pruebas de Cypress en secuencia

Write-Host "Iniciando ejecución de todas las pruebas de Armonía..." -ForegroundColor Green

# Cambiar al directorio del proyecto
Set-Location -Path "C:\Users\meciz\Documents\armonia"

# Asegurarse de que la aplicación esté en ejecución (el usuario debe haberla iniciado con "npm run dev")
Write-Host "Asegúrese de que la aplicación está en ejecución con 'npm run dev' en otra terminal" -ForegroundColor Yellow
Write-Host "Presione cualquier tecla para continuar o Ctrl+C para cancelar..." -ForegroundColor Yellow
$null = $host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Crear directorio para resultados si no existe
$resultsDir = "cypress\results\$(Get-Date -Format 'yyyy-MM-dd-HH-mm')"
if (-not (Test-Path $resultsDir)) {
    New-Item -Path $resultsDir -ItemType Directory -Force | Out-Null
}

# Definir los archivos de prueba en el orden deseado
$testFiles = @(
    "01-landing-page.cy.js",
    "02-login.cy.js",
    "03-admin-dashboard.cy.js",
    "04-admin-inventory.cy.js",
    "05-admin-assemblies.cy.js",
    "06-admin-financial.cy.js",
    "07-admin-pqr.cy.js",
    "08-admin-config.cy.js",
    "09-resident-dashboard.cy.js",
    "10-resident-payments.cy.js",
    "11-resident-reservations.cy.js",
    "12-resident-assemblies.cy.js",
    "13-resident-pqr.cy.js"
)

$successCount = 0
$failCount = 0
$failedTests = @()

# Ejecutar cada prueba en secuencia
foreach ($file in $testFiles) {
    Write-Host "`n===========================================" -ForegroundColor Cyan
    Write-Host "Ejecutando: $file" -ForegroundColor Cyan
    Write-Host "===========================================" -ForegroundColor Cyan
    
    $testName = [System.IO.Path]::GetFileNameWithoutExtension($file)
    $resultFile = Join-Path -Path $resultsDir -ChildPath "$testName-result.txt"
    
    try {
        # Ejecutar la prueba y guardar resultado
        $output = npx cypress run --spec "cypress/e2e/$file" 2>&1
        $output | Out-File -FilePath $resultFile -Encoding utf8
        
        if ($LASTEXITCODE -eq 0) {
            $successCount++
            Write-Host "✅ Prueba $file completada exitosamente." -ForegroundColor Green
        } else {
            $failCount++
            $failedTests += $file
            Write-Host "❌ Prueba $file falló." -ForegroundColor Red
        }
    } catch {
        $failCount++
        $failedTests += $file
        Write-Host "❌ Error al ejecutar $file: $_" -ForegroundColor Red
    }
}

# Generar reporte final
Write-Host "`n===========================================" -ForegroundColor Yellow
Write-Host "RESUMEN DE EJECUCIÓN DE PRUEBAS" -ForegroundColor Yellow
Write-Host "===========================================" -ForegroundColor Yellow
Write-Host "Total de pruebas ejecutadas: $($testFiles.Count)" -ForegroundColor White
Write-Host "Pruebas exitosas: $successCount" -ForegroundColor Green
Write-Host "Pruebas fallidas: $failCount" -ForegroundColor Red

if ($failCount -gt 0) {
    Write-Host "`nPruebas que fallaron:" -ForegroundColor Red
    foreach ($test in $failedTests) {
        Write-Host " - $test" -ForegroundColor Red
    }
}

# Guardar resumen en archivo
$summaryPath = Join-Path -Path $resultsDir -ChildPath "resumen-pruebas.txt"
@"
RESUMEN DE EJECUCIÓN DE PRUEBAS
==========================================
Total de pruebas ejecutadas: $($testFiles.Count)
Pruebas exitosas: $successCount
Pruebas fallidas: $failCount

Pruebas que fallaron:
$($failedTests -join "`n")

Fecha de ejecución: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
"@ | Out-File -FilePath $summaryPath -Encoding utf8

Write-Host "`nLos resultados detallados se han guardado en:" -ForegroundColor Yellow
Write-Host " - $resultsDir" -ForegroundColor Yellow
Write-Host " - Capturas de pantalla: cypress\screenshots" -ForegroundColor Yellow
Write-Host " - Videos: cypress\videos" -ForegroundColor Yellow

# Esperar para que el usuario pueda ver el resultado
Write-Host "`nPresione cualquier tecla para salir..." -ForegroundColor Gray
$null = $host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
