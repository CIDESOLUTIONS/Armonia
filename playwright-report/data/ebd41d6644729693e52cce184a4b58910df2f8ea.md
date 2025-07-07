# Test info

- Name: Inventario - Gestión Completa del Conjunto >> Gestión de servicios comunes
- Location: C:\Users\meciz\Documents\armonia\e2e\inventory.spec.ts:462:7

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
  362 |         }
  363 |         // Parqueadero asignado
  364 |         const parkingSpotField = page.locator('input[name="parkingSpot"], #parking-spot').first();
  365 |         if (await parkingSpotField.isVisible()) {
  366 |           await parkingSpotField.fill(vehicle.parkingSpot);
  367 |         }
  368 |         // Guardar vehículo
  369 |         const saveVehicleButton = page.locator('button[type="submit"], button:has-text("Registrar")').first();
  370 |         await saveVehicleButton.click();
  371 |         
  372 |         await expect(page.locator('text=/vehículo.*registrado/i, text=/guardado/i')).toBeVisible({ timeout: 10000 });
  373 |         await page.waitForTimeout(1000);
  374 |       }
  375 |     });
  376 |     // PASO 8: Verificar estadísticas del inventario
  377 |     await test.step('Verificar estadísticas y resumen del inventario', async () => {
  378 |       // Navegar a resumen/estadísticas
  379 |       const summaryTab = page.locator('tab:has-text("Resumen"), button:has-text("Estadísticas"), a:has-text("Dashboard")').first();
  380 |       if (await summaryTab.isVisible()) {
  381 |         await summaryTab.click();
  382 |         await page.waitForLoadState('networkidle');
  383 |         // Verificar que aparecen las estadísticas actualizadas
  384 |         await expect(page.locator(`text="${complexData.units}", text="52"`)).toBeVisible();
  385 |         await expect(page.locator('text=/residentes.*registrados/i')).toBeVisible();
  386 |         await expect(page.locator('text=/propiedades.*registradas/i')).toBeVisible();
  387 |         await expect(page.locator('text=/mascotas.*registradas/i')).toBeVisible();
  388 |         await expect(page.locator('text=/vehículos.*registrados/i')).toBeVisible();
  389 |       }
  390 |     });
  391 |   });
  392 |   test('Buscar y filtrar en el inventario', async ({ page }) => {
  393 |     
  394 |     // Login como administrador
  395 |     await page.goto('/login');
  396 |     await page.fill('input[name="email"]', testUsers.admin.email);
  397 |     await page.fill('input[name="password"]', testUsers.admin.password);
  398 |     await page.locator('button[type="submit"]').click();
  399 |     await page.waitForLoadState('networkidle');
  400 |     // Navegar a inventario
  401 |     await page.locator('a:has-text("Inventario")').first().click();
  402 |     await page.locator('tab:has-text("Residentes")').first().click();
  403 |     // Buscar residente por nombre
  404 |     const searchInput = page.locator('input[name="search"], #search-residents').first();
  405 |     if (await searchInput.isVisible()) {
  406 |       await searchInput.fill('María García');
  407 |       
  408 |       // Verificar resultados de búsqueda
  409 |       await expect(page.locator('text="María García López"')).toBeVisible();
  410 |     }
  411 |     // Filtrar por tipo de residente
  412 |     const residentTypeFilter = page.locator('select[name="residentType"], #filter-resident-type').first();
  413 |     if (await residentTypeFilter.isVisible()) {
  414 |       await residentTypeFilter.selectOption('OWNER');
  415 |       
  416 |       // Verificar filtrado
  417 |       await expect(page.locator('text=/propietario/i, text=/owner/i')).toBeVisible();
  418 |     }
  419 |     // Filtrar por torre
  420 |     const towerFilter = page.locator('select[name="tower"], #filter-tower').first();
  421 |     if (await towerFilter.isVisible()) {
  422 |       await towerFilter.selectOption('Torre A');
  423 |       
  424 |       // Verificar filtrado por torre
  425 |       await expect(page.locator('text="Torre A"')).toBeVisible();
  426 |     }
  427 |   });
  428 |   test('Exportar reportes de inventario', async ({ page }) => {
  429 |     
  430 |     // Login como administrador
  431 |     await page.goto('/login');
  432 |     await page.fill('input[name="email"]', testUsers.admin.email);
  433 |     await page.fill('input[name="password"]', testUsers.admin.password);
  434 |     await page.locator('button[type="submit"]').click();
  435 |     await page.waitForLoadState('networkidle');
  436 |     // Navegar a inventario
  437 |     await page.locator('a:has-text("Inventario")').first().click();
  438 |     // Buscar opción de exportar
  439 |     const exportButton = page.locator('button:has-text("Exportar"), button:has-text("Descargar"), .export-button').first();
  440 |     if (await exportButton.isVisible()) {
  441 |       await exportButton.click();
  442 |       // Seleccionar tipo de reporte
  443 |       const reportTypeSelect = page.locator('select[name="reportType"], #report-type').first();
  444 |       if (await reportTypeSelect.isVisible()) {
  445 |         await reportTypeSelect.selectOption('COMPLETE_INVENTORY');
  446 |       }
  447 |       // Seleccionar formato
  448 |       const formatSelect = page.locator('select[name="format"], #export-format').first();
  449 |       if (await formatSelect.isVisible()) {
  450 |         await formatSelect.selectOption('EXCEL');
  451 |       }
  452 |       // Generar reporte
  453 |       const generateButton = page.locator('button:has-text("Generar"), button:has-text("Crear")').first();
  454 |       if (await generateButton.isVisible()) {
  455 |         await generateButton.click();
  456 |         
  457 |         // Verificar que se genera el reporte
  458 |         await expect(page.locator('text=/reporte.*generado/i, text=/descarga/i')).toBeVisible({ timeout: 15000 });
  459 |       }
  460 |     }
  461 |   });
> 462 |   test('Gestión de servicios comunes', async ({ page }) => {
      |       ^ Error: browserType.launch: Executable doesn't exist at C:\Users\meciz\AppData\Local\ms-playwright\firefox-1482\firefox\firefox.exe
  463 |     
  464 |     // Login como administrador
  465 |     await page.goto('/login');
  466 |     await page.fill('input[name="email"]', testUsers.admin.email);
  467 |     await page.fill('input[name="password"]', testUsers.admin.password);
  468 |     await page.locator('button[type="submit"]').click();
  469 |     await page.waitForLoadState('networkidle');
  470 |     // Navegar a servicios comunes
  471 |     await page.locator('a:has-text("Servicios"), a:has-text("Common Services")').first().click();
  472 |     await page.waitForLoadState('networkidle');
  473 |     // Configurar nuevo servicio común
  474 |     const addServiceButton = page.locator('button:has-text("Agregar"), button:has-text("Nuevo Servicio")').first();
  475 |     if (await addServiceButton.isVisible()) {
  476 |       await addServiceButton.click();
  477 |       // Llenar información del servicio
  478 |       await page.fill('input[name="serviceName"], #service-name', 'Servicio de Limpieza Extraordinaria');
  479 |       await page.fill('textarea[name="description"], #service-description', 'Servicio de limpieza profunda de áreas comunes');
  480 |       await page.fill('input[name="cost"], #service-cost', '150000');
  481 |       
  482 |       // Tipo de servicio
  483 |       const serviceTypeSelect = page.locator('select[name="serviceType"], #service-type').first();
  484 |       if (await serviceTypeSelect.isVisible()) {
  485 |         await serviceTypeSelect.selectOption('MAINTENANCE');
  486 |       }
  487 |       // Frecuencia
  488 |       const frequencySelect = page.locator('select[name="frequency"], #service-frequency').first();
  489 |       if (await frequencySelect.isVisible()) {
  490 |         await frequencySelect.selectOption('MONTHLY');
  491 |       }
  492 |       // Guardar servicio
  493 |       const saveServiceButton = page.locator('button[type="submit"], button:has-text("Guardar")').first();
  494 |       await saveServiceButton.click();
  495 |       
  496 |       await expect(page.locator('text=/servicio.*agregado/i, text=/configurado/i')).toBeVisible({ timeout: 10000 });
  497 |     }
  498 |   });
  499 | });
```