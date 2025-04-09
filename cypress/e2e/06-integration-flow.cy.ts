// Prueba de integración para el flujo completo de la aplicación
describe('Flujo de Integración Completo', () => {
  const complexName = `Conjunto de Prueba ${Math.floor(Math.random() * 10000)}`;
  const adminEmail = `admin${Math.floor(Math.random() * 10000)}@test.com`;
  const adminPassword = 'Contraseña123!';
  const residentEmail = `resident${Math.floor(Math.random() * 10000)}@test.com`;
  const residentPassword = 'Contraseña123!';

  it('Debería permitir el flujo completo desde registro hasta operación', () => {
    // Paso 1: Registrar un nuevo conjunto residencial
    cy.visit('/');
    cy.contains('Registrar Conjunto').click();
    
    cy.get('form').within(() => {
      cy.get('input[name="complexName"]').type(complexName);
      cy.get('input[name="totalUnits"]').type('5');
      cy.get('input[name="adminName"]').type('Administrador de Prueba');
      cy.get('input[name="adminEmail"]').type(adminEmail);
      cy.get('input[name="adminPassword"]').type(adminPassword);
      cy.get('input[name="adminPhone"]').type('3001234567');
      cy.get('input[name="address"]').type('Calle 123 # 45-67');
      cy.get('input[name="city"]').type('Ciudad de Prueba');
      cy.get('input[name="state"]').type('Estado de Prueba');
      
      // Seleccionar tipos de propiedad
      cy.get('select[name="propertyTypes"]').select(['APARTMENT', 'HOUSE']);
      
      // Enviar el formulario
      cy.get('button[type="submit"]').click();
    });
    
    // Verificar confirmación y redirección a login
    cy.contains('Conjunto registrado con éxito', { timeout: 10000 }).should('be.visible');
    cy.url().should('include', '/login');
    
    // Paso 2: Iniciar sesión como administrador
    cy.get('form').within(() => {
      cy.get('input[name="email"]').type(adminEmail);
      cy.get('input[name="password"]').type(adminPassword);
      cy.get('button[type="submit"]').click();
    });
    
    // Verificar acceso al dashboard
    cy.url().should('include', '/dashboard');
    cy.contains(complexName).should('be.visible');
    
    // Paso 3: Crear una propiedad
    cy.contains('Inventario').click();
    cy.contains('Propiedades').click();
    cy.contains('Nueva Propiedad').click();
    
    cy.get('form').within(() => {
      cy.get('input[name="unitNumber"]').type('Apto 101');
      cy.get('select[name="type"]').select('APARTMENT');
      cy.get('input[name="area"]').type('85');
      cy.get('select[name="status"]').select('AVAILABLE');
      cy.get('input[name="block"]').type('A');
      cy.get('input[name="zone"]').type('Norte');
      cy.get('button[type="submit"]').click();
    });
    
    cy.contains('Propiedad creada con éxito').should('be.visible');
    
    // Paso 4: Agregar un residente a la propiedad
    cy.contains('Apto 101').click();
    cy.contains('Agregar Residente').click();
    
    cy.get('form').within(() => {
      cy.get('input[name="name"]').type('Residente de Prueba');
      cy.get('input[name="email"]').type(residentEmail);
      cy.get('input[name="dni"]').type('1234567890');
      cy.get('input[name="age"]').type('35');
      cy.get('input[name="whatsapp"]').type('3101234567');
      cy.get('select[name="isPrimary"]').select('true');
      cy.contains('Crear Usuario').click();
      cy.get('input[name="password"]').type(residentPassword);
      cy.get('button[type="submit"]').click();
    });
    
    cy.contains('Residente agregado con éxito').should('be.visible');
    
    // Paso 5: Agregar un servicio común
    cy.contains('Servicios').click();
    cy.contains('Nuevo Servicio').click();
    
    cy.get('form').within(() => {
      cy.get('input[name="name"]').type('Gimnasio');
      cy.get('textarea[name="description"]').type('Área de ejercicio con equipos modernos');
      cy.get('input[name="capacity"]').type('10');
      cy.get('input[name="startTime"]').type('06:00');
      cy.get('input[name="endTime"]').type('22:00');
      cy.get('textarea[name="rules"]').type('Uso máximo de 1 hora por persona');
      cy.get('input[name="cost"]').type('2');
      cy.get('button[type="submit"]').click();
    });
    
    cy.contains('Servicio creado con éxito').should('be.visible');
    cy.contains('Gimnasio').should('be.visible');
    
    // Paso 6: Crear una asamblea
    cy.contains('Asambleas').click();
    cy.contains('Programación').click();
    cy.contains('Nueva Asamblea').click();
    
    cy.get('form').within(() => {
      cy.get('input[name="title"]').type('Asamblea de Prueba');
      cy.get('select[name="type"]').select('ORDINARY');
      cy.get('input[name="date"]').type('2025-06-15T10:00');
      cy.get('textarea[name="description"]').type('Asamblea ordinaria para discutir temas importantes');
      cy.get('button[type="submit"]').click();
    });
    
    cy.contains('Asamblea creada con éxito').should('be.visible');
    cy.contains('Asamblea de Prueba').should('be.visible');
    
    // Paso 7: Agregar una pregunta de votación a la asamblea
    cy.contains('Asamblea de Prueba').click();
    cy.contains('Votaciones').click();
    cy.contains('Nueva Pregunta').click();
    
    cy.get('form').within(() => {
      cy.get('textarea[name="text"]').type('¿Aprueba el presupuesto anual propuesto?');
      cy.get('button[type="submit"]').click();
    });
    
    cy.contains('Pregunta de votación creada con éxito').should('be.visible');
    
    // Paso 8: Generar cuotas para la propiedad
    cy.contains('Finanzas').click();
    cy.contains('Cuotas').click();
    cy.contains('Generar Cuotas').click();
    
    cy.get('form').within(() => {
      cy.get('select[name="type"]').select('ORDINARY');
      cy.get('input[name="amount"]').type('100');
      cy.get('input[name="dueDate"]').type('2025-05-10');
      cy.get('input[name="concept"]').type('Cuota de administración Mayo 2025');
      cy.get('button[type="submit"]').click();
    });
    
    cy.contains('Cuotas generadas con éxito').should('be.visible');
    
    // Paso 9: Crear un proyecto
    cy.contains('Proyectos').click();
    cy.contains('Nuevo Proyecto').click();
    
    cy.get('form').within(() => {
      cy.get('input[name="name"]').type('Proyecto de Mejoramiento de Jardines');
      cy.get('textarea[name="description"]').type('Renovación de áreas verdes y jardines del conjunto');
      cy.get('input[name="budget"]').type('5000');
      cy.get('input[name="startDate"]').type('2025-05-01');
      cy.get('input[name="endDate"]').type('2025-06-30');
      cy.get('select[name="status"]').select('PLANNED');
      cy.get('button[type="submit"]').click();
    });
    
    cy.contains('Proyecto creado con éxito').should('be.visible');
    
    // Paso 10: Crear una PQR
    cy.contains('PQR').click();
    cy.contains('Nueva PQR').click();
    
    cy.get('form').within(() => {
      cy.get('select[name="userId"]').select(1); // Seleccionar el primer usuario
      cy.get('select[name="type"]').select('PETICION');
      cy.get('input[name="title"]').type('Solicitud de información sobre servicios');
      cy.get('textarea[name="description"]').type('Necesito información detallada sobre los horarios de los servicios comunes');
      cy.get('select[name="priority"]').select('MEDIA');
      cy.get('button[type="submit"]').click();
    });
    
    cy.contains('PQR creada con éxito').should('be.visible');
    
    // Paso 11: Cerrar sesión como administrador
    cy.contains('Cerrar Sesión').click();
    cy.url().should('include', '/login');
    
    // Paso 12: Iniciar sesión como residente
    cy.get('form').within(() => {
      cy.get('input[name="email"]').type(residentEmail);
      cy.get('input[name="password"]').type(residentPassword);
      cy.get('button[type="submit"]').click();
    });
    
    // Verificar acceso al dashboard de residente
    cy.url().should('include', '/resident');
    cy.contains('Mi Dashboard').should('be.visible');
    
    // Paso 13: Ver la información de la propiedad
    cy.contains('Mi Propiedad').click();
    cy.url().should('include', '/resident/property');
    cy.contains('Apto 101').should('be.visible');
    
    // Paso 14: Ver las cuotas pendientes
    cy.contains('Finanzas').click();
    cy.contains('Cuotas Pendientes').click();
    cy.url().should('include', '/resident/financial/fees');
    cy.contains('Cuota de administración Mayo 2025').should('be.visible');
    
    // Paso 15: Hacer una reserva de servicio
    cy.contains('Servicios').click();
    cy.url().should('include', '/resident/services');
    cy.contains('Gimnasio').should('be.visible');
    cy.contains('Reservar').first().click();
    
    // Completar formulario de reserva
    cy.get('form').within(() => {
      // Fecha de mañana
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowFormatted = tomorrow.toISOString().split('T')[0];
      
      cy.get('input[type="date"]').type(tomorrowFormatted);
      cy.get('input[type="time"]').first().type('10:00');
      cy.get('input[type="time"]').last().type('11:00');
      cy.contains('Reservar').click();
    });
    
    cy.contains('Reserva creada con éxito').should('be.visible');
    
    // Paso 16: Ver asambleas
    cy.contains('Asambleas').click();
    cy.url().should('include', '/resident/assemblies');
    cy.contains('Asamblea de Prueba').should('be.visible');
    
    // Paso 17: Crear una PQR como residente
    cy.contains('PQR').click();
    cy.contains('Nueva PQR').click();
    
    cy.get('form').within(() => {
      cy.get('select[name="type"]').select('QUEJA');
      cy.get('input[name="title"]').type('Problemas con el suministro de agua');
      cy.get('textarea[name="description"]').type('He notado baja presión de agua en las mañanas durante la última semana');
      cy.get('select[name="priority"]').select('ALTA');
      cy.get('button[type="submit"]').click();
    });
    
    cy.contains('PQR creada con éxito').should('be.visible');
    
    // Paso 18: Cerrar sesión como residente
    cy.contains('Cerrar Sesión').click();
    cy.url().should('include', '/login');
    
    // Paso 19: Iniciar sesión nuevamente como administrador
    cy.get('form').within(() => {
      cy.get('input[name="email"]').type(adminEmail);
      cy.get('input[name="password"]').type(adminPassword);
      cy.get('button[type="submit"]').click();
    });
    
    // Verificar acceso al dashboard
    cy.url().should('include', '/dashboard');
    
    // Paso 20: Verificar PQR creada por el residente
    cy.contains('PQR').click();
    cy.contains('Problemas con el suministro de agua').should('be.visible');
    
    // Paso 21: Responder a la PQR
    cy.contains('Problemas con el suministro de agua').click();
    cy.contains('Responder').click();
    
    cy.get('form').within(() => {
      cy.get('textarea[name="response"]').type('Estamos revisando el sistema de bombeo. Se resolverá en las próximas 24 horas.');
      cy.get('select[name="status"]').select('IN_PROCESS');
      cy.get('button[type="submit"]').click();
    });
    
    cy.contains('Respuesta enviada con éxito').should('be.visible');
    
    // Paso 22: Verificar reserva creada por el residente
    cy.contains('Servicios').click();
    cy.contains('Reservas').click();
    
    // Verificar que la reserva del gimnasio aparece
    cy.contains('Gimnasio').should('be.visible');
    cy.contains('Residente de Prueba').should('be.visible');
    
    // Paso 23: Generar un reporte financiero
    cy.contains('Finanzas').click();
    cy.contains('Reportes').click();
    
    cy.get('form').within(() => {
      cy.get('select[name="reportType"]').select('FEES');
      const currentDate = new Date().toISOString().split('T')[0];
      cy.get('input[name="startDate"]').type('2025-01-01');
      cy.get('input[name="endDate"]').type('2025-12-31');
      cy.get('button[type="submit"]').click();
    });
    
    cy.contains('Reporte Generado').should('be.visible');
    cy.contains('Cuota de administración Mayo 2025').should('be.visible');
    
    // Paso 24: Cerrar sesión final
    cy.contains('Cerrar Sesión').click();
    cy.url().should('include', '/login');
  });
});
