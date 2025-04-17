// Pruebas para el Módulo de Inventario del Administrador
describe('Módulo de Inventario', () => {
  beforeEach(() => {
    // Login como administrador antes de cada prueba
    cy.visit('/login');
    cy.get('input[name="email"]').type(Cypress.env('adminEmail'));
    cy.get('input[name="password"]').type(Cypress.env('adminPassword'));
    cy.contains('Iniciar Sesión').click();
    
    // Navegar al módulo de inventario
    cy.get('[data-testid="sidebar"]').contains('Inventario').click();
    
    // Esperar a que cargue la página de inventario
    cy.url().should('include', '/dashboard/inventory');
    cy.contains('Gestión de Inventario', { timeout: 10000 }).should('be.visible');
  });

  it('Debería mostrar las opciones principales del módulo de inventario', () => {
    // Verificar pestañas o secciones
    cy.contains('Propiedades').should('be.visible');
    cy.contains('Residentes').should('be.visible');
    cy.contains('Vehículos').should('be.visible');
    cy.contains('Mascotas').should('be.visible');
    cy.contains('Servicios').should('be.visible');
  });

  describe('Gestión de Propiedades', () => {
    beforeEach(() => {
      // Asegurar que estamos en la pestaña de propiedades
      cy.contains('Propiedades').click();
    });

    it('Debería mostrar la lista de propiedades', () => {
      // Verificar tabla o listado
      cy.get('[data-testid="properties-table"]').should('be.visible');
      
      // Verificar que existan registros
      cy.get('[data-testid="properties-table"] tbody tr').should('have.length.at.least', 1);
    });

    it('Debería permitir agregar una nueva propiedad', () => {
      // Clic en botón de agregar
      cy.contains('Agregar Propiedad').click();
      
      // Verificar formulario
      cy.get('[data-testid="property-form"]').should('be.visible');
      
      // Llenar formulario
      cy.get('input[name="propertyIdentifier"]').type('Casa 101');
      cy.get('input[name="area"]').type('120');
      cy.get('select[name="propertyType"]').select('Casa');
      
      // Enviar formulario
      cy.contains('Guardar').click();
      
      // Verificar mensaje de éxito
      cy.contains('Propiedad agregada correctamente').should('be.visible');
      
      // Verificar que aparezca en la lista
      cy.contains('Casa 101').should('be.visible');
    });

    it('Debería permitir editar una propiedad existente', () => {
      // Clic en botón de editar de la primera propiedad
      cy.get('[data-testid="edit-property-button"]').first().click();
      
      // Verificar formulario con datos cargados
      cy.get('[data-testid="property-form"]').should('be.visible');
      
      // Modificar datos
      cy.get('input[name="area"]').clear().type('150');
      
      // Enviar formulario
      cy.contains('Actualizar').click();
      
      // Verificar mensaje de éxito
      cy.contains('Propiedad actualizada correctamente').should('be.visible');
    });

    it('Debería permitir eliminar una propiedad', () => {
      // Obtener el nombre de la última propiedad para verificar después
      cy.get('[data-testid="properties-table"] tbody tr').last().find('td').first().invoke('text').as('lastPropertyName');
      
      // Clic en botón de eliminar de la última propiedad
      cy.get('[data-testid="delete-property-button"]').last().click();
      
      // Confirmar eliminación
      cy.contains('Confirmar').click();
      
      // Verificar mensaje de éxito
      cy.contains('Propiedad eliminada correctamente').should('be.visible');
      
      // Verificar que ya no aparezca en la lista
      cy.get('@lastPropertyName').then(propertyName => {
        cy.contains(propertyName).should('not.exist');
      });
    });
  });

  describe('Gestión de Residentes', () => {
    beforeEach(() => {
      // Asegurar que estamos en la pestaña de residentes
      cy.contains('Residentes').click();
    });

    it('Debería mostrar la lista de residentes', () => {
      // Verificar tabla o listado
      cy.get('[data-testid="residents-table"]').should('be.visible');
      
      // Verificar que existan registros
      cy.get('[data-testid="residents-table"] tbody tr').should('have.length.at.least', 1);
    });

    it('Debería permitir agregar un nuevo residente', () => {
      // Clic en botón de agregar
      cy.contains('Agregar Residente').click();
      
      // Verificar formulario
      cy.get('[data-testid="resident-form"]').should('be.visible');
      
      // Llenar formulario
      cy.get('input[name="name"]').type('Juan Pérez');
      cy.get('input[name="email"]').type('juan.perez@example.com');
      cy.get('input[name="identification"]').type('1234567890');
      cy.get('select[name="propertyId"]').select(1);
      
      // Enviar formulario
      cy.contains('Guardar').click();
      
      // Verificar mensaje de éxito
      cy.contains('Residente agregado correctamente').should('be.visible');
      
      // Verificar que aparezca en la lista
      cy.contains('Juan Pérez').should('be.visible');
    });
  });

  describe('Gestión de Vehículos', () => {
    beforeEach(() => {
      // Asegurar que estamos en la pestaña de vehículos
      cy.contains('Vehículos').click();
    });

    it('Debería mostrar la lista de vehículos', () => {
      // Verificar tabla o listado
      cy.get('[data-testid="vehicles-table"]').should('be.visible');
      
      // Verificar que existan registros
      cy.get('[data-testid="vehicles-table"] tbody tr').should('have.length.at.least', 1);
    });
  });

  describe('Gestión de Mascotas', () => {
    beforeEach(() => {
      // Asegurar que estamos en la pestaña de mascotas
      cy.contains('Mascotas').click();
    });

    it('Debería mostrar la lista de mascotas', () => {
      // Verificar tabla o listado
      cy.get('[data-testid="pets-table"]').should('be.visible');
      
      // Verificar que existan registros
      cy.get('[data-testid="pets-table"] tbody tr').should('have.length.at.least', 1);
    });
  });

  describe('Gestión de Servicios', () => {
    beforeEach(() => {
      // Asegurar que estamos en la pestaña de servicios
      cy.contains('Servicios').click();
    });

    it('Debería mostrar la lista de servicios comunes', () => {
      // Verificar tabla o listado
      cy.get('[data-testid="services-table"]').should('be.visible');
      
      // Verificar que existan registros
      cy.get('[data-testid="services-table"] tbody tr').should('have.length.at.least', 1);
    });

    it('Debería permitir agregar un nuevo servicio', () => {
      // Clic en botón de agregar
      cy.contains('Agregar Servicio').click();
      
      // Verificar formulario
      cy.get('[data-testid="service-form"]').should('be.visible');
      
      // Llenar formulario
      cy.get('input[name="name"]').type('Cancha de Pádel');
      cy.get('input[name="rate"]').type('3');
      cy.get('input[name="timeUnit"]').type('hora');
      cy.get('input[name="capacity"]').type('4');
      
      // Enviar formulario
      cy.contains('Guardar').click();
      
      // Verificar mensaje de éxito
      cy.contains('Servicio agregado correctamente').should('be.visible');
      
      // Verificar que aparezca en la lista
      cy.contains('Cancha de Pádel').should('be.visible');
    });
  });
});
