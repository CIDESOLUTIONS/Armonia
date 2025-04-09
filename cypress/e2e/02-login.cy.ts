// Prueba para la página de inicio de sesión
describe('Página de Inicio de Sesión', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('Debería mostrar el formulario de inicio de sesión', () => {
    cy.get('form').within(() => {
      cy.contains('Iniciar Sesión');
      cy.get('input[name="email"]').should('be.visible');
      cy.get('input[name="password"]').should('be.visible');
      cy.get('button[type="submit"]').should('be.visible');
    });
    
    // Verificar enlace para recuperar contraseña
    cy.contains('¿Olvidó su contraseña?').should('be.visible');
  });

  it('Debería validar los campos requeridos', () => {
    // Intentar enviar el formulario sin completar los campos
    cy.get('form').within(() => {
      cy.get('button[type="submit"]').click();
      
      // Verificar mensajes de error para campos requeridos
      cy.contains('El correo electrónico es requerido');
      cy.contains('La contraseña es requerida');
    });
  });

  it('Debería mostrar error al ingresar credenciales inválidas', () => {
    cy.get('form').within(() => {
      cy.get('input[name="email"]').type('usuario_inexistente@test.com');
      cy.get('input[name="password"]').type('ContraseñaIncorrecta123!');
      cy.get('button[type="submit"]').click();
    });
    
    // Verificar mensaje de error
    cy.contains('Credenciales inválidas').should('be.visible');
  });

  it('Debería iniciar sesión correctamente como administrador', () => {
    // Usar credenciales de un administrador existente
    cy.get('form').within(() => {
      cy.get('input[name="email"]').type('admin@armonia.com');
      cy.get('input[name="password"]').type('password123');
      cy.get('button[type="submit"]').click();
    });
    
    // Verificar redirección al dashboard del administrador
    cy.url().should('include', '/dashboard');
    
    // Verificar elementos del dashboard del administrador
    cy.contains('Dashboard').should('be.visible');
    cy.contains('Bienvenido, Administrador Principal').should('be.visible');
    
    // Cerrar sesión para limpiar el estado
    cy.contains('Cerrar Sesión').click();
    cy.url().should('include', '/login');
  });

  it('Debería iniciar sesión correctamente como residente', () => {
    // Usar credenciales de un residente existente
    cy.get('form').within(() => {
      cy.get('input[name="email"]').type('resident@example.com');
      cy.get('input[name="password"]').type('password123');
      cy.get('button[type="submit"]').click();
    });
    
    // Verificar redirección al dashboard del residente
    cy.url().should('include', '/resident');
    
    // Verificar elementos del dashboard del residente
    cy.contains('Mi Dashboard').should('be.visible');
    
    // Cerrar sesión para limpiar el estado
    cy.contains('Cerrar Sesión').click();
    cy.url().should('include', '/login');
  });

  it('Debería iniciar sesión correctamente como personal de recepción', () => {
    // Usar credenciales de un personal de recepción existente
    cy.get('form').within(() => {
      cy.get('input[name="email"]').type('staff@example.com');
      cy.get('input[name="password"]').type('password123');
      cy.get('button[type="submit"]').click();
    });
    
    // Verificar redirección al dashboard de recepción
    cy.url().should('include', '/reception');
    
    // Verificar elementos del dashboard de recepción
    cy.contains('Panel de Recepción').should('be.visible');
    
    // Cerrar sesión para limpiar el estado
    cy.contains('Cerrar Sesión').click();
    cy.url().should('include', '/login');
  });

  it('Debería mostrar la página de recuperación de contraseña', () => {
    cy.contains('¿Olvidó su contraseña?').click();
    
    // Verificar redirección a la página de recuperación
    cy.url().should('include', '/login/forgot-password');
    
    // Verificar formulario de recuperación
    cy.get('form').within(() => {
      cy.contains('Recuperar Contraseña');
      cy.get('input[name="email"]').should('be.visible');
      cy.get('button[type="submit"]').should('be.visible');
    });
  });

  it('Debería solicitar recuperación de contraseña', () => {
    cy.contains('¿Olvidó su contraseña?').click();
    
    // Completar formulario de recuperación
    cy.get('form').within(() => {
      cy.get('input[name="email"]').type('admin@armonia.com');
      cy.get('button[type="submit"]').click();
    });
    
    // Verificar mensaje de confirmación
    cy.contains('Se ha enviado un correo con instrucciones para restablecer su contraseña').should('be.visible');
  });
});
