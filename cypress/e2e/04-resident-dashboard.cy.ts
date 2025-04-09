// Prueba para el panel de residentes
describe('Panel de Residentes', () => {
  beforeEach(() => {
    // Iniciar sesión como residente antes de cada prueba
    cy.visit('/login');
    cy.get('form').within(() => {
      cy.get('input[name="email"]').type('resident@example.com');
      cy.get('input[name="password"]').type('password123');
      cy.get('button[type="submit"]').click();
    });
    
    // Verificar que estamos en el dashboard
    cy.url().should('include', '/resident');
  });

  afterEach(() => {
    // Cerrar sesión después de cada prueba
    cy.contains('Cerrar Sesión').click();
    cy.url().should('include', '/login');
  });

  it('Debería mostrar el panel principal del residente', () => {
    // Verificar elementos del dashboard
    cy.contains('Mi Dashboard').should('be.visible');
    cy.contains('Bienvenido, Residente Ejemplo').should('be.visible');
    
    // Verificar widgets del dashboard
    cy.contains('Mi Propiedad').should('be.visible');
    cy.contains('Pagos Pendientes').should('be.visible');
    cy.contains('Próximos Eventos').should('be.visible');
    cy.contains('Reservas de Servicios').should('be.visible');
  });

  it('Debería mostrar la información de la propiedad', () => {
    // Hacer clic en el widget o menú de Propiedad
    cy.contains('Mi Propiedad').click();
    
    // Verificar que estamos en la página de detalles de la propiedad
    cy.url().should('include', '/resident/property');
    
    // Verificar elementos de la página de detalles
    cy.contains('Mi Propiedad').should('be.visible');
    cy.contains('Información General').should('be.visible');
    cy.contains('Residentes').should('be.visible');
    cy.contains('Vehículos').should('be.visible');
    cy.contains('Mascotas').should('be.visible');
  });

  it('Debería mostrar el historial de pagos', () => {
    // Hacer clic en el menú de Finanzas
    cy.contains('Finanzas').click();
    cy.contains('Mis Pagos').click();
    
    // Verificar que estamos en la página de historial de pagos
    cy.url().should('include', '/resident/financial/payments');
    
    // Verificar elementos de la página de pagos
    cy.contains('Historial de Pagos').should('be.visible');
    cy.get('table').should('be.visible');
    cy.contains('Cuota de administración').should('be.visible');
    cy.contains('PAID').should('be.visible');
    cy.contains('PENDING').should('be.visible');
  });

  it('Debería mostrar la sección de cuotas pendientes', () => {
    // Hacer clic en el menú de Finanzas
    cy.contains('Finanzas').click();
    cy.contains('Cuotas Pendientes').click();
    
    // Verificar que estamos en la página de cuotas pendientes
    cy.url().should('include', '/resident/financial/fees');
    
    // Verificar elementos de la página de cuotas pendientes
    cy.contains('Cuotas Pendientes').should('be.visible');
    cy.get('table').should('be.visible');
    cy.contains('Cuota de administración').should('be.visible');
    cy.contains('Cuota extraordinaria').should('be.visible');
  });

  it('Debería gestionar reservas de servicios', () => {
    // Hacer clic en el menú de Servicios
    cy.contains('Servicios').click();
    
    // Verificar que estamos en la página de servicios
    cy.url().should('include', '/resident/services');
    
    // Verificar elementos de la página de servicios
    cy.contains('Servicios Comunes').should('be.visible');
    cy.contains('Salón Comunal').should('be.visible');
    cy.contains('Piscina').should('be.visible');
    cy.contains('Cancha de Tenis').should('be.visible');
    cy.contains('Zona BBQ').should('be.visible');
    
    // Crear una reserva
    cy.contains('Reservar').first().click();
    
    // Verificar formulario de reserva
    cy.contains('Nueva Reserva').should('be.visible');
    cy.get('input[type="date"]').should('be.visible');
    cy.get('input[type="time"]').should('be.visible');
    cy.contains('Costo de Reserva').should('be.visible');
    cy.contains('Reservar').click();
    
    // Verificar confirmación
    cy.contains('Reserva creada con éxito').should('be.visible');
  });

  it('Debería mostrar historial de reservas', () => {
    // Hacer clic en el menú de Servicios
    cy.contains('Servicios').click();
    cy.contains('Mis Reservas').click();
    
    // Verificar que estamos en la página de mis reservas
    cy.url().should('include', '/resident/services/reservations');
    
    // Verificar elementos de la página de reservas
    cy.contains('Mis Reservas').should('be.visible');
    cy.get('table').should('be.visible');
    cy.contains('CONFIRMED').should('be.visible');
    cy.contains('COMPLETED').should('be.visible');
  });

  it('Debería mostrar información de asambleas', () => {
    // Hacer clic en el menú de Asambleas
    cy.contains('Asambleas').click();
    
    // Verificar que estamos en la página de asambleas
    cy.url().should('include', '/resident/assemblies');
    
    // Verificar elementos de la página de asambleas
    cy.contains('Asambleas').should('be.visible');
    cy.get('table').should('be.visible');
    cy.contains('Asamblea Ordinaria Anual 2025').should('be.visible');
    cy.contains('Asamblea Extraordinaria').should('be.visible');
  });

  it('Debería permitir ver detalles de una asamblea', () => {
    // Navegar a asambleas
    cy.contains('Asambleas').click();
    
    // Ver detalles de la primera asamblea
    cy.contains('Ver').first().click();
    
    // Verificar que estamos en la página de detalles
    cy.url().should('include', '/resident/assemblies/');
    
    // Verificar elementos de la página de detalles
    cy.contains('Detalles de la Asamblea').should('be.visible');
    cy.contains('Fecha').should('be.visible');
    cy.contains('Tipo').should('be.visible');
    cy.contains('Estado').should('be.visible');
    cy.contains('Agenda').should('be.visible');
    cy.contains('Resultados de Votación').should('be.visible');
  });

  it('Debería permitir crear y gestionar PQRs', () => {
    // Hacer clic en el menú de PQR
    cy.contains('PQR').click();
    
    // Verificar que estamos en la página de PQR
    cy.url().should('include', '/resident/pqr');
    
    // Verificar elementos de la página de PQR
    cy.contains('Mis Peticiones, Quejas y Reclamos').should('be.visible');
    cy.get('table').should('be.visible');
    
    // Crear una nueva PQR
    cy.contains('Nueva PQR').click();
    
    // Verificar formulario de PQR
    cy.contains('Nueva Petición, Queja o Reclamo').should('be.visible');
    cy.get('select[name="type"]').select('PETICION');
    cy.get('input[name="title"]').type('Solicitud de información');
    cy.get('textarea[name="description"]').type('Necesito información sobre el procedimiento para modificar mi apartamento.');
    cy.get('select[name="priority"]').select('MEDIA');
    cy.contains('Enviar').click();
    
    // Verificar confirmación
    cy.contains('PQR creada con éxito').should('be.visible');
    
    // Verificar que aparece en la lista
    cy.contains('Solicitud de información').should('be.visible');
  });

  it('Debería permitir modificar perfil de usuario', () => {
    // Hacer clic en el perfil de usuario
    cy.get('nav').contains('Residente Ejemplo').click();
    cy.contains('Mi Perfil').click();
    
    // Verificar que estamos en la página de perfil
    cy.url().should('include', '/resident/profile');
    
    // Verificar elementos de la página de perfil
    cy.contains('Mi Perfil').should('be.visible');
    cy.contains('Información Personal').should('be.visible');
    cy.contains('Cambiar Contraseña').should('be.visible');
    
    // Modificar información personal
    cy.get('input[name="phone"]').clear().type('3211234567');
    cy.contains('Guardar Cambios').click();
    
    // Verificar confirmación
    cy.contains('Perfil actualizado con éxito').should('be.visible');
  });

  it('Debería permitir participar en votaciones abiertas', () => {
    // Navegar a asambleas
    cy.contains('Asambleas').click();
    
    // Buscar votaciones abiertas (si las hay)
    cy.contains('Votaciones Abiertas').click();
    
    // Si hay votaciones abiertas
    cy.get('body').then(($body) => {
      if ($body.text().includes('No hay votaciones abiertas actualmente')) {
        cy.log('No hay votaciones abiertas para participar');
      } else {
        // Participar en la votación
        cy.contains('Votar').first().click();
        
        // Verificar opciones de voto
        cy.contains('Sí').click();
        cy.contains('Enviar Voto').click();
        
        // Verificar confirmación
        cy.contains('Voto registrado con éxito').should('be.visible');
      }
    });
  });

  it('Debería mostrar directorio de residentes si está habilitado', () => {
    // Hacer clic en el menú de Comunidad
    cy.contains('Comunidad').click();
    cy.contains('Directorio').click();
    
    // Verificar que estamos en la página de directorio
    cy.url().should('include', '/resident/community/directory');
    
    // Verificar elementos de la página de directorio
    cy.get('body').then(($body) => {
      if ($body.text().includes('Directorio no disponible')) {
        cy.log('Directorio no está habilitado');
      } else {
        cy.contains('Directorio de Residentes').should('be.visible');
        cy.get('table').should('be.visible');
      }
    });
  });

  it('Debería mostrar comunicados y anuncios', () => {
    // Hacer clic en el menú de Comunicados
    cy.contains('Comunicados').click();
    
    // Verificar que estamos en la página de comunicados
    cy.url().should('include', '/resident/announcements');
    
    // Verificar elementos de la página de comunicados
    cy.contains('Comunicados y Anuncios').should('be.visible');
    
    // Verificar que hay al menos un comunicado
    cy.get('.announcement-card').should('have.length.at.least', 1);
  });
});
