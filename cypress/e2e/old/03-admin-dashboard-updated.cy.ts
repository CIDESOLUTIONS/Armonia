// Prueba actualizada para el panel de administrador
describe('Panel de Administrador', () => {
  beforeEach(() => {
    // Usar el comando personalizado para iniciar sesión como administrador
    cy.login('admin');
  });

  it('Debería mostrar el dashboard principal con estadísticas y accesos rápidos', () => {
    // Verificar elementos clave del dashboard
    cy.contains('Dashboard').should('exist');
    cy.contains('Estadísticas Generales').should('exist');
    
    // Verificar que existen las tarjetas de estadísticas
    cy.get('[data-cy="stats-card"]').should('have.length.at.least', 3);
    
    // Verificar que existe la sección de accesos rápidos
    cy.contains('Accesos Rápidos').should('exist');
    cy.get('[data-cy="quick-access"]').find('a').should('have.length.at.least', 3);
  });

  it('Debería permitir navegar a todas las secciones principales', () => {
    // Verificar que existen todas las secciones en el menú lateral
    const secciones = [
      'Dashboard',
      'Inventario',
      'Asambleas',
      'Finanzas',
      'Servicios',
      'PQR',
      'Comunicaciones',
      'Configuración'
    ];
    
    secciones.forEach(seccion => {
      cy.contains(seccion).should('exist');
    });
    
    // Navegar a cada sección y verificar que carga correctamente
    secciones.forEach(seccion => {
      cy.contains(seccion).click();
      cy.contains(`Gestión de ${seccion}`).should('exist');
    });
  });

  describe('Módulo de Inventario', () => {
    beforeEach(() => {
      cy.contains('Inventario').click();
    });
    
    it('Debería mostrar la lista de propiedades', () => {
      cy.contains('Propiedades').click();
      cy.get('table').should('exist');
      cy.get('table tbody tr').should('have.length.at.least', 1);
    });
    
    it('Debería mostrar la lista de residentes', () => {
      cy.contains('Residentes').click();
      cy.get('table').should('exist');
      cy.get('table tbody tr').should('have.length.at.least', 1);
    });
    
    it('Debería mostrar la lista de vehículos', () => {
      cy.contains('Vehículos').click();
      cy.get('table').should('exist');
      cy.get('table tbody tr').should('have.length.at.least', 1);
    });
    
    it('Debería mostrar la lista de mascotas', () => {
      cy.contains('Mascotas').click();
      cy.get('table').should('exist');
      cy.get('table tbody tr').should('have.length.at.least', 1);
    });
  });

  describe('Módulo de Asambleas', () => {
    beforeEach(() => {
      cy.contains('Asambleas').click();
    });
    
    it('Debería mostrar el calendario de asambleas', () => {
      cy.contains('Calendario').click();
      cy.contains('Próximas Asambleas').should('exist');
    });
    
    it('Debería mostrar la sección de votaciones', () => {
      cy.contains('Votaciones').click();
      cy.contains('Votaciones Activas').should('exist');
    });
    
    it('Debería mostrar el historial de documentos', () => {
      cy.contains('Documentos').click();
      cy.contains('Actas y Documentos').should('exist');
    });
  });

  describe('Módulo Financiero', () => {
    beforeEach(() => {
      cy.contains('Finanzas').click();
    });
    
    it('Debería mostrar el resumen financiero', () => {
      cy.contains('Resumen').click();
      cy.contains('Resumen Financiero').should('exist');
    });
    
    it('Debería mostrar la sección de cuotas', () => {
      cy.contains('Cuotas').click();
      cy.contains('Gestión de Cuotas').should('exist');
    });
    
    it('Debería mostrar el registro de pagos', () => {
      cy.contains('Pagos').click();
      cy.contains('Registro de Pagos').should('exist');
    });
    
    it('Debería mostrar los reportes financieros', () => {
      cy.contains('Reportes').click();
      cy.contains('Reportes Financieros').should('exist');
    });
  });

  describe('Módulo de Servicios Comunes', () => {
    beforeEach(() => {
      cy.contains('Servicios').click();
    });
    
    it('Debería mostrar la lista de servicios disponibles', () => {
      cy.contains('Catálogo').click();
      cy.contains('Servicios Disponibles').should('exist');
      cy.get('table').should('exist');
      cy.get('table tbody tr').should('have.length.at.least', 1);
    });
    
    it('Debería mostrar el calendario de reservas', () => {
      cy.contains('Reservas').click();
      cy.contains('Calendario de Reservas').should('exist');
    });
    
    it('Debería permitir configurar los servicios', () => {
      cy.contains('Configuración').click();
      cy.contains('Configuración de Servicios').should('exist');
    });
  });

  describe('Módulo de PQR', () => {
    beforeEach(() => {
      cy.contains('PQR').click();
    });
    
    it('Debería mostrar las solicitudes activas', () => {
      cy.contains('Activas').click();
      cy.contains('Solicitudes Activas').should('exist');
      cy.get('table').should('exist');
    });
    
    it('Debería mostrar el histórico de solicitudes', () => {
      cy.contains('Histórico').click();
      cy.contains('Histórico de Solicitudes').should('exist');
    });
    
    it('Debería mostrar estadísticas de PQR', () => {
      cy.contains('Estadísticas').click();
      cy.contains('Estadísticas de PQR').should('exist');
      cy.get('canvas').should('exist');
    });
  });

  describe('Módulo de Comunicaciones', () => {
    beforeEach(() => {
      cy.contains('Comunicaciones').click();
    });
    
    it('Debería mostrar los anuncios', () => {
      cy.contains('Anuncios').click();
      cy.contains('Gestión de Anuncios').should('exist');
    });
    
    it('Debería mostrar la mensajería interna', () => {
      cy.contains('Mensajes').click();
      cy.contains('Mensajería Interna').should('exist');
    });
    
    it('Debería mostrar el calendario de eventos', () => {
      cy.contains('Eventos').click();
      cy.contains('Calendario de Eventos').should('exist');
    });
  });

  describe('Módulo de Configuración', () => {
    beforeEach(() => {
      cy.contains('Configuración').click();
    });
    
    it('Debería mostrar la configuración general', () => {
      cy.contains('General').click();
      cy.contains('Configuración General').should('exist');
    });
    
    it('Debería mostrar la gestión de usuarios', () => {
      cy.contains('Usuarios').click();
      cy.contains('Gestión de Usuarios').should('exist');
      cy.get('table').should('exist');
    });
    
    it('Debería mostrar las copias de seguridad', () => {
      cy.contains('Respaldos').click();
      cy.contains('Copias de Seguridad').should('exist');
    });
  });

  // Prueba de funcionalidad completa: crear un nuevo residente
  it('Debería permitir crear un nuevo residente', () => {
    // Navegar al módulo de inventario
    cy.contains('Inventario').click();
    cy.contains('Residentes').click();
    
    // Hacer clic en el botón para agregar un nuevo residente
    cy.contains('Agregar Residente').click();
    
    // Completar el formulario
    cy.fixture('example.json').then((testData) => {
      const residentData = testData.residents.adult;
      const timestamp = Date.now();
      
      cy.get('input[name="name"]').type(residentData.name + ' ' + timestamp);
      cy.get('input[name="identification"]').type(timestamp);
      cy.get('input[name="email"]').type(`test${timestamp}@example.com`);
      cy.get('select[name="property"]').select(1);
      cy.get('select[name="relationshipType"]').select('Propietario');
      
      // Guardar el formulario
      cy.contains('Guardar').click();
      
      // Verificar mensaje de éxito
      cy.contains('Residente creado correctamente').should('exist');
      
      // Verificar que aparece en la tabla
      cy.contains(residentData.name + ' ' + timestamp).should('exist');
    });
  });
  
  // Verificar que podemos cerrar la sesión correctamente
  it('Debería permitir cerrar sesión', () => {
    // Hacer clic en el menú de usuario
    cy.get('[data-cy="user-menu"]').click();
    
    // Hacer clic en cerrar sesión
    cy.contains('Cerrar Sesión').click();
    
    // Verificar redirección a la página de login
    cy.url().should('include', '/login');
  });
});