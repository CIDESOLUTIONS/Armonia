# Test info

- Name: Navegación Completa - Landing a Dashboard >> Flujo completo: Landing → Portal Residente → Dashboard residente
- Location: C:\Users\meciz\Documents\armonia\e2e\complete-navigation.spec.ts:232:7

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
  132 |     // PASO 5: Verificar estructura del dashboard
  133 |     await test.step('Verificar estructura del dashboard de administrador', async () => {
  134 |       // Verificar header principal
  135 |       await expect(page.locator('header, .header, nav')).toBeVisible();
  136 |       
  137 |       // Verificar menú lateral
  138 |       const sidebar = page.locator('.sidebar, #sidebar, nav[role="navigation"]').first();
  139 |       await expect(sidebar).toBeVisible();
  140 |       
  141 |       // Verificar que el menú es colapsable
  142 |       const toggleButton = page.locator('button[aria-label*="toggle"], .menu-toggle, .sidebar-toggle').first();
  143 |       if (await toggleButton.isVisible()) {
  144 |         await toggleButton.click();
  145 |         await page.waitForTimeout(500);
  146 |         await toggleButton.click(); // Volver a expandir
  147 |       }
  148 |       
  149 |       // Verificar área de contenido principal
  150 |       await expect(page.locator('main, .main-content, .dashboard-content')).toBeVisible();
  151 |     });
  152 |     // PASO 6: Navegar por todas las opciones del menú lateral
  153 |     await test.step('Navegar por todas las opciones del menú lateral', async () => {
  154 |       for (const menuItem of menuItems.admin) {
  155 |         // Buscar el elemento del menú
  156 |         const menuLink = page.locator(`a:has-text("${menuItem.name}"), [href*="${menuItem.href}"], .menu-item:has-text("${menuItem.name}")`).first();
  157 |         
  158 |         if (await menuLink.isVisible()) {
  159 |           await menuLink.click();
  160 |           await page.waitForLoadState('networkidle');
  161 |           
  162 |           // Verificar que navegamos a la página correcta
  163 |           await expect(page).toHaveURL(new RegExp(menuItem.href.replace('/', '\\/') + '|' + menuItem.name.toLowerCase()));
  164 |           
  165 |           // Verificar contenido específico de la página
  166 |           await expect(page.locator(`h1:has-text("${menuItem.name}"), .page-title:has-text("${menuItem.name}"), h2:has-text("${menuItem.name}")`)).toBeVisible({ timeout: 10000 });
  167 |           
  168 |           // Esperar un momento entre navegaciones
  169 |           await page.waitForTimeout(1000);
  170 |         }
  171 |       }
  172 |     });
  173 |     // PASO 7: Verificar funcionalidades específicas por módulo
  174 |     await test.step('Verificar funcionalidades específicas de módulos clave', async () => {
  175 |       
  176 |       // Dashboard principal
  177 |       await page.locator('a:has-text("Dashboard")').first().click();
  178 |       await expect(page.locator('text=/estadísticas/i, .stats, .metrics')).toBeVisible();
  179 |       
  180 |       // Inventario
  181 |       await page.locator('a:has-text("Inventario")').first().click();
  182 |       await expect(page.locator('text=/residentes/i, text=/propiedades/i')).toBeVisible();
  183 |       
  184 |       // Finanzas
  185 |       await page.locator('a:has-text("Finanzas")').first().click();
  186 |       await expect(page.locator('text=/facturación/i, text=/pagos/i, text=/ingresos/i')).toBeVisible();
  187 |       
  188 |       // Asambleas
  189 |       const assemblyLink = page.locator('a:has-text("Asambleas")').first();
  190 |       if (await assemblyLink.isVisible()) {
  191 |         await assemblyLink.click();
  192 |         await expect(page.locator('text=/votación/i, text=/asamblea/i')).toBeVisible();
  193 |       }
  194 |       
  195 |       // PQR
  196 |       await page.locator('a:has-text("PQR")').first().click();
  197 |       await expect(page.locator('text=/peticiones/i, text=/quejas/i, text=/reclamos/i')).toBeVisible();
  198 |       
  199 |       // Seguridad
  200 |       const securityLink = page.locator('a:has-text("Seguridad")').first();
  201 |       if (await securityLink.isVisible()) {
  202 |         await securityLink.click();
  203 |         await expect(page.locator('text=/acceso/i, text=/control/i, text=/visitantes/i')).toBeVisible();
  204 |       }
  205 |     });
  206 |     // PASO 8: Verificar responsive y funcionalidades del menú
  207 |     await test.step('Verificar funcionalidades responsivas del menú', async () => {
  208 |       // Probar colapsar/expandir menú
  209 |       const menuToggle = page.locator('.menu-toggle, .sidebar-toggle, button[aria-label*="menu"]').first();
  210 |       if (await menuToggle.isVisible()) {
  211 |         // Colapsar
  212 |         await menuToggle.click();
  213 |         await page.waitForTimeout(500);
  214 |         
  215 |         // Verificar que el menú se colapsó
  216 |         const collapsedSidebar = page.locator('.sidebar-collapsed, .sidebar.collapsed, nav.collapsed').first();
  217 |         if (await collapsedSidebar.isVisible()) {
  218 |           // Expandir nuevamente
  219 |           await menuToggle.click();
  220 |           await page.waitForTimeout(500);
  221 |         }
  222 |       }
  223 |       
  224 |       // Verificar tooltips en menú colapsado (si existen)
  225 |       const tooltipTrigger = page.locator('.menu-item[title], .nav-item[data-tooltip]').first();
  226 |       if (await tooltipTrigger.isVisible()) {
  227 |         await tooltipTrigger.hover();
  228 |         await expect(page.locator('.tooltip, [role="tooltip"]')).toBeVisible();
  229 |       }
  230 |     });
  231 |   });
> 232 |   test('Flujo completo: Landing → Portal Residente → Dashboard residente', async ({ page }) => {
      |       ^ Error: browserType.launch: Executable doesn't exist at C:\Users\meciz\AppData\Local\ms-playwright\chromium_headless_shell-1169\chrome-win\headless_shell.exe
  233 |     // PASO 1: Navegar desde landing al portal residente
  234 |     await test.step('Navegar al portal de residente', async () => {
  235 |       const accessButton = page.locator('button:has-text("Acceder"), a:has-text("Portal")').first();
  236 |       await accessButton.click();
  237 |       await page.waitForLoadState('networkidle');
  238 |       // Seleccionar portal residente
  239 |       const residentPortal = page.locator('button:has-text("Residente"), .resident-portal, [data-portal="resident"]').first();
  240 |       await expect(residentPortal).toBeVisible();
  241 |       await residentPortal.click();
  242 |       await page.waitForLoadState('networkidle');
  243 |     });
  244 |     // PASO 2: Login como residente
  245 |     await test.step('Login como residente', async () => {
  246 |       await page.fill('input[name="email"]', testUsers.resident.email);
  247 |       await page.fill('input[name="password"]', testUsers.resident.password);
  248 |       
  249 |       const loginButton = page.locator('button[type="submit"]').first();
  250 |       await loginButton.click();
  251 |       await page.waitForLoadState('networkidle');
  252 |       
  253 |       await expect(page).toHaveURL(/.*dashboard|resident/);
  254 |       await expect(page.locator(`text="${testUsers.resident.name}", text=/residente/i`)).toBeVisible();
  255 |     });
  256 |     // PASO 3: Navegar por el menú de residente
  257 |     await test.step('Navegar por opciones del menú de residente', async () => {
  258 |       for (const menuItem of menuItems.resident) {
  259 |         const menuLink = page.locator(`a:has-text("${menuItem.name}")`).first();
  260 |         
  261 |         if (await menuLink.isVisible()) {
  262 |           await menuLink.click();
  263 |           await page.waitForLoadState('networkidle');
  264 |           
  265 |           // Verificar navegación exitosa
  266 |           await expect(page.locator(`h1:has-text("${menuItem.name}"), .page-title`)).toBeVisible({ timeout: 10000 });
  267 |           await page.waitForTimeout(800);
  268 |         }
  269 |       }
  270 |     });
  271 |     // PASO 4: Verificar funcionalidades específicas de residente
  272 |     await test.step('Verificar funcionalidades específicas de residente', async () => {
  273 |       // Mi cuenta
  274 |       await page.locator('a:has-text("Mi Cuenta")').first().click();
  275 |       await expect(page.locator('text=/información personal/i, text=/datos/i')).toBeVisible();
  276 |       
  277 |       // Pagos
  278 |       await page.locator('a:has-text("Pagos")').first().click();
  279 |       await expect(page.locator('text=/estado de cuenta/i, text=/facturas/i')).toBeVisible();
  280 |       
  281 |       // Reservas
  282 |       await page.locator('a:has-text("Reservas")').first().click();
  283 |       await expect(page.locator('text=/áreas comunes/i, text=/salón/i, text=/gimnasio/i')).toBeVisible();
  284 |     });
  285 |   });
  286 |   test('Flujo completo: Landing → Portal Recepción → Dashboard recepción', async ({ page }) => {
  287 |     // PASO 1: Navegar al portal de recepción
  288 |     await test.step('Navegar al portal de recepción', async () => {
  289 |       const accessButton = page.locator('button:has-text("Acceder"), a:has-text("Portal")').first();
  290 |       await accessButton.click();
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
```