// Prueba actualizada para la autenticación de Armonía
describe('Autenticación de Armonía', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.fixture('example.json').as('testData');
  });

  it('Debería mostrar el formulario de login con todos sus elementos', () => {
    // Verificar el título de la página
    cy.contains('Iniciar Sesión').should('exist');
    
    // Verificar los campos del formulario
    cy.get('input[type="email"]').should('exist');
    cy.get('input[type="password"]').should('exist');
    cy.contains('Ingresar').should('exist');
    
    // Verificar el enlace de recuperación de contraseña
    cy.contains('¿Olvidaste tu contraseña?').should('exist');
  });

  it('Debería mostrar error con credenciales inválidas', () => {
    // Intentar ingresar con credenciales incorrectas
    cy.get('input[type="email"]').type('usuario_invalido@armonia.com');
    cy.get('input[type="password"]').type('contraseña_incorrecta');
    cy.contains('Ingresar').click();
    
    // Verificar que se muestra un mensaje de error
    cy.contains('Credenciales inválidas').should('exist');
  });

  it('Debería autenticar al administrador correctamente', function () {
    // Ingresar con las credenciales del administrador
    cy.get('input[type="email"]').type(this.testData.users.admin.email);
    cy.get('input[type="password"]').type(this.testData.users.admin.password);
    cy.contains('Ingresar').click();
    
    // Verificar redirección al dashboard de administrador
    cy.url().should('include', '/dashboard');
    
    // Verificar que se muestra el nombre del administrador
    cy.contains(this.testData.users.admin.name).should('exist');
  });

  it('Debería autenticar al residente correctamente', function () {
    // Ingresar con las credenciales del residente
    cy.get('input[type="email"]').type(this.testData.users.resident.email);
    cy.get('input[type="password"]').type(this.testData.users.resident.password);
    cy.contains('Ingresar').click();
    
    // Verificar redirección al dashboard de residente
    cy.url().should('include', '/resident');
    
    // Verificar que se muestra el nombre del residente
    cy.contains(this.testData.users.resident.name).should('exist');
  });

  it('Debería autenticar al personal de recepción correctamente', function () {
    // Ingresar con las credenciales del personal de recepción
    cy.get('input[type="email"]').type(this.testData.users.reception.email);
    cy.get('input[type="password"]').type(this.testData.users.reception.password);
    cy.contains('Ingresar').click();
    
    // Verificar redirección al dashboard de recepción
    cy.url().should('include', '/reception');
    
    // Verificar que se muestra el nombre del recepcionista
    cy.contains(this.testData.users.reception.name).should('exist');
  });

  it('Debería redirigir a la página de recuperación de contraseña', () => {
    // Hacer clic en el enlace de recuperación de contraseña
    cy.contains('¿Olvidaste tu contraseña?').click();
    
    // Verificar redirección a la página de recuperación
    cy.url().should('include', '/forgot-password');
    
    // Verificar que se muestra el formulario de recuperación
    cy.contains('Recuperar Contraseña').should('exist');
    cy.get('input[type="email"]').should('exist');
  });

  it('Debería permitir cerrar sesión después de autenticarse', function () {
    // Ingresar con las credenciales del administrador
    cy.get('input[type="email"]').type(this.testData.users.admin.email);
    cy.get('input[type="password"]').type(this.testData.users.admin.password);
    cy.contains('Ingresar').click();
    
    // Verificar redirección al dashboard
    cy.url().should('include', '/dashboard');
    
    // Buscar y hacer clic en el botón de cerrar sesión
    cy.contains('Cerrar Sesión').click();
    
    // Verificar redirección a la página de inicio
    cy.url().should('include', '/login');
  });
});