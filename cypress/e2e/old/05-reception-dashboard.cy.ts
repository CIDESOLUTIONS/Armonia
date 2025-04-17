// Prueba del dashboard de recepción/vigilancia de Armonía
describe('Dashboard de Recepción/Vigilancia en Armonía', () => {
  beforeEach(() => {
    // Iniciar sesión como personal de recepción antes de cada prueba
    cy.visit('/login');
    cy.get('input[placeholder="Tu correo electrónico"]').type('recepcion@test.com');
    cy.get('input[placeholder="Tu contraseña"]').type('Recepcion123');
    cy.get('button').contains('Iniciar Sesión').click();
    
    // Verificar que estamos en el dashboard de recepción
    cy.url().should('include', '/reception');
  });

  it('Debería mostrar el panel principal de recepción', () => {
    // Verificar elementos principales del dashboard
    cy.get('body').then(($body) => {
      const hasWelcomeMessage = $body.text().includes('Bienvenido') || 
                               $body.text().includes('Recepción') ||
                               $body.text().includes('Vigilancia') ||
                               $body.text().includes('Portal');
      
      expect(hasWelcomeMessage).to.be.true;
    });
    
    // Verificar que hay secciones principales del portal
    cy.get('body').then(($body) => {
      const hasSections = $body.find('section').length > 0 || 
                         $body.find('[data-testid="dashboard-card"]').length > 0 ||
                         $body.find('.card').length > 0;
      
      expect(hasSections).to.be.true;
    });
  });

  it('Debería permitir registrar visitantes', () => {
    // Buscar la sección de visitantes
    cy.contains(/visitantes|visitas|registro de visitas/i).click({force: true});
    
    // Verificar que podemos acceder al formulario de registro
    cy.get('body').then(($body) => {
      // Si existe un botón de "Nuevo visitante" o similar, hacer clic en él
      if ($body.find('button').filter(':contains("Nuevo")').length > 0) {
        cy.contains('button', 'Nuevo').click();
      } else if ($body.find('a').filter(':contains("Nuevo")').length > 0) {
        cy.contains('a', 'Nuevo').click();
      }
      
      // Verificar que hay un formulario o campos para registrar visitantes
      const hasVisitorForm = $body.find('form').length > 0 || 
                            $body.find('input').length > 0;
      
      expect(hasVisitorForm).to.be.true;
    });
  });

  it('Debería permitir gestionar correspondencia', () => {
    // Buscar la sección de correspondencia
    cy.contains(/correspondencia|paquetes|entregas/i).click({force: true});
    
    // Verificar que se muestra información de correspondencia
    cy.get('body').then(($body) => {
      const hasMailInfo = $body.text().includes('Correspondencia') || 
                         $body.text().includes('Paquetes') ||
                         $body.text().includes('Entregas');
      
      expect(hasMailInfo).to.be.true;
    });
    
    // Verificar que se puede registrar nueva correspondencia
    cy.get('body').then(($body) => {
      if ($body.find('button').filter(':contains("Nuevo")').length > 0) {
        cy.contains('button', 'Nuevo').click();
      } else if ($body.find('a').filter(':contains("Nuevo")').length > 0) {
        cy.contains('a', 'Nuevo').click();
      }
      
      // Verificar que hay un formulario para registrar
      const hasMailForm = $body.find('form').length > 0 || 
                         $body.find('input').length > 0;
      
      expect(hasMailForm).to.be.true;
    });
  });

  it('Debería permitir registrar novedades o incidentes', () => {
    // Buscar la sección de novedades o incidentes
    cy.contains(/novedades|incidentes|minuta/i).click({force: true});
    
    // Verificar que se muestra información de novedades
    cy.get('body').then(($body) => {
      const hasIncidentInfo = $body.text().includes('Novedad') || 
                             $body.text().includes('Incidente') ||
                             $body.text().includes('Minuta');
      
      expect(hasIncidentInfo).to.be.true;
    });
    
    // Verificar que se puede registrar nueva novedad
    cy.get('body').then(($body) => {
      if ($body.find('button').filter(':contains("Nuevo")').length > 0) {
        cy.contains('button', 'Nuevo').click();
      } else if ($body.find('a').filter(':contains("Nuevo")').length > 0) {
        cy.contains('a', 'Nuevo').click();
      }
      
      // Verificar que hay un formulario para registrar
      const hasIncidentForm = $body.find('form').length > 0 || 
                             $body.find('input').length > 0 ||
                             $body.find('textarea').length > 0;
      
      expect(hasIncidentForm).to.be.true;
    });
  });

  it('Debería permitir verificar directorio de residentes', () => {
    // Buscar la sección de directorio o residentes
    cy.contains(/directorio|residentes|habitantes/i).click({force: true});
    
    // Verificar que se muestra información de residentes
    cy.get('body').then(($body) => {
      const hasResidentInfo = $body.text().includes('Directorio') || 
                             $body.text().includes('Residentes') ||
                             $body.text().includes('Habitantes') ||
                             $body.text().includes('Propietarios');
      
      expect(hasResidentInfo).to.be.true;
      
      // Verificar que hay alguna lista o tabla
      const hasResidentsList = $body.find('table').length > 0 || 
                              $body.find('[data-testid="residents-list"]').length > 0 ||
                              $body.find('[role="table"]').length > 0 ||
                              $body.find('ul').length > 0;
      
      expect(hasResidentsList).to.be.true;
    });
  });

  it('Debería permitir gestionar reservas', () => {
    // Buscar la sección de reservas
    cy.contains(/reservas|áreas comunes|servicios/i).click({force: true});
    
    // Verificar que se muestra información de reservas
    cy.get('body').then(($body) => {
      const hasReservationInfo = $body.text().includes('Reserva') || 
                                $body.text().includes('Áreas comunes') ||
                                $body.text().includes('Servicios');
      
      expect(hasReservationInfo).to.be.true;
    });
  });

  it('Debería permitir cerrar sesión', () => {
    // Buscar y hacer clic en el botón o enlace de cerrar sesión
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="logout-button"]').length > 0) {
        cy.get('[data-testid="logout-button"]').click();
      } else if ($body.find('button').filter(':contains("Cerrar sesión")').length > 0) {
        cy.contains('button', 'Cerrar sesión').click();
      } else if ($body.find('a').filter(':contains("Cerrar sesión")').length > 0) {
        cy.contains('a', 'Cerrar sesión').click();
      } else if ($body.find('button').filter(':contains("Salir")').length > 0) {
        cy.contains('button', 'Salir').click();
      } else {
        // Intentar click en menú de usuario y luego buscar cerrar sesión
        cy.get('nav').find('button').last().click({force: true});
        cy.contains('Cerrar sesión').click({force: true});
      }
    });
    
    // Verificar que hemos vuelto a la página de login o inicio
    cy.url().should('include', '/login').or('not.include', '/reception');
  });
});
