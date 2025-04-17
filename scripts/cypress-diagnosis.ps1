#!/usr/bin/env pwsh
# Script para diagnosticar problemas con Cypress

# Colores para la salida
$infoColor = "Cyan"
$successColor = "Green"
$warningColor = "Yellow"
$errorColor = "Red"

# Función para mostrar título
function Show-Title {
    param([string]$Title)
    
    $length = $Title.Length + 4
    $border = "=" * $length
    
    Write-Host "`n$border" -ForegroundColor $infoColor
    Write-Host "| $Title |" -ForegroundColor $infoColor
    Write-Host "$border`n" -ForegroundColor $infoColor
}

# Inicio del script principal
Show-Title "DIAGNÓSTICO DE CYPRESS"

# 1. Verificar Node.js
Show-Title "VERIFICACIÓN DE NODE.JS"
try {
    $nodeVersion = node --version
    $npmVersion = npm --version
    
    Write-Host "Node.js: $nodeVersion" -ForegroundColor $successColor
    Write-Host "npm: $npmVersion" -ForegroundColor $successColor
} catch {
    Write-Host "Error al verificar Node.js: $_" -ForegroundColor $errorColor
    Write-Host "Asegúrese de que Node.js esté instalado correctamente." -ForegroundColor $warningColor
}

# 2. Verificar instalación de Cypress
Show-Title "VERIFICACIÓN DE CYPRESS"
try {
    $cypressVersion = npx cypress --version
    Write-Host "Cypress CLI: $cypressVersion" -ForegroundColor $successColor
} catch {
    Write-Host "Error al verificar Cypress CLI: $_" -ForegroundColor $errorColor
}

# 3. Verificar carpetas de Cypress
Show-Title "CARPETAS DE CYPRESS"
$rootDir = $PSScriptRoot
$cypressDir = Join-Path $rootDir "cypress"
$frontendDir = Join-Path $rootDir "frontend"
$frontendCypressDir = Join-Path $frontendDir "cypress"

if (Test-Path $cypressDir) {
    Write-Host "Carpeta de Cypress en raíz: Existe" -ForegroundColor $successColor
    $subfolders = Get-ChildItem -Path $cypressDir -Directory | Select-Object -ExpandProperty Name
    Write-Host "Subcarpetas: $($subfolders -join ', ')" -ForegroundColor $infoColor
} else {
    Write-Host "Carpeta de Cypress en raíz: No existe" -ForegroundColor $errorColor
}

if (Test-Path $frontendCypressDir) {
    Write-Host "Carpeta de Cypress en frontend: Existe" -ForegroundColor $successColor
    $subfolders = Get-ChildItem -Path $frontendCypressDir -Directory | Select-Object -ExpandProperty Name
    Write-Host "Subcarpetas: $($subfolders -join ', ')" -ForegroundColor $infoColor
} else {
    Write-Host "Carpeta de Cypress en frontend: No existe" -ForegroundColor $infoColor
}

# 4. Verificar archivos de configuración
Show-Title "ARCHIVOS DE CONFIGURACIÓN"
$configFiles = @(
    (Join-Path $rootDir "cypress.config.js"),
    (Join-Path $rootDir "cypress.config.ts"),
    (Join-Path $frontendDir "cypress.config.js"),
    (Join-Path $frontendDir "cypress.config.ts")
)

foreach ($file in $configFiles) {
    if (Test-Path $file) {
        Write-Host "Archivo de configuración: $file" -ForegroundColor $successColor
        Write-Host "Contenido:" -ForegroundColor $infoColor
        Get-Content -Path $file | Select-Object -First 10 | ForEach-Object { Write-Host "  $_" -ForegroundColor $infoColor }
        Write-Host "  [...]" -ForegroundColor $infoColor
    }
}

# 5. Verificar package.json para scripts de Cypress
Show-Title "SCRIPTS EN PACKAGE.JSON"
$packageJsonFiles = @(
    (Join-Path $rootDir "package.json"),
    (Join-Path $frontendDir "package.json")
)

foreach ($file in $packageJsonFiles) {
    if (Test-Path $file) {
        Write-Host "Archivo package.json: $file" -ForegroundColor $successColor
        $packageContent = Get-Content -Path $file -Raw
        $packageJsonObj = $packageContent | ConvertFrom-Json
        
        if ($packageJsonObj.scripts) {
            Write-Host "Scripts:" -ForegroundColor $infoColor
            $scriptProps = $packageJsonObj.scripts | Get-Member -MemberType NoteProperty | Where-Object { $_.Name -like "*cypress*" -or $_.Name -like "*test*" }
            
            if ($scriptProps) {
                foreach ($script in $scriptProps) {
                    $scriptName = $script.Name
                    $scriptValue = $packageJsonObj.scripts.$scriptName
                    Write-Host "  $scriptName`: $scriptValue" -ForegroundColor $infoColor
                }
            } else {
                Write-Host "  No se encontraron scripts relacionados con Cypress" -ForegroundColor $warningColor
            }
        }
    }
}

# 6. Verificar entorno de ejecución
Show-Title "ENTORNO DE EJECUCIÓN"
$env:DEBUG = "cypress:*"
Write-Host "Variable DEBUG establecida para obtener más información: cypress:*" -ForegroundColor $infoColor

Write-Host "Intentando verificar la instalación de Cypress..." -ForegroundColor $infoColor
& npx cypress verify

# 7. Recomendaciones
Show-Title "RECOMENDACIONES"
Write-Host "1. Reinstalar Cypress completamente:" -ForegroundColor $warningColor
Write-Host "   npm uninstall cypress" -ForegroundColor $infoColor
Write-Host "   npm cache clean --force" -ForegroundColor $infoColor
Write-Host "   npm install cypress@13.17.0 --save-dev" -ForegroundColor $infoColor

Write-Host "2. Verificar que el navegador Chrome está instalado correctamente" -ForegroundColor $warningColor

Write-Host "3. Probar con un proyecto de Cypress mínimo para verificar si el problema es específico de este proyecto" -ForegroundColor $warningColor
Write-Host "   npx cypress open --project ." -ForegroundColor $infoColor

Write-Host "4. Revisar los permisos del sistema de archivos" -ForegroundColor $warningColor

Write-Host "5. Si el problema persiste, considerar reinstalar Node.js" -ForegroundColor $warningColor
