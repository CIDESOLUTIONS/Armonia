# Test info

- Name: Asambleas - Gestión y Votación >> Flujo completo: Crear asamblea, votar y consultar resultados
- Location: C:\Users\meciz\Documents\armonia\e2e\assemblies.spec.ts:69:7

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
   2 |  * Pruebas E2E para el módulo de Asambleas
   3 |  * 
   4 |  * Estas pruebas verifican el flujo completo de gestión de asambleas:
   5 |  * creación, configuración, votación en tiempo real y consulta de resultados.
   6 |  */
   7 | import { test, expect, Page, Browser } from '@playwright/test';
   8 | // Datos de prueba
   9 | const testUsers = {
   10 |   admin: {
   11 |     email: 'admin.asambleas@test.com',
   12 |     password: 'AssemblyAdmin123!',
   13 |     name: 'Admin Asambleas'
   14 |   },
   15 |   resident1: {
   16 |     email: 'residente1.asamblea@test.com',
   17 |     password: 'Resident1123!',
   18 |     name: 'María Resident Test',
   19 |     unitNumber: 'Apto 201'
   20 |   },
   21 |   resident2: {
   22 |     email: 'residente2.asamblea@test.com', 
   23 |     password: 'Resident2123!',
   24 |     name: 'Carlos Resident Test',
   25 |     unitNumber: 'Apto 301'
   26 |   },
   27 |   resident3: {
   28 |     email: 'residente3.asamblea@test.com',
   29 |     password: 'Resident3123!', 
   30 |     name: 'Ana Resident Test',
   31 |     unitNumber: 'Apto 401'
   32 |   }
   33 | };
   34 | const testAssembly = {
   35 |   title: 'Asamblea Ordinaria - Marzo 2025',
   36 |   description: 'Asamblea ordinaria para aprobación de presupuesto y elección de consejo de administración',
   37 |   date: '2025-03-15',
   38 |   time: '14:00',
   39 |   location: 'Salón Social - Conjunto Los Robles',
   40 |   quorum: '50', // 50% mínimo
   41 |   type: 'ORDINARY'
   42 | };
   43 | const testProposals = [
   44 |   {
   45 |     title: 'Aprobación Presupuesto 2025',
   46 |     description: 'Aprobar el presupuesto anual para el año 2025 con un incremento del 8%',
   47 |     type: 'BUDGET_APPROVAL',
   48 |     options: ['A favor', 'En contra', 'Abstención']
   49 |   },
   50 |   {
   51 |     title: 'Renovación Piscina',
   52 |     description: 'Autorizar la inversión de $50,000,000 para renovación completa de la piscina',
   53 |     type: 'INVESTMENT',
   54 |     options: ['Aprobar', 'Rechazar', 'Posponer']
   55 |   },
   56 |   {
   57 |     title: 'Elección Consejo Administración',
   58 |     description: 'Elegir 3 miembros del consejo de administración para período 2025-2027',
   59 |     type: 'ELECTION',
   60 |     options: ['Candidato A - María García', 'Candidato B - Juan López', 'Candidato C - Ana Martínez']
   61 |   }
   62 | ];
   63 | test.describe('Asambleas - Gestión y Votación', () => {
   64 |   test.beforeEach(async ({ page }) => {
   65 |     test.setTimeout(90000); // Timeout extendido para procesos de votación
   66 |     await page.goto('/');
   67 |     await page.waitForLoadState('networkidle');
   68 |   });
>  69 |   test('Flujo completo: Crear asamblea, votar y consultar resultados', async ({ browser }) => {
      |       ^ Error: browserType.launch: Executable doesn't exist at C:\Users\meciz\AppData\Local\ms-playwright\firefox-1482\firefox\firefox.exe
   70 |     // PASO 1: Admin crea la asamblea
   71 |     await test.step('Admin crea nueva asamblea', async () => {
   72 |       const adminPage = await browser.newPage();
   73 |       
   74 |       // Login como administrador
   75 |       await adminPage.goto('/login');
   76 |       await adminPage.fill('input[name="email"]', testUsers.admin.email);
   77 |       await adminPage.fill('input[name="password"]', testUsers.admin.password);
   78 |       await adminPage.locator('button[type="submit"]').click();
   79 |       await adminPage.waitForLoadState('networkidle');
   80 |       // Navegar al módulo de asambleas
   81 |       const assemblyLink = adminPage.locator('a:has-text("Asambleas"), a:has-text("Assemblies"), [href*="assembl"]').first();
   82 |       await expect(assemblyLink).toBeVisible({ timeout: 10000 });
   83 |       await assemblyLink.click();
   84 |       await adminPage.waitForLoadState('networkidle');
   85 |       // Crear nueva asamblea
   86 |       const createButton = adminPage.locator('button:has-text("Crear"), button:has-text("Nueva"), button:has-text("Programar")').first();
   87 |       await expect(createButton).toBeVisible();
   88 |       await createButton.click();
   89 |       // Llenar formulario de asamblea
   90 |       await adminPage.fill('input[name="title"], #assembly-title', testAssembly.title);
   91 |       await adminPage.fill('textarea[name="description"], #assembly-description', testAssembly.description);
   92 |       await adminPage.fill('input[name="date"], input[type="date"], #assembly-date', testAssembly.date);
   93 |       await adminPage.fill('input[name="time"], input[type="time"], #assembly-time', testAssembly.time);
   94 |       await adminPage.fill('input[name="location"], #assembly-location', testAssembly.location);
   95 |       await adminPage.fill('input[name="quorum"], #assembly-quorum', testAssembly.quorum);
   96 |       // Seleccionar tipo si existe
   97 |       const typeSelect = adminPage.locator('select[name="type"], #assembly-type').first();
   98 |       if (await typeSelect.isVisible()) {
   99 |         await typeSelect.selectOption(testAssembly.type);
  100 |       }
  101 |       // Guardar asamblea
  102 |       const saveButton = adminPage.locator('button[type="submit"], button:has-text("Crear"), button:has-text("Guardar")').first();
  103 |       await saveButton.click();
  104 |       await expect(adminPage.locator('text=/creada/i, text=/programada/i, text=/éxito/i')).toBeVisible({ timeout: 15000 });
  105 |       await adminPage.close();
  106 |     });
  107 |     // PASO 2: Admin configura propuestas/votaciones
  108 |     await test.step('Configurar propuestas para votación', async () => {
  109 |       const adminPage = await browser.newPage();
  110 |       
  111 |       await adminPage.goto('/login');
  112 |       await adminPage.fill('input[name="email"]', testUsers.admin.email);
  113 |       await adminPage.fill('input[name="password"]', testUsers.admin.password);
  114 |       await adminPage.locator('button[type="submit"]').click();
  115 |       await adminPage.waitForLoadState('networkidle');
  116 |       // Navegar a asambleas y seleccionar la creada
  117 |       await adminPage.locator('a:has-text("Asambleas")').first().click();
  118 |       await adminPage.waitForLoadState('networkidle');
  119 |       
  120 |       // Buscar y hacer clic en la asamblea creada
  121 |       await adminPage.locator(`text="${testAssembly.title}"`).click();
  122 |       await adminPage.waitForLoadState('networkidle');
  123 |       // Agregar propuestas
  124 |       for (const proposal of testProposals) {
  125 |         const addProposalButton = adminPage.locator('button:has-text("Agregar"), button:has-text("Nueva Propuesta")').first();
  126 |         if (await addProposalButton.isVisible()) {
  127 |           await addProposalButton.click();
  128 |           await adminPage.fill('input[name="proposalTitle"], #proposal-title', proposal.title);
  129 |           await adminPage.fill('textarea[name="proposalDescription"], #proposal-description', proposal.description);
  130 |           
  131 |           // Agregar opciones de votación
  132 |           for (let i = 0; i < proposal.options.length; i++) {
  133 |             const optionInput = adminPage.locator(`input[name="option${i}"], #option-${i}`).first();
  134 |             if (await optionInput.isVisible()) {
  135 |               await optionInput.fill(proposal.options[i]);
  136 |             }
  137 |           }
  138 |           const saveProposalButton = adminPage.locator('button:has-text("Guardar Propuesta"), button[type="submit"]').first();
  139 |           await saveProposalButton.click();
  140 |           await adminPage.waitForTimeout(2000);
  141 |         }
  142 |       }
  143 |       await adminPage.close();
  144 |     });
  145 |     // PASO 3: Iniciar la asamblea
  146 |     await test.step('Iniciar asamblea en vivo', async () => {
  147 |       const adminPage = await browser.newPage();
  148 |       
  149 |       await adminPage.goto('/login');
  150 |       await adminPage.fill('input[name="email"]', testUsers.admin.email);
  151 |       await adminPage.fill('input[name="password"]', testUsers.admin.password);
  152 |       await adminPage.locator('button[type="submit"]').click();
  153 |       await adminPage.waitForLoadState('networkidle');
  154 |       await adminPage.locator('a:has-text("Asambleas")').first().click();
  155 |       await adminPage.locator(`text="${testAssembly.title}"`).click();
  156 |       // Iniciar asamblea
  157 |       const startButton = adminPage.locator('button:has-text("Iniciar"), button:has-text("Comenzar")').first();
  158 |       if (await startButton.isVisible()) {
  159 |         await startButton.click();
  160 |         await expect(adminPage.locator('text=/iniciada/i, text=/activa/i, text=/vivo/i')).toBeVisible();
  161 |       }
  162 |       await adminPage.close();
  163 |     });
  164 |     // PASO 4: Residentes se conectan y registran asistencia
  165 |     await test.step('Residentes registran asistencia', async () => {
  166 |       const residents = [testUsers.resident1, testUsers.resident2, testUsers.resident3];
  167 |       const residentPages = [];
  168 |       for (const resident of residents) {
  169 |         const residentPage = await browser.newPage();
```