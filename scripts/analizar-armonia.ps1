# Script para analizar el estado del proyecto Armonía
# Este script ejecuta el analizador de proyecto y genera un archivo JSON con toda la información relevante
# Autor: Script generado por Claude
# Uso: .\analizar-armonia.ps1

# Configuración
$ProjectRoot = "C:\Users\meciz\Documents\armonia"
$AnalyzerScript = Join-Path $ProjectRoot "scripts\analyze-armonia.js"
$OutputPath = Join-Path $ProjectRoot "armonia-analysis.json"

# Colores para la salida
$InfoColor = "Cyan"
$SuccessColor = "Green"
$ErrorColor = "Red"
$WarningColor = "Yellow"

# Función para mostrar un banner
function Show-Banner {
    Write-Host
    Write-Host "===============================================" -ForegroundColor $InfoColor
    Write-Host "        ANALIZADOR DE PROYECTO ARMONÍA         " -ForegroundColor $InfoColor
    Write-Host "===============================================" -ForegroundColor $InfoColor
    Write-Host
}

# Función para verificar requisitos
function Test-Requirements {
    Write-Host "Verificando requisitos..." -ForegroundColor $InfoColor
    
    # Verificar Node.js
    try {
        $nodeVersion = node --version
        Write-Host "✓ Node.js instalado: $nodeVersion" -ForegroundColor $SuccessColor
    } 
    catch {
        Write-Host "✗ Node.js no está instalado o no está en el PATH" -ForegroundColor $ErrorColor
        Write-Host "  Por favor instale Node.js desde https://nodejs.org/" -ForegroundColor $ErrorColor
        return $false
    }
    
    # Verificar que el directorio del proyecto existe
    if (!(Test-Path -Path $ProjectRoot)) {
        Write-Host "✗ El directorio del proyecto no existe: $ProjectRoot" -ForegroundColor $ErrorColor
        return $false
    } 
    else {
        Write-Host "✓ Directorio del proyecto encontrado" -ForegroundColor $SuccessColor
    }
    
    # Verificar que los módulos npm necesarios están instalados
    try {
        $installedModules = npm list --depth=0 --json | ConvertFrom-Json
        $requiredModules = @("pg", "dotenv", "path")
        $missingModules = @()
        
        foreach ($module in $requiredModules) {
            if (!($installedModules.dependencies.PSObject.Properties.Name -contains $module)) {
                $missingModules += $module
            }
        }
        
        if ($missingModules.Count -gt 0) {
            Write-Host "⚠ Faltan módulos npm: $($missingModules -join ', ')" -ForegroundColor $WarningColor
            Write-Host "  Se instalarán automáticamente" -ForegroundColor $InfoColor
        } 
        else {
            Write-Host "✓ Todos los módulos npm requeridos están instalados" -ForegroundColor $SuccessColor
        }
    } 
    catch {
        Write-Host "⚠ No se pudieron verificar los módulos npm" -ForegroundColor $WarningColor
    }
    
    return $true
}

# Función para instalar los módulos npm necesarios
function Install-RequiredModules {
    Write-Host "Instalando módulos npm necesarios..." -ForegroundColor $InfoColor
    
    try {
        Set-Location $ProjectRoot
        npm install pg dotenv path fs
        Write-Host "✓ Módulos instalados correctamente" -ForegroundColor $SuccessColor
        return $true
    } 
    catch {
        Write-Host "✗ Error al instalar módulos npm: $_" -ForegroundColor $ErrorColor
        return $false
    }
}

# Función para ejecutar el análisis
function Run-Analysis {
    Write-Host "Ejecutando análisis del proyecto..." -ForegroundColor $InfoColor
    
    try {
        Set-Location $ProjectRoot
        # Ejecutar el script de análisis
        node $AnalyzerScript
        
        # Verificar si se generó el archivo de análisis
        if (Test-Path -Path $OutputPath) {
            Write-Host "✓ Análisis completado correctamente" -ForegroundColor $SuccessColor
            
            # Mostrar un resumen del análisis
            Write-Host "Resumen del análisis:" -ForegroundColor $InfoColor
            try {
                $analysis = Get-Content -Path $OutputPath -Raw | ConvertFrom-Json
                
                Write-Host "  - Proyecto: $($analysis.metadata.projectName)" -ForegroundColor $InfoColor
                Write-Host "  - Fecha de análisis: $($analysis.metadata.analyzedAt)" -ForegroundColor $InfoColor
                
                # Mostrar el estado del proyecto
                Write-Host "  - Estado del proyecto:" -ForegroundColor $InfoColor
                Write-Host "    * Frontend: $($analysis.projectStatus.frontend)" -ForegroundColor $(if ($analysis.projectStatus.frontend -eq "OK") { $SuccessColor } else { $WarningColor })
                Write-Host "    * Backend: $($analysis.projectStatus.backend)" -ForegroundColor $(if ($analysis.projectStatus.backend -eq "OK") { $SuccessColor } else { $WarningColor })
                Write-Host "    * Entorno: $($analysis.projectStatus.environment)" -ForegroundColor $(if ($analysis.projectStatus.environment -eq "OK") { $SuccessColor } else { $WarningColor })
                Write-Host "    * Git: $($analysis.projectStatus.git)" -ForegroundColor $(if ($analysis.projectStatus.git -eq "OK") { $SuccessColor } else { $WarningColor })
                
                # Mostrar recomendaciones
                if ($analysis.recommendations.Count -gt 0) {
                    Write-Host "  - Recomendaciones:" -ForegroundColor $InfoColor
                    foreach ($rec in $analysis.recommendations) {
                        $priorityColor = switch ($rec.priority) {
                            "alta" { $ErrorColor }
                            "media" { $WarningColor }
                            default { $InfoColor }
                        }
                        Write-Host "    * [$($rec.priority.ToUpper())] $($rec.message)" -ForegroundColor $priorityColor
                    }
                }
            } 
            catch {
                Write-Host "⚠ No se pudo leer el archivo de análisis para mostrar el resumen" -ForegroundColor $WarningColor
            }
            
            return $true
        } 
        else {
            Write-Host "✗ No se generó el archivo de análisis" -ForegroundColor $ErrorColor
            return $false
        }
    } 
    catch {
        Write-Host "✗ Error al ejecutar el análisis: $_" -ForegroundColor $ErrorColor
        return $false
    }
}

# Función principal
function Main {
    Show-Banner
    
    # Verificar requisitos
    if (!(Test-Requirements)) {
        Write-Host "No se cumplen los requisitos para ejecutar el análisis." -ForegroundColor $ErrorColor
        exit 1
    }
    
    # Instalar módulos requeridos si es necesario
    Install-RequiredModules
    
    # Ejecutar análisis
    if (Run-Analysis) {
        Write-Host
        Write-Host "===============================================" -ForegroundColor $SuccessColor
        Write-Host "         ANÁLISIS COMPLETADO CON ÉXITO         " -ForegroundColor $SuccessColor
        Write-Host "===============================================" -ForegroundColor $SuccessColor
        Write-Host
        Write-Host "Archivo de análisis generado en:" -ForegroundColor $InfoColor
        Write-Host $OutputPath -ForegroundColor $SuccessColor
        Write-Host
        Write-Host "Para usar este archivo en un nuevo chat con Claude:" -ForegroundColor $InfoColor
        Write-Host "1. Inicia un nuevo chat" -ForegroundColor $InfoColor
        Write-Host "2. Sube el archivo armonia-analysis.json como adjunto" -ForegroundColor $InfoColor
        Write-Host "3. Pide a Claude que analice el archivo para entender el contexto del proyecto" -ForegroundColor $InfoColor
    } 
    else {
        Write-Host "No se pudo completar el análisis." -ForegroundColor $ErrorColor
        exit 1
    }
}

# Ejecutar la función principal
Main