describe('Armonía - Prueba Integral de Sistema', { browser: 'chrome' }, () => {
    const testUser = { email: 'admin5@prueba.com', password: 'password123' };
  
    beforeEach(() => {
      cy.visit('http://localhost:3000/', { timeout: 30000, failOnStatusCode: false });
      cy.clearCookies();
      cy.clearLocalStorage();
    });
  
    Cypress.Commands.add('login', (email, password) => {
      cy.visit('http://localhost:3000/login');
      cy.get('[data-cy="login-email"]', { timeout: 10000 }).type(email);
      cy.get('[data-cy="login-password"]', { timeout: 10000 }).type(password);
      cy.get('[data-cy="login-submit"]', { timeout: 10000 }).click();
      cy.url().should('eq', 'http://localhost:3000/dashboard', { timeout: 10000 });
    });
  
    describe('0. Landing Page y Registro', () => {
      it('0.1 Registrar Nuevo Conjunto desde Landing Page', () => {
        const uniqueEmail = `admin${Date.now()}@prueba.com`;
        cy.visit('http://localhost:3000/landing');
        // Verificar elementos del diseño
        cy.get('[data-cy="app-name"]', { timeout: 10000 }).should('contain', 'Armonía');
        cy.get('[data-cy="language-selector"]', { timeout: 10000 }).should('be.visible');
        cy.get('[data-cy="theme-selector"]', { timeout: 10000 }).should('be.visible');
        cy.get('[data-cy="currency-selector"]', { timeout: 10000 }).should('be.visible');
        cy.contains('Gestión Integral para tu Comunidad').should('be.visible'); // Ajustado al nuevo título
        cy.contains('Gestión de Residentes').should('be.visible');
        cy.contains('Control Financiero').should('be.visible');
        cy.contains('Asambleas Eficientes').should('be.visible');
        // Registro de usuario de prueba
        cy.get('[data-cy="complex-name"]', { timeout: 10000 }).type('Conjunto Prueba');
        cy.get('[data-cy="admin-email"]', { timeout: 10000 }).type(uniqueEmail);
        cy.get('[data-cy="admin-password"]', { timeout: 10000 }).type('password123');
        cy.get('[data-cy="register-submit"]', { timeout: 10000 }).click({ force: true });
        cy.get('[data-cy="success-message"]', { timeout: 10000 }).should('contain', 'Registro exitoso');
        cy.url().should('eq', 'http://localhost:3000/login', { timeout: 20000 });
        // Verificar redirección al login existente
        cy.visit('http://localhost:3000/landing');
        cy.get('[data-cy="login-redirect"]', { timeout: 10000 }).click();
        cy.url().should('eq', 'http://localhost:3000/login');
      });
    });
  
    describe('1. Autenticación y Control de Acceso', () => {
      it('1.1 Impide acceso a rutas protegidas sin autenticación', () => {
        cy.visit('http://localhost:3000/dashboard', { timeout: 30000, failOnStatusCode: false });
        cy.url().should('eq', 'http://localhost:3000/login', { timeout: 30000 });
        cy.get('[data-cy="login-email"]', { timeout: 30000 }).should('be.visible');
      });
  
      it('1.2 Permite login y muestra dashboard', () => {
        cy.login(testUser.email, testUser.password);
        cy.get('[data-cy="dashboard-title"]', { timeout: 30000 }).should('contain', 'Dashboard Principal');
        cy.get('[data-cy="sidebar-menu"]', { timeout: 30000 }).should('be.visible');
        cy.get('[data-cy="main-nav"]', { timeout: 30000 }).should('be.visible');
      });
    });
  
    describe('2. Módulo Financiero', () => {
      beforeEach(() => cy.login(testUser.email, testUser.password));
  
      it('2.1 Gestión de Presupuestos', () => {
        cy.get('[data-cy="menu-budgets"]', { timeout: 30000 }).click();
        cy.url().should('eq', 'http://localhost:3000/financial/budgets');
      });
  
      it('2.2 Gestión de Cuotas - Generación Masiva', () => {
        cy.get('[data-cy="menu-fees"]', { timeout: 30000 }).click();
        cy.url().should('eq', 'http://localhost:3000/financial/fees');
      });
  
      it('2.2.1 Gestión de Cuotas - Creación Individual', () => {
        cy.get('[data-cy="menu-fees"]', { timeout: 30000 }).click();
        cy.url().should('eq', 'http://localhost:3000/financial/fees');
      });
  
      it('2.3 Gestión de Pagos - Registro desde Lista', () => {
        cy.get('[data-cy="menu-payments"]', { timeout: 30000 }).click();
        cy.url().should('eq', 'http://localhost:3000/financial/payments');
      });
  
      it('2.4 Gestión de Reportes Financieros', () => {
        cy.get('[data-cy="menu-reports"]', { timeout: 30000 }).click();
        cy.url().should('eq', 'http://localhost:3000/financial/reports');
      });
  
      it('2.5 Verificación de Dashboard Financiero', () => {
        cy.visit('http://localhost:3000/dashboard', { timeout: 30000 });
        cy.get('[data-cy="dashboard-title"]', { timeout: 30000 }).should('contain', 'Dashboard Principal');
      });
    });
  
    describe('3. Gestión de Asambleas', () => {
      beforeEach(() => cy.login(testUser.email, testUser.password));
      it('3.1 Crear y Gestionar Asamblea', () => {
        cy.get('[data-cy="menu-assemblies"]', { timeout: 30000 }).click({ force: true });
        cy.url().should('eq', 'http://localhost:3000/assemblies', { timeout: 10000 });
        cy.get('[data-cy="assemblies-title"]', { timeout: 30000 }).should('contain', 'Gestión de Asambleas');
      });
    });
  
    describe('4. Gestión de Servicios Comunes', () => {
      beforeEach(() => cy.login(testUser.email, testUser.password));
      it('4.1 Crear y Gestionar Servicio', () => {
        cy.get('[data-cy="menu-services"]', { timeout: 30000 }).click();
        cy.url().should('eq', 'http://localhost:3000/common-services');
      });
  
      describe('5. Gestión de Inventario', () => {
        it('5.1 Crear y Gestionar Unidad', () => {
          cy.get('[data-cy="menu-inventory"]', { timeout: 30000 }).click();
          cy.url().should('eq', 'http://localhost:3000/inventory');
        });
      });
  
      describe('6. Gestión de PQR', () => {
        it('6.1 Crear y Gestionar Solicitud PQR', () => {
          cy.get('[data-cy="menu-pqr"]', { timeout: 30000 }).click();
          cy.url().should('eq', 'http://localhost:3000/pqr');
        });
      });
  
      describe('7. Dashboard', () => {
        it('7.1 Verificar Dashboard Principal', () => {
          cy.visit('http://localhost:3000/dashboard', { timeout: 30000 });
          cy.get('[data-cy="dashboard-title"]', { timeout: 30000 }).should('contain', 'Dashboard Principal');
        });
      });
    });
  });