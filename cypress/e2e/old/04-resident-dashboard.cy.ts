// Prueba del dashboard de residentes de Armonía
describe('Dashboard de Residentes en Armonía', () => {
  beforeEach(() => {
    // Iniciar sesión como residente antes de cada prueba
    cy.visit('/login');
    cy.get('input[placeholder="Tu correo electrónico"]').type('residente@test.com');
    cy.get('input[placeholder="Tu contraseña"]').type('Residente123');
    cy.get('button').contains('Iniciar Sesión').click();
    
    // Verificar que estamos en el dashboard de residentes
    cy.url().should('include', '/resident');
  });

  it('Debería mostrar el panel principal de residente', () => {
    // Verificar elementos principales del dashboard
    cy.get('body').then(($body) => {
      const hasWelcomeMessage = $body.text().includes('Bienvenido') || 
                               $body.text().includes('Residente') ||
                               $body.text().includes('Mi Portal');
      
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

  it('Debería mostrar información de la cuenta del residente', () => {
    // Buscar y verificar información del perfil
    cy.get('body').then(($body) => {
      // Buscar sección de perfil o información del usuario
      const hasProfileInfo = $body.text().includes('Perfil') || 
                            $body.text().includes('Mi Cuenta') ||
                            $body.text().includes('Información Personal');
      
      expect(hasProfileInfo).to.be.true;
    });
    
    // Verificar que aparece el nombre del residente o su email
    cy.get('body').then(($body) => {
      const hasUserIdentifier = $body.text().includes('residente@test.com') || 
                               $body.text().includes('Residente');
      
      expect(hasUserIdentifier).to.be.true;
    });
  });

  it('Debería permitir ver estado de cuenta', () => {
    // Buscar la sección de estado de cuenta
    cy.contains(/estado de cuenta|pagos|finanzas/i).click({force: true});
    
    // Verificar que se muestra información financiera
    cy.get('body').then(($body) => {
      const hasFinancialInfo = $body.text().includes('Cuota') || 
                              $body.text().includes('Pago') ||
                              $body.text().includes('Saldo') ||
                              $body.text().includes('Estado de cuenta');
      
      expect(hasFinancialInfo).to.be.true;
    });
  });

  it('Debería permitir ver reservas de servicios comunes', () => {
    // Buscar la sección de reservas o servicios
    cy.contains(/reservas|servicios|áreas comunes/i).click({force: true});
    
    // Verificar que se muestra información de reservas o servicios
    cy.get('body').then(($body) => {
      const hasReservationInfo = $body.text().includes('Reserva') || 
                                $body.text().includes('Servicios') ||
                                $body.text().includes('Áreas comunes');
      
      expect(hasReservationInfo).to.be.true;
    });
  });

  it('Debería permitir crear una PQR', () => {
    // Buscar la sección de PQR
    cy.contains(/pqr|peticiones|quejas|reclamos/i).click({force: true});
    
    // Verificar que podemos acceder al formulario de crear PQR
    cy.get('body').then(($body) => {
      // Si existe un botón de "Nueva PQR" o similar, hacer clic en él
      if ($body.find('button').filter(':contains("Nueva")').length > 0) {
        cy.contains('button', 'Nueva').click();
      } else if ($body.find('a').filter(':contains("Nueva")').length > 0) {
        cy.contains('a', 'Nueva').click();
      }
      
      // Verificar que hay un formulario o campos para crear PQR
      const hasPqrForm = $body.find('form').length > 0 || 
                        $body.find('input').length > 0 ||
                        $body.find('textarea').length > 0;
      
      expect(hasPqrForm).to.be.true;
    });
  });

  it('Debería mostrar información de asambleas', () => {
    // Buscar la sección de asambleas
    cy.contains(/asambleas|reuniones|convocatorias/i).click({force: true});
    
    // Verificar que se muestra información de asambleas
    cy.get('body').then(($body) => {
      const hasAssemblyInfo = $body.text().includes('Asamblea') || 
                             $body.text().includes('Reunión') ||
                             $body.text().includes('Convocatoria');
      
      expect(hasAssemblyInfo).to.be.true;
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
    cy.url().should('include', '/login').or('not.include', '/resident');
  });
});
