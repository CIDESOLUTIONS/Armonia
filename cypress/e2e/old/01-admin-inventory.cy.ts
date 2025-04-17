
// Prueba para el módulo de Gestión de Inventario en el Panel de Administrador
describe('Módulo de Gestión de Inventario', () => {
  beforeEach(() => {
    // Login como administrador antes de cada prueba
    cy.visit('/login');
    cy.get('input[placeholder="Tu correo electrónico"]').type('admin@example.com');
    cy.get('input[placeholder="Tu contraseña"]').type('password');
    cy.contains('Iniciar Sesión').click();
    
    // Navegar al módulo de inventario
    cy.contains('Inventario').click();
  });

  it('Debería mostrar la lista de propiedades', () => {
    // Verificar que estamos en la sección de propiedades
    cy.url().should('include', '/dashboard/inventory');
    
    // Verificar que existe la tabla de propiedades
    cy.get('table').should('exist');
    
    // Debería haber al menos una propiedad en la tabla
    cy.get('table tbody tr').should('have.length.at.least', 1);
    
    // Verificar columnas importantes en la tabla
    cy.contains('Identificación').should('exist');
    cy.contains('Tipo').should('exist');
    cy.contains('Área').should('exist');
    cy.contains('Propietario').should('exist');
  });

  it('Debería permitir agregar una nueva propiedad', () => {
    // Hacer clic en botón para agregar nueva propiedad
    cy.contains('Agregar Propiedad').click();
    
    // Verificar que se abre el formulario de nueva propiedad
    cy.contains('Nueva Propiedad').should('exist');
    
    // Completar el formulario
    cy.get('input[name="propertyId"]').type('TEST-0001');
    cy.get('select[name="propertyType"]').select('Apartamento');
    cy.get('input[name="area"]').type('75');
    
    // Si hay un selector para propietario, seleccionamos uno
    cy.get('body').then(($body) => {
      if ($body.find('select[name="ownerId"]').length > 0) {
        cy.get('select[name="ownerId"]').select(1);
      }
    });
    
    // Guardar la nueva propiedad
    cy.contains('Guardar').click();
    
    // Verificar mensaje de éxito
    cy.contains('Propiedad creada correctamente').should('exist');
    
    // Verificar que la nueva propiedad aparece en la lista
    cy.contains('TEST-0001').should('exist');
  });

  it('Debería permitir editar una propiedad existente', () => {
    // Hacer clic en el botón de edición de la primera propiedad
    cy.get('table tbody tr').first().find('button[aria-label="Editar"]').click();
    
    // Verificar que se abre el formulario de edición
    cy.contains('Editar Propiedad').should('exist');
    
    // Modificar datos de la propiedad
    cy.get('input[name="area"]').clear().type('100');
    
    // Guardar cambios
    cy.contains('Guardar').click();
    
    // Verificar mensaje de éxito
    cy.contains('Propiedad actualizada correctamente').should('exist');
  });

  it('Debería permitir ver detalles de una propiedad', () => {
    // Hacer clic en el botón de detalles de la primera propiedad
    cy.get('table tbody tr').first().find('button[aria-label="Ver detalles"]').click();
    
    // Verificar que se muestra la vista de detalles
    cy.contains('Detalles de la Propiedad').should('exist');
    
    // Verificar información detallada
    cy.contains('Información Básica').should('exist');
    cy.contains('Propietario').should('exist');
    cy.contains('Residentes').should('exist');
    
    // Volver a la lista de propiedades
    cy.contains('Volver').click();
    cy.url().should('include', '/dashboard/inventory');
  });

  it('Debería mostrar la lista de residentes', () => {
    // Navegar a la subsección de residentes
    cy.contains('Residentes').click();
    
    // Verificar que estamos en la sección de residentes
    cy.url().should('include', '/residents');
    
    // Verificar que existe la tabla de residentes
    cy.get('table').should('exist');
    
    // Debería haber al menos un residente en la tabla
    cy.get('table tbody tr').should('have.length.at.least', 1);
    
    // Verificar columnas importantes en la tabla
    cy.contains('Nombre').should('exist');
    cy.contains('Identificación').should('exist');
    cy.contains('Correo').should('exist');
    cy.contains('Propiedad').should('exist');
  });

  it('Debería mostrar la lista de vehículos', () => {
    // Navegar a la subsección de vehículos
    cy.contains('Vehículos').click();
    
    // Verificar que estamos en la sección de vehículos
    cy.url().should('include', '/vehicles');
    
    // Verificar que existe la tabla de vehículos
    cy.get('table').should('exist');
    
    // Debería haber al menos un vehículo en la tabla
    cy.get('table tbody tr').should('have.length.at.least', 1);
    
    // Verificar columnas importantes en la tabla
    cy.contains('Placa').should('exist');
    cy.contains('Modelo').should('exist');
    cy.contains('Propietario').should('exist');
  });

  it('Debería mostrar la lista de mascotas', () => {
    // Navegar a la subsección de mascotas
    cy.contains('Mascotas').click();
    
    // Verificar que estamos en la sección de mascotas
    cy.url().should('include', '/pets');
    
    // Verificar que existe la tabla de mascotas
    cy.get('table').should('exist');
    
    // Debería haber al menos una mascota en la tabla
    cy.get('table tbody tr').should('have.length.at.least', 1);
    
    // Verificar columnas importantes en la tabla
    cy.contains('Nombre').should('exist');
    cy.contains('Tipo').should('exist');
    cy.contains('Propietario').should('exist');
  });
});
