
// Prueba para el módulo de Gestión de Servicios Comunes en el Panel de Administrador
describe('Módulo de Gestión de Servicios Comunes', () => {
  beforeEach(() => {
    // Login como administrador antes de cada prueba
    cy.visit('/login');
    cy.get('input[placeholder="Tu correo electrónico"]').type('admin@example.com');
    cy.get('input[placeholder="Tu contraseña"]').type('password');
    cy.contains('Iniciar Sesión').click();
    
    // Navegar al módulo de servicios
    cy.contains('Servicios').click();
  });

  it('Debería mostrar la lista de servicios comunes', () => {
    // Verificar que estamos en la sección de servicios
    cy.url().should('include', '/dashboard/services');
    
    // Verificar que existe la tabla de servicios
    cy.get('table').should('exist');
    
    // Debería haber al menos un servicio en la tabla
    cy.get('table tbody tr').should('have.length.at.least', 1);
    
    // Verificar columnas importantes en la tabla
    cy.contains('Nombre').should('exist');
    cy.contains('Capacidad').should('exist');
    cy.contains('Tarifa').should('exist');
    cy.contains('Estado').should('exist');
  });

  it('Debería permitir agregar un nuevo servicio', () => {
    // Hacer clic en botón para agregar nuevo servicio
    cy.contains('Agregar Servicio').click();
    
    // Verificar que se abre el formulario de nuevo servicio
    cy.contains('Nuevo Servicio').should('exist');
    
    // Completar el formulario
    cy.get('input[name="serviceName"]').type('Área de Yoga');
    cy.get('input[name="capacity"]').type('15');
    cy.get('input[name="rate"]').type('3');
    cy.get('select[name="rateType"]').select('Por Hora');
    cy.get('textarea[name="description"]').type('Espacio cubierto para prácticas de yoga y meditación');
    
    // Agregar horario disponible
    cy.contains('Agregar Horario').click();
    cy.get('select[name="dayOfWeek"]').select('Lunes');
    cy.get('input[name="startTime"]').type('08:00');
    cy.get('input[name="endTime"]').type('20:00');
    
    // Guardar el nuevo servicio
    cy.contains('Guardar').click();
    
    // Verificar mensaje de éxito
    cy.contains('Servicio creado correctamente').should('exist');
    
    // Verificar que el nuevo servicio aparece en la lista
    cy.contains('Área de Yoga').should('exist');
  });

  it('Debería permitir editar un servicio existente', () => {
    // Hacer clic en el botón de edición del primer servicio
    cy.get('table tbody tr').first().find('button[aria-label="Editar"]').click();
    
    // Verificar que se abre el formulario de edición
    cy.contains('Editar Servicio').should('exist');
    
    // Modificar datos del servicio
    cy.get('input[name="capacity"]').clear().type('25');
    cy.get('input[name="rate"]').clear().type('5');
    
    // Guardar cambios
    cy.contains('Guardar').click();
    
    // Verificar mensaje de éxito
    cy.contains('Servicio actualizado correctamente').should('exist');
  });

  it('Debería mostrar el calendario de reservas', () => {
    // Navegar a la subsección de calendario
    cy.contains('Calendario').click();
    
    // Verificar que estamos en la sección de calendario
    cy.url().should('include', '/calendar');
    
    // Verificar que existe el calendario
    cy.get('.calendar').should('exist');
    
    // Verificar que hay eventos en el calendario
    cy.get('.calendar-event').should('exist');
  });

  it('Debería permitir ver y aprobar reservas pendientes', () => {
    // Navegar a la subsección de reservas
    cy.contains('Reservas').click();
    
    // Verificar que estamos en la sección de reservas
    cy.url().should('include', '/bookings');
    
    // Verificar que existe la tabla de reservas
    cy.get('table').should('exist');
    
    // Verificar columnas importantes en la tabla
    cy.contains('Servicio').should('exist');
    cy.contains('Residente').should('exist');
    cy.contains('Fecha').should('exist');
    cy.contains('Estado').should('exist');
    
    // Seleccionar reservas pendientes
    cy.get('select[name="bookingStatus"]').select('Pendiente');
    
    // Si hay reservas pendientes, aprobar la primera
    cy.get('body').then(($body) => {
      if ($body.find('table tbody tr').length > 0) {
        // Hacer clic en el botón de aprobar de la primera reserva
        cy.get('table tbody tr').first().find('button[aria-label="Aprobar"]').click();
        
        // Confirmar la aprobación
        cy.contains('Confirmar').click();
        
        // Verificar mensaje de éxito
        cy.contains('Reserva aprobada correctamente').should('exist');
      } else {
        // Si no hay reservas pendientes, verificar que estamos en la página correcta
        cy.url().should('include', '/bookings');
      }
    });
  });

  it('Debería mostrar estadísticas de uso de servicios', () => {
    // Navegar a la subsección de estadísticas
    cy.contains('Estadísticas').click();
    
    // Verificar que estamos en la sección de estadísticas
    cy.url().should('include', '/statistics');
    
    // Verificar elementos clave de estadísticas
    cy.contains('Uso de Servicios').should('exist');
    cy.contains('Ingresos por Servicio').should('exist');
    
    // Verificar que hay gráficos
    cy.get('canvas').should('exist');
    
    // Verificar que hay un selector de período
    cy.get('select[name="period"]').should('exist');
    
    // Cambiar el período y verificar que se actualizan los datos
    cy.get('select[name="period"]').select('Último Mes');
    cy.contains('Cargando...').should('not.exist');
  });
});
