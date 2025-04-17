// Pruebas para el Dashboard del Administrador
describe('Dashboard del Administrador', () => {
  beforeEach(() => {
    // Login como administrador antes de cada prueba
    cy.visit('/login');
    cy.get('input[name="email"]').type(Cypress.env('adminEmail'));
    cy.get('input[name="password"]').type(Cypress.env('adminPassword'));
    cy.contains('Iniciar Sesión').click();
    
    // Esperar a que cargue el dashboard
    cy.url().should('include', '/dashboard');
    cy.contains('Dashboard', { timeout: 10000 }).should('be.visible');
  });

  it('Debería mostrar los componentes principales del dashboard', () => {
    // Verificar la existencia del sidebar
    cy.get('[data-testid="sidebar"]').should('be.visible');
    
    // Verificar la existencia del header
    cy.get('[data-testid="header"]').should('be.visible');
    
    // Verificar el contenido principal
    cy.get('main').should('be.visible');
  });

  it('Debería mostrar las tarjetas con estadísticas principales', () => {
    // Verificar las tarjetas de estadísticas
    cy.contains('Total Unidades').should('be.visible');
    cy.contains('Residentes').should('be.visible');
    cy.contains('Recaudación').should('be.visible');
    cy.contains('PQR Activos').should('be.visible');
  });

  it('Debería mostrar gráficos con información del conjunto', () => {
    // Verificar la existencia de gráficos
    cy.get('[data-testid="chart-container"]').should('have.length.at.least', 1);
  });

  it('Debería mostrar notificaciones recientes', () => {
    // Verificar la sección de notificaciones
    cy.contains('Notificaciones Recientes').should('be.visible');
    cy.get('[data-testid="notifications-list"]').should('be.visible');
  });

  it('Debería permitir navegar a la sección de inventario', () => {
    // Clic en la opción del menú
    cy.get('[data-testid="sidebar"]').contains('Inventario').click();
    
    // Verificar la navegación
    cy.url().should('include', '/dashboard/inventory');
    cy.contains('Gestión de Inventario').should('be.visible');
  });

  it('Debería permitir navegar a la sección de asambleas', () => {
    // Clic en la opción del menú
    cy.get('[data-testid="sidebar"]').contains('Asambleas').click();
    
    // Verificar la navegación
    cy.url().should('include', '/dashboard/assemblies');
    cy.contains('Gestión de Asambleas').should('be.visible');
  });

  it('Debería permitir navegar a la sección financiera', () => {
    // Clic en la opción del menú
    cy.get('[data-testid="sidebar"]').contains('Financiero').click();
    
    // Verificar la navegación
    cy.url().should('include', '/dashboard/financial');
    cy.contains('Gestión Financiera').should('be.visible');
  });

  it('Debería permitir navegar a la sección de PQR', () => {
    // Clic en la opción del menú
    cy.get('[data-testid="sidebar"]').contains('PQR').click();
    
    // Verificar la navegación
    cy.url().should('include', '/dashboard/pqr');
    cy.contains('Peticiones, Quejas y Reclamos').should('be.visible');
  });

  it('Debería permitir acceder a la configuración', () => {
    // Clic en la opción del menú
    cy.get('[data-testid="sidebar"]').contains('Configuración').click();
    
    // Verificar la navegación
    cy.url().should('include', '/dashboard/config');
    cy.contains('Configuración del Conjunto').should('be.visible');
  });

  it('Debería permitir cerrar sesión', () => {
    // Clic en el menú de usuario
    cy.get('[data-testid="user-menu"]').click();
    
    // Clic en la opción de cerrar sesión
    cy.contains('Cerrar Sesión').click();
    
    // Verificar redirección al login
    cy.url().should('include', '/login');
  });
});
