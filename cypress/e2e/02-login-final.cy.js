// Prueba final para el login de Armonía
describe('Login en Armonía', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('Debería mostrar el formulario de inicio de sesión', () => {
    // Verificar título de la página
    cy.contains('Iniciar Sesión').should('exist');
    
    // Verificar mensaje informativo
    cy.contains('Acceda a su cuenta en la plataforma Armonía').should('exist');
    
    // Verificar campos del formulario
    cy.get('input[placeholder="Tu correo electrónico"]').should('exist');
    cy.get('input[placeholder="Tu contraseña"]').should('exist');
    
    // Verificar botón de envío
    cy.get('button').contains('Iniciar Sesión').should('exist');
    
    // Verificar enlace para volver al inicio
    cy.contains('Volver al inicio').should('exist');
  });

  it('Debería validar campos requeridos', () => {
    // Hacer clic en el botón sin completar campos
    cy.get('button').contains('Iniciar Sesión').click();
    
    // Verificar mensajes de error
    cy.contains('El correo electrónico es requerido').should('exist');
    cy.contains('La contraseña es requerida').should('exist');
  });

  it('Debería mostrar mensaje de error con credenciales inválidas', () => {
    // Ingresar credenciales claramente incorrectas
    cy.get('input[placeholder="Tu correo electrónico"]').type('usuario.inexistente@ejemplo.com');
    cy.get('input[placeholder="Tu contraseña"]').type('ContraseñaIncorrecta123!');
    
    // Hacer clic en el botón de inicio de sesión
    cy.get('button').contains('Iniciar Sesión').click();
    
    // Verificar mensaje de error (puede variar dependiendo de la implementación)
    cy.get('body').then(($body) => {
      if ($body.text().includes('Credenciales inválidas')) {
        cy.contains('Credenciales inválidas').should('exist');
      } else if ($body.text().includes('Usuario o contraseña incorrectos')) {
        cy.contains('Usuario o contraseña incorrectos').should('exist');
      } else {
        // Cualquier mensaje de error de autenticación
        cy.contains(/error|inválid|incorrect/i).should('exist');
      }
    });
  });

  it('Debería poder volver a la página de inicio', () => {
    // Hacer clic en el enlace para volver al inicio
    cy.contains('Volver al inicio').click();
    
    // Verificar que se redirige a la página principal
    cy.url().should('not.include', '/login');
    
    // Verificar elementos de la página principal
    cy.contains('Armonía').should('exist');
  });

  // Esta prueba solo debería ejecutarse cuando sepamos las credenciales correctas
  // La desactivamos hasta entonces
  it.skip('Debería iniciar sesión correctamente con credenciales válidas', () => {
    // Aquí deberías usar credenciales conocidas y válidas
    const email = 'admin@armonia.com';
    const password = 'contraseña_correcta'; // Sustituir por la contraseña real cuando la sepamos
    
    cy.get('input[placeholder="Tu correo electrónico"]').type(email);
    cy.get('input[placeholder="Tu contraseña"]').type(password);
    
    cy.get('button').contains('Iniciar Sesión').click();
    
    // Verificar redirección después del login exitoso
    cy.url().should('include', '/dashboard');
  });
});
