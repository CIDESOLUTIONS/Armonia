
// Prueba para el Panel de Recepción y Vigilancia
describe('Panel de Recepción y Vigilancia', () => {
  beforeEach(() => {
    // Login como usuario de recepción antes de cada prueba
    cy.visit('/login');
    cy.get('input[placeholder="Tu correo electrónico"]').type('recepcion@example.com');
    cy.get('input[placeholder="Tu contraseña"]').type('password');
    cy.contains('Iniciar Sesión').click();
  });

  it('Debería mostrar el dashboard de recepción', () => {
    // Verificar que estamos en el dashboard de recepción
    cy.url().should('include', '/dashboard/reception');
    
    // Verificar elementos clave del dashboard
    cy.contains('Panel de Recepción').should('exist');
    cy.contains('Visitantes Actuales').should('exist');
    cy.contains('Correspondencia Pendiente').should('exist');
    cy.contains('Novedades Recientes').should('exist');
  });

  it('Debería permitir registrar un nuevo visitante', () => {
    // Navegar a la sección de visitantes
    cy.contains('Visitantes').click();
    
    // Verificar que estamos en la sección de visitantes
    cy.url().should('include', '/visitors');
    
    // Hacer clic en botón para registrar nuevo visitante
    cy.contains('Registrar Visitante').click();
    
    // Verificar que se abre el formulario de registro
    cy.contains('Nuevo Visitante').should('exist');
    
    // Completar el formulario
    cy.get('input[name="visitorName"]').type('Carlos Ramírez');
    cy.get('input[name="visitorId"]').type('1098765432');
    cy.get('select[name="propertyId"]').select(1);
    cy.get('select[name="visitType"]').select('Social');
    cy.get('textarea[name="visitPurpose"]').type('Visita a familiar');
    
    // Registrar el visitante
    cy.contains('Registrar').click();
    
    // Verificar mensaje de éxito
    cy.contains('Visitante registrado correctamente').should('exist');
    
    // Verificar que el visitante aparece en la lista
    cy.contains('Carlos Ramírez').should('exist');
  });

  it('Debería permitir registrar la salida de un visitante', () => {
    // Navegar a la sección de visitantes
    cy.contains('Visitantes').click();
    
    // Hacer clic en el botón de salida del primer visitante activo
    cy.get('table tbody tr').first().find('button[aria-label="Registrar salida"]').click();
    
    // Verificar que se abre el diálogo de confirmación
    cy.contains('Confirmar Salida').should('exist');
    
    // Confirmar la salida
    cy.contains('Confirmar').click();
    
    // Verificar mensaje de éxito
    cy.contains('Salida registrada correctamente').should('exist');
    
    // Verificar que el estado del visitante ha cambiado a "Salida"
    cy.contains('Salida registrada').should('exist');
  });

  it('Debería permitir gestionar la correspondencia', () => {
    // Navegar a la sección de correspondencia
    cy.contains('Correspondencia').click();
    
    // Verificar que estamos en la sección de correspondencia
    cy.url().should('include', '/mail');
    
    // Hacer clic en botón para registrar nueva correspondencia
    cy.contains('Registrar Correspondencia').click();
    
    // Verificar que se abre el formulario de registro
    cy.contains('Nueva Correspondencia').should('exist');
    
    // Completar el formulario
    cy.get('select[name="propertyId"]').select(1);
    cy.get('select[name="mailType"]').select('Paquete');
    cy.get('input[name="senderName"]').type('Amazon');
    cy.get('input[name="trackingNumber"]').type('AMZ123456789');
    cy.get('textarea[name="observations"]').type('Paquete mediano');
    
    // Registrar la correspondencia
    cy.contains('Registrar').click();
    
    // Verificar mensaje de éxito
    cy.contains('Correspondencia registrada correctamente').should('exist');
    
    // Verificar que la correspondencia aparece en la lista
    cy.contains('AMZ123456789').should('exist');
  });

  it('Debería permitir entregar correspondencia', () => {
    // Navegar a la sección de correspondencia
    cy.contains('Correspondencia').click();
    
    // Hacer clic en el botón de entrega de la primera correspondencia pendiente
    cy.get('table tbody tr').first().find('button[aria-label="Registrar entrega"]').click();
    
    // Verificar que se abre el diálogo de confirmación
    cy.contains('Confirmar Entrega').should('exist');
    
    // Ingresar nombre de quien recibe
    cy.get('input[name="receiverName"]').type('Juan Pérez');
    
    // Confirmar la entrega
    cy.contains('Confirmar').click();
    
    // Verificar mensaje de éxito
    cy.contains('Entrega registrada correctamente').should('exist');
    
    // Verificar que el estado de la correspondencia ha cambiado a "Entregado"
    cy.contains('Entregado').should('exist');
  });

  it('Debería permitir registrar incidentes de seguridad', () => {
    // Navegar a la sección de seguridad
    cy.contains('Seguridad').click();
    
    // Verificar que estamos en la sección de seguridad
    cy.url().should('include', '/security');
    
    // Hacer clic en botón para registrar nuevo incidente
    cy.contains('Registrar Incidente').click();
    
    // Verificar que se abre el formulario de registro
    cy.contains('Nuevo Incidente').should('exist');
    
    // Completar el formulario
    cy.get('select[name="incidentType"]').select('Mantenimiento');
    cy.get('input[name="location"]').type('Parqueadero Nivel 2');
    cy.get('textarea[name="description"]').type('Fuga de agua en techo');
    cy.get('select[name="severity"]').select('Media');
    
    // Registrar el incidente
    cy.contains('Registrar').click();
    
    // Verificar mensaje de éxito
    cy.contains('Incidente registrado correctamente').should('exist');
    
    // Verificar que el incidente aparece en la lista
    cy.contains('Fuga de agua').should('exist');
  });

  it('Debería permitir registrar la minuta diaria', () => {
    // Navegar a la sección de minuta
    cy.contains('Minuta').click();
    
    // Verificar que estamos en la sección de minuta
    cy.url().should('include', '/logbook');
    
    // Hacer clic en botón para agregar nueva entrada
    cy.contains('Nueva Entrada').click();
    
    // Verificar que se abre el formulario de registro
    cy.contains('Registro de Minuta').should('exist');
    
    // Completar el formulario
    cy.get('select[name="entryType"]').select('Novedad');
    cy.get('textarea[name="description"]').type('Se realizó ronda de seguridad sin novedades.');
    
    // Registrar la entrada
    cy.contains('Registrar').click();
    
    // Verificar mensaje de éxito
    cy.contains('Entrada registrada correctamente').should('exist');
    
    // Verificar que la entrada aparece en la lista
    cy.contains('Se realizó ronda de seguridad').should('exist');
  });

  it('Debería permitir usar la citofonía virtual', () => {
    // Navegar a la sección de citofonía
    cy.contains('Citofonía').click();
    
    // Verificar que estamos en la sección de citofonía
    cy.url().should('include', '/intercom');
    
    // Verificar que muestra la interfaz de citofonía
    cy.contains('Citofonía Virtual').should('exist');
    
    // Seleccionar una propiedad para llamar
    cy.get('select[name="propertyId"]').select(1);
    
    // Iniciar llamada (puede ser solo una simulación en pruebas)
    cy.contains('Llamar').click();
    
    // Verificar que se inicia la llamada
    cy.contains('Llamando...').should('exist');
    
    // Finalizar llamada
    cy.contains('Finalizar').click();
    
    // Verificar que la llamada finaliza
    cy.contains('Llamada finalizada').should('exist');
  });

  it('Debería permitir ver el directorio de residentes', () => {
    // Navegar a la sección de directorio
    cy.contains('Directorio').click();
    
    // Verificar que estamos en la sección de directorio
    cy.url().should('include', '/directory');
    
    // Verificar que muestra el directorio de residentes
    cy.contains('Directorio de Residentes').should('exist');
    
    // Verificar que existe la tabla o lista de residentes
    cy.get('table, .resident-list').should('exist');
    
    // Buscar un residente
    cy.get('input[placeholder="Buscar residente..."]').type('María');
    
    // Verificar que se filtra la lista
    cy.contains('Filtrando resultados').should('exist');
    
    // Ver detalles de un residente
    cy.get('table tbody tr').first().find('button[aria-label="Ver detalles"]').click();
    
    // Verificar que muestra los detalles del residente
    cy.contains('Información del Residente').should('exist');
    
    // Cerrar los detalles
    cy.contains('Cerrar').click();
  });

  it('Debería permitir controlar el acceso a zonas restringidas', () => {
    // Navegar a la sección de acceso
    cy.contains('Control de Acceso').click();
    
    // Verificar que estamos en la sección de control de acceso
    cy.url().should('include', '/access-control');
    
    // Verificar que muestra las zonas restringidas
    cy.contains('Zonas Restringidas').should('exist');
    
    // Registrar un acceso
    cy.contains('Registrar Acceso').click();
    
    // Verificar que se abre el formulario de registro
    cy.contains('Nuevo Acceso').should('exist');
    
    // Completar el formulario
    cy.get('select[name="zoneId"]').select(1);
    cy.get('select[name="personType"]').select('Residente');
    cy.get('select[name="personId"]').select(1);
    cy.get('select[name="accessType"]').select('Entrada');
    
    // Registrar el acceso
    cy.contains('Registrar').click();
    
    // Verificar mensaje de éxito
    cy.contains('Acceso registrado correctamente').should('exist');
  });

  it('Debería permitir generar reportes de vigilancia', () => {
    // Navegar a la sección de reportes
    cy.contains('Reportes').click();
    
    // Verificar que estamos en la sección de reportes
    cy.url().should('include', '/reports');
    
    // Verificar que muestra los tipos de reportes disponibles
    cy.contains('Reportes de Vigilancia').should('exist');
    
    // Seleccionar un tipo de reporte
    cy.get('select[name="reportType"]').select('Visitantes');
    
    // Seleccionar fechas
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const formattedStartDate = yesterday.toISOString().split('T')[0];
    const formattedEndDate = today.toISOString().split('T')[0];
    
    cy.get('input[name="startDate"]').type(formattedStartDate);
    cy.get('input[name="endDate"]').type(formattedEndDate);
    
    // Generar el reporte
    cy.contains('Generar Reporte').click();
    
    // Verificar que se genera el reporte
    cy.contains('Reporte Generado').should('exist');
    
    // Verificar que hay un botón para descargar el reporte
    cy.contains('Descargar PDF').should('exist');
  });
});
