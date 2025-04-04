// cypress/e2e/auth-test.cy.ts

describe('Sistema de Autenticación', () => {
  const testUser = { email: 'admin5@prueba.com', password: 'password123' };
  
  beforeEach(() => {
    cy.visit('http://localhost:3000/login', { timeout: 30000, failOnStatusCode: false });
    cy.clearCookies();
    cy.clearLocalStorage();
  });
  
  it('Debe mostrar errores cuando los campos están vacíos', () => {
    cy.get('button[type="submit"]').click();
    cy.contains('Por favor, completa todos los campos').should('be.visible');
  });
  
  it('Debe mostrar error con credenciales incorrectas', () => {
    cy.get('input[type="email"]').type('usuario_inexistente@test.com');
    cy.get('input[type="password"]').type('contraseña_incorrecta');
    cy.get('button[type="submit"]').click();
    cy.contains('Credenciales inválidas').should('be.visible');
  });
  
  it('Debe iniciar sesión correctamente y redireccionar al dashboard', () => {
    cy.get('input[type="email"]').type(testUser.email);
    cy.get('input[type="password"]').type(testUser.password);
    cy.get('button[type="submit"]').click();
    
    // Verificar redirección al dashboard
    cy.url().should('include', '/dashboard', { timeout: 10000 });
    
    // Verificar que los elementos del dashboard estén visibles
    cy.contains('Dashboard').should('be.visible');
    cy.contains('Bienvenido').should('be.visible');
    
    // Verificar que la información de usuario se guarda correctamente
    cy.window().then((win) => {
      const token = win.localStorage.getItem('token');
      const user = JSON.parse(win.localStorage.getItem('user') || '{}');
      
      expect(token).to.exist;
      expect(user).to.have.property('email', testUser.email);
      expect(user).to.have.property('role');
      expect(user).to.have.property('name');
    });
  });
  
  it('Debe cerrar sesión correctamente', () => {
    // Inicio de sesión
    cy.get('input[type="email"]').type(testUser.email);
    cy.get('input[type="password"]').type(testUser.password);
    cy.get('button[type="submit"]').click();
    
    // Esperar a que cargue el dashboard
    cy.url().should('include', '/dashboard', { timeout: 10000 });
    
    // Buscar y hacer clic en el botón de cerrar sesión
    cy.contains('Cerrar Sesión').click();
    
    // Verificar redirección a la página de login
    cy.url().should('include', '/login');
    
    // Verificar que se hayan eliminado los datos de autenticación
    cy.window().then((win) => {
      const token = win.localStorage.getItem('token');
      const user = win.localStorage.getItem('user');
      
      expect(token).to.be.null;
      expect(user).to.be.null;
    });
  });
  
  it('Debe impedir acceso a rutas protegidas sin autenticación', () => {
    // Intentar acceder al dashboard sin estar autenticado
    cy.visit('http://localhost:3000/dashboard', { timeout: 30000, failOnStatusCode: false });
    
    // Verificar redirección a login
    cy.url().should('include', '/login');
  });
});
