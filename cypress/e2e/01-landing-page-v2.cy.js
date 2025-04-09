// Prueba actualizada para la landing page y registro de conjuntos
describe('Landing Page y Registro de Conjuntos', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('Debería mostrar el encabezado principal de Armonía', () => {
    // Verificar nombre de la aplicación
    cy.contains('Armonía').should('exist');
    
    // Verificar texto principal de la página
    cy.contains('Gestión integral para conjuntos residenciales').should('exist');
    cy.contains('Simplifique la administración de su conjunto').should('exist');
  });

  it('Debería mostrar la navegación principal', () => {
    // Verificar enlaces de navegación
    cy.contains('Funcionalidades').should('exist');
    cy.contains('Planes').should('exist');
    cy.contains('Contacto').should('exist');
    
    // Verificar botón de registro y login
    cy.contains('Registrarse').should('exist');
    cy.contains('Iniciar Sesión').should('exist');
  });

  // Esta prueba asume que el botón "Registrarse" abre un formulario de registro
  // Modificaremos este test si la UI se comporta diferente
  it('Debería navegar a la página de login', () => {
    cy.contains('Iniciar Sesión').click();
    cy.url().should('include', '/login');
    
    // Volver a la página de inicio
    cy.contains('Volver al inicio').click();
    cy.url().should('not.include', '/login');
  });
});
