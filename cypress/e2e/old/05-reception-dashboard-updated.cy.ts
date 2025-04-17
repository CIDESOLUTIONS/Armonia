// Prueba actualizada para el panel de recepción y vigilancia
describe('Panel de Recepción y Vigilancia', () => {
  beforeEach(() => {
    // Usar el comando personalizado para iniciar sesión como personal de recepción
    cy.login('reception');
  });

  it('Debería mostrar el dashboard de recepción con información relevante', () => {
    // Verificar elementos clave del dashboard
    cy.contains('Dashboard de Recepción').should('exist');
    cy.contains('Resumen de Actividad').should('exist');
    
    // Verificar que existen las tarjetas de resumen
    cy.get('[data-cy="summary-card"]').should('have.length.at.least', 3);
  });

  it('Debería permitir registrar visitantes', () => {
    // Navegar a la sección de visitantes
    cy.contains('Visitantes').click();
    
    // Verificar elementos clave de la sección
    cy.contains('Registro de Visitantes').should('exist');
    cy.contains('Visitantes Actuales').should('exist');
    
    // Registrar un nuevo visitante
    cy.contains('Nuevo Visitante').click();
    
    // Completar el formulario
    const timestamp = Date.now();
    const visitorName = `Visitante Test ${timestamp}`;
    
    cy.get('input[name="visitorName"]').type(visitorName);
    cy.get('input[name="identification"]').type(`ID-${timestamp}`);
    cy.get('select[name="destination"]').select(1); // Seleccionar primera propiedad
    cy.get('input[name="reason"]').type('Visita social');
    
    // Subir foto (si es necesario, simulamos con un archivo placeholder)
    // cy.get('input[type="file"]').attachFile('visitor-photo.jpg');
    
    // Enviar formulario
    cy.contains('Registrar Entrada').click();
    
    // Verificar mensaje de éxito
    cy.contains('Visitante registrado correctamente').should('exist');
    
    // Verificar que aparece en la lista de visitantes actuales
    cy.contains(visitorName).should('exist');
  });

  it('Debería permitir registrar la salida de visitantes', () => {
    // Navegar a la sección de visitantes
    cy.contains('Visitantes').click();
    
    // Verificar que existe al menos un visitante
    cy.get('table tbody tr').should('have.length.at.least', 1);
    
    // Registrar salida del primer visitante
    cy.get('table tbody tr').first().contains('Registrar Salida').click();
    
    // Confirmar salida
    cy.contains('Confirmar Salida').click();
    
    // Verificar mensaje de éxito
    cy.contains('Salida registrada correctamente').should('exist');
  });

  it('Debería permitir gestionar correspondencia', () => {
    // Navegar a la sección de correspondencia
    cy.contains('Correspondencia').click();
    
    // Verificar elementos clave de la sección
    cy.contains('Gestión de Correspondencia').should('exist');
    cy.contains('Correspondencia Pendiente').should('exist');
    
    // Registrar nueva correspondencia
    cy.contains('Nueva Correspondencia').click();
    
    // Completar el formulario
    const timestamp = Date.now();
    const packageDesc = `Paquete Test ${timestamp}`;
    
    cy.get('select[name="type"]').select('Paquete');
    cy.get('select[name="destination"]').select(1); // Seleccionar primera propiedad
    cy.get('input[name="sender"]').type('Amazon');
    cy.get('textarea[name="description"]').type(packageDesc);
    
    // Enviar formulario
    cy.contains('Registrar Correspondencia').click();
    
    // Verificar mensaje de éxito
    cy.contains('Correspondencia registrada correctamente').should('exist');
    
    // Verificar que aparece en la lista de correspondencia pendiente
    cy.contains(packageDesc).should('exist');
  });

  it('Debería permitir registrar la entrega de correspondencia', () => {
    // Navegar a la sección de correspondencia
    cy.contains('Correspondencia').click();
    
    // Verificar que existe al menos un item de correspondencia
    cy.get('table tbody tr').should('have.length.at.least', 1);
    
    // Registrar entrega del primer item
    cy.get('table tbody tr').first().contains('Registrar Entrega').click();
    
    // Completar el formulario de entrega
    cy.get('input[name="receiverName"]').type('Residente Receptor');
    cy.get('input[name="receiverId"]').type('ID-123456');
    
    // Confirmar entrega
    cy.contains('Confirmar Entrega').click();
    
    // Verificar mensaje de éxito
    cy.contains('Entrega registrada correctamente').should('exist');
  });

  it('Debería permitir registrar incidentes de seguridad', () => {
    // Navegar a la sección de seguridad
    cy.contains('Seguridad').click();
    
    // Verificar elementos clave de la sección
    cy.contains('Registro de Incidentes').should('exist');
    cy.contains('Histórico de Incidentes').should('exist');
    
    // Registrar nuevo incidente
    cy.contains('Nuevo Incidente').click();
    
    // Completar el formulario
    const timestamp = Date.now();
    const incidentDesc = `Incidente Test ${timestamp}`;
    
    cy.get('select[name="type"]').select('Seguridad');
    cy.get('input[name="location"]').type('Zona de parqueadero');
    cy.get('textarea[name="description"]').type(incidentDesc);
    cy.get('select[name="severity"]').select('Bajo');
    
    // Enviar formulario
    cy.contains('Registrar Incidente').click();
    
    // Verificar mensaje de éxito
    cy.contains('Incidente registrado correctamente').should('exist');
    
    // Verificar que aparece en el histórico de incidentes
    cy.contains(incidentDesc).should('exist');
  });

  it('Debería permitir acceder a la minuta diaria', () => {
    // Navegar a la sección de minuta
    cy.contains('Minuta').click();
    
    // Verificar elementos clave de la sección
    cy.contains('Minuta Diaria').should('exist');
    cy.contains('Histórico de Novedades').should('exist');
    
    // Agregar entrada a la minuta
    cy.contains('Nueva Entrada').click();
    
    // Completar el formulario
    const timestamp = Date.now();
    const minuteEntry = `Entrada Test ${timestamp}`;
    
    cy.get('textarea[name="description"]').type(minuteEntry);
    
    // Enviar formulario
    cy.contains('Guardar Entrada').click();
    
    // Verificar mensaje de éxito
    cy.contains('Entrada guardada correctamente').should('exist');
    
    // Verificar que aparece en la minuta
    cy.contains(minuteEntry).should('exist');
  });

  it('Debería permitir acceder al directorio de residentes', () => {
    // Navegar a la sección de directorio
    cy.contains('Directorio').click();
    
    // Verificar elementos clave de la sección
    cy.contains('Directorio de Residentes').should('exist');
    cy.contains('Buscar').should('exist');
    
    // Verificar que muestra la tabla de residentes
    cy.get('table').should('exist');
    cy.get('table tbody tr').should('have.length.at.least', 1);
    
    // Búsqueda
    cy.get('input[placeholder="Buscar residente..."]').type('Pérez');
    cy.contains('Buscar').click();
    
    // Verificar resultados de búsqueda
    cy.contains('Resultados de búsqueda').should('exist');
  });

  // Verificar que podemos cerrar la sesión correctamente
  it('Debería permitir cerrar sesión', () => {
    // Hacer clic en el menú de usuario
    cy.get('[data-cy="user-menu"]').click();
    
    // Hacer clic en cerrar sesión
    cy.contains('Cerrar Sesión').click();
    
    // Verificar redirección a la página de login
    cy.url().should('include', '/login');
  });
});