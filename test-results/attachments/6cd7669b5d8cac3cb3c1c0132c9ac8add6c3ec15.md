# Test info

- Name: Finanzas - Facturación y Pagos >> Validación de campos en formulario de pago
- Location: C:\Users\meciz\Documents\armonia\e2e\finances.spec.ts:204:7

# Error details

```
Error: browserType.launch: Executable doesn't exist at C:\Users\meciz\AppData\Local\ms-playwright\firefox-1482\firefox\firefox.exe
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
  144 |         await page.fill('input[name="cardNumber"], #card-number', testPayment.cardNumber);
  145 |         await page.fill('input[name="expiryDate"], #expiry-date', testPayment.expiryDate);
  146 |         await page.fill('input[name="cvv"], #cvv', testPayment.cvv);
  147 |         await page.fill('input[name="cardName"], #card-name', testPayment.cardName);
  148 |       }
  149 |       // Confirmar pago
  150 |       const confirmPayButton = page.locator('button[type="submit"], button:has-text("Confirmar"), button:has-text("Pagar")').first();
  151 |       await confirmPayButton.click();
  152 |       // Esperar procesamiento del pago
  153 |       await page.waitForLoadState('networkidle');
  154 |       
  155 |       // Verificar pago exitoso
  156 |       await expect(page.locator('text=/pago.*exitoso/i, text=/transacción.*aprobada/i, text=/pagado/i')).toBeVisible({ timeout: 20000 });
  157 |     });
  158 |     // PASO 7: Verificar estado de cuenta actualizado
  159 |     await test.step('Verificar estado de cuenta', async () => {
  160 |       // Navegar a estado de cuenta
  161 |       const accountLink = page.locator('a:has-text("Estado de Cuenta"), a:has-text("Mi Cuenta"), [href*="account"]').first();
  162 |       if (await accountLink.isVisible()) {
  163 |         await accountLink.click();
  164 |         await page.waitForLoadState('networkidle');
  165 |       }
  166 |       // Verificar que el pago aparece registrado
  167 |       await expect(page.locator(`text="${testInvoice.description}"`)).toBeVisible();
  168 |       await expect(page.locator('text=/pagado/i, text=/paid/i, .status-paid')).toBeVisible();
  169 |       
  170 |       // Verificar saldo actualizado (debe ser 0 o menor)
  171 |       const balanceElement = page.locator('[data-testid="balance"], .balance, .saldo').first();
  172 |       if (await balanceElement.isVisible()) {
  173 |         const balanceText = await balanceElement.textContent();
  174 |         // El saldo debería ser 0 o mostrar que no hay deudas pendientes
  175 |         expect(balanceText).toMatch(/0|sin.*deuda|al.*día/i);
  176 |       }
  177 |     });
  178 |     // PASO 8: Verificar desde lado administrativo
  179 |     await test.step('Verificar pago desde administración', async () => {
  180 |       // Logout del residente
  181 |       const logoutButton = page.locator('button:has-text("Salir"), a:has-text("Cerrar")').first();
  182 |       if (await logoutButton.isVisible()) {
  183 |         await logoutButton.click();
  184 |       } else {
  185 |         await page.goto('/logout');
  186 |       }
  187 |       // Login como admin nuevamente
  188 |       await page.goto('/login');
  189 |       await page.fill('input[name="email"]', testUsers.admin.email);
  190 |       await page.fill('input[name="password"]', testUsers.admin.password);
  191 |       await page.locator('button[type="submit"]').click();
  192 |       await page.waitForLoadState('networkidle');
  193 |       // Navegar a reportes de pagos o transacciones
  194 |       const reportsLink = page.locator('a:has-text("Reportes"), a:has-text("Transacciones"), [href*="report"]').first();
  195 |       if (await reportsLink.isVisible()) {
  196 |         await reportsLink.click();
  197 |         await page.waitForLoadState('networkidle');
  198 |         // Verificar que aparece el pago recibido
  199 |         await expect(page.locator(`text="${testUsers.resident.name}", text="${testUsers.resident.unitNumber}"`)).toBeVisible();
  200 |         await expect(page.locator('text=/recibido/i, text=/pagado/i, .status-paid')).toBeVisible();
  201 |       }
  202 |     });
  203 |   });
> 204 |   test('Validación de campos en formulario de pago', async ({ page }) => {
      |       ^ Error: browserType.launch: Executable doesn't exist at C:\Users\meciz\AppData\Local\ms-playwright\firefox-1482\firefox\firefox.exe
  205 |     
  206 |     // Login como residente
  207 |     await page.goto('/login');
  208 |     await page.fill('input[name="email"]', testUsers.resident.email);
  209 |     await page.fill('input[name="password"]', testUsers.resident.password);
  210 |     await page.locator('button[type="submit"]').click();
  211 |     await page.waitForLoadState('networkidle');
  212 |     // Navegar a pagos
  213 |     const paymentsLink = page.locator('a:has-text("Facturas"), a:has-text("Pagos")').first();
  214 |     if (await paymentsLink.isVisible()) {
  215 |       await paymentsLink.click();
  216 |       // Intentar pagar sin llenar datos
  217 |       const payButton = page.locator('button:has-text("Pagar")').first();
  218 |       if (await payButton.isVisible()) {
  219 |         await payButton.click();
  220 |         
  221 |         const confirmButton = page.locator('button[type="submit"], button:has-text("Confirmar")').first();
  222 |         if (await confirmButton.isVisible()) {
  223 |           await confirmButton.click();
  224 |           
  225 |           // Verificar mensajes de validación
  226 |           await expect(page.locator('text=/requerido/i, text=/obligatorio/i, .error')).toBeVisible();
  227 |         }
  228 |       }
  229 |     }
  230 |   });
  231 |   test('Manejo de pago fallido', async ({ page }) => {
  232 |     
  233 |     // Este test simularía un escenario donde el pago falla
  234 |     // (tarjeta inválida, fondos insuficientes, etc.)
  235 |     
  236 |     await page.goto('/login');
  237 |     await page.fill('input[name="email"]', testUsers.resident.email);
  238 |     await page.fill('input[name="password"]', testUsers.resident.password);
  239 |     await page.locator('button[type="submit"]').click();
  240 |     await page.waitForLoadState('networkidle');
  241 |     // Navegar a pagos y usar tarjeta inválida
  242 |     const paymentsLink = page.locator('a:has-text("Pagos")').first();
  243 |     if (await paymentsLink.isVisible()) {
  244 |       await paymentsLink.click();
  245 |       
  246 |       const payButton = page.locator('button:has-text("Pagar")').first();
  247 |       if (await payButton.isVisible()) {
  248 |         await payButton.click();
  249 |         
  250 |         // Usar número de tarjeta inválido
  251 |         await page.fill('input[name="cardNumber"]', '4000000000000002'); // Tarjeta que falla
  252 |         await page.fill('input[name="expiryDate"]', '12/26');
  253 |         await page.fill('input[name="cvv"]', '123');
  254 |         
  255 |         const confirmButton = page.locator('button[type="submit"]').first();
  256 |         if (await confirmButton.isVisible()) {
  257 |           await confirmButton.click();
  258 |           
  259 |           // Verificar mensaje de error
  260 |           await expect(page.locator('text=/error/i, text=/fallido/i, text=/rechazado/i')).toBeVisible({ timeout: 15000 });
  261 |         }
  262 |       }
  263 |     }
  264 |   });
  265 | });
```