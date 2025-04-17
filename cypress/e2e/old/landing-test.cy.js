// Prueba de landing page para Armonía
describe('Landing Page de Armonía', () => {
  it('Debería mostrar el encabezado principal y la marca', () => {
    cy.visit('/');
    cy.contains('Armonía').should('exist');
    cy.contains('Gestión integral').should('exist');
  });

  it('Debería mostrar la navegación principal', () => {
    cy.visit('/');
    cy.contains('Funcionalidades').should('exist');
    cy.contains('Planes').should('exist');
    cy.contains('Contacto').should('exist');
  });

  it('Debería permitir navegar a la página de login', () => {
    cy.visit('/');
    cy.contains('Iniciar Sesión').click();
    cy.url().should('include', '/login');
  });
});
