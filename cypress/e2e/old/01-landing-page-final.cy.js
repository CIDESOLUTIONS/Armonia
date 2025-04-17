// Prueba final para la landing page de Armonía
describe('Landing Page de Armonía', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('Debería mostrar el encabezado principal y la marca', () => {
    // Verificar el logotipo y nombre de la aplicación
    cy.contains('Armonía').should('exist');
    
    // Verificar texto principal de la página de inicio
    cy.contains('Gestión integral').should('exist');
    
    // Verificar que hay una imagen o preview del dashboard
    cy.get('img').should('exist');
  });

  it('Debería mostrar la navegación principal y elementos UI', () => {
    // Verificar elementos de navegación
    cy.contains('Funcionalidades').should('exist');
    cy.contains('Planes').should('exist');
    cy.contains('Contacto').should('exist');
    
    // Verificar botones de acción principales
    cy.contains('Registrarse').should('exist');
    cy.contains('Iniciar Sesión').should('exist');
  });

  it('Debería permitir navegar a la página de login', () => {
    // Hacer clic en el botón de inicio de sesión
    cy.contains('Iniciar Sesión').click();
    
    // Verificar que se redirige a la página de login
    cy.url().should('include', '/login');
  });
});
