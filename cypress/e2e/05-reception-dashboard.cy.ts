// Prueba para el panel de recepción y vigilancia
describe('Panel de Recepción y Vigilancia', () => {
  beforeEach(() => {
    // Iniciar sesión como personal de recepción antes de cada prueba
    cy.visit('/login');
    cy.get('form').within(() => {
      cy.get('input[name="email"]').type('staff@example.com');
      cy.get('input[name="password"]').type('password123');
      cy.get('button[type="submit"]').click();
    });
    
    // Verificar que estamos en el dashboard
    cy.url().should('include', '/reception');
  });

  afterEach(() => {
    // Cerrar sesión después de cada prueba
    cy.contains('Cerrar Sesión').click();
    cy.url().should('include', '/login');
  });

  it('Debería mostrar el panel principal de recepción', () => {
    // Verificar elementos del dashboard
    cy.contains('Panel de Recepción').should('be.visible');
    cy.contains('Bienvenido, Personal de Recepción').should('be.visible');
    
    // Verificar widgets del dashboard
    cy.contains('Registrar Visitante').should('be.visible');
    cy.contains('Registrar Correspondencia').should('be.visible');
    cy.contains('Registrar Incidente').should('be.visible');
    cy.contains('Visitantes Activos').should('be.visible');
  });

  it('Debería permitir registrar un visitante', () => {
    // Hacer clic en Registrar Visitante
    cy.contains('Registrar Visitante').click();
    
    // Verificar que estamos en la página de registro de visitantes
    cy.url().should('include', '/reception/visitors/new');
    
    // Completar el formulario
    cy.get('input[name="visitorName"]').type('Juan Pérez');
    cy.get('input[name="visitorDocument"]').type('1234567890');
    cy.get('select[name="visitType"]').select('SOCIAL');
    cy.get('select[name="propertyId"]').select(1); // Seleccionar la primera propiedad
    cy.get('textarea[name="observations"]').type('Visita social programada');
    
    // Enviar el formulario
    cy.contains('Registrar').click();
    
    // Verificar confirmación
    cy.contains('Visitante registrado con éxito').should('be.visible');
    
    // Verificar que aparece en la lista de visitantes activos
    cy.contains('Visitantes Activos').click();
    cy.contains('Juan Pérez').should('be.visible');
  });

  it('Debería permitir registrar correspondencia', () => {
    // Hacer clic en Registrar Correspondencia
    cy.contains('Registrar Correspondencia').click();
    
    // Verificar que estamos en la página de registro de correspondencia
    cy.url().should('include', '/reception/mail/new');
    
    // Completar el formulario
    cy.get('select[name="propertyId"]').select(1); // Seleccionar la primera propiedad
    cy.get('select[name="mailType"]').select('PACKAGE');
    cy.get('input[name="sender"]').type('Amazonas Express');
    cy.get('textarea[name="description"]').type('Paquete mediano, caja marrón');
    
    // Enviar el formulario
    cy.contains('Registrar').click();
    
    // Verificar confirmación
    cy.contains('Correspondencia registrada con éxito').should('be.visible');
    
    // Verificar que aparece en la lista de correspondencia
    cy.contains('Correspondencia Pendiente').click();
    cy.contains('Amazonas Express').should('be.visible');
    cy.contains('PACKAGE').should('be.visible');
  });

  it('Debería permitir entregar correspondencia', () => {
    // Ir a la lista de correspondencia pendiente
    cy.contains('Correspondencia Pendiente').click();
    
    // Verificar que estamos en la página de correspondencia pendiente
    cy.url().should('include', '/reception/mail/pending');
    
    // Entregar la primera correspondencia
    cy.contains('Entregar').first().click();
    
    // Completar formulario de entrega
    cy.get('input[name="recipientName"]').type('Propietario del inmueble');
    cy.get('input[name="recipientDocument"]').type('1098765432');
    cy.contains('Confirmar Entrega').click();
    
    // Verificar confirmación
    cy.contains('Entrega registrada con éxito').should('be.visible');
    
    // Verificar que ya no aparece en la lista de pendientes
    cy.reload();
    cy.contains('Propietario del inmueble').should('not.exist');
  });

  it('Debería permitir registrar la salida de un visitante', () => {
    // Ir a la lista de visitantes activos
    cy.contains('Visitantes Activos').click();
    
    // Verificar que estamos en la página de visitantes activos
    cy.url().should('include', '/reception/visitors/active');
    
    // Registrar salida del primer visitante
    cy.contains('Registrar Salida').first().click();
    
    // Confirmar salida
    cy.contains('Confirmar Salida').click();
    
    // Verificar confirmación
    cy.contains('Salida registrada con éxito').should('be.visible');
    
    // Verificar que ya no aparece en la lista de activos
    cy.reload();
    cy.get('table tbody tr').should('have.length.lessThan', 2);
  });

  it('Debería permitir registrar un incidente de seguridad', () => {
    // Hacer clic en Registrar Incidente
    cy.contains('Registrar Incidente').click();
    
    // Verificar que estamos en la página de registro de incidentes
    cy.url().should('include', '/reception/incidents/new');
    
    // Completar el formulario
    cy.get('select[name="incidentType"]').select('SECURITY');
    cy.get('input[name="incidentTitle"]').type('Intento de acceso no autorizado');
    cy.get('textarea[name="incidentDescription"]').type('Persona desconocida intentó acceder sin autorización');
    cy.get('select[name="incidentSeverity"]').select('MEDIUM');
    cy.get('select[name="relatedAreaId"]').select(1); // Seleccionar la primera área
    
    // Enviar el formulario
    cy.contains('Registrar Incidente').click();
    
    // Verificar confirmación
    cy.contains('Incidente registrado con éxito').should('be.visible');
    
    // Verificar que aparece en la lista de incidentes
    cy.contains('Historial de Incidentes').click();
    cy.contains('Intento de acceso no autorizado').should('be.visible');
    cy.contains('SECURITY').should('be.visible');
    cy.contains('MEDIUM').should('be.visible');
  });

  it('Debería permitir gestionar la citofonía virtual', () => {
    // Hacer clic en Citofonía
    cy.contains('Citofonía').click();
    
    // Verificar que estamos en la página de citofonía
    cy.url().should('include', '/reception/intercom');
    
    // Verificar elementos de la página de citofonía
    cy.contains('Citofonía Virtual').should('be.visible');
    
    // Verificar que se puede buscar una propiedad
    cy.get('input[name="searchProperty"]').type('Casa 1');
    cy.contains('Llamar').should('be.visible');
    
    // Simular una llamada (este paso podría variar según la implementación)
    cy.contains('Llamar').click();
    
    // Verificar estado de la llamada
    cy.contains('Llamando...').should('be.visible');
    
    // Finalizar llamada
    cy.contains('Finalizar').click();
  });

  it('Debería mostrar el registro diario de eventos', () => {
    // Hacer clic en Minuta
    cy.contains('Minuta').click();
    
    // Verificar que estamos en la página de minuta
    cy.url().should('include', '/reception/daily-log');
    
    // Verificar elementos de la página de minuta
    cy.contains('Minuta Diaria').should('be.visible');
    cy.contains('Registro de Eventos').should('be.visible');
    
    // Agregar una nueva entrada a la minuta
    cy.contains('Nueva Entrada').click();
    cy.get('textarea[name="logEntry"]').type('Cambio de turno realizado sin novedades a las 15:00 horas');
    cy.contains('Guardar').click();
    
    // Verificar confirmación
    cy.contains('Entrada registrada con éxito').should('be.visible');
    
    // Verificar que la entrada aparece en la lista
    cy.contains('Cambio de turno realizado').should('be.visible');
  });

  it('Debería permitir consultar el directorio de residentes', () => {
    // Hacer clic en Directorio
    cy.contains('Directorio').click();
    
    // Verificar que estamos en la página de directorio
    cy.url().should('include', '/reception/directory');
    
    // Verificar elementos de la página de directorio
    cy.contains('Directorio de Residentes').should('be.visible');
    cy.get('table').should('be.visible');
    
    // Buscar un residente
    cy.get('input[name="searchResident"]').type('Casa 1');
    
    // Verificar resultados de búsqueda
    cy.get('table tbody tr').should('have.length.at.least', 1);
  });

  it('Debería permitir generar reportes', () => {
    // Hacer clic en Reportes
    cy.contains('Reportes').click();
    
    // Verificar que estamos en la página de reportes
    cy.url().should('include', '/reception/reports');
    
    // Verificar elementos de la página de reportes
    cy.contains('Reportes de Recepción').should('be.visible');
    
    // Seleccionar un tipo de reporte
    cy.get('select[name="reportType"]').select('VISITORS');
    
    // Establecer fechas
    cy.get('input[name="startDate"]').type('2025-04-01');
    cy.get('input[name="endDate"]').type('2025-04-09');
    
    // Generar reporte
    cy.contains('Generar Reporte').click();
    
    // Verificar que se genera el reporte
    cy.contains('Reporte de Visitantes').should('be.visible');
    cy.contains('Exportar a PDF').should('be.visible');
    cy.contains('Exportar a Excel').should('be.visible');
  });
});
