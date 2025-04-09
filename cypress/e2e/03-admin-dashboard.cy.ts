// Prueba para el panel de administrador
describe('Panel de Administrador', () => {
  beforeEach(() => {
    // Iniciar sesión como administrador antes de cada prueba
    cy.visit('/login');
    cy.get('form').within(() => {
      cy.get('input[name="email"]').type('admin@armonia.com');
      cy.get('input[name="password"]').type('password123');
      cy.get('button[type="submit"]').click();
    });
    
    // Verificar que estamos en el dashboard
    cy.url().should('include', '/dashboard');
  });

  afterEach(() => {
    // Cerrar sesión después de cada prueba
    cy.contains('Cerrar Sesión').click();
    cy.url().should('include', '/login');
  });

  it('Debería mostrar el panel de control principal', () => {
    // Verificar elementos del dashboard
    cy.contains('Dashboard').should('be.visible');
    cy.contains('Conjunto Residencial Casas del Bosque').should('be.visible');
    
    // Verificar widgets del dashboard
    cy.contains('Propiedades').should('be.visible');
    cy.contains('Residentes').should('be.visible');
    cy.contains('Pagos Pendientes').should('be.visible');
    cy.contains('Próximas Asambleas').should('be.visible');
  });

  it('Debería navegar a la sección de gestión de propiedades', () => {
    // Hacer clic en el menú de Inventario
    cy.contains('Inventario').click();
    cy.contains('Propiedades').click();
    
    // Verificar que estamos en la página de propiedades
    cy.url().should('include', '/dashboard/inventory/properties');
    
    // Verificar elementos de la página de propiedades
    cy.contains('Listado de Propiedades').should('be.visible');
    cy.get('table').should('be.visible');
    cy.contains('Casa 1').should('be.visible');
  });

  it('Debería mostrar detalles de una propiedad', () => {
    // Navegar a propiedades
    cy.contains('Inventario').click();
    cy.contains('Propiedades').click();
    
    // Ver detalles de la primera propiedad
    cy.contains('Ver').first().click();
    
    // Verificar que estamos en la página de detalles
    cy.url().should('include', '/dashboard/inventory/properties/');
    
    // Verificar elementos de la página de detalles
    cy.contains('Detalles de la Propiedad').should('be.visible');
    cy.contains('Información General').should('be.visible');
    cy.contains('Residentes').should('be.visible');
    cy.contains('Vehículos').should('be.visible');
    cy.contains('Mascotas').should('be.visible');
  });

  it('Debería navegar a la sección de residentes', () => {
    // Hacer clic en el menú de Inventario
    cy.contains('Inventario').click();
    cy.contains('Residentes').click();
    
    // Verificar que estamos en la página de residentes
    cy.url().should('include', '/dashboard/inventory/residents');
    
    // Verificar elementos de la página de residentes
    cy.contains('Listado de Residentes').should('be.visible');
    cy.get('table').should('be.visible');
  });

  it('Debería navegar a la sección de vehículos', () => {
    // Hacer clic en el menú de Inventario
    cy.contains('Inventario').click();
    cy.contains('Vehículos').click();
    
    // Verificar que estamos en la página de vehículos
    cy.url().should('include', '/dashboard/inventory/vehicles');
    
    // Verificar elementos de la página de vehículos
    cy.contains('Listado de Vehículos').should('be.visible');
    cy.get('table').should('be.visible');
  });

  it('Debería navegar a la sección de mascotas', () => {
    // Hacer clic en el menú de Inventario
    cy.contains('Inventario').click();
    cy.contains('Mascotas').click();
    
    // Verificar que estamos en la página de mascotas
    cy.url().should('include', '/dashboard/inventory/pets');
    
    // Verificar elementos de la página de mascotas
    cy.contains('Listado de Mascotas').should('be.visible');
    cy.get('table').should('be.visible');
  });

  it('Debería navegar a la sección de servicios comunes', () => {
    // Hacer clic en el menú de Servicios
    cy.contains('Servicios').click();
    
    // Verificar que estamos en la página de servicios
    cy.url().should('include', '/dashboard/services');
    
    // Verificar elementos de la página de servicios
    cy.contains('Servicios Comunes').should('be.visible');
    cy.contains('Salón Comunal').should('be.visible');
    cy.contains('Piscina').should('be.visible');
    cy.contains('Cancha de Tenis').should('be.visible');
    cy.contains('Zona BBQ').should('be.visible');
  });

  it('Debería gestionar reservas de servicios', () => {
    // Navegar a servicios
    cy.contains('Servicios').click();
    
    // Ir a la sección de reservas
    cy.contains('Reservas').click();
    
    // Verificar que estamos en la página de reservas
    cy.url().should('include', '/dashboard/services/reservations');
    
    // Verificar elementos de la página de reservas
    cy.contains('Gestión de Reservas').should('be.visible');
    cy.get('table').should('be.visible');
    
    // Verificar filtros de reservas
    cy.contains('Filtrar por servicio').should('be.visible');
    cy.contains('Filtrar por estado').should('be.visible');
  });

  it('Debería navegar a la sección de asambleas', () => {
    // Hacer clic en el menú de Asambleas
    cy.contains('Asambleas').click();
    
    // Verificar que estamos en la página de asambleas
    cy.url().should('include', '/dashboard/assemblies');
    
    // Verificar elementos de la página de asambleas
    cy.contains('Gestión de Asambleas').should('be.visible');
    cy.contains('Programación').should('be.visible');
    cy.contains('Asistencia').should('be.visible');
    cy.contains('Votaciones').should('be.visible');
    cy.contains('Documentos').should('be.visible');
  });

  it('Debería ver el detalle de una asamblea', () => {
    // Navegar a asambleas
    cy.contains('Asambleas').click();
    
    // Ver detalles de la primera asamblea
    cy.contains('Asamblea Ordinaria Anual 2025').click();
    
    // Verificar que estamos en la página de detalles
    cy.url().should('include', '/dashboard/assemblies/');
    
    // Verificar elementos de la página de detalles
    cy.contains('Asamblea Ordinaria Anual 2025').should('be.visible');
    cy.contains('Información General').should('be.visible');
    cy.contains('Asistencia').should('be.visible');
    cy.contains('Agenda').should('be.visible');
    cy.contains('Quórum').should('be.visible');
  });

  it('Debería navegar a la sección financiera', () => {
    // Hacer clic en el menú de Finanzas
    cy.contains('Finanzas').click();
    
    // Verificar que estamos en la página de finanzas
    cy.url().should('include', '/dashboard/financial');
    
    // Verificar elementos de la página de finanzas
    cy.contains('Gestión Financiera').should('be.visible');
    cy.contains('Presupuesto').should('be.visible');
    cy.contains('Cuotas').should('be.visible');
    cy.contains('Pagos').should('be.visible');
    cy.contains('Reportes').should('be.visible');
  });

  it('Debería gestionar cuotas', () => {
    // Navegar a finanzas
    cy.contains('Finanzas').click();
    
    // Ir a la sección de cuotas
    cy.contains('Cuotas').click();
    
    // Verificar que estamos en la página de cuotas
    cy.url().should('include', '/dashboard/financial/fees');
    
    // Verificar elementos de la página de cuotas
    cy.contains('Gestión de Cuotas').should('be.visible');
    cy.get('table').should('be.visible');
    cy.contains('Cuota de administración').should('be.visible');
    cy.contains('ORDINARY').should('be.visible');
    cy.contains('EXTRAORDINARY').should('be.visible');
  });

  it('Debería navegar a la sección de PQR', () => {
    // Hacer clic en el menú de PQR
    cy.contains('PQR').click();
    
    // Verificar que estamos en la página de PQR
    cy.url().should('include', '/dashboard/pqr');
    
    // Verificar elementos de la página de PQR
    cy.contains('Peticiones, Quejas y Reclamos').should('be.visible');
    cy.get('table').should('be.visible');
    cy.contains('PETICION').should('be.visible');
    cy.contains('QUEJA').should('be.visible');
    cy.contains('RECLAMO').should('be.visible');
  });

  it('Debería gestionar proyectos', () => {
    // Navegar a proyectos
    cy.contains('Proyectos').click();
    
    // Verificar que estamos en la página de proyectos
    cy.url().should('include', '/dashboard/projects');
    
    // Verificar elementos de la página de proyectos
    cy.contains('Gestión de Proyectos').should('be.visible');
    cy.contains('Construcción Cancha de Pádel').should('be.visible');
    cy.contains('Renovación y Pintura de Fachadas').should('be.visible');
    cy.contains('IN_PROGRESS').should('be.visible');
    cy.contains('PLANNED').should('be.visible');
  });

  it('Debería navegar a la sección de configuración', () => {
    // Hacer clic en el menú de Configuración
    cy.contains('Configuración').click();
    
    // Verificar que estamos en la página de configuración
    cy.url().should('include', '/dashboard/config');
    
    // Verificar elementos de la página de configuración
    cy.contains('Configuración del Conjunto').should('be.visible');
    cy.contains('Información Básica').should('be.visible');
    cy.contains('Usuarios').should('be.visible');
    cy.contains('Personalización').should('be.visible');
  });
});
