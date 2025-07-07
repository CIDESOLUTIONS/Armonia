# Test info

- Name: Sistema PQR - Flujos E2E >> Dashboard de métricas PQR
- Location: C:\Users\meciz\Documents\armonia\e2e\pqr-enhanced.spec.ts:437:7

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
  337 |   });
  338 |
  339 |   test('Flujo de reapertura: Resolución, reapertura y resolución final', async ({ page }) => {
  340 |     pqrPage = new PQRPage(page);
  341 |     
  342 |     // 1. Login como residente
  343 |     await pqrPage.login(testUsers.resident.email, testUsers.resident.password);
  344 |     
  345 |     // 2. Crear nuevo PQR
  346 |     ticketNumber = await pqrPage.createPQR(testPQRs.security);
  347 |     
  348 |     // 3. Cerrar sesión como residente
  349 |     await pqrPage.logout();
  350 |     
  351 |     // 4. Login como administrador
  352 |     await pqrPage.login(testUsers.admin.email, testUsers.admin.password);
  353 |     
  354 |     // 5. Categorizar y asignar el PQR
  355 |     await pqrPage.categorizePQR(
  356 |       ticketNumber,
  357 |       testPQRs.security.category,
  358 |       testPQRs.security.priority,
  359 |       testPQRs.security.subcategory
  360 |     );
  361 |     
  362 |     await pqrPage.assignPQR(ticketNumber, 'team', '3'); // ID del equipo de seguridad
  363 |     
  364 |     // 6. Cambiar estado a "En Progreso"
  365 |     await pqrPage.changeStatus(
  366 |       ticketNumber,
  367 |       'IN_PROGRESS',
  368 |       'Se ha enviado un técnico para revisar la cámara'
  369 |     );
  370 |     
  371 |     // 7. Resolver el PQR (primera resolución)
  372 |     await pqrPage.changeStatus(
  373 |       ticketNumber,
  374 |       'RESOLVED',
  375 |       'Se ha reiniciado la cámara y está funcionando correctamente'
  376 |     );
  377 |     
  378 |     // 8. Cerrar sesión como administrador
  379 |     await pqrPage.logout();
  380 |     
  381 |     // 9. Login como residente
  382 |     await pqrPage.login(testUsers.resident.email, testUsers.resident.password);
  383 |     
  384 |     // 10. Reabrir el PQR
  385 |     await pqrPage.reopenPQR(
  386 |       ticketNumber,
  387 |       'La cámara volvió a fallar después de unas horas'
  388 |     );
  389 |     
  390 |     // Verificar estado reabierto
  391 |     await pqrPage.verifyPQRStatus(ticketNumber, 'REOPENED');
  392 |     
  393 |     // 11. Cerrar sesión como residente
  394 |     await pqrPage.logout();
  395 |     
  396 |     // 12. Login como administrador
  397 |     await pqrPage.login(testUsers.admin.email, testUsers.admin.password);
  398 |     
  399 |     // 13. Aumentar prioridad y reasignar
  400 |     await pqrPage.categorizePQR(
  401 |       ticketNumber,
  402 |       testPQRs.security.category,
  403 |       'HIGH', // Aumentar prioridad
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
> 437 |   test('Dashboard de métricas PQR', async ({ page }) => {
      |       ^ Error: browserType.launch: Executable doesn't exist at C:\Users\meciz\AppData\Local\ms-playwright\firefox-1482\firefox\firefox.exe
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
  504 |   test('Prueba de responsividad en dispositivos móviles', async ({ page }) => {
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
```