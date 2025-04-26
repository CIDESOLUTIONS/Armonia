# Guía Rápida: Análisis del Proyecto Armonía

## ¿Qué hace esta herramienta?

Esta herramienta analiza el estado actual del proyecto Armonía y genera un archivo JSON con toda la información relevante. Este archivo puede ser utilizado para mantener el contexto del proyecto cuando inicias un nuevo chat con Claude.

## Pasos para ejecutar el análisis

1. **Guardar los scripts**:
   - Los scripts ya están guardados en la carpeta `C:\Users\meciz\Documents\armonia\scripts\`

2. **Ejecutar el análisis**:
   - Abre PowerShell
   - Navega a la carpeta de scripts: `cd C:\Users\meciz\Documents\armonia\scripts\`
   - Ejecuta: `.\analizar-armonia.ps1`

3. **Usar con Claude**:
   - Cuando inicies un nuevo chat, sube el archivo `armonia-analysis.json` como adjunto
   - Pide a Claude que analice el archivo para entender el contexto del proyecto

## Archivos generados

- **`armonia-analysis.json`**: Contiene todos los datos del análisis
- **`armonia-status.md`**: Informe resumen en formato Markdown (opcional)

## Resolución de problemas comunes

- Si hay problemas con la base de datos, verifica que PostgreSQL esté ejecutándose
- Si el script falla, asegúrate de tener instalado Node.js y las dependencias necesarias
- Para instalar dependencias: `npm install pg dotenv fs path`

## Cuándo ejecutar el análisis

- Antes de iniciar un nuevo chat con Claude
- Después de cambios importantes en la estructura del proyecto
- Después de actualizaciones en la base de datos

---

Para instrucciones más detalladas, consulta el archivo `INSTRUCCIONES_ANALISIS_ARMONIA.md`.
