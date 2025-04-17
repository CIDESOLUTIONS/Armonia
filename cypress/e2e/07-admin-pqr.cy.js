// Pruebas para el Módulo de PQR del Administrador
describe('Módulo de PQR', () => {
  beforeEach(() => {
    // Login como administrador antes de cada prueba
    cy.visit('/login');
    cy.get('input[name="email"]').type(Cypress.env('adminEmail'));
    cy.get('input[name="password"]').type(Cypress.env('adminPassword'));
    cy.contains('Iniciar Sesión').click();
    
    // Navegar al módulo de PQR
    cy.get('[data-testid="sidebar"]').contains('PQR').click();
    
    // Esperar a que cargue la página de PQR
    cy.url().should('include', '/dashboard/pqr');
    cy.contains('Peticiones, Quejas y Reclamos', { timeout: 10000 }).should('be.visible');
  });

  it('Debería mostrar la lista de PQR', () => {
    // Verificar tabla o listado
    cy.get('[data-testid="pqr-table"]').should('be.visible');
    
    // Verificar que existan registros
    cy.get('[data-testid="pqr-table"] tbody tr').should('have.length.at.least', 1);
  });

  it('Debería permitir filtrar PQR por estado', () => {
    // Seleccionar filtro de estado "Pendiente"
    cy.get('select[name="statusFilter"]').select('Pendiente');
    
    // Verificar que se aplique el filtro
    cy.get('[data-testid="pqr-table"] tbody tr').each($row => {
      cy.wrap($row).contains('Pendiente').should('be.visible');
    });
    
    // Cambiar filtro a "En Proceso"
    cy.get('select[name="statusFilter"]').select('En Proceso');
    
    // Verificar que se aplique el nuevo filtro
    cy.get('[data-testid="pqr-table"] tbody tr').each($row => {
      cy.wrap($row).contains('En Proceso').should('be.visible');
    });
  });

  it('Debería permitir filtrar PQR por tipo', () => {
    // Seleccionar filtro de tipo "Petición"
    cy.get('select[name="typeFilter"]').select('Petición');
    
    // Verificar que se aplique el filtro
    cy.get('[data-testid="pqr-table"] tbody tr').each($row => {
      cy.wrap($row).contains('Petición').should('be.visible');
    });
    
    // Cambiar filtro a "Queja"
    cy.get('select[name="typeFilter"]').select('Queja');
    
    // Verificar que se aplique el nuevo filtro
    cy.get('[data-testid="pqr-table"] tbody tr').each($row => {
      cy.wrap($row).contains('Queja').should('be.visible');
    });
  });

  it('Debería permitir ver los detalles de un PQR', () => {
    // Guardar el asunto del primer PQR
    cy.get('[data-testid="pqr-table"] tbody tr').first().find('td').eq(1).invoke('text').as('firstPqrSubject');
    
    // Clic en el botón de ver detalles del primer PQR
    cy.get('[data-testid="pqr-table"] tbody tr').first().find('[data-testid="view-pqr-button"]').click();
    
    // Verificar que se muestren los detalles
    cy.get('[data-testid="pqr-details"]').should('be.visible');
    
    // Verificar que el asunto coincida
    cy.get('@firstPqrSubject').then(subject => {
      cy.get('[data-testid="pqr-details"]').contains(subject).should('be.visible');
    });
    
    // Verificar secciones de detalles
    cy.contains('Información Básica').should('be.visible');
    cy.contains('Historial de Comunicaciones').should('be.visible');
    cy.contains('Estado y Seguimiento').should('be.visible');
  });

  it('Debería permitir cambiar el estado de un PQR', () => {
    // Clic en el botón de ver detalles del primer PQR
    cy.get('[data-testid="pqr-table"] tbody tr').first().find('[data-testid="view-pqr-button"]').click();
    
    // Verificar que se muestren los detalles
    cy.get('[data-testid="pqr-details"]').should('be.visible');
    
    // Cambiar estado
    cy.get('select[name="status"]').select('En Proceso');
    
    // Agregar comentario de seguimiento
    cy.get('textarea[name="statusComment"]').type('Se está revisando la solicitud');
    
    // Guardar cambios
    cy.contains('Actualizar Estado').click();
    
    // Verificar mensaje de éxito
    cy.contains('Estado actualizado correctamente').should('be.visible');
    
    // Verificar que el nuevo estado se refleje
    cy.contains('Estado actual: En Proceso').should('be.visible');
  });

  it('Debería permitir asignar un responsable a un PQR', () => {
    // Clic en el botón de ver detalles del primer PQR
    cy.get('[data-testid="pqr-table"] tbody tr').first().find('[data-testid="view-pqr-button"]').click();
    
    // Verificar que se muestren los detalles
    cy.get('[data-testid="pqr-details"]').should('be.visible');
    
    // Asignar responsable
    cy.get('select[name="assignedTo"]').select('Admin');
    
    // Guardar cambios
    cy.contains('Asignar Responsable').click();
    
    // Verificar mensaje de éxito
    cy.contains('Responsable asignado correctamente').should('be.visible');
    
    // Verificar que el responsable se refleje
    cy.contains('Responsable: Admin').should('be.visible');
  });

  it('Debería permitir responder a un PQR', () => {
    // Clic en el botón de ver detalles del primer PQR
    cy.get('[data-testid="pqr-table"] tbody tr').first().find('[data-testid="view-pqr-button"]').click();
    
    // Verificar que se muestren los detalles
    cy.get('[data-testid="pqr-details"]').should('be.visible');
    
    // Escribir respuesta
    cy.get('textarea[name="responseText"]').type('Hemos recibido su solicitud y estamos trabajando en ella. Le informaremos cuando tengamos una solución.');
    
    // Enviar respuesta
    cy.contains('Enviar Respuesta').click();
    
    // Verificar mensaje de éxito
    cy.contains('Respuesta enviada correctamente').should('be.visible');
    
    // Verificar que la respuesta aparezca en el historial
    cy.get('[data-testid="communications-history"]').contains('Hemos recibido su solicitud').should('be.visible');
  });

  it('Debería permitir cerrar un PQR', () => {
    // Clic en el botón de ver detalles del primer PQR
    cy.get('[data-testid="pqr-table"] tbody tr').first().find('[data-testid="view-pqr-button"]').click();
    
    // Verificar que se muestren los detalles
    cy.get('[data-testid="pqr-details"]').should('be.visible');
    
    // Cambiar estado a Resuelto
    cy.get('select[name="status"]').select('Resuelto');
    
    // Agregar comentario de resolución
    cy.get('textarea[name="statusComment"]').type('Se ha resuelto la solicitud satisfactoriamente');
    
    // Guardar cambios
    cy.contains('Actualizar Estado').click();
    
    // Verificar mensaje de éxito
    cy.contains('Estado actualizado correctamente').should('be.visible');
    
    // Cerrar el PQR
    cy.contains('Cerrar PQR').click();
    
    // Confirmar cierre
    cy.get('[data-testid="close-pqr-modal"]').within(() => {
      cy.get('textarea[name="closingComments"]').type('PQR atendido y resuelto');
      cy.contains('Confirmar Cierre').click();
    });
    
    // Verificar mensaje de éxito
    cy.contains('PQR cerrado correctamente').should('be.visible');
    
    // Verificar que el estado sea Cerrado
    cy.contains('Estado actual: Cerrado').should('be.visible');
  });

  it('Debería mostrar estadísticas y métricas de PQR', () => {
    // Clic en la pestaña de estadísticas
    cy.contains('Estadísticas').click();
    
    // Verificar que se muestren las estadísticas
    cy.get('[data-testid="pqr-stats"]').should('be.visible');
    
    // Verificar elementos de estadísticas
    cy.contains('PQR por Estado').should('be.visible');
    cy.contains('PQR por Tipo').should('be.visible');
    cy.contains('Tiempo Promedio de Resolución').should('be.visible');
    cy.contains('Satisfacción del Usuario').should('be.visible');
    
    // Verificar gráficos
    cy.get('[data-testid="pqr-stats-chart"]').should('have.length.at.least', 1);
  });

  it('Debería permitir exportar listado de PQR', () => {
    // Clic en botón de exportar
    cy.contains('Exportar').click();
    
    // Verificar opciones de exportación
    cy.get('[data-testid="export-modal"]').should('be.visible');
    
    // Seleccionar formato
    cy.get('select[name="exportFormat"]').select('Excel');
    
    // Seleccionar filtros
    cy.get('input[name="includeAll"]').check();
    
    // Exportar
    cy.contains('Exportar Reporte').click();
    
    // Verificar mensaje de éxito
    cy.contains('Reporte exportado correctamente').should('be.visible');
  });
});
