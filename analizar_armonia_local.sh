#!/bin/bash

# Ruta al proyecto
PROYECTO_DIR="/c/Users/meciz/Documents/armonia"
VENV_DIR="$PROYECTO_DIR/venv"
REPORTE="$PROYECTO_DIR/reporte_analisis_armonia.txt"

# Variables de estado por sección
ESTILO="OK"
SEGURIDAD="OK"
COMPLEJIDAD="OK"
PRUEBAS="OK"

# Iniciar archivo de reporte
echo "===============================" > "$REPORTE"
echo "🧾 REPORTE DE ANÁLISIS DEL PROYECTO ARMONÍA" >> "$REPORTE"
echo "Generado el $(date)" >> "$REPORTE"
echo "===============================\n" >> "$REPORTE"

cd "$PROYECTO_DIR" || { echo "No se encontró el directorio del proyecto"; exit 1; }

# Crear entorno virtual si no existe
if [ ! -d "$VENV_DIR" ]; then
    echo "===== Creando entorno virtual ====="
    python -m venv venv
fi

# Activar entorno virtual
source venv/Scripts/activate

# Instalar herramientas de análisis
pip install --upgrade pip > /dev/null
pip install flake8 bandit radon pytest > /dev/null

# Ejecutar flake8
{
echo "🎯 Análisis de Estilo (flake8)"
flake8 . --statistics 2>&1
RET_FLK=$?
echo ""
} >> "$REPORTE"

[ $RET_FLK -ne 0 ] && ESTILO="Problemas"

# Ejecutar bandit
{
echo "🔐 Análisis de Seguridad (bandit)"
bandit -r . -ll 2>&1
RET_BDT=$?
echo ""
} >> "$REPORTE"

[ $RET_BDT -ne 0 ] && SEGURIDAD="Problemas"

# Ejecutar radon
{
echo "📊 Análisis de Complejidad (radon)"
radon cc . -s -a 2>&1
RET_RDN=$?
echo ""
} >> "$REPORTE"

[ $RET_RDN -ne 0 ] && COMPLEJIDAD="Problemas"

# Ejecutar pytest
{
echo "🧪 Pruebas Automatizadas (pytest)"
pytest 2>&1
RET_PYT=$?
echo ""
} >> "$REPORTE"

[ $RET_PYT -ne 0 ] && PRUEBAS="Problemas"

# Tabla de resumen
{
echo "==============================="
echo "📋 RESUMEN GENERAL DEL ANÁLISIS"
echo "==============================="
printf "%-25s | %-10s\n" "Sección" "Estado"
echo "---------------------------|------------"
printf "%-25s | %-10s\n" "Estilo de Código" "$ESTILO"
printf "%-25s | %-10s\n" "Seguridad del Código" "$SEGURIDAD"
printf "%-25s | %-10s\n" "Complejidad" "$COMPLEJIDAD"
printf "%-25s | %-10s\n" "Pruebas Automatizadas" "$PRUEBAS"
echo "==============================="
} >> "$REPORTE"

# Cerrar entorno
deactivate

# Mensaje final
echo -e "\n✅ Análisis finalizado. Revisa el archivo:\n$REPORTE"