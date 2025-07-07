# Test info

- Name: Sistema PQR - Flujos E2E >> Flujo de reapertura: Resolución, reapertura y resolución final
- Location: C:\Users\meciz\Documents\armonia\e2e\pqr-enhanced.spec.ts:339:7

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
  239 |
  240 | test.describe('Sistema PQR - Flujos E2E', () => {
  241 |   let pqrPage: PQRPage;
  242 |   let ticketNumber: string;
  243 |
  244 |   test.beforeEach(async ({ page }) => {
  245 |     pqrPage = new PQRPage(page);
  246 |   });
  247 |
  248 |   test('Flujo completo: Creación, asignación y resolución de PQR', async ({ page }) => {
  249 |     pqrPage = new PQRPage(page);
  250 |     
  251 |     // 1. Login como residente
  252 |     await pqrPage.login(testUsers.resident.email, testUsers.resident.password);
  253 |     
  254 |     // Verificar que estamos en el dashboard de residente
  255 |     await expect(page.locator('h1:has-text("Dashboard de Residente")')).toBeVisible();
  256 |     
  257 |     // 2. Crear nuevo PQR
  258 |     ticketNumber = await pqrPage.createPQR(testPQRs.maintenance);
  259 |     
  260 |     // Verificar que el PQR aparece en la lista
  261 |     await pqrPage.verifyPQRExists(ticketNumber);
  262 |     
  263 |     // 3. Cerrar sesión como residente
  264 |     await pqrPage.logout();
  265 |     
  266 |     // 4. Login como administrador
  267 |     await pqrPage.login(testUsers.admin.email, testUsers.admin.password);
  268 |     
  269 |     // Verificar que estamos en el dashboard de administrador
  270 |     await expect(page.locator('h1:has-text("Dashboard de Administración")')).toBeVisible();
  271 |     
  272 |     // 5. Buscar el PQR creado
  273 |     await pqrPage.gotoPQRList();
  274 |     await page.fill('input[placeholder="Buscar"]', ticketNumber);
  275 |     await page.click('button:has-text("Buscar")');
  276 |     
  277 |     // Verificar que se encuentra el PQR
  278 |     await expect(page.locator(`tr:has-text("${ticketNumber}")`)).toBeVisible();
  279 |     
  280 |     // 6. Categorizar el PQR
  281 |     await pqrPage.categorizePQR(
  282 |       ticketNumber,
  283 |       testPQRs.maintenance.category,
  284 |       testPQRs.maintenance.priority,
  285 |       testPQRs.maintenance.subcategory
  286 |     );
  287 |     
  288 |     // 7. Asignar a técnico
  289 |     await pqrPage.assignPQR(ticketNumber, 'user', '10'); // ID del técnico
  290 |     
  291 |     // Verificar estado asignado
  292 |     await pqrPage.verifyPQRStatus(ticketNumber, 'ASSIGNED');
  293 |     
  294 |     // 8. Cerrar sesión como administrador
  295 |     await pqrPage.logout();
  296 |     
  297 |     // 9. Login como técnico
  298 |     await pqrPage.login(testUsers.staff.email, testUsers.staff.password);
  299 |     
  300 |     // 10. Cambiar estado a "En Progreso"
  301 |     await pqrPage.changeStatus(
  302 |       ticketNumber,
  303 |       'IN_PROGRESS',
  304 |       'Se ha enviado un técnico para revisar la fuga'
  305 |     );
  306 |     
  307 |     // Verificar estado en progreso
  308 |     await pqrPage.verifyPQRStatus(ticketNumber, 'IN_PROGRESS');
  309 |     
  310 |     // 11. Resolver el PQR
  311 |     await pqrPage.changeStatus(
  312 |       ticketNumber,
  313 |       'RESOLVED',
  314 |       'Se ha reparado la fuga de agua y verificado su correcto funcionamiento'
  315 |     );
  316 |     
  317 |     // Verificar estado resuelto
  318 |     await pqrPage.verifyPQRStatus(ticketNumber, 'RESOLVED');
  319 |     
  320 |     // 12. Cerrar sesión como técnico
  321 |     await pqrPage.logout();
  322 |     
  323 |     // 13. Login nuevamente como residente para verificar
  324 |     await pqrPage.login(testUsers.resident.email, testUsers.resident.password);
  325 |     
  326 |     // Verificar estado resuelto
  327 |     await pqrPage.verifyPQRStatus(ticketNumber, 'RESOLVED');
  328 |     
  329 |     // 14. Calificar la resolución
  330 |     await pqrPage.ratePQR(ticketNumber, 5, 'Excelente servicio, rápido y efectivo');
  331 |     
  332 |     // 15. Cerrar el PQR
  333 |     await pqrPage.closePQR(ticketNumber);
  334 |     
  335 |     // Verificar estado cerrado
  336 |     await pqrPage.verifyPQRStatus(ticketNumber, 'CLOSED');
  337 |   });
  338 |
> 339 |   test('Flujo de reapertura: Resolución, reapertura y resolución final', async ({ page }) => {
      |       ^ Error: browserType.launch: Executable doesn't exist at C:\Users\meciz\AppData\Local\ms-playwright\firefox-1482\firefox\firefox.exe
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
  437 |   test('Dashboard de métricas PQR', async ({ page }) => {
  438 |     pqrPage = new PQRPage(page);
  439 |     
```