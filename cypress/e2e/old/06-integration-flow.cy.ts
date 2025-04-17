// Prueba de integración de flujo completo para Armonía
describe('Flujo de Integración Completo de Armonía', () => {
  it('Debería completar un flujo de trabajo completo entre diferentes roles', () => {
    // 1. Visitar la landing page y verificar funcionalidad
    cy.visit('/');
    cy.contains('Armonía').should('exist');
    cy.contains('Gestión integral').should('exist');
    
    // 2. Navegar a la página de login
    cy.contains('Iniciar Sesión').click();
    cy.url().should('include', '/login');
    
    // 3. Iniciar sesión como administrador
    cy.get('input[placeholder="Tu correo electrónico"]').type('admin@armonia.com');
    cy.get('input[placeholder="Tu contraseña"]').type('Admin123');
    cy.get('button').contains('Iniciar Sesión').click();
    
    // 4. Verificar dashboard de administrador
    cy.url().should('include', '/dashboard');
    cy.contains('Dashboard').should('exist');
    
    // 5. Crear una nueva asamblea o evento (si existe la funcionalidad)
    cy.contains('Asambleas').click();
    cy.get('body').then(($body) => {
      if ($body.find('button').filter(':contains("Nueva")').length > 0) {
        cy.contains('button', 'Nueva').click();
        
        // Rellenar formulario (ajustar según la estructura real)
        cy.get('input[name="title"]').type('Asamblea de Prueba Integración');
        cy.get('input[name="date"]').type('2025-05-01');
        cy.get('textarea[name="description"]').type('Descripción de prueba para flujo de integración');
        
        cy.contains('button', 'Guardar').click();
        
        // Verificar que se ha creado
        cy.contains('Asamblea de Prueba Integración').should('exist');
      }
    });
    
    // 6. Cerrar sesión como administrador
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="logout-button"]').length > 0) {
        cy.get('[data-testid="logout-button"]').click();
      } else if ($body.find('button').filter(':contains("Cerrar sesión")').length > 0) {
        cy.contains('button', 'Cerrar sesión').click();
      } else if ($body.find('a').filter(':contains("Cerrar sesión")').length > 0) {
        cy.contains('a', 'Cerrar sesión').click();
      } else if ($body.find('button').filter(':contains("Salir")').length > 0) {
        cy.contains('button', 'Salir').click();
      } else {
        // Intentar click en menú de usuario y luego buscar cerrar sesión
        cy.get('nav').find('button').last().click({force: true});
        cy.contains('Cerrar sesión').click({force: true});
      }
    });
    
    // 7. Iniciar sesión como residente
    cy.get('input[placeholder="Tu correo electrónico"]').clear().type('residente@test.com');
    cy.get('input[placeholder="Tu contraseña"]').clear().type('Residente123');
    cy.get('button').contains('Iniciar Sesión').click();
    
    // 8. Verificar dashboard de residente
    cy.url().should('include', '/resident');
    
    // 9. Crear una PQR o solicitud (si existe la funcionalidad)
    cy.contains(/pqr|peticiones|solicitudes/i).click({force: true});
    cy.get('body').then(($body) => {
      if ($body.find('button').filter(':contains("Nueva")').length > 0) {
        cy.contains('button', 'Nueva').click();
        
        // Rellenar formulario (ajustar según la estructura real)
        cy.get('input[name="title"]').type('Solicitud de Prueba Integración');
        cy.get('textarea[name="description"]').type('Descripción de solicitud para prueba de flujo integrado');
        cy.get('select[name="type"]').select('Petición');
        
        cy.contains('button', 'Enviar').click();
        
        // Verificar que se ha creado
        cy.contains('Solicitud de Prueba Integración').should('exist');
      }
    });
    
    // 10. Cerrar sesión como residente
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="logout-button"]').length > 0) {
        cy.get('[data-testid="logout-button"]').click();
      } else if ($body.find('button').filter(':contains("Cerrar sesión")').length > 0) {
        cy.contains('button', 'Cerrar sesión').click();
      } else if ($body.find('a').filter(':contains("Cerrar sesión")').length > 0) {
        cy.contains('a', 'Cerrar sesión').click();
      } else if ($body.find('button').filter(':contains("Salir")').length > 0) {
        cy.contains('button', 'Salir').click();
      } else {
        // Intentar click en menú de usuario y luego buscar cerrar sesión
        cy.get('nav').find('button').last().click({force: true});
        cy.contains('Cerrar sesión').click({force: true});
      }
    });
    
    // 11. Iniciar sesión como personal de recepción
    cy.get('input[placeholder="Tu correo electrónico"]').clear().type('recepcion@test.com');
    cy.get('input[placeholder="Tu contraseña"]').clear().type('Recepcion123');
    cy.get('button').contains('Iniciar Sesión').click();
    
    // 12. Verificar dashboard de recepción
    cy.url().should('include', '/reception');
    
    // 13. Registrar un visitante (si existe la funcionalidad)
    cy.contains(/visitantes|visitas/i).click({force: true});
    cy.get('body').then(($body) => {
      if ($body.find('button').filter(':contains("Nuevo")').length > 0) {
        cy.contains('button', 'Nuevo').click();
        
        // Rellenar formulario (ajustar según la estructura real)
        cy.get('input[name="visitorName"]').type('Visitante de Prueba');
        cy.get('input[name="identification"]').type('1234567890');
        cy.get('select[name="unit"]').select('101'); // O cualquier unidad válida
        
        cy.contains('button', 'Registrar').click();
        
        // Verificar que se ha registrado
        cy.contains('Visitante de Prueba').should('exist');
      }
    });
    
    // 14. Cerrar sesión como personal de recepción
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="logout-button"]').length > 0) {
        cy.get('[data-testid="logout-button"]').click();
      } else if ($body.find('button').filter(':contains("Cerrar sesión")').length > 0) {
        cy.contains('button', 'Cerrar sesión').click();
      } else if ($body.find('a').filter(':contains("Cerrar sesión")').length > 0) {
        cy.contains('a', 'Cerrar sesión').click();
      } else if ($body.find('button').filter(':contains("Salir")').length > 0) {
        cy.contains('button', 'Salir').click();
      } else {
        // Intentar click en menú de usuario y luego buscar cerrar sesión
        cy.get('nav').find('button').last().click({force: true});
        cy.contains('Cerrar sesión').click({force: true});
      }
    });
    
    // 15. Volver a la página principal
    cy.visit('/');
    cy.contains('Armonía').should('exist');
  });
});
