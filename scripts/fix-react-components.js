/**
 * Script específico para corregir errores de lint en componentes React
 * 
 * Este script se enfoca en:
 * 1. Eliminar importaciones no utilizadas en componentes React
 * 2. Eliminar declaraciones de variables no utilizadas
 * 3. Agregar tipos específicos para eventos y props
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Directorios a procesar (enfocados en componentes React)
const DIRS_TO_PROCESS = [
  'src/app/(auth)/resident',
  'src/app/(auth)/reception',
  'src/app/(public)',
  'src/components'
];

// Extensiones de archivos a procesar
const FILE_EXTENSIONS = ['.tsx', '.jsx'];

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

// Función para eliminar importaciones no utilizadas en componentes React
function cleanupReactImports(content) {
  // Lista de componentes comúnmente importados pero no utilizados
  const unusedComponents = [
    'CardDescription', 'CardHeader', 'CardTitle', 'CardFooter',
    'TableCaption', 'DialogTrigger', 'Tabs', 'TabsContent', 'TabsList', 'TabsTrigger',
    'Filter', 'Building', 'User', 'Phone', 'Info', 'Truck', 'Home', 'Calendar', 'CalendarIcon',
    'AlertTriangle', 'theme'
  ];
  
  // Crear un patrón regex para encontrar importaciones de estos componentes
  const componentPattern = new RegExp(`\\b(${unusedComponents.join('|')})\\b`, 'g');
  
  // Encontrar todas las importaciones
  const importRegex = /import\s+{([^}]+)}\s+from\s+['"]([^'"]+)['"]/g;
  
  return content.replace(importRegex, (match, imports, source) => {
    // Dividir las importaciones y eliminar espacios en blanco
    const importList = imports.split(',').map(i => i.trim());
    
    // Filtrar las importaciones que no están en la lista de componentes no utilizados
    // o que se utilizan en el contenido fuera de la declaración de importación
    const usedImports = importList.filter(imp => {
      // Extraer el nombre de la importación (maneja alias como 'X as Y')
      const importName = imp.split(' as ')[0].trim();
      
      // Verificar si la importación está en la lista de componentes no utilizados
      if (!componentPattern.test(importName)) {
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
}

// Función para eliminar variables no utilizadas en componentes React
function removeUnusedReactVariables(content) {
  // Variables comunes no utilizadas en componentes React
  const patterns = [
    // useState variables
    { regex: /const\s+\[\s*activeTab\s*,\s*setActiveTab\s*\]\s*=\s*useState[^;]+;/g, 
      replacement: '// useState activeTab eliminado por lint' },
    
    // Destructuring de props
    { regex: /const\s+{\s*[^}]*residentName[^}]*}\s*=\s*[^;]+;/g, 
      replacement: (match) => match.replace(/residentName,?\s*/, '') },
    
    // Variables de notificaciones
    { regex: /const\s+notifications\s*=\s*[^;]+;/g, 
      replacement: '// Variable notifications eliminada por lint' },
    { regex: /const\s+unreadNotificationsCount\s*=\s*[^;]+;/g, 
      replacement: '// Variable unreadNotificationsCount eliminada por lint' },
    
    // Variables de pago
    { regex: /const\s+paymentData\s*=\s*[^;]+;/g, 
      replacement: '// Variable paymentData eliminada por lint' },
    { regex: /const\s+verifyPayment\s*=\s*[^;]+;/g, 
      replacement: '// Variable verifyPayment eliminada por lint' },
    
    // Parámetros de funciones
    { regex: /\(\s*index\s*:[^,)]+\s*\)\s*=>/g, 
      replacement: '(_index: number) =>' },
    { regex: /\(\s*index\s*,[^)]+\)\s*=>/g, 
      replacement: '(_index, $&' },
    
    // useState language
    { regex: /const\s+\[\s*language\s*,\s*setLanguage\s*\]\s*=\s*useState[^;]+;/g, 
      replacement: (match) => match.replace('setLanguage', '_setLanguage') }
  ];
  
  let modifiedContent = content;
  patterns.forEach(pattern => {
    modifiedContent = modifiedContent.replace(pattern.regex, pattern.replacement);
  });
  
  return modifiedContent;
}

// Función para agregar tipos específicos para eventos y props en React
function addReactSpecificTypes(content) {
  // Reemplazar any con tipos específicos de React
  const typeReplacements = [
    // Eventos
    { regex: /(e|event|evt):\s*any/g, replacement: '$1: React.SyntheticEvent' },
    { regex: /onChange={\s*\((e|event|evt)(\s*:\s*any)?\)\s*=>/g, replacement: 'onChange={(e: React.ChangeEvent<HTMLInputElement>) =>' },
    { regex: /onClick={\s*\((e|event|evt)(\s*:\s*any)?\)\s*=>/g, replacement: 'onClick={(e: React.MouseEvent) =>' },
    { regex: /onSubmit={\s*\((e|event|evt)(\s*:\s*any)?\)\s*=>/g, replacement: 'onSubmit={(e: React.FormEvent) =>' },
    
    // Props
    { regex: /interface\s+(\w+)Props\s*{\s*([^}]*any[^}]*)\s*}/g, 
      replacement: (match, name, props) => {
        // Reemplazar any con tipos más específicos en las props
        const newProps = props.replace(/:\s*any/g, ': unknown');
        return `interface ${name}Props {\n  ${newProps}\n}`;
      }
    },
    
    // Funciones de manejo de datos
    { regex: /handleData\s*\(\s*data\s*:\s*any\s*\)/g, replacement: 'handleData(data: Record<string, unknown>)' },
    { regex: /handleSubmit\s*\(\s*data\s*:\s*any\s*\)/g, replacement: 'handleSubmit(data: Record<string, unknown>)' },
    
    // Resto de casos
    { regex: /:\s*any(\s*[,;=)])/g, replacement: ': unknown$1' }
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
    
    // Aplicar transformaciones específicas para componentes React
    content = cleanupReactImports(content);
    content = removeUnusedReactVariables(content);
    content = addReactSpecificTypes(content);
    
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
  console.log('Iniciando corrección específica para componentes React...');
  
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
