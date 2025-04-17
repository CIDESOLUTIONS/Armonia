// Prueba de flujo de integración entre los diferentes portales
describe('Flujo de Integración de Armonía', () => {
  beforeEach(() => {
    cy.fixture('example.json').as('testData');
  });

  it('Debería completar un flujo completo de reserva de servicio común', function() {
    // 1. Administrador configura un servicio
    cy.login('admin');
    cy.contains('Servicios').click();
    cy.contains('Catálogo').click();
    
    // Verificar que el servicio de salón comunal existe
    cy.contains('Salón Comunal').should('exist');
    
    // Configurar el servicio si es necesario
    cy.contains('Salón Comunal').parent().contains('Editar').click();
    
    // Actualizar la disponibilidad
    cy.get('input[name="capacity"]').clear().type('50');
    cy.get('input[name="pricePerHour"]').clear().type('2');
    
    // Guardar cambios
    cy.contains('Guardar Cambios').click();
    
    // Verificar mensaje de éxito
    cy.contains('Servicio actualizado correctamente').should('exist');
    
    // Cerrar sesión como administrador
    cy.get('[data-cy="user-menu"]').click();
    cy.contains('Cerrar Sesión').click();
    
    // 2. Residente hace una reserva
    cy.login('resident');
    cy.contains('Reservar Servicios').click();
    
    // Buscar el servicio y hacer una reserva
    cy.contains('Salón Comunal').parent().contains('Reservar').click();
    
    // Completar formulario de reserva
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const formattedDate = tomorrow.toISOString().split('T')[0];
    
    cy.get('input[type="date"]').type(formattedDate);
    cy.get('select[name="startTime"]').select('15:00');
    cy.get('select[name="endTime"]').select('17:00');
    cy.get('textarea[name="purpose"]').type('Reunión familiar');
    
    // Confirmar reserva
    cy.contains('Confirmar Reserva').click();
    
    // Verificar mensaje de éxito
    cy.contains('Reserva realizada correctamente').should('exist');
    
    // Cerrar sesión como residente
    cy.get('[data-cy="user-menu"]').click();
    cy.contains('Cerrar Sesión').click();
    
    // 3. Administrador aprueba la reserva
    cy.login('admin');
    cy.contains('Servicios').click();
    cy.contains('Reservas').click();
    
    // Buscar la reserva pendiente
    cy.contains('Pendientes').click();
    cy.contains('Reunión familiar').should('exist');
    
    // Aprobar la reserva
    cy.contains('Reunión familiar').parent().contains('Aprobar').click();
    
    // Confirmar aprobación
    cy.contains('Confirmar Aprobación').click();
    
    // Verificar mensaje de éxito
    cy.contains('Reserva aprobada correctamente').should('exist');
    
    // Cerrar sesión como administrador
    cy.get('[data-cy="user-menu"]').click();
    cy.contains('Cerrar Sesión').click();
    
    // 4. Residente verifica la aprobación
    cy.login('resident');
    cy.contains('Reservar Servicios').click();
    cy.contains('Mis Reservas').click();
    
    // Verificar que la reserva aparece como aprobada
    cy.contains('Reunión familiar').parent().contains('Aprobada').should('exist');
    
    // Cerrar sesión como residente
    cy.get('[data-cy="user-menu"]').click();
    cy.contains('Cerrar Sesión').click();
  });

  it('Debería completar un flujo de petición, queja o reclamo', function() {
    // 1. Residente crea una PQR
    cy.login('resident');
    cy.contains('PQR').click();
    
    // Crear una nueva solicitud
    cy.contains('Nueva Solicitud').click();
    
    // Completar el formulario
    const timestamp = Date.now();
    const pqrSubject = `Solicitud de reparación ${timestamp}`;
    
    cy.get('select[name="type"]').select('petition');
    cy.get('input[name="subject"]').type(pqrSubject);
    cy.get('textarea[name="description"]').type('Necesito reparación de una tubería en el baño principal.');
    cy.get('select[name="priority"]').select('medium');
    
    // Enviar solicitud
    cy.contains('Enviar Solicitud').click();
    
    // Verificar mensaje de éxito
    cy.contains('Solicitud enviada correctamente').should('exist');
    
    // Cerrar sesión como residente
    cy.get('[data-cy="user-menu"]').click();
    cy.contains('Cerrar Sesión').click();
    
    // 2. Administrador revisa y asigna la PQR
    cy.login('admin');
    cy.contains('PQR').click();
    cy.contains('Activas').click();
    
    // Buscar la PQR recién creada
    cy.contains(pqrSubject).should('exist');
    
    // Abrir la PQR para asignarla
    cy.contains(pqrSubject).parent().contains('Ver Detalle').click();
    
    // Asignar responsable
    cy.contains('Asignar Responsable').click();
    cy.get('select[name="assignee"]').select(1); // Seleccionar el primer responsable disponible
    cy.contains('Actualizar Estado').click();
    cy.get('select[name="status"]').select('in-progress');
    cy.get('textarea[name="note"]').type('Asignado a mantenimiento. Programar visita.');
    
    // Guardar cambios
    cy.contains('Guardar Cambios').click();
    
    // Verificar mensaje de éxito
    cy.contains('PQR actualizada correctamente').should('exist');
    
    // Cerrar sesión como administrador
    cy.get('[data-cy="user-menu"]').click();
    cy.contains('Cerrar Sesión').click();
    
    // 3. Residente verifica el avance de su PQR
    cy.login('resident');
    cy.contains('PQR').click();
    
    // Buscar la PQR
    cy.contains(pqrSubject).should('exist');
    
    // Verificar que el estado ha cambiado
    cy.contains(pqrSubject).parent().contains('En Proceso').should('exist');
    
    // Ver detalles
    cy.contains(pqrSubject).parent().contains('Ver Detalle').click();
    
    // Verificar comentario del administrador
    cy.contains('Asignado a mantenimiento').should('exist');
    
    // Añadir comentario como residente
    cy.contains('Añadir Comentario').click();
    cy.get('textarea[name="comment"]').type('Gracias. ¿Cuándo podrían realizar la visita?');
    cy.contains('Enviar Comentario').click();
    
    // Verificar mensaje de éxito
    cy.contains('Comentario añadido correctamente').should('exist');
    
    // Cerrar sesión como residente
    cy.get('[data-cy="user-menu"]').click();
    cy.contains('Cerrar Sesión').click();
  });

  it('Debería completar un flujo de registro y seguimiento de visitantes', function() {
    // 1. Residente registra un visitante esperado
    cy.login('resident');
    cy.contains('Visitantes').click();
    
    // Registrar un nuevo visitante
    cy.contains('Pre-registrar Visitante').click();
    
    // Completar el formulario
    const timestamp = Date.now();
    const visitorName = `Visitante Pre-registrado ${timestamp}`;
    
    cy.get('input[name="visitorName"]').type(visitorName);
    cy.get('input[name="visitorId"]').type(`ID-${timestamp}`);
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const formattedDate = tomorrow.toISOString().split('T')[0];
    
    cy.get('input[name="visitDate"]').type(formattedDate);
    cy.get('textarea[name="purpose"]').type('Visita familiar');
    
    // Enviar formulario
    cy.contains('Registrar Visitante').click();
    
    // Verificar mensaje de éxito
    cy.contains('Visitante pre-registrado correctamente').should('exist');
    
    // Cerrar sesión como residente
    cy.get('[data-cy="user-menu"]').click();
    cy.contains('Cerrar Sesión').click();
    
    // 2. Recepcionista recibe al visitante
    cy.login('reception');
    cy.contains('Visitantes').click();
    
    // Verificar visitantes esperados
    cy.contains('Visitantes Esperados').click();
    cy.contains(visitorName).should('exist');
    
    // Registrar la entrada del visitante
    cy.contains(visitorName).parent().contains('Registrar Entrada').click();
    
    // Completar detalles adicionales
    cy.get('textarea[name="notes"]').type('Visitante llega en vehículo particular');
    
    // Confirmar entrada
    cy.contains('Confirmar Entrada').click();
    
    // Verificar mensaje de éxito
    cy.contains('Entrada registrada correctamente').should('exist');
    
    // Verificar que aparece en la lista de visitantes actuales
    cy.contains('Visitantes Actuales').click();
    cy.contains(visitorName).should('exist');
    
    // 3. Recepcionista registra la salida del visitante
    cy.contains(visitorName).parent().contains('Registrar Salida').click();
    
    // Confirmar salida
    cy.contains('Confirmar Salida').click();
    
    // Verificar mensaje de éxito
    cy.contains('Salida registrada correctamente').should('exist');
    
    // Cerrar sesión como recepcionista
    cy.get('[data-cy="user-menu"]').click();
    cy.contains('Cerrar Sesión').click();
    
    // 4. Residente verifica historial de visitantes
    cy.login('resident');
    cy.contains('Visitantes').click();
    cy.contains('Historial').click();
    
    // Verificar que aparece en el historial
    cy.contains(visitorName).should('exist');
    
    // Cerrar sesión como residente
    cy.get('[data-cy="user-menu"]').click();
    cy.contains('Cerrar Sesión').click();
  });
});