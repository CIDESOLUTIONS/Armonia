# Test info

- Name: Asambleas - Gestión y Votación >> Validación de quórum insuficiente
- Location: C:\Users\meciz\Documents\armonia\e2e\assemblies.spec.ts:317:7

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
  217 |       await adminPage.waitForLoadState('networkidle');
  218 |       
  219 |       await adminPage.goto('/assembly/live');
  220 |       
  221 |       // Abrir votación para primera propuesta
  222 |       const openVotingButton = adminPage.locator('button:has-text("Abrir Votación"), button:has-text("Iniciar Voto")').first();
  223 |       if (await openVotingButton.isVisible()) {
  224 |         await openVotingButton.click();
  225 |         await expect(adminPage.locator('text=/votación.*abierta/i, text=/pueden.*votar/i')).toBeVisible();
  226 |       }
  227 |       // Residentes votan
  228 |       const residentPages = [];
  229 |       const votes = ['A favor', 'A favor', 'En contra']; // Votos de cada residente
  230 |       for (let i = 0; i < residents.length; i++) {
  231 |         const residentPage = await browser.newPage();
  232 |         residentPages.push(residentPage);
  233 |         
  234 |         await residentPage.goto('/login');
  235 |         await residentPage.fill('input[name="email"]', residents[i].email);
  236 |         await residentPage.fill('input[name="password"]', residents[i].password);
  237 |         await residentPage.locator('button[type="submit"]').click();
  238 |         await residentPage.waitForLoadState('networkidle');
  239 |         
  240 |         await residentPage.goto('/assembly/live');
  241 |         
  242 |         // Emitir voto
  243 |         const voteOption = residentPage.locator(`button:has-text("${votes[i]}"), input[value="${votes[i]}"]`).first();
  244 |         if (await voteOption.isVisible()) {
  245 |           await voteOption.click();
  246 |           
  247 |           const confirmVoteButton = residentPage.locator('button:has-text("Confirmar Voto"), button[type="submit"]').first();
  248 |           if (await confirmVoteButton.isVisible()) {
  249 |             await confirmVoteButton.click();
  250 |           }
  251 |           
  252 |           await expect(residentPage.locator('text=/voto.*registrado/i, text=/gracias/i')).toBeVisible();
  253 |         }
  254 |       }
  255 |       // Admin cierra votación
  256 |       const closeVotingButton = adminPage.locator('button:has-text("Cerrar Votación"), button:has-text("Finalizar")').first();
  257 |       if (await closeVotingButton.isVisible()) {
  258 |         await closeVotingButton.click();
  259 |         await expect(adminPage.locator('text=/votación.*cerrada/i, text=/resultados/i')).toBeVisible();
  260 |       }
  261 |       // Cerrar páginas
  262 |       for (const page of residentPages) {
  263 |         await page.close();
  264 |       }
  265 |       await adminPage.close();
  266 |     });
  267 |     // PASO 6: Consultar resultados
  268 |     await test.step('Consultar resultados de votación', async () => {
  269 |       const adminPage = await browser.newPage();
  270 |       
  271 |       await adminPage.goto('/login');
  272 |       await adminPage.fill('input[name="email"]', testUsers.admin.email);
  273 |       await adminPage.fill('input[name="password"]', testUsers.admin.password);
  274 |       await adminPage.locator('button[type="submit"]').click();
  275 |       await adminPage.waitForLoadState('networkidle');
  276 |       
  277 |       await adminPage.goto('/assembly/live');
  278 |       
  279 |       // Verificar resultados mostrados
  280 |       await expect(adminPage.locator('text="A favor": 2, text="En contra": 1')).toBeVisible();
  281 |       await expect(adminPage.locator('text=/aprobada/i, text=/ganadora/i')).toBeVisible();
  282 |       
  283 |       // Generar acta final
  284 |       const generateActaButton = adminPage.locator('button:has-text("Generar Acta"), button:has-text("Finalizar")').first();
  285 |       if (await generateActaButton.isVisible()) {
  286 |         await generateActaButton.click();
  287 |         await expect(adminPage.locator('text=/acta.*generada/i, text=/asamblea.*finalizada/i')).toBeVisible();
  288 |       }
  289 |       await adminPage.close();
  290 |     });
  291 |     // PASO 7: Verificar acceso a resultados desde cualquier usuario
  292 |     await test.step('Verificar acceso a resultados históricos', async () => {
  293 |       const residentPage = await browser.newPage();
  294 |       
  295 |       await residentPage.goto('/login');
  296 |       await residentPage.fill('input[name="email"]', testUsers.resident1.email);
  297 |       await residentPage.fill('input[name="password"]', testUsers.resident1.password);
  298 |       await residentPage.locator('button[type="submit"]').click();
  299 |       await residentPage.waitForLoadState('networkidle');
  300 |       
  301 |       // Navegar a histórico de asambleas
  302 |       const historyLink = residentPage.locator('a:has-text("Asambleas"), a:has-text("Histórico")').first();
  303 |       if (await historyLink.isVisible()) {
  304 |         await historyLink.click();
  305 |         
  306 |         // Verificar que aparece la asamblea finalizada
  307 |         await expect(residentPage.locator(`text="${testAssembly.title}"`)).toBeVisible();
  308 |         await expect(residentPage.locator('text=/finalizada/i, text=/completada/i')).toBeVisible();
  309 |         
  310 |         // Ver detalles de resultados
  311 |         await residentPage.locator(`text="${testAssembly.title}"`).click();
  312 |         await expect(residentPage.locator('text=/resultados/i, text=/acta/i')).toBeVisible();
  313 |       }
  314 |       await residentPage.close();
  315 |     });
  316 |   });
> 317 |   test('Validación de quórum insuficiente', async ({ page }) => {
      |       ^ Error: browserType.launch: Executable doesn't exist at C:\Users\meciz\AppData\Local\ms-playwright\firefox-1482\firefox\firefox.exe
  318 |     
  319 |     // Login como admin
  320 |     await page.goto('/login');
  321 |     await page.fill('input[name="email"]', testUsers.admin.email);
  322 |     await page.fill('input[name="password"]', testUsers.admin.password);
  323 |     await page.locator('button[type="submit"]').click();
  324 |     await page.waitForLoadState('networkidle');
  325 |     // Intentar iniciar asamblea sin suficientes asistentes
  326 |     await page.goto('/assembly/live');
  327 |     
  328 |     const startVotingButton = page.locator('button:has-text("Iniciar Votación")').first();
  329 |     if (await startVotingButton.isVisible()) {
  330 |       await startVotingButton.click();
  331 |       
  332 |       // Verificar mensaje de quórum insuficiente
  333 |       await expect(page.locator('text=/quórum.*insuficiente/i, text=/no.*alcanzado/i')).toBeVisible();
  334 |     }
  335 |   });
  336 |   test('Prevención de voto múltiple', async ({ browser }) => {
  337 |     
  338 |     // Este test verifica que un residente no pueda votar múltiples veces
  339 |     const residentPage = await browser.newPage();
  340 |     
  341 |     await residentPage.goto('/login');
  342 |     await residentPage.fill('input[name="email"]', testUsers.resident1.email);
  343 |     await residentPage.fill('input[name="password"]', testUsers.resident1.password);
  344 |     await residentPage.locator('button[type="submit"]').click();
  345 |     await residentPage.waitForLoadState('networkidle');
  346 |     
  347 |     await residentPage.goto('/assembly/live');
  348 |     
  349 |     // Intentar votar por segunda vez
  350 |     const voteButton = residentPage.locator('button:has-text("A favor")').first();
  351 |     if (await voteButton.isVisible()) {
  352 |       await voteButton.click();
  353 |       
  354 |       // Verificar que no se puede votar nuevamente
  355 |       await expect(residentPage.locator('text=/ya.*votó/i, text=/voto.*registrado/i')).toBeVisible();
  356 |       await expect(voteButton).toBeDisabled();
  357 |     }
  358 |     await residentPage.close();
  359 |   });
  360 | });
```