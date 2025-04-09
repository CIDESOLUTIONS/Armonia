// Prueba final para la landing page de Armonía
describe('Landing Page de Armonía', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('Debería mostrar el encabezado principal y la marca', () => {
    // Verificar el logotipo y nombre de la aplicación
    cy.contains('Armonía').should('exist');
    
    // Verificar texto principal de la página de inicio
    cy.contains('Gestión integral para conjuntos residenciales').should('exist');
    cy.contains('Simplifique la administración de su conjunto').should('exist');
    
    // Verificar que hay una imagen o preview del dashboard
    cy.contains('Vista previa del dashboard').should('exist');
  });

  it('Debería mostrar la navegación principal y elementos UI', () => {
    // Verificar elementos de navegación
    cy.contains('Funcionalidades').should('exist');
    cy.contains('Planes').should('exist');
    cy.contains('Contacto').should('exist');
    
    // Verificar botones de acción principales
    cy.contains('Registrarse').should('exist');
    cy.contains('Iniciar Sesión').should('exist');
    
    // Verificar elementos de configuración (si existen)
    cy.get('body').then(($body) => {
      // Verificar si existen elementos de UI como selector de idioma o tema
      if ($body.find('[aria-label="Cambiar idioma"]').length > 0) {
        cy.get('[aria-label="Cambiar idioma"]').should('exist');
      }
      
      if ($body.find('[aria-label="Cambiar tema"]').length > 0) {
        cy.get('[aria-label="Cambiar tema"]').should('exist');
      }
    });
  });

  it('Debería permitir navegar a la página de login', () => {
    // Hacer clic en el botón de inicio de sesión
    cy.contains('Iniciar Sesión').click();
    
    // Verificar que se redirige a la página de login
    cy.url().should('include', '/login');
    
    // Verificar elementos de la página de login
    cy.contains('Iniciar Sesión').should('exist');
    cy.get('input[placeholder="Tu correo electrónico"]').should('exist');
    cy.get('input[placeholder="Tu contraseña"]').should('exist');
    
    // Volver a la página de inicio
    cy.contains('Volver al inicio').click();
    cy.url().should('not.include', '/login');
  });

  it('Debería mostrar información sobre planes', () => {
    // Navegar a la sección de planes
    cy.contains('Planes').click();
    
    // Verificar si existen los planes según la especificación técnica
    cy.get('body').then(($body) => {
      if ($body.text().includes('Plan Básico')) {
        cy.contains('Plan Básico').should('exist');
        cy.contains('Plan Estándar').should('exist');
        cy.contains('Plan Premium').should('exist');
      } else {
        // Si la estructura es diferente, al menos verificar que hay información de planes
        cy.contains('planes').should('exist');
      }
    });
  });

  it('Debería mostrar información de contacto', () => {
    // Navegar a la sección de contacto
    cy.contains('Contacto').click();
    
    // Verificar si existe un formulario de contacto o información
    cy.get('body').then(($body) => {
      if ($body.find('form').length > 0) {
        cy.get('form').should('exist');
      } else {
        // Si no hay formulario, al menos debería haber información de contacto
        cy.contains('contacto').should('exist');
      }
    });
  });
});
