// Prueba de integración para el registro de conjuntos residenciales
describe('Registro de Conjuntos Residenciales - Integración', () => {
  // Generamos datos únicos para cada test
  const timestamp = new Date().toISOString().replace(/[^\d]/g, '');
  const complexName = `Test Complex ${timestamp}`;
  const adminEmail = `admin_${timestamp}@test.com`;
  const username = `admin_${timestamp}`;

  beforeEach(() => {
    // Navegar a la página de registro de conjuntos
    cy.visit('/register-complex');
    // Esperar a que la página cargue completamente
    cy.contains('Registro de Conjunto Residencial', { timeout: 10000 }).should('be.visible');
  });

  it('Debería registrar un conjunto y crear correctamente todas las estructuras en la base de datos', () => {
    // No interceptamos la llamada a la API para permitir que se procese realmente
    
    // Completar todo el proceso de registro
    cy.contains('Plan Estándar').click();
    
    // Formulario del conjunto (paso 2)
    cy.get('#complexName').type(complexName);
    cy.get('#adminName').type('Administrador de Prueba');
    cy.get('#adminPhone').type('3001234567');
    cy.get('#adminEmail').type(adminEmail);
    cy.get('#address').type('Calle de Prueba 123');
    cy.get('#city').type('Ciudad de Prueba');
    cy.get('#state').type('Estado de Prueba');
    cy.get('#country').select('Colombia');
    cy.get('#units').type('35'); // Usamos un número válido para el plan estándar
    
    // Seleccionar algunos servicios comunes
    cy.get('#service-pool').check(); // Piscina
    cy.get('#service-gym').check(); // Gimnasio
    cy.get('#service-salon').check(); // Salón comunal
    
    // Continuar al paso 3
    cy.contains('Continuar').click();
    
    // Formulario de creación de cuenta (paso 3)
    cy.get('#username').type(username);
    cy.get('#password').type('Test1234');
    cy.get('#confirmPassword').type('Test1234');
    cy.get('#terms').check();
    
    // Registrar el conjunto
    cy.contains('Registrar Conjunto').click();
    
    // Esperar a la redirección (puede tomar tiempo ya que se está creando el esquema en la BD)
    cy.location('pathname', { timeout: 30000 }).should('include', '/portal-selector');
    
    // Verificar que se muestra un mensaje de éxito
    cy.contains('¡Gracias por registrar su conjunto!').should('be.visible');
    
    // Ahora verificamos en la base de datos que el conjunto se ha creado correctamente
    // Esto lo haremos utilizando el API para obtener datos del conjunto
    cy.request({
      method: 'GET',
      url: '/api/admin/complexes',
      failOnStatusCode: false // Permitimos cualquier código de estado para validar
    }).then((response) => {
      // Verificar que la solicitud fue exitosa
      expect(response.status).to.equal(200);
      
      // Verificar que el conjunto aparece en la lista
      const complex = response.body.complexes.find(c => c.name === complexName);
      expect(complex).to.exist;
      
      // Guardar el ID del conjunto para futuros tests
      cy.wrap(complex.id).as('complexId');
      cy.wrap(complex.schemaName).as('schemaName');
    });
    
    // Verificar que se puede iniciar sesión con las credenciales creadas
    cy.visit('/login');
    cy.get('#email').type(adminEmail);
    cy.get('#password').type('Test1234');
    cy.contains('Iniciar Sesión').click();
    
    // Verificar redirección al dashboard después del login
    cy.location('pathname', { timeout: 10000 }).should('include', '/dashboard');
    
    // Verificar que el nombre del conjunto aparece en el dashboard
    cy.contains(complexName).should('be.visible');
  });

  // Este test debe ejecutarse después del anterior y usará los datos guardados
  it('Debería verificar la estructura multitenant correcta en la base de datos', function() {
    // Saltamos este test si no se completó el anterior
    if (!this.complexId || !this.schemaName) {
      this.skip();
    }
    
    // Verificar la estructura del esquema tenant mediante una consulta a la API
    cy.request({
      method: 'GET',
      url: `/api/admin/schema-validation?schemaName=${this.schemaName}`,
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.equal(200);
      
      // Verificar que todas las tablas requeridas existen
      const requiredTables = [
        'ResidentialComplex',
        'Property',
        'User',
        'Resident',
        'Service',
        'Assembly',
        'Attendance',
        'VotingQuestion',
        'Vote',
        'Document',
        'Budget',
        'Fee',
        'Payment',
        'PQR',
        'Staff'
      ];
      
      requiredTables.forEach(table => {
        expect(response.body.tables).to.include(table);
      });
      
      // Verificar que el conjunto residencial se copió correctamente al esquema tenant
      expect(response.body.complexName).to.equal(complexName);
    });
  });

  // Este test verifica el acceso multitenant (inicio de sesión con selección de conjunto)
  it('Debería permitir seleccionar el conjunto después de iniciar sesión', function() {
    // Iniciar sesión con las credenciales creadas
    cy.visit('/login');
    cy.get('#email').type(adminEmail);
    cy.get('#password').type('Test1234');
    cy.contains('Iniciar Sesión').click();
    
    // Verificar que se muestra la página de selección de conjunto
    cy.contains('Seleccione un Conjunto').should('be.visible');
    
    // Seleccionar el conjunto creado
    cy.contains(complexName).click();
    
    // Verificar redirección al dashboard específico del conjunto
    cy.location('pathname', { timeout: 10000 }).should('include', '/dashboard');
    
    // Verificar que el nombre del conjunto aparece en el header o sidebar
    cy.contains(complexName).should('be.visible');
  });
});