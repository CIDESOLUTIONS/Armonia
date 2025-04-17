// Prueba simple que solo visita la página
describe('Prueba simple', () => {
  it('Debería cargar la página principal', () => {
    cy.visit('http://localhost:3000');
    cy.log('Página principal cargada correctamente');
  });
});
