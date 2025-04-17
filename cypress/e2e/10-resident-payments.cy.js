// Pruebas para el Módulo de Pagos del Residente
describe('Módulo de Pagos del Residente', () => {
  beforeEach(() => {
    // Login como residente antes de cada prueba
    cy.visit('/login');
    cy.get('input[name="email"]').type(Cypress.env('residentEmail'));
    cy.get('input[name="password"]').type(Cypress.env('residentPassword'));
    cy.contains('Iniciar Sesión').click();
    
    // Navegar al módulo de pagos
    cy.get('[data-testid="sidebar"]').contains('Pagos').click();
    
    // Esperar a que cargue la página de pagos
    cy.url().should('include', '/resident/payments');
    cy.contains('Mis Pagos', { timeout: 10000 }).should('be.visible');
  });

  it('Debería mostrar las secciones principales del módulo de pagos', () => {
    // Verificar secciones
    cy.contains('Pagos Pendientes').should('be.visible');
    cy.contains('Historial de Pagos').should('be.visible');
    cy.contains('Estado de Cuenta').should('be.visible');
  });

  it('Debería mostrar el listado de pagos pendientes', () => {
    // Verificar tabla o listado
    cy.get('[data-testid="pending-payments-table"]').should('be.visible');
    
    // Verificar elementos de la tabla
    cy.contains('Descripción').should('be.visible');
    cy.contains('Monto').should('be.visible');
    cy.contains('Fecha de Vencimiento').should('be.visible');
    cy.contains('Estado').should('be.visible');
  });

  it('Debería mostrar el historial de pagos realizados', () => {
    // Hacer clic en la pestaña de historial
    cy.contains('Historial de Pagos').click();
    
    // Verificar tabla o listado
    cy.get('[data-testid="payment-history-table"]').should('be.visible');
    
    // Verificar elementos de la tabla
    cy.contains('Descripción').should('be.visible');
    cy.contains('Monto').should('be.visible');
    cy.contains('Fecha de Pago').should('be.visible');
    cy.contains('Método').should('be.visible');
    cy.contains('Referencia').should('be.visible');
  });

  it('Debería permitir filtrar el historial de pagos por fecha', () => {
    // Hacer clic en la pestaña de historial
    cy.contains('Historial de Pagos').click();
    
    // Buscar y usar el filtro de fechas
    cy.get('input[name="startDate"]').type('2025-01-01');
    cy.get('input[name="endDate"]').type('2025-12-31');
    cy.contains('Filtrar').click();
    
    // Verificar que se aplique el filtro
    cy.get('[data-testid="payment-history-table"]').should('be.visible');
  });

  it('Debería permitir descargar un recibo de pago', () => {
    // Hacer clic en la pestaña de historial
    cy.contains('Historial de Pagos').click();
    
    // Clic en el botón de descargar recibo del primer pago
    cy.get('[data-testid="payment-history-table"] tbody tr').first().find('[data-testid="download-receipt-button"]').click();
    
    // Verificar mensaje de éxito o que se inicie la descarga
    cy.contains('Recibo generado correctamente').should('be.visible');
  });

  it('Debería permitir realizar un pago en línea', () => {
    // Seleccionar un pago pendiente para pagar
    cy.get('[data-testid="pending-payments-table"] tbody tr').first().find('input[type="checkbox"]').check();
    
    // Clic en el botón de pagar
    cy.contains('Pagar Seleccionados').click();
    
    // Verificar página de pago
    cy.contains('Realizar Pago').should('be.visible');
    
    // Verificar resumen de pago
    cy.get('[data-testid="payment-summary"]').should('be.visible');
    
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
    cy.contains('Procesando pago', { timeout: 10000 }).should('be.visible');
    cy.contains('Pago realizado con éxito', { timeout: 20000 }).should('be.visible');
    
    // Verificar redirección a confirmación
    cy.contains('Gracias por su pago').should('be.visible');
  });

  it('Debería permitir reportar un pago manual', () => {
    // Clic en el botón de reportar pago
    cy.contains('Reportar Pago').click();
    
    // Verificar formulario
    cy.get('[data-testid="report-payment-form"]').should('be.visible');
    
    // Seleccionar cuotas a pagar
    cy.get('[data-testid="fee-selection"] tbody tr').first().find('input[type="checkbox"]').check();
    
    // Seleccionar método de pago
    cy.get('select[name="paymentMethod"]').select('Transferencia');
    
    // Llenar detalles del pago
    cy.get('input[name="paymentDate"]').type('2025-05-10');
    cy.get('input[name="reference"]').type('REF-TRANSFER-789');
    
    // Simular carga de comprobante
    cy.get('input[type="file"]').attachFile('comprobante.jpg');
    
    // Enviar formulario
    cy.contains('Reportar Pago').click();
    
    // Verificar mensaje de éxito
    cy.contains('Pago reportado correctamente').should('be.visible');
    cy.contains('Su pago será verificado por la administración').should('be.visible');
  });

  it('Debería mostrar el estado de cuenta detallado', () => {
    // Clic en la pestaña de estado de cuenta
    cy.contains('Estado de Cuenta').click();
    
    // Verificar que se muestre el estado de cuenta
    cy.get('[data-testid="account-statement"]').should('be.visible');
    
    // Verificar secciones
    cy.contains('Saldo Actual').should('be.visible');
    cy.contains('Pagos Recientes').should('be.visible');
    cy.contains('Cuotas Pendientes').should('be.visible');
    
    // Verificar botón para descargar estado de cuenta
    cy.contains('Descargar Estado de Cuenta').should('be.visible');
  });

  it('Debería permitir descargar el estado de cuenta', () => {
    // Clic en la pestaña de estado de cuenta
    cy.contains('Estado de Cuenta').click();
    
    // Clic en el botón de descargar
    cy.contains('Descargar Estado de Cuenta').click();
    
    // Verificar mensaje de éxito o que se inicie la descarga
    cy.contains('Documento generado correctamente').should('be.visible');
  });
});
