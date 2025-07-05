#!/bin/bash

# Fecha y archivo final
NOW=$(date +"%Y-%m-%d_%H-%M-%S")
FINAL_REPORT="auditoria_armonia_resumen_$NOW.md"

# Encabezado
echo "# 🧾 Informe de Auditoría Técnica - Proyecto Armonía" > "$FINAL_REPORT"
echo "**Fecha:** $NOW" >> "$FINAL_REPORT"
echo "**Directorio evaluado:** $(pwd)" >> "$FINAL_REPORT"
echo "" >> "$FINAL_REPORT"

# Estructura de carpetas
echo "## 📁 Estructura de Carpetas (src)" >> "$FINAL_REPORT"
tree src -a -I "node_modules|.next" >> "$FINAL_REPORT" 2>/dev/null || echo "_tree no disponible o carpeta no encontrada_" >> "$FINAL_REPORT"
echo "" >> "$FINAL_REPORT"

# Archivos de código
echo "## 📄 Archivos de Código (.ts, .tsx, .prisma)" >> "$FINAL_REPORT"
find src -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.prisma" \) >> "$FINAL_REPORT" 2>/dev/null
echo "" >> "$FINAL_REPORT"

# Rutas API
echo "## 🧩 Rutas API (src/pages/api)" >> "$FINAL_REPORT"
find src/pages/api -type f -name "*.ts" >> "$FINAL_REPORT" 2>/dev/null || echo "_No se encontraron rutas API_" >> "$FINAL_REPORT"
echo "" >> "$FINAL_REPORT"

# Portales por rol
echo "## 🧭 Portales por Rol (src/app/...)" >> "$FINAL_REPORT"
for portal in "(admin)" "(resident)" "(reception)" "(auth)" "(public)"; do
  echo "### 📌 Portal: $portal" >> "$FINAL_REPORT"
  find "src/app/$portal" -type f \( -name "*.ts" -o -name "*.tsx" \) >> "$FINAL_REPORT" 2>/dev/null || echo "_No encontrado_" >> "$FINAL_REPORT"
  echo "" >> "$FINAL_REPORT"
done

# Componentes UI
echo "## 🎨 Componentes UI (src/components/ui)" >> "$FINAL_REPORT"
find src/components/ui -type f >> "$FINAL_REPORT" 2>/dev/null || echo "_No se encontraron componentes UI_" >> "$FINAL_REPORT"
echo "" >> "$FINAL_REPORT"

# Estado Git
echo "## 🔁 Estado Git" >> "$FINAL_REPORT"
git status >> "$FINAL_REPORT"
echo "" >> "$FINAL_REPORT"

# Ramas y log
echo "## 🌿 Ramas y Últimos Commits" >> "$FINAL_REPORT"
git branch -a >> "$FINAL_REPORT"
git log -n 10 --pretty=format:"%h %ad | %s%d [%an]" --date=short >> "$FINAL_REPORT"
echo "" >> "$FINAL_REPORT"

# Diferencias sin commit
echo "## 📝 Cambios sin Commit" >> "$FINAL_REPORT"
git diff >> "$FINAL_REPORT" || echo "_Sin cambios sin commit_" >> "$FINAL_REPORT"
echo "" >> "$FINAL_REPORT"

# package.json scripts y dependencias
echo "## 📦 Scripts y Dependencias (package.json)" >> "$FINAL_REPORT"
if command -v jq &> /dev/null; then
  jq '{scripts, dependencies, devDependencies}' package.json >> "$FINAL_REPORT" 2>/dev/null
else
  echo "_jq no disponible, mostrando package.json completo_" >> "$FINAL_REPORT"
  cat package.json >> "$FINAL_REPORT"
fi
echo "" >> "$FINAL_REPORT"

# Prisma
echo "## 📄 Archivos Prisma (prisma/*.prisma)" >> "$FINAL_REPORT"
find prisma -type f -name "*.prisma" >> "$FINAL_REPORT" 2>/dev/null || echo "_No se encontraron esquemas Prisma_" >> "$FINAL_REPORT"
echo "" >> "$FINAL_REPORT"

# Documentación
echo "## 📚 Documentación Detectada (docs/)" >> "$FINAL_REPORT"
find docs -type f \( -name "*.md" -o -name "*.pdf" \) >> "$FINAL_REPORT" 2>/dev/null || echo "_No se encontró documentación_" >> "$FINAL_REPORT"
echo "" >> "$FINAL_REPORT"

# Resultado final
echo "✅ Informe generado: $FINAL_REPORT"
