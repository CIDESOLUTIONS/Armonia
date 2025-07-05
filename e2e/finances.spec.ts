/** 
 * Pruebas E2E para el módulo de Finanzas
 * 
 * Estas pruebas verifican el flujo completo de facturación y pagos:
 * creación de facturas, procesamiento de pagos y verificación de estados de cuenta.
 */
import { test, expect, Page } from '@playwright/test';
// Datos de prueba
const testUsers = {
  admin: {
    email: 'admin.financiero@test.com',
    password: 'FinAdmin123!',
    name: 'Admin Financiero'
  },
  resident: {
    email: 'residente.test@email.com', 
    password: 'Resident123!',
    name: 'Juan Residente Test',
    unitNumber: 'Apto 101'
  }
};
const testInvoice = {
  description: 'Cuota de Administración - Enero 2025',
  amount: '350000',
  dueDate: '2025-02-15',
  type: 'MONTHLY_FEE',
  concept: 'Administración mensual'
};
const testPayment = {
  method: 'CREDIT_CARD',
  cardNumber: '4111111111111111',
  expiryDate: '12/26',
  cvv: '123',
  cardName: 'JUAN RESIDENTE TEST'
};
test.describe('Finanzas - Facturación y Pagos', () => {
  test.beforeEach(async ({ page }) => {
    // Configurar timeouts más largos para transacciones financieras
    test.setTimeout(60000);
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });
  test('Flujo completo: Crear factura, procesar pago y verificar estado de cuenta', async ({ page }) => {
    // PASO 1: Login como administrador financiero
    await test.step('Login como administrador financiero', async () => {
      await page.goto('/login');
      
      await page.fill('input[name="email"], input[type="email"]', testUsers.admin.email);
      await page.fill('input[name="password"], input[type="password"]', testUsers.admin.password);
      
      const loginButton = page.locator('button[type="submit"], button:has-text("Iniciar")').first();
      await loginButton.click();
      
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(/.*dashboard|admin/);
    });
    // PASO 2: Navegar al módulo de finanzas
    await test.step('Navegar al módulo de finanzas', async () => {
      // Buscar enlace de finanzas en el menú
      const financeLink = page.locator('a:has-text("Finanzas"), a:has-text("Facturación"), [href*="finance"]').first();
      await expect(financeLink).toBeVisible({ timeout: 10000 });
      await financeLink.click();
      
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(/.*financ|billing|invoice/);
    });
    // PASO 3: Crear nueva factura para residente
    await test.step('Crear nueva factura', async () => {
      // Buscar botón de crear factura
      const createInvoiceButton = page.locator('button:has-text("Crear"), button:has-text("Nueva"), button:has-text("Factura")').first();
      await expect(createInvoiceButton).toBeVisible({ timeout: 10000 });
      await createInvoiceButton.click();
      // Esperar que aparezca el formulario
      await expect(page.locator('form, .modal, .dialog')).toBeVisible();
      // Seleccionar residente (buscar por unidad o nombre)
      const residentSelect = page.locator('select[name="resident"], input[name="resident"], #resident-select').first();
      if (await residentSelect.isVisible()) {
        await residentSelect.click();
        await page.locator(`option:has-text("${testUsers.resident.unitNumber}"), option:has-text("${testUsers.resident.name}")`).first().click();
      }
      // Llenar datos de la factura
      await page.fill('input[name="description"], #invoice-description', testInvoice.description);
      await page.fill('input[name="amount"], #invoice-amount', testInvoice.amount);
      await page.fill('input[name="dueDate"], input[type="date"], #due-date', testInvoice.dueDate);
      // Seleccionar tipo de factura si existe
      const typeSelect = page.locator('select[name="type"], #invoice-type').first();
      if (await typeSelect.isVisible()) {
        await typeSelect.selectOption(testInvoice.type);
      }
      // Enviar formulario
      const submitButton = page.locator('button[type="submit"], button:has-text("Crear"), button:has-text("Generar")').first();
      await submitButton.click();
      // Verificar creación exitosa
      await expect(page.locator('text=/creada/i, text=/generada/i, text=/éxito/i')).toBeVisible({ timeout: 15000 });
    });
    // PASO 4: Logout del admin y login como residente
    await test.step('Cambiar a usuario residente', async () => {
      // Logout
      const logoutButton = page.locator('button:has-text("Salir"), button:has-text("Logout"), a:has-text("Cerrar")').first();
      if (await logoutButton.isVisible()) {
        await logoutButton.click();
      } else {
        await page.goto('/logout');
      }
      
      await page.waitForLoadState('networkidle');
      // Login como residente
      await page.goto('/login');
      await page.fill('input[name="email"], input[type="email"]', testUsers.resident.email);
      await page.fill('input[name="password"], input[type="password"]', testUsers.resident.password);
      
      const loginButton = page.locator('button[type="submit"], button:has-text("Iniciar")').first();
      await loginButton.click();
      
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(/.*dashboard|resident/);
    });
    // PASO 5: Ver facturas pendientes
    await test.step('Ver facturas pendientes', async () => {
      // Navegar a facturas/pagos
      const paymentsLink = page.locator('a:has-text("Facturas"), a:has-text("Pagos"), a:has-text("Finanzas"), [href*="payment"]').first();
      await expect(paymentsLink).toBeVisible({ timeout: 10000 });
      await paymentsLink.click();
      await page.waitForLoadState('networkidle');
      // Verificar que aparece la factura creada
      await expect(page.locator(`text="${testInvoice.description}"`)).toBeVisible();
      await expect(page.locator(`text="$${testInvoice.amount}", text="${testInvoice.amount}"`)).toBeVisible();
    });
    // PASO 6: Procesar pago de la factura
    await test.step('Procesar pago de factura', async () => {
      // Buscar y hacer clic en botón de pagar
      const payButton = page.locator('button:has-text("Pagar"), button:has-text("Pay"), .pay-button').first();
      await expect(payButton).toBeVisible();
      await payButton.click();
      // Esperar formulario de pago
      await expect(page.locator('form, .payment-form, .modal')).toBeVisible();
      // Seleccionar método de pago
      const paymentMethodSelect = page.locator('select[name="method"], #payment-method').first();
      if (await paymentMethodSelect.isVisible()) {
        await paymentMethodSelect.selectOption(testPayment.method);
      }
      // Llenar datos de tarjeta (si es pago con tarjeta)
      if (testPayment.method === 'CREDIT_CARD') {
        await page.fill('input[name="cardNumber"], #card-number', testPayment.cardNumber);
        await page.fill('input[name="expiryDate"], #expiry-date', testPayment.expiryDate);
        await page.fill('input[name="cvv"], #cvv', testPayment.cvv);
        await page.fill('input[name="cardName"], #card-name', testPayment.cardName);
      }
      // Confirmar pago
      const confirmPayButton = page.locator('button[type="submit"], button:has-text("Confirmar"), button:has-text("Pagar")').first();
      await confirmPayButton.click();
      // Esperar procesamiento del pago
      await page.waitForLoadState('networkidle');
      
      // Verificar pago exitoso
      await expect(page.locator('text=/pago.*exitoso/i, text=/transacción.*aprobada/i, text=/pagado/i')).toBeVisible({ timeout: 20000 });
    });
    // PASO 7: Verificar estado de cuenta actualizado
    await test.step('Verificar estado de cuenta', async () => {
      // Navegar a estado de cuenta
      const accountLink = page.locator('a:has-text("Estado de Cuenta"), a:has-text("Mi Cuenta"), [href*="account"]').first();
      if (await accountLink.isVisible()) {
        await accountLink.click();
        await page.waitForLoadState('networkidle');
      }
      // Verificar que el pago aparece registrado
      await expect(page.locator(`text="${testInvoice.description}"`)).toBeVisible();
      await expect(page.locator('text=/pagado/i, text=/paid/i, .status-paid')).toBeVisible();
      
      // Verificar saldo actualizado (debe ser 0 o menor)
      const balanceElement = page.locator('[data-testid="balance"], .balance, .saldo').first();
      if (await balanceElement.isVisible()) {
        const balanceText = await balanceElement.textContent();
        // El saldo debería ser 0 o mostrar que no hay deudas pendientes
        expect(balanceText).toMatch(/0|sin.*deuda|al.*día/i);
      }
    });
    // PASO 8: Verificar desde lado administrativo
    await test.step('Verificar pago desde administración', async () => {
      // Logout del residente
      const logoutButton = page.locator('button:has-text("Salir"), a:has-text("Cerrar")').first();
      if (await logoutButton.isVisible()) {
        await logoutButton.click();
      } else {
        await page.goto('/logout');
      }
      // Login como admin nuevamente
      await page.goto('/login');
      await page.fill('input[name="email"]', testUsers.admin.email);
      await page.fill('input[name="password"]', testUsers.admin.password);
      await page.locator('button[type="submit"]').click();
      await page.waitForLoadState('networkidle');
      // Navegar a reportes de pagos o transacciones
      const reportsLink = page.locator('a:has-text("Reportes"), a:has-text("Transacciones"), [href*="report"]').first();
      if (await reportsLink.isVisible()) {
        await reportsLink.click();
        await page.waitForLoadState('networkidle');
        // Verificar que aparece el pago recibido
        await expect(page.locator(`text="${testUsers.resident.name}", text="${testUsers.resident.unitNumber}"`)).toBeVisible();
        await expect(page.locator('text=/recibido/i, text=/pagado/i, .status-paid')).toBeVisible();
      }
    });
  });
  test('Validación de campos en formulario de pago', async ({ page }) => {
    
    // Login como residente
    await page.goto('/login');
    await page.fill('input[name="email"]', testUsers.resident.email);
    await page.fill('input[name="password"]', testUsers.resident.password);
    await page.locator('button[type="submit"]').click();
    await page.waitForLoadState('networkidle');
    // Navegar a pagos
    const paymentsLink = page.locator('a:has-text("Facturas"), a:has-text("Pagos")').first();
    if (await paymentsLink.isVisible()) {
      await paymentsLink.click();
      // Intentar pagar sin llenar datos
      const payButton = page.locator('button:has-text("Pagar")').first();
      if (await payButton.isVisible()) {
        await payButton.click();
        
        const confirmButton = page.locator('button[type="submit"], button:has-text("Confirmar")').first();
        if (await confirmButton.isVisible()) {
          await confirmButton.click();
          
          // Verificar mensajes de validación
          await expect(page.locator('text=/requerido/i, text=/obligatorio/i, .error')).toBeVisible();
        }
      }
    }
  });
  test('Manejo de pago fallido', async ({ page }) => {
    
    // Este test simularía un escenario donde el pago falla
    // (tarjeta inválida, fondos insuficientes, etc.)
    
    await page.goto('/login');
    await page.fill('input[name="email"]', testUsers.resident.email);
    await page.fill('input[name="password"]', testUsers.resident.password);
    await page.locator('button[type="submit"]').click();
    await page.waitForLoadState('networkidle');
    // Navegar a pagos y usar tarjeta inválida
    const paymentsLink = page.locator('a:has-text("Pagos")').first();
    if (await paymentsLink.isVisible()) {
      await paymentsLink.click();
      
      const payButton = page.locator('button:has-text("Pagar")').first();
      if (await payButton.isVisible()) {
        await payButton.click();
        
        // Usar número de tarjeta inválido
        await page.fill('input[name="cardNumber"]', '4000000000000002'); // Tarjeta que falla
        await page.fill('input[name="expiryDate"]', '12/26');
        await page.fill('input[name="cvv"]', '123');
        
        const confirmButton = page.locator('button[type="submit"]').first();
        if (await confirmButton.isVisible()) {
          await confirmButton.click();
          
          // Verificar mensaje de error
          await expect(page.locator('text=/error/i, text=/fallido/i, text=/rechazado/i')).toBeVisible({ timeout: 15000 });
        }
      }
    }
  });
});