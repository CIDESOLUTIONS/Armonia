// Script para ejecutar todas las pruebas en secuencia
const cypress = require('cypress');
const fs = require('fs');
const path = require('path');

// Función para ejecutar las pruebas en secuencia
async function runTests() {
  console.log('Iniciando ejecución de pruebas...');
  
  try {
    // Crear carpeta para resultados si no existe
    const resultsDir = path.join(__dirname, '..', 'cypress', 'results');
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir);
    }
    
    // Definir los archivos de prueba en el orden deseado
    const testFiles = [
      'landing-page-updated.cy.ts',
      '02-login-updated.cy.ts',
      '03-admin-dashboard-updated.cy.ts',
      '04-resident-dashboard-updated.cy.ts',
      '05-reception-dashboard-updated.cy.ts',
      '06-integration-flow-updated.cy.ts'
    ];
    
    // Ejecutar cada archivo de prueba en secuencia
    for (const file of testFiles) {
      console.log(`Ejecutando: ${file}`);
      
      const results = await cypress.run({
        spec: `cypress/e2e/${file}`,
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
      const testName = path.basename(file, path.extname(file));
      const resultPath = path.join(resultsDir, `${testName}-result.json`);
      fs.writeFileSync(resultPath, JSON.stringify(results, null, 2));
      
      console.log(`Prueba completada: ${file}`);
      console.log(`Resultados guardados en: ${resultPath}`);
      console.log('='.repeat(50));
    }
    
    // Generar reporte combinado
    console.log('Generando reporte combinado...');
    const reporterPath = path.join(__dirname, '..', 'node_modules', '.bin', 'mochawesome-merge');
    const reportsPath = path.join(resultsDir, '*.json');
    const outputPath = path.join(resultsDir, 'full-report.json');
    
    await new Promise((resolve, reject) => {
      const { exec } = require('child_process');
      exec(`${reporterPath} ${reportsPath} -o ${outputPath}`, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error al generar reporte: ${error.message}`);
          return reject(error);
        }
        if (stderr) {
          console.error(`stderr: ${stderr}`);
        }
        console.log(`stdout: ${stdout}`);
        resolve();
      });
    });
    
    console.log('Todas las pruebas han sido ejecutadas exitosamente.');
    console.log(`Reporte completo disponible en: ${outputPath}`);
    
  } catch (error) {
    console.error('Error durante la ejecución de pruebas:', error);
  }
}

// Ejecutar las pruebas
runTests();