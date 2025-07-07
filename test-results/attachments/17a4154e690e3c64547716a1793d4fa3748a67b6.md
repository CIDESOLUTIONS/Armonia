# Test info

- Name: Seguridad - Minutas Digitales y Control de Acceso >> Flujo completo: Guardia registra minuta y admin consulta
- Location: C:\Users\meciz\Documents\armonia\e2e\security.spec.ts:85:7

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
   1 | /**
   2 |  * Pruebas E2E para el módulo de Seguridad
   3 |  *
   4 |  * Estas pruebas verifican el flujo completo del sistema de minutas digitales:
   5 |  * registro por guardias, consulta por administradores y gestión de incidentes.
   6 |  */
   7 | import { test, expect, Page } from '@playwright/test';
   8 | // Datos de prueba
   9 | const testUsers = {
   10 |   admin: {
   11 |     email: 'admin.seguridad@test.com',
   12 |     password: 'SecurityAdmin123!',
   13 |     name: 'Admin Seguridad'
   14 |   },
   15 |   guard1: {
   16 |     email: 'guardia1@test.com',
   17 |     password: 'Guard123!',
   18 |     name: 'Carlos Guardia Día',
   19 |     shift: 'DAY'
   20 |   },
   21 |   guard2: {
   22 |     email: 'guardia2@test.com', 
   23 |     password: 'Guard456!',
   24 |     name: 'Ana Guardia Noche',
   25 |     shift: 'NIGHT'
   26 |   }
   27 | };
   28 | const testIncidents = [
   29 |   {
   30 |     type: 'ROUTINE_CHECK',
   31 |     title: 'Ronda de Seguridad - Turno Día',
   32 |     description: 'Ronda rutinaria completada. Todas las áreas revisadas sin novedad. Puertas y ventanas seguras.',
   33 |     location: 'Todo el conjunto',
   34 |     severity: 'LOW',
   35 |     status: 'RESOLVED',
   36 |     time: '08:30'
   37 |   },
   38 |   {
   39 |     type: 'INCIDENT',
   40 |     title: 'Vehículo Sospechoso en Parqueadero',
   41 |     description: 'Se observó vehículo con placas ABC-123 estacionado en zona de visitantes por más de 4 horas sin autorización.',
   42 |     location: 'Parqueadero visitantes',
   43 |     severity: 'MEDIUM',
   44 |     status: 'PENDING',
   45 |     time: '14:15',
   46 |     actions: 'Se tomó foto de placas y se reportó a administración'
   47 |   },
   48 |   {
   49 |     type: 'EMERGENCY',
   50 |     title: 'Fuga de Gas en Torre B',
   51 |     description: 'Residente del apartamento 502 reportó fuerte olor a gas. Se evacuó el piso y se contactó empresa de gas.',
   52 |     location: 'Torre B - Piso 5',
   53 |     severity: 'HIGH',
   54 |     status: 'IN_PROGRESS',
   55 |     time: '20:45',
   56 |     actions: 'Evacuación inmediata, contacto con bomberos y empresa de gas'
   57 |   }
   58 | ];
   59 | const testVisitors = [
   60 |   {
   61 |     name: 'Juan Pérez Visitante',
   62 |     dni: '12345678',
   63 |     phone: '3001234567',
   64 |     visitingUnit: 'Apto 301',
   65 |     purpose: 'Visita familiar',
   66 |     entryTime: '16:30',
   67 |     vehiclePlate: 'XYZ-789'
   68 |   },
   69 |   {
   70 |     name: 'María Técnico',
   71 |     dni: '87654321',
   72 |     phone: '3009876543',
   73 |     visitingUnit: 'Administración',
   74 |     purpose: 'Mantenimiento elevadores',
   75 |     entryTime: '09:00',
   76 |     company: 'Elevadores Express SAS'
   77 |   }
   78 | ];
   79 | test.describe('Seguridad - Minutas Digitales y Control de Acceso', () => {
   80 |   test.beforeEach(async ({ page }) => {
   81 |     test.setTimeout(60000);
   82 |     await page.goto('/');
   83 |     await page.waitForLoadState('networkidle');
   84 |   });
>  85 |   test('Flujo completo: Guardia registra minuta y admin consulta', async ({ page }) => {
      |       ^ Error: browserType.launch: Executable doesn't exist at C:\Users\meciz\AppData\Local\ms-playwright\chromium_headless_shell-1169\chrome-win\headless_shell.exe
   86 |     // PASO 1: Login como guardia de día
   87 |     await test.step('Login como guardia de día', async () => {
   88 |       await page.goto('/login');
   89 |       
   90 |       await page.fill('input[name="email"], input[type="email"]', testUsers.guard1.email);
   91 |       await page.fill('input[name="password"], input[type="password"]', testUsers.guard1.password);
   92 |       
   93 |       const loginButton = page.locator('button[type="submit"], button:has-text("Iniciar")').first();
   94 |       await loginButton.click();
   95 |       
   96 |       await page.waitForLoadState('networkidle');
   97 |       await expect(page).toHaveURL(/.*dashboard|guard|security/);
   98 |     });
   99 |     // PASO 2: Registrar incidente rutinario
  100 |     await test.step('Registrar ronda de seguridad rutinaria', async () => {
  101 |       // Navegar al módulo de seguridad/minutas
  102 |       const securityLink = page.locator('a:has-text("Seguridad"), a:has-text("Minutas"), [href*="security"]').first();
  103 |       await expect(securityLink).toBeVisible({ timeout: 10000 });
  104 |       await securityLink.click();
  105 |       
  106 |       await page.waitForLoadState('networkidle');
  107 |       // Crear nueva minuta/incidente
  108 |       const newIncidentButton = page.locator('button:has-text("Nuevo"), button:has-text("Registrar"), button:has-text("Crear")').first();
  109 |       await expect(newIncidentButton).toBeVisible();
  110 |       await newIncidentButton.click();
  111 |       // Llenar formulario de incidente rutinario
  112 |       const routineIncident = testIncidents[0];
  113 |       
  114 |       const typeSelect = page.locator('select[name="type"], #incident-type').first();
  115 |       if (await typeSelect.isVisible()) {
  116 |         await typeSelect.selectOption(routineIncident.type);
  117 |       }
  118 |       await page.fill('input[name="title"], #incident-title', routineIncident.title);
  119 |       await page.fill('textarea[name="description"], #incident-description', routineIncident.description);
  120 |       await page.fill('input[name="location"], #incident-location', routineIncident.location);
  121 |       await page.fill('input[name="time"], input[type="time"], #incident-time', routineIncident.time);
  122 |       const severitySelect = page.locator('select[name="severity"], #incident-severity').first();
  123 |       if (await severitySelect.isVisible()) {
  124 |         await severitySelect.selectOption(routineIncident.severity);
  125 |       }
  126 |       // Guardar incidente
  127 |       const saveButton = page.locator('button[type="submit"], button:has-text("Guardar"), button:has-text("Registrar")').first();
  128 |       await saveButton.click();
  129 |       await expect(page.locator('text=/registrado/i, text=/guardado/i, text=/éxito/i')).toBeVisible({ timeout: 15000 });
  130 |     });
  131 |     // PASO 3: Registrar visitante
  132 |     await test.step('Registrar entrada de visitante', async () => {
  133 |       // Navegar a control de visitantes
  134 |       const visitorsLink = page.locator('a:has-text("Visitantes"), a:has-text("Control"), [href*="visitor"]').first();
  135 |       if (await visitorsLink.isVisible()) {
  136 |         await visitorsLink.click();
  137 |       } else {
  138 |         // Buscar en el módulo de seguridad
  139 |         await page.locator('button:has-text("Visitantes"), .visitor-control').first().click();
  140 |       }
  141 |       await page.waitForLoadState('networkidle');
  142 |       // Registrar nuevo visitante
  143 |       const registerVisitorButton = page.locator('button:has-text("Registrar"), button:has-text("Nuevo")').first();
  144 |       await registerVisitorButton.click();
  145 |       // Llenar datos del visitante
  146 |       const visitor = testVisitors[0];
  147 |       
  148 |       await page.fill('input[name="visitorName"], #visitor-name', visitor.name);
  149 |       await page.fill('input[name="visitorDni"], #visitor-dni', visitor.dni);
  150 |       await page.fill('input[name="visitorPhone"], #visitor-phone', visitor.phone);
  151 |       await page.fill('input[name="visitingUnit"], #visiting-unit', visitor.visitingUnit);
  152 |       await page.fill('input[name="purpose"], #visit-purpose', visitor.purpose);
  153 |       await page.fill('input[name="vehiclePlate"], #vehicle-plate', visitor.vehiclePlate);
  154 |       // Registrar entrada
  155 |       const registerEntryButton = page.locator('button[type="submit"], button:has-text("Registrar Entrada")').first();
  156 |       await registerEntryButton.click();
  157 |       await expect(page.locator('text=/visitante.*registrado/i, text=/entrada.*autorizada/i')).toBeVisible();
  158 |     });
  159 |     // PASO 4: Registrar incidente de severidad media
  160 |     await test.step('Registrar incidente con vehículo sospechoso', async () => {
  161 |       // Volver a minutas/incidentes
  162 |       await page.locator('a:has-text("Minutas"), a:has-text("Incidentes")').first().click();
  163 |       
  164 |       const newIncidentButton = page.locator('button:has-text("Nuevo"), button:has-text("Registrar")').first();
  165 |       await newIncidentButton.click();
  166 |       // Llenar incidente de severidad media
  167 |       const mediumIncident = testIncidents[1];
  168 |       
  169 |       const typeSelect = page.locator('select[name="type"]').first();
  170 |       if (await typeSelect.isVisible()) {
  171 |         await typeSelect.selectOption(mediumIncident.type);
  172 |       }
  173 |       await page.fill('input[name="title"]', mediumIncident.title);
  174 |       await page.fill('textarea[name="description"]', mediumIncident.description);
  175 |       await page.fill('input[name="location"]', mediumIncident.location);
  176 |       await page.fill('input[name="time"]', mediumIncident.time);
  177 |       
  178 |       const severitySelect = page.locator('select[name="severity"]').first();
  179 |       if (await severitySelect.isVisible()) {
  180 |         await severitySelect.selectOption(mediumIncident.severity);
  181 |       }
  182 |       // Agregar acciones tomadas
  183 |       const actionsField = page.locator('textarea[name="actions"], #incident-actions').first();
  184 |       if (await actionsField.isVisible()) {
  185 |         await actionsField.fill(mediumIncident.actions);
```