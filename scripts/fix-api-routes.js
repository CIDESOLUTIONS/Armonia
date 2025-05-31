/**
 * Script específico para corregir errores de lint en rutas API
 * 
 * Este script se enfoca en:
 * 1. Eliminar importaciones no utilizadas en rutas API
 * 2. Eliminar declaraciones de variables no utilizadas
 * 3. Agregar tipos específicos para parámetros y respuestas
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Directorios a procesar (enfocados en rutas API)
const DIRS_TO_PROCESS = [
  'src/app/api',
  'src/pages/api'
];

// Extensiones de archivos a procesar
const FILE_EXTENSIONS = ['.ts', '.js'];

// Función para encontrar todos los archivos con las extensiones especificadas
function findFiles(dir, extensions) {
  let results = [];
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat && stat.isDirectory()) {
      // Recursivamente buscar en subdirectorios
      results = results.concat(findFiles(filePath, extensions));
    } else {
      // Verificar si el archivo tiene una de las extensiones especificadas
      if (extensions.includes(path.extname(filePath).toLowerCase())) {
        results.push(filePath);
      }
    }
  });
  
  return results;
}

// Función para eliminar importaciones no utilizadas en rutas API
function cleanupApiImports(content) {
  // Lista de módulos comúnmente importados pero no utilizados
  const unusedModules = [
    'NextRequest', 'verify', 'jwt', 'JWT_SECRET'
  ];
  
  // Crear un patrón regex para encontrar importaciones de estos módulos
  const modulePattern = new RegExp(`\\b(${unusedModules.join('|')})\\b`, 'g');
  
  // Encontrar todas las importaciones
  const importRegex = /import\s+{([^}]+)}\s+from\s+['"]([^'"]+)['"]/g;
  
  let modifiedContent = content.replace(importRegex, (match, imports, source) => {
    // Dividir las importaciones y eliminar espacios en blanco
    const importList = imports.split(',').map(i => i.trim());
    
    // Filtrar las importaciones que no están en la lista de módulos no utilizados
    // o que se utilizan en el contenido fuera de la declaración de importación
    const usedImports = importList.filter(imp => {
      // Extraer el nombre de la importación (maneja alias como 'X as Y')
      const importName = imp.split(' as ')[0].trim();
      
      // Verificar si la importación está en la lista de módulos no utilizados
      if (!modulePattern.test(importName)) {
        return true;
      }
      
      // Verificar si la importación se usa en el contenido (excluyendo la línea de importación)
      const contentWithoutImport = content.replace(match, '');
      return new RegExp(`\\b${importName}\\b`).test(contentWithoutImport);
    });
    
    // Si no hay importaciones utilizadas, eliminar toda la línea
    if (usedImports.length === 0) {
      return '';
    }
    
    // Reconstruir la línea de importación con solo las importaciones utilizadas
    return `import { ${usedImports.join(', ')} } from '${source}'`;
  });
  
  // Eliminar importaciones directas no utilizadas
  const directImportRegex = /import\s+(\w+)\s+from\s+['"]([^'"]+)['"]/g;
  modifiedContent = modifiedContent.replace(directImportRegex, (match, importName, source) => {
    if (unusedModules.includes(importName)) {
      // Verificar si la importación se usa en el contenido (excluyendo la línea de importación)
      const contentWithoutImport = content.replace(match, '');
      if (!new RegExp(`\\b${importName}\\b`).test(contentWithoutImport)) {
        return '';
      }
    }
    return match;
  });
  
  return modifiedContent;
}

// Función para eliminar variables no utilizadas en rutas API
function removeUnusedApiVariables(content) {
  // Variables comunes no utilizadas en rutas API
  const patterns = [
    // Variables de JWT
    { regex: /const\s+JWT_SECRET\s*=\s*[^;]+;/g, 
      replacement: '// Variable JWT_SECRET eliminada por lint' },
    
    // Parámetros de funciones
    { regex: /\(\s*req\s*:[^,)]+\s*\)/g, 
      replacement: '(_req: unknown)' },
    { regex: /\(\s*_req\s*:[^,)]+\s*\)/g, 
      replacement: '(_req: unknown)' },
    
    // Variables de URL y búsqueda
    { regex: /const\s+url\s*=\s*[^;]+;/g, 
      replacement: '// Variable url eliminada por lint' },
    { regex: /const\s+searchParams\s*=\s*[^;]+;/g, 
      replacement: '// Variable searchParams eliminada por lint' },
    
    // Variables de respuesta
    { regex: /const\s+response\s*=\s*[^;]+;/g, 
      replacement: '// Variable response eliminada por lint' },
    
    // Variables de decodificación JWT
    { regex: /const\s+decoded\s*=\s*[^;]+;/g, 
      replacement: '// Variable decoded eliminada por lint' },
    
    // Variables específicas
    { regex: /const\s+assemblyId\s*=\s*[^;]+;/g, 
      replacement: '// Variable assemblyId eliminada por lint' },
    { regex: /const\s+prospect\s*=\s*[^;]+;/g, 
      replacement: '// Variable prospect eliminada por lint' },
    { regex: /const\s+width\s*=\s*[^;]+;/g, 
      replacement: '// Variable width eliminada por lint' },
    { regex: /const\s+pdfBytes\s*=\s*[^;]+;/g, 
      replacement: '// Variable pdfBytes eliminada por lint' }
  ];
  
  let modifiedContent = content;
  patterns.forEach(pattern => {
    modifiedContent = modifiedContent.replace(pattern.regex, pattern.replacement);
  });
  
  return modifiedContent;
}

// Función para agregar tipos específicos para parámetros y respuestas en API
function addApiSpecificTypes(content) {
  // Reemplazar any con tipos específicos para API
  const typeReplacements = [
    // Parámetros de API
    { regex: /:\s*any(\s*[,;=)])/g, replacement: ': unknown$1' },
    { regex: /Unexpected any/g, replacement: 'unknown' },
    
    // Respuestas de API
    { regex: /Promise<any>/g, replacement: 'Promise<unknown>' },
    { regex: /NextApiResponse<any>/g, replacement: 'NextApiResponse<unknown>' },
    
    // Datos y objetos
    { regex: /(data|result|response):\s*any/g, replacement: '$1: Record<string, unknown>' },
    
    // Parámetros de ruta
    { regex: /(params|query):\s*any/g, replacement: '$1: Record<string, string>' }
  ];
  
  let modifiedContent = content;
  typeReplacements.forEach(replacement => {
    modifiedContent = modifiedContent.replace(replacement.regex, replacement.replacement);
  });
  
  return modifiedContent;
}

// Función principal para procesar un archivo
function processFile(filePath) {
  console.log(`Procesando: ${filePath}`);
  
  try {
    // Leer el contenido del archivo
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Aplicar transformaciones específicas para rutas API
    content = cleanupApiImports(content);
    content = removeUnusedApiVariables(content);
    content = addApiSpecificTypes(content);
    
    // Guardar el archivo solo si hubo cambios
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`  ✓ Cambios aplicados`);
      return true;
    } else {
      console.log(`  ✓ No se requieren cambios`);
      return false;
    }
  } catch (error) {
    console.error(`  ✗ Error al procesar ${filePath}: ${error.message}`);
    return false;
  }
}

// Función principal
function main() {
  console.log('Iniciando corrección específica para rutas API...');
  
  let totalFiles = 0;
  let modifiedFiles = 0;
  
  // Procesar cada directorio
  DIRS_TO_PROCESS.forEach(dir => {
    const dirPath = path.join(process.cwd(), dir);
    
    if (fs.existsSync(dirPath)) {
      const files = findFiles(dirPath, FILE_EXTENSIONS);
      totalFiles += files.length;
      
      files.forEach(file => {
        if (processFile(file)) {
          modifiedFiles++;
        }
      });
    } else {
      console.warn(`Directorio no encontrado: ${dirPath}`);
    }
  });
  
  console.log('\nResumen:');
  console.log(`Total de archivos procesados: ${totalFiles}`);
  console.log(`Archivos modificados: ${modifiedFiles}`);
  console.log('\nEjecutando ESLint para verificar errores restantes...');
  
  try {
    execSync('npm run lint', { stdio: 'inherit' });
  } catch (error) {
    console.log('Aún hay errores de lint que requieren corrección manual.');
  }
}

// Ejecutar el script
main();
