
// Prueba para el módulo de Gestión Financiera en el Panel de Administrador
describe('Módulo de Gestión Financiera', () => {
  beforeEach(() => {
    // Login como administrador antes de cada prueba
    cy.visit('/login');
    cy.get('input[placeholder="Tu correo electrónico"]').type('admin@example.com');
    cy.get('input[placeholder="Tu contraseña"]').type('password');
    cy.contains('Iniciar Sesión').click();
    
    // Navegar al módulo financiero
    cy.contains('Financiero').click();
  });

  it('Debería mostrar el dashboard financiero', () => {
    // Verificar que estamos en la sección financiera
    cy.url().should('include', '/dashboard/financial');
    
    // Verificar elementos clave del dashboard
    cy.contains('Resumen Financiero').should('exist');
    cy.contains('Ingresos vs Gastos').should('exist');
    cy.contains('Cuotas Pendientes').should('exist');
    
    // Verificar que hay gráficos
    cy.get('canvas').should('exist');
    
    // Verificar que hay tarjetas de información
    cy.contains('Total Recaudado').should('exist');
    cy.contains('Pendiente por Cobrar').should('exist');
  });

  it('Debería mostrar el listado de cuotas', () => {
    // Navegar a la subsección de cuotas
    cy.contains('Cuotas').click();
    
    // Verificar que estamos en la sección de cuotas
    cy.url().should('include', '/quotas');
    
    // Verificar que existe la tabla de cuotas
    cy.get('table').should('exist');
    
    // Debería haber al menos una cuota en la tabla
    cy.get('table tbody tr').should('have.length.at.least', 1);
    
    // Verificar columnas importantes en la tabla
    cy.contains('Propiedad').should('exist');
    cy.contains('Fecha').should('exist');
    cy.contains('Monto').should('exist');
    cy.contains('Estado').should('exist');
  });

  it('Debería permitir generar nuevas cuotas', () => {
    // Navegar a la subsección de cuotas
    cy.contains('Cuotas').click();
    
    // Hacer clic en botón para generar nuevas cuotas
    cy.contains('Generar Cuotas').click();
    
    // Verificar que se abre el formulario de generación de cuotas
    cy.contains('Generar Cuotas Mensuales').should('exist');
    
    // Completar el formulario
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const formattedMonth = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}`;
    
    cy.get('input[type="month"]').type(formattedMonth);
    cy.get('input[name="baseAmount"]').clear().type('50');
    cy.contains('Todas las propiedades').click();
    
    // Generar las cuotas
    cy.contains('Generar').click();
    
    // Verificar mensaje de éxito
    cy.contains('Cuotas generadas correctamente').should('exist');
    
    // Verificar que hay nuevas cuotas en la tabla
    cy.get('table tbody tr').should('have.length.at.least', 1);
  });

  it('Debería permitir registrar un pago', () => {
    // Navegar a la subsección de pagos
    cy.contains('Pagos').click();
    
    // Verificar que estamos en la sección de pagos
    cy.url().should('include', '/payments');
    
    // Hacer clic en botón para registrar un nuevo pago
    cy.contains('Registrar Pago').click();
    
    // Verificar que se abre el formulario de registro de pago
    cy.contains('Nuevo Pago').should('exist');
    
    // Completar el formulario
    cy.get('select[name="propertyId"]').select(1);
    cy.get('select[name="paymentMethod"]').select('Transferencia');
    
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    cy.get('input[name="paymentDate"]').type(formattedDate);
    
    cy.get('input[name="amount"]').clear().type('100');
    cy.get('textarea[name="description"]').type('Pago de prueba');
    
    // Registrar el pago
    cy.contains('Registrar').click();
    
    // Verificar mensaje de éxito
    cy.contains('Pago registrado correctamente').should('exist');
    
    // Verificar que el pago aparece en la lista
    cy.contains('Pago de prueba').should('exist');
  });

  it('Debería mostrar el estado de cuenta de una propiedad', () => {
    // Navegar a la subsección de estado de cuenta
    cy.contains('Estado de Cuenta').click();
    
    // Verificar que estamos en la sección de estado de cuenta
    cy.url().should('include', '/account-statement');
    
    // Seleccionar una propiedad
    cy.get('select[name="propertyId"]').select(1);
    
    // Verificar que se carga la información
    cy.contains('Estado de Cuenta').should('exist');
    
    // Verificar elementos del estado de cuenta
    cy.contains('Saldo Actual').should('exist');
    cy.contains('Historial de Movimientos').should('exist');
    
    // Debería haber al menos un movimiento en el historial
    cy.get('table tbody tr').should('have.length.at.least', 1);
  });

  it('Debería permitir generar reportes financieros', () => {
    // Navegar a la subsección de reportes
    cy.contains('Reportes').click();
    
    // Verificar que estamos en la sección de reportes
    cy.url().should('include', '/reports');
    
    // Seleccionar un tipo de reporte
    cy.get('select[name="reportType"]').select('Balance Mensual');
    
    // Seleccionar fechas
    const currentMonth = new Date();
    const formattedMonth = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;
    
    cy.get('input[type="month"]').type(formattedMonth);
    
    // Generar el reporte
    cy.contains('Generar Reporte').click();
    
    // Verificar que se genera el reporte
    cy.contains('Reporte Generado').should('exist');
    
    // Verificar que hay un botón para descargar el reporte
    cy.contains('Descargar PDF').should('exist');
  });
});
