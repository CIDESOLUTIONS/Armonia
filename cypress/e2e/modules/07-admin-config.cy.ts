
// Prueba para el módulo de Configuración en el Panel de Administrador
describe('Módulo de Configuración', () => {
  beforeEach(() => {
    // Login como administrador antes de cada prueba
    cy.visit('/login');
    cy.get('input[placeholder="Tu correo electrónico"]').type('admin@example.com');
    cy.get('input[placeholder="Tu contraseña"]').type('password');
    cy.contains('Iniciar Sesión').click();
    
    // Navegar al módulo de configuración
    cy.contains('Configuración').click();
  });

  it('Debería mostrar la configuración general', () => {
    // Verificar que estamos en la sección de configuración
    cy.url().should('include', '/dashboard/config');
    
    // Verificar elementos clave de la configuración general
    cy.contains('Información del Conjunto').should('exist');
    cy.contains('Preferencias').should('exist');
    cy.contains('Cuenta').should('exist');
  });

  it('Debería permitir actualizar la información del conjunto', () => {
    // Hacer clic en la sección de información del conjunto
    cy.contains('Información del Conjunto').click();
    
    // Verificar que se muestra la información actual
    cy.get('input[name="residentialName"]').should('exist');
    cy.get('input[name="address"]').should('exist');
    cy.get('input[name="contactEmail"]').should('exist');
    cy.get('input[name="contactPhone"]').should('exist');
    
    // Actualizar la información
    cy.get('input[name="contactPhone"]').clear().type('3214567890');
    cy.get('textarea[name="description"]').clear().type('Conjunto residencial administrado con Armonía');
    
    // Guardar cambios
    cy.contains('Guardar Cambios').click();
    
    // Verificar mensaje de éxito
    cy.contains('Información actualizada correctamente').should('exist');
  });

  it('Debería permitir configurar las preferencias del sistema', () => {
    // Navegar a la subsección de preferencias
    cy.contains('Preferencias').click();
    
    // Verificar que estamos en la sección de preferencias
    cy.contains('Preferencias del Sistema').should('exist');
    
    // Cambiar preferencias
    cy.get('select[name="language"]').select('Español');
    cy.get('select[name="currency"]').select('USD');
    
    // Cambiar tema si está disponible
    cy.get('body').then(($body) => {
      if ($body.find('button[aria-label="Cambiar a modo oscuro"]').length > 0) {
        cy.get('button[aria-label="Cambiar a modo oscuro"]').click();
      } else if ($body.find('button[aria-label="Cambiar a modo claro"]').length > 0) {
        cy.get('button[aria-label="Cambiar a modo claro"]').click();
      }
    });
    
    // Verificar opciones de notificaciones
    cy.contains('Notificaciones').should('exist');
    cy.get('input[type="checkbox"][name="emailNotifications"]').check();
    
    // Guardar preferencias
    cy.contains('Guardar Preferencias').click();
    
    // Verificar mensaje de éxito
    cy.contains('Preferencias guardadas correctamente').should('exist');
  });

  it('Debería permitir gestionar los datos bancarios', () => {
    // Navegar a la subsección de datos bancarios
    cy.contains('Datos Bancarios').click();
    
    // Verificar que estamos en la sección de datos bancarios
    cy.contains('Información Bancaria').should('exist');
    
    // Agregar una nueva cuenta bancaria
    cy.contains('Agregar Cuenta').click();
    
    // Completar el formulario
    cy.get('input[name="bankName"]').type('Banco de Prueba');
    cy.get('input[name="accountNumber"]').type('123456789');
    cy.get('input[name="accountType"]').type('Ahorros');
    cy.get('input[name="accountHolder"]').type('Conjunto Residencial Prueba');
    
    // Guardar la cuenta
    cy.contains('Guardar').click();
    
    // Verificar mensaje de éxito
    cy.contains('Cuenta bancaria agregada correctamente').should('exist');
    
    // Verificar que la cuenta aparece en la lista
    cy.contains('Banco de Prueba').should('exist');
    cy.contains('123456789').should('exist');
  });

  it('Debería permitir gestionar los usuarios del sistema', () => {
    // Navegar a la subsección de usuarios
    cy.contains('Usuarios').click();
    
    // Verificar que estamos en la sección de usuarios
    cy.contains('Gestión de Usuarios').should('exist');
    
    // Verificar que existe la tabla de usuarios
    cy.get('table').should('exist');
    
    // Agregar un nuevo usuario
    cy.contains('Agregar Usuario').click();
    
    // Completar el formulario
    cy.get('input[name="firstName"]').type('Usuario');
    cy.get('input[name="lastName"]').type('Prueba');
    cy.get('input[name="email"]').type('usuario.prueba@example.com');
    cy.get('select[name="role"]').select('Recepción');
    
    // Generar contraseña aleatoria si es necesario
    cy.get('body').then(($body) => {
      if ($body.find('button[aria-label="Generar contraseña aleatoria"]').length > 0) {
        cy.get('button[aria-label="Generar contraseña aleatoria"]').click();
      } else {
        cy.get('input[name="password"]').type('Contraseña123!');
      }
    });
    
    // Guardar el nuevo usuario
    cy.contains('Crear Usuario').click();
    
    // Verificar mensaje de éxito
    cy.contains('Usuario creado correctamente').should('exist');
    
    // Verificar que el usuario aparece en la lista
    cy.contains('usuario.prueba@example.com').should('exist');
  });

  it('Debería permitir gestionar los permisos', () => {
    // Navegar a la subsección de permisos
    cy.contains('Permisos').click();
    
    // Verificar que estamos en la sección de permisos
    cy.contains('Gestión de Permisos').should('exist');
    
    // Verificar que existen los perfiles de permisos
    cy.contains('Administrador').should('exist');
    cy.contains('Residente').should('exist');
    cy.contains('Recepción').should('exist');
    
    // Modificar permisos de un rol
    cy.contains('Recepción').click();
    
    // Activar/desactivar algunos permisos
    cy.get('input[type="checkbox"][name="permissions.viewInventory"]').check();
    cy.get('input[type="checkbox"][name="permissions.createAnnouncements"]').uncheck();
    
    // Guardar los cambios
    cy.contains('Guardar Cambios').click();
    
    // Verificar mensaje de éxito
    cy.contains('Permisos actualizados correctamente').should('exist');
  });

  it('Debería permitir hacer backup de datos', () => {
    // Navegar a la subsección de backup
    cy.contains('Backup').click();
    
    // Verificar que estamos en la sección de backup
    cy.contains('Respaldo de Datos').should('exist');
    
    // Verificar que muestra los últimos backups realizados
    cy.contains('Historial de Respaldos').should('exist');
    
    // Iniciar un nuevo backup
    cy.contains('Crear Respaldo').click();
    
    // Confirmar la acción
    cy.contains('Confirmar').click();
    
    // Verificar mensaje de éxito (esto puede tardar en ambiente real)
    cy.contains('Respaldo iniciado correctamente').should('exist');
  });

  it('Debería permitir ver el historial de actividad', () => {
    // Navegar a la subsección de actividad
    cy.contains('Actividad').click();
    
    // Verificar que estamos en la sección de actividad
    cy.contains('Historial de Actividad').should('exist');
    
    // Verificar que existe la tabla de actividades
    cy.get('table').should('exist');
    
    // Debería haber al menos una entrada en el historial
    cy.get('table tbody tr').should('have.length.at.least', 1);
    
    // Verificar columnas importantes en la tabla
    cy.contains('Usuario').should('exist');
    cy.contains('Acción').should('exist');
    cy.contains('Fecha').should('exist');
    
    // Probar filtros si existen
    cy.get('body').then(($body) => {
      if ($body.find('select[name="activityType"]').length > 0) {
        cy.get('select[name="activityType"]').select('Login');
        cy.contains('Filtrando por: Login').should('exist');
      }
    });
  });
});
