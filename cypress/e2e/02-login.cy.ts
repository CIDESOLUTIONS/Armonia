// Prueba para la página de inicio de sesión
describe('Página de Inicio de Sesión', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('Debería mostrar el formulario de inicio de sesión', () => {
    cy.contains('Iniciar Sesión').should('exist');
    cy.get('input[placeholder="Tu correo electrónico"]').should('exist');
    cy.get('input[placeholder="Tu contraseña"]').should('exist');
    cy.get('button').contains('Iniciar Sesión').should('exist');
    
    // Verificar enlace para recuperar contraseña
    cy.contains('Volver al inicio').should('exist');
  });

  it('Debería validar los campos requeridos', () => {
    // Intentar enviar el formulario sin completar los campos
    cy.get('button').contains('Iniciar Sesión').click();
      
    // Verificar mensajes de error para campos requeridos
    cy.contains('El correo electrónico es requerido').should('exist');
    cy.contains('La contraseña es requerida').should('exist');
  });

  it('Debería mostrar error al ingresar credenciales inválidas', () => {
    cy.get('input[placeholder="Tu correo electrónico"]').type('usuario_inexistente@test.com');
    cy.get('input[placeholder="Tu contraseña"]').type('ContraseñaIncorrecta123!');
    cy.get('button').contains('Iniciar Sesión').click();
    
    // Verificar mensaje de error
    cy.contains('Credenciales inválidas', { timeout: 10000 }).should('exist');
  });

  it('Debería iniciar sesión correctamente como administrador', () => {
    // Usar credenciales de un administrador existente
    cy.get('input[placeholder="Tu correo electrónico"]').type('admin@armonia.com');
    cy.get('input[placeholder="Tu contraseña"]').type('password123');
    cy.get('button').contains('Iniciar Sesión').click();
    
    // Verificar redirección al dashboard del administrador
    cy.url().should('include', '/dashboard', { timeout: 10000 });
    
    // Verificar elementos del dashboard del administrador
    cy.contains('Dashboard', { timeout: 10000 }).should('exist');
    
    // Cerrar sesión para limpiar el estado
    cy.contains('Cerrar Sesión', { timeout: 10000 }).click();
    cy.url().should('include', '/login');
  });

  it('Debería iniciar sesión correctamente como residente', () => {
    // Usar credenciales de un residente existente
    cy.get('input[placeholder="Tu correo electrónico"]').type('resident@example.com');
    cy.get('input[placeholder="Tu contraseña"]').type('password123');
    cy.get('button').contains('Iniciar Sesión').click();
    
    // Verificar redirección al dashboard del residente
    cy.url().should('include', '/resident', { timeout: 10000 });
    
    // Verificar elementos del dashboard del residente
    cy.contains('Mi Dashboard', { timeout: 10000 }).should('exist');
    
    // Cerrar sesión para limpiar el estado
    cy.contains('Cerrar Sesión', { timeout: 10000 }).click();
    cy.url().should('include', '/login');
  });

  it('Debería iniciar sesión correctamente como personal de recepción', () => {
    // Usar credenciales de un personal de recepción existente
    cy.get('input[placeholder="Tu correo electrónico"]').type('staff@example.com');
    cy.get('input[placeholder="Tu contraseña"]').type('password123');
    cy.get('button').contains('Iniciar Sesión').click();
    
    // Verificar redirección al dashboard de recepción
    cy.url().should('include', '/reception', { timeout: 10000 });
    
    // Verificar elementos del dashboard de recepción
    cy.contains('Panel de Recepción', { timeout: 10000 }).should('exist');
    
    // Cerrar sesión para limpiar el estado
    cy.contains('Cerrar Sesión', { timeout: 10000 }).click();
    cy.url().should('include', '/login');
  });

  it('Debería poder volver al inicio desde el login', () => {
    cy.contains('Volver al inicio').click();
    
    // Verificar redirección a la página principal
    cy.url().should('not.include', '/login');
    cy.contains('Gestión integral para conjuntos residenciales').should('exist');
  });
});
