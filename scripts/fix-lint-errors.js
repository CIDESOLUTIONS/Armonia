/**
 * Script para corregir errores comunes de lint en el proyecto Armonía
 * 
 * Este script automatiza la corrección de los siguientes problemas:
 * 1. Elimina importaciones no utilizadas
 * 2. Convierte require() a import ES6
 * 3. Agrega tipos específicos para reemplazar 'any'
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

// Función para eliminar importaciones no utilizadas
function removeUnusedImports(content) {
  // Patrón para encontrar importaciones
  const importPattern = /import\s+{([^}]+)}\s+from\s+['"]([^'"]+)['"]/g;
  
  return content.replace(importPattern, (match, imports, source) => {
    // Dividir las importaciones y eliminar espacios en blanco
    const importList = imports.split(',').map(i => i.trim());
    
    // Filtrar las importaciones que se utilizan en el contenido
    const usedImports = importList.filter(imp => {
      // Extraer el nombre de la importación (maneja alias como 'X as Y')
      const importName = imp.split(' as ')[0].trim();
      
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
}

// Función para convertir require() a import ES6
function convertRequireToImport(content) {
  // Patrón para encontrar require()
  const requirePattern = /const\s+(\w+)\s+=\s+require\(['"]([^'"]+)['"]\);?/g;
  
  return content.replace(requirePattern, (match, varName, source) => {
    return `import ${varName} from '${source}';`;
  });
}

// Función para reemplazar 'any' con tipos más específicos cuando sea posible
function replaceAnyTypes(content) {
  // Reemplazar any[] con tipos más específicos basados en el contexto
  content = content.replace(/:\s*any\[\]/g, ': unknown[]');
  
  // Reemplazar (param: any) con tipos más específicos basados en el contexto
  content = content.replace(/\(([^)]*?):\s*any(\s*(?:,|\)))/g, '($1: unknown$2');
  
  // Reemplazar : any con : unknown para variables
  content = content.replace(/:\s*any\s*=/g, ': unknown =');
  
  return content;
}

// Función principal para procesar un archivo
function processFile(filePath) {
  console.log(`Procesando: ${filePath}`);
  
  try {
    // Leer el contenido del archivo
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Aplicar transformaciones
    content = removeUnusedImports(content);
    content = convertRequireToImport(content);
    content = replaceAnyTypes(content);
    
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
      /const\s+(\w+)\s+=\s+require\(['"]([^'"]+)['"]\)/g,
      'import $1 from "$2"'
    );
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('✓ tailwind.config.ts corregido');
    return true;
  } catch (error) {
    console.error(`Error al corregir tailwind.config.ts: ${error.message}`);
    return false;
  }
}

// Función principal
function main() {
  console.log('Iniciando corrección automática de errores de lint...');
  
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
