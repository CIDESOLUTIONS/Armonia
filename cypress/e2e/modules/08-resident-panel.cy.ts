
// Prueba para el Panel de Residente
describe('Panel de Usuario Residente', () => {
  beforeEach(() => {
    // Login como residente antes de cada prueba
    cy.visit('/login');
    cy.get('input[placeholder="Tu correo electrónico"]').type('residente@example.com');
    cy.get('input[placeholder="Tu contraseña"]').type('password');
    cy.contains('Iniciar Sesión').click();
  });

  it('Debería mostrar el dashboard del residente', () => {
    // Verificar que estamos en el dashboard del residente
    cy.url().should('include', '/dashboard/resident');
    
    // Verificar elementos clave del dashboard
    cy.contains('Bienvenido').should('exist');
    cy.contains('Resumen de Cuenta').should('exist');
    cy.contains('Próximos Eventos').should('exist');
    cy.contains('Anuncios Recientes').should('exist');
  });

  it('Debería mostrar el estado de cuenta', () => {
    // Navegar a la sección de estado de cuenta
    cy.contains('Estado de Cuenta').click();
    
    // Verificar que estamos en la sección de estado de cuenta
    cy.url().should('include', '/account');
    
    // Verificar elementos clave del estado de cuenta
    cy.contains('Estado de Cuenta Actual').should('exist');
    cy.contains('Saldo Pendiente').should('exist');
    cy.contains('Última Cuota').should('exist');
    
    // Verificar que muestra el historial de pagos
    cy.contains('Historial de Pagos').should('exist');
    cy.get('table').should('exist');
    
    // Debería haber al menos un registro en el historial
    cy.get('table tbody tr').should('have.length.at.least', 1);
  });

  it('Debería permitir reservar servicios comunes', () => {
    // Navegar a la sección de reservas
    cy.contains('Reservas').click();
    
    // Verificar que estamos en la sección de reservas
    cy.url().should('include', '/bookings');
    
    // Hacer clic en botón para crear nueva reserva
    cy.contains('Nueva Reserva').click();
    
    // Verificar que se abre el formulario de reserva
    cy.contains('Reservar Servicio').should('exist');
    
    // Completar el formulario
    cy.get('select[name="serviceId"]').select(1);
    
    const bookingDate = new Date();
    bookingDate.setDate(bookingDate.getDate() + 2);
    const formattedDate = bookingDate.toISOString().split('T')[0];
    cy.get('input[name="date"]').type(formattedDate);
    
    cy.get('select[name="startTime"]').select('10:00');
    cy.get('select[name="endTime"]').select('12:00');
    
    // Realizar la reserva
    cy.contains('Reservar').click();
    
    // Verificar mensaje de éxito
    cy.contains('Reserva solicitada correctamente').should('exist');
    
    // Verificar que la reserva aparece en la lista de reservas pendientes
    cy.contains('Pendiente').should('exist');
  });

  it('Debería permitir ver el historial de reservas', () => {
    // Navegar a la sección de reservas
    cy.contains('Reservas').click();
    
    // Cambiar a la pestaña de historial
    cy.contains('Historial').click();
    
    // Verificar que estamos en la sección de historial
    cy.contains('Historial de Reservas').should('exist');
    
    // Verificar que existe la tabla de reservas históricas
    cy.get('table').should('exist');
  });

  it('Debería permitir crear una PQR', () => {
    // Navegar a la sección de PQR
    cy.contains('PQR').click();
    
    // Verificar que estamos en la sección de PQR
    cy.url().should('include', '/pqr');
    
    // Hacer clic en botón para crear nueva PQR
    cy.contains('Nueva PQR').click();
    
    // Verificar que se abre el formulario de nueva PQR
    cy.contains('Crear PQR').should('exist');
    
    // Completar el formulario
    cy.get('select[name="pqrType"]').select('Petición');
    cy.get('input[name="subject"]').type('Solicitud de información');
    cy.get('textarea[name="description"]').type('Necesito información sobre el procedimiento para autorizar visitantes.');
    
    // Enviar la PQR
    cy.contains('Enviar').click();
    
    // Verificar mensaje de éxito
    cy.contains('PQR creada correctamente').should('exist');
    
    // Verificar que la PQR aparece en la lista
    cy.contains('Solicitud de información').should('exist');
  });

  it('Debería permitir ver el seguimiento de una PQR', () => {
    // Navegar a la sección de PQR
    cy.contains('PQR').click();
    
    // Hacer clic en el botón de ver detalles de la primera PQR
    cy.get('table tbody tr').first().find('button[aria-label="Ver detalles"]').click();
    
    // Verificar que estamos en la vista de detalles
    cy.contains('Detalles de la PQR').should('exist');
    
    // Verificar información de seguimiento
    cy.contains('Estado:').should('exist');
    cy.contains('Fecha de Creación:').should('exist');
    cy.contains('Historial de Comunicaciones').should('exist');
    
    // Agregar un comentario a la PQR
    cy.get('textarea[name="newComment"]').type('Mensaje de seguimiento de prueba');
    cy.contains('Enviar Comentario').click();
    
    // Verificar que el comentario se ha agregado
    cy.contains('Mensaje de seguimiento de prueba').should('exist');
  });

  it('Debería permitir ver los anuncios y comunicados', () => {
    // Navegar a la sección de anuncios
    cy.contains('Anuncios').click();
    
    // Verificar que estamos en la sección de anuncios
    cy.url().should('include', '/announcements');
    
    // Verificar que muestra el tablón de anuncios
    cy.contains('Tablón de Anuncios').should('exist');
    
    // Verificar que hay anuncios
    cy.get('.announcement-card').should('have.length.at.least', 1);
    
    // Ver detalles de un anuncio
    cy.get('.announcement-card').first().click();
    
    // Verificar que muestra los detalles del anuncio
    cy.contains('Detalles del Anuncio').should('exist');
    
    // Volver a la lista de anuncios
    cy.contains('Volver').click();
    
    // Verificar que regresamos a la lista
    cy.contains('Tablón de Anuncios').should('exist');
  });

  it('Debería permitir ver la información de asambleas', () => {
    // Navegar a la sección de asambleas
    cy.contains('Asambleas').click();
    
    // Verificar que estamos en la sección de asambleas
    cy.url().should('include', '/assemblies');
    
    // Verificar que muestra las próximas asambleas
    cy.contains('Próximas Asambleas').should('exist');
    
    // Ver detalles de una asamblea
    cy.get('table tbody tr').first().find('button[aria-label="Ver detalles"]').click();
    
    // Verificar que muestra los detalles de la asamblea
    cy.contains('Detalles de la Asamblea').should('exist');
    cy.contains('Fecha:').should('exist');
    cy.contains('Tipo:').should('exist');
    cy.contains('Descripción:').should('exist');
  });

  it('Debería permitir participar en votaciones', () => {
    // Navegar a la sección de asambleas
    cy.contains('Asambleas').click();
    
    // Navegar a la subsección de votaciones
    cy.contains('Votaciones').click();
    
    // Verificar que estamos en la sección de votaciones
    cy.url().should('include', '/voting');
    
    // Verificar que muestra las votaciones activas
    cy.contains('Votaciones Activas').should('exist');
    
    // Si hay votaciones activas, participar en la primera
    cy.get('body').then(($body) => {
      if ($body.find('.voting-card').length > 0) {
        // Hacer clic en la primera votación
        cy.get('.voting-card').first().find('button').contains('Votar').click();
        
        // Verificar que se abre la interfaz de votación
        cy.contains('Emitir Voto').should('exist');
        
        // Seleccionar una opción
        cy.get('input[type="radio"]').first().check();
        
        // Confirmar el voto
        cy.contains('Confirmar Voto').click();
        
        // Verificar mensaje de éxito
        cy.contains('Voto registrado correctamente').should('exist');
      } else {
        // Si no hay votaciones activas, verificar que estamos en la página correcta
        cy.url().should('include', '/voting');
      }
    });
  });

  it('Debería permitir ver el directorio de residentes', () => {
    // Navegar a la sección de directorio
    cy.contains('Directorio').click();
    
    // Verificar que estamos en la sección de directorio
    cy.url().should('include', '/directory');
    
    // Verificar que muestra el directorio de residentes
    cy.contains('Directorio de Residentes').should('exist');
    
    // Verificar que existe la tabla o lista de residentes
    cy.get('table, .resident-list').should('exist');
    
    // Buscar un residente
    cy.get('input[placeholder="Buscar residente..."]').type('Juan');
    
    // Verificar que se filtra la lista
    cy.contains('Filtrando resultados').should('exist');
    
    // Limpiar la búsqueda
    cy.get('input[placeholder="Buscar residente..."]').clear();
  });

  it('Debería permitir ver el calendario de eventos', () => {
    // Navegar a la sección de calendario
    cy.contains('Calendario').click();
    
    // Verificar que estamos en la sección de calendario
    cy.url().should('include', '/calendar');
    
    // Verificar que muestra el calendario de eventos
    cy.contains('Calendario de Eventos').should('exist');
    
    // Verificar que existe el calendario
    cy.get('.calendar').should('exist');
    
    // Verificar que hay eventos en el calendario
    cy.get('.calendar-event').should('exist');
    
    // Ver detalles de un evento
    cy.get('.calendar-event').first().click();
    
    // Verificar que muestra los detalles del evento
    cy.contains('Detalles del Evento').should('exist');
    
    // Cerrar los detalles
    cy.get('button[aria-label="Cerrar"]').click();
  });

  it('Debería permitir editar el perfil del usuario', () => {
    // Navegar a la sección de perfil
    cy.contains('Mi Perfil').click();
    
    // Verificar que estamos en la sección de perfil
    cy.url().should('include', '/profile');
    
    // Verificar que muestra el formulario de perfil
    cy.contains('Mi Perfil').should('exist');
    
    // Editar información del perfil
    cy.get('input[name="phone"]').clear().type('3001234567');
    
    // Guardar cambios
    cy.contains('Guardar Cambios').click();
    
    // Verificar mensaje de éxito
    cy.contains('Perfil actualizado correctamente').should('exist');
    
    // Cambiar contraseña
    cy.contains('Cambiar Contraseña').click();
    
    // Verificar que se abre el formulario de cambio de contraseña
    cy.contains('Cambiar Contraseña').should('exist');
    
    // Completar el formulario
    cy.get('input[name="currentPassword"]').type('password');
    cy.get('input[name="newPassword"]').type('newPassword123');
    cy.get('input[name="confirmPassword"]').type('newPassword123');
    
    // Guardar nueva contraseña
    cy.contains('Actualizar Contraseña').click();
    
    // Verificar mensaje de éxito
    cy.contains('Contraseña actualizada correctamente').should('exist');
  });

  it('Debería permitir ver la información de vehículos y mascotas', () => {
    // Navegar a la sección de mis datos
    cy.contains('Mis Datos').click();
    
    // Verificar que estamos en la sección de datos
    cy.url().should('include', '/my-data');
    
    // Verificar la información de vehículos
    cy.contains('Mis Vehículos').should('exist');
    cy.get('.vehicle-card').should('have.length.at.least', 1);
    
    // Verificar la información de mascotas
    cy.contains('Mis Mascotas').should('exist');
    cy.get('.pet-card').should('have.length.at.least', 1);
    
    // Solicitar actualización de datos (si existe esta funcionalidad)
    cy.get('body').then(($body) => {
      if ($body.find('button').contains('Solicitar Actualización').length > 0) {
        cy.contains('Solicitar Actualización').click();
        
        // Completar formulario de solicitud
        cy.get('textarea[name="updateReason"]').type('Cambio de placa de vehículo');
        
        // Enviar solicitud
        cy.contains('Enviar Solicitud').click();
        
        // Verificar mensaje de éxito
        cy.contains('Solicitud enviada correctamente').should('exist');
      }
    });
  });
});
