# Test info

- Name: Navegación Completa - Landing a Dashboard >> Verificar logout y cambio de portales
- Location: C:\Users\meciz\Documents\armonia\e2e\complete-navigation.spec.ts:391:7

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
  291 |       await page.waitForLoadState('networkidle');
  292 |       // Seleccionar portal recepción
  293 |       const receptionPortal = page.locator('button:has-text("Recepción"), .reception-portal, [data-portal="reception"]').first();
  294 |       await expect(receptionPortal).toBeVisible();
  295 |       await receptionPortal.click();
  296 |       await page.waitForLoadState('networkidle');
  297 |     });
  298 |     // PASO 2: Login como recepcionista
  299 |     await test.step('Login como recepcionista', async () => {
  300 |       await page.fill('input[name="email"]', testUsers.reception.email);
  301 |       await page.fill('input[name="password"]', testUsers.reception.password);
  302 |       
  303 |       const loginButton = page.locator('button[type="submit"]').first();
  304 |       await loginButton.click();
  305 |       await page.waitForLoadState('networkidle');
  306 |       
  307 |       await expect(page).toHaveURL(/.*dashboard|reception/);
  308 |       await expect(page.locator(`text="${testUsers.reception.name}", text=/recepción/i`)).toBeVisible();
  309 |     });
  310 |     // PASO 3: Navegar por el menú de recepción
  311 |     await test.step('Navegar por opciones del menú de recepción', async () => {
  312 |       for (const menuItem of menuItems.reception) {
  313 |         const menuLink = page.locator(`a:has-text("${menuItem.name}")`).first();
  314 |         
  315 |         if (await menuLink.isVisible()) {
  316 |           await menuLink.click();
  317 |           await page.waitForLoadState('networkidle');
  318 |           
  319 |           await expect(page.locator(`h1:has-text("${menuItem.name}"), .page-title`)).toBeVisible({ timeout: 10000 });
  320 |           await page.waitForTimeout(800);
  321 |         }
  322 |       }
  323 |     });
  324 |     // PASO 4: Verificar funcionalidades específicas de recepción
  325 |     await test.step('Verificar funcionalidades específicas de recepción', async () => {
  326 |       // Visitantes
  327 |       await page.locator('a:has-text("Visitantes")').first().click();
  328 |       await expect(page.locator('text=/registro de visitas/i, text=/autorización/i')).toBeVisible();
  329 |       
  330 |       // Paquetes
  331 |       await page.locator('a:has-text("Paquetes")').first().click();
  332 |       await expect(page.locator('text=/correspondencia/i, text=/entrega/i')).toBeVisible();
  333 |       
  334 |       // Incidentes
  335 |       await page.locator('a:has-text("Incidentes")').first().click();
  336 |       await expect(page.locator('text=/reportar/i, text=/novedad/i')).toBeVisible();
  337 |     });
  338 |   });
  339 |   test('Verificar accesibilidad y UX del menú lateral', async ({ page }) => {
  340 |     // Login como administrador
  341 |     await page.goto('/portal-selector');
  342 |     await page.locator('button:has-text("Administrador")').first().click();
  343 |     await page.fill('input[name="email"]', testUsers.admin.email);
  344 |     await page.fill('input[name="password"]', testUsers.admin.password);
  345 |     await page.locator('button[type="submit"]').first().click();
  346 |     await page.waitForLoadState('networkidle');
  347 |     // PASO 1: Verificar accesibilidad del menú
  348 |     await test.step('Verificar accesibilidad del menú lateral', async () => {
  349 |       // Verificar que el menú tiene atributos de accesibilidad
  350 |       const sidebar = page.locator('nav[role="navigation"], .sidebar').first();
  351 |       await expect(sidebar).toBeVisible();
  352 |       
  353 |       // Verificar navegación por teclado
  354 |       await page.keyboard.press('Tab');
  355 |       await page.keyboard.press('Tab');
  356 |       
  357 |       // Verificar que los elementos del menú son focuseables
  358 |       const firstMenuItem = page.locator('.menu-item a, nav a').first();
  359 |       await firstMenuItem.focus();
  360 |       await expect(firstMenuItem).toBeFocused();
  361 |     });
  362 |     // PASO 2: Verificar estados del menú
  363 |     await test.step('Verificar estados activo/inactivo del menú', async () => {
  364 |       // Navegar a diferentes secciones y verificar estado activo
  365 |       await page.locator('a:has-text("Inventario")').first().click();
  366 |       await expect(page.locator('a:has-text("Inventario").active, .menu-item.active:has-text("Inventario")')).toBeVisible();
  367 |       
  368 |       await page.locator('a:has-text("Finanzas")').first().click();
  369 |       await expect(page.locator('a:has-text("Finanzas").active, .menu-item.active:has-text("Finanzas")')).toBeVisible();
  370 |     });
  371 |     // PASO 3: Verificar responsive del menú
  372 |     await test.step('Verificar comportamiento responsive', async () => {
  373 |       // Simular pantalla móvil
  374 |       await page.setViewportSize({ width: 768, height: 1024 });
  375 |       await page.waitForTimeout(500);
  376 |       
  377 |       // Verificar que el menú se adapta o se oculta en móvil
  378 |       const mobileMenu = page.locator('.mobile-menu, .sidebar-mobile').first();
  379 |       const menuToggle = page.locator('.menu-toggle, .hamburger').first();
  380 |       
  381 |       if (await menuToggle.isVisible()) {
  382 |         await menuToggle.click();
  383 |         await page.waitForTimeout(500);
  384 |       }
  385 |       
  386 |       // Restaurar tamaño desktop
  387 |       await page.setViewportSize({ width: 1920, height: 1080 });
  388 |       await page.waitForTimeout(500);
  389 |     });
  390 |   });
> 391 |   test('Verificar logout y cambio de portales', async ({ page }) => {
      |       ^ Error: browserType.launch: Executable doesn't exist at C:\Users\meciz\AppData\Local\ms-playwright\chromium_headless_shell-1169\chrome-win\headless_shell.exe
  392 |     // Login inicial como administrador
  393 |     await page.goto('/portal-selector');
  394 |     await page.locator('button:has-text("Administrador")').first().click();
  395 |     await page.fill('input[name="email"]', testUsers.admin.email);
  396 |     await page.fill('input[name="password"]', testUsers.admin.password);
  397 |     await page.locator('button[type="submit"]').first().click();
  398 |     await page.waitForLoadState('networkidle');
  399 |     // PASO 1: Verificar función de logout
  400 |     await test.step('Verificar logout desde dashboard', async () => {
  401 |       // Buscar botón de logout
  402 |       const logoutButton = page.locator('button:has-text("Salir"), button:has-text("Logout"), .logout-btn').first();
  403 |       await expect(logoutButton).toBeVisible();
  404 |       await logoutButton.click();
  405 |       
  406 |       // Verificar que regresamos a la página de login o landing
  407 |       await page.waitForLoadState('networkidle');
  408 |       await expect(page).toHaveURL(/.*login|portal|landing|\//);
  409 |     });
  410 |     // PASO 2: Verificar cambio de portal
  411 |     await test.step('Cambiar a portal residente', async () => {
  412 |       // Si estamos en login, ir al selector de portales
  413 |       if (page.url().includes('login')) {
  414 |         await page.goto('/portal-selector');
  415 |       }
  416 |       
  417 |       // Seleccionar portal residente
  418 |       await page.locator('button:has-text("Residente")').first().click();
  419 |       await page.fill('input[name="email"]', testUsers.resident.email);
  420 |       await page.fill('input[name="password"]', testUsers.resident.password);
  421 |       await page.locator('button[type="submit"]').first().click();
  422 |       await page.waitForLoadState('networkidle');
  423 |       
  424 |       // Verificar que estamos en dashboard residente
  425 |       await expect(page).toHaveURL(/.*dashboard|resident/);
  426 |       await expect(page.locator('text=/residente/i')).toBeVisible();
  427 |     });
  428 |   });
  429 | });
```