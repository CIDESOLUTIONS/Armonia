/**
 * Script de prueba de integración para el sistema de comunicaciones
 * 
 * Este archivo ejecuta pruebas integrales para validar el funcionamiento
 * correcto de todos los componentes del sistema de comunicaciones en tiempo real.
 */

import { runCommunicationsTests, validateCommunicationsIntegration } from './validation';

/**
 * Función principal para ejecutar todas las pruebas de integración
 */
async function runIntegrationTests() {
  console.log('=== PRUEBAS DE INTEGRACIÓN DEL SISTEMA DE COMUNICACIONES ===');
  console.log('Fecha de ejecución:', new Date().toISOString());
  console.log('-----------------------------------------------------------');
  
  try {
    // Ejecutar pruebas de componentes individuales
    console.log('\n1. PRUEBAS DE COMPONENTES INDIVIDUALES');
    const testsResult = await runCommunicationsTests();
    
    if (testsResult.success) {
      console.log('✅ Todas las pruebas de componentes completadas con éxito');
      console.log('Resultados:', JSON.stringify(testsResult.results, null, 2));
    } else {
      console.error('❌ Error en las pruebas de componentes:', testsResult.error);
    }
    
    // Validar integración completa
    console.log('\n2. VALIDACIÓN DE INTEGRACIÓN COMPLETA');
    const integrationResult = await validateCommunicationsIntegration();
    
    if (integrationResult.success) {
      console.log('✅ Validación de integración completada con éxito');
      console.log('Resultados:', JSON.stringify(integrationResult.results, null, 2));
    } else {
      console.error('❌ Error en la validación de integración:', integrationResult.error);
    }
    
    // Resumen final
    console.log('\n=== RESUMEN DE PRUEBAS ===');
    const allSuccess = testsResult.success && integrationResult.success;
    
    if (allSuccess) {
      console.log('✅ TODAS LAS PRUEBAS COMPLETADAS CON ÉXITO');
      console.log('El sistema de comunicaciones está funcionando correctamente');
    } else {
      console.error('❌ SE ENCONTRARON ERRORES EN LAS PRUEBAS');
      console.error('Revise los detalles anteriores para identificar los problemas');
    }
    
    return {
      success: allSuccess,
      componentTests: testsResult,
      integrationTests: integrationResult,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('Error crítico durante las pruebas de integración:', error);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

// Ejecutar pruebas si este archivo se ejecuta directamente
if (require.main === module) {
  runIntegrationTests()
    .then(results => {
      console.log('\nResultados finales:', JSON.stringify(results, null, 2));
      process.exit(results.success ? 0 : 1);
    })
    .catch(error => {
      console.error('Error fatal:', error);
      process.exit(1);
    });
}

export default runIntegrationTests;
