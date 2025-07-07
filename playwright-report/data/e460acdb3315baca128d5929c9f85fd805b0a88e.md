# Test info

- Name: Onboarding - Registro de Conjunto Residencial >> Flujo completo de registro de conjunto residencial
- Location: C:\Users\meciz\Documents\armonia\e2e\onboarding.spec.ts:38:7

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
   1 | /**
   2 |  * Pruebas E2E para el flujo de Onboarding
   3 |  * 
   4 |  * Estas pruebas verifican el flujo completo de registro de un nuevo conjunto
   5 |  * residencial y la creación de su administrador principal.
   6 |  */
   7 | import { test, expect, Page } from '@playwright/test';
   8 | // Datos de prueba para conjunto residencial
   9 | const testComplex = {
   10 |   name: 'Conjunto Residencial Los Robles E2E Test',
   11 |   nit: '900123456-1',
   12 |   address: 'Calle 123 #45-67, Bogotá',
   13 |   phone: '(601) 234-5678',
   14 |   email: 'admin@losrobles-test.com',
   15 |   units: '48',
   16 |   towers: '2',
   17 |   floors: '6',
   18 |   commonAreas: 'Salón Social, Gimnasio, Piscina, Zona BBQ'
   19 | };
   20 | // Datos del administrador principal
   21 | const adminUser = {
   22 |   name: 'Carlos Administrador Test',
   23 |   email: 'carlos.admin@losrobles-test.com',
   24 |   phone: '3001234567',
   25 |   dni: '12345678',
   26 |   password: 'AdminTest123!',
   27 |   confirmPassword: 'AdminTest123!'
   28 | };
   29 | test.describe('Onboarding - Registro de Conjunto Residencial', () => {
   30 |   
   31 |   test.beforeEach(async ({ page }) => {
   32 |     // Navegar a la página principal
   33 |     await page.goto('/');
   34 |     
   35 |     // Esperar a que la página cargue completamente
   36 |     await page.waitForLoadState('networkidle');
   37 |   });
>  38 |   test('Flujo completo de registro de conjunto residencial', async ({ page }) => {
      |       ^ Error: browserType.launch: Executable doesn't exist at C:\Users\meciz\AppData\Local\ms-playwright\firefox-1482\firefox\firefox.exe
   39 |     
   40 |     // PASO 1: Navegar a página de registro
   41 |     await test.step('Navegar a página de registro', async () => {
   42 |       // Buscar y hacer clic en el botón de registro
   43 |       const registerButton = page.locator('text="Registrar Conjunto"').first();
   44 |       await expect(registerButton).toBeVisible({ timeout: 10000 });
   45 |       await registerButton.click();
   46 |       
   47 |       // Verificar que estamos en la página de registro
   48 |       await expect(page).toHaveURL(/.*register-complex/);
   49 |       await expect(page.locator('h1, h2')).toContainText(/registr/i);
   50 |     });
   51 |     // PASO 2: Completar información del conjunto residencial
   52 |     await test.step('Completar información del conjunto', async () => {
   53 |       
   54 |       // Llenar datos básicos del conjunto
   55 |       await page.fill('input[name="name"], input[placeholder*="nombre"], #complex-name', testComplex.name);
   56 |       await page.fill('input[name="nit"], input[placeholder*="nit"], #complex-nit', testComplex.nit);
   57 |       await page.fill('input[name="address"], input[placeholder*="dirección"], #complex-address', testComplex.address);
   58 |       await page.fill('input[name="phone"], input[placeholder*="teléfono"], #complex-phone', testComplex.phone);
   59 |       await page.fill('input[name="email"], input[placeholder*="email"], #complex-email', testComplex.email);
   60 |       
   61 |       // Información de estructura
   62 |       await page.fill('input[name="units"], input[placeholder*="unidades"], #units', testComplex.units);
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
```