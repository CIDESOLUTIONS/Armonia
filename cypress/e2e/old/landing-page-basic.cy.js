// Prueba básica para la landing page de Armonía
describe('Landing Page de Armonía (Prueba Básica)', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('Debería mostrar el encabezado principal y la marca', () => {
    // Verificar el logo y la marca
    cy.contains('Armonía').should('exist');
    
    // Verificar texto principal
    cy.contains('Gestión').should('exist');
  });

  it('Debería mostrar la navegación principal', () => {
    // Verificar elementos de navegación básicos
    cy.contains('Funcionalidades').should('exist');
    cy.contains('Planes').should('exist');
  });

  it('Debería permitir navegar a la página de login', () => {
    // Hacer clic en el botón de inicio de sesión
    cy.contains('Iniciar Sesión').click();
    
    // Verificar que se redirige a la página de login
    cy.url().should('include', '/login');
  });
});
