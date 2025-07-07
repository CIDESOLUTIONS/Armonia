# Test info

- Name: Onboarding - Registro de Conjunto Residencial >> Validación de email duplicado
- Location: C:\Users\meciz\Documents\armonia\e2e\onboarding.spec.ts:163:7

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
   63 |       await page.fill('input[name="towers"], input[placeholder*="torres"], #towers', testComplex.towers);
   64 |       await page.fill('input[name="floors"], input[placeholder*="pisos"], #floors', testComplex.floors);
   65 |       
   66 |       // Áreas comunes (si hay campo de texto)
   67 |       const commonAreasField = page.locator('textarea[name="commonAreas"], input[name="commonAreas"], #common-areas').first();
   68 |       if (await commonAreasField.isVisible()) {
   69 |         await commonAreasField.fill(testComplex.commonAreas);
   70 |       }
   71 |     });
   72 |     // PASO 3: Configurar administrador principal
   73 |     await test.step('Configurar administrador principal', async () => {
   74 |       
   75 |       // Scroll hacia abajo para ver los campos del administrador
   76 |       await page.locator('text=/administrador/i').first().scrollIntoViewIfNeeded();
   77 |       
   78 |       // Llenar datos del administrador
   79 |       await page.fill('input[name="adminName"], input[placeholder*="nombre"], #admin-name', adminUser.name);
   80 |       await page.fill('input[name="adminEmail"], input[placeholder*="email"], #admin-email', adminUser.email);
   81 |       await page.fill('input[name="adminPhone"], input[placeholder*="teléfono"], #admin-phone', adminUser.phone);
   82 |       await page.fill('input[name="adminDni"], input[placeholder*="documento"], #admin-dni', adminUser.dni);
   83 |       
   84 |       // Contraseñas
   85 |       await page.fill('input[name="password"], input[type="password"]', adminUser.password);
   86 |       await page.fill('input[name="confirmPassword"], input[placeholder*="confirmar"]', adminUser.confirmPassword);
   87 |     });
   88 |     // PASO 4: Aceptar términos y condiciones
   89 |     await test.step('Aceptar términos y condiciones', async () => {
   90 |       
   91 |       // Buscar y marcar checkbox de términos
   92 |       const termsCheckbox = page.locator('input[type="checkbox"]').first();
   93 |       if (await termsCheckbox.isVisible()) {
   94 |         await termsCheckbox.check();
   95 |       }
   96 |     });
   97 |     // PASO 5: Enviar formulario de registro
   98 |     await test.step('Enviar formulario de registro', async () => {
   99 |       
  100 |       // Buscar botón de envío
  101 |       const submitButton = page.locator('button[type="submit"], button:has-text("Registrar"), button:has-text("Crear")').first();
  102 |       await expect(submitButton).toBeVisible();
  103 |       await expect(submitButton).toBeEnabled();
  104 |       
  105 |       // Hacer clic en registrar
  106 |       await submitButton.click();
  107 |       
  108 |       // Esperar respuesta del servidor
  109 |       await page.waitForLoadState('networkidle');
  110 |     });
  111 |     // PASO 6: Verificar registro exitoso
  112 |     await test.step('Verificar registro exitoso', async () => {
  113 |       
  114 |       // Verificar redirección o mensaje de éxito
  115 |       // Puede redirigir al login o mostrar mensaje de confirmación
  116 |       await expect(page.locator('text=/éxito/i, text=/exitoso/i, text=/registrado/i, text=/creado/i')).toBeVisible({ timeout: 15000 });
  117 |       
  118 |       // O verificar redirección al login/dashboard
  119 |       await page.waitForTimeout(2000);
  120 |       const currentUrl = page.url();
  121 |       expect(currentUrl).toMatch(/login|dashboard|success|confirmation/);
  122 |     });
  123 |     // PASO 7: Verificar acceso del administrador
  124 |     await test.step('Verificar acceso del administrador', async () => {
  125 |       
  126 |       // Si no estamos en login, navegar allí
  127 |       if (!page.url().includes('login')) {
  128 |         await page.goto('/login');
  129 |       }
  130 |       
  131 |       // Realizar login con las credenciales del administrador
  132 |       await page.fill('input[name="email"], input[type="email"]', adminUser.email);
  133 |       await page.fill('input[name="password"], input[type="password"]', adminUser.password);
  134 |       
  135 |       const loginButton = page.locator('button[type="submit"], button:has-text("Iniciar"), button:has-text("Login")').first();
  136 |       await loginButton.click();
  137 |       
  138 |       // Esperar carga del dashboard
  139 |       await page.waitForLoadState('networkidle');
  140 |       
  141 |       // Verificar que estamos en el dashboard de administración
  142 |       await expect(page).toHaveURL(/.*dashboard|admin/);
  143 |       await expect(page.locator('text=/dashboard/i, text=/panel/i, text=/administración/i')).toBeVisible({ timeout: 10000 });
  144 |       
  145 |       // Verificar que aparece el nombre del conjunto o del usuario
  146 |       await expect(page.locator(`text="${testComplex.name}", text="${adminUser.name}"`)).toBeVisible();
  147 |     });
  148 |   });
  149 |   test('Validación de campos requeridos en registro', async ({ page }) => {
  150 |     
  151 |     // Navegar a registro
  152 |     await page.goto('/register-complex');
  153 |     
  154 |     // Intentar enviar formulario vacío
  155 |     const submitButton = page.locator('button[type="submit"], button:has-text("Registrar")').first();
  156 |     if (await submitButton.isVisible()) {
  157 |       await submitButton.click();
  158 |       
  159 |       // Verificar que aparecen mensajes de validación
  160 |       await expect(page.locator('text=/requerido/i, text=/obligatorio/i, .error, .invalid')).toBeVisible();
  161 |     }
  162 |   });
> 163 |   test('Validación de email duplicado', async ({ page }) => {
      |       ^ Error: browserType.launch: Executable doesn't exist at C:\Users\meciz\AppData\Local\ms-playwright\chromium_headless_shell-1169\chrome-win\headless_shell.exe
  164 |     
  165 |     // Este test verificaría el comportamiento cuando se intenta registrar
  166 |     // un conjunto con un email que ya existe
  167 |     // Implementación depende de la lógica específica de la aplicación
  168 |     
  169 |     await page.goto('/register-complex');
  170 |     
  171 |     // Llenar formulario con email existente conocido
  172 |     await page.fill('input[name="email"], #complex-email', 'admin@existing-complex.com');
  173 |     await page.fill('input[name="name"], #complex-name', 'Test Complex');
  174 |     
  175 |     // Enviar y verificar mensaje de error
  176 |     const submitButton = page.locator('button[type="submit"]').first();
  177 |     if (await submitButton.isVisible()) {
  178 |       await submitButton.click();
  179 |       await expect(page.locator('text=/email.*existe/i, text=/ya.*registrado/i')).toBeVisible({ timeout: 10000 });
  180 |     }
  181 |   });
  182 | });
```