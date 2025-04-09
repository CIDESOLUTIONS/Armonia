
// Prueba para el módulo de Comunicaciones en el Panel de Administrador
describe('Módulo de Comunicaciones', () => {
  beforeEach(() => {
    // Login como administrador antes de cada prueba
    cy.visit('/login');
    cy.get('input[placeholder="Tu correo electrónico"]').type('admin@example.com');
    cy.get('input[placeholder="Tu contraseña"]').type('password');
    cy.contains('Iniciar Sesión').click();
    
    // Navegar al módulo de comunicaciones
    cy.contains('Comunicaciones').click();
  });

  it('Debería mostrar el tablón de anuncios', () => {
    // Verificar que estamos en la sección de comunicaciones
    cy.url().should('include', '/dashboard/communications');
    
    // Verificar que existe el tablón de anuncios
    cy.contains('Tablón de Anuncios').should('exist');
    
    // Verificar que hay anuncios publicados
    cy.get('.announcement-card').should('have.length.at.least', 1);
  });

  it('Debería permitir publicar un nuevo anuncio', () => {
    // Hacer clic en botón para crear nuevo anuncio
    cy.contains('Nuevo Anuncio').click();
    
    // Verificar que se abre el formulario de nuevo anuncio
    cy.contains('Publicar Anuncio').should('exist');
    
    // Completar el formulario
    cy.get('input[name="title"]').type('Mantenimiento Programado');
    cy.get('textarea[name="content"]').type('Se realizará mantenimiento en las áreas comunes el próximo fin de semana.');
    cy.get('select[name="priority"]').select('Media');
    
    // Seleccionar fecha de expiración (una semana después)
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);
    const formattedDate = expiryDate.toISOString().split('T')[0];
    cy.get('input[name="expiryDate"]').type(formattedDate);
    
    // Publicar el anuncio
    cy.contains('Publicar').click();
    
    // Verificar mensaje de éxito
    cy.contains('Anuncio publicado correctamente').should('exist');
    
    // Verificar que el nuevo anuncio aparece en el tablón
    cy.contains('Mantenimiento Programado').should('exist');
  });

  it('Debería permitir editar un anuncio existente', () => {
    // Hacer clic en el botón de edición del primer anuncio
    cy.get('.announcement-card').first().find('button[aria-label="Editar"]').click();
    
    // Verificar que se abre el formulario de edición
    cy.contains('Editar Anuncio').should('exist');
    
    // Modificar el contenido del anuncio
    cy.get('textarea[name="content"]').clear().type('Contenido actualizado del anuncio de prueba.');
    
    // Guardar cambios
    cy.contains('Guardar').click();
    
    // Verificar mensaje de éxito
    cy.contains('Anuncio actualizado correctamente').should('exist');
    
    // Verificar que el contenido se ha actualizado
    cy.contains('Contenido actualizado del anuncio').should('exist');
  });

  it('Debería permitir eliminar un anuncio', () => {
    // Capturar el título del primer anuncio
    let firstAnnouncementTitle;
    cy.get('.announcement-card').first().find('h3').invoke('text').then((text) => {
      firstAnnouncementTitle = text;
      
      // Hacer clic en el botón de eliminar del primer anuncio
      cy.get('.announcement-card').first().find('button[aria-label="Eliminar"]').click();
      
      // Verificar que aparece un diálogo de confirmación
      cy.contains('¿Está seguro?').should('exist');
      
      // Confirmar la eliminación
      cy.contains('Confirmar').click();
      
      // Verificar mensaje de éxito
      cy.contains('Anuncio eliminado correctamente').should('exist');
      
      // Verificar que el anuncio ya no aparece en el tablón
      cy.contains(firstAnnouncementTitle).should('not.exist');
    });
  });

  it('Debería mostrar la mensajería interna', () => {
    // Navegar a la subsección de mensajería
    cy.contains('Mensajería').click();
    
    // Verificar que estamos en la sección de mensajería
    cy.url().should('include', '/messaging');
    
    // Verificar que existe la lista de conversaciones
    cy.contains('Conversaciones').should('exist');
    
    // Verificar que hay un botón para iniciar una nueva conversación
    cy.contains('Nueva Conversación').should('exist');
  });

  it('Debería permitir enviar un mensaje interno', () => {
    // Navegar a la subsección de mensajería
    cy.contains('Mensajería').click();
    
    // Hacer clic en botón para iniciar nueva conversación
    cy.contains('Nueva Conversación').click();
    
    // Verificar que se abre el formulario de nueva conversación
    cy.contains('Nueva Conversación').should('exist');
    
    // Seleccionar destinatario
    cy.get('select[name="recipientId"]').select(1);
    
    // Ingresar asunto y mensaje
    cy.get('input[name="subject"]').type('Información importante');
    cy.get('textarea[name="message"]').type('Este es un mensaje de prueba enviado durante los tests automatizados.');
    
    // Enviar el mensaje
    cy.contains('Enviar').click();
    
    // Verificar mensaje de éxito
    cy.contains('Mensaje enviado correctamente').should('exist');
    
    // Verificar que el mensaje aparece en la conversación
    cy.contains('Este es un mensaje de prueba').should('exist');
  });

  it('Debería mostrar el calendario de eventos', () => {
    // Navegar a la subsección de calendario
    cy.contains('Calendario').click();
    
    // Verificar que estamos en la sección de calendario
    cy.url().should('include', '/calendar');
    
    // Verificar que existe el calendario
    cy.get('.calendar').should('exist');
    
    // Verificar que hay un botón para crear nuevo evento
    cy.contains('Nuevo Evento').should('exist');
  });

  it('Debería permitir crear un nuevo evento', () => {
    // Navegar a la subsección de calendario
    cy.contains('Calendario').click();
    
    // Hacer clic en botón para crear nuevo evento
    cy.contains('Nuevo Evento').click();
    
    // Verificar que se abre el formulario de nuevo evento
    cy.contains('Crear Evento').should('exist');
    
    // Completar el formulario
    cy.get('input[name="title"]').type('Reunión Informativa');
    
    const eventDate = new Date();
    eventDate.setDate(eventDate.getDate() + 3);
    const formattedDate = eventDate.toISOString().split('T')[0];
    cy.get('input[name="date"]').type(formattedDate);
    
    cy.get('input[name="startTime"]').type('17:00');
    cy.get('input[name="endTime"]').type('18:00');
    
    cy.get('input[name="location"]').type('Salón Comunal');
    cy.get('textarea[name="description"]').type('Reunión informativa sobre los proyectos en curso del conjunto residencial.');
    
    // Crear el evento
    cy.contains('Crear').click();
    
    // Verificar mensaje de éxito
    cy.contains('Evento creado correctamente').should('exist');
    
    // Verificar que el evento aparece en el calendario
    cy.contains('Reunión Informativa').should('exist');
  });

  it('Debería permitir enviar comunicados oficiales', () => {
    // Navegar a la subsección de comunicados
    cy.contains('Comunicados').click();
    
    // Verificar que estamos en la sección de comunicados
    cy.url().should('include', '/communications');
    
    // Hacer clic en botón para crear nuevo comunicado
    cy.contains('Nuevo Comunicado').click();
    
    // Verificar que se abre el formulario de nuevo comunicado
    cy.contains('Crear Comunicado Oficial').should('exist');
    
    // Completar el formulario
    cy.get('input[name="title"]').type('Comunicado sobre cuotas extraordinarias');
    cy.get('select[name="communicationType"]').select('Financiero');
    cy.get('textarea[name="content"]').type('Se informa a todos los residentes que en la última asamblea se aprobó una cuota extraordinaria para la renovación de las áreas comunes.');
    
    // Seleccionar destinatarios
    cy.contains('Todos los residentes').click();
    
    // Crear el comunicado
    cy.contains('Publicar').click();
    
    // Verificar mensaje de éxito
    cy.contains('Comunicado publicado correctamente').should('exist');
    
    // Verificar que el comunicado aparece en la lista
    cy.contains('Comunicado sobre cuotas extraordinarias').should('exist');
  });

  it('Debería mostrar las estadísticas de comunicaciones', () => {
    // Navegar a la subsección de estadísticas
    cy.contains('Estadísticas').click();
    
    // Verificar que estamos en la sección de estadísticas
    cy.url().should('include', '/statistics');
    
    // Verificar elementos clave de estadísticas
    cy.contains('Estadísticas de Comunicaciones').should('exist');
    cy.contains('Tasa de Apertura').should('exist');
    cy.contains('Comunicados por Tipo').should('exist');
    
    // Verificar que hay gráficos
    cy.get('canvas').should('exist');
    
    // Verificar que hay un selector de período
    cy.get('select[name="period"]').should('exist');
    
    // Cambiar el período y verificar que se actualizan los datos
    cy.get('select[name="period"]').select('Último Mes');
    cy.contains('Cargando...').should('not.exist');
  });
});
