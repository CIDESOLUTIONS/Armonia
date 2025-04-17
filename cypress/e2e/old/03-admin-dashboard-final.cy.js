// Prueba final para el dashboard de administrador de Armonía
describe('Dashboard de Administrador en Armonía', () => {
  beforeEach(() => {
    // Iniciar sesión antes de cada prueba
    cy.visit('/login');
    cy.get('input[placeholder="Tu correo electrónico"]').type('admin@armonia.com');
    cy.get('input[placeholder="Tu contraseña"]').type('Admin123');
    cy.get('button').contains('Iniciar Sesión').click();
    
    // Verificar que estamos en el dashboard
    cy.url().should('include', '/dashboard');
  });

  it('Debería mostrar el panel de control principal', () => {
    // Verificar elementos principales del dashboard
    cy.contains('Dashboard').should('exist');
    cy.contains('Bienvenido').should('exist');
    
    // Verificar secciones principales
    cy.get('body').then(($body) => {
      // Verificar que existen algunos de estos elementos del dashboard
      const hasStatCards = $body.find('[data-testid="stat-card"]').length > 0 || 
                          $body.text().includes('Propiedades') ||
                          $body.text().includes('Residentes') ||
                          $body.text().includes('Servicios');
      
      expect(hasStatCards).to.be.true;
    });
  });

  it('Debería mostrar la navegación lateral', () => {
    // Verificar menú lateral
    cy.get('body').then(($body) => {
      // El menú lateral debe contener elementos de navegación principales
      const hasSidebar = $body.find('nav').length > 0 ||
                        $body.find('[data-testid="sidebar"]').length > 0 ||
                        $body.find('[role="navigation"]').length > 0;
      
      expect(hasSidebar).to.be.true;
      
      // Verificar enlaces principales (al menos algunos deben existir)
      const menuItems = ['Dashboard', 'Propiedades', 'Residentes', 'Asambleas', 'Finanzas', 'Servicios', 'PQR', 'Configuración'];
      let foundItems = 0;
      
      menuItems.forEach(item => {
        if ($body.text().includes(item)) {
          foundItems++;
        }
      });
      
      // Al menos 4 elementos del menú deberían existir
      expect(foundItems).to.be.at.least(4);
    });
  });

  it('Debería permitir navegar a la sección de propiedades', () => {
    // Navegar a la sección de propiedades
    cy.contains('Propiedades').click();
    
    // Verificar que estamos en la sección correcta
    cy.url().should('include', '/dashboard/inventory');
    
    // Verificar contenido de la sección
    cy.contains('Inventario').should('exist');
    
    // Verificar que hay alguna lista o tabla de propiedades
    cy.get('body').then(($body) => {
      const hasPropertiesList = $body.find('table').length > 0 || 
                               $body.find('[data-testid="properties-list"]').length > 0 ||
                               $body.find('[role="table"]').length > 0;
      
      expect(hasPropertiesList).to.be.true;
    });
  });

  it('Debería permitir navegar a la sección de residentes', () => {
    // Navegar a la sección de residentes
    cy.contains('Residentes').click();
    
    // Verificar que estamos en la sección correcta
    cy.url().should('include', '/dashboard/resident');
    
    // Verificar que hay alguna lista o tabla de residentes
    cy.get('body').then(($body) => {
      const hasResidentsList = $body.find('table').length > 0 || 
                              $body.find('[data-testid="residents-list"]').length > 0 ||
                              $body.find('[role="table"]').length > 0;
      
      expect(hasResidentsList).to.be.true;
    });
  });

  it('Debería permitir navegar a la sección de asambleas', () => {
    // Navegar a la sección de asambleas
    cy.contains('Asambleas').click();
    
    // Verificar que estamos en la sección correcta
    cy.url().should('include', '/dashboard/assemblies');
    
    // Verificar contenido relacionado con asambleas
    cy.get('body').then(($body) => {
      const hasAssembliesContent = $body.text().includes('Asambleas') ||
                                  $body.text().includes('Reuniones') ||
                                  $body.text().includes('Convocatorias');
      
      expect(hasAssembliesContent).to.be.true;
    });
  });

  it('Debería permitir navegar a la sección financiera', () => {
    // Navegar a la sección financiera
    cy.contains('Finanzas').click();
    
    // Verificar que estamos en la sección correcta
    cy.url().should('include', '/dashboard/financial');
    
    // Verificar contenido relacionado con finanzas
    cy.get('body').then(($body) => {
      const hasFinancialContent = $body.text().includes('Finanzas') ||
                                 $body.text().includes('Pagos') ||
                                 $body.text().includes('Cuotas') ||
                                 $body.text().includes('Presupuesto');
      
      expect(hasFinancialContent).to.be.true;
    });
  });

  it('Debería permitir navegar a la sección de servicios comunes', () => {
    // Navegar a la sección de servicios
    cy.contains('Servicios').click();
    
    // Verificar que estamos en la sección correcta
    cy.url().should('include', '/dashboard/services');
    
    // Verificar contenido relacionado con servicios
    cy.get('body').then(($body) => {
      const hasServicesContent = $body.text().includes('Servicios') ||
                               $body.text().includes('Reservas') ||
                               $body.text().includes('Áreas comunes');
      
      expect(hasServicesContent).to.be.true;
    });
  });

  it('Debería permitir navegar a la sección de PQR', () => {
    // Navegar a la sección de PQR
    cy.contains('PQR').click();
    
    // Verificar que estamos en la sección correcta
    cy.url().should('include', '/dashboard/pqr');
    
    // Verificar contenido relacionado con PQR
    cy.get('body').then(($body) => {
      const hasPqrContent = $body.text().includes('PQR') ||
                           $body.text().includes('Peticiones') ||
                           $body.text().includes('Quejas') ||
                           $body.text().includes('Reclamos');
      
      expect(hasPqrContent).to.be.true;
    });
  });

  it('Debería permitir navegar a la sección de configuración', () => {
    // Navegar a la sección de configuración
    cy.contains('Configuración').click();
    
    // Verificar que estamos en la sección correcta
    cy.url().should('include', '/dashboard/config');
    
    // Verificar contenido relacionado con configuración
    cy.get('body').then(($body) => {
      const hasConfigContent = $body.text().includes('Configuración') ||
                              $body.text().includes('Ajustes') ||
                              $body.text().includes('Perfil');
      
      expect(hasConfigContent).to.be.true;
    });
  });

  it('Debería permitir cerrar sesión', () => {
    // Buscar y hacer clic en el botón o enlace de cerrar sesión
    // Puede estar en diferentes lugares, así que buscamos en varios
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
    cy.url().should('include', '/login').or('not.include', '/dashboard');
  });
});
