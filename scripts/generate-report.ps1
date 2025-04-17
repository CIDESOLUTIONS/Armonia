#!/usr/bin/env pwsh
# Script para generar un informe de estado del proyecto Armonía

# Colores para la salida
$infoColor = "Cyan"
$successColor = "Green"
$warningColor = "Yellow"
$errorColor = "Red"

# Función para obtener el estado de las pruebas
function Get-TestStatus {
    $testDir = "C:\Users\meciz\Documents\armonia\cypress\e2e"
    $testFiles = Get-ChildItem -Path $testDir -File -Filter "*.cy.*" | Sort-Object Name
    
    $testStatus = @()
    
    foreach ($file in $testFiles) {
        $testName = $file.Name
        $testPath = $file.FullName
        $content = Get-Content -Path $testPath -Raw
        
        # Contar tests y tests desactivados (skip)
        $totalTests = ([regex]::Matches($content, "it\(('|""|`).*('|""|`),")).Count
        $skippedTests = ([regex]::Matches($content, "it\.skip\(('|""|`).*('|""|`),")).Count
        $activeTests = $totalTests - $skippedTests
        
        $testStatus += [PSCustomObject]@{
            TestName = $testName
            TotalTests = $totalTests
            ActiveTests = $activeTests
            SkippedTests = $skippedTests
            Status = if ($skippedTests -gt 0) { "Parcialmente activo" } else { "Activo" }
        }
    }
    
    return $testStatus
}

# Función para obtener información del repositorio Git
function Get-GitInfo {
    try {
        $repoUrl = git config --get remote.origin.url
        $branch = git rev-parse --abbrev-ref HEAD
        $lastCommit = git log -1 --pretty=format:"%h - %an, %ar : %s"
        $pendingChanges = git status --porcelain
        
        return [PSCustomObject]@{
            RepoUrl = $repoUrl
            Branch = $branch
            LastCommit = $lastCommit
            PendingChanges = if ([string]::IsNullOrEmpty($pendingChanges)) { "No" } else { "Sí" }
            PendingChangesList = $pendingChanges
        }
    } catch {
        return [PSCustomObject]@{
            RepoUrl = "No disponible"
            Branch = "No disponible"
            LastCommit = "No disponible"
            PendingChanges = "No disponible"
            PendingChangesList = "No disponible"
        }
    }
}

# Función para obtener información de la aplicación
function Get-AppInfo {
    $backendRunning = $false
    $processName = "node"
    $processInfo = Get-Process $processName -ErrorAction SilentlyContinue | Where-Object {$_.CommandLine -like "*frontend*"}
    
    if ($null -ne $processInfo) {
        $backendRunning = $true
    }
    
    $envFile = "C:\Users\meciz\Documents\armonia\frontend\.env"
    $dbInfo = "No disponible"
    
    if (Test-Path $envFile) {
        $envContent = Get-Content $envFile
        $dbHost = ($envContent | Select-String "DB_HOST=(.*)").Matches.Groups[1].Value
        $dbName = ($envContent | Select-String "DB_NAME=(.*)").Matches.Groups[1].Value
        $dbUser = ($envContent | Select-String "DB_USER=(.*)").Matches.Groups[1].Value
        $dbPort = ($envContent | Select-String "DB_PORT=(.*)").Matches.Groups[1].Value
        
        $dbInfo = "Host: $dbHost, Port: $dbPort, DB: $dbName, User: $dbUser"
    }
    
    return [PSCustomObject]@{
        BackendRunning = $backendRunning
        DatabaseInfo = $dbInfo
    }
}

# Inicio del script principal
Write-Host "Generando informe de estado del proyecto Armonía..." -ForegroundColor $infoColor

# 1. Obtener estado de las pruebas
$testStatus = Get-TestStatus

# 2. Obtener información del repositorio
$gitInfo = Get-GitInfo

# 3. Obtener información de la aplicación
$appInfo = Get-AppInfo

# 4. Generar informe en formato Markdown
$reportPath = "C:\Users\meciz\Documents\armonia\INFORME_ESTADO.md"
$reportContent = @"
# Informe de Estado del Proyecto Armonía

*Generado automáticamente: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")*

## 1. Estado del Repositorio

- **URL del Repositorio**: $($gitInfo.RepoUrl)
- **Rama Actual**: $($gitInfo.Branch)
- **Último Commit**: $($gitInfo.LastCommit)
- **Cambios Pendientes**: $($gitInfo.PendingChanges)

$(if ($gitInfo.PendingChanges -eq "Sí") { 
@"
### Cambios Pendientes:
```
$($gitInfo.PendingChangesList)
```
"@
})

## 2. Estado de la Aplicación

- **Backend Ejecutándose**: $($appInfo.BackendRunning)
- **Información de Base de Datos**: $($appInfo.DatabaseInfo)

## 3. Estado de las Pruebas

| Archivo de Prueba | Total de Tests | Tests Activos | Tests Desactivados | Estado |
|-------------------|---------------|--------------|-------------------|--------|
$(foreach ($test in $testStatus) {
    "| $($test.TestName) | $($test.TotalTests) | $($test.ActiveTests) | $($test.SkippedTests) | $($test.Status) |"
})

## 4. Resumen de Pruebas

- **Total de Archivos de Prueba**: $($testStatus.Count)
- **Total de Tests**: $($testStatus | Measure-Object -Property TotalTests -Sum | Select-Object -ExpandProperty Sum)
- **Tests Activos**: $($testStatus | Measure-Object -Property ActiveTests -Sum | Select-Object -ExpandProperty Sum)
- **Tests Desactivados**: $($testStatus | Measure-Object -Property SkippedTests -Sum | Select-Object -ExpandProperty Sum)

## 5. Próximos Pasos Recomendados

1. Ejecutar `.\fix-test-credentials.ps1` para asegurar que las credenciales de prueba sean correctas.
2. Ejecutar `.\validate-initial-tests.ps1` para verificar las pruebas básicas.
3. Ejecutar `.\run-sequential-tests.ps1` para ejecutar todas las pruebas secuencialmente.
4. Revisar los archivos en `cypress\screenshots` si alguna prueba falla.
5. Sincronizar con GitHub usando `.\sync-with-github.ps1` después de que todas las pruebas pasen.

## 6. Preparación para Producción

Para preparar el despliegue en producción, consulte el archivo `ESTRATEGIA_DESPLIEGUE.md` para instrucciones detalladas sobre:

- Configuración de contenedores Docker
- Estrategia de despliegue en la nube
- Configuración de seguridad
- Monitoreo y mantenimiento

---

*Este informe se generó automáticamente. Para obtener un informe actualizado, ejecute `.\generate-report.ps1`*
"@

# Escribir informe a archivo
$reportContent | Out-File -FilePath $reportPath -Encoding utf8

Write-Host "Informe generado exitosamente en: $reportPath" -ForegroundColor $successColor
Write-Host "Para ver el informe, abra el archivo en un editor de Markdown." -ForegroundColor $infoColor

# Abrir el informe automáticamente
Start-Process $reportPath
