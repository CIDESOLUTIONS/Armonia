// Pruebas completas para la página de login de Armonía
describe('Página de Login de Armonía', () => {
  beforeEach(() => {
    cy.visit('/login');
    // Esperar a que el formulario de login sea visible
    cy.get('form', { timeout: 10000 }).should('be.visible');
  });

  it('Debería mostrar el formulario de login correctamente', () => {
    // Verificar elementos del formulario
    cy.get('form').within(() => {
      cy.get('input[name="email"]').should('be.visible');
      cy.get('input[name="password"]').should('be.visible');
      cy.contains('Iniciar Sesión').should('be.visible');
    });
    
    // Verificar que exista el enlace para recuperar contraseña
    cy.contains('¿Olvidó su contraseña?').should('be.visible');
  });

  it('Debería mostrar error al intentar login con campos vacíos', () => {
    cy.get('form').within(() => {
      cy.contains('Iniciar Sesión').click();
    });
    
    // Verificar mensajes de error
    cy.contains('El correo electrónico es requerido').should('be.visible');
  });

  it('Debería mostrar error al intentar login con credenciales inválidas', () => {
    cy.get('form').within(() => {
      cy.get('input[name="email"]').type('usuario.invalido@ejemplo.com');
      cy.get('input[name="password"]').type('contraseñainvalida');
      cy.contains('Iniciar Sesión').click();
    });
    
    // Verificar mensaje de error
    cy.contains('Credenciales inválidas').should('be.visible');
  });

  it('Debería autenticar correctamente como administrador', () => {
    cy.get('form').within(() => {
      cy.get('input[name="email"]').type(Cypress.env('adminEmail'));
      cy.get('input[name="password"]').type(Cypress.env('adminPassword'));
      cy.contains('Iniciar Sesión').click();
    });
    
    // Verificar redirección al dashboard de administrador
    cy.url().should('include', '/dashboard');
    
    // Verificar que se muestra el nombre de usuario en el header
    cy.get('header').contains('Admin').should('be.visible');
  });

  it('Debería autenticar correctamente como residente', () => {
    cy.get('form').within(() => {
      cy.get('input[name="email"]').type(Cypress.env('residentEmail'));
      cy.get('input[name="password"]').type(Cypress.env('residentPassword'));
      cy.contains('Iniciar Sesión').click();
    });
    
    // Verificar redirección al dashboard de residente
    cy.url().should('include', '/resident');
  });

  it('Debería autenticar correctamente como recepción', () => {
    cy.get('form').within(() => {
      cy.get('input[name="email"]').type(Cypress.env('receptionEmail'));
      cy.get('input[name="password"]').type(Cypress.env('receptionPassword'));
      cy.contains('Iniciar Sesión').click();
    });
    
    // Verificar redirección al dashboard de recepción
    cy.url().should('include', '/reception');
  });

  it('Debería permitir navegar a la recuperación de contraseña', () => {
    cy.contains('¿Olvidó su contraseña?').click();
    
    // Verificar redirección
    cy.url().should('include', '/login/forgot-password');
    
    // Verificar formulario de recuperación
    cy.get('input[name="email"]').should('be.visible');
    cy.contains('Recuperar Contraseña').should('be.visible');
  });

  it('Debería permitir volver a la página principal', () => {
    cy.contains('Volver').click();
    
    // Verificar redirección a la landing page
    cy.url().should('not.include', '/login');
  });
});
