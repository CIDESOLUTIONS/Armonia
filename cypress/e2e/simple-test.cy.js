// Prueba simple para verificar que Cypress funciona
describe('Verificación de funcionalidad básica', () => {
  it('Debería cargar la página de inicio', () => {
    cy.visit('/');
    cy.contains('Armonía').should('be.visible');
  });

  it('Debería navegar a la página de login', () => {
    cy.visit('/');
    cy.contains('Iniciar Sesión').click();
    cy.url().should('include', '/login');
  });
});
