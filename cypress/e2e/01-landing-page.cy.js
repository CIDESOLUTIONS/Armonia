// Pruebas completas para la landing page de Armonía
describe('Landing Page de Armonía', () => {
  beforeEach(() => {
    cy.visit('/');
    // Esperar a que la página cargue completamente
    cy.contains('Armonía', { timeout: 10000 }).should('be.visible');
  });

  it('Debería mostrar correctamente los elementos de la cabecera', () => {
    // Verificar el logo y la marca
    cy.get('header').within(() => {
      cy.contains('Armonía').should('be.visible');
      cy.contains('Iniciar Sesión').should('be.visible');
      cy.contains('Registrarse').should('be.visible');
    });
  });

  it('Debería mostrar la sección de hero con llamada a la acción', () => {
    cy.get('section').first().within(() => {
      cy.contains('Gestión').should('be.visible');
      cy.contains('conjuntos residenciales').should('be.visible');
      cy.contains('Comenzar').should('be.visible');
    });
  });

  it('Debería mostrar la sección de funcionalidades', () => {
    cy.contains('Funcionalidades').scrollIntoView();
    cy.contains('Funcionalidades').should('be.visible');
    
    // Verificar que existan al menos 3 tarjetas de funcionalidades
    cy.get('[data-testid="feature-card"]').should('have.length.at.least', 3);
  });

  it('Debería mostrar la sección de planes', () => {
    cy.contains('Planes').scrollIntoView();
    cy.contains('Planes').should('be.visible');
    
    // Verificar que existan los 3 planes: Básico, Estándar y Premium
    cy.contains('Básico').should('be.visible');
    cy.contains('Estándar').should('be.visible');
    cy.contains('Premium').should('be.visible');
  });

  it('Debería permitir navegar a la página de login', () => {
    cy.contains('Iniciar Sesión').click();
    cy.url().should('include', '/login');
  });

  it('Debería permitir navegar a la página de registro', () => {
    cy.contains('Registrarse').click();
    cy.url().should('include', '/register');
  });

  it('Debería mostrar el formulario de contacto', () => {
    cy.contains('Contacto').scrollIntoView();
    cy.get('form').within(() => {
      cy.get('input[name="name"]').should('be.visible');
      cy.get('input[name="email"]').should('be.visible');
      cy.get('textarea[name="message"]').should('be.visible');
      cy.contains('Enviar').should('be.visible');
    });
  });

  it('Debería mostrar el footer con información de la empresa y navegación', () => {
    cy.get('footer').scrollIntoView();
    cy.get('footer').within(() => {
      cy.contains('Armonía').should('be.visible');
      cy.contains('Términos y Condiciones').should('be.visible');
      cy.contains('Política de Privacidad').should('be.visible');
    });
  });

  it('Debería ser responsive en tamaño móvil', () => {
    cy.viewport('iphone-x');
    cy.reload();
    
    // Verificar que el menú de navegación se convierta en un botón de hamburguesa
    cy.get('[data-testid="mobile-menu-button"]').should('be.visible');
    
    // Verificar que los elementos principales sean visibles
    cy.contains('Armonía').should('be.visible');
    cy.contains('Gestión').should('be.visible');
  });
});
