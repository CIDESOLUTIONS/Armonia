// Pruebas para el Módulo de Configuración del Administrador
describe('Módulo de Configuración', () => {
  beforeEach(() => {
    // Login como administrador antes de cada prueba
    cy.visit('/login');
    cy.get('input[name="email"]').type(Cypress.env('adminEmail'));
    cy.get('input[name="password"]').type(Cypress.env('adminPassword'));
    cy.contains('Iniciar Sesión').click();
    
    // Navegar al módulo de configuración
    cy.get('[data-testid="sidebar"]').contains('Configuración').click();
    
    // Esperar a que cargue la página de configuración
    cy.url().should('include', '/dashboard/config');
    cy.contains('Configuración del Conjunto', { timeout: 10000 }).should('be.visible');
  });

  it('Debería mostrar las secciones principales de configuración', () => {
    // Verificar secciones
    cy.contains('Información Básica').should('be.visible');
    cy.contains('Usuarios y Permisos').should('be.visible');
    cy.contains('Notificaciones').should('be.visible');
    cy.contains('Apariencia').should('be.visible');
    cy.contains('Integración').should('be.visible');
  });

  describe('Configuración de Información Básica', () => {
    beforeEach(() => {
      // Asegurar que estamos en la sección de información básica
      cy.contains('Información Básica').click();
    });

    it('Debería mostrar el formulario de información básica', () => {
      // Verificar formulario
      cy.get('[data-testid="basic-info-form"]').should('be.visible');
      
      // Verificar campos
      cy.get('input[name="complexName"]').should('be.visible');
      cy.get('input[name="adminName"]').should('be.visible');
      cy.get('input[name="adminEmail"]').should('be.visible');
      cy.get('input[name="adminPhone"]').should('be.visible');
      cy.get('input[name="address"]').should('be.visible');
      cy.get('input[name="city"]').should('be.visible');
      cy.get('select[name="country"]').should('be.visible');
    });

    it('Debería permitir actualizar la información básica', () => {
      // Llenar formulario
      cy.get('input[name="complexName"]').clear().type('Conjunto Residencial Armonía');
      cy.get('input[name="adminPhone"]').clear().type('3102223344');
      cy.get('input[name="address"]').clear().type('Calle 123 # 45-67');
      cy.get('input[name="city"]').clear().type('Bogotá');
      
      // Guardar cambios
      cy.contains('Guardar Cambios').click();
      
      // Verificar mensaje de éxito
      cy.contains('Información actualizada correctamente').should('be.visible');
    });

    it('Debería permitir subir el logo del conjunto', () => {
      // Verificar sección de logo
      cy.contains('Logo del Conjunto').should('be.visible');
      
      // Simular carga de archivo
      cy.get('input[type="file"]').attachFile('logo-test.png');
      
      // Guardar cambios
      cy.contains('Subir Logo').click();
      
      // Verificar mensaje de éxito
      cy.contains('Logo actualizado correctamente').should('be.visible');
    });
  });

  describe('Gestión de Usuarios y Permisos', () => {
    beforeEach(() => {
      // Asegurar que estamos en la sección de usuarios y permisos
      cy.contains('Usuarios y Permisos').click();
    });

    it('Debería mostrar la lista de usuarios', () => {
      // Verificar tabla o listado
      cy.get('[data-testid="users-table"]').should('be.visible');
      
      // Verificar que existan registros
      cy.get('[data-testid="users-table"] tbody tr').should('have.length.at.least', 1);
    });

    it('Debería permitir crear un nuevo usuario', () => {
      // Clic en botón de agregar
      cy.contains('Agregar Usuario').click();
      
      // Verificar formulario
      cy.get('[data-testid="user-form"]').should('be.visible');
      
      // Llenar formulario
      cy.get('input[name="name"]').type('Usuario de Prueba');
      cy.get('input[name="email"]').type('usuario.prueba@example.com');
      cy.get('select[name="role"]').select('STAFF');
      cy.get('input[name="password"]').type('Contraseña123');
      cy.get('input[name="confirmPassword"]').type('Contraseña123');
      
      // Enviar formulario
      cy.contains('Crear Usuario').click();
      
      // Verificar mensaje de éxito
      cy.contains('Usuario creado correctamente').should('be.visible');
      
      // Verificar que aparezca en la lista
      cy.contains('Usuario de Prueba').should('be.visible');
    });

    it('Debería permitir editar un usuario existente', () => {
      // Clic en botón de editar del primer usuario
      cy.get('[data-testid="users-table"] tbody tr').first().find('[data-testid="edit-user-button"]').click();
      
      // Verificar formulario con datos cargados
      cy.get('[data-testid="user-form"]').should('be.visible');
      
      // Modificar datos
      cy.get('input[name="name"]').clear().type('Usuario Actualizado');
      
      // Enviar formulario
      cy.contains('Actualizar Usuario').click();
      
      // Verificar mensaje de éxito
      cy.contains('Usuario actualizado correctamente').should('be.visible');
    });

    it('Debería permitir desactivar un usuario', () => {
      // Obtener el nombre del último usuario para verificar después
      cy.get('[data-testid="users-table"] tbody tr').last().find('td').first().invoke('text').as('lastUserName');
      
      // Clic en botón de desactivar del último usuario
      cy.get('[data-testid="users-table"] tbody tr').last().find('[data-testid="deactivate-user-button"]').click();
      
      // Confirmar desactivación
      cy.contains('Confirmar').click();
      
      // Verificar mensaje de éxito
      cy.contains('Usuario desactivado correctamente').should('be.visible');
      
      // Verificar que aparezca como inactivo en la lista
      cy.get('@lastUserName').then(userName => {
        cy.contains(userName).parent('tr').contains('Inactivo').should('be.visible');
      });
    });
  });

  describe('Configuración de Notificaciones', () => {
    beforeEach(() => {
      // Asegurar que estamos en la sección de notificaciones
      cy.contains('Notificaciones').click();
    });

    it('Debería mostrar la configuración de notificaciones', () => {
      // Verificar formulario
      cy.get('[data-testid="notifications-form"]').should('be.visible');
      
      // Verificar opciones
      cy.contains('Notificaciones por Correo Electrónico').should('be.visible');
      cy.contains('Notificaciones en la Plataforma').should('be.visible');
    });

    it('Debería permitir actualizar la configuración de notificaciones', () => {
      // Cambiar configuración
      cy.get('[name="emailNotificationsEnabled"]').check();
      cy.get('[name="inAppNotificationsEnabled"]').check();
      
      // Seleccionar eventos
      cy.get('[name="notifyOnPayment"]').check();
      cy.get('[name="notifyOnAssembly"]').check();
      cy.get('[name="notifyOnPqr"]').check();
      
      // Guardar cambios
      cy.contains('Guardar Configuración').click();
      
      // Verificar mensaje de éxito
      cy.contains('Configuración de notificaciones actualizada').should('be.visible');
    });
  });

  describe('Configuración de Apariencia', () => {
    beforeEach(() => {
      // Asegurar que estamos en la sección de apariencia
      cy.contains('Apariencia').click();
    });

    it('Debería mostrar la configuración de apariencia', () => {
      // Verificar formulario
      cy.get('[data-testid="appearance-form"]').should('be.visible');
      
      // Verificar opciones
      cy.contains('Colores Personalizados').should('be.visible');
      cy.contains('Fuentes').should('be.visible');
    });

    it('Debería permitir personalizar los colores', () => {
      // Seleccionar color primario
      cy.get('input[name="primaryColor"]').invoke('val', '#4f46e5').trigger('change');
      
      // Seleccionar color secundario
      cy.get('input[name="secondaryColor"]').invoke('val', '#10b981').trigger('change');
      
      // Guardar cambios
      cy.contains('Guardar Apariencia').click();
      
      // Verificar mensaje de éxito
      cy.contains('Apariencia actualizada correctamente').should('be.visible');
    });
  });

  describe('Configuración de Integración', () => {
    beforeEach(() => {
      // Asegurar que estamos en la sección de integración
      cy.contains('Integración').click();
    });

    it('Debería mostrar la configuración de integración', () => {
      // Verificar formulario
      cy.get('[data-testid="integration-form"]').should('be.visible');
      
      // Verificar opciones
      cy.contains('Pasarela de Pagos').should('be.visible');
      cy.contains('API Key').should('be.visible');
    });

    it('Debería permitir configurar la pasarela de pagos', () => {
      // Seleccionar pasarela
      cy.get('select[name="paymentGateway"]').select('PayU');
      
      // Llenar credenciales
      cy.get('input[name="merchantId"]').type('123456');
      cy.get('input[name="apiKey"]').type('api_key_test');
      cy.get('select[name="environment"]').select('test');
      
      // Guardar cambios
      cy.contains('Guardar Configuración').click();
      
      // Verificar mensaje de éxito
      cy.contains('Configuración de integración actualizada').should('be.visible');
    });
  });
});
