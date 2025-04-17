#!/usr/bin/env pwsh
# Script para limpiar archivos de prueba antiguos o duplicados

Write-Host "Limpiando archivos de prueba antiguos para Armonía..." -ForegroundColor Green

# Archivos a conservar (pruebas principales con prefijo numérico)
$filesToKeep = @(
    "01-landing-page-final.cy.js",
    "02-login-final.cy.js",
    "03-admin-dashboard-final.cy.js",
    "04-resident-dashboard.cy.ts",
    "05-reception-dashboard.cy.ts",
    "06-integration-flow.cy.ts",
    "lighthouse.cy.ts"  # Mantenemos este para pruebas de rendimiento
)

# Directorio de pruebas
$testDir = "C:\Users\meciz\Documents\armonia\cypress\e2e"

# Crear directorio de backup
$backupDir = "C:\Users\meciz\Documents\armonia\cypress\backup-tests"
if (-not (Test-Path $backupDir)) {
    New-Item -Path $backupDir -ItemType Directory | Out-Null
    Write-Host "Creado directorio de backup: $backupDir" -ForegroundColor Yellow
}

# Obtener todos los archivos de prueba
$allFiles = Get-ChildItem -Path $testDir -File -Filter "*.cy.*"

Write-Host "Archivos a conservar:" -ForegroundColor Cyan
foreach ($file in $filesToKeep) {
    Write-Host "  - $file" -ForegroundColor Green
}

Write-Host "`nArchivos a mover a backup:" -ForegroundColor Cyan
foreach ($file in $allFiles) {
    if ($filesToKeep -notcontains $file.Name) {
        Write-Host "  - $($file.Name)" -ForegroundColor Yellow
        
        # Mover archivo a backup
        try {
            Move-Item -Path $file.FullName -Destination "$backupDir\$($file.Name)" -Force
            Write-Host "    Movido a backup exitosamente" -ForegroundColor Green
        } catch {
            Write-Host "    Error al mover el archivo: $_" -ForegroundColor Red
        }
    }
}

Write-Host "`nPruebas limpiadas exitosamente. Los archivos eliminados se han movido a $backupDir" -ForegroundColor Green
