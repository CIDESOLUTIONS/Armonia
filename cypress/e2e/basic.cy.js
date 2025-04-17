// Prueba básica para la landing page de Armonía
describe('Armonía - Landing Page Básica', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('Debe cargar la página', () => {
    // Verificar que la página carga correctamente
    cy.contains('Armonía').should('be.visible');
  });

  it('Debe mostrar elementos clave en la página', () => {
    // Título principal
    cy.contains('Gestión integral para conjuntos residenciales').should('be.visible');
    
    // Botones de acción
    cy.contains('Iniciar Sesión').should('be.visible');
    cy.contains('Registrar Conjunto').should('be.visible');
    
    // Secciones principales
    cy.contains('Funcionalidades').should('be.visible');
    cy.contains('Planes').should('be.visible');
  });

  it('Debe navegar al selector de portales al hacer clic en Iniciar Sesión', () => {
    cy.get('[data-testid="main-header"]').contains('Iniciar Sesión').click();
    cy.url().should('include', '/portal-selector');
  });
});
