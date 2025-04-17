// Script para ejecutar las pruebas en secuencia con prioridad
const cypress = require('cypress');
const fs = require('fs');
const path = require('path');

// Función para ejecutar las pruebas en secuencia con manejo de errores
async function runTests() {
  console.log('Iniciando ejecución de pruebas prioritarias para Armonía...');
  
  try {
    // Crear carpeta para resultados si no existe
    const resultsDir = path.join(__dirname, 'results');
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir);
    }
    
    // Definir los archivos de prueba en el orden deseado
    const testFiles = [
      '01-landing-page.cy.js',    // Primera prioridad: Landing Page
      '02-login.cy.js',           // Segunda prioridad: Login
      '03-admin-dashboard.cy.js', // Tercera prioridad: Admin Dashboard
      '04-admin-inventory.cy.js',
      '05-admin-assemblies.cy.js',
      '06-admin-financial.cy.js',
      '07-admin-pqr.cy.js',
      '08-admin-config.cy.js',
      '09-resident-dashboard.cy.js',
      '10-resident-payments.cy.js',
      '11-resident-reservations.cy.js',
      '12-resident-assemblies.cy.js',
      '13-resident-pqr.cy.js'
    ];
    
    let failedTests = [];
    
    // Ejecutar cada archivo de prueba en secuencia
    for (const file of testFiles) {
      console.log(`\n=============================================`);
      console.log(`Ejecutando: ${file}`);
      console.log(`=============================================\n`);
      
      try {
        const results = await cypress.run({
          spec: `cypress/e2e/${file}`,
          config: {
            video: true,
            screenshotOnRunFailure: true
          }
        });
        
        // Guardar resultados
        const testName = path.basename(file, path.extname(file));
        const resultPath = path.join(resultsDir, `${testName}-result.json`);
        fs.writeFileSync(resultPath, JSON.stringify(results, null, 2));
        
        // Verificar si la prueba falló
        if (results.totalFailed > 0) {
          failedTests.push(file);
          console.log(`⚠️ La prueba ${file} falló con ${results.totalFailed} errores.`);
        } else {
          console.log(`✅ Prueba ${file} completada exitosamente.`);
        }
        
        console.log(`Resultados guardados en: ${resultPath}`);
      } catch (error) {
        console.error(`❌ Error durante la ejecución de ${file}:`, error);
        failedTests.push(file);
      }
    }
    
    // Generar reporte final
    console.log('\n=============================================');
    console.log('RESUMEN DE EJECUCIÓN DE PRUEBAS');
    console.log('=============================================\n');
    
    console.log(`Total de pruebas ejecutadas: ${testFiles.length}`);
    console.log(`Pruebas exitosas: ${testFiles.length - failedTests.length}`);
    console.log(`Pruebas fallidas: ${failedTests.length}`);
    
    if (failedTests.length > 0) {
      console.log('\nPruebas que fallaron:');
      failedTests.forEach(test => console.log(`- ${test}`));
    }
    
    // Generar archivo de resumen
    const summaryPath = path.join(resultsDir, 'test-summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify({
      totalTests: testFiles.length,
      passedTests: testFiles.length - failedTests.length,
      failedTests: failedTests.length,
      failedTestFiles: failedTests,
      executionDate: new Date().toISOString()
    }, null, 2));
    
    console.log(`\nResumen guardado en: ${summaryPath}`);
    
  } catch (error) {
    console.error('Error general durante la ejecución de pruebas:', error);
  }
}

// Ejecutar las pruebas
runTests();
