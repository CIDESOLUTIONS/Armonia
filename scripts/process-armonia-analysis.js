// Procesador del archivo de análisis de Armonía
// Este script lee el archivo JSON de análisis y genera un informe
// en formato Markdown para facilitar su entendimiento

const fs = require('fs').promises;
const path = require('path');

// Configuración
const DEFAULT_ANALYSIS_PATH = './armonia-analysis.json';

// Función principal
async function processAnalysis(analysisPath = DEFAULT_ANALYSIS_PATH) {
  console.log(`Procesando archivo de análisis: ${analysisPath}`);
  
  try {
    // Leer el archivo de análisis
    const analysisContent = await fs.readFile(analysisPath, 'utf8');
    const analysis = JSON.parse(analysisContent);
    
    // Generar informe en Markdown
    const report = generateReport(analysis);
    
    // Guardar el informe
    const outputPath = path.join(path.dirname(analysisPath), 'armonia-status.md');
    await fs.writeFile(outputPath, report, 'utf8');
    
    console.log(`Informe generado en: ${outputPath}`);
    console.log('\n========= RESUMEN DEL PROYECTO =========');
    console.log(generateSummary(analysis));
    
    return { success: true, outputPath };
  } catch (error) {
    console.error('Error al procesar el análisis:', error);
    return { success: false, error: error.message };
  }
}

// Función para generar el informe
function generateReport(analysis) {
  const { metadata, projectStatus, recommendations } = analysis;
  
  // Encabezado
  let report = `# Proyecto Armonía - Informe de Estado\n\n`;
  report += `*Generado el: ${new Date().toLocaleString()}*\n\n`;
  
  // Metadatos del proyecto
  report += `## Información General\n\n`;
  report += `- **Proyecto:** ${metadata.projectName}\n`;
  report += `- **Analizado:** ${new Date(metadata.analyzedAt).toLocaleString()}\n`;
  report += `- **Ubicación:** \`${analysis.projectRoot}\`\n`;
  report += `- **Repositorio:** ${analysis.githubRepo || 'No especificado'}\n\n`;
  
  // Estado del proyecto
  report += `## Estado Actual del Proyecto\n\n`;
  report += `| Componente | Estado | Observaciones |\n`;
  report += `|------------|--------|---------------|\n`;
  
  // Frontend
  const frontendDetails = projectStatus.frontend === 'OK' 
    ? 'Estructura correcta'
    : 'Requiere revisión';
  report += `| Frontend | ${getStatusEmoji(projectStatus.frontend)} | ${frontendDetails} |\n`;
  
  // Backend
  const backendDetails = projectStatus.backend === 'OK'
    ? 'Base de datos operativa'
    : 'Problemas de conexión o estructura';
  report += `| Backend | ${getStatusEmoji(projectStatus.backend)} | ${backendDetails} |\n`;
  
  // Entorno
  const envDetails = projectStatus.environment === 'OK'
    ? 'Variables configuradas'
    : 'Falta configuración';
  report += `| Entorno | ${getStatusEmoji(projectStatus.environment)} | ${envDetails} |\n`;
  
  // Git
  const gitDetails = projectStatus.git === 'OK'
    ? 'Repositorio configurado'
    : 'Problemas de configuración';
  report += `| Git | ${getStatusEmoji(projectStatus.git)} | ${gitDetails} |\n\n`;
  
  // Recomendaciones
  if (recommendations && recommendations.length > 0) {
    report += `## Recomendaciones\n\n`;
    recommendations.forEach((rec, index) => {
      const priorityIcon = getPriorityIcon(rec.priority);
      report += `${index + 1}. ${priorityIcon} **[${rec.priority.toUpperCase()}]** ${rec.message}\n`;
    });
    report += `\n`;
  }
  
  // Estructura del proyecto
  report += `## Estructura del Proyecto\n\n`;
  report += `El proyecto tiene la siguiente estructura base. Para ver más detalles, consulta el archivo de análisis completo.\n\n`;
  report += '```\n';
  report += generateDirectoryTree(analysis.structure, 0, 2);
  report += '```\n\n';
  
  // Tecnologías principales
  if (analysis.packageJson && analysis.packageJson.mainTechnologies) {
    report += `## Tecnologías Principales\n\n`;
    report += `| Tecnología | Versión |\n`;
    report += `|------------|--------|\n`;
    
    for (const [tech, version] of Object.entries(analysis.packageJson.mainTechnologies)) {
      report += `| ${tech} | ${version} |\n`;
    }
    report += `\n`;
  }
  
  // Base de datos
  if (analysis.database && !analysis.database.error) {
    report += `## Información de Base de Datos\n\n`;
    
    // Esquema principal
    report += `### Esquema Principal (armonia)\n\n`;
    if (analysis.database.armonia && Object.keys(analysis.database.armonia).length > 0) {
      report += `Tablas encontradas: ${Object.keys(analysis.database.armonia).length}\n\n`;
      report += `| Tabla | Columnas | Registros |\n`;
      report += `|-------|----------|----------|\n`;
      
      for (const [tableName, tableInfo] of Object.entries(analysis.database.armonia)) {
        const columnCount = tableInfo.columns ? tableInfo.columns.length : 'N/A';
        const recordCount = tableInfo.recordCount !== undefined ? tableInfo.recordCount : 'N/A';
        report += `| ${tableName} | ${columnCount} | ${recordCount} |\n`;
      }
    } else {
      report += `No se encontraron tablas en el esquema principal o no fue posible analizar.\n`;
    }
    report += `\n`;
    
    // Esquemas tenant
    report += `### Esquemas Multitenant\n\n`;
    if (analysis.database.tenants && Object.keys(analysis.database.tenants).length > 0) {
      report += `Se encontraron ${Object.keys(analysis.database.tenants).length} esquemas tenant.\n\n`;
      report += `| Esquema | Tablas | Estado |\n`;
      report += `|---------|--------|--------|\n`;
      
      for (const [schemaName, schema] of Object.entries(analysis.database.tenants)) {
        const tableCount = Object.keys(schema).length;
        report += `| ${schemaName} | ${tableCount} | ✅ Activo |\n`;
      }
    } else {
      report += `No se encontraron esquemas tenant o no fue posible analizarlos.\n`;
    }
    report += `\n`;
  }
  
  // Scripts disponibles
  if (analysis.scripts && analysis.scripts.availableScripts) {
    report += `## Scripts Disponibles\n\n`;
    report += `El proyecto cuenta con ${analysis.scripts.availableScripts.length} scripts para distintas tareas.\n\n`;
    
    if (analysis.scripts.categorizedScripts) {
      // Scripts para base de datos
      if (analysis.scripts.categorizedScripts.database.length > 0) {
        report += `### Scripts de Base de Datos\n\n`;
        analysis.scripts.categorizedScripts.database.forEach(script => {
          report += `- \`${script}\`\n`;
        });
        report += `\n`;
      }
      
      // Scripts para pruebas
      if (analysis.scripts.categorizedScripts.testing.length > 0) {
        report += `### Scripts de Pruebas\n\n`;
        analysis.scripts.categorizedScripts.testing.forEach(script => {
          report += `- \`${script}\`\n`;
        });
        report += `\n`;
      }
      
      // Scripts para despliegue
      if (analysis.scripts.categorizedScripts.deployment.length > 0) {
        report += `### Scripts de Despliegue\n\n`;
        analysis.scripts.categorizedScripts.deployment.forEach(script => {
          report += `- \`${script}\`\n`;
        });
        report += `\n`;
      }
    }
  }
  
  // Instrucciones para nuevos chats con Claude
  report += `## Instrucciones para Nuevos Chats con Claude\n\n`;
  report += `Para continuar trabajando con Claude en un nuevo chat y mantener el contexto del proyecto:\n\n`;
  report += `1. Inicia un nuevo chat con Claude\n`;
  report += `2. Sube el archivo \`armonia-analysis.json\` como adjunto\n`;
  report += `3. Escribe: "Este es el archivo de análisis del proyecto Armonía. Por favor, revisa su contenido para entender el contexto y el estado actual del proyecto."\n`;
  report += `4. Continúa con tus preguntas específicas sobre el proyecto\n\n`;
  
  report += `---\n\n`;
  report += `*Este informe fue generado automáticamente para el proyecto Armonía.*\n`;
  
  return report;
}

// Función para generar un resumen conciso
function generateSummary(analysis) {
  const { projectStatus, recommendations } = analysis;
  
  let summary = `Proyecto: ${analysis.metadata.projectName}\n`;
  summary += `Estado: ${getOverallStatus(projectStatus)}\n\n`;
  
  // Estado de componentes
  summary += `Frontend: ${getStatusText(projectStatus.frontend)}\n`;
  summary += `Backend: ${getStatusText(projectStatus.backend)}\n`;
  summary += `Entorno: ${getStatusText(projectStatus.environment)}\n`;
  summary += `Git: ${getStatusText(projectStatus.git)}\n\n`;
  
  // Recomendaciones de alta prioridad
  const highPriorityRecs = recommendations?.filter(r => r.priority === 'alta') || [];
  if (highPriorityRecs.length > 0) {
    summary += `Recomendaciones prioritarias:\n`;
    highPriorityRecs.forEach((rec, i) => {
      summary += `${i+1}. ${rec.message}\n`;
    });
  }
  
  return summary;
}

// Función para generar una representación del árbol de directorios
function generateDirectoryTree(dir, level = 0, maxLevel = 3) {
  if (level > maxLevel) return '  '.repeat(level) + '...\n';
  if (!dir || !dir.children) return '';
  
  let result = '';
  const indent = '  '.repeat(level);
  
  for (const [name, item] of Object.entries(dir.children)) {
    if (item.type === 'directory') {
      result += `${indent}📁 ${name}/\n`;
      if (item.children && Object.keys(item.children).length > 0) {
        result += generateDirectoryTree(item, level + 1, maxLevel);
      }
    } else if (item.type === 'file') {
      const ext = item.extension || path.extname(name);
      const icon = getFileIcon(ext);
      result += `${indent}${icon} ${name}\n`;
    } else if (item.type === 'excluded-directory') {
      result += `${indent}📁 ${name}/ [excluido]\n`;
    }
  }
  
  return result;
}

// Función para obtener el ícono según el tipo de archivo
function getFileIcon(extension) {
  switch (extension.toLowerCase()) {
    case '.js':
    case '.jsx':
      return '📄 [JS]';
    case '.ts':
    case '.tsx':
      return '📄 [TS]';
    case '.json':
      return '📄 [JSON]';
    case '.md':
      return '📝';
    case '.sql':
      return '📄 [SQL]';
    case '.css':
    case '.scss':
    case '.sass':
      return '📄 [CSS]';
    case '.html':
      return '📄 [HTML]';
    case '.env':
      return '🔐';
    default:
      return '📄';
  }
}

// Función para obtener el emoji de estado
function getStatusEmoji(status) {
  return status === 'OK' ? '✅' : '⚠️';
}

// Función para obtener el texto de estado
function getStatusText(status) {
  return status === 'OK' ? 'OK ✅' : 'Requiere atención ⚠️';
}

// Función para obtener el estado general
function getOverallStatus(projectStatus) {
  const statuses = Object.values(projectStatus);
  if (statuses.every(s => s === 'OK')) {
    return 'Óptimo ✅';
  } else if (statuses.some(s => s === 'OK')) {
    return 'Requiere atención ⚠️';
  } else {
    return 'Crítico ❌';
  }
}

// Función para obtener ícono de prioridad
function getPriorityIcon(priority) {
  switch (priority.toLowerCase()) {
    case 'alta':
      return '🔴';
    case 'media':
      return '🟠';
    case 'baja':
      return '🟢';
    default:
      return '⚪';
  }
}

// Si se ejecuta directamente
if (require.main === module) {
  // Obtener ruta del archivo de análisis de los argumentos
  const args = process.argv.slice(2);
  const analysisPath = args[0] || DEFAULT_ANALYSIS_PATH;
  
  processAnalysis(analysisPath)
    .then(result => {
      if (!result.success) {
        console.error(`Error: ${result.error}`);
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('Error inesperado:', error);
      process.exit(1);
    });
}

module.exports = { processAnalysis };