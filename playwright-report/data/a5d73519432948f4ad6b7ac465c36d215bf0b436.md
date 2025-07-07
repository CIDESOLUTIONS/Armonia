# Test info

- Name: Reservas - Áreas Comunes >> Flujo completo: Consultar disponibilidad, reservar y pagar área común
- Location: C:\Users\meciz\Documents\armonia\e2e\reservations.spec.ts:81:7

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
   2 |  * Pruebas E2E para el módulo de Reservas
   3 |  * 
   4 |  * Estas pruebas verifican el flujo completo de reservas de áreas comunes:
   5 |  * consulta de disponibilidad, creación de reserva y procesamiento de pago.
   6 |  */
   7 | import { test, expect, Page } from '@playwright/test';
   8 | // Datos de prueba
   9 | const testUsers = {
   10 |   admin: {
   11 |     email: 'admin.reservas@test.com',
   12 |     password: 'ReservAdmin123!',
   13 |     name: 'Admin Reservas'
   14 |   },
   15 |   resident1: {
   16 |     email: 'residente.reservas@test.com',
   17 |     password: 'Resident123!',
   18 |     name: 'María Resident Test',
   19 |     unitNumber: 'Apto 504',
   20 |     phone: '3001234567'
   21 |   },
   22 |   resident2: {
   23 |     email: 'residente2.reservas@test.com',
   24 |     password: 'Resident456!',
   25 |     name: 'Carlos Resident Test',
   26 |     unitNumber: 'Apto 602'
   27 |   }
   28 | };
   29 | const testCommonAreas = [
   30 |   {
   31 |     name: 'Salón Social',
   32 |     capacity: '50 personas',
   33 |     hourlyRate: '80000',
   34 |     minimumHours: '4',
   35 |     description: 'Salón social con cocina, mesas, sillas y sonido',
   36 |     amenities: ['Cocina equipada', 'Sistema de sonido', 'Aire acondicionado', 'Baño privado']
   37 |   },
   38 |   {
   39 |     name: 'Zona BBQ',
   40 |     capacity: '30 personas',
   41 |     hourlyRate: '50000',
   42 |     minimumHours: '3',
   43 |     description: 'Zona de parrillas con mesas y asadores',
   44 |     amenities: ['3 Parrillas', 'Mesas y sillas', 'Lavaplatos', 'Zona cubierta']
   45 |   },
   46 |   {
   47 |     name: 'Gimnasio',
   48 |     capacity: '15 personas',
   49 |     hourlyRate: '25000',
   50 |     minimumHours: '2',
   51 |     description: 'Gimnasio con equipos de cardio y pesas',
   52 |     amenities: ['Equipos de cardio', 'Pesas libres', 'Espejo', 'Aire acondicionado']
   53 |   }
   54 | ];
   55 | const testReservation = {
   56 |   area: 'Salón Social',
   57 |   date: '2025-03-20', // Fecha futura
   58 |   startTime: '14:00',
   59 |   endTime: '18:00',
   60 |   duration: 4, // horas
   61 |   purpose: 'Cumpleaños familiar',
   62 |   estimatedGuests: '25',
   63 |   additionalServices: ['Decoración básica', 'Limpieza post-evento'],
   64 |   contactPhone: '3001234567',
   65 |   specialRequests: 'Necesito acceso desde las 13:30 para decorar'
   66 | };
   67 | const testPayment = {
   68 |   method: 'CREDIT_CARD',
   69 |   cardNumber: '4111111111111111',
   70 |   expiryDate: '12/26',
   71 |   cvv: '123',
   72 |   cardName: 'MARIA RESIDENT TEST',
   73 |   installments: '1'
   74 | };
   75 | test.describe('Reservas - Áreas Comunes', () => {
   76 |   test.beforeEach(async ({ page }) => {
   77 |     test.setTimeout(90000); // Timeout extendido para transacciones de pago
   78 |     await page.goto('/');
   79 |     await page.waitForLoadState('networkidle');
   80 |   });
>  81 |   test('Flujo completo: Consultar disponibilidad, reservar y pagar área común', async ({ page }) => {
      |       ^ Error: browserType.launch: Executable doesn't exist at C:\Users\meciz\AppData\Local\ms-playwright\firefox-1482\firefox\firefox.exe
   82 |     // PASO 1: Login como residente
   83 |     await test.step('Login como residente', async () => {
   84 |       await page.goto('/login');
   85 |       
   86 |       await page.fill('input[name="email"], input[type="email"]', testUsers.resident1.email);
   87 |       await page.fill('input[name="password"], input[type="password"]', testUsers.resident1.password);
   88 |       
   89 |       const loginButton = page.locator('button[type="submit"], button:has-text("Iniciar")').first();
   90 |       await loginButton.click();
   91 |       
   92 |       await page.waitForLoadState('networkidle');
   93 |       await expect(page).toHaveURL(/.*dashboard|resident/);
   94 |     });
   95 |     // PASO 2: Navegar al módulo de reservas
   96 |     await test.step('Navegar al módulo de reservas', async () => {
   97 |       // Buscar enlace de reservas en el menú
   98 |       const reservationsLink = page.locator('a:has-text("Reservas"), a:has-text("Áreas Comunes"), [href*="reserv"]').first();
   99 |       await expect(reservationsLink).toBeVisible({ timeout: 10000 });
  100 |       await reservationsLink.click();
  101 |       
  102 |       await page.waitForLoadState('networkidle');
  103 |       await expect(page).toHaveURL(/.*reserv|common|area/);
  104 |     });
  105 |     // PASO 3: Consultar áreas comunes disponibles
  106 |     await test.step('Consultar áreas comunes disponibles', async () => {
  107 |       // Verificar que se muestran las áreas comunes
  108 |       for (const area of testCommonAreas) {
  109 |         await expect(page.locator(`text="${area.name}"`)).toBeVisible();
  110 |         await expect(page.locator(`text="${area.capacity}"`)).toBeVisible();
  111 |       }
  112 |       // Ver detalles del Salón Social
  113 |       const salonSocialCard = page.locator(`text="${testReservation.area}"`).first();
  114 |       await salonSocialCard.click();
  115 |       // Verificar detalles del área
  116 |       await expect(page.locator(`text="${testCommonAreas[0].description}"`)).toBeVisible();
  117 |       await expect(page.locator(`text="${testCommonAreas[0].hourlyRate}"`)).toBeVisible();
  118 |     });
  119 |     // PASO 4: Consultar disponibilidad para fecha específica
  120 |     await test.step('Consultar disponibilidad para fecha específica', async () => {
  121 |       // Seleccionar fecha
  122 |       const dateInput = page.locator('input[name="date"], input[type="date"], #reservation-date').first();
  123 |       await dateInput.fill(testReservation.date);
  124 |       // Buscar disponibilidad
  125 |       const checkAvailabilityButton = page.locator('button:has-text("Consultar"), button:has-text("Ver Disponibilidad")').first();
  126 |       if (await checkAvailabilityButton.isVisible()) {
  127 |         await checkAvailabilityButton.click();
  128 |         await page.waitForLoadState('networkidle');
  129 |       }
  130 |       // Verificar que se muestra el calendario/horarios disponibles
  131 |       await expect(page.locator('text=/disponible/i, .available, .time-slot')).toBeVisible();
  132 |     });
  133 |     // PASO 5: Crear nueva reserva
  134 |     await test.step('Crear nueva reserva', async () => {
  135 |       // Hacer clic en el botón de reservar
  136 |       const reserveButton = page.locator('button:has-text("Reservar"), button:has-text("Crear Reserva")').first();
  137 |       await expect(reserveButton).toBeVisible();
  138 |       await reserveButton.click();
  139 |       // Esperar que aparezca el formulario de reserva
  140 |       await expect(page.locator('form, .reservation-form, .modal')).toBeVisible();
  141 |       // Llenar detalles de la reserva
  142 |       await page.fill('input[name="startTime"], input[type="time"], #start-time', testReservation.startTime);
  143 |       await page.fill('input[name="endTime"], input[type="time"], #end-time', testReservation.endTime);
  144 |       await page.fill('input[name="purpose"], #reservation-purpose', testReservation.purpose);
  145 |       await page.fill('input[name="guests"], #estimated-guests', testReservation.estimatedGuests);
  146 |       await page.fill('input[name="phone"], #contact-phone', testReservation.contactPhone);
  147 |       // Servicios adicionales (si existen checkboxes)
  148 |       for (const service of testReservation.additionalServices) {
  149 |         const serviceCheckbox = page.locator(`input[type="checkbox"][value*="${service}"], label:has-text("${service}")~input`).first();
  150 |         if (await serviceCheckbox.isVisible()) {
  151 |           await serviceCheckbox.check();
  152 |         }
  153 |       }
  154 |       // Solicitudes especiales
  155 |       const specialRequestsField = page.locator('textarea[name="specialRequests"], #special-requests').first();
  156 |       if (await specialRequestsField.isVisible()) {
  157 |         await specialRequestsField.fill(testReservation.specialRequests);
  158 |       }
  159 |       // Verificar cálculo automático del costo
  160 |       const totalCost = testCommonAreas[0].hourlyRate * testReservation.duration;
  161 |       await expect(page.locator(`text="${totalCost}", text="$${totalCost}"`)).toBeVisible();
  162 |     });
  163 |     // PASO 6: Confirmar y proceder al pago
  164 |     await test.step('Confirmar reserva y proceder al pago', async () => {
  165 |       // Aceptar términos y condiciones
  166 |       const termsCheckbox = page.locator('input[type="checkbox"][name*="terms"], #accept-terms').first();
  167 |       if (await termsCheckbox.isVisible()) {
  168 |         await termsCheckbox.check();
  169 |       }
  170 |       // Confirmar reserva
  171 |       const confirmButton = page.locator('button[type="submit"], button:has-text("Confirmar"), button:has-text("Continuar")').first();
  172 |       await confirmButton.click();
  173 |       // Esperar redirección a página de pago
  174 |       await page.waitForLoadState('networkidle');
  175 |       await expect(page.locator('text=/pago/i, text=/payment/i, .payment-form')).toBeVisible({ timeout: 15000 });
  176 |     });
  177 |     // PASO 7: Procesar pago de la reserva
  178 |     await test.step('Procesar pago de la reserva', async () => {
  179 |       // Verificar resumen de la reserva en página de pago
  180 |       await expect(page.locator(`text="${testReservation.area}"`)).toBeVisible();
  181 |       await expect(page.locator(`text="${testReservation.date}"`)).toBeVisible();
```