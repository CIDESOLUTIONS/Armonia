// scripts/verify-api.js
// Script para verificar que la API de vehículos esté funcionando correctamente

const fs = require('fs');
const path = require('path');

// Función para verificar archivos de API
function checkApiFiles() {
  console.log('Verificando archivos de API...');
  
  // Rutas a verificar
  const apiPaths = [
    'src/app/api/inventory/vehicles/route.ts',
    'src/app/api/inventory/vehicles/[id]/route.ts',
    'src/app/api/inventory/properties/route.ts'
  ];
  
  let allFilesExist = true;
  
  apiPaths.forEach(apiPath => {
    const fullPath = path.join(process.cwd(), apiPath);
    const fileExists = fs.existsSync(fullPath);
    
    console.log(`${apiPath}: ${fileExists ? 'EXISTE' : 'NO EXISTE'}`);
    
    if (!fileExists) {
      allFilesExist = false;
    }
  });
  
  return allFilesExist;
}

// Función para verificar componentes UI
function checkUIComponents() {
  console.log('\nVerificando componentes UI...');
  
  const uiComponentsPath = path.join(process.cwd(), 'src/components/ui');
  
  // Leer el índice de exportación
  const indexPath = path.join(uiComponentsPath, 'index.ts');
  if (!fs.existsSync(indexPath)) {
    console.log('El archivo index.ts no existe en los componentes UI');
    return false;
  }
  
  const indexContent = fs.readFileSync(indexPath, 'utf8');
  console.log('Contenido del índice:', indexContent);
  
  // Verificar los archivos referenciados en el índice
  const exportLines = indexContent.split('\n')
    .filter(line => line.startsWith('export'))
    .map(line => line.match(/from '\.\/(.+?)'/)?.[1])
    .filter(Boolean);
  
  console.log('\nComponentes exportados:', exportLines);
  
  let allComponentsExist = true;
  
  exportLines.forEach(component => {
    const componentPath = path.join(uiComponentsPath, `${component}.tsx`);
    const fileExists = fs.existsSync(componentPath);
    
    console.log(`Componente ${component}: ${fileExists ? 'EXISTE' : 'NO EXISTE'}`);
    
    if (!fileExists) {
      allComponentsExist = false;
    }
  });
  
  return allComponentsExist;
}

// Función para verificar la página de vehículos
function checkVehiclesPage() {
  console.log('\nVerificando página de vehículos...');
  
  const vehiclesPagePath = path.join(
    process.cwd(), 
    'src/app/(auth)/dashboard/inventory/vehicles/page.tsx'
  );
  
  if (!fs.existsSync(vehiclesPagePath)) {
    console.log('La página de vehículos no existe');
    return false;
  }
  
  const pageContent = fs.readFileSync(vehiclesPagePath, 'utf8');
  
  // Verificar importaciones
  const importLines = pageContent.match(/import [^;]+/g) || [];
  console.log('\nImportaciones encontradas:', importLines.length);
  
  importLines.forEach(line => {
    console.log(`- ${line}`);
  });
  
  return true;
}

// Ejecutar verificaciones
console.log('=== VERIFICACIÓN DE ESTRUCTURA DE CÓDIGO ===');
const apisOk = checkApiFiles();
const componentsOk = checkUIComponents();
const pageOk = checkVehiclesPage();

console.log('\n=== RESUMEN ===');
console.log(`APIs: ${apisOk ? '✅ OK' : '❌ PROBLEMAS'}`);
console.log(`Componentes UI: ${componentsOk ? '✅ OK' : '❌ PROBLEMAS'}`);
console.log(`Página de Vehículos: ${pageOk ? '✅ OK' : '❌ PROBLEMAS'}`);

if (!apisOk || !componentsOk || !pageOk) {
  console.log('\n⚠️ Se encontraron problemas que podrían causar el error de componentes indefinidos.');
} else {
  console.log('\n✅ Estructura básica correcta, el problema podría estar en los imports específicos.');
}