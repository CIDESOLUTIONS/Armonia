# Test info

- Name: Sistema PQR - Flujos E2E >> Flujo completo: Creación, asignación y resolución de PQR
- Location: C:\Users\meciz\Documents\armonia\e2e\pqr-enhanced.spec.ts:248:7

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
  148 |
  149 |   async assignPQR(id: string, assignType: 'user' | 'team', assignId: string) {
  150 |     await this.gotoPQRDetail(id);
  151 |     await this.page.click('button:has-text("Asignar")');
  152 |     
  153 |     await this.page.selectOption('select[name="assignType"]', assignType);
  154 |     
  155 |     if (assignType === 'user') {
  156 |       await this.page.selectOption('select[name="assignUserId"]', assignId);
  157 |     } else {
  158 |       await this.page.selectOption('select[name="assignTeamId"]', assignId);
  159 |     }
  160 |     
  161 |     await this.page.click('button:has-text("Guardar")');
  162 |     
  163 |     // Esperar confirmación
  164 |     await this.page.waitForSelector('div.alert-success');
  165 |   }
  166 |
  167 |   async changeStatus(id: string, status: string, comment: string) {
  168 |     await this.gotoPQRDetail(id);
  169 |     await this.page.click('button:has-text("Cambiar Estado")');
  170 |     
  171 |     await this.page.selectOption('select[name="status"]', status);
  172 |     await this.page.fill('textarea[name="comment"]', comment);
  173 |     
  174 |     await this.page.click('button:has-text("Guardar")');
  175 |     
  176 |     // Esperar confirmación
  177 |     await this.page.waitForSelector('div.alert-success');
  178 |   }
  179 |
  180 |   async ratePQR(id: string, rating: number, comment: string) {
  181 |     await this.gotoPQRDetail(id);
  182 |     await this.page.click('button:has-text("Calificar")');
  183 |     
  184 |     await this.page.click(`div.rating span:nth-child(${rating})`);
  185 |     await this.page.fill('textarea[name="comment"]', comment);
  186 |     
  187 |     await this.page.click('button:has-text("Enviar")');
  188 |     
  189 |     // Esperar confirmación
  190 |     await this.page.waitForSelector('div.alert-success');
  191 |   }
  192 |
  193 |   async reopenPQR(id: string, reason: string) {
  194 |     await this.gotoPQRDetail(id);
  195 |     await this.page.click('button:has-text("Reabrir")');
  196 |     
  197 |     await this.page.fill('textarea[name="reopenReason"]', reason);
  198 |     await this.page.click('button:has-text("Confirmar")');
  199 |     
  200 |     // Esperar confirmación
  201 |     await this.page.waitForSelector('div.alert-success');
  202 |   }
  203 |
  204 |   async closePQR(id: string) {
  205 |     await this.gotoPQRDetail(id);
  206 |     await this.page.click('button:has-text("Cerrar Solicitud")');
  207 |     await this.page.click('button:has-text("Confirmar")');
  208 |     
  209 |     // Esperar confirmación
  210 |     await this.page.waitForSelector('div.alert-success');
  211 |   }
  212 |
  213 |   // Verificaciones
  214 |   async verifyPQRExists(ticketNumber: string) {
  215 |     await this.gotoPQRList();
  216 |     await this.page.fill('input[placeholder="Buscar"]', ticketNumber);
  217 |     await this.page.click('button:has-text("Buscar")');
  218 |     
  219 |     await expect(this.page.locator(`tr:has-text("${ticketNumber}")`)).toBeVisible();
  220 |   }
  221 |
  222 |   async verifyPQRStatus(ticketNumber: string, status: string) {
  223 |     await this.gotoPQRList();
  224 |     await this.page.fill('input[placeholder="Buscar"]', ticketNumber);
  225 |     await this.page.click('button:has-text("Buscar")');
  226 |     
  227 |     await expect(this.page.locator(`tr:has-text("${ticketNumber}")`)).toContainText(status);
  228 |   }
  229 |
  230 |   async verifyMetricsDashboard() {
  231 |     await this.gotoMetricsDashboard();
  232 |     
  233 |     // Verificar componentes del dashboard
  234 |     await expect(this.page.locator('div.card:has-text("Resumen")')).toBeVisible();
  235 |     await expect(this.page.locator('div.chart-container')).toHaveCount(4);
  236 |     await expect(this.page.locator('table:has-text("Cumplimiento de SLA")')).toBeVisible();
  237 |   }
  238 | }
  239 |
  240 | test.describe('Sistema PQR - Flujos E2E', () => {
  241 |   let pqrPage: PQRPage;
  242 |   let ticketNumber: string;
  243 |
  244 |   test.beforeEach(async ({ page }) => {
  245 |     pqrPage = new PQRPage(page);
  246 |   });
  247 |
> 248 |   test('Flujo completo: Creación, asignación y resolución de PQR', async ({ page }) => {
      |       ^ Error: browserType.launch: Executable doesn't exist at C:\Users\meciz\AppData\Local\ms-playwright\webkit-2158\Playwright.exe
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
```