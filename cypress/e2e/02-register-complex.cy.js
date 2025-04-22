// Pruebas para el registro de conjuntos residenciales
describe('Registro de Conjuntos Residenciales', () => {
  beforeEach(() => {
    // Navegar a la página de registro de conjuntos
    cy.visit('/register-complex');
    // Esperar a que la página cargue completamente
    cy.contains('Registro de Conjunto Residencial', { timeout: 10000 }).should('be.visible');
  });

  it('Debería mostrar correctamente el formulario de registro en español por defecto', () => {
    // Verificar que el título está en español
    cy.contains('Registro de Conjunto Residencial').should('be.visible');
    
    // Verificar que los pasos están en español
    cy.contains('Plan').should('be.visible');
    cy.contains('Conjunto').should('be.visible');
    cy.contains('Cuenta').should('be.visible');
    
    // Verificar los planes en español
    cy.contains('Plan Básico').should('be.visible');
    cy.contains('Plan Estándar').should('be.visible');
    cy.contains('Plan Premium').should('be.visible');
    
    // Verificar los precios en pesos por defecto
    cy.contains('$95000/mes').should('be.visible');
  });

  it('Debería cambiar correctamente a inglés y traducir todos los elementos', () => {
    // Cambiar el idioma a inglés
    cy.get('button[title*="Switch to English"]').click();
    
    // Verificar que el título cambia a inglés
    cy.contains('Residential Complex Registration').should('be.visible');
    
    // Verificar que los pasos están en inglés
    cy.contains('Plan').should('be.visible');
    cy.contains('Complex').should('be.visible');
    cy.contains('Account').should('be.visible');
    
    // Verificar los planes en inglés
    cy.contains('Basic Plan').should('be.visible');
    cy.contains('Standard Plan').should('be.visible');
    cy.contains('Premium Plan').should('be.visible');
    
    // Verificar las descripciones en inglés
    cy.contains('For complexes with up to 50 units').should('be.visible');
  });

  it('Debería cambiar entre monedas (pesos y dólares)', () => {
    // Verificar que por defecto aparece la moneda en pesos
    cy.contains('$95000').should('be.visible');
    
    // Cambiar a dólares
    cy.get('button[title*="Switch to Dollars"]').click();
    
    // Verificar que cambia a dólares
    cy.contains('$25').should('be.visible');
    
    // Volver a pesos
    cy.get('button[title*="Cambiar a Pesos"]').click();
    
    // Verificar que vuelve a pesos
    cy.contains('$95000').should('be.visible');
  });

  it('Debería seleccionar el plan básico y continuar al paso 2', () => {
    // Seleccionar el plan básico
    cy.contains('Plan Básico').click();
    
    // Verificar que estamos en el paso 2
    cy.contains('Información del Conjunto').should('be.visible');
    
    // Verificar que el primer paso muestra un check (completado)
    cy.get('.text-green-500').should('exist');
  });

  it('Debería seleccionar el plan estándar y continuar al paso 2', () => {
    // Seleccionar el plan estándar
    cy.contains('Plan Estándar').click();
    
    // Verificar que estamos en el paso 2
    cy.contains('Información del Conjunto').should('be.visible');
  });

  it('Debería seleccionar el plan premium y continuar al paso 2', () => {
    // Seleccionar el plan premium
    cy.contains('Plan Premium').click();
    
    // Verificar que estamos en el paso 2
    cy.contains('Información del Conjunto').should('be.visible');
  });

  it('Debería mostrar mensaje de error si se selecciona demasiadas unidades para plan básico', () => {
    // Seleccionar el plan básico
    cy.contains('Plan Básico').click();
    
    // Completar el formulario con más de 30 unidades
    cy.get('#complexName').type('Conjunto Residencial Test');
    cy.get('#adminName').type('Administrador Test');
    cy.get('#adminPhone').type('3001234567');
    cy.get('#adminEmail').type('admin@test.com');
    cy.get('#address').type('Calle 123 #45-67');
    cy.get('#city').type('Bogotá');
    cy.get('#state').type('Cundinamarca');
    cy.get('#units').type('31');
    
    // Verificar que aparece el mensaje de error
    cy.contains('El plan básico solo permite hasta 30 unidades').should('be.visible');
  });

  it('Debería continuar al paso 3 después de completar el formulario del conjunto', () => {
    // Seleccionar el plan estándar
    cy.contains('Plan Estándar').click();
    
    // Completar el formulario del conjunto
    cy.get('#complexName').type('Conjunto Residencial Test');
    cy.get('#adminName').type('Administrador Test');
    cy.get('#adminPhone').type('3001234567');
    cy.get('#adminEmail').type('admin@test.com');
    cy.get('#address').type('Calle 123 #45-67');
    cy.get('#city').type('Bogotá');
    cy.get('#state').type('Cundinamarca');
    cy.get('#units').type('30');
    
    // Seleccionar algunos servicios
    cy.get('#service-pool').check();
    cy.get('#service-gym').check();
    cy.get('#service-salon').check();
    
    // Continuar al paso 3
    cy.contains('Continuar').click();
    
    // Verificar que estamos en el paso 3
    cy.contains('Creación de Cuenta').should('be.visible');
  });

  it('Debería validar que las contraseñas coincidan en el paso 3', () => {
    // Completar los pasos anteriores
    cy.contains('Plan Estándar').click();
    cy.get('#complexName').type('Conjunto Residencial Test');
    cy.get('#adminName').type('Administrador Test');
    cy.get('#adminPhone').type('3001234567');
    cy.get('#adminEmail').type('admin@test.com');
    cy.get('#address').type('Calle 123 #45-67');
    cy.get('#city').type('Bogotá');
    cy.get('#state').type('Cundinamarca');
    cy.get('#units').type('30');
    cy.contains('Continuar').click();
    
    // Ingresar contraseñas que no coinciden
    cy.get('#username').type('admin_test');
    cy.get('#password').type('password123');
    cy.get('#confirmPassword').type('password456');
    
    // Verificar que aparece el mensaje de error
    cy.contains('Las contraseñas no coinciden').should('be.visible');
    
    // Verificar que el botón de registro está deshabilitado
    cy.contains('Registrar Conjunto').should('be.disabled');
  });

  it('Debería requerir aceptar los términos y condiciones para continuar', () => {
    // Completar los pasos anteriores
    cy.contains('Plan Estándar').click();
    cy.get('#complexName').type('Conjunto Residencial Test');
    cy.get('#adminName').type('Administrador Test');
    cy.get('#adminPhone').type('3001234567');
    cy.get('#adminEmail').type('admin@test.com');
    cy.get('#address').type('Calle 123 #45-67');
    cy.get('#city').type('Bogotá');
    cy.get('#state').type('Cundinamarca');
    cy.get('#units').type('30');
    cy.contains('Continuar').click();
    
    // Ingresar credenciales de usuario válidas
    cy.get('#username').type('admin_test');
    cy.get('#password').type('password123');
    cy.get('#confirmPassword').type('password123');
    
    // Verificar que el botón de registro está deshabilitado sin aceptar términos
    cy.contains('Registrar Conjunto').should('be.disabled');
    
    // Aceptar los términos y condiciones
    cy.get('#terms').check();
    
    // Verificar que el botón de registro se habilita
    cy.contains('Registrar Conjunto').should('not.be.disabled');
  });

  it('Debería registrar el conjunto correctamente', () => {
    // Interceptar la llamada a la API de registro
    cy.intercept('POST', '/api/register-complex', {
      statusCode: 201,
      body: {
        message: 'Conjunto registrado con éxito',
        complex: {
          id: 1,
          name: 'Conjunto Residencial Test',
          schemaName: 'tenant_cj0001'
        }
      }
    }).as('registerComplex');
    
    // Completar todo el proceso de registro
    cy.contains('Plan Estándar').click();
    cy.get('#complexName').type('Conjunto Residencial Test');
    cy.get('#adminName').type('Administrador Test');
    cy.get('#adminPhone').type('3001234567');
    cy.get('#adminEmail').type('admin@test.com');
    cy.get('#address').type('Calle 123 #45-67');
    cy.get('#city').type('Bogotá');
    cy.get('#state').type('Cundinamarca');
    cy.get('#units').type('30');
    cy.contains('Continuar').click();
    
    cy.get('#username').type('admin_test');
    cy.get('#password').type('password123');
    cy.get('#confirmPassword').type('password123');
    cy.get('#terms').check();
    
    // Enviar el formulario
    cy.contains('Registrar Conjunto').click();
    
    // Esperar la respuesta de la API
    cy.wait('@registerComplex');
    
    // Verificar que se muestra un mensaje de éxito
    cy.contains('Gracias por registrar su conjunto').should('be.visible');
    
    // Verificar que se redirige a la página de selector de portales
    cy.url().should('include', '/portal-selector');
  });

  it('Debería mostrar error si el registro falla', () => {
    // Interceptar la llamada a la API de registro para simular un error
    cy.intercept('POST', '/api/register-complex', {
      statusCode: 500,
      body: {
        message: 'Error al registrar el conjunto',
        error: 'Error de conexión a la base de datos'
      }
    }).as('registerComplexError');
    
    // Completar todo el proceso de registro
    cy.contains('Plan Estándar').click();
    cy.get('#complexName').type('Conjunto Residencial Test');
    cy.get('#adminName').type('Administrador Test');
    cy.get('#adminPhone').type('3001234567');
    cy.get('#adminEmail').type('admin@test.com');
    cy.get('#address').type('Calle 123 #45-67');
    cy.get('#city').type('Bogotá');
    cy.get('#state').type('Cundinamarca');
    cy.get('#units').type('30');
    cy.contains('Continuar').click();
    
    cy.get('#username').type('admin_test');
    cy.get('#password').type('password123');
    cy.get('#confirmPassword').type('password123');
    cy.get('#terms').check();
    
    // Enviar el formulario
    cy.contains('Registrar Conjunto').click();
    
    // Esperar la respuesta de la API
    cy.wait('@registerComplexError');
    
    // Verificar que se muestra un mensaje de error
    cy.contains('Error al registrar el conjunto').should('be.visible');
  });

  it('Debería funcionar el botón de volver atrás entre pasos', () => {
    // Ir al paso 2
    cy.contains('Plan Estándar').click();
    cy.contains('Información del Conjunto').should('be.visible');
    
    // Volver al paso 1
    cy.contains('Atrás').click();
    cy.contains('Seleccione un Plan').should('be.visible');
    
    // Ir al paso 2 de nuevo
    cy.contains('Plan Estándar').click();
    
    // Completar el formulario y avanzar al paso 3
    cy.get('#complexName').type('Conjunto Residencial Test');
    cy.get('#adminName').type('Administrador Test');
    cy.get('#adminPhone').type('3001234567');
    cy.get('#adminEmail').type('admin@test.com');
    cy.get('#address').type('Calle 123 #45-67');
    cy.get('#city').type('Bogotá');
    cy.get('#state').type('Cundinamarca');
    cy.get('#units').type('30');
    cy.contains('Continuar').click();
    
    // Verificar que estamos en el paso 3
    cy.contains('Creación de Cuenta').should('be.visible');
    
    // Volver al paso 2
    cy.contains('Atrás').click();
    cy.contains('Información del Conjunto').should('be.visible');
  });

  it('Debería conservar los datos entre navegaciones de pasos', () => {
    // Ir al paso 2
    cy.contains('Plan Estándar').click();
    
    // Completar el formulario
    cy.get('#complexName').type('Conjunto Residencial Test');
    cy.get('#adminName').type('Administrador Test');
    cy.get('#adminPhone').type('3001234567');
    cy.get('#adminEmail').type('admin@test.com');
    cy.get('#address').type('Calle 123 #45-67');
    cy.get('#city').type('Bogotá');
    cy.get('#state').type('Cundinamarca');
    cy.get('#units').type('30');
    
    // Avanzar al paso 3
    cy.contains('Continuar').click();
    
    // Regresar al paso 2
    cy.contains('Atrás').click();
    
    // Verificar que los datos se mantienen
    cy.get('#complexName').should('have.value', 'Conjunto Residencial Test');
    cy.get('#adminName').should('have.value', 'Administrador Test');
    cy.get('#adminPhone').should('have.value', '3001234567');
    cy.get('#adminEmail').should('have.value', 'admin@test.com');
    cy.get('#address').should('have.value', 'Calle 123 #45-67');
    cy.get('#city').should('have.value', 'Bogotá');
    cy.get('#state').should('have.value', 'Cundinamarca');
    cy.get('#units').should('have.value', '30');
  });
});