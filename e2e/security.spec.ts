/**
 * Pruebas E2E para el módulo de Seguridad
 *
 * Estas pruebas verifican el flujo completo del sistema de minutas digitales:
 * registro por guardias, consulta por administradores y gestión de incidentes.
 */
import { test, expect, Page } from '@playwright/test';
// Datos de prueba
const testUsers = {
  admin: {
    email: 'admin.seguridad@test.com',
    password: 'SecurityAdmin123!',
    name: 'Admin Seguridad'
  },
  guard1: {
    email: 'guardia1@test.com',
    password: 'Guard123!',
    name: 'Carlos Guardia Día',
    shift: 'DAY'
  },
  guard2: {
    email: 'guardia2@test.com', 
    password: 'Guard456!',
    name: 'Ana Guardia Noche',
    shift: 'NIGHT'
  }
};
const testIncidents = [
  {
    type: 'ROUTINE_CHECK',
    title: 'Ronda de Seguridad - Turno Día',
    description: 'Ronda rutinaria completada. Todas las áreas revisadas sin novedad. Puertas y ventanas seguras.',
    location: 'Todo el conjunto',
    severity: 'LOW',
    status: 'RESOLVED',
    time: '08:30'
  },
  {
    type: 'INCIDENT',
    title: 'Vehículo Sospechoso en Parqueadero',
    description: 'Se observó vehículo con placas ABC-123 estacionado en zona de visitantes por más de 4 horas sin autorización.',
    location: 'Parqueadero visitantes',
    severity: 'MEDIUM',
    status: 'PENDING',
    time: '14:15',
    actions: 'Se tomó foto de placas y se reportó a administración'
  },
  {
    type: 'EMERGENCY',
    title: 'Fuga de Gas en Torre B',
    description: 'Residente del apartamento 502 reportó fuerte olor a gas. Se evacuó el piso y se contactó empresa de gas.',
    location: 'Torre B - Piso 5',
    severity: 'HIGH',
    status: 'IN_PROGRESS',
    time: '20:45',
    actions: 'Evacuación inmediata, contacto con bomberos y empresa de gas'
  }
];
const testVisitors = [
  {
    name: 'Juan Pérez Visitante',
    dni: '12345678',
    phone: '3001234567',
    visitingUnit: 'Apto 301',
    purpose: 'Visita familiar',
    entryTime: '16:30',
    vehiclePlate: 'XYZ-789'
  },
  {
    name: 'María Técnico',
    dni: '87654321',
    phone: '3009876543',
    visitingUnit: 'Administración',
    purpose: 'Mantenimiento elevadores',
    entryTime: '09:00',
    company: 'Elevadores Express SAS'
  }
];
test.describe('Seguridad - Minutas Digitales y Control de Acceso', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });
  test('Flujo completo: Guardia registra minuta y admin consulta', async ({ page }) => {
    // PASO 1: Login como guardia de día
    await test.step('Login como guardia de día', async () => {
      await page.goto('/login');
      
      await page.fill('input[name="email"], input[type="email"]', testUsers.guard1.email);
      await page.fill('input[name="password"], input[type="password"]', testUsers.guard1.password);
      
      const loginButton = page.locator('button[type="submit"], button:has-text("Iniciar")').first();
      await loginButton.click();
      
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(/.*dashboard|guard|security/);
    });
    // PASO 2: Registrar incidente rutinario
    await test.step('Registrar ronda de seguridad rutinaria', async () => {
      // Navegar al módulo de seguridad/minutas
      const securityLink = page.locator('a:has-text("Seguridad"), a:has-text("Minutas"), [href*="security"]').first();
      await expect(securityLink).toBeVisible({ timeout: 10000 });
      await securityLink.click();
      
      await page.waitForLoadState('networkidle');
      // Crear nueva minuta/incidente
      const newIncidentButton = page.locator('button:has-text("Nuevo"), button:has-text("Registrar"), button:has-text("Crear")').first();
      await expect(newIncidentButton).toBeVisible();
      await newIncidentButton.click();
      // Llenar formulario de incidente rutinario
      const routineIncident = testIncidents[0];
      
      const typeSelect = page.locator('select[name="type"], #incident-type').first();
      if (await typeSelect.isVisible()) {
        await typeSelect.selectOption(routineIncident.type);
      }
      await page.fill('input[name="title"], #incident-title', routineIncident.title);
      await page.fill('textarea[name="description"], #incident-description', routineIncident.description);
      await page.fill('input[name="location"], #incident-location', routineIncident.location);
      await page.fill('input[name="time"], input[type="time"], #incident-time', routineIncident.time);
      const severitySelect = page.locator('select[name="severity"], #incident-severity').first();
      if (await severitySelect.isVisible()) {
        await severitySelect.selectOption(routineIncident.severity);
      }
      // Guardar incidente
      const saveButton = page.locator('button[type="submit"], button:has-text("Guardar"), button:has-text("Registrar")').first();
      await saveButton.click();
      await expect(page.locator('text=/registrado/i, text=/guardado/i, text=/éxito/i')).toBeVisible({ timeout: 15000 });
    });
    // PASO 3: Registrar visitante
    await test.step('Registrar entrada de visitante', async () => {
      // Navegar a control de visitantes
      const visitorsLink = page.locator('a:has-text("Visitantes"), a:has-text("Control"), [href*="visitor"]').first();
      if (await visitorsLink.isVisible()) {
        await visitorsLink.click();
      } else {
        // Buscar en el módulo de seguridad
        await page.locator('button:has-text("Visitantes"), .visitor-control').first().click();
      }
      await page.waitForLoadState('networkidle');
      // Registrar nuevo visitante
      const registerVisitorButton = page.locator('button:has-text("Registrar"), button:has-text("Nuevo")').first();
      await registerVisitorButton.click();
      // Llenar datos del visitante
      const visitor = testVisitors[0];
      
      await page.fill('input[name="visitorName"], #visitor-name', visitor.name);
      await page.fill('input[name="visitorDni"], #visitor-dni', visitor.dni);
      await page.fill('input[name="visitorPhone"], #visitor-phone', visitor.phone);
      await page.fill('input[name="visitingUnit"], #visiting-unit', visitor.visitingUnit);
      await page.fill('input[name="purpose"], #visit-purpose', visitor.purpose);
      await page.fill('input[name="vehiclePlate"], #vehicle-plate', visitor.vehiclePlate);
      // Registrar entrada
      const registerEntryButton = page.locator('button[type="submit"], button:has-text("Registrar Entrada")').first();
      await registerEntryButton.click();
      await expect(page.locator('text=/visitante.*registrado/i, text=/entrada.*autorizada/i')).toBeVisible();
    });
    // PASO 4: Registrar incidente de severidad media
    await test.step('Registrar incidente con vehículo sospechoso', async () => {
      // Volver a minutas/incidentes
      await page.locator('a:has-text("Minutas"), a:has-text("Incidentes")').first().click();
      
      const newIncidentButton = page.locator('button:has-text("Nuevo"), button:has-text("Registrar")').first();
      await newIncidentButton.click();
      // Llenar incidente de severidad media
      const mediumIncident = testIncidents[1];
      
      const typeSelect = page.locator('select[name="type"]').first();
      if (await typeSelect.isVisible()) {
        await typeSelect.selectOption(mediumIncident.type);
      }
      await page.fill('input[name="title"]', mediumIncident.title);
      await page.fill('textarea[name="description"]', mediumIncident.description);
      await page.fill('input[name="location"]', mediumIncident.location);
      await page.fill('input[name="time"]', mediumIncident.time);
      
      const severitySelect = page.locator('select[name="severity"]').first();
      if (await severitySelect.isVisible()) {
        await severitySelect.selectOption(mediumIncident.severity);
      }
      // Agregar acciones tomadas
      const actionsField = page.locator('textarea[name="actions"], #incident-actions').first();
      if (await actionsField.isVisible()) {
        await actionsField.fill(mediumIncident.actions);
      }
      // Guardar incidente
      await page.locator('button[type="submit"]').first().click();
      await expect(page.locator('text=/registrado/i')).toBeVisible();
    });
    // PASO 5: Finalizar turno
    await test.step('Finalizar turno de guardia', async () => {
      // Buscar opción de finalizar turno
      const endShiftButton = page.locator('button:has-text("Finalizar Turno"), button:has-text("Cerrar Turno")').first();
      if (await endShiftButton.isVisible()) {
        await endShiftButton.click();
        
        // Confirmar finalización
        const confirmButton = page.locator('button:has-text("Confirmar"), button:has-text("Sí")').first();
        if (await confirmButton.isVisible()) {
          await confirmButton.click();
        }
        
        await expect(page.locator('text=/turno.*finalizado/i, text=/minuta.*cerrada/i')).toBeVisible();
      }
    });
    // PASO 6: Logout del guardia y login como admin
    await test.step('Cambiar a usuario administrador', async () => {
      // Logout
      const logoutButton = page.locator('button:has-text("Salir"), a:has-text("Cerrar")').first();
      if (await logoutButton.isVisible()) {
        await logoutButton.click();
      } else {
        await page.goto('/logout');
      }
      
      await page.waitForLoadState('networkidle');
      // Login como administrador
      await page.goto('/login');
      await page.fill('input[name="email"]', testUsers.admin.email);
      await page.fill('input[name="password"]', testUsers.admin.password);
      await page.locator('button[type="submit"]').click();
      
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(/.*dashboard|admin/);
    });
    // PASO 7: Consultar minutas del día
    await test.step('Admin consulta minutas del día', async () => {
      // Navegar al módulo de seguridad
      const securityLink = page.locator('a:has-text("Seguridad"), a:has-text("Minutas"), [href*="security"]').first();
      await securityLink.click();
      await page.waitForLoadState('networkidle');
      // Verificar que aparecen los incidentes registrados
      await expect(page.locator(`text="${testIncidents[0].title}"`)).toBeVisible();
      await expect(page.locator(`text="${testIncidents[1].title}"`)).toBeVisible();
      
      // Verificar información de guardias
      await expect(page.locator(`text="${testUsers.guard1.name}"`)).toBeVisible();
    });
    // PASO 8: Ver detalle de incidente
    await test.step('Ver detalle de incidente específico', async () => {
      // Hacer clic en el incidente de vehículo sospechoso
      await page.locator(`text="${testIncidents[1].title}"`).click();
      
      // Verificar que se abre el detalle
      await expect(page.locator(`text="${testIncidents[1].description}"`)).toBeVisible();
      await expect(page.locator(`text="${testIncidents[1].actions}"`)).toBeVisible();
      await expect(page.locator('text=/medium/i, text=/medio/i')).toBeVisible();
    });
    // PASO 9: Generar reporte de seguridad
    await test.step('Generar reporte de seguridad del día', async () => {
      // Buscar opción de reportes
      const reportsButton = page.locator('button:has-text("Reporte"), button:has-text("Exportar"), a:has-text("Reportes")').first();
      if (await reportsButton.isVisible()) {
        await reportsButton.click();
        
        // Seleccionar período (día actual)
        const todayOption = page.locator('option:has-text("Hoy"), input[value="today"]').first();
        if (await todayOption.isVisible()) {
          await todayOption.click();
        }
        
        // Generar reporte
        const generateButton = page.locator('button:has-text("Generar"), button:has-text("Crear Reporte")').first();
        if (await generateButton.isVisible()) {
          await generateButton.click();
          
          // Verificar que se genera el reporte
          await expect(page.locator('text=/reporte.*generado/i, text=/descarga/i')).toBeVisible({ timeout: 15000 });
        }
      }
    });
  });
  test('Registro de emergencia por guardia nocturno', async ({ page }) => {
    
    // PASO 1: Login como guardia nocturno
    await page.goto('/login');
    await page.fill('input[name="email"]', testUsers.guard2.email);
    await page.fill('input[name="password"]', testUsers.guard2.password);
    await page.locator('button[type="submit"]').click();
    await page.waitForLoadState('networkidle');
    // PASO 2: Registrar emergencia
    await page.locator('a:has-text("Seguridad")').first().click();
    await page.locator('button:has-text("Nuevo")').first().click();
    const emergency = testIncidents[2];
    
    // Llenar formulario de emergencia
    const typeSelect = page.locator('select[name="type"]').first();
    if (await typeSelect.isVisible()) {
      await typeSelect.selectOption(emergency.type);
    }
    await page.fill('input[name="title"]', emergency.title);
    await page.fill('textarea[name="description"]', emergency.description);
    await page.fill('input[name="location"]', emergency.location);
    await page.fill('input[name="time"]', emergency.time);
    
    const severitySelect = page.locator('select[name="severity"]').first();
    if (await severitySelect.isVisible()) {
      await severitySelect.selectOption(emergency.severity);
    }
    await page.fill('textarea[name="actions"]', emergency.actions);
    // Marcar como emergencia/prioridad alta
    const emergencyCheckbox = page.locator('input[name="isEmergency"], input[type="checkbox"]').first();
    if (await emergencyCheckbox.isVisible()) {
      await emergencyCheckbox.check();
    }
    // Guardar emergencia
    await page.locator('button[type="submit"]').first().click();
    
    // Verificar alerta de emergencia
    await expect(page.locator('text=/emergencia.*registrada/i, text=/alerta.*enviada/i')).toBeVisible();
  });
  test('Control de salida de visitantes', async ({ page }) => {
    
    // Login como guardia
    await page.goto('/login');
    await page.fill('input[name="email"]', testUsers.guard1.email);
    await page.fill('input[name="password"]', testUsers.guard1.password);
    await page.locator('button[type="submit"]').click();
    await page.waitForLoadState('networkidle');
    // Navegar a control de visitantes
    await page.locator('a:has-text("Visitantes")').first().click();
    
    // Ver visitantes activos
    const activeVisitorsTab = page.locator('tab:has-text("Activos"), button:has-text("En el conjunto")').first();
    if (await activeVisitorsTab.isVisible()) {
      await activeVisitorsTab.click();
    }
    // Registrar salida de visitante
    const visitor = testVisitors[0];
    const exitButton = page.locator(`text="${visitor.name}"~button:has-text("Salida"), .exit-button`).first();
    if (await exitButton.isVisible()) {
      await exitButton.click();
      
      // Confirmar salida
      const confirmExitButton = page.locator('button:has-text("Confirmar Salida")').first();
      if (await confirmExitButton.isVisible()) {
        await confirmExitButton.click();
        
        await expect(page.locator('text=/salida.*registrada/i')).toBeVisible();
      }
    }
  });
  test('Búsqueda y filtros en histórico de minutas', async ({ page }) => {
    
    // Login como admin
    await page.goto('/login');
    await page.fill('input[name="email"]', testUsers.admin.email);
    await page.fill('input[name="password"]', testUsers.admin.password);
    await page.locator('button[type="submit"]').click();
    await page.waitForLoadState('networkidle');
    // Navegar a seguridad
    await page.locator('a:has-text("Seguridad")').first().click();
    
    // Acceder a histórico
    const historyTab = page.locator('tab:has-text("Histórico"), a:has-text("Ver Todo")').first();
    if (await historyTab.isVisible()) {
      await historyTab.click();
    }
    // Aplicar filtro por severidad
    const severityFilter = page.locator('select[name="severity"], #severity-filter').first();
    if (await severityFilter.isVisible()) {
      await severityFilter.selectOption('HIGH');
      
      // Verificar que se filtran los resultados
      await expect(page.locator('text=/emergency/i, text=/alta/i')).toBeVisible();
    }
    // Búsqueda por texto
    const searchInput = page.locator('input[name="search"], #search-input').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('vehículo');
      
      // Verificar resultados de búsqueda
      await expect(page.locator('text="Vehículo Sospechoso"')).toBeVisible();
    }
  });
});