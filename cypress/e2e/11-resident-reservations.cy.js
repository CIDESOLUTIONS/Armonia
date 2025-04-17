// Pruebas para el Módulo de Reservas del Residente
describe('Módulo de Reservas del Residente', () => {
  beforeEach(() => {
    // Login como residente antes de cada prueba
    cy.visit('/login');
    cy.get('input[name="email"]').type(Cypress.env('residentEmail'));
    cy.get('input[name="password"]').type(Cypress.env('residentPassword'));
    cy.contains('Iniciar Sesión').click();
    
    // Navegar al módulo de reservas
    cy.get('[data-testid="sidebar"]').contains('Reservas').click();
    
    // Esperar a que cargue la página de reservas
    cy.url().should('include', '/resident/reservations');
    cy.contains('Reserva de Servicios', { timeout: 10000 }).should('be.visible');
  });

  it('Debería mostrar las secciones principales del módulo de reservas', () => {
    // Verificar secciones
    cy.contains('Servicios Disponibles').should('be.visible');
    cy.contains('Mis Reservas').should('be.visible');
  });

  it('Debería mostrar el listado de servicios disponibles', () => {
    // Verificar listado o tarjetas de servicios
    cy.get('[data-testid="services-list"]').should('be.visible');
    
    // Verificar que existan servicios
    cy.get('[data-testid="service-card"]').should('have.length.at.least', 1);
    
    // Verificar información en cada tarjeta
    cy.get('[data-testid="service-card"]').first().within(() => {
      cy.get('[data-testid="service-name"]').should('be.visible');
      cy.get('[data-testid="service-rate"]').should('be.visible');
      cy.get('[data-testid="reserve-button"]').should('be.visible');
    });
  });

  it('Debería mostrar el listado de mis reservas', () => {
    // Clic en la pestaña de mis reservas
    cy.contains('Mis Reservas').click();
    
    // Verificar tabla o listado
    cy.get('[data-testid="my-reservations-table"]').should('be.visible');
    
    // Verificar encabezados
    cy.contains('Servicio').should('be.visible');
    cy.contains('Fecha').should('be.visible');
    cy.contains('Horario').should('be.visible');
    cy.contains('Estado').should('be.visible');
  });

  it('Debería permitir hacer una nueva reserva', () => {
    // Seleccionar un servicio para reservar
    cy.get('[data-testid="service-card"]').first().find('[data-testid="reserve-button"]').click();
    
    // Verificar página de reserva
    cy.contains('Reservar').should('be.visible');
    
    // Verificar formulario
    cy.get('[data-testid="reservation-form"]').should('be.visible');
    
    // Obtener el nombre del servicio
    cy.get('[data-testid="service-name"]').invoke('text').as('serviceName');
    
    // Seleccionar fecha
    cy.get('input[name="date"]').type('2025-05-15');
    
    // Seleccionar horario
    cy.get('select[name="timeSlot"]').select('14:00 - 16:00');
    
    // Agregar comentarios
    cy.get('textarea[name="comments"]').type('Celebración de cumpleaños familiar');
    
    // Aceptar términos
    cy.get('input[name="termsAccepted"]').check();
    
    // Confirmar reserva
    cy.contains('Confirmar Reserva').click();
    
    // Verificar mensaje de éxito
    cy.contains('Reserva realizada correctamente').should('be.visible');
    
    // Verificar redirección a mis reservas
    cy.contains('Mis Reservas').should('be.visible');
    
    // Verificar que la nueva reserva aparezca en la lista
    cy.get('@serviceName').then(serviceName => {
      cy.get('[data-testid="my-reservations-table"]').contains(serviceName).should('be.visible');
    });
  });

  it('Debería permitir ver el calendario de disponibilidad', () => {
    // Seleccionar un servicio para ver su disponibilidad
    cy.get('[data-testid="service-card"]').first().find('[data-testid="view-availability-button"]').click();
    
    // Verificar que se muestre el calendario
    cy.get('[data-testid="availability-calendar"]').should('be.visible');
    
    // Verificar elementos del calendario
    cy.contains('Disponibilidad').should('be.visible');
    cy.get('[data-testid="calendar-days"]').should('be.visible');
    cy.get('[data-testid="calendar-time-slots"]').should('be.visible');
    
    // Verificar que se pueda cerrar el calendario
    cy.get('[data-testid="close-calendar-button"]').click();
    
    // Verificar que volvamos a la página de servicios
    cy.contains('Servicios Disponibles').should('be.visible');
  });

  it('Debería permitir cancelar una reserva', () => {
    // Ir a la pestaña de mis reservas
    cy.contains('Mis Reservas').click();
    
    // Verificar si hay reservas
    cy.get('[data-testid="my-reservations-table"] tbody tr').then($rows => {
      if ($rows.length > 0) {
        // Clic en botón de cancelar de la primera reserva que no esté cancelada
        cy.get('[data-testid="my-reservations-table"] tbody tr')
          .not(':contains("Cancelada")')
          .first()
          .find('[data-testid="cancel-reservation-button"]')
          .click();
        
        // Verificar modal de confirmación
        cy.get('[data-testid="cancel-confirmation-modal"]').should('be.visible');
        
        // Agregar motivo de cancelación
        cy.get('textarea[name="cancellationReason"]').type('No podré asistir por motivos personales');
        
        // Confirmar cancelación
        cy.contains('Confirmar Cancelación').click();
        
        // Verificar mensaje de éxito
        cy.contains('Reserva cancelada correctamente').should('be.visible');
      } else {
        // Si no hay reservas, mostrar mensaje
        cy.log('No hay reservas disponibles para cancelar');
      }
    });
  });

  it('Debería mostrar el historial completo de reservas', () => {
    // Ir a la pestaña de mis reservas
    cy.contains('Mis Reservas').click();
    
    // Clic en ver historial completo
    cy.contains('Ver Historial Completo').click();
    
    // Verificar página de historial
    cy.contains('Historial de Reservas').should('be.visible');
    
    // Verificar tabla de historial
    cy.get('[data-testid="reservations-history-table"]').should('be.visible');
    
    // Verificar que se puedan filtrar por fecha
    cy.get('input[name="startDate"]').type('2025-01-01');
    cy.get('input[name="endDate"]').type('2025-12-31');
    cy.contains('Filtrar').click();
    
    // Verificar que se puedan filtrar por estado
    cy.get('select[name="statusFilter"]').select('Todas');
  });

  it('Debería permitir ver las reglas y políticas de uso de servicios', () => {
    // Clic en el botón o enlace de reglas y políticas
    cy.contains('Reglas y Políticas').click();
    
    // Verificar que se muestre la información
    cy.get('[data-testid="rules-policies-modal"]').should('be.visible');
    
    // Verificar contenido
    cy.contains('Reglas Generales').should('be.visible');
    cy.contains('Políticas de Cancelación').should('be.visible');
    cy.contains('Horarios de Uso').should('be.visible');
    
    // Cerrar modal
    cy.get('[data-testid="close-rules-modal"]').click();
  });

  it('Debería permitir pagar por un servicio reservado', () => {
    // Ir a la pestaña de mis reservas
    cy.contains('Mis Reservas').click();
    
    // Verificar si hay reservas pendientes de pago
    cy.get('[data-testid="my-reservations-table"] tbody tr').then($rows => {
      if ($rows.length > 0) {
        // Intentar encontrar una reserva pendiente de pago
        cy.get('[data-testid="my-reservations-table"] tbody tr')
          .contains('Pendiente de Pago')
          .parent('tr')
          .find('[data-testid="pay-reservation-button"]')
          .then($btn => {
            if ($btn.length > 0) {
              // Si existe, hacer clic en el botón de pago
              cy.wrap($btn).click();
              
              // Verificar página de pago
              cy.contains('Pagar Reserva').should('be.visible');
              
              // Seleccionar método de pago
              cy.get('select[name="paymentMethod"]').select('Tarjeta de Crédito');
              
              // Llenar datos de tarjeta (simulación)
              cy.get('input[name="cardNumber"]').type('4111111111111111');
              cy.get('input[name="cardName"]').type('Usuario Prueba');
              cy.get('input[name="expiryDate"]').type('12/25');
              cy.get('input[name="cvv"]').type('123');
              
              // Confirmar pago
              cy.contains('Confirmar Pago').click();
              
              // Verificar procesamiento y resultado
              cy.contains('Pago realizado con éxito', { timeout: 20000 }).should('be.visible');
            } else {
              cy.log('No hay reservas pendientes de pago');
            }
          });
      } else {
        cy.log('No hay reservas disponibles para pagar');
      }
    });
  });
});
