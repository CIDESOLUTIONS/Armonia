# Test info

- Name: Seguridad - Minutas Digitales y Control de Acceso >> Registro de emergencia por guardia nocturno
- Location: C:\Users\meciz\Documents\armonia\e2e\security.spec.ts:274:7

# Error details

```
Error: browserType.launch: Executable doesn't exist at C:\Users\meciz\AppData\Local\ms-playwright\chromium_headless_shell-1169\chrome-win\headless_shell.exe
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
  174 |       await page.fill('textarea[name="description"]', mediumIncident.description);
  175 |       await page.fill('input[name="location"]', mediumIncident.location);
  176 |       await page.fill('input[name="time"]', mediumIncident.time);
  177 |       
  178 |       const severitySelect = page.locator('select[name="severity"]').first();
  179 |       if (await severitySelect.isVisible()) {
  180 |         await severitySelect.selectOption(mediumIncident.severity);
  181 |       }
  182 |       // Agregar acciones tomadas
  183 |       const actionsField = page.locator('textarea[name="actions"], #incident-actions').first();
  184 |       if (await actionsField.isVisible()) {
  185 |         await actionsField.fill(mediumIncident.actions);
  186 |       }
  187 |       // Guardar incidente
  188 |       await page.locator('button[type="submit"]').first().click();
  189 |       await expect(page.locator('text=/registrado/i')).toBeVisible();
  190 |     });
  191 |     // PASO 5: Finalizar turno
  192 |     await test.step('Finalizar turno de guardia', async () => {
  193 |       // Buscar opción de finalizar turno
  194 |       const endShiftButton = page.locator('button:has-text("Finalizar Turno"), button:has-text("Cerrar Turno")').first();
  195 |       if (await endShiftButton.isVisible()) {
  196 |         await endShiftButton.click();
  197 |         
  198 |         // Confirmar finalización
  199 |         const confirmButton = page.locator('button:has-text("Confirmar"), button:has-text("Sí")').first();
  200 |         if (await confirmButton.isVisible()) {
  201 |           await confirmButton.click();
  202 |         }
  203 |         
  204 |         await expect(page.locator('text=/turno.*finalizado/i, text=/minuta.*cerrada/i')).toBeVisible();
  205 |       }
  206 |     });
  207 |     // PASO 6: Logout del guardia y login como admin
  208 |     await test.step('Cambiar a usuario administrador', async () => {
  209 |       // Logout
  210 |       const logoutButton = page.locator('button:has-text("Salir"), a:has-text("Cerrar")').first();
  211 |       if (await logoutButton.isVisible()) {
  212 |         await logoutButton.click();
  213 |       } else {
  214 |         await page.goto('/logout');
  215 |       }
  216 |       
  217 |       await page.waitForLoadState('networkidle');
  218 |       // Login como administrador
  219 |       await page.goto('/login');
  220 |       await page.fill('input[name="email"]', testUsers.admin.email);
  221 |       await page.fill('input[name="password"]', testUsers.admin.password);
  222 |       await page.locator('button[type="submit"]').click();
  223 |       
  224 |       await page.waitForLoadState('networkidle');
  225 |       await expect(page).toHaveURL(/.*dashboard|admin/);
  226 |     });
  227 |     // PASO 7: Consultar minutas del día
  228 |     await test.step('Admin consulta minutas del día', async () => {
  229 |       // Navegar al módulo de seguridad
  230 |       const securityLink = page.locator('a:has-text("Seguridad"), a:has-text("Minutas"), [href*="security"]').first();
  231 |       await securityLink.click();
  232 |       await page.waitForLoadState('networkidle');
  233 |       // Verificar que aparecen los incidentes registrados
  234 |       await expect(page.locator(`text="${testIncidents[0].title}"`)).toBeVisible();
  235 |       await expect(page.locator(`text="${testIncidents[1].title}"`)).toBeVisible();
  236 |       
  237 |       // Verificar información de guardias
  238 |       await expect(page.locator(`text="${testUsers.guard1.name}"`)).toBeVisible();
  239 |     });
  240 |     // PASO 8: Ver detalle de incidente
  241 |     await test.step('Ver detalle de incidente específico', async () => {
  242 |       // Hacer clic en el incidente de vehículo sospechoso
  243 |       await page.locator(`text="${testIncidents[1].title}"`).click();
  244 |       
  245 |       // Verificar que se abre el detalle
  246 |       await expect(page.locator(`text="${testIncidents[1].description}"`)).toBeVisible();
  247 |       await expect(page.locator(`text="${testIncidents[1].actions}"`)).toBeVisible();
  248 |       await expect(page.locator('text=/medium/i, text=/medio/i')).toBeVisible();
  249 |     });
  250 |     // PASO 9: Generar reporte de seguridad
  251 |     await test.step('Generar reporte de seguridad del día', async () => {
  252 |       // Buscar opción de reportes
  253 |       const reportsButton = page.locator('button:has-text("Reporte"), button:has-text("Exportar"), a:has-text("Reportes")').first();
  254 |       if (await reportsButton.isVisible()) {
  255 |         await reportsButton.click();
  256 |         
  257 |         // Seleccionar período (día actual)
  258 |         const todayOption = page.locator('option:has-text("Hoy"), input[value="today"]').first();
  259 |         if (await todayOption.isVisible()) {
  260 |           await todayOption.click();
  261 |         }
  262 |         
  263 |         // Generar reporte
  264 |         const generateButton = page.locator('button:has-text("Generar"), button:has-text("Crear Reporte")').first();
  265 |         if (await generateButton.isVisible()) {
  266 |           await generateButton.click();
  267 |           
  268 |           // Verificar que se genera el reporte
  269 |           await expect(page.locator('text=/reporte.*generado/i, text=/descarga/i')).toBeVisible({ timeout: 15000 });
  270 |         }
  271 |       }
  272 |     });
  273 |   });
> 274 |   test('Registro de emergencia por guardia nocturno', async ({ page }) => {
      |       ^ Error: browserType.launch: Executable doesn't exist at C:\Users\meciz\AppData\Local\ms-playwright\chromium_headless_shell-1169\chrome-win\headless_shell.exe
  275 |     
  276 |     // PASO 1: Login como guardia nocturno
  277 |     await page.goto('/login');
  278 |     await page.fill('input[name="email"]', testUsers.guard2.email);
  279 |     await page.fill('input[name="password"]', testUsers.guard2.password);
  280 |     await page.locator('button[type="submit"]').click();
  281 |     await page.waitForLoadState('networkidle');
  282 |     // PASO 2: Registrar emergencia
  283 |     await page.locator('a:has-text("Seguridad")').first().click();
  284 |     await page.locator('button:has-text("Nuevo")').first().click();
  285 |     const emergency = testIncidents[2];
  286 |     
  287 |     // Llenar formulario de emergencia
  288 |     const typeSelect = page.locator('select[name="type"]').first();
  289 |     if (await typeSelect.isVisible()) {
  290 |       await typeSelect.selectOption(emergency.type);
  291 |     }
  292 |     await page.fill('input[name="title"]', emergency.title);
  293 |     await page.fill('textarea[name="description"]', emergency.description);
  294 |     await page.fill('input[name="location"]', emergency.location);
  295 |     await page.fill('input[name="time"]', emergency.time);
  296 |     
  297 |     const severitySelect = page.locator('select[name="severity"]').first();
  298 |     if (await severitySelect.isVisible()) {
  299 |       await severitySelect.selectOption(emergency.severity);
  300 |     }
  301 |     await page.fill('textarea[name="actions"]', emergency.actions);
  302 |     // Marcar como emergencia/prioridad alta
  303 |     const emergencyCheckbox = page.locator('input[name="isEmergency"], input[type="checkbox"]').first();
  304 |     if (await emergencyCheckbox.isVisible()) {
  305 |       await emergencyCheckbox.check();
  306 |     }
  307 |     // Guardar emergencia
  308 |     await page.locator('button[type="submit"]').first().click();
  309 |     
  310 |     // Verificar alerta de emergencia
  311 |     await expect(page.locator('text=/emergencia.*registrada/i, text=/alerta.*enviada/i')).toBeVisible();
  312 |   });
  313 |   test('Control de salida de visitantes', async ({ page }) => {
  314 |     
  315 |     // Login como guardia
  316 |     await page.goto('/login');
  317 |     await page.fill('input[name="email"]', testUsers.guard1.email);
  318 |     await page.fill('input[name="password"]', testUsers.guard1.password);
  319 |     await page.locator('button[type="submit"]').click();
  320 |     await page.waitForLoadState('networkidle');
  321 |     // Navegar a control de visitantes
  322 |     await page.locator('a:has-text("Visitantes")').first().click();
  323 |     
  324 |     // Ver visitantes activos
  325 |     const activeVisitorsTab = page.locator('tab:has-text("Activos"), button:has-text("En el conjunto")').first();
  326 |     if (await activeVisitorsTab.isVisible()) {
  327 |       await activeVisitorsTab.click();
  328 |     }
  329 |     // Registrar salida de visitante
  330 |     const visitor = testVisitors[0];
  331 |     const exitButton = page.locator(`text="${visitor.name}"~button:has-text("Salida"), .exit-button`).first();
  332 |     if (await exitButton.isVisible()) {
  333 |       await exitButton.click();
  334 |       
  335 |       // Confirmar salida
  336 |       const confirmExitButton = page.locator('button:has-text("Confirmar Salida")').first();
  337 |       if (await confirmExitButton.isVisible()) {
  338 |         await confirmExitButton.click();
  339 |         
  340 |         await expect(page.locator('text=/salida.*registrada/i')).toBeVisible();
  341 |       }
  342 |     }
  343 |   });
  344 |   test('Búsqueda y filtros en histórico de minutas', async ({ page }) => {
  345 |     
  346 |     // Login como admin
  347 |     await page.goto('/login');
  348 |     await page.fill('input[name="email"]', testUsers.admin.email);
  349 |     await page.fill('input[name="password"]', testUsers.admin.password);
  350 |     await page.locator('button[type="submit"]').click();
  351 |     await page.waitForLoadState('networkidle');
  352 |     // Navegar a seguridad
  353 |     await page.locator('a:has-text("Seguridad")').first().click();
  354 |     
  355 |     // Acceder a histórico
  356 |     const historyTab = page.locator('tab:has-text("Histórico"), a:has-text("Ver Todo")').first();
  357 |     if (await historyTab.isVisible()) {
  358 |       await historyTab.click();
  359 |     }
  360 |     // Aplicar filtro por severidad
  361 |     const severityFilter = page.locator('select[name="severity"], #severity-filter').first();
  362 |     if (await severityFilter.isVisible()) {
  363 |       await severityFilter.selectOption('HIGH');
  364 |       
  365 |       // Verificar que se filtran los resultados
  366 |       await expect(page.locator('text=/emergency/i, text=/alta/i')).toBeVisible();
  367 |     }
  368 |     // Búsqueda por texto
  369 |     const searchInput = page.locator('input[name="search"], #search-input').first();
  370 |     if (await searchInput.isVisible()) {
  371 |       await searchInput.fill('vehículo');
  372 |       
  373 |       // Verificar resultados de búsqueda
  374 |       await expect(page.locator('text="Vehículo Sospechoso"')).toBeVisible();
```