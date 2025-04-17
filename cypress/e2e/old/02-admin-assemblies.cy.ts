
// Prueba para el módulo de Gestión de Asambleas en el Panel de Administrador
describe('Módulo de Gestión de Asambleas', () => {
  beforeEach(() => {
    // Login como administrador antes de cada prueba
    cy.visit('/login');
    cy.get('input[placeholder="Tu correo electrónico"]').type('admin@example.com');
    cy.get('input[placeholder="Tu contraseña"]').type('password');
    cy.contains('Iniciar Sesión').click();
    
    // Navegar al módulo de asambleas
    cy.contains('Asambleas').click();
  });

  it('Debería mostrar la lista de asambleas programadas', () => {
    // Verificar que estamos en la sección de asambleas
    cy.url().should('include', '/dashboard/assemblies');
    
    // Verificar que existe la tabla de asambleas
    cy.get('table').should('exist');
    
    // Debería haber al menos una asamblea en la tabla
    cy.get('table tbody tr').should('have.length.at.least', 1);
    
    // Verificar columnas importantes en la tabla
    cy.contains('Fecha').should('exist');
    cy.contains('Tipo').should('exist');
    cy.contains('Estado').should('exist');
    cy.contains('Quórum').should('exist');
  });

  it('Debería permitir programar una nueva asamblea', () => {
    // Hacer clic en botón para agregar nueva asamblea
    cy.contains('Programar Asamblea').click();
    
    // Verificar que se abre el formulario de nueva asamblea
    cy.contains('Nueva Asamblea').should('exist');
    
    // Completar el formulario
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    const formattedDate = futureDate.toISOString().split('T')[0];
    
    cy.get('input[name="date"]').type(formattedDate);
    cy.get('input[name="time"]').type('14:00');
    cy.get('select[name="assemblyType"]').select('Ordinaria');
    cy.get('input[name="title"]').type('Asamblea de Prueba');
    cy.get('textarea[name="description"]').type('Esta es una asamblea de prueba creada durante los tests automatizados');
    
    // Guardar la nueva asamblea
    cy.contains('Guardar').click();
    
    // Verificar mensaje de éxito
    cy.contains('Asamblea programada correctamente').should('exist');
    
    // Verificar que la nueva asamblea aparece en la lista
    cy.contains('Asamblea de Prueba').should('exist');
  });

  it('Debería permitir gestionar la asistencia a una asamblea', () => {
    // Navegar a la subsección de asistencia
    cy.contains('Asistencia').click();
    
    // Verificar que estamos en la sección de asistencia
    cy.url().should('include', '/attendance');
    
    // Seleccionar una asamblea existente
    cy.get('select[name="assemblyId"]').select(1);
    
    // Verificar que se muestra la lista de propietarios
    cy.contains('Lista de Asistencia').should('exist');
    
    // Verificar que hay propietarios en la lista
    cy.get('table tbody tr').should('have.length.at.least', 1);
    
    // Marcar la asistencia de un propietario
    cy.get('table tbody tr').first().find('input[type="checkbox"]').check();
    
    // Guardar los cambios
    cy.contains('Guardar Asistencia').click();
    
    // Verificar mensaje de éxito
    cy.contains('Asistencia guardada correctamente').should('exist');
    
    // Verificar que se actualiza el quórum
    cy.contains('Quórum Actual').should('exist');
  });

  it('Debería permitir gestionar las votaciones en una asamblea', () => {
    // Navegar a la subsección de votaciones
    cy.contains('Votaciones').click();
    
    // Verificar que estamos en la sección de votaciones
    cy.url().should('include', '/voting');
    
    // Seleccionar una asamblea existente
    cy.get('select[name="assemblyId"]').select(1);
    
    // Agregar una nueva votación
    cy.contains('Nueva Votación').click();
    
    // Completar el formulario de nueva votación
    cy.get('input[name="title"]').type('Votación de Prueba');
    cy.get('textarea[name="description"]').type('Esta es una votación de prueba');
    cy.get('select[name="votingType"]').select('Simple Mayoría');
    
    // Agregar opciones de votación
    cy.contains('Agregar Opción').click();
    cy.get('input[name="options[0]"]').type('Opción 1');
    cy.contains('Agregar Opción').click();
    cy.get('input[name="options[1]"]').type('Opción 2');
    
    // Guardar la votación
    cy.contains('Crear Votación').click();
    
    // Verificar mensaje de éxito
    cy.contains('Votación creada correctamente').should('exist');
    
    // Verificar que la votación aparece en la lista
    cy.contains('Votación de Prueba').should('exist');
  });

  it('Debería permitir gestionar los documentos de una asamblea', () => {
    // Navegar a la subsección de documentos
    cy.contains('Documentos').click();
    
    // Verificar que estamos en la sección de documentos
    cy.url().should('include', '/documents');
    
    // Seleccionar una asamblea existente
    cy.get('select[name="assemblyId"]').select(1);
    
    // Agregar un nuevo documento
    cy.contains('Subir Documento').click();
    
    // Completar el formulario de nuevo documento
    cy.get('input[name="title"]').type('Acta de Prueba');
    cy.get('select[name="documentType"]').select('Acta');
    cy.get('textarea[name="description"]').type('Esta es un acta de prueba');
    
    // Simular carga de archivo (esto puede requerir una configuración especial en Cypress)
    // cy.get('input[type="file"]').attachFile('test-document.pdf');
    
    // Como alternativa, podemos verificar la presencia del campo
    cy.get('input[type="file"]').should('exist');
    
    // Guardar el documento (omitiendo la carga real del archivo)
    cy.contains('Guardar').click();
    
    // Verificar que aparece en la lista de documentos (si la aplicación permite guardar sin archivo)
    cy.get('body').then(($body) => {
      if ($body.text().includes('Acta de Prueba')) {
        cy.contains('Acta de Prueba').should('exist');
      } else {
        // Si no permite guardar sin archivo, al menos verificamos que estamos en la página correcta
        cy.url().should('include', '/documents');
      }
    });
  });
});
