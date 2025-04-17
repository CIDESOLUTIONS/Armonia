
// Prueba integral de flujo del sistema Armonía
describe('Flujo Integral del Sistema Armonía', () => {
  // Datos de prueba para usuarios
  const adminUser = {
    email: 'admin@example.com',
    password: 'password'
  };
  
  const residentUser = {
    email: 'residente@example.com',
    password: 'password'
  };
  
  const receptionUser = {
    email: 'recepcion@example.com',
    password: 'password'
  };

  it('Debería permitir un flujo completo de gestión de PQR', () => {
    // 1. Residente crea una PQR
    cy.visit('/login');
    cy.get('input[placeholder="Tu correo electrónico"]').type(residentUser.email);
    cy.get('input[placeholder="Tu contraseña"]').type(residentUser.password);
    cy.contains('Iniciar Sesión').click();
    
    // Verificar que inicia sesión correctamente
    cy.url().should('include', '/dashboard/resident');
    
    // Navegar a la sección de PQR
    cy.contains('PQR').click();
    cy.contains('Nueva PQR').click();
    
    // Crear nueva PQR
    const pqrTitle = `Solicitud de mantenimiento ${Date.now()}`;
    cy.get('select[name="pqrType"]').select('Petición');
    cy.get('input[name="subject"]').type(pqrTitle);
    cy.get('textarea[name="description"]').type('Se requiere reparación de una filtración de agua en el baño principal.');
    
    // Enviar la PQR
    cy.contains('Enviar').click();
    
    // Verificar mensaje de éxito
    cy.contains('PQR creada correctamente').should('exist');
    
    // Cerrar sesión
    cy.contains('Cerrar Sesión').click();
    
    // 2. Administrador procesa la PQR
    cy.visit('/login');
    cy.get('input[placeholder="Tu correo electrónico"]').type(adminUser.email);
    cy.get('input[placeholder="Tu contraseña"]').type(adminUser.password);
    cy.contains('Iniciar Sesión').click();
    
    // Navegar a la sección de PQR
    cy.contains('PQR').click();
    
    // Buscar la PQR creada
    cy.get('input[placeholder="Buscar..."]').type(pqrTitle);
    
    // Abrir la PQR
    cy.contains(pqrTitle).parent('tr').find('button[aria-label="Ver detalles"]').click();
    
    // Cambiar el estado de la PQR
    cy.get('select[name="status"]').select('En Proceso');
    cy.contains('Actualizar Estado').click();
    
    // Verificar mensaje de éxito
    cy.contains('Estado actualizado correctamente').should('exist');
    
    // Agregar una respuesta
    cy.contains('Comunicaciones').click();
    cy.get('textarea[name="responseMessage"]').type('Hemos recibido su solicitud. Un técnico visitará su propiedad mañana entre 9 AM y 12 PM.');
    cy.contains('Enviar Respuesta').click();
    
    // Verificar mensaje de éxito
    cy.contains('Respuesta enviada correctamente').should('exist');
    
    // Cerrar sesión
    cy.contains('Cerrar Sesión').click();
    
    // 3. Residente verifica el seguimiento
    cy.visit('/login');
    cy.get('input[placeholder="Tu correo electrónico"]').type(residentUser.email);
    cy.get('input[placeholder="Tu contraseña"]').type(residentUser.password);
    cy.contains('Iniciar Sesión').click();
    
    // Navegar a la sección de PQR
    cy.contains('PQR').click();
    
    // Verificar el estado actualizado de la PQR
    cy.contains(pqrTitle).parent('tr').should('contain', 'En Proceso');
    
    // Ver detalles
    cy.contains(pqrTitle).parent('tr').find('button[aria-label="Ver detalles"]').click();
    
    // Verificar que existe la respuesta del administrador
    cy.contains('Un técnico visitará su propiedad').should('exist');
    
    // Agregar un comentario adicional
    cy.get('textarea[name="newComment"]').type('Gracias por la respuesta. Estaré disponible en ese horario.');
    cy.contains('Enviar Comentario').click();
    
    // Verificar mensaje de éxito
    cy.contains('Comentario enviado correctamente').should('exist');
  });

  it('Debería permitir un flujo completo de reserva de servicios', () => {
    // 1. Residente solicita una reserva
    cy.visit('/login');
    cy.get('input[placeholder="Tu correo electrónico"]').type(residentUser.email);
    cy.get('input[placeholder="Tu contraseña"]').type(residentUser.password);
    cy.contains('Iniciar Sesión').click();
    
    // Navegar a la sección de reservas
    cy.contains('Reservas').click();
    cy.contains('Nueva Reserva').click();
    
    // Crear nueva reserva
    cy.get('select[name="serviceId"]').select('Salón Comunal'); // Asumiendo que existe este servicio
    
    const bookingDate = new Date();
    bookingDate.setDate(bookingDate.getDate() + 3); // 3 días en el futuro
    const formattedDate = bookingDate.toISOString().split('T')[0];
    cy.get('input[name="date"]').type(formattedDate);
    
    cy.get('select[name="startTime"]').select('14:00');
    cy.get('select[name="endTime"]').select('16:00');
    
    // Enviar la reserva
    cy.contains('Reservar').click();
    
    // Verificar mensaje de éxito
    cy.contains('Reserva solicitada correctamente').should('exist');
    
    // Cerrar sesión
    cy.contains('Cerrar Sesión').click();
    
    // 2. Administrador aprueba la reserva
    cy.visit('/login');
    cy.get('input[placeholder="Tu correo electrónico"]').type(adminUser.email);
    cy.get('input[placeholder="Tu contraseña"]').type(adminUser.password);
    cy.contains('Iniciar Sesión').click();
    
    // Navegar a la sección de servicios y reservas
    cy.contains('Servicios').click();
    cy.contains('Reservas').click();
    
    // Filtrar por reservas pendientes
    cy.get('select[name="bookingStatus"]').select('Pendiente');
    
    // Buscar la reserva para la fecha seleccionada
    cy.contains(formattedDate)
      .parent('tr')
      .find('button[aria-label="Aprobar"]')
      .click();
    
    // Confirmar la aprobación
    cy.contains('Confirmar').click();
    
    // Verificar mensaje de éxito
    cy.contains('Reserva aprobada correctamente').should('exist');
    
    // Cerrar sesión
    cy.contains('Cerrar Sesión').click();
    
    // 3. Residente verifica el estado de su reserva
    cy.visit('/login');
    cy.get('input[placeholder="Tu correo electrónico"]').type(residentUser.email);
    cy.get('input[placeholder="Tu contraseña"]').type(residentUser.password);
    cy.contains('Iniciar Sesión').click();
    
    // Navegar a la sección de reservas
    cy.contains('Reservas').click();
    
    // Verificar que la reserva ha sido aprobada
    cy.contains(formattedDate)
      .parent('tr')
      .should('contain', 'Aprobada');
  });

  it('Debería permitir un flujo completo de gestión de visitantes', () => {
    // 1. Recepción registra un visitante
    cy.visit('/login');
    cy.get('input[placeholder="Tu correo electrónico"]').type(receptionUser.email);
    cy.get('input[placeholder="Tu contraseña"]').type(receptionUser.password);
    cy.contains('Iniciar Sesión').click();
    
    // Navegar a la sección de visitantes
    cy.contains('Visitantes').click();
    cy.contains('Registrar Visitante').click();
    
    // Datos del visitante
    const visitorName = `Visitante Prueba ${Date.now()}`;
    cy.get('input[name="visitorName"]').type(visitorName);
    cy.get('input[name="visitorId"]').type('1098765432');
    cy.get('select[name="propertyId"]').select(1);
    cy.get('select[name="visitType"]').select('Social');
    cy.get('textarea[name="visitPurpose"]').type('Visita familiar');
    
    // Registrar visitante
    cy.contains('Registrar').click();
    
    // Verificar mensaje de éxito
    cy.contains('Visitante registrado correctamente').should('exist');
    
    // 2. Residente verifica la visita registrada
    cy.contains('Cerrar Sesión').click();
    cy.visit('/login');
    cy.get('input[placeholder="Tu correo electrónico"]').type(residentUser.email);
    cy.get('input[placeholder="Tu contraseña"]').type(residentUser.password);
    cy.contains('Iniciar Sesión').click();
    
    // Navegar a la sección de visitantes (si existe en el panel del residente)
    cy.get('body').then(($body) => {
      if ($body.find('a:contains("Visitantes")').length > 0) {
        cy.contains('Visitantes').click();
        // Verificar que el visitante aparece en la lista
        cy.contains(visitorName).should('exist');
      } else {
        // Si no existe la sección de visitantes, verificar en notificaciones o dashboard
        cy.contains('Inicio').click();
        cy.contains('Visitante registrado').should('exist');
      }
    });
    
    // 3. Recepción registra la salida del visitante
    cy.contains('Cerrar Sesión').click();
    cy.visit('/login');
    cy.get('input[placeholder="Tu correo electrónico"]').type(receptionUser.email);
    cy.get('input[placeholder="Tu contraseña"]').type(receptionUser.password);
    cy.contains('Iniciar Sesión').click();
    
    // Navegar a la sección de visitantes
    cy.contains('Visitantes').click();
    
    // Buscar el visitante y registrar su salida
    cy.contains(visitorName)
      .parent('tr')
      .find('button[aria-label="Registrar salida"]')
      .click();
    
    // Confirmar la salida
    cy.contains('Confirmar').click();
    
    // Verificar mensaje de éxito
    cy.contains('Salida registrada correctamente').should('exist');
  });

  it('Debería permitir un flujo completo de gestión de asambleas', () => {
    // 1. Administrador programa una asamblea
    cy.visit('/login');
    cy.get('input[placeholder="Tu correo electrónico"]').type(adminUser.email);
    cy.get('input[placeholder="Tu contraseña"]').type(adminUser.password);
    cy.contains('Iniciar Sesión').click();
    
    // Navegar a la sección de asambleas
    cy.contains('Asambleas').click();
    cy.contains('Programar Asamblea').click();
    
    // Datos de la asamblea
    const assemblyTitle = `Asamblea Extraordinaria ${Date.now()}`;
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 10);
    const formattedDate = futureDate.toISOString().split('T')[0];
    
    cy.get('input[name="date"]').type(formattedDate);
    cy.get('input[name="time"]').type('18:00');
    cy.get('select[name="assemblyType"]').select('Extraordinaria');
    cy.get('input[name="title"]').type(assemblyTitle);
    cy.get('textarea[name="description"]').type('Asamblea para discutir proyectos de renovación.');
    
    // Guardar la asamblea
    cy.contains('Guardar').click();
    
    // Verificar mensaje de éxito
    cy.contains('Asamblea programada correctamente').should('exist');
    
    // 2. Administrador crea una votación para la asamblea
    cy.contains('Votaciones').click();
    cy.get('select[name="assemblyId"]').select(assemblyTitle);
    cy.contains('Nueva Votación').click();
    
    // Datos de la votación
    const votingTitle = `Votación Proyecto ${Date.now()}`;
    cy.get('input[name="title"]').type(votingTitle);
    cy.get('textarea[name="description"]').type('Votación para aprobar el proyecto de renovación del salón comunal.');
    cy.get('select[name="votingType"]').select('Simple Mayoría');
    
    // Agregar opciones
    cy.contains('Agregar Opción').click();
    cy.get('input[name="options[0]"]').type('Aprobar');
    cy.contains('Agregar Opción').click();
    cy.get('input[name="options[1]"]').type('Rechazar');
    cy.contains('Agregar Opción').click();
    cy.get('input[name="options[2]"]').type('Abstención');
    
    // Crear la votación
    cy.contains('Crear Votación').click();
    
    // Verificar mensaje de éxito
    cy.contains('Votación creada correctamente').should('exist');
    
    // 3. Residente revisa asamblea y participa en votación
    cy.contains('Cerrar Sesión').click();
    cy.visit('/login');
    cy.get('input[placeholder="Tu correo electrónico"]').type(residentUser.email);
    cy.get('input[placeholder="Tu contraseña"]').type(residentUser.password);
    cy.contains('Iniciar Sesión').click();
    
    // Navegar a la sección de asambleas
    cy.contains('Asambleas').click();
    
    // Verificar que la asamblea aparece en la lista
    cy.contains(assemblyTitle).should('exist');
    
    // Navegar a votaciones
    cy.contains('Votaciones').click();
    
    // Buscar y participar en la votación
    cy.contains(votingTitle)
      .parent('.voting-card')
      .find('button')
      .contains('Votar')
      .click();
    
    // Emitir voto
    cy.get('input[value="Aprobar"]').check();
    cy.contains('Confirmar Voto').click();
    
    // Verificar mensaje de éxito
    cy.contains('Voto registrado correctamente').should('exist');
    
    // 4. Administrador verifica resultados de votación
    cy.contains('Cerrar Sesión').click();
    cy.visit('/login');
    cy.get('input[placeholder="Tu correo electrónico"]').type(adminUser.email);
    cy.get('input[placeholder="Tu contraseña"]').type(adminUser.password);
    cy.contains('Iniciar Sesión').click();
    
    // Navegar a la sección de asambleas y votaciones
    cy.contains('Asambleas').click();
    cy.contains('Votaciones').click();
    
    // Seleccionar la asamblea
    cy.get('select[name="assemblyId"]').select(assemblyTitle);
    
    // Verificar resultados de la votación
    cy.contains(votingTitle)
      .parent('tr')
      .find('button[aria-label="Ver resultados"]')
      .click();
    
    // Verificar que muestra los resultados
    cy.contains('Resultados de la Votación').should('exist');
    cy.contains('Aprobar').should('exist');
    cy.contains('Participación:').should('exist');
  });
});
