// Pruebas para el Módulo de Asambleas del Administrador
describe('Módulo de Asambleas', () => {
  beforeEach(() => {
    // Login como administrador antes de cada prueba
    cy.visit('/login');
    cy.get('input[name="email"]').type(Cypress.env('adminEmail'));
    cy.get('input[name="password"]').type(Cypress.env('adminPassword'));
    cy.contains('Iniciar Sesión').click();
    
    // Navegar al módulo de asambleas
    cy.get('[data-testid="sidebar"]').contains('Asambleas').click();
    
    // Esperar a que cargue la página de asambleas
    cy.url().should('include', '/dashboard/assemblies');
    cy.contains('Gestión de Asambleas', { timeout: 10000 }).should('be.visible');
  });

  it('Debería mostrar las opciones principales del módulo de asambleas', () => {
    // Verificar pestañas o secciones
    cy.contains('Programación').should('be.visible');
    cy.contains('Asistencia').should('be.visible');
    cy.contains('Votaciones').should('be.visible');
    cy.contains('Documentos').should('be.visible');
  });

  describe('Programación de Asambleas', () => {
    beforeEach(() => {
      // Asegurar que estamos en la pestaña de programación
      cy.contains('Programación').click();
    });

    it('Debería mostrar la lista de asambleas programadas', () => {
      // Verificar tabla o listado
      cy.get('[data-testid="assemblies-table"]').should('be.visible');
      
      // Verificar que existan registros
      cy.get('[data-testid="assemblies-table"] tbody tr').should('have.length.at.least', 1);
    });

    it('Debería permitir programar una nueva asamblea', () => {
      // Clic en botón de agregar
      cy.contains('Programar Asamblea').click();
      
      // Verificar formulario
      cy.get('[data-testid="assembly-form"]').should('be.visible');
      
      // Llenar formulario
      cy.get('input[name="title"]').type('Asamblea Extraordinaria');
      cy.get('select[name="type"]').select('Extraordinaria');
      
      // Fecha y hora (usando un selector de fecha moderno)
      cy.get('input[name="date"]').type('2025-05-01');
      cy.get('input[name="time"]').type('14:00');
      
      cy.get('textarea[name="description"]').type('Discusión sobre proyecto de mejoras en áreas comunes');
      
      // Seleccionar modalidad
      cy.get('select[name="modality"]').select('Virtual');
      cy.get('input[name="meetingLink"]').type('https://meet.google.com/abc-defg-hij');
      
      // Enviar formulario
      cy.contains('Guardar').click();
      
      // Verificar mensaje de éxito
      cy.contains('Asamblea programada correctamente').should('be.visible');
      
      // Verificar que aparezca en la lista
      cy.contains('Asamblea Extraordinaria').should('be.visible');
    });

    it('Debería permitir editar una asamblea existente', () => {
      // Clic en botón de editar de la primera asamblea
      cy.get('[data-testid="edit-assembly-button"]').first().click();
      
      // Verificar formulario con datos cargados
      cy.get('[data-testid="assembly-form"]').should('be.visible');
      
      // Modificar datos
      cy.get('textarea[name="description"]').clear().type('Descripción actualizada para la asamblea');
      
      // Enviar formulario
      cy.contains('Actualizar').click();
      
      // Verificar mensaje de éxito
      cy.contains('Asamblea actualizada correctamente').should('be.visible');
    });

    it('Debería permitir cancelar una asamblea', () => {
      // Obtener el título de la última asamblea para verificar después
      cy.get('[data-testid="assemblies-table"] tbody tr').last().find('td').first().invoke('text').as('lastAssemblyTitle');
      
      // Clic en botón de cancelar de la última asamblea
      cy.get('[data-testid="cancel-assembly-button"]').last().click();
      
      // Confirmar cancelación
      cy.contains('Confirmar').click();
      
      // Verificar mensaje de éxito
      cy.contains('Asamblea cancelada correctamente').should('be.visible');
      
      // Verificar que aparezca como cancelada en la lista
      cy.get('@lastAssemblyTitle').then(assemblyTitle => {
        cy.contains(assemblyTitle).parent('tr').contains('Cancelada').should('be.visible');
      });
    });

    it('Debería permitir enviar notificaciones a los residentes', () => {
      // Seleccionar la primera asamblea
      cy.get('[data-testid="assemblies-table"] tbody tr').first().find('[data-testid="send-notification-button"]').click();
      
      // Verificar modal
      cy.get('[data-testid="notification-modal"]').should('be.visible');
      
      // Verificar opciones
      cy.contains('Enviar por correo electrónico').should('be.visible');
      
      // Enviar notificación
      cy.contains('Enviar Notificaciones').click();
      
      // Verificar mensaje de éxito
      cy.contains('Notificaciones enviadas correctamente').should('be.visible');
    });
  });

  describe('Control de Asistencia', () => {
    beforeEach(() => {
      // Asegurar que estamos en la pestaña de asistencia
      cy.contains('Asistencia').click();
    });

    it('Debería mostrar la lista de asambleas para control de asistencia', () => {
      // Verificar tabla o listado
      cy.get('[data-testid="attendance-assemblies-table"]').should('be.visible');
      
      // Verificar que existan registros
      cy.get('[data-testid="attendance-assemblies-table"] tbody tr').should('have.length.at.least', 1);
    });

    it('Debería permitir registrar asistencia a una asamblea', () => {
      // Seleccionar la primera asamblea
      cy.get('[data-testid="attendance-assemblies-table"] tbody tr').first().find('[data-testid="register-attendance-button"]').click();
      
      // Verificar la página de registro de asistencia
      cy.contains('Registro de Asistencia').should('be.visible');
      
      // Verificar la lista de propietarios/residentes
      cy.get('[data-testid="attendees-table"]').should('be.visible');
      
      // Marcar asistencia para algunos residentes
      cy.get('[data-testid="attendees-table"] tbody tr').first().find('input[type="checkbox"]').check();
      cy.get('[data-testid="attendees-table"] tbody tr').eq(2).find('input[type="checkbox"]').check();
      
      // Guardar asistencia
      cy.contains('Guardar Asistencia').click();
      
      // Verificar mensaje de éxito
      cy.contains('Asistencia registrada correctamente').should('be.visible');
    });

    it('Debería verificar el quórum de una asamblea', () => {
      // Seleccionar la primera asamblea
      cy.get('[data-testid="attendance-assemblies-table"] tbody tr').first().find('[data-testid="check-quorum-button"]').click();
      
      // Verificar modal de quórum
      cy.get('[data-testid="quorum-modal"]').should('be.visible');
      
      // Verificar información del quórum
      cy.contains('Total Propietarios').should('be.visible');
      cy.contains('Propietarios Presentes').should('be.visible');
      cy.contains('Porcentaje de Asistencia').should('be.visible');
      cy.contains('Estado del Quórum').should('be.visible');
      
      // Cerrar modal
      cy.get('[data-testid="close-quorum-modal"]').click();
    });
  });

  describe('Gestión de Votaciones', () => {
    beforeEach(() => {
      // Asegurar que estamos en la pestaña de votaciones
      cy.contains('Votaciones').click();
    });

    it('Debería mostrar la lista de votaciones', () => {
      // Verificar tabla o listado
      cy.get('[data-testid="votings-table"]').should('be.visible');
      
      // Verificar que existan registros (puede ser vacío inicialmente)
      cy.get('[data-testid="votings-table"]').should('exist');
    });

    it('Debería permitir crear una nueva votación', () => {
      // Clic en botón de agregar
      cy.contains('Nueva Votación').click();
      
      // Verificar formulario
      cy.get('[data-testid="voting-form"]').should('be.visible');
      
      // Seleccionar asamblea
      cy.get('select[name="assemblyId"]').select(1);
      
      // Llenar formulario
      cy.get('input[name="title"]').type('Aprobación de Presupuesto 2025');
      cy.get('textarea[name="description"]').type('Votación para aprobar el presupuesto del año 2025');
      
      // Agregar opciones
      cy.contains('Agregar Opción').click();
      cy.get('input[name="options[0].text"]').type('A favor');
      cy.contains('Agregar Opción').click();
      cy.get('input[name="options[1].text"]').type('En contra');
      cy.contains('Agregar Opción').click();
      cy.get('input[name="options[2].text"]').type('Abstención');
      
      // Fechas de inicio y fin
      cy.get('input[name="startDate"]').type('2025-05-01T14:00');
      cy.get('input[name="endDate"]').type('2025-05-01T16:00');
      
      // Enviar formulario
      cy.contains('Crear Votación').click();
      
      // Verificar mensaje de éxito
      cy.contains('Votación creada correctamente').should('be.visible');
      
      // Verificar que aparezca en la lista
      cy.contains('Aprobación de Presupuesto 2025').should('be.visible');
    });

    it('Debería permitir ver resultados de una votación', () => {
      // Seleccionar la primera votación
      cy.get('[data-testid="votings-table"] tbody tr').first().find('[data-testid="view-results-button"]').click();
      
      // Verificar página de resultados
      cy.contains('Resultados de Votación').should('be.visible');
      
      // Verificar elementos de resultados
      cy.get('[data-testid="voting-results-chart"]').should('be.visible');
      cy.get('[data-testid="voting-results-table"]').should('be.visible');
    });
  });

  describe('Gestión de Documentos', () => {
    beforeEach(() => {
      // Asegurar que estamos en la pestaña de documentos
      cy.contains('Documentos').click();
    });

    it('Debería mostrar la lista de documentos', () => {
      // Verificar tabla o listado
      cy.get('[data-testid="documents-table"]').should('be.visible');
    });

    it('Debería permitir subir un nuevo documento', () => {
      // Clic en botón de agregar
      cy.contains('Subir Documento').click();
      
      // Verificar formulario
      cy.get('[data-testid="document-form"]').should('be.visible');
      
      // Llenar formulario
      cy.get('input[name="title"]').type('Acta Asamblea Ordinaria 2025');
      cy.get('select[name="documentType"]').select('Acta');
      cy.get('select[name="assemblyId"]').select(1);
      
      // Simular carga de archivo
      cy.get('input[type="file"]').attachFile('document-test.pdf');
      
      // Enviar formulario
      cy.contains('Guardar').click();
      
      // Verificar mensaje de éxito
      cy.contains('Documento subido correctamente').should('be.visible');
      
      // Verificar que aparezca en la lista
      cy.contains('Acta Asamblea Ordinaria 2025').should('be.visible');
    });
  });
});
