# Test info

- Name: Sistema PQR - Flujos E2E >> Prueba de responsividad en dispositivos móviles
- Location: C:\Users\meciz\Documents\armonia\e2e\pqr-enhanced.spec.ts:504:7

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
  404 |       testPQRs.security.subcategory
  405 |     );
  406 |     
  407 |     await pqrPage.assignPQR(ticketNumber, 'user', '12'); // ID del especialista
  408 |     
  409 |     // 14. Cambiar estado a "En Progreso"
  410 |     await pqrPage.changeStatus(
  411 |       ticketNumber,
  412 |       'IN_PROGRESS',
  413 |       'Se ha enviado un especialista para revisar el problema a fondo'
  414 |     );
  415 |     
  416 |     // 15. Resolver el PQR (resolución final)
  417 |     await pqrPage.changeStatus(
  418 |       ticketNumber,
  419 |       'RESOLVED',
  420 |       'Se ha reemplazado la cámara defectuosa por una nueva y se ha verificado su funcionamiento'
  421 |     );
  422 |     
  423 |     // 16. Cerrar sesión como administrador
  424 |     await pqrPage.logout();
  425 |     
  426 |     // 17. Login como residente
  427 |     await pqrPage.login(testUsers.resident.email, testUsers.resident.password);
  428 |     
  429 |     // 18. Calificar y cerrar
  430 |     await pqrPage.ratePQR(ticketNumber, 5, 'Excelente solución definitiva');
  431 |     await pqrPage.closePQR(ticketNumber);
  432 |     
  433 |     // Verificar estado cerrado
  434 |     await pqrPage.verifyPQRStatus(ticketNumber, 'CLOSED');
  435 |   });
  436 |
  437 |   test('Dashboard de métricas PQR', async ({ page }) => {
  438 |     pqrPage = new PQRPage(page);
  439 |     
  440 |     // 1. Login como administrador
  441 |     await pqrPage.login(testUsers.admin.email, testUsers.admin.password);
  442 |     
  443 |     // 2. Verificar dashboard de métricas
  444 |     await pqrPage.verifyMetricsDashboard();
  445 |     
  446 |     // 3. Aplicar filtros
  447 |     await page.click('button:has-text("Filtros")');
  448 |     
  449 |     // Filtrar por fecha (último mes)
  450 |     await page.click('text=Último mes');
  451 |     
  452 |     // Filtrar por categoría
  453 |     await page.selectOption('select[name="category"]', 'MAINTENANCE');
  454 |     
  455 |     // Aplicar filtros
  456 |     await page.click('button:has-text("Aplicar")');
  457 |     
  458 |     // Verificar que se actualizan los datos
  459 |     await expect(page.locator('div.loading-indicator')).not.toBeVisible();
  460 |     
  461 |     // 4. Exportar reporte
  462 |     await page.click('button:has-text("Exportar")');
  463 |     await page.click('a:has-text("Exportar a Excel")');
  464 |     
  465 |     // Verificar descarga (esto puede variar según la implementación)
  466 |     // await expect(page.locator('div.alert-success')).toContainText('Reporte exportado correctamente');
  467 |   });
  468 |
  469 |   test('Flujo de notificaciones y recordatorios', async ({ page }) => {
  470 |     pqrPage = new PQRPage(page);
  471 |     
  472 |     // 1. Login como administrador
  473 |     await pqrPage.login(testUsers.admin.email, testUsers.admin.password);
  474 |     
  475 |     // 2. Ir a la sección de notificaciones
  476 |     await page.click('a:has-text("Notificaciones")');
  477 |     
  478 |     // Verificar que hay notificaciones
  479 |     await expect(page.locator('div.notification-list')).toBeVisible();
  480 |     
  481 |     // 3. Verificar recordatorios de vencimiento
  482 |     await page.click('a:has-text("Recordatorios")');
  483 |     
  484 |     // Verificar que hay recordatorios
  485 |     await expect(page.locator('div.reminder-list')).toBeVisible();
  486 |     
  487 |     // 4. Configurar notificaciones automáticas
  488 |     await page.click('a:has-text("Configuración")');
  489 |     await page.click('button:has-text("Notificaciones")');
  490 |     
  491 |     // Activar todas las notificaciones
  492 |     await page.check('input[name="autoNotifyEnabled"]');
  493 |     await page.check('input[name="emailNotificationsEnabled"]');
  494 |     await page.check('input[name="pushNotificationsEnabled"]');
  495 |     await page.check('input[name="smsNotificationsEnabled"]');
  496 |     
  497 |     // Guardar configuración
  498 |     await page.click('button:has-text("Guardar")');
  499 |     
  500 |     // Verificar confirmación
  501 |     await expect(page.locator('div.alert-success')).toBeVisible();
  502 |   });
  503 |
> 504 |   test('Prueba de responsividad en dispositivos móviles', async ({ page }) => {
      |       ^ Error: browserType.launch: Executable doesn't exist at C:\Users\meciz\AppData\Local\ms-playwright\webkit-2158\Playwright.exe
  505 |     // Esta prueba se ejecutará en los proyectos móviles definidos en la configuración
  506 |     pqrPage = new PQRPage(page);
  507 |     
  508 |     // 1. Login como residente
  509 |     await pqrPage.login(testUsers.resident.email, testUsers.resident.password);
  510 |     
  511 |     // 2. Verificar que el menú móvil está presente
  512 |     await expect(page.locator('button.mobile-menu-button')).toBeVisible();
  513 |     
  514 |     // 3. Abrir menú móvil
  515 |     await page.click('button.mobile-menu-button');
  516 |     
  517 |     // 4. Navegar a PQR
  518 |     await page.click('a:has-text("PQR")');
  519 |     
  520 |     // 5. Verificar que la lista de PQR se muestra correctamente
  521 |     await expect(page.locator('div.pqr-list')).toBeVisible();
  522 |     
  523 |     // 6. Crear nuevo PQR desde móvil
  524 |     await page.click('button:has-text("Nueva Solicitud")');
  525 |     
  526 |     // Verificar que el formulario se adapta correctamente
  527 |     await expect(page.locator('form.pqr-form')).toBeVisible();
  528 |     
  529 |     // 7. Llenar formulario
  530 |     await page.selectOption('select[name="type"]', testPQRs.maintenance.type);
  531 |     await page.fill('input[name="title"]', testPQRs.maintenance.title);
  532 |     await page.fill('textarea[name="description"]', testPQRs.maintenance.description);
  533 |     
  534 |     // 8. Enviar formulario
  535 |     await page.click('button[type="submit"]');
  536 |     
  537 |     // Verificar confirmación
  538 |     await expect(page.locator('div.alert-success')).toBeVisible();
  539 |   });
  540 | });
  541 |
```