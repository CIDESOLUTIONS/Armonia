/**
 * Pruebas E2E para el módulo de Reservas
 * 
 * Estas pruebas verifican el flujo completo de reservas de áreas comunes:
 * consulta de disponibilidad, creación de reserva y procesamiento de pago.
 */
import { test, expect, Page } from '@playwright/test';
// Datos de prueba
const testUsers = {
  admin: {
    email: 'admin.reservas@test.com',
    password: 'ReservAdmin123!',
    name: 'Admin Reservas'
  },
  resident1: {
    email: 'residente.reservas@test.com',
    password: 'Resident123!',
    name: 'María Resident Test',
    unitNumber: 'Apto 504',
    phone: '3001234567'
  },
  resident2: {
    email: 'residente2.reservas@test.com',
    password: 'Resident456!',
    name: 'Carlos Resident Test',
    unitNumber: 'Apto 602'
  }
};
const testCommonAreas = [
  {
    name: 'Salón Social',
    capacity: '50 personas',
    hourlyRate: '80000',
    minimumHours: '4',
    description: 'Salón social con cocina, mesas, sillas y sonido',
    amenities: ['Cocina equipada', 'Sistema de sonido', 'Aire acondicionado', 'Baño privado']
  },
  {
    name: 'Zona BBQ',
    capacity: '30 personas',
    hourlyRate: '50000',
    minimumHours: '3',
    description: 'Zona de parrillas con mesas y asadores',
    amenities: ['3 Parrillas', 'Mesas y sillas', 'Lavaplatos', 'Zona cubierta']
  },
  {
    name: 'Gimnasio',
    capacity: '15 personas',
    hourlyRate: '25000',
    minimumHours: '2',
    description: 'Gimnasio con equipos de cardio y pesas',
    amenities: ['Equipos de cardio', 'Pesas libres', 'Espejo', 'Aire acondicionado']
  }
];
const testReservation = {
  area: 'Salón Social',
  date: '2025-03-20', // Fecha futura
  startTime: '14:00',
  endTime: '18:00',
  duration: 4, // horas
  purpose: 'Cumpleaños familiar',
  estimatedGuests: '25',
  additionalServices: ['Decoración básica', 'Limpieza post-evento'],
  contactPhone: '3001234567',
  specialRequests: 'Necesito acceso desde las 13:30 para decorar'
};
const testPayment = {
  method: 'CREDIT_CARD',
  cardNumber: '4111111111111111',
  expiryDate: '12/26',
  cvv: '123',
  cardName: 'MARIA RESIDENT TEST',
  installments: '1'
};
test.describe('Reservas - Áreas Comunes', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(90000); // Timeout extendido para transacciones de pago
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });
  test('Flujo completo: Consultar disponibilidad, reservar y pagar área común', async ({ page }) => {
    // PASO 1: Login como residente
    await test.step('Login como residente', async () => {
      await page.goto('/login');
      
      await page.fill('input[name="email"], input[type="email"]', testUsers.resident1.email);
      await page.fill('input[name="password"], input[type="password"]', testUsers.resident1.password);
      
      const loginButton = page.locator('button[type="submit"], button:has-text("Iniciar")').first();
      await loginButton.click();
      
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(/.*dashboard|resident/);
    });
    // PASO 2: Navegar al módulo de reservas
    await test.step('Navegar al módulo de reservas', async () => {
      // Buscar enlace de reservas en el menú
      const reservationsLink = page.locator('a:has-text("Reservas"), a:has-text("Áreas Comunes"), [href*="reserv"]').first();
      await expect(reservationsLink).toBeVisible({ timeout: 10000 });
      await reservationsLink.click();
      
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(/.*reserv|common|area/);
    });
    // PASO 3: Consultar áreas comunes disponibles
    await test.step('Consultar áreas comunes disponibles', async () => {
      // Verificar que se muestran las áreas comunes
      for (const area of testCommonAreas) {
        await expect(page.locator(`text="${area.name}"`)).toBeVisible();
        await expect(page.locator(`text="${area.capacity}"`)).toBeVisible();
      }
      // Ver detalles del Salón Social
      const salonSocialCard = page.locator(`text="${testReservation.area}"`).first();
      await salonSocialCard.click();
      // Verificar detalles del área
      await expect(page.locator(`text="${testCommonAreas[0].description}"`)).toBeVisible();
      await expect(page.locator(`text="${testCommonAreas[0].hourlyRate}"`)).toBeVisible();
    });
    // PASO 4: Consultar disponibilidad para fecha específica
    await test.step('Consultar disponibilidad para fecha específica', async () => {
      // Seleccionar fecha
      const dateInput = page.locator('input[name="date"], input[type="date"], #reservation-date').first();
      await dateInput.fill(testReservation.date);
      // Buscar disponibilidad
      const checkAvailabilityButton = page.locator('button:has-text("Consultar"), button:has-text("Ver Disponibilidad")').first();
      if (await checkAvailabilityButton.isVisible()) {
        await checkAvailabilityButton.click();
        await page.waitForLoadState('networkidle');
      }
      // Verificar que se muestra el calendario/horarios disponibles
      await expect(page.locator('text=/disponible/i, .available, .time-slot')).toBeVisible();
    });
    // PASO 5: Crear nueva reserva
    await test.step('Crear nueva reserva', async () => {
      // Hacer clic en el botón de reservar
      const reserveButton = page.locator('button:has-text("Reservar"), button:has-text("Crear Reserva")').first();
      await expect(reserveButton).toBeVisible();
      await reserveButton.click();
      // Esperar que aparezca el formulario de reserva
      await expect(page.locator('form, .reservation-form, .modal')).toBeVisible();
      // Llenar detalles de la reserva
      await page.fill('input[name="startTime"], input[type="time"], #start-time', testReservation.startTime);
      await page.fill('input[name="endTime"], input[type="time"], #end-time', testReservation.endTime);
      await page.fill('input[name="purpose"], #reservation-purpose', testReservation.purpose);
      await page.fill('input[name="guests"], #estimated-guests', testReservation.estimatedGuests);
      await page.fill('input[name="phone"], #contact-phone', testReservation.contactPhone);
      // Servicios adicionales (si existen checkboxes)
      for (const service of testReservation.additionalServices) {
        const serviceCheckbox = page.locator(`input[type="checkbox"][value*="${service}"], label:has-text("${service}")~input`).first();
        if (await serviceCheckbox.isVisible()) {
          await serviceCheckbox.check();
        }
      }
      // Solicitudes especiales
      const specialRequestsField = page.locator('textarea[name="specialRequests"], #special-requests').first();
      if (await specialRequestsField.isVisible()) {
        await specialRequestsField.fill(testReservation.specialRequests);
      }
      // Verificar cálculo automático del costo
      const totalCost = testCommonAreas[0].hourlyRate * testReservation.duration;
      await expect(page.locator(`text="${totalCost}", text="$${totalCost}"`)).toBeVisible();
    });
    // PASO 6: Confirmar y proceder al pago
    await test.step('Confirmar reserva y proceder al pago', async () => {
      // Aceptar términos y condiciones
      const termsCheckbox = page.locator('input[type="checkbox"][name*="terms"], #accept-terms').first();
      if (await termsCheckbox.isVisible()) {
        await termsCheckbox.check();
      }
      // Confirmar reserva
      const confirmButton = page.locator('button[type="submit"], button:has-text("Confirmar"), button:has-text("Continuar")').first();
      await confirmButton.click();
      // Esperar redirección a página de pago
      await page.waitForLoadState('networkidle');
      await expect(page.locator('text=/pago/i, text=/payment/i, .payment-form')).toBeVisible({ timeout: 15000 });
    });
    // PASO 7: Procesar pago de la reserva
    await test.step('Procesar pago de la reserva', async () => {
      // Verificar resumen de la reserva en página de pago
      await expect(page.locator(`text="${testReservation.area}"`)).toBeVisible();
      await expect(page.locator(`text="${testReservation.date}"`)).toBeVisible();
      await expect(page.locator(`text="${testReservation.startTime}"`)).toBeVisible();
      // Seleccionar método de pago
      const paymentMethodSelect = page.locator('select[name="paymentMethod"], #payment-method').first();
      if (await paymentMethodSelect.isVisible()) {
        await paymentMethodSelect.selectOption(testPayment.method);
      }
      // Llenar datos de tarjeta
      await page.fill('input[name="cardNumber"], #card-number', testPayment.cardNumber);
      await page.fill('input[name="expiryDate"], #expiry-date', testPayment.expiryDate);
      await page.fill('input[name="cvv"], #cvv', testPayment.cvv);
      await page.fill('input[name="cardName"], #card-name', testPayment.cardName);
      // Seleccionar cuotas si aplica
      const installmentsSelect = page.locator('select[name="installments"], #installments').first();
      if (await installmentsSelect.isVisible()) {
        await installmentsSelect.selectOption(testPayment.installments);
      }
      // Procesar pago
      const payButton = page.locator('button[type="submit"], button:has-text("Pagar"), button:has-text("Procesar")').first();
      await payButton.click();
      // Esperar procesamiento y confirmación
      await page.waitForLoadState('networkidle');
      await expect(page.locator('text=/pago.*exitoso/i, text=/reserva.*confirmada/i, text=/transacción.*aprobada/i')).toBeVisible({ timeout: 20000 });
    });
    // PASO 8: Verificar confirmación de reserva
    await test.step('Verificar confirmación de reserva', async () => {
      // Verificar detalles de la reserva confirmada
      await expect(page.locator(`text="${testReservation.area}"`)).toBeVisible();
      await expect(page.locator(`text="${testReservation.date}"`)).toBeVisible();
      await expect(page.locator('text=/confirmada/i, text=/aprobada/i')).toBeVisible();
      // Verificar número de confirmación o código de reserva
      const confirmationCode = page.locator('[data-testid="confirmation-code"], .confirmation-number').first();
      if (await confirmationCode.isVisible()) {
        const codeText = await confirmationCode.textContent();
        expect(codeText).toMatch(/[A-Z0-9]{6,}/); // Formato típico de código de confirmación
      }
      // Opción de descargar comprobante
      const downloadReceiptButton = page.locator('button:has-text("Descargar"), a:has-text("Comprobante")').first();
      if (await downloadReceiptButton.isVisible()) {
        // Verificar que el botón está disponible (no necesariamente hacer clic)
        await expect(downloadReceiptButton).toBeEnabled();
      }
    });
    // PASO 9: Verificar reserva en calendario personal
    await test.step('Verificar reserva en calendario personal', async () => {
      // Navegar a "Mis Reservas" o calendario
      const myReservationsLink = page.locator('a:has-text("Mis Reservas"), a:has-text("Mi Calendario"), [href*="my-reserv"]').first();
      if (await myReservationsLink.isVisible()) {
        await myReservationsLink.click();
      } else {
        await page.goto('/reservations/my-reservations');
      }
      await page.waitForLoadState('networkidle');
      // Verificar que aparece la reserva en la lista
      await expect(page.locator(`text="${testReservation.area}"`)).toBeVisible();
      await expect(page.locator(`text="${testReservation.date}"`)).toBeVisible();
      await expect(page.locator('text=/confirmada/i, text=/activa/i')).toBeVisible();
    });
  });
  test('Validación de conflictos de horario', async ({ page }) => {
    
    // Login como residente 1
    await page.goto('/login');
    await page.fill('input[name="email"]', testUsers.resident1.email);
    await page.fill('input[name="password"]', testUsers.resident1.password);
    await page.locator('button[type="submit"]').click();
    await page.waitForLoadState('networkidle');
    // Intentar reservar en horario ya ocupado
    await page.locator('a:has-text("Reservas")').first().click();
    await page.locator(`text="${testReservation.area}"`).click();
    // Seleccionar misma fecha y horario
    await page.fill('input[name="date"]', testReservation.date);
    await page.fill('input[name="startTime"]', testReservation.startTime);
    await page.fill('input[name="endTime"]', testReservation.endTime);
    const reserveButton = page.locator('button:has-text("Reservar")').first();
    if (await reserveButton.isVisible()) {
      await reserveButton.click();
      
      // Verificar mensaje de conflicto
      await expect(page.locator('text=/no.*disponible/i, text=/ocupado/i, text=/conflicto/i')).toBeVisible();
    }
  });
  test('Cancelación de reserva por residente', async ({ page }) => {
    
    // Login como residente
    await page.goto('/login');
    await page.fill('input[name="email"]', testUsers.resident1.email);
    await page.fill('input[name="password"]', testUsers.resident1.password);
    await page.locator('button[type="submit"]').click();
    await page.waitForLoadState('networkidle');
    // Ir a mis reservas
    await page.locator('a:has-text("Mis Reservas")').first().click();
    // Buscar reserva activa y cancelar
    const cancelButton = page.locator('button:has-text("Cancelar"), .cancel-reservation').first();
    if (await cancelButton.isVisible()) {
      await cancelButton.click();
      // Confirmar cancelación
      const confirmCancelButton = page.locator('button:has-text("Confirmar Cancelación"), button:has-text("Sí")').first();
      if (await confirmCancelButton.isVisible()) {
        await confirmCancelButton.click();
        
        // Verificar cancelación exitosa
        await expect(page.locator('text=/cancelada/i, text=/anulada/i')).toBeVisible();
      }
    }
  });
  test('Gestión de reservas por administrador', async ({ page }) => {
    
    // Login como administrador
    await page.goto('/login');
    await page.fill('input[name="email"]', testUsers.admin.email);
    await page.fill('input[name="password"]', testUsers.admin.password);
    await page.locator('button[type="submit"]').click();
    await page.waitForLoadState('networkidle');
    // Navegar a gestión de reservas
    await page.locator('a:has-text("Reservas"), a:has-text("Gestión")').first().click();
    
    // Ver todas las reservas
    const allReservationsTab = page.locator('tab:has-text("Todas"), button:has-text("Ver Todas")').first();
    if (await allReservationsTab.isVisible()) {
      await allReservationsTab.click();
    }
    // Verificar que aparecen reservas de todos los residentes
    await expect(page.locator(`text="${testUsers.resident1.name}"`)).toBeVisible();
    await expect(page.locator(`text="${testReservation.area}"`)).toBeVisible();
    // Filtrar por área común
    const areaFilter = page.locator('select[name="area"], #area-filter').first();
    if (await areaFilter.isVisible()) {
      await areaFilter.selectOption(testReservation.area);
      
      // Verificar filtrado
      await expect(page.locator(`text="${testReservation.area}"`)).toBeVisible();
    }
    // Ver detalles de una reserva
    const viewDetailsButton = page.locator('button:has-text("Ver"), button:has-text("Detalles")').first();
    if (await viewDetailsButton.isVisible()) {
      await viewDetailsButton.click();
      
      // Verificar información detallada
      await expect(page.locator(`text="${testReservation.purpose}"`)).toBeVisible();
      await expect(page.locator(`text="${testReservation.estimatedGuests}"`)).toBeVisible();
    }
  });
  test('Configuración de tarifas por administrador', async ({ page }) => {
    
    // Login como administrador
    await page.goto('/login');
    await page.fill('input[name="email"]', testUsers.admin.email);
    await page.fill('input[name="password"]', testUsers.admin.password);
    await page.locator('button[type="submit"]').click();
    await page.waitForLoadState('networkidle');
    // Navegar a configuración de áreas comunes
    await page.locator('a:has-text("Configuración"), a:has-text("Áreas")').first().click();
    
    // Editar tarifa de un área
    const editAreaButton = page.locator(`text="${testCommonAreas[0].name}"~button:has-text("Editar"), .edit-area`).first();
    if (await editAreaButton.isVisible()) {
      await editAreaButton.click();
      // Cambiar tarifa
      const rateInput = page.locator('input[name="hourlyRate"], #hourly-rate').first();
      if (await rateInput.isVisible()) {
        await rateInput.clear();
        await rateInput.fill('90000'); // Nueva tarifa
        // Guardar cambios
        const saveButton = page.locator('button[type="submit"], button:has-text("Guardar")').first();
        await saveButton.click();
        
        // Verificar actualización
        await expect(page.locator('text=/actualizada/i, text=/guardada/i')).toBeVisible();
      }
    }
  });
  test('Reporte de ocupación de áreas comunes', async ({ page }) => {
    
    // Login como administrador
    await page.goto('/login');
    await page.fill('input[name="email"]', testUsers.admin.email);
    await page.fill('input[name="password"]', testUsers.admin.password);
    await page.locator('button[type="submit"]').click();
    await page.waitForLoadState('networkidle');
    // Navegar a reportes
    await page.locator('a:has-text("Reportes"), a:has-text("Estadísticas")').first().click();
    
    // Seleccionar reporte de reservas/ocupación
    const reservationReportTab = page.locator('tab:has-text("Reservas"), button:has-text("Ocupación")').first();
    if (await reservationReportTab.isVisible()) {
      await reservationReportTab.click();
    }
    // Configurar período del reporte
    const periodSelect = page.locator('select[name="period"], #report-period').first();
    if (await periodSelect.isVisible()) {
      await periodSelect.selectOption('MONTHLY');
    }
    // Generar reporte
    const generateButton = page.locator('button:has-text("Generar"), button:has-text("Crear Reporte")').first();
    if (await generateButton.isVisible()) {
      await generateButton.click();
      
      // Verificar que se muestra el reporte
      await expect(page.locator('text=/ocupación/i, .chart, .statistics')).toBeVisible();
      
      // Verificar métricas básicas
      await expect(page.locator('text=/total.*reservas/i, text=/ingresos/i')).toBeVisible();
    }
  });
});