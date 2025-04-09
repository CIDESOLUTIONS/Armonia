// Prueba para la landing page y registro de conjuntos
describe('Landing Page y Registro de Conjuntos', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('Debería mostrar la landing page con información sobre Armonía', () => {
    // Verificar elementos principales de la landing page
    cy.contains('h1', 'Armonía');
    cy.contains('Plataforma integral para la gestión de conjuntos residenciales');
    
    // Verificar secciones principales
    cy.contains('h2', 'Beneficios');
    cy.contains('h2', 'Funcionalidades');
    cy.contains('h2', 'Planes');
    
    // Verificar si se muestran los planes (Básico, Estándar, Premium)
    cy.contains('Plan Básico');
    cy.contains('Plan Estándar');
    cy.contains('Plan Premium');
  });

  it('Debería permitir la navegación por la landing page', () => {
    // Verificar enlaces de navegación
    cy.get('nav').within(() => {
      cy.contains('Inicio').click();
      cy.contains('Funcionalidades').click();
      cy.contains('Planes').click();
      cy.contains('Contacto').click();
    });
    
    // Verificar botón de registro y login
    cy.contains('Registrar Conjunto').should('be.visible');
    cy.contains('Iniciar Sesión').should('be.visible');
  });

  it('Debería mostrar el formulario de registro de conjunto', () => {
    // Hacer clic en el botón de registro
    cy.contains('Registrar Conjunto').click();
    
    // Verificar que se muestra el formulario
    cy.get('form').within(() => {
      cy.contains('Registro de Conjunto Residencial');
      cy.get('input[name="complexName"]').should('be.visible');
      cy.get('input[name="totalUnits"]').should('be.visible');
      cy.get('input[name="adminName"]').should('be.visible');
      cy.get('input[name="adminEmail"]').should('be.visible');
      cy.get('input[name="adminPassword"]').should('be.visible');
      cy.get('button[type="submit"]').should('be.visible');
    });
  });

  it('Debería validar los campos requeridos en el formulario de registro', () => {
    // Hacer clic en el botón de registro
    cy.contains('Registrar Conjunto').click();
    
    // Intentar enviar el formulario sin completar los campos
    cy.get('form').within(() => {
      cy.get('button[type="submit"]').click();
      
      // Verificar mensajes de error para campos requeridos
      cy.contains('El nombre del conjunto es requerido');
      cy.contains('El número de unidades es requerido');
      cy.contains('El nombre del administrador es requerido');
      cy.contains('El correo del administrador es requerido');
      cy.contains('La contraseña es requerida');
    });
  });

  it('Debería registrar un nuevo conjunto correctamente', () => {
    // Generar datos aleatorios para evitar duplicados
    const random = Math.floor(Math.random() * 10000);
    const complexName = `Conjunto de Prueba ${random}`;
    const email = `admin${random}@test.com`;
    
    // Hacer clic en el botón de registro
    cy.contains('Registrar Conjunto').click();
    
    // Completar el formulario
    cy.get('form').within(() => {
      cy.get('input[name="complexName"]').type(complexName);
      cy.get('input[name="totalUnits"]').type('25');
      cy.get('input[name="adminName"]').type('Administrador de Prueba');
      cy.get('input[name="adminEmail"]').type(email);
      cy.get('input[name="adminPassword"]').type('Contraseña123!');
      cy.get('input[name="adminPhone"]').type('3001234567');
      cy.get('input[name="address"]').type('Calle 123 # 45-67');
      cy.get('input[name="city"]').type('Ciudad de Prueba');
      cy.get('input[name="state"]').type('Estado de Prueba');
      
      // Seleccionar tipos de propiedad
      cy.get('select[name="propertyTypes"]').select(['APARTMENT', 'HOUSE']);
      
      // Enviar el formulario
      cy.get('button[type="submit"]').click();
    });
    
    // Verificar mensaje de éxito
    cy.contains('Conjunto registrado con éxito', { timeout: 10000 }).should('be.visible');
    
    // Verificar redirección a la página de login
    cy.url().should('include', '/login');
  });

  it('Debería mostrar error al registrar un conjunto con email duplicado', () => {
    // Usar un email que ya existe en la base de datos
    const existingEmail = 'admin@armonia.com';
    
    // Hacer clic en el botón de registro
    cy.contains('Registrar Conjunto').click();
    
    // Completar el formulario con un email que ya existe
    cy.get('form').within(() => {
      cy.get('input[name="complexName"]').type('Conjunto Duplicado');
      cy.get('input[name="totalUnits"]').type('25');
      cy.get('input[name="adminName"]').type('Administrador Duplicado');
      cy.get('input[name="adminEmail"]').type(existingEmail);
      cy.get('input[name="adminPassword"]').type('Contraseña123!');
      
      // Enviar el formulario
      cy.get('button[type="submit"]').click();
    });
    
    // Verificar mensaje de error
    cy.contains('El correo electrónico ya está en uso').should('be.visible');
  });
});
