// Prueba completa y actualizada para la landing page de Armonía
describe('Landing Page de Armonía (Prueba Completa)', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('Debería mostrar el header con la marca y la navegación', () => {
    // Verificar el logo y la marca
    cy.contains('Armonía').should('exist');
    
    // Verificar la navegación principal
    cy.contains('Funcionalidades').should('exist');
    cy.contains('Planes').should('exist');
    
    // Verificar botones de acción
    cy.contains('Iniciar Sesión').should('exist');
    cy.contains('Comenzar Ahora').should('exist');
  });

  it('Debería mostrar la sección hero con título y descripción', () => {
    cy.contains('Gestión integral para conjuntos residenciales').should('exist');
    cy.contains('Simplifique la administración').should('exist');
  });

  it('Debería mostrar la sección de funcionalidades con los tres módulos principales', () => {
    // Verificar título de la sección
    cy.contains('Funcionalidades Completas para su Conjunto').should('exist');
    
    // Verificar los tres módulos principales
    cy.contains('Administración').should('exist');
    cy.contains('Portal de Residentes').should('exist');
    cy.contains('Recepción y Vigilancia').should('exist');
    
    // Verificar que los iconos se muestran correctamente
    cy.get('svg').should('have.length.at.least', 6);
  });

  it('Debería mostrar la sección de características adicionales', () => {
    // Verificar título de la sección
    cy.contains('Características que Facilitan su Gestión').should('exist');
    
    // Verificar las características
    cy.contains('Asambleas Virtuales').should('exist');
    cy.contains('Gestión Financiera').should('exist');
    cy.contains('Comunicación Integral').should('exist');
    cy.contains('Sistema PQR').should('exist');
  });

  it('Debería mostrar la sección de planes', () => {
    // Hacer scroll hasta la sección de planes
    cy.contains('Planes que se adaptan a sus necesidades').scrollIntoView();
    
    // Verificar los tres planes
    cy.contains('Plan Básico').should('exist');
    cy.contains('Gratuito').should('exist');
    
    cy.contains('Plan Estándar').should('exist');
    cy.contains('RECOMENDADO').should('exist');
    
    cy.contains('Plan Premium').should('exist');
    
    // Verificar algunas características de los planes
    cy.contains('Gestión de propiedades y residentes').should('exist');
    cy.contains('Módulo financiero avanzado').should('exist');
  });

  it('Debería mostrar el formulario de registro', () => {
    // Hacer scroll hasta la sección de registro
    cy.contains('Registre su Conjunto Residencial').scrollIntoView();
    
    // Verificar el formulario
    cy.get('form').should('exist');
    cy.get('input[name="complexName"]').should('exist');
    cy.get('input[name="adminName"]').should('exist');
    cy.get('input[name="adminEmail"]').should('exist');
    cy.get('input[name="adminPhone"]').should('exist');
    cy.get('input[name="address"]').should('exist');
    cy.get('input[name="city"]').should('exist');
    cy.get('input[name="units"]').should('exist');
  });

  it('Debería navegar a la página de selección de portal al registrarse', () => {
    // Hacer scroll hasta el formulario
    cy.contains('Registre su Conjunto Residencial').scrollIntoView();
    
    // Llenar el formulario
    cy.get('input[name="complexName"]').type('Conjunto de Prueba');
    cy.get('input[name="adminName"]').type('Administrador Test');
    cy.get('input[name="adminEmail"]').type('admin@test.com');
    cy.get('input[name="adminPhone"]').type('3001234567');
    cy.get('input[name="address"]').type('Calle 123 #45-67');
    cy.get('input[name="city"]').type('Ciudad Test');
    cy.get('input[name="units"]').type('10');
    
    // Marcar algunos servicios
    cy.get('#service-pool').check();
    cy.get('#service-salon').check();
    
    // Enviar el formulario
    cy.contains('Registrar Conjunto').click();
    
    // Verificar que se muestra el mensaje de confirmación y se redirige
    cy.on('window:alert', (text) => {
      expect(text).to.contains('¡Gracias por registrar su conjunto!');
    });
    
    // Verificar redirección
    cy.url().should('include', '/portal-selector');
  });

  it('Debería permitir cambiar el tema oscuro/claro', () => {
    // Verificar el estado inicial (tema claro por defecto)
    cy.get('body').should('not.have.class', 'bg-gray-900');
    
    // Hacer clic en el botón de tema
    cy.contains('Oscuro').click();
    
    // Verificar que se cambió al tema oscuro
    cy.get('body').should('have.class', 'bg-gray-900');
  });

  it('Debería navegar a la página de selector de portal al hacer clic en Iniciar Sesión', () => {
    // Hacer clic en el botón de iniciar sesión
    cy.contains('Iniciar Sesión').click();
    
    // Verificar redirección a la página de selector de portal
    cy.url().should('include', '/portal-selector');
  });
});