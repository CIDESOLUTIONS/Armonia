// Prueba para el panel de administrador de Armonía
describe('Panel de Administrador', () => {
  // Esta prueba necesita credenciales válidas para ser ejecutada
  // Desactivada hasta que tengamos las credenciales correctas
  
  // Esta función se ejecutaría antes de cada prueba para iniciar sesión como administrador
  const loginAsAdmin = () => {
    cy.visit('/login');
    cy.get('input[placeholder="Tu correo electrónico"]').type('admin@armonia.com');
    cy.get('input[placeholder="Tu contraseña"]').type('contraseña_correcta'); // Sustituir por la real
    cy.get('button').contains('Iniciar Sesión').click();
    
    // Esperar a que cargue el dashboard
    cy.url().should('include', '/dashboard');
  };

  // Las pruebas están desactivadas hasta tener las credenciales correctas
  it.skip('Debería mostrar el panel principal del administrador', () => {
    loginAsAdmin();
    
    // Verificar elementos del dashboard
    cy.contains('Dashboard').should('exist');
    
    // Verificar secciones principales según especificación
    cy.contains('Propiedades').should('exist');
    cy.contains('Residentes').should('exist');
    cy.contains('Asambleas').should('exist');
    cy.contains('Finanzas').should('exist');
    cy.contains('PQR').should('exist');
    cy.contains('Servicios').should('exist');
    
    // Verificar gráficos o widgets de resumen
    cy.contains('Estadísticas').should('exist');
  });

  it.skip('Debería navegar a la sección de propiedades', () => {
    loginAsAdmin();
    
    // Navegar a la sección de propiedades
    cy.contains('Propiedades').click();
    
    // Verificar que estamos en la página de propiedades
    cy.url().should('include', '/inventory/properties');
    
    // Verificar la tabla de propiedades
    cy.get('table').should('exist');
    
    // Verificar que hay opciones para agregar nuevas propiedades
    cy.contains('Nueva Propiedad').should('exist');
  });

  it.skip('Debería navegar a la sección de residentes', () => {
    loginAsAdmin();
    
    // Navegar a la sección de residentes
    cy.contains('Residentes').click();
    
    // Verificar que estamos en la página de residentes
    cy.url().should('include', '/inventory/residents');
    
    // Verificar la tabla de residentes
    cy.get('table').should('exist');
    
    // Verificar que hay opciones para agregar nuevos residentes
    cy.contains('Nuevo Residente').should('exist');
  });

  it.skip('Debería navegar a la sección de asambleas', () => {
    loginAsAdmin();
    
    // Navegar a la sección de asambleas
    cy.contains('Asambleas').click();
    
    // Verificar que estamos en la página de asambleas
    cy.url().should('include', '/assemblies');
    
    // Verificar la lista de asambleas
    cy.contains('Próximas Asambleas').should('exist');
    
    // Verificar opciones de gestión de asambleas
    cy.contains('Nueva Asamblea').should('exist');
  });

  it.skip('Debería navegar a la sección financiera', () => {
    loginAsAdmin();
    
    // Navegar a la sección financiera
    cy.contains('Finanzas').click();
    
    // Verificar que estamos en la página financiera
    cy.url().should('include', '/financial');
    
    // Verificar secciones financieras según especificación
    cy.contains('Presupuesto').should('exist');
    cy.contains('Cuotas').should('exist');
    cy.contains('Pagos').should('exist');
  });

  it.skip('Debería navegar a la sección de PQR', () => {
    loginAsAdmin();
    
    // Navegar a la sección de PQR
    cy.contains('PQR').click();
    
    // Verificar que estamos en la página de PQR
    cy.url().should('include', '/pqr');
    
    // Verificar la tabla de PQR
    cy.get('table').should('exist');
    
    // Verificar filtros o estados de PQR
    cy.contains('Abiertas').should('exist');
    cy.contains('En Proceso').should('exist');
    cy.contains('Resueltas').should('exist');
  });

  it.skip('Debería navegar a la sección de servicios', () => {
    loginAsAdmin();
    
    // Navegar a la sección de servicios
    cy.contains('Servicios').click();
    
    // Verificar que estamos en la página de servicios
    cy.url().should('include', '/services');
    
    // Verificar la lista de servicios
    cy.contains('Salón Comunal').should('exist');
    cy.contains('Piscina').should('exist');
    cy.contains('Cancha de Tenis').should('exist');
    cy.contains('Zona BBQ').should('exist');
    
    // Verificar opciones de gestión de servicios
    cy.contains('Nuevo Servicio').should('exist');
    cy.contains('Reservas').should('exist');
  });

  it.skip('Debería permitir cerrar sesión', () => {
    loginAsAdmin();
    
    // Hacer clic en el botón/menú de usuario
    cy.get('[aria-label="Menu de usuario"]').click();
    
    // Hacer clic en cerrar sesión
    cy.contains('Cerrar Sesión').click();
    
    // Verificar redirección a la página de login
    cy.url().should('include', '/login');
  });
});
