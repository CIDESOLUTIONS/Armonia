// Script para ejecutar una prueba específica
const cypress = require('cypress');
const fs = require('fs');
const path = require('path');

// Obtener el nombre del archivo de prueba desde los argumentos
const testFile = process.argv[2];

if (!testFile) {
  console.error('Error: Debe especificar un archivo de prueba.');
  console.error('Uso: node run-test.js nombre-del-archivo.cy.ts');
  process.exit(1);
}

// Función para ejecutar la prueba especificada
async function runTest() {
  console.log(`Iniciando ejecución de la prueba: ${testFile}`);
  
  try {
    // Crear carpeta para resultados si no existe
    const resultsDir = path.join(__dirname, '..', 'cypress', 'results');
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir);
    }
    
    // Verificar que el archivo existe
    const testPath = path.join(__dirname, 'e2e', testFile);
    if (!fs.existsSync(testPath)) {
      console.error(`Error: El archivo de prueba '${testFile}' no existe.`);
      process.exit(1);
    }
    
    // Ejecutar la prueba
    const results = await cypress.run({
      spec: `cypress/e2e/${testFile}`,
      config: {
        video: true,
        screenshotOnRunFailure: true,
        reporter: 'mochawesome',
        reporterOptions: {
          reportDir: 'cypress/results',
          overwrite: false,
          html: true,
          json: true
        }
      }
    });
    
    // Guardar resultados
    const testName = path.basename(testFile, path.extname(testFile));
    const resultPath = path.join(resultsDir, `${testName}-result.json`);
    fs.writeFileSync(resultPath, JSON.stringify(results, null, 2));
    
    console.log(`Prueba completada: ${testFile}`);
    console.log(`Resultados guardados en: ${resultPath}`);
    
    // Verificar si la prueba fue exitosa
    if (results.totalFailed === 0) {
      console.log('✅ La prueba se ejecutó correctamente sin fallos.');
    } else {
      console.log(`❌ La prueba falló con ${results.totalFailed} errores.`);
    }
    
  } catch (error) {
    console.error('Error durante la ejecución de la prueba:', error);
  }
}

// Ejecutar la prueba
runTest();