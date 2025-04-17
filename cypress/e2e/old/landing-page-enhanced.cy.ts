// Prueba mejorada para la landing page de Armonía
describe('Landing Page de Armonía (Prueba de Marketing)', () => {
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

  it('Debería mostrar la sección hero con mensaje principal enfocado en la gestión de conjuntos residenciales', () => {
    // Verificar título principal que comunica el propósito
    cy.contains('Gestión integral para conjuntos residenciales').should('exist');
    
    // Verificar subtítulo que comunica beneficio
    cy.contains('Simplifique la administración').should('exist');
    
    // Verificar presencia de una llamada a la acción clara
    cy.get('button').contains('Comenzar Ahora').should('exist');
  });

  it('Debería mostrar todos los módulos clave de la solución', () => {
    // Verificar título de la sección
    cy.contains('Funcionalidades Completas para su Conjunto').should('exist');
    
    // 1. Verificar módulo de administración
    cy.contains('Administración').should('exist');
    cy.contains('Gestión completa de propiedades').should('exist');
    cy.contains('Inventario detallado de propiedades').should('exist');
    
    // 2. Verificar módulo de portal de residentes
    cy.contains('Portal de Residentes').should('exist');
    cy.contains('Acceso personalizado para propietarios').should('exist');
    cy.contains('Reserva de áreas comunes').should('exist');
    
    // 3. Verificar módulo de recepción y vigilancia
    cy.contains('Recepción y Vigilancia').should('exist');
    cy.contains('Control de acceso').should('exist');
    cy.contains('Registro digital de visitantes').should('exist');
  });

  it('Debería mostrar las características específicas mencionadas en la descripción', () => {
    // Verificar título de la sección
    cy.contains('Características que Facilitan su Gestión').should('exist');
    
    // Verificar las características mencionadas
    cy.contains('Asambleas Virtuales').should('exist');
    cy.contains('verificación de quórum').should('exist');
    
    cy.contains('Gestión Financiera').should('exist');
    cy.contains('Control de presupuestos').should('exist');
    
    cy.contains('Comunicación Integral').should('exist');
    cy.contains('notificaciones personalizadas').should('exist');
    
    cy.contains('Sistema PQR').should('exist');
    cy.contains('Gestión eficiente de peticiones').should('exist');
  });

  it('Debería mostrar la sección de planes con precios y detalles claros', () => {
    // Hacer scroll hasta la sección de planes
    cy.contains('Planes que se adaptan a sus necesidades').scrollIntoView();
    
    // 1. Verificar Plan Básico (Gratuito)
    cy.contains('Plan Básico').should('exist');
    cy.contains('Gratuito').should('exist');
    cy.contains('30 unidades').should('exist');
    
    // 2. Verificar Plan Estándar
    cy.contains('Plan Estándar').should('exist');
    cy.contains('RECOMENDADO').should('exist');
    cy.contains('50 unidades').should('exist');
    
    // 3. Verificar Plan Premium
    cy.contains('Plan Premium').should('exist');
    cy.contains('120 unidades').should('exist');
    
    // Verificar características específicas de los planes para la venta
    cy.contains('Gestión de propiedades y residentes').should('exist');  // Plan Básico
    cy.contains('Gestión de asambleas y votaciones').should('exist');    // Plan Estándar
    cy.contains('Módulo financiero avanzado').should('exist');           // Plan Premium
    cy.contains('API para integraciones').should('exist');               // Plan Premium
  });

  it('Debería mostrar un formulario de registro para prueba gratuita', () => {
    // Hacer scroll hasta la sección de registro
    cy.contains('Registre su Conjunto Residencial').scrollIntoView();
    
    // Verificar la cabecera y descripción
    cy.contains('Registre su Conjunto Residencial').should('exist');
    cy.contains('Complete el formulario para registrar su conjunto').should('exist');
    
    // Verificar el formulario completo
    cy.get('form').should('exist');
    cy.get('input[name="complexName"]').should('exist');
    cy.get('input[name="adminName"]').should('exist');
    cy.get('input[name="adminEmail"]').should('exist');
    cy.get('input[name="adminPhone"]').should('exist');
    cy.get('input[name="address"]').should('exist');
    cy.get('input[name="city"]').should('exist');
    cy.get('input[name="units"]').should('exist');
    
    // Verificar los servicios comunes
    cy.get('#service-pool').should('exist');
    cy.get('#service-salon').should('exist');
    cy.get('#service-gym').should('exist');
    cy.get('#service-bbq').should('exist');
  });

  it('Debería realizar una prueba completa de registro', () => {
    // Hacer scroll hasta el formulario
    cy.contains('Registre su Conjunto Residencial').scrollIntoView();
    
    // Llenar el formulario
    cy.get('input[name="complexName"]').type('Conjunto Prueba Marketing');
    cy.get('input[name="adminName"]').type('Administrador Marketing');
    cy.get('input[name="adminEmail"]').type('marketing@test.com');
    cy.get('input[name="adminPhone"]').type('3001234567');
    cy.get('input[name="address"]').type('Calle Marketing #123');
    cy.get('input[name="city"]').type('Ciudad Test');
    cy.get('input[name="units"]').type('15');
    
    // Marcar varios servicios
    cy.get('#service-pool').check();
    cy.get('#service-salon').check();
    cy.get('#service-bbq').check();
    
    // Enviar el formulario
    cy.contains('Registrar Conjunto').click();
    
    // Verificar el mensaje de confirmación
    cy.on('window:alert', (text) => {
      expect(text).to.contain('¡Gracias por registrar su conjunto!');
    });
    
    // Verificar redirección
    cy.url().should('include', '/portal-selector');
  });

  it('Debería contener toda la información importante para la venta y marketing', () => {
    // Comprobar elementos de confianza y credibilidad
    cy.contains('Soporte Premium').should('exist');
    cy.contains('Migración de Datos').should('exist');
    cy.contains('Capacitación').should('exist');
    
    // Comprobar información de precios
    cy.contains('Planes que se adaptan').scrollIntoView();
    
    // Verificar que los precios estén claros
    cy.contains('Gratuito').should('exist');
    cy.contains('$').should('exist');
    cy.contains('/mes').should('exist');
    
    // Verificar pie de página con contacto y legal
    cy.get('footer').should('exist');
    cy.get('footer').contains('Contacto').should('exist');
    cy.get('footer').contains('Términos').should('exist');
  });

  it('Debería navegar a la página de selector de portal al hacer clic en Iniciar Sesión', () => {
    // Hacer clic en el botón de iniciar sesión
    cy.contains('Iniciar Sesión').click();
    
    // Verificar redirección a la página de selector de portal
    cy.url().should('include', '/portal-selector');
  });
});