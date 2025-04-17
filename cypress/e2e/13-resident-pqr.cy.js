// Pruebas para el Módulo de PQR del Residente
describe('Módulo de PQR del Residente', () => {
  beforeEach(() => {
    // Login como residente antes de cada prueba
    cy.visit('/login');
    cy.get('input[name="email"]').type(Cypress.env('residentEmail'));
    cy.get('input[name="password"]').type(Cypress.env('residentPassword'));
    cy.contains('Iniciar Sesión').click();
    
    // Navegar al módulo de PQR
    cy.get('[data-testid="sidebar"]').contains('PQR').click();
    
    // Esperar a que cargue la página de PQR
    cy.url().should('include', '/resident/pqr');
    cy.contains('Peticiones, Quejas y Reclamos', { timeout: 10000 }).should('be.visible');
  });

  it('Debería mostrar las secciones principales del módulo de PQR', () => {
    // Verificar secciones
    cy.contains('Nuevo PQR').should('be.visible');
    cy.contains('Mis PQR').should('be.visible');
  });

  it('Debería mostrar el listado de mis PQR', () => {
    // Verificar tabla o listado
    cy.get('[data-testid="my-pqr-table"]').should('be.visible');
    
    // Verificar encabezados
    cy.contains('Asunto').should('be.visible');
    cy.contains('Tipo').should('be.visible');
    cy.contains('Fecha').should('be.visible');
    cy.contains('Estado').should('be.visible');
  });

  it('Debería permitir crear un nuevo PQR', () => {
    // Clic en el botón o pestaña de nuevo PQR
    cy.contains('Nuevo PQR').click();
    
    // Verificar formulario
    cy.get('[data-testid="new-pqr-form"]').should('be.visible');
    
    // Llenar formulario
    cy.get('select[name="type"]').select('Petición');
    cy.get('input[name="subject"]').type('Solicitud de mantenimiento en área común');
    cy.get('textarea[name="description"]').type('Solicito el mantenimiento de la piscina ya que he notado que el sistema de filtración no está funcionando correctamente.');
    
    // Simular carga de imagen
    cy.get('input[type="file"]').attachFile('imagen-pqr.jpg');
    
    // Enviar formulario
    cy.contains('Enviar PQR').click();
    
    // Verificar mensaje de éxito
    cy.contains('PQR creado correctamente').should('be.visible');
    
    // Verificar redirección a mis PQR
    cy.contains('Mis PQR').should('be.visible');
    
    // Verificar que el nuevo PQR aparezca en la lista
    cy.contains('Solicitud de mantenimiento en área común').should('be.visible');
  });

  it('Debería permitir ver los detalles de un PQR', () => {
    // Verificar si hay PQR en la lista
    cy.get('[data-testid="my-pqr-table"] tbody tr').then($rows => {
      if ($rows.length > 0) {
        // Guardar el asunto del primer PQR
        cy.get('[data-testid="my-pqr-table"] tbody tr').first().find('td').eq(0).invoke('text').as('firstPqrSubject');
        
        // Clic en el botón de ver detalles del primer PQR
        cy.get('[data-testid="my-pqr-table"] tbody tr').first().find('[data-testid="view-pqr-button"]').click();
        
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
      } else {
        cy.log('No hay PQR disponibles para ver detalles');
      }
    });
  });
});
