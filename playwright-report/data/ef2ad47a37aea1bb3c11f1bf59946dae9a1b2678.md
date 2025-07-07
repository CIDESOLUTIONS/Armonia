# Test info

- Name: Reservas - Áreas Comunes >> Cancelación de reserva por residente
- Location: C:\Users\meciz\Documents\armonia\e2e\reservations.spec.ts:263:7

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
  163 |     // PASO 6: Confirmar y proceder al pago
  164 |     await test.step('Confirmar reserva y proceder al pago', async () => {
  165 |       // Aceptar términos y condiciones
  166 |       const termsCheckbox = page.locator('input[type="checkbox"][name*="terms"], #accept-terms').first();
  167 |       if (await termsCheckbox.isVisible()) {
  168 |         await termsCheckbox.check();
  169 |       }
  170 |       // Confirmar reserva
  171 |       const confirmButton = page.locator('button[type="submit"], button:has-text("Confirmar"), button:has-text("Continuar")').first();
  172 |       await confirmButton.click();
  173 |       // Esperar redirección a página de pago
  174 |       await page.waitForLoadState('networkidle');
  175 |       await expect(page.locator('text=/pago/i, text=/payment/i, .payment-form')).toBeVisible({ timeout: 15000 });
  176 |     });
  177 |     // PASO 7: Procesar pago de la reserva
  178 |     await test.step('Procesar pago de la reserva', async () => {
  179 |       // Verificar resumen de la reserva en página de pago
  180 |       await expect(page.locator(`text="${testReservation.area}"`)).toBeVisible();
  181 |       await expect(page.locator(`text="${testReservation.date}"`)).toBeVisible();
  182 |       await expect(page.locator(`text="${testReservation.startTime}"`)).toBeVisible();
  183 |       // Seleccionar método de pago
  184 |       const paymentMethodSelect = page.locator('select[name="paymentMethod"], #payment-method').first();
  185 |       if (await paymentMethodSelect.isVisible()) {
  186 |         await paymentMethodSelect.selectOption(testPayment.method);
  187 |       }
  188 |       // Llenar datos de tarjeta
  189 |       await page.fill('input[name="cardNumber"], #card-number', testPayment.cardNumber);
  190 |       await page.fill('input[name="expiryDate"], #expiry-date', testPayment.expiryDate);
  191 |       await page.fill('input[name="cvv"], #cvv', testPayment.cvv);
  192 |       await page.fill('input[name="cardName"], #card-name', testPayment.cardName);
  193 |       // Seleccionar cuotas si aplica
  194 |       const installmentsSelect = page.locator('select[name="installments"], #installments').first();
  195 |       if (await installmentsSelect.isVisible()) {
  196 |         await installmentsSelect.selectOption(testPayment.installments);
  197 |       }
  198 |       // Procesar pago
  199 |       const payButton = page.locator('button[type="submit"], button:has-text("Pagar"), button:has-text("Procesar")').first();
  200 |       await payButton.click();
  201 |       // Esperar procesamiento y confirmación
  202 |       await page.waitForLoadState('networkidle');
  203 |       await expect(page.locator('text=/pago.*exitoso/i, text=/reserva.*confirmada/i, text=/transacción.*aprobada/i')).toBeVisible({ timeout: 20000 });
  204 |     });
  205 |     // PASO 8: Verificar confirmación de reserva
  206 |     await test.step('Verificar confirmación de reserva', async () => {
  207 |       // Verificar detalles de la reserva confirmada
  208 |       await expect(page.locator(`text="${testReservation.area}"`)).toBeVisible();
  209 |       await expect(page.locator(`text="${testReservation.date}"`)).toBeVisible();
  210 |       await expect(page.locator('text=/confirmada/i, text=/aprobada/i')).toBeVisible();
  211 |       // Verificar número de confirmación o código de reserva
  212 |       const confirmationCode = page.locator('[data-testid="confirmation-code"], .confirmation-number').first();
  213 |       if (await confirmationCode.isVisible()) {
  214 |         const codeText = await confirmationCode.textContent();
  215 |         expect(codeText).toMatch(/[A-Z0-9]{6,}/); // Formato típico de código de confirmación
  216 |       }
  217 |       // Opción de descargar comprobante
  218 |       const downloadReceiptButton = page.locator('button:has-text("Descargar"), a:has-text("Comprobante")').first();
  219 |       if (await downloadReceiptButton.isVisible()) {
  220 |         // Verificar que el botón está disponible (no necesariamente hacer clic)
  221 |         await expect(downloadReceiptButton).toBeEnabled();
  222 |       }
  223 |     });
  224 |     // PASO 9: Verificar reserva en calendario personal
  225 |     await test.step('Verificar reserva en calendario personal', async () => {
  226 |       // Navegar a "Mis Reservas" o calendario
  227 |       const myReservationsLink = page.locator('a:has-text("Mis Reservas"), a:has-text("Mi Calendario"), [href*="my-reserv"]').first();
  228 |       if (await myReservationsLink.isVisible()) {
  229 |         await myReservationsLink.click();
  230 |       } else {
  231 |         await page.goto('/reservations/my-reservations');
  232 |       }
  233 |       await page.waitForLoadState('networkidle');
  234 |       // Verificar que aparece la reserva en la lista
  235 |       await expect(page.locator(`text="${testReservation.area}"`)).toBeVisible();
  236 |       await expect(page.locator(`text="${testReservation.date}"`)).toBeVisible();
  237 |       await expect(page.locator('text=/confirmada/i, text=/activa/i')).toBeVisible();
  238 |     });
  239 |   });
  240 |   test('Validación de conflictos de horario', async ({ page }) => {
  241 |     
  242 |     // Login como residente 1
  243 |     await page.goto('/login');
  244 |     await page.fill('input[name="email"]', testUsers.resident1.email);
  245 |     await page.fill('input[name="password"]', testUsers.resident1.password);
  246 |     await page.locator('button[type="submit"]').click();
  247 |     await page.waitForLoadState('networkidle');
  248 |     // Intentar reservar en horario ya ocupado
  249 |     await page.locator('a:has-text("Reservas")').first().click();
  250 |     await page.locator(`text="${testReservation.area}"`).click();
  251 |     // Seleccionar misma fecha y horario
  252 |     await page.fill('input[name="date"]', testReservation.date);
  253 |     await page.fill('input[name="startTime"]', testReservation.startTime);
  254 |     await page.fill('input[name="endTime"]', testReservation.endTime);
  255 |     const reserveButton = page.locator('button:has-text("Reservar")').first();
  256 |     if (await reserveButton.isVisible()) {
  257 |       await reserveButton.click();
  258 |       
  259 |       // Verificar mensaje de conflicto
  260 |       await expect(page.locator('text=/no.*disponible/i, text=/ocupado/i, text=/conflicto/i')).toBeVisible();
  261 |     }
  262 |   });
> 263 |   test('Cancelación de reserva por residente', async ({ page }) => {
      |       ^ Error: browserType.launch: Executable doesn't exist at C:\Users\meciz\AppData\Local\ms-playwright\firefox-1482\firefox\firefox.exe
  264 |     
  265 |     // Login como residente
  266 |     await page.goto('/login');
  267 |     await page.fill('input[name="email"]', testUsers.resident1.email);
  268 |     await page.fill('input[name="password"]', testUsers.resident1.password);
  269 |     await page.locator('button[type="submit"]').click();
  270 |     await page.waitForLoadState('networkidle');
  271 |     // Ir a mis reservas
  272 |     await page.locator('a:has-text("Mis Reservas")').first().click();
  273 |     // Buscar reserva activa y cancelar
  274 |     const cancelButton = page.locator('button:has-text("Cancelar"), .cancel-reservation').first();
  275 |     if (await cancelButton.isVisible()) {
  276 |       await cancelButton.click();
  277 |       // Confirmar cancelación
  278 |       const confirmCancelButton = page.locator('button:has-text("Confirmar Cancelación"), button:has-text("Sí")').first();
  279 |       if (await confirmCancelButton.isVisible()) {
  280 |         await confirmCancelButton.click();
  281 |         
  282 |         // Verificar cancelación exitosa
  283 |         await expect(page.locator('text=/cancelada/i, text=/anulada/i')).toBeVisible();
  284 |       }
  285 |     }
  286 |   });
  287 |   test('Gestión de reservas por administrador', async ({ page }) => {
  288 |     
  289 |     // Login como administrador
  290 |     await page.goto('/login');
  291 |     await page.fill('input[name="email"]', testUsers.admin.email);
  292 |     await page.fill('input[name="password"]', testUsers.admin.password);
  293 |     await page.locator('button[type="submit"]').click();
  294 |     await page.waitForLoadState('networkidle');
  295 |     // Navegar a gestión de reservas
  296 |     await page.locator('a:has-text("Reservas"), a:has-text("Gestión")').first().click();
  297 |     
  298 |     // Ver todas las reservas
  299 |     const allReservationsTab = page.locator('tab:has-text("Todas"), button:has-text("Ver Todas")').first();
  300 |     if (await allReservationsTab.isVisible()) {
  301 |       await allReservationsTab.click();
  302 |     }
  303 |     // Verificar que aparecen reservas de todos los residentes
  304 |     await expect(page.locator(`text="${testUsers.resident1.name}"`)).toBeVisible();
  305 |     await expect(page.locator(`text="${testReservation.area}"`)).toBeVisible();
  306 |     // Filtrar por área común
  307 |     const areaFilter = page.locator('select[name="area"], #area-filter').first();
  308 |     if (await areaFilter.isVisible()) {
  309 |       await areaFilter.selectOption(testReservation.area);
  310 |       
  311 |       // Verificar filtrado
  312 |       await expect(page.locator(`text="${testReservation.area}"`)).toBeVisible();
  313 |     }
  314 |     // Ver detalles de una reserva
  315 |     const viewDetailsButton = page.locator('button:has-text("Ver"), button:has-text("Detalles")').first();
  316 |     if (await viewDetailsButton.isVisible()) {
  317 |       await viewDetailsButton.click();
  318 |       
  319 |       // Verificar información detallada
  320 |       await expect(page.locator(`text="${testReservation.purpose}"`)).toBeVisible();
  321 |       await expect(page.locator(`text="${testReservation.estimatedGuests}"`)).toBeVisible();
  322 |     }
  323 |   });
  324 |   test('Configuración de tarifas por administrador', async ({ page }) => {
  325 |     
  326 |     // Login como administrador
  327 |     await page.goto('/login');
  328 |     await page.fill('input[name="email"]', testUsers.admin.email);
  329 |     await page.fill('input[name="password"]', testUsers.admin.password);
  330 |     await page.locator('button[type="submit"]').click();
  331 |     await page.waitForLoadState('networkidle');
  332 |     // Navegar a configuración de áreas comunes
  333 |     await page.locator('a:has-text("Configuración"), a:has-text("Áreas")').first().click();
  334 |     
  335 |     // Editar tarifa de un área
  336 |     const editAreaButton = page.locator(`text="${testCommonAreas[0].name}"~button:has-text("Editar"), .edit-area`).first();
  337 |     if (await editAreaButton.isVisible()) {
  338 |       await editAreaButton.click();
  339 |       // Cambiar tarifa
  340 |       const rateInput = page.locator('input[name="hourlyRate"], #hourly-rate').first();
  341 |       if (await rateInput.isVisible()) {
  342 |         await rateInput.clear();
  343 |         await rateInput.fill('90000'); // Nueva tarifa
  344 |         // Guardar cambios
  345 |         const saveButton = page.locator('button[type="submit"], button:has-text("Guardar")').first();
  346 |         await saveButton.click();
  347 |         
  348 |         // Verificar actualización
  349 |         await expect(page.locator('text=/actualizada/i, text=/guardada/i')).toBeVisible();
  350 |       }
  351 |     }
  352 |   });
  353 |   test('Reporte de ocupación de áreas comunes', async ({ page }) => {
  354 |     
  355 |     // Login como administrador
  356 |     await page.goto('/login');
  357 |     await page.fill('input[name="email"]', testUsers.admin.email);
  358 |     await page.fill('input[name="password"]', testUsers.admin.password);
  359 |     await page.locator('button[type="submit"]').click();
  360 |     await page.waitForLoadState('networkidle');
  361 |     // Navegar a reportes
  362 |     await page.locator('a:has-text("Reportes"), a:has-text("Estadísticas")').first().click();
  363 |     
```