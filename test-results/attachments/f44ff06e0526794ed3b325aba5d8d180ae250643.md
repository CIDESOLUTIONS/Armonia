# Test info

- Name: Inventario - Gestión Completa del Conjunto >> Flujo completo: Actualizar información del conjunto y gestionar inventario
- Location: C:\Users\meciz\Documents\armonia\e2e\inventory.spec.ts:139:7

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
   39 |     name: 'María García López',
   40 |     email: 'maria.garcia@email.com',
   41 |     phone: '3001234567',
   42 |     dni: '52345678',
   43 |     unitNumber: 'Apto 501',
   44 |     tower: 'Torre A',
   45 |     residentType: 'OWNER',
   46 |     emergencyContact: 'Juan García - 3009876543',
   47 |     moveInDate: '2025-02-01'
   48 |   },
   49 |   {
   50 |     name: 'Carlos Rodríguez Pérez',
   51 |     email: 'carlos.rodriguez@email.com',
   52 |     phone: '3007654321',
   53 |     dni: '41234567',
   54 |     unitNumber: 'Apto 502',
   55 |     tower: 'Torre A',
   56 |     residentType: 'TENANT',
   57 |     emergencyContact: 'Ana Rodríguez - 3001239876',
   58 |     moveInDate: '2025-01-15'
   59 |   }
   60 | ];
   61 | // Datos de propiedades
   62 | const properties = [
   63 |   {
   64 |     unitNumber: 'Apto 503',
   65 |     tower: 'Torre A',
   66 |     floor: '5',
   67 |     type: 'APARTMENT',
   68 |     area: '85',
   69 |     bedrooms: '3',
   70 |     bathrooms: '2',
   71 |     balcony: true,
   72 |     parkingSpots: '1',
   73 |     status: 'OCCUPIED'
   74 |   },
   75 |   {
   76 |     unitNumber: 'Local 101',
   77 |     tower: 'Torre B',
   78 |     floor: '1',
   79 |     type: 'COMMERCIAL',
   80 |     area: '120',
   81 |     status: 'AVAILABLE',
   82 |     monthlyFee: '850000'
   83 |   }
   84 | ];
   85 | // Datos de mascotas
   86 | const pets = [
   87 |   {
   88 |     name: 'Max',
   89 |     type: 'DOG',
   90 |     breed: 'Golden Retriever',
   91 |     age: '3',
   92 |     weight: '28',
   93 |     color: 'Dorado',
   94 |     ownerUnit: 'Apto 501',
   95 |     vaccinated: true,
   96 |     registrationDate: '2025-01-20'
   97 |   },
   98 |   {
   99 |     name: 'Luna',
  100 |     type: 'CAT',
  101 |     breed: 'Siamés',
  102 |     age: '2',
  103 |     weight: '4',
  104 |     color: 'Gris y blanco',
  105 |     ownerUnit: 'Apto 502',
  106 |     vaccinated: true,
  107 |     registrationDate: '2025-01-22'
  108 |   }
  109 | ];
  110 | // Datos de vehículos
  111 | const vehicles = [
  112 |   {
  113 |     plate: 'ABC-123',
  114 |     brand: 'Toyota',
  115 |     model: 'Corolla',
  116 |     year: '2020',
  117 |     color: 'Blanco',
  118 |     type: 'SEDAN',
  119 |     ownerUnit: 'Apto 501',
  120 |     parkingSpot: 'A-15'
  121 |   },
  122 |   {
  123 |     plate: 'XYZ-789',
  124 |     brand: 'Honda',
  125 |     model: 'CR-V',
  126 |     year: '2022',
  127 |     color: 'Negro',
  128 |     type: 'SUV',
  129 |     ownerUnit: 'Apto 502',
  130 |     parkingSpot: 'B-22'
  131 |   }
  132 | ];
  133 | test.describe('Inventario - Gestión Completa del Conjunto', () => {
  134 |   test.beforeEach(async ({ page }) => {
  135 |     test.setTimeout(90000);
  136 |     await page.goto('/');
  137 |     await page.waitForLoadState('networkidle');
  138 |   });
> 139 |   test('Flujo completo: Actualizar información del conjunto y gestionar inventario', async ({ page }) => {
      |       ^ Error: browserType.launch: Executable doesn't exist at C:\Users\meciz\AppData\Local\ms-playwright\firefox-1482\firefox\firefox.exe
  140 |     // PASO 1: Login como administrador
  141 |     await test.step('Login como administrador', async () => {
  142 |       await page.goto('/login');
  143 |       
  144 |       await page.fill('input[name="email"], input[type="email"]', testUsers.admin.email);
  145 |       await page.fill('input[name="password"], input[type="password"]', testUsers.admin.password);
  146 |       
  147 |       const loginButton = page.locator('button[type="submit"], button:has-text("Iniciar")').first();
  148 |       await loginButton.click();
  149 |       
  150 |       await page.waitForLoadState('networkidle');
  151 |       await expect(page).toHaveURL(/.*dashboard|admin/);
  152 |     });
  153 |     // PASO 2: Navegar al módulo de inventario
  154 |     await test.step('Navegar al módulo de inventario', async () => {
  155 |       const inventoryLink = page.locator('a:has-text("Inventario"), a:has-text("Gestión"), [href*="inventory"]').first();
  156 |       await expect(inventoryLink).toBeVisible({ timeout: 10000 });
  157 |       await inventoryLink.click();
  158 |       
  159 |       await page.waitForLoadState('networkidle');
  160 |       await expect(page).toHaveURL(/.*inventory|gestión/);
  161 |     });
  162 |     // PASO 3: Actualizar información del conjunto
  163 |     await test.step('Actualizar información del conjunto', async () => {
  164 |       // Buscar sección de información del conjunto
  165 |       const complexInfoTab = page.locator('tab:has-text("Conjunto"), button:has-text("Información"), a:has-text("Datos")').first();
  166 |       if (await complexInfoTab.isVisible()) {
  167 |         await complexInfoTab.click();
  168 |       }
  169 |       // Buscar botón de editar información
  170 |       const editButton = page.locator('button:has-text("Editar"), button:has-text("Modificar"), .edit-complex-info').first();
  171 |       await expect(editButton).toBeVisible({ timeout: 10000 });
  172 |       await editButton.click();
  173 |       // Actualizar datos del conjunto
  174 |       await page.fill('input[name="name"], #complex-name', complexData.name);
  175 |       await page.fill('input[name="address"], #complex-address', complexData.address);
  176 |       await page.fill('input[name="phone"], #complex-phone', complexData.phone);
  177 |       await page.fill('input[name="email"], #complex-email', complexData.email);
  178 |       await page.fill('input[name="website"], #complex-website', complexData.website);
  179 |       await page.fill('input[name="units"], #total-units', complexData.units);
  180 |       await page.fill('input[name="towers"], #total-towers', complexData.towers);
  181 |       await page.fill('input[name="parkingSpots"], #parking-spots', complexData.parkingSpots);
  182 |       // Descripción y áreas comunes
  183 |       const descriptionField = page.locator('textarea[name="description"], #complex-description').first();
  184 |       if (await descriptionField.isVisible()) {
  185 |         await descriptionField.fill(complexData.description);
  186 |       }
  187 |       const commonAreasField = page.locator('textarea[name="commonAreas"], #common-areas').first();
  188 |       if (await commonAreasField.isVisible()) {
  189 |         await commonAreasField.fill(complexData.commonAreas);
  190 |       }
  191 |       // Guardar cambios
  192 |       const saveButton = page.locator('button[type="submit"], button:has-text("Guardar")').first();
  193 |       await saveButton.click();
  194 |       
  195 |       await expect(page.locator('text=/actualizada/i, text=/guardada/i, text=/éxito/i')).toBeVisible({ timeout: 15000 });
  196 |     });
  197 |     // PASO 4: Gestionar residentes
  198 |     await test.step('Agregar nuevos residentes', async () => {
  199 |       // Navegar a sección de residentes
  200 |       const residentsTab = page.locator('tab:has-text("Residentes"), button:has-text("Residentes"), a:has-text("Residentes")').first();
  201 |       await residentsTab.click();
  202 |       await page.waitForLoadState('networkidle');
  203 |       // Agregar cada residente
  204 |       for (const resident of newResidents) {
  205 |         const addResidentButton = page.locator('button:has-text("Agregar"), button:has-text("Nuevo"), button:has-text("Crear")').first();
  206 |         await addResidentButton.click();
  207 |         // Llenar formulario de residente
  208 |         await page.fill('input[name="name"], #resident-name', resident.name);
  209 |         await page.fill('input[name="email"], #resident-email', resident.email);
  210 |         await page.fill('input[name="phone"], #resident-phone', resident.phone);
  211 |         await page.fill('input[name="dni"], #resident-dni', resident.dni);
  212 |         await page.fill('input[name="unitNumber"], #unit-number', resident.unitNumber);
  213 |         // Seleccionar tipo de residente
  214 |         const residentTypeSelect = page.locator('select[name="residentType"], #resident-type').first();
  215 |         if (await residentTypeSelect.isVisible()) {
  216 |           await residentTypeSelect.selectOption(resident.residentType);
  217 |         }
  218 |         // Información adicional
  219 |         const emergencyContactField = page.locator('input[name="emergencyContact"], #emergency-contact').first();
  220 |         if (await emergencyContactField.isVisible()) {
  221 |           await emergencyContactField.fill(resident.emergencyContact);
  222 |         }
  223 |         const moveInDateField = page.locator('input[name="moveInDate"], input[type="date"], #move-in-date').first();
  224 |         if (await moveInDateField.isVisible()) {
  225 |           await moveInDateField.fill(resident.moveInDate);
  226 |         }
  227 |         // Guardar residente
  228 |         const saveResidentButton = page.locator('button[type="submit"], button:has-text("Guardar")').first();
  229 |         await saveResidentButton.click();
  230 |         
  231 |         await expect(page.locator('text=/residente.*agregado/i, text=/registrado/i')).toBeVisible({ timeout: 10000 });
  232 |         
  233 |         // Esperar un momento entre registros
  234 |         await page.waitForTimeout(1000);
  235 |       }
  236 |     });
  237 |     // PASO 5: Gestionar propiedades
  238 |     await test.step('Agregar y configurar propiedades', async () => {
  239 |       // Navegar a propiedades
```