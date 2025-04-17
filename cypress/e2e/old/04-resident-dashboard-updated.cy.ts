// Prueba actualizada para el panel de residentes
describe('Panel de Residentes', () => {
  beforeEach(() => {
    // Usar el comando personalizado para iniciar sesión como residente
    cy.login('resident');
  });

  it('Debería mostrar el dashboard del residente con información personal', () => {
    // Verificar elementos clave del dashboard
    cy.contains('Mi Dashboard').should('exist');
    cy.contains('Información Personal').should('exist');
    
    // Verificar que existen las tarjetas de información
    cy.get('[data-cy="info-card"]').should('have.length.at.least', 2);
  });

  it('Debería mostrar el estado de cuenta del residente', () => {
    // Navegar a la sección de estado de cuenta
    cy.contains('Estado de Cuenta').click();
    
    // Verificar elementos clave de la sección
    cy.contains('Resumen de Cuenta').should('exist');
    cy.contains('Histórico de Pagos').should('exist');
    cy.contains('Próximos Pagos').should('exist');
    
    // Verificar que existe la tabla de pagos
    cy.get('table').should('exist');
  });

  it('Debería permitir realizar reservas de servicios comunes', () => {
    // Navegar a la sección de reservas
    cy.contains('Reservar Servicios').click();
    
    // Verificar elementos clave de la sección
    cy.contains('Servicios Disponibles').should('exist');
    cy.contains('Mis Reservas').should('exist');
    
    // Verificar que existen los servicios para reservar
    cy.fixture('example.json').then((testData) => {
      // Buscar el primer servicio del fixture
      const primerServicio = testData.commonAreas[0].name;
      cy.contains(primerServicio).should('exist');
      
      // Intentar hacer una reserva
      cy.contains(primerServicio).parent().contains('Reservar').click();
      
      // Verificar que se abre el formulario de reserva
      cy.contains('Nueva Reserva').should('exist');
      
      // Seleccionar fecha y hora
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const formattedDate = tomorrow.toISOString().split('T')[0];
      
      cy.get('input[type="date"]').type(formattedDate);
      cy.get('select[name="startTime"]').select('10:00');
      cy.get('select[name="endTime"]').select('12:00');
      
      // Enviar formulario
      cy.contains('Confirmar Reserva').click();
      
      // Verificar mensaje de éxito
      cy.contains('Reserva realizada correctamente').should('exist');
    });
  });

  it('Debería permitir crear peticiones, quejas o reclamos', () => {
    // Navegar a la sección de PQR
    cy.contains('PQR').click();
    
    // Verificar elementos clave de la sección
    cy.contains('Mis Solicitudes').should('exist');
    cy.contains('Nueva Solicitud').should('exist');
    
    // Crear una nueva solicitud
    cy.contains('Nueva Solicitud').click();
    
    // Completar el formulario
    cy.fixture('example.json').then((testData) => {
      const pqrData = testData.pqr.petition;
      const timestamp = Date.now();
      
      cy.get('select[name="type"]').select(pqrData.type);
      cy.get('input[name="subject"]').type(pqrData.subject + ' ' + timestamp);
      cy.get('textarea[name="description"]').type(pqrData.description);
      cy.get('select[name="priority"]').select(pqrData.priority);
      
      // Enviar formulario
      cy.contains('Enviar Solicitud').click();
      
      // Verificar mensaje de éxito
      cy.contains('Solicitud enviada correctamente').should('exist');
      
      // Verificar que aparece en la lista de solicitudes
      cy.contains(pqrData.subject + ' ' + timestamp).should('exist');
    });
  });

  it('Debería mostrar las asambleas y permitir votar', () => {
    // Navegar a la sección de asambleas
    cy.contains('Asambleas').click();
    
    // Verificar elementos clave de la sección
    cy.contains('Próximas Asambleas').should('exist');
    cy.contains('Votaciones Activas').should('exist');
    
    // Verificar que se muestran las asambleas
    cy.fixture('example.json').then((testData) => {
      // Buscar la primera asamblea del fixture
      const primeraAsamblea = testData.assemblies[0].title;
      cy.contains(primeraAsamblea).should('exist');
    });
  });

  it('Debería mostrar los anuncios y comunicados', () => {
    // Navegar a la sección de comunicaciones
    cy.contains('Comunicados').click();
    
    // Verificar elementos clave de la sección
    cy.contains('Anuncios Recientes').should('exist');
    cy.contains('Eventos Programados').should('exist');
    
    // Verificar que existen anuncios
    cy.get('[data-cy="announcement-card"]').should('have.length.at.least', 1);
  });

  it('Debería permitir actualizar la información de perfil', () => {
    // Navegar a la sección de perfil
    cy.contains('Mi Perfil').click();
    
    // Verificar elementos clave de la sección
    cy.contains('Información Personal').should('exist');
    cy.contains('Cambiar Contraseña').should('exist');
    
    // Actualizar información
    cy.contains('Editar Perfil').click();
    
    // Modificar teléfono
    const nuevoTelefono = '300' + Date.now().toString().slice(-7);
    cy.get('input[name="phone"]').clear().type(nuevoTelefono);
    
    // Guardar cambios
    cy.contains('Guardar Cambios').click();
    
    // Verificar mensaje de éxito
    cy.contains('Perfil actualizado correctamente').should('exist');
    
    // Verificar que se muestra el nuevo teléfono
    cy.contains(nuevoTelefono).should('exist');
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