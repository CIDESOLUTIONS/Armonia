// Pruebas para la landing page de Armonía
describe('Landing Page de Armonía', () => {
  beforeEach(() => {
    cy.visit('/');
    // Esperar a que la página cargue completamente
    cy.contains('Armonía', { timeout: 10000 }).should('be.visible');
  });

  it('Debería mostrar correctamente los elementos de la cabecera', () => {
    // Verificar el logo y la marca en el header
    cy.get('[data-testid="main-header"]').within(() => {
      cy.contains('Armonía').should('be.visible');
      cy.contains('Iniciar Sesión').should('be.visible');
      // Verificar que NO existe el botón "Registrarse" en el header
      cy.contains('Registrarse').should('not.exist');
    });
  });

  it('Debería mostrar la sección de hero con llamada a la acción', () => {
    // Verificar elementos principales del hero
    cy.get('[data-testid="hero-section"]').within(() => {
      cy.contains('Gestión integral').should('be.visible');
      cy.contains('conjuntos residenciales').should('be.visible');
      cy.get('[data-testid="iniciar-sesion-btn"]').should('be.visible');
      cy.get('[data-testid="registrar-conjunto-btn"]').should('be.visible');
    });
  });

  it('Debería cambiar el tema entre claro y oscuro', () => {
    // Verificar que inicialmente está en modo claro
    cy.get('div[class*="bg-white"]').should('exist');
    
    // Hacer clic en el botón de cambio de tema (Sol)
    cy.get('button[title*="Cambiar a Oscuro"]').click();
    
    // Verificar que cambia a modo oscuro
    cy.get('div[class*="bg-gray-900"]').should('exist');
    
    // Hacer clic en el botón de cambio de tema (Luna)
    cy.get('button[title*="Switch to Light"]').click();
    
    // Verificar que vuelve a modo claro
    cy.get('div[class*="bg-white"]').should('exist');
  });

  it('Debería cambiar entre monedas', () => {
    // Verificar que por defecto aparece la moneda en pesos
    cy.contains('$95000').should('be.visible');
    
    // Cambiar a dólares
    cy.get('button[title*="Switch to Dollars"]').click();
    
    // Verificar que cambia a dólares
    cy.contains('$25').should('be.visible');
    
    // Volver a pesos
    cy.get('button[title*="Cambiar a Pesos"]').click();
    
    // Verificar que vuelve a pesos
    cy.contains('$95000').should('be.visible');
  });

  it('Debería mostrar el componente de video', () => {
    // Navegar a la sección de video
    cy.get('[data-testid="video-showcase"]').scrollIntoView();
    
    // Verificar que el video existe
    cy.get('[data-testid="showcase-video"]').should('exist');
    
    // Verificar que los controles del video están presentes
    cy.get('[data-testid="video-play-button"]').should('be.visible');
    cy.get('[data-testid="video-mute-button"]').should('be.visible');
  });

  it('Debería mostrar la sección de funcionalidades', () => {
    // Navegar a la sección de funcionalidades
    cy.get('a[href="#funcionalidades"]').first().click();
    
    // Verificar título de sección
    cy.get('[data-testid="funcionalidades-title"]').should('be.visible');
    
    // Verificar que existan al menos 3 tarjetas de funcionalidades
    cy.get('[data-testid="feature-card"]').should('have.length.at.least', 3);
  });

  it('Debería mostrar la sección de planes', () => {
    // Navegar a la sección de planes
    cy.get('a[href="#planes"]').first().click();
    
    // Verificar que existan los 3 planes: Básico, Estándar y Premium
    cy.contains('Plan Básico').should('be.visible');
    cy.contains('Plan Estándar').should('be.visible');
    cy.contains('Plan Premium').should('be.visible');
  });

  it('Debería mostrar la sección de contacto', () => {
    // Navegar a la sección de contacto
    cy.get('[data-testid="contact-section"]').scrollIntoView();
    
    // Verificar que el formulario existe
    cy.get('[data-testid="contact-form"]').should('be.visible');
    
    // Verificar que tiene los campos requeridos
    cy.get('#name').should('exist');
    cy.get('#email').should('exist');
    cy.get('#complexName').should('exist');
    cy.get('[data-testid="submit-contact"]').should('exist');
  });

  it('Debería permitir navegar al selector de portales desde el header', () => {
    // Clic en "Iniciar Sesión" en el header
    cy.get('[data-testid="main-header"]').contains('Iniciar Sesión').click();
    
    // Verificar redirección
    cy.url().should('include', '/portal-selector');
  });

  it('Debería permitir navegar a la página de registro desde el botón principal', () => {
    // Clic en "Registrar Conjunto" en la sección hero
    cy.get('[data-testid="registrar-conjunto-btn"]').click();
    
    // Verificar redirección
    cy.url().should('include', '/register-complex');
  });

  it('Debería mostrar el footer con información de la empresa y navegación', () => {
    // Desplazarse al footer
    cy.get('footer').scrollIntoView();
    
    // Verificar elementos del footer
    cy.get('footer').within(() => {
      cy.contains('Armonía').should('be.visible');
      cy.contains('Términos de servicio').should('be.visible');
      cy.contains('Privacidad').should('be.visible');
    });
  });

  it('Debería ser responsive en tamaño móvil', () => {
    // Cambiar viewport a tamaño móvil
    cy.viewport('iphone-x');
    cy.reload();
    
    // Verificar que el menú de navegación se convierta en un botón de hamburguesa
    cy.get('[data-testid="mobile-menu-button"]').should('be.visible');
    
    // Verificar que el botón de hamburguesa funciona
    cy.get('[data-testid="mobile-menu-button"]').click();
    cy.contains('Funcionalidades').should('be.visible');
    cy.contains('Planes').should('be.visible');
    cy.contains('Iniciar Sesión').should('be.visible');
  });

  it('Debería permitir completar el formulario de contacto', () => {
    // Navegar a la sección de contacto
    cy.get('[data-testid="contact-section"]').scrollIntoView();
    
    // Llenar el formulario
    cy.get('#name').type('Juan Pérez');
    cy.get('#email').type('juan.perez@ejemplo.com');
    cy.get('#phone').type('3001234567');
    cy.get('#complexName').type('Conjunto Residencial Los Pinos');
    cy.get('#units').type('45');
    cy.get('#message').type('Me gustaría tener más información sobre el plan Premium.');
    
    // Enviar el formulario (interceptamos el submit para evitar la navegación)
    cy.window().then((win) => {
      cy.stub(win, 'alert').as('alertStub');
    });
    cy.get('[data-testid="contact-form"]').submit();
    
    // Verificar que se muestra el mensaje de éxito
    cy.get('@alertStub').should('have.been.calledWith', 'Gracias por su interés. Nos pondremos en contacto con usted pronto.');
  });
});