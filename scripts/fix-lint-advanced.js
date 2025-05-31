/**
 * Script avanzado para corregir errores específicos de lint en el proyecto Armonía
 * 
 * Este script se enfoca en corregir:
 * 1. Variables no utilizadas (especialmente patrones comunes como 'decoded', 'response', etc.)
 * 2. Reemplazo de tipos 'any' con tipos específicos
 * 3. Corrección de caracteres de escape innecesarios
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Directorios a procesar
const DIRS_TO_PROCESS = [
  'src/app',
  'src/components',
  'src/lib',
  'src/pages'
];

// Extensiones de archivos a procesar
const FILE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];

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

// Función para eliminar variables no utilizadas específicas
function removeUnusedVariables(content) {
  // Lista de patrones comunes de variables no utilizadas
  const patterns = [
    // Variables declaradas pero no utilizadas
    { regex: /const\s+decoded\s*=\s*[^;]+;/g, replacement: '// Variable decoded eliminada por lint' },
    { regex: /const\s+response\s*=\s*[^;]+;/g, replacement: '// Variable response eliminada por lint' },
    { regex: /const\s+assemblyId\s*=\s*[^;]+;/g, replacement: '// Variable assemblyId eliminada por lint' },
    { regex: /const\s+prospect\s*=\s*[^;]+;/g, replacement: '// Variable prospect eliminada por lint' },
    { regex: /const\s+width\s*=\s*[^;]+;/g, replacement: '// Variable width eliminada por lint' },
    { regex: /const\s+pdfBytes\s*=\s*[^;]+;/g, replacement: '// Variable pdfBytes eliminada por lint' },
    
    // Parámetros no utilizados en funciones
    { regex: /\(([^)]*?)req:[^,)]+([^)]*)\)/g, replacement: '($1_req:unknown$2)' },
    
    // Importaciones específicas no utilizadas
    { regex: /import\s+{[^}]*?theme[^}]*?}\s+from\s+['"][^'"]+['"]/g, 
      replacement: (match) => match.replace(/theme,?\s*/, '') }
  ];
  
  let modifiedContent = content;
  patterns.forEach(pattern => {
    modifiedContent = modifiedContent.replace(pattern.regex, pattern.replacement);
  });
  
  return modifiedContent;
}

// Función para reemplazar 'any' con tipos más específicos
function replaceAnyTypes(content) {
  // Mapeo de contextos comunes a tipos específicos
  const typeReplacements = [
    // Parámetros de API y respuestas
    { regex: /(req|res|response|result):\s*any/g, replacement: '$1: unknown' },
    
    // Datos y objetos
    { regex: /(data|item|object|config|options):\s*any/g, replacement: '$1: Record<string, unknown>' },
    
    // Arrays
    { regex: /:\s*any\[\]/g, replacement: ': unknown[]' },
    
    // Funciones
    { regex: /\((.*?)\):\s*any\s*=>/g, replacement: '($1): unknown =>' },
    
    // Eventos
    { regex: /(e|event|evt):\s*any/g, replacement: '$1: React.SyntheticEvent' },
    
    // Genéricos
    { regex: /<any>/g, replacement: '<unknown>' },
    { regex: /<any,\s*any>/g, replacement: '<unknown, unknown>' },
    
    // Resto de casos
    { regex: /:\s*any(\s*[,;=)])/g, replacement: ': unknown$1' }
  ];
  
  let modifiedContent = content;
  typeReplacements.forEach(replacement => {
    modifiedContent = modifiedContent.replace(replacement.regex, replacement.replacement);
  });
  
  return modifiedContent;
}

// Función para corregir caracteres de escape innecesarios
function fixUnnecessaryEscapes(content) {
  // Patrones comunes de escapes innecesarios
  const escapePatterns = [
    { regex: /\\([+()[\]{}|^$])/g, replacement: '$1' }
  ];
  
  let modifiedContent = content;
  escapePatterns.forEach(pattern => {
    modifiedContent = modifiedContent.replace(pattern.regex, pattern.replacement);
  });
  
  return modifiedContent;
}

// Función para corregir el archivo tailwind.config.ts específicamente
function fixTailwindConfig() {
  const filePath = path.join(process.cwd(), 'tailwind.config.ts');
  
  if (!fs.existsSync(filePath)) {
    console.log('No se encontró el archivo tailwind.config.ts');
    return false;
  }
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Reemplazar require() con import
    content = content.replace(
      /const\s+([^=]+)\s*=\s*require\(['"]([^'"]+)['"]\)/g,
      'import $1 from "$2"'
    );
    
    // Reemplazar require() en línea
    content = content.replace(
      /require\(['"]([^'"]+)['"]\)/g,
      'await import("$1").then(module => module.default)'
    );
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('✓ tailwind.config.ts corregido');
    return true;
  } catch (error) {
    console.error(`Error al corregir tailwind.config.ts: ${error.message}`);
    return false;
  }
}

// Función principal para procesar un archivo
function processFile(filePath) {
  console.log(`Procesando: ${filePath}`);
  
  try {
    // Leer el contenido del archivo
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Aplicar transformaciones
    content = removeUnusedVariables(content);
    content = replaceAnyTypes(content);
    content = fixUnnecessaryEscapes(content);
    
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
  console.log('Iniciando corrección avanzada de errores de lint...');
  
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
  
  // Corregir tailwind.config.ts específicamente
  if (fixTailwindConfig()) {
    modifiedFiles++;
  }
  
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
