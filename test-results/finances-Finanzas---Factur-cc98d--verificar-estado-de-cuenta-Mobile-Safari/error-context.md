# Test info

- Name: Finanzas - Facturación y Pagos >> Flujo completo: Crear factura, procesar pago y verificar estado de cuenta
- Location: C:\Users\meciz\Documents\armonia\e2e\finances.spec.ts:43:7

# Error details

```
Error: browserType.launch: Executable doesn't exist at C:\Users\meciz\AppData\Local\ms-playwright\webkit-2158\Playwright.exe
╔═════════════════════════════════════════════════════════════════════════╗
║ Looks like Playwright Test or Playwright was just installed or updated. ║
║ Please run the following command to download new browsers:              ║
║                                                                         ║
║     npx playwright install                                              ║
║                                                                         ║
║ <3 Playwright Team                                                      ║
╚═════════════════════════════════════════════════════════════════════════╝
```

# Test source

```ts
   1 | /** 
   2 |  * Pruebas E2E para el módulo de Finanzas
   3 |  * 
   4 |  * Estas pruebas verifican el flujo completo de facturación y pagos:
   5 |  * creación de facturas, procesamiento de pagos y verificación de estados de cuenta.
   6 |  */
   7 | import { test, expect, Page } from '@playwright/test';
   8 | // Datos de prueba
   9 | const testUsers = {
   10 |   admin: {
   11 |     email: 'admin.financiero@test.com',
   12 |     password: 'FinAdmin123!',
   13 |     name: 'Admin Financiero'
   14 |   },
   15 |   resident: {
   16 |     email: 'residente.test@email.com', 
   17 |     password: 'Resident123!',
   18 |     name: 'Juan Residente Test',
   19 |     unitNumber: 'Apto 101'
   20 |   }
   21 | };
   22 | const testInvoice = {
   23 |   description: 'Cuota de Administración - Enero 2025',
   24 |   amount: '350000',
   25 |   dueDate: '2025-02-15',
   26 |   type: 'MONTHLY_FEE',
   27 |   concept: 'Administración mensual'
   28 | };
   29 | const testPayment = {
   30 |   method: 'CREDIT_CARD',
   31 |   cardNumber: '4111111111111111',
   32 |   expiryDate: '12/26',
   33 |   cvv: '123',
   34 |   cardName: 'JUAN RESIDENTE TEST'
   35 | };
   36 | test.describe('Finanzas - Facturación y Pagos', () => {
   37 |   test.beforeEach(async ({ page }) => {
   38 |     // Configurar timeouts más largos para transacciones financieras
   39 |     test.setTimeout(60000);
   40 |     await page.goto('/');
   41 |     await page.waitForLoadState('networkidle');
   42 |   });
>  43 |   test('Flujo completo: Crear factura, procesar pago y verificar estado de cuenta', async ({ page }) => {
      |       ^ Error: browserType.launch: Executable doesn't exist at C:\Users\meciz\AppData\Local\ms-playwright\webkit-2158\Playwright.exe
   44 |     // PASO 1: Login como administrador financiero
   45 |     await test.step('Login como administrador financiero', async () => {
   46 |       await page.goto('/login');
   47 |       
   48 |       await page.fill('input[name="email"], input[type="email"]', testUsers.admin.email);
   49 |       await page.fill('input[name="password"], input[type="password"]', testUsers.admin.password);
   50 |       
   51 |       const loginButton = page.locator('button[type="submit"], button:has-text("Iniciar")').first();
   52 |       await loginButton.click();
   53 |       
   54 |       await page.waitForLoadState('networkidle');
   55 |       await expect(page).toHaveURL(/.*dashboard|admin/);
   56 |     });
   57 |     // PASO 2: Navegar al módulo de finanzas
   58 |     await test.step('Navegar al módulo de finanzas', async () => {
   59 |       // Buscar enlace de finanzas en el menú
   60 |       const financeLink = page.locator('a:has-text("Finanzas"), a:has-text("Facturación"), [href*="finance"]').first();
   61 |       await expect(financeLink).toBeVisible({ timeout: 10000 });
   62 |       await financeLink.click();
   63 |       
   64 |       await page.waitForLoadState('networkidle');
   65 |       await expect(page).toHaveURL(/.*financ|billing|invoice/);
   66 |     });
   67 |     // PASO 3: Crear nueva factura para residente
   68 |     await test.step('Crear nueva factura', async () => {
   69 |       // Buscar botón de crear factura
   70 |       const createInvoiceButton = page.locator('button:has-text("Crear"), button:has-text("Nueva"), button:has-text("Factura")').first();
   71 |       await expect(createInvoiceButton).toBeVisible({ timeout: 10000 });
   72 |       await createInvoiceButton.click();
   73 |       // Esperar que aparezca el formulario
   74 |       await expect(page.locator('form, .modal, .dialog')).toBeVisible();
   75 |       // Seleccionar residente (buscar por unidad o nombre)
   76 |       const residentSelect = page.locator('select[name="resident"], input[name="resident"], #resident-select').first();
   77 |       if (await residentSelect.isVisible()) {
   78 |         await residentSelect.click();
   79 |         await page.locator(`option:has-text("${testUsers.resident.unitNumber}"), option:has-text("${testUsers.resident.name}")`).first().click();
   80 |       }
   81 |       // Llenar datos de la factura
   82 |       await page.fill('input[name="description"], #invoice-description', testInvoice.description);
   83 |       await page.fill('input[name="amount"], #invoice-amount', testInvoice.amount);
   84 |       await page.fill('input[name="dueDate"], input[type="date"], #due-date', testInvoice.dueDate);
   85 |       // Seleccionar tipo de factura si existe
   86 |       const typeSelect = page.locator('select[name="type"], #invoice-type').first();
   87 |       if (await typeSelect.isVisible()) {
   88 |         await typeSelect.selectOption(testInvoice.type);
   89 |       }
   90 |       // Enviar formulario
   91 |       const submitButton = page.locator('button[type="submit"], button:has-text("Crear"), button:has-text("Generar")').first();
   92 |       await submitButton.click();
   93 |       // Verificar creación exitosa
   94 |       await expect(page.locator('text=/creada/i, text=/generada/i, text=/éxito/i')).toBeVisible({ timeout: 15000 });
   95 |     });
   96 |     // PASO 4: Logout del admin y login como residente
   97 |     await test.step('Cambiar a usuario residente', async () => {
   98 |       // Logout
   99 |       const logoutButton = page.locator('button:has-text("Salir"), button:has-text("Logout"), a:has-text("Cerrar")').first();
  100 |       if (await logoutButton.isVisible()) {
  101 |         await logoutButton.click();
  102 |       } else {
  103 |         await page.goto('/logout');
  104 |       }
  105 |       
  106 |       await page.waitForLoadState('networkidle');
  107 |       // Login como residente
  108 |       await page.goto('/login');
  109 |       await page.fill('input[name="email"], input[type="email"]', testUsers.resident.email);
  110 |       await page.fill('input[name="password"], input[type="password"]', testUsers.resident.password);
  111 |       
  112 |       const loginButton = page.locator('button[type="submit"], button:has-text("Iniciar")').first();
  113 |       await loginButton.click();
  114 |       
  115 |       await page.waitForLoadState('networkidle');
  116 |       await expect(page).toHaveURL(/.*dashboard|resident/);
  117 |     });
  118 |     // PASO 5: Ver facturas pendientes
  119 |     await test.step('Ver facturas pendientes', async () => {
  120 |       // Navegar a facturas/pagos
  121 |       const paymentsLink = page.locator('a:has-text("Facturas"), a:has-text("Pagos"), a:has-text("Finanzas"), [href*="payment"]').first();
  122 |       await expect(paymentsLink).toBeVisible({ timeout: 10000 });
  123 |       await paymentsLink.click();
  124 |       await page.waitForLoadState('networkidle');
  125 |       // Verificar que aparece la factura creada
  126 |       await expect(page.locator(`text="${testInvoice.description}"`)).toBeVisible();
  127 |       await expect(page.locator(`text="$${testInvoice.amount}", text="${testInvoice.amount}"`)).toBeVisible();
  128 |     });
  129 |     // PASO 6: Procesar pago de la factura
  130 |     await test.step('Procesar pago de factura', async () => {
  131 |       // Buscar y hacer clic en botón de pagar
  132 |       const payButton = page.locator('button:has-text("Pagar"), button:has-text("Pay"), .pay-button').first();
  133 |       await expect(payButton).toBeVisible();
  134 |       await payButton.click();
  135 |       // Esperar formulario de pago
  136 |       await expect(page.locator('form, .payment-form, .modal')).toBeVisible();
  137 |       // Seleccionar método de pago
  138 |       const paymentMethodSelect = page.locator('select[name="method"], #payment-method').first();
  139 |       if (await paymentMethodSelect.isVisible()) {
  140 |         await paymentMethodSelect.selectOption(testPayment.method);
  141 |       }
  142 |       // Llenar datos de tarjeta (si es pago con tarjeta)
  143 |       if (testPayment.method === 'CREDIT_CARD') {
```