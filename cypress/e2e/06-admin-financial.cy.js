// Pruebas para el Módulo Financiero del Administrador
describe('Módulo Financiero', () => {
  beforeEach(() => {
    // Login como administrador antes de cada prueba
    cy.visit('/login');
    cy.get('input[name="email"]').type(Cypress.env('adminEmail'));
    cy.get('input[name="password"]').type(Cypress.env('adminPassword'));
    cy.contains('Iniciar Sesión').click();
    
    // Navegar al módulo financiero
    cy.get('[data-testid="sidebar"]').contains('Financiero').click();
    
    // Esperar a que cargue la página financiera
    cy.url().should('include', '/dashboard/financial');
    cy.contains('Gestión Financiera', { timeout: 10000 }).should('be.visible');
  });

  it('Debería mostrar las opciones principales del módulo financiero', () => {
    // Verificar pestañas o secciones
    cy.contains('Cuotas').should('be.visible');
    cy.contains('Pagos').should('be.visible');
    cy.contains('Presupuestos').should('be.visible');
    cy.contains('Reportes').should('be.visible');
  });

  describe('Gestión de Cuotas', () => {
    beforeEach(() => {
      // Asegurar que estamos en la pestaña de cuotas
      cy.contains('Cuotas').click();
    });

    it('Debería mostrar la lista de cuotas generadas', () => {
      // Verificar tabla o listado
      cy.get('[data-testid="fees-table"]').should('be.visible');
      
      // Verificar que existan registros
      cy.get('[data-testid="fees-table"] tbody tr').should('have.length.at.least', 1);
    });

    it('Debería permitir generar nuevas cuotas ordinarias', () => {
      // Clic en botón de generar cuotas
      cy.contains('Generar Cuotas').click();
      
      // Verificar formulario
      cy.get('[data-testid="generate-fees-form"]').should('be.visible');
      
      // Llenar formulario
      cy.get('select[name="feeType"]').select('Ordinaria');
      cy.get('input[name="dueDate"]').type('2025-05-15');
      cy.get('input[name="amount"]').type('100');
      cy.get('textarea[name="description"]').type('Cuota ordinaria mayo 2025');
      
      // Enviar formulario
      cy.contains('Generar').click();
      
      // Verificar mensaje de éxito
      cy.contains('Cuotas generadas correctamente').should('be.visible');
    });

    it('Debería permitir generar cuotas extraordinarias', () => {
      // Clic en botón de generar cuotas
      cy.contains('Generar Cuotas').click();
      
      // Verificar formulario
      cy.get('[data-testid="generate-fees-form"]').should('be.visible');
      
      // Llenar formulario
      cy.get('select[name="feeType"]').select('Extraordinaria');
      cy.get('input[name="dueDate"]').type('2025-05-30');
      cy.get('input[name="amount"]').type('50');
      cy.get('textarea[name="description"]').type('Cuota extraordinaria para proyecto de mejoras');
      
      // Enviar formulario
      cy.contains('Generar').click();
      
      // Verificar mensaje de éxito
      cy.contains('Cuotas generadas correctamente').should('be.visible');
    });

    it('Debería permitir anular una cuota', () => {
      // Obtener la descripción de la última cuota para verificar después
      cy.get('[data-testid="fees-table"] tbody tr').last().find('td').eq(2).invoke('text').as('lastFeeDescription');
      
      // Clic en botón de anular de la última cuota
      cy.get('[data-testid="fees-table"] tbody tr').last().find('[data-testid="void-fee-button"]').click();
      
      // Verificar modal de confirmación
      cy.get('[data-testid="void-fee-modal"]').should('be.visible');
      
      // Agregar motivo de anulación
      cy.get('textarea[name="voidReason"]').type('Error en el monto');
      
      // Confirmar anulación
      cy.contains('Confirmar Anulación').click();
      
      // Verificar mensaje de éxito
      cy.contains('Cuota anulada correctamente').should('be.visible');
      
      // Verificar que aparezca como anulada en la lista
      cy.get('@lastFeeDescription').then(feeDescription => {
        cy.contains(feeDescription).parent('tr').contains('Anulada').should('be.visible');
      });
    });

    it('Debería permitir enviar recordatorios a deudores', () => {
      // Clic en botón de enviar recordatorios
      cy.contains('Enviar Recordatorios').click();
      
      // Verificar modal de confirmación
      cy.get('[data-testid="reminders-modal"]').should('be.visible');
      
      // Verificar opciones de envío
      cy.contains('Enviar a todos los deudores').should('be.visible');
      cy.contains('Enviar solo a cuotas vencidas').should('be.visible');
      
      // Seleccionar opción
      cy.get('input[name="reminderType"][value="overdue"]').check();
      
      // Enviar recordatorios
      cy.contains('Enviar Recordatorios').click();
      
      // Verificar mensaje de éxito
      cy.contains('Recordatorios enviados correctamente').should('be.visible');
    });
  });

  describe('Gestión de Pagos', () => {
    beforeEach(() => {
      // Asegurar que estamos en la pestaña de pagos
      cy.contains('Pagos').click();
    });

    it('Debería mostrar la lista de pagos registrados', () => {
      // Verificar tabla o listado
      cy.get('[data-testid="payments-table"]').should('be.visible');
      
      // Verificar que existan registros
      cy.get('[data-testid="payments-table"] tbody tr').should('have.length.at.least', 1);
    });

    it('Debería permitir registrar un nuevo pago', () => {
      // Clic en botón de registrar pago
      cy.contains('Registrar Pago').click();
      
      // Verificar formulario
      cy.get('[data-testid="payment-form"]').should('be.visible');
      
      // Seleccionar residente
      cy.get('select[name="residentId"]').select(1);
      
      // Cargar cuotas pendientes del residente
      cy.contains('Cargar Cuotas Pendientes').click();
      
      // Seleccionar una cuota para pagar
      cy.get('[data-testid="pending-fees-list"] tbody tr').first().find('input[type="checkbox"]').check();
      
      // Llenar formulario
      cy.get('select[name="paymentMethod"]').select('Transferencia');
      cy.get('input[name="paymentDate"]').type('2025-05-01');
      cy.get('input[name="reference"]').type('REF123456');
      
      // Enviar formulario
      cy.contains('Registrar Pago').click();
      
      // Verificar mensaje de éxito
      cy.contains('Pago registrado correctamente').should('be.visible');
    });

    it('Debería permitir anular un pago', () => {
      // Obtener la referencia del último pago para verificar después
      cy.get('[data-testid="payments-table"] tbody tr').last().find('td').eq(3).invoke('text').as('lastPaymentReference');
      
      // Clic en botón de anular del último pago
      cy.get('[data-testid="payments-table"] tbody tr').last().find('[data-testid="void-payment-button"]').click();
      
      // Verificar modal de confirmación
      cy.get('[data-testid="void-payment-modal"]').should('be.visible');
      
      // Agregar motivo de anulación
      cy.get('textarea[name="voidReason"]').type('Pago duplicado');
      
      // Confirmar anulación
      cy.contains('Confirmar Anulación').click();
      
      // Verificar mensaje de éxito
      cy.contains('Pago anulado correctamente').should('be.visible');
      
      // Verificar que aparezca como anulado en la lista
      cy.get('@lastPaymentReference').then(reference => {
        cy.contains(reference).parent('tr').contains('Anulado').should('be.visible');
      });
    });

    it('Debería generar un recibo de pago', () => {
      // Clic en el botón de generar recibo del primer pago
      cy.get('[data-testid="payments-table"] tbody tr').first().find('[data-testid="generate-receipt-button"]').click();
      
      // Verificar que se abra el recibo o se descargue
      cy.contains('Recibo generado correctamente').should('be.visible');
    });
  });

  describe('Gestión de Presupuestos', () => {
    beforeEach(() => {
      // Asegurar que estamos en la pestaña de presupuestos
      cy.contains('Presupuestos').click();
    });

    it('Debería mostrar la lista de presupuestos', () => {
      // Verificar tabla o listado
      cy.get('[data-testid="budgets-table"]').should('be.visible');
    });

    it('Debería permitir crear un nuevo presupuesto', () => {
      // Clic en botón de crear presupuesto
      cy.contains('Crear Presupuesto').click();
      
      // Verificar formulario
      cy.get('[data-testid="budget-form"]').should('be.visible');
      
      // Llenar formulario
      cy.get('input[name="year"]').type('2025');
      cy.get('input[name="title"]').type('Presupuesto Anual 2025');
      
      // Agregar categorías de ingresos
      cy.contains('Agregar Categoría de Ingresos').click();
      cy.get('input[name="incomeCategories[0].name"]').type('Cuotas Ordinarias');
      cy.get('input[name="incomeCategories[0].amount"]').type('12000');
      
      cy.contains('Agregar Categoría de Ingresos').click();
      cy.get('input[name="incomeCategories[1].name"]').type('Alquiler Salón Comunal');
      cy.get('input[name="incomeCategories[1].amount"]').type('2000');
      
      // Agregar categorías de gastos
      cy.contains('Agregar Categoría de Gastos').click();
      cy.get('input[name="expenseCategories[0].name"]').type('Mantenimiento');
      cy.get('input[name="expenseCategories[0].amount"]').type('5000');
      
      cy.contains('Agregar Categoría de Gastos').click();
      cy.get('input[name="expenseCategories[1].name"]').type('Servicios Públicos');
      cy.get('input[name="expenseCategories[1].amount"]').type('3000');
      
      // Enviar formulario
      cy.contains('Guardar Presupuesto').click();
      
      // Verificar mensaje de éxito
      cy.contains('Presupuesto creado correctamente').should('be.visible');
      
      // Verificar que aparezca en la lista
      cy.contains('Presupuesto Anual 2025').should('be.visible');
    });
  });

  describe('Reportes Financieros', () => {
    beforeEach(() => {
      // Asegurar que estamos en la pestaña de reportes
      cy.contains('Reportes').click();
    });

    it('Debería mostrar las opciones de reportes disponibles', () => {
      // Verificar opciones de reportes
      cy.contains('Estado de Cuenta').should('be.visible');
      cy.contains('Reporte de Morosidad').should('be.visible');
      cy.contains('Balance General').should('be.visible');
      cy.contains('Flujo de Caja').should('be.visible');
    });

    it('Debería generar un reporte de morosidad', () => {
      // Clic en opción de reporte de morosidad
      cy.contains('Reporte de Morosidad').click();
      
      // Verificar formulario de configuración
      cy.get('[data-testid="report-config-form"]').should('be.visible');
      
      // Configurar parámetros
      cy.get('input[name="cutoffDate"]').type('2025-05-01');
      cy.get('select[name="format"]').select('PDF');
      
      // Generar reporte
      cy.contains('Generar Reporte').click();
      
      // Verificar generación
      cy.contains('Reporte generado correctamente').should('be.visible');
    });

    it('Debería generar un balance general', () => {
      // Clic en opción de balance general
      cy.contains('Balance General').click();
      
      // Verificar formulario de configuración
      cy.get('[data-testid="report-config-form"]').should('be.visible');
      
      // Configurar parámetros
      cy.get('select[name="year"]').select('2025');
      cy.get('select[name="month"]').select('Abril');
      cy.get('select[name="format"]').select('Excel');
      
      // Generar reporte
      cy.contains('Generar Reporte').click();
      
      // Verificar generación
      cy.contains('Reporte generado correctamente').should('be.visible');
    });
  });
});
