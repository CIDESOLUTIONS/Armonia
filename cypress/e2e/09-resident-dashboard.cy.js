// Pruebas para el Dashboard del Residente
describe('Dashboard del Residente', () => {
  beforeEach(() => {
    // Login como residente antes de cada prueba
    cy.visit('/login');
    cy.get('input[name="email"]').type(Cypress.env('residentEmail'));
    cy.get('input[name="password"]').type(Cypress.env('residentPassword'));
    cy.contains('Iniciar Sesión').click();
    
    // Esperar a que cargue el dashboard de residente
    cy.url().should('include', '/resident');
    cy.contains('Mi Dashboard', { timeout: 10000 }).should('be.visible');
  });

  it('Debería mostrar los componentes principales del dashboard', () => {
    // Verificar la existencia del sidebar
    cy.get('[data-testid="sidebar"]').should('be.visible');
    
    // Verificar la existencia del header
    cy.get('[data-testid="header"]').should('be.visible');
    
    // Verificar el contenido principal
    cy.get('main').should('be.visible');
  });

  it('Debería mostrar información relevante del residente', () => {
    // Verificar tarjetas con información principal
    cy.contains('Mi Propiedad').should('be.visible');
    cy.contains('Estado de Cuenta').should('be.visible');
    cy.contains('Próximos Eventos').should('be.visible');
    cy.contains('Mis PQR').should('be.visible');
  });

  it('Debería mostrar el estado de cuenta con cuotas pendientes', () => {
    // Verificar sección de estado de cuenta
    cy.contains('Estado de Cuenta').scrollIntoView();
    
    // Verificar que existan cuotas listadas
    cy.get('[data-testid="pending-fees"]').should('be.visible');
    
    // Verificar información de saldo
    cy.contains('Saldo Actual').should('be.visible');
  });

  it('Debería permitir navegar a la sección de pagos', () => {
    // Clic en la opción del menú
    cy.get('[data-testid="sidebar"]').contains('Pagos').click();
    
    // Verificar la navegación
    cy.url().should('include', '/resident/payments');
    cy.contains('Mis Pagos').should('be.visible');
    
    // Verificar elementos de la página de pagos
    cy.contains('Historial de Pagos').should('be.visible');
    cy.contains('Pagos Pendientes').should('be.visible');
  });

  it('Debería permitir navegar a la sección de reservas', () => {
    // Clic en la opción del menú
    cy.get('[data-testid="sidebar"]').contains('Reservas').click();
    
    // Verificar la navegación
    cy.url().should('include', '/resident/reservations');
    cy.contains('Reserva de Servicios').should('be.visible');
    
    // Verificar elementos de la página de reservas
    cy.contains('Servicios Disponibles').should('be.visible');
    cy.contains('Mis Reservas').should('be.visible');
  });

  it('Debería permitir navegar a la sección de asambleas', () => {
    // Clic en la opción del menú
    cy.get('[data-testid="sidebar"]').contains('Asambleas').click();
    
    // Verificar la navegación
    cy.url().should('include', '/resident/assemblies');
    cy.contains('Asambleas').should('be.visible');
    
    // Verificar elementos de la página de asambleas
    cy.contains('Próximas Asambleas').should('be.visible');
    cy.contains('Historial de Asambleas').should('be.visible');
  });

  it('Debería permitir navegar a la sección de PQR', () => {
    // Clic en la opción del menú
    cy.get('[data-testid="sidebar"]').contains('PQR').click();
    
    // Verificar la navegación
    cy.url().should('include', '/resident/pqr');
    cy.contains('Peticiones, Quejas y Reclamos').should('be.visible');
    
    // Verificar elementos de la página de PQR
    cy.contains('Nuevo PQR').should('be.visible');
    cy.contains('Mis PQR').should('be.visible');
  });

  it('Debería permitir acceder a mi perfil', () => {
    // Clic en el menú de usuario
    cy.get('[data-testid="user-menu"]').click();
    
    // Clic en la opción de Mi Perfil
    cy.contains('Mi Perfil').click();
    
    // Verificar navegación
    cy.url().should('include', '/resident/profile');
    cy.contains('Mi Perfil').should('be.visible');
    
    // Verificar información del perfil
    cy.contains('Información Personal').should('be.visible');
    cy.contains('Cambiar Contraseña').should('be.visible');
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
