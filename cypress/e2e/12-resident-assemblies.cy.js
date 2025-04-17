// Pruebas para el Módulo de Asambleas del Residente
describe('Módulo de Asambleas del Residente', () => {
  beforeEach(() => {
    // Login como residente antes de cada prueba
    cy.visit('/login');
    cy.get('input[name="email"]').type(Cypress.env('residentEmail'));
    cy.get('input[name="password"]').type(Cypress.env('residentPassword'));
    cy.contains('Iniciar Sesión').click();
    
    // Navegar al módulo de asambleas
    cy.get('[data-testid="sidebar"]').contains('Asambleas').click();
    
    // Esperar a que cargue la página de asambleas
    cy.url().should('include', '/resident/assemblies');
    cy.contains('Asambleas', { timeout: 10000 }).should('be.visible');
  });

  it('Debería mostrar las secciones principales del módulo de asambleas', () => {
    // Verificar secciones
    cy.contains('Próximas Asambleas').should('be.visible');
    cy.contains('Historial de Asambleas').should('be.visible');
    cy.contains('Votaciones').should('be.visible');
  });

  it('Debería mostrar el listado de próximas asambleas', () => {
    // Verificar lista o tarjetas
    cy.get('[data-testid="upcoming-assemblies-list"]').should('be.visible');
  });

  it('Debería mostrar el historial de asambleas pasadas', () => {
    // Hacer clic en la pestaña de historial
    cy.contains('Historial de Asambleas').click();
    
    // Verificar lista o tabla
    cy.get('[data-testid="assemblies-history-table"]').should('be.visible');
    
    // Verificar encabezados
    cy.contains('Asamblea').should('be.visible');
    cy.contains('Fecha').should('be.visible');
    cy.contains('Tipo').should('be.visible');
    cy.contains('Documentos').should('be.visible');
  });

  it('Debería permitir ver los detalles de una asamblea próxima', () => {
    // Verificar si hay asambleas próximas
    cy.get('[data-testid="upcoming-assemblies-list"] [data-testid="assembly-card"]').then($cards => {
      if ($cards.length > 0) {
        // Clic en el botón de ver detalles de la primera asamblea
        cy.get('[data-testid="upcoming-assemblies-list"] [data-testid="assembly-card"]')
          .first()
          .find('[data-testid="view-assembly-details-button"]')
          .click();
        
        // Verificar página de detalles
        cy.contains('Detalles de la Asamblea').should('be.visible');
        
        // Verificar secciones de detalles
        cy.contains('Información General').should('be.visible');
        cy.contains('Orden del Día').should('be.visible');
        cy.contains('Documentos Asociados').should('be.visible');
      } else {
        cy.log('No hay asambleas próximas disponibles');
      }
    });
  });

  it('Debería permitir confirmar asistencia a una asamblea', () => {
    // Verificar si hay asambleas próximas
    cy.get('[data-testid="upcoming-assemblies-list"] [data-testid="assembly-card"]').then($cards => {
      if ($cards.length > 0) {
        // Clic en el botón de confirmar asistencia de la primera asamblea
        cy.get('[data-testid="upcoming-assemblies-list"] [data-testid="assembly-card"]')
          .first()
          .find('[data-testid="confirm-attendance-button"]')
          .click();
        
        // Verificar modal de confirmación
        cy.get('[data-testid="confirm-attendance-modal"]').should('be.visible');
        
        // Seleccionar tipo de asistencia
        cy.get('select[name="attendanceType"]').select('Presencial');
        
        // Confirmar asistencia
        cy.contains('Confirmar Asistencia').click();
        
        // Verificar mensaje de éxito
        cy.contains('Asistencia confirmada correctamente').should('be.visible');
      } else {
        cy.log('No hay asambleas próximas disponibles');
      }
    });
  });

  it('Debería permitir descargar documentos de una asamblea', () => {
    // Ir a la pestaña de historial
    cy.contains('Historial de Asambleas').click();
    
    // Verificar si hay asambleas en el historial
    cy.get('[data-testid="assemblies-history-table"] tbody tr').then($rows => {
      if ($rows.length > 0) {
        // Clic en el botón de documentos de la primera asamblea
        cy.get('[data-testid="assemblies-history-table"] tbody tr')
          .first()
          .find('[data-testid="view-documents-button"]')
          .click();
        
        // Verificar modal o página de documentos
        cy.contains('Documentos de la Asamblea').should('be.visible');
        
        // Verificar lista de documentos
        cy.get('[data-testid="assembly-documents-list"]').should('be.visible');
        
        // Si hay documentos, intentar descargar el primero
        cy.get('[data-testid="assembly-documents-list"] li').then($docs => {
          if ($docs.length > 0) {
            cy.get('[data-testid="assembly-documents-list"] li')
              .first()
              .find('[data-testid="download-document-button"]')
              .click();
            
            // Verificar mensaje de descarga
            cy.contains('Descargando documento').should('be.visible');
          } else {
            cy.log('No hay documentos disponibles para descargar');
          }
        });
      } else {
        cy.log('No hay asambleas en el historial');
      }
    });
  });

  it('Debería mostrar las votaciones activas', () => {
    // Ir a la pestaña de votaciones
    cy.contains('Votaciones').click();
    
    // Verificar secciones
    cy.contains('Votaciones Activas').should('be.visible');
    cy.contains('Histórico de Votaciones').should('be.visible');
    
    // Verificar lista de votaciones activas
    cy.get('[data-testid="active-votings-list"]').should('be.visible');
  });

  it('Debería permitir participar en una votación activa', () => {
    // Ir a la pestaña de votaciones
    cy.contains('Votaciones').click();
    
    // Verificar si hay votaciones activas
    cy.get('[data-testid="active-votings-list"] [data-testid="voting-card"]').then($cards => {
      if ($cards.length > 0) {
        // Clic en el botón de votar de la primera votación
        cy.get('[data-testid="active-votings-list"] [data-testid="voting-card"]')
          .first()
          .find('[data-testid="vote-button"]')
          .click();
        
        // Verificar página de votación
        cy.contains('Emitir Voto').should('be.visible');
        
        // Verificar información de la votación
        cy.get('[data-testid="voting-details"]').should('be.visible');
        
        // Verificar opciones de voto
        cy.get('[data-testid="voting-options"]').should('be.visible');
        
        // Seleccionar una opción
        cy.get('[data-testid="voting-options"] input[type="radio"]').first().check();
        
        // Enviar voto
        cy.contains('Enviar Voto').click();
        
        // Verificar confirmación
        cy.get('[data-testid="confirm-vote-modal"]').should('be.visible');
        
        // Confirmar voto
        cy.contains('Confirmar Voto').click();
        
        // Verificar mensaje de éxito
        cy.contains('Voto registrado correctamente').should('be.visible');
      } else {
        cy.log('No hay votaciones activas disponibles');
      }
    });
  });

  it('Debería mostrar los resultados de votaciones pasadas', () => {
    // Ir a la pestaña de votaciones
    cy.contains('Votaciones').click();
    
    // Ir a histórico de votaciones
    cy.contains('Histórico de Votaciones').click();
    
    // Verificar tabla o lista
    cy.get('[data-testid="voting-history-table"]').should('be.visible');
    
    // Verificar si hay votaciones pasadas
    cy.get('[data-testid="voting-history-table"] tbody tr').then($rows => {
      if ($rows.length > 0) {
        // Clic en el botón de ver resultados de la primera votación
        cy.get('[data-testid="voting-history-table"] tbody tr')
          .first()
          .find('[data-testid="view-results-button"]')
          .click();
        
        // Verificar página de resultados
        cy.contains('Resultados de la Votación').should('be.visible');
        
        // Verificar gráfico de resultados
        cy.get('[data-testid="voting-results-chart"]').should('be.visible');
        
        // Verificar tabla de resultados
        cy.get('[data-testid="voting-results-table"]').should('be.visible');
      } else {
        cy.log('No hay votaciones pasadas disponibles');
      }
    });
  });

  it('Debería permitir unirse a una asamblea virtual', () => {
    // Verificar si hay asambleas virtuales próximas
    cy.get('[data-testid="upcoming-assemblies-list"] [data-testid="assembly-card"]').then($cards => {
      if ($cards.length > 0) {
        // Buscar una asamblea virtual
        cy.get('[data-testid="upcoming-assemblies-list"] [data-testid="assembly-card"]')
          .contains('Virtual')
          .parent('[data-testid="assembly-card"]')
          .then($card => {
            if ($card.length > 0) {
              // Clic en el botón de unirse a la asamblea
              cy.wrap($card).find('[data-testid="join-virtual-assembly-button"]').click();
              
              // Verificar redirección o apertura de ventana de conferencia
              cy.contains('Preparando conexión').should('be.visible');
              
              // Nota: No podemos probar completamente la redirección externa, pero podemos verificar que se intente
              cy.url().should('include', '/virtual-assembly');
            } else {
              cy.log('No hay asambleas virtuales disponibles');
            }
          });
      } else {
        cy.log('No hay asambleas próximas disponibles');
      }
    });
  });
});
