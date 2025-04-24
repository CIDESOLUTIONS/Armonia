# Script para arreglar rápidamente la directiva "use client" en register-complex.tsx

$filePath = "C:\Users\meciz\Documents\armonia\frontend\src\app\(public)\register-complex\page.tsx"
$backupPath = "C:\Users\meciz\Documents\armonia\frontend\src\app\(public)\register-complex\page.tsx.bak"

# Hacer una copia de seguridad
if (Test-Path $filePath) {
    Copy-Item -Path $filePath -Destination $backupPath -Force
    Write-Host "Archivo de respaldo creado en: $backupPath" -ForegroundColor Green
}

# Leer el contenido del archivo actual
$content = Get-Content -Path $filePath -Raw

# Verificar si el archivo ya tiene "use client" al principio
if ($content -match '^\s*"use client";') {
    Write-Host "El archivo ya tiene la directiva 'use client' al principio." -ForegroundColor Green
    exit 0
}

# Eliminar cualquier directiva "use client" existente en el archivo
$content = $content -replace '"use client";', ''

# Agregar la directiva al principio del archivo
$newContent = '"use client";' + "`r`n`r`n" + $content.Trim()

# Escribir el contenido modificado de vuelta al archivo
$newContent | Set-Content -Path $filePath

Write-Host "El archivo ha sido actualizado con éxito. La directiva 'use client' ahora está al principio." -ForegroundColor Green
