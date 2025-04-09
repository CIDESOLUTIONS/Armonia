
// Prueba para el módulo de PQR (Peticiones, Quejas y Reclamos) en el Panel de Administrador
describe('Módulo de PQR', () => {
  beforeEach(() => {
    // Login como administrador antes de cada prueba
    cy.visit('/login');
    cy.get('input[placeholder="Tu correo electrónico"]').type('admin@example.com');
    cy.get('input[placeholder="Tu contraseña"]').type('password');
    cy.contains('Iniciar Sesión').click();
    
    // Navegar al módulo de PQR
    cy.contains('PQR').click();
  });

  it('Debería mostrar el listado de PQR', () => {
    // Verificar que estamos en la sección de PQR
    cy.url().should('include', '/dashboard/pqr');
    
    // Verificar que existe la tabla de PQR
    cy.get('table').should('exist');
    
    // Verificar columnas importantes en la tabla
    cy.contains('Tipo').should('exist');
    cy.contains('Asunto').should('exist');
    cy.contains('Solicitante').should('exist');
    cy.contains('Fecha').should('exist');
    cy.contains('Estado').should('exist');
    cy.contains('Prioridad').should('exist');
  });

  it('Debería permitir filtrar PQR por estado', () => {
    // Filtrar por estado pendiente
    cy.get('select[name="statusFilter"]').select('Pendiente');
    
    // Verificar que la tabla se actualiza
    cy.contains('Filtrando por estado: Pendiente').should('exist');
    
    // Verificar que las PQR mostradas tienen el estado correcto
    cy.get('table tbody tr').each(($row) => {
      cy.wrap($row).contains('Pendiente').should('exist');
    });
    
    // Cambiar el filtro
    cy.get('select[name="statusFilter"]').select('En Proceso');
    
    // Verificar que la tabla se actualiza nuevamente
    cy.contains('Filtrando por estado: En Proceso').should('exist');
  });

  it('Debería permitir filtrar PQR por tipo', () => {
    // Filtrar por tipo Petición
    cy.get('select[name="typeFilter"]').select('Petición');
    
    // Verificar que la tabla se actualiza
    cy.contains('Filtrando por tipo: Petición').should('exist');
    
    // Verificar que las PQR mostradas tienen el tipo correcto
    cy.get('table tbody tr').each(($row) => {
      cy.wrap($row).contains('Petición').should('exist');
    });
    
    // Cambiar el filtro
    cy.get('select[name="typeFilter"]').select('Queja');
    
    // Verificar que la tabla se actualiza nuevamente
    cy.contains('Filtrando por tipo: Queja').should('exist');
  });

  it('Debería permitir crear una nueva PQR', () => {
    // Hacer clic en botón para crear nueva PQR
    cy.contains('Crear PQR').click();
    
    // Verificar que se abre el formulario de nueva PQR
    cy.contains('Nueva PQR').should('exist');
    
    // Completar el formulario
    cy.get('select[name="pqrType"]').select('Petición');
    cy.get('input[name="subject"]').type('Solicitud de mantenimiento');
    cy.get('textarea[name="description"]').type('Se requiere mantenimiento en el área común de la piscina');
    cy.get('select[name="priority"]').select('Media');
    
    // Seleccionar residente
    cy.get('select[name="residentId"]').select(1);
    
    // Guardar la nueva PQR
    cy.contains('Crear').click();
    
    // Verificar mensaje de éxito
    cy.contains('PQR creada correctamente').should('exist');
    
    // Verificar que la nueva PQR aparece en la lista
    cy.contains('Solicitud de mantenimiento').should('exist');
  });

  it('Debería permitir ver los detalles de una PQR', () => {
    // Hacer clic en el botón de detalles de la primera PQR
    cy.get('table tbody tr').first().find('button[aria-label="Ver detalles"]').click();
    
    // Verificar que se muestra la vista de detalles
    cy.contains('Detalles de la PQR').should('exist');
    
    // Verificar información detallada
    cy.contains('Información Básica').should('exist');
    cy.contains('Comunicaciones').should('exist');
    cy.contains('Seguimiento').should('exist');
    
    // Verificar que hay un botón para volver al listado
    cy.contains('Volver').should('exist');
  });

  it('Debería permitir actualizar el estado de una PQR', () => {
    // Hacer clic en el botón de detalles de la primera PQR
    cy.get('table tbody tr').first().find('button[aria-label="Ver detalles"]').click();
    
    // Verificar que estamos en la vista de detalles
    cy.contains('Detalles de la PQR').should('exist');
    
    // Cambiar el estado de la PQR
    cy.get('select[name="status"]').select('En Proceso');
    
    // Guardar el cambio de estado
    cy.contains('Actualizar Estado').click();
    
    // Verificar mensaje de éxito
    cy.contains('Estado actualizado correctamente').should('exist');
    
    // Verificar que el estado se ha actualizado
    cy.get('select[name="status"]').should('have.value', 'En Proceso');
  });

  it('Debería permitir agregar una respuesta a una PQR', () => {
    // Hacer clic en el botón de detalles de la primera PQR
    cy.get('table tbody tr').first().find('button[aria-label="Ver detalles"]').click();
    
    // Verificar que estamos en la vista de detalles
    cy.contains('Detalles de la PQR').should('exist');
    
    // Ir a la sección de comunicaciones
    cy.contains('Comunicaciones').click();
    
    // Agregar una nueva respuesta
    cy.get('textarea[name="responseMessage"]').type('Hemos recibido su solicitud y estamos trabajando en ella. Pronto le informaremos de los avances.');
    
    // Enviar la respuesta
    cy.contains('Enviar Respuesta').click();
    
    // Verificar mensaje de éxito
    cy.contains('Respuesta enviada correctamente').should('exist');
    
    // Verificar que la respuesta aparece en el historial de comunicaciones
    cy.contains('Hemos recibido su solicitud').should('exist');
  });

  it('Debería permitir asignar una PQR a un responsable', () => {
    // Hacer clic en el botón de detalles de la primera PQR
    cy.get('table tbody tr').first().find('button[aria-label="Ver detalles"]').click();
    
    // Verificar que estamos en la vista de detalles
    cy.contains('Detalles de la PQR').should('exist');
    
    // Ir a la sección de seguimiento
    cy.contains('Seguimiento').click();
    
    // Asignar a un responsable
    cy.get('select[name="assigneeId"]').select(1);
    
    // Guardar la asignación
    cy.contains('Asignar').click();
    
    // Verificar mensaje de éxito
    cy.contains('PQR asignada correctamente').should('exist');
    
    // Verificar que se muestra el responsable asignado
    cy.contains('Responsable:').should('exist');
  });

  it('Debería mostrar métricas de PQR', () => {
    // Navegar a la subsección de métricas
    cy.contains('Métricas').click();
    
    // Verificar que estamos en la sección de métricas
    cy.url().should('include', '/metrics');
    
    // Verificar elementos clave de métricas
    cy.contains('Tiempo Promedio de Resolución').should('exist');
    cy.contains('PQR por Tipo').should('exist');
    cy.contains('PQR por Estado').should('exist');
    
    // Verificar que hay gráficos
    cy.get('canvas').should('exist');
    
    // Verificar que hay un selector de período
    cy.get('select[name="period"]').should('exist');
  });
});
