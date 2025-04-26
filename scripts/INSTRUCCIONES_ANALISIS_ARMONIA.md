# Análisis del Proyecto Armonía - Instrucciones

Este documento contiene instrucciones detalladas para analizar el estado del proyecto Armonía y mantener el contexto en nuevas conversaciones con Claude.

## Índice

1. [Introducción](#introducción)
2. [Instalación de las herramientas](#instalación-de-las-herramientas)
3. [Ejecución del análisis](#ejecución-del-análisis)
4. [Interpretación del análisis](#interpretación-del-análisis)
5. [Uso con Claude](#uso-con-claude)
6. [Personalización](#personalización)
7. [Solución de problemas](#solución-de-problemas)

## Introducción

El proyecto Armonía es una aplicación web freemium de tipo multitenant para la gestión de conjuntos residenciales. A medida que el proyecto evoluciona, se acumula contexto y conocimiento que se pierde cuando se inicia un nuevo chat con Claude debido a las limitaciones de contexto.

Esta herramienta de análisis de proyecto resuelve este problema creando un archivo JSON que captura el estado actual del proyecto, incluyendo:

- Estructura de directorios
- Configuración de entorno
- Dependencias y tecnologías
- Estado de la base de datos y esquemas
- Estado del repositorio Git
- Scripts disponibles

Una vez generado este archivo, puedes adjuntarlo en un nuevo chat con Claude para que rápidamente comprenda el contexto del proyecto y puedas continuar trabajando sin explicar todo desde cero.

## Instalación de las herramientas

### Requisitos previos

- Node.js (versión 14 o superior)
- PostgreSQL (para análisis de base de datos)
- Git (para análisis del repositorio)

### Pasos de instalación

1. **Descarga los scripts**:
   
   Los scripts ya están guardados en la carpeta del proyecto Armonía:
   
   - `analyze-armonia.js` → En `C:\Users\meciz\Documents\armonia\scripts\`
   - `analizar-armonia.ps1` → En `C:\Users\meciz\Documents\armonia\scripts\`
   - `armonia-config.json` → En `C:\Users\meciz\Documents\armonia\scripts\`
   - `process-armonia-analysis.js` → En `C:\Users\meciz\Documents\armonia\scripts\`

2. **Instala las dependencias necesarias**:
   
   Abre una terminal PowerShell y ejecuta:
   
   ```powershell
   cd C:\Users\meciz\Documents\armonia
   npm install pg dotenv fs path
   ```

## Ejecución del análisis

Hay dos formas de ejecutar el análisis:

### Opción 1: Usando PowerShell (Recomendado)

1. Abre una terminal PowerShell.
2. Navega al directorio de scripts:
   ```powershell
   cd C:\Users\meciz\Documents\armonia\scripts
   ```
3. Ejecuta el script:
   ```powershell
   .\analizar-armonia.ps1
   ```

El script verificará automáticamente los requisitos, instalará las dependencias necesarias si faltan, ejecutará el análisis y mostrará un resumen de los resultados.

### Opción 2: Usando Node.js directamente

1. Abre una terminal.
2. Navega al directorio de scripts:
   ```bash
   cd C:\Users\meciz\Documents\armonia\scripts
   ```
3. Ejecuta el script de análisis:
   ```bash
   node analyze-armonia.js
   ```
4. Opcionalmente, procesa el archivo de análisis para obtener un informe en Markdown:
   ```bash
   node process-armonia-analysis.js ../armonia-analysis.json
   ```

## Interpretación del análisis

Una vez completado el análisis, se generarán los siguientes archivos:

1. **`armonia-analysis.json`** - El archivo principal con todos los datos del análisis
2. **`armonia-status.md`** - Un informe en formato Markdown con un resumen del estado del proyecto (si usaste `process-armonia-analysis.js`)

En el informe encontrarás:

- **Estado general del proyecto**: Frontend, Backend, Entorno, Git
- **Recomendaciones**: Acciones prioritarias para resolver problemas detectados
- **Estructura del proyecto**: Vista jerárquica de los principales directorios y archivos
- **Tecnologías principales**: Las bibliotecas y frameworks más importantes del proyecto
- **Información de base de datos**: Esquemas, tablas y registros detectados
- **Scripts disponibles**: Listado categorizado de scripts de utilidad

El archivo JSON contiene información más detallada que puede ser consultada manualmente o interpretada por Claude.

## Uso con Claude

Para usar el análisis con Claude en una nueva conversación:

1. Inicia un nuevo chat con Claude
2. Sube el archivo **`armonia-analysis.json`** como adjunto
3. Escribe un mensaje como:

   ```
   Este es el archivo de análisis del proyecto Armonía. Por favor, revisa su contenido 
   para entender el contexto y el estado actual del proyecto. Ahora quisiera continuar 
   trabajando en [tema específico].
   ```

Claude analizará el archivo y entenderá la estructura, tecnologías y estado del proyecto, permitiéndote continuar el trabajo sin tener que explicar todo desde cero.

## Personalización

### Configuración del análisis

Puedes personalizar el análisis editando el archivo `armonia-config.json`. Algunas opciones configurables son:

- **Rutas de directorios**: Actualiza las rutas si tu proyecto está en una ubicación diferente
- **Exclusiones**: Añade directorios o extensiones de archivo que deseas ignorar
- **Análisis de base de datos**: Configura credenciales y opciones de análisis
- **Profundidad de análisis**: Ajusta cuánto se profundiza en la estructura de directorios

### Ampliación del análisis

Si deseas añadir más análisis personalizados:

1. Edita el archivo `analyze-armonia.js`
2. Añade nuevas funciones de análisis en áreas relevantes
3. Incorpora los resultados en el objeto `analysis` principal
4. Actualiza el procesador `process-armonia-analysis.js` si quieres que estas nuevas métricas aparezcan en el informe Markdown

## Solución de problemas

### Problemas comunes

1. **Error de conexión a la base de datos**:
   - Verifica que PostgreSQL esté en ejecución
   - Comprueba las credenciales en el archivo `.env`
   - Instala el módulo `pg` con `npm install pg`

2. **Problema con el análisis de Git**:
   - Asegúrate de que Git esté instalado y en el PATH
   - Verifica que el directorio del proyecto sea un repositorio Git válido

3. **El análisis no muestra toda la información esperada**:
   - Revisa la configuración en `armonia-config.json`
   - Verifica los permisos de acceso a los archivos
   - Comprueba las rutas en la configuración

### Consulta de logs

Si hay errores durante el análisis, revisa:

- La salida de la consola durante la ejecución
- Los mensajes de error específicos
- Las recomendaciones generadas en el informe

## Actualización periódica

Se recomienda ejecutar el análisis en estos momentos:

1. Antes de iniciar un nuevo chat con Claude
2. Después de cambios importantes en la estructura del proyecto
3. Después de actualizaciones significativas en la base de datos
4. Después de instalar o actualizar dependencias

Manteniendo un análisis actualizado, siempre tendrás un punto de referencia para retomar el trabajo con Claude de manera eficiente.

---

## Referencia técnica

### Estructura del archivo JSON de análisis

```json
{
  "metadata": {
    "projectName": "Armonía",
    "analyzedAt": "2025-04-26T15:30:45.123Z",
    "systemInfo": { ... }
  },
  "projectRoot": "C:\\Users\\meciz\\Documents\\armonia",
  "structure": { ... },
  "environment": { ... },
  "packageJson": { ... },
  "dependencies": { ... },
  "nextjs": { ... },
  "scripts": { ... },
  "git": { ... },
  "database": { ... },
  "recommendations": [ ... ],
  "projectStatus": { ... }
}
```

### Comandos útiles

- Generar solo el análisis: `node analyze-armonia.js`
- Procesar el análisis: `node process-armonia-analysis.js`
- Análisis completo con PowerShell: `.\analizar-armonia.ps1`

---

*Este documento fue creado para el proyecto Armonía - Última actualización: Abril 2025*