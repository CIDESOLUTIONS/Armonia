// Prueba simple para verificar que Cypress funciona
describe('Verificación básica', () => {
  it('Debería cargar la página de inicio', () => {
    cy.visit('/');
    cy.contains('Armonía').should('exist');
  });
});
