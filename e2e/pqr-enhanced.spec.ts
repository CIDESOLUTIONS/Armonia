/**
 * Pruebas E2E mejoradas para el sistema PQR
 * 
 * Estas pruebas verifican los flujos completos de usuario en el sistema PQR,
 * desde la creación hasta la resolución de solicitudes, incluyendo todos
 * los roles y escenarios principales.
 */

import { test, expect, Page } from '@playwright/test';

// Datos de prueba
const testUsers = {
  resident: {
    email: 'residente@example.com',
    password: 'password123',
    name: 'Juan Pérez'
  },
  admin: {
    email: 'admin@example.com',
    password: 'admin123',
    name: 'Admin Principal'
  },
  staff: {
    email: 'tecnico@example.com',
    password: 'tecnico123',
    name: 'Técnico Mantenimiento'
  }
};

// Datos para PQR de prueba
const testPQRs = {
  maintenance: {
    title: 'Fuga de agua en baño comunal',
    description: 'Hay una fuga de agua importante en el baño del primer piso que requiere atención urgente.',
    type: 'COMPLAINT',
    location: 'Baño primer piso',
    category: 'MAINTENANCE',
    subcategory: 'Plomería',
    priority: 'HIGH'
  },
  security: {
    title: 'Cámara de seguridad no funciona',
    description: 'La cámara de seguridad del parqueadero no está funcionando desde ayer.',
    type: 'COMPLAINT',
    location: 'Parqueadero nivel 1',
    category: 'SECURITY',
    subcategory: 'Videovigilancia',
    priority: 'MEDIUM'
  }
};

// Clase auxiliar para Page Objects
class PQRPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // Navegación
  async gotoLoginPage() {
    await this.page.goto('/login');
  }

  async gotoDashboard() {
    await this.page.goto('/dashboard');
  }

  async gotoPQRList() {
    await this.page.goto('/dashboard/pqr');
  }

  async gotoPQRCreate() {
    await this.page.goto('/dashboard/pqr/create');
  }

  async gotoPQRDetail(id: string) {
    await this.page.goto(`/dashboard/pqr/${id}`);
  }

  async gotoMetricsDashboard() {
    await this.page.goto('/dashboard/pqr/metrics');
  }

  // Acciones de autenticación
  async login(email: string, password: string) {
    await this.gotoLoginPage();
    await this.page.fill('input[name="email"]', email);
    await this.page.fill('input[name="password"]', password);
    await this.page.click('button[type="submit"]');
    
    // Esperar a que se complete el login
    await this.page.waitForNavigation();
  }

  async logout() {
    await this.page.click('button[aria-label="Abrir menú de usuario"]');
    await this.page.click('button:has-text("Cerrar Sesión")');
    
    // Esperar a que se complete el logout
    await this.page.waitForNavigation();
  }

  // Acciones de PQR
  async createPQR(pqrData: any) {
    await this.gotoPQRCreate();
    
    // Llenar formulario
    await this.page.selectOption('select[name="type"]', pqrData.type);
    await this.page.fill('input[name="title"]', pqrData.title);
    await this.page.fill('textarea[name="description"]', pqrData.description);
    await this.page.fill('input[name="location"]', pqrData.location);
    
    // Opcional: Subir archivo adjunto si está disponible
    const fileUploadHandle = this.page.locator('input[type="file"]');
    if (await fileUploadHandle.isVisible()) {
      // await fileUploadHandle.setInputFiles('path/to/test/image.jpg');
    }
    
    // Enviar formulario
    await this.page.click('button[type="submit"]');
    
    // Esperar confirmación
    await this.page.waitForSelector('div.alert-success');
    
    // Obtener número de ticket del mensaje de confirmación
    const alertText = await this.page.locator('div.alert-success').textContent();
    const ticketNumberMatch = alertText?.match(/PQR-\d+-\d+/);
    return ticketNumberMatch ? ticketNumberMatch[0] : '';
  }

  async categorizePQR(id: string, category: string, priority: string, subcategory?: string) {
    await this.gotoPQRDetail(id);
    await this.page.click('button:has-text("Categorizar")');
    
    await this.page.selectOption('select[name="category"]', category);
    await this.page.selectOption('select[name="priority"]', priority);
    
    if (subcategory) {
      await this.page.fill('input[name="subcategory"]', subcategory);
    }
    
    await this.page.click('button:has-text("Guardar")');
    
    // Esperar confirmación
    await this.page.waitForSelector('div.alert-success');
  }

  async assignPQR(id: string, assignType: 'user' | 'team', assignId: string) {
    await this.gotoPQRDetail(id);
    await this.page.click('button:has-text("Asignar")');
    
    await this.page.selectOption('select[name="assignType"]', assignType);
    
    if (assignType === 'user') {
      await this.page.selectOption('select[name="assignUserId"]', assignId);
    } else {
      await this.page.selectOption('select[name="assignTeamId"]', assignId);
    }
    
    await this.page.click('button:has-text("Guardar")');
    
    // Esperar confirmación
    await this.page.waitForSelector('div.alert-success');
  }

  async changeStatus(id: string, status: string, comment: string) {
    await this.gotoPQRDetail(id);
    await this.page.click('button:has-text("Cambiar Estado")');
    
    await this.page.selectOption('select[name="status"]', status);
    await this.page.fill('textarea[name="comment"]', comment);
    
    await this.page.click('button:has-text("Guardar")');
    
    // Esperar confirmación
    await this.page.waitForSelector('div.alert-success');
  }

  async ratePQR(id: string, rating: number, comment: string) {
    await this.gotoPQRDetail(id);
    await this.page.click('button:has-text("Calificar")');
    
    await this.page.click(`div.rating span:nth-child(${rating})`);
    await this.page.fill('textarea[name="comment"]', comment);
    
    await this.page.click('button:has-text("Enviar")');
    
    // Esperar confirmación
    await this.page.waitForSelector('div.alert-success');
  }

  async reopenPQR(id: string, reason: string) {
    await this.gotoPQRDetail(id);
    await this.page.click('button:has-text("Reabrir")');
    
    await this.page.fill('textarea[name="reopenReason"]', reason);
    await this.page.click('button:has-text("Confirmar")');
    
    // Esperar confirmación
    await this.page.waitForSelector('div.alert-success');
  }

  async closePQR(id: string) {
    await this.gotoPQRDetail(id);
    await this.page.click('button:has-text("Cerrar Solicitud")');
    await this.page.click('button:has-text("Confirmar")');
    
    // Esperar confirmación
    await this.page.waitForSelector('div.alert-success');
  }

  // Verificaciones
  async verifyPQRExists(ticketNumber: string) {
    await this.gotoPQRList();
    await this.page.fill('input[placeholder="Buscar"]', ticketNumber);
    await this.page.click('button:has-text("Buscar")');
    
    await expect(this.page.locator(`tr:has-text("${ticketNumber}")`)).toBeVisible();
  }

  async verifyPQRStatus(ticketNumber: string, status: string) {
    await this.gotoPQRList();
    await this.page.fill('input[placeholder="Buscar"]', ticketNumber);
    await this.page.click('button:has-text("Buscar")');
    
    await expect(this.page.locator(`tr:has-text("${ticketNumber}")`)).toContainText(status);
  }

  async verifyMetricsDashboard() {
    await this.gotoMetricsDashboard();
    
    // Verificar componentes del dashboard
    await expect(this.page.locator('div.card:has-text("Resumen")')).toBeVisible();
    await expect(this.page.locator('div.chart-container')).toHaveCount(4);
    await expect(this.page.locator('table:has-text("Cumplimiento de SLA")')).toBeVisible();
  }
}

test.describe('Sistema PQR - Flujos E2E', () => {
  let pqrPage: PQRPage;
  let ticketNumber: string;

  test.beforeEach(async ({ page }) => {
    pqrPage = new PQRPage(page);
  });

  test('Flujo completo: Creación, asignación y resolución de PQR', async ({ page }) => {
    pqrPage = new PQRPage(page);
    
    // 1. Login como residente
    await pqrPage.login(testUsers.resident.email, testUsers.resident.password);
    
    // Verificar que estamos en el dashboard de residente
    await expect(page.locator('h1:has-text("Dashboard de Residente")')).toBeVisible();
    
    // 2. Crear nuevo PQR
    ticketNumber = await pqrPage.createPQR(testPQRs.maintenance);
    
    // Verificar que el PQR aparece en la lista
    await pqrPage.verifyPQRExists(ticketNumber);
    
    // 3. Cerrar sesión como residente
    await pqrPage.logout();
    
    // 4. Login como administrador
    await pqrPage.login(testUsers.admin.email, testUsers.admin.password);
    
    // Verificar que estamos en el dashboard de administrador
    await expect(page.locator('h1:has-text("Dashboard de Administración")')).toBeVisible();
    
    // 5. Buscar el PQR creado
    await pqrPage.gotoPQRList();
    await page.fill('input[placeholder="Buscar"]', ticketNumber);
    await page.click('button:has-text("Buscar")');
    
    // Verificar que se encuentra el PQR
    await expect(page.locator(`tr:has-text("${ticketNumber}")`)).toBeVisible();
    
    // 6. Categorizar el PQR
    await pqrPage.categorizePQR(
      ticketNumber,
      testPQRs.maintenance.category,
      testPQRs.maintenance.priority,
      testPQRs.maintenance.subcategory
    );
    
    // 7. Asignar a técnico
    await pqrPage.assignPQR(ticketNumber, 'user', '10'); // ID del técnico
    
    // Verificar estado asignado
    await pqrPage.verifyPQRStatus(ticketNumber, 'ASSIGNED');
    
    // 8. Cerrar sesión como administrador
    await pqrPage.logout();
    
    // 9. Login como técnico
    await pqrPage.login(testUsers.staff.email, testUsers.staff.password);
    
    // 10. Cambiar estado a "En Progreso"
    await pqrPage.changeStatus(
      ticketNumber,
      'IN_PROGRESS',
      'Se ha enviado un técnico para revisar la fuga'
    );
    
    // Verificar estado en progreso
    await pqrPage.verifyPQRStatus(ticketNumber, 'IN_PROGRESS');
    
    // 11. Resolver el PQR
    await pqrPage.changeStatus(
      ticketNumber,
      'RESOLVED',
      'Se ha reparado la fuga de agua y verificado su correcto funcionamiento'
    );
    
    // Verificar estado resuelto
    await pqrPage.verifyPQRStatus(ticketNumber, 'RESOLVED');
    
    // 12. Cerrar sesión como técnico
    await pqrPage.logout();
    
    // 13. Login nuevamente como residente para verificar
    await pqrPage.login(testUsers.resident.email, testUsers.resident.password);
    
    // Verificar estado resuelto
    await pqrPage.verifyPQRStatus(ticketNumber, 'RESOLVED');
    
    // 14. Calificar la resolución
    await pqrPage.ratePQR(ticketNumber, 5, 'Excelente servicio, rápido y efectivo');
    
    // 15. Cerrar el PQR
    await pqrPage.closePQR(ticketNumber);
    
    // Verificar estado cerrado
    await pqrPage.verifyPQRStatus(ticketNumber, 'CLOSED');
  });

  test('Flujo de reapertura: Resolución, reapertura y resolución final', async ({ page }) => {
    pqrPage = new PQRPage(page);
    
    // 1. Login como residente
    await pqrPage.login(testUsers.resident.email, testUsers.resident.password);
    
    // 2. Crear nuevo PQR
    ticketNumber = await pqrPage.createPQR(testPQRs.security);
    
    // 3. Cerrar sesión como residente
    await pqrPage.logout();
    
    // 4. Login como administrador
    await pqrPage.login(testUsers.admin.email, testUsers.admin.password);
    
    // 5. Categorizar y asignar el PQR
    await pqrPage.categorizePQR(
      ticketNumber,
      testPQRs.security.category,
      testPQRs.security.priority,
      testPQRs.security.subcategory
    );
    
    await pqrPage.assignPQR(ticketNumber, 'team', '3'); // ID del equipo de seguridad
    
    // 6. Cambiar estado a "En Progreso"
    await pqrPage.changeStatus(
      ticketNumber,
      'IN_PROGRESS',
      'Se ha enviado un técnico para revisar la cámara'
    );
    
    // 7. Resolver el PQR (primera resolución)
    await pqrPage.changeStatus(
      ticketNumber,
      'RESOLVED',
      'Se ha reiniciado la cámara y está funcionando correctamente'
    );
    
    // 8. Cerrar sesión como administrador
    await pqrPage.logout();
    
    // 9. Login como residente
    await pqrPage.login(testUsers.resident.email, testUsers.resident.password);
    
    // 10. Reabrir el PQR
    await pqrPage.reopenPQR(
      ticketNumber,
      'La cámara volvió a fallar después de unas horas'
    );
    
    // Verificar estado reabierto
    await pqrPage.verifyPQRStatus(ticketNumber, 'REOPENED');
    
    // 11. Cerrar sesión como residente
    await pqrPage.logout();
    
    // 12. Login como administrador
    await pqrPage.login(testUsers.admin.email, testUsers.admin.password);
    
    // 13. Aumentar prioridad y reasignar
    await pqrPage.categorizePQR(
      ticketNumber,
      testPQRs.security.category,
      'HIGH', // Aumentar prioridad
      testPQRs.security.subcategory
    );
    
    await pqrPage.assignPQR(ticketNumber, 'user', '12'); // ID del especialista
    
    // 14. Cambiar estado a "En Progreso"
    await pqrPage.changeStatus(
      ticketNumber,
      'IN_PROGRESS',
      'Se ha enviado un especialista para revisar el problema a fondo'
    );
    
    // 15. Resolver el PQR (resolución final)
    await pqrPage.changeStatus(
      ticketNumber,
      'RESOLVED',
      'Se ha reemplazado la cámara defectuosa por una nueva y se ha verificado su funcionamiento'
    );
    
    // 16. Cerrar sesión como administrador
    await pqrPage.logout();
    
    // 17. Login como residente
    await pqrPage.login(testUsers.resident.email, testUsers.resident.password);
    
    // 18. Calificar y cerrar
    await pqrPage.ratePQR(ticketNumber, 5, 'Excelente solución definitiva');
    await pqrPage.closePQR(ticketNumber);
    
    // Verificar estado cerrado
    await pqrPage.verifyPQRStatus(ticketNumber, 'CLOSED');
  });

  test('Dashboard de métricas PQR', async ({ page }) => {
    pqrPage = new PQRPage(page);
    
    // 1. Login como administrador
    await pqrPage.login(testUsers.admin.email, testUsers.admin.password);
    
    // 2. Verificar dashboard de métricas
    await pqrPage.verifyMetricsDashboard();
    
    // 3. Aplicar filtros
    await page.click('button:has-text("Filtros")');
    
    // Filtrar por fecha (último mes)
    await page.click('text=Último mes');
    
    // Filtrar por categoría
    await page.selectOption('select[name="category"]', 'MAINTENANCE');
    
    // Aplicar filtros
    await page.click('button:has-text("Aplicar")');
    
    // Verificar que se actualizan los datos
    await expect(page.locator('div.loading-indicator')).not.toBeVisible();
    
    // 4. Exportar reporte
    await page.click('button:has-text("Exportar")');
    await page.click('a:has-text("Exportar a Excel")');
    
    // Verificar descarga (esto puede variar según la implementación)
    // await expect(page.locator('div.alert-success')).toContainText('Reporte exportado correctamente');
  });

  test('Flujo de notificaciones y recordatorios', async ({ page }) => {
    pqrPage = new PQRPage(page);
    
    // 1. Login como administrador
    await pqrPage.login(testUsers.admin.email, testUsers.admin.password);
    
    // 2. Ir a la sección de notificaciones
    await page.click('a:has-text("Notificaciones")');
    
    // Verificar que hay notificaciones
    await expect(page.locator('div.notification-list')).toBeVisible();
    
    // 3. Verificar recordatorios de vencimiento
    await page.click('a:has-text("Recordatorios")');
    
    // Verificar que hay recordatorios
    await expect(page.locator('div.reminder-list')).toBeVisible();
    
    // 4. Configurar notificaciones automáticas
    await page.click('a:has-text("Configuración")');
    await page.click('button:has-text("Notificaciones")');
    
    // Activar todas las notificaciones
    await page.check('input[name="autoNotifyEnabled"]');
    await page.check('input[name="emailNotificationsEnabled"]');
    await page.check('input[name="pushNotificationsEnabled"]');
    await page.check('input[name="smsNotificationsEnabled"]');
    
    // Guardar configuración
    await page.click('button:has-text("Guardar")');
    
    // Verificar confirmación
    await expect(page.locator('div.alert-success')).toBeVisible();
  });

  test('Prueba de responsividad en dispositivos móviles', async ({ page }) => {
    // Esta prueba se ejecutará en los proyectos móviles definidos en la configuración
    pqrPage = new PQRPage(page);
    
    // 1. Login como residente
    await pqrPage.login(testUsers.resident.email, testUsers.resident.password);
    
    // 2. Verificar que el menú móvil está presente
    await expect(page.locator('button.mobile-menu-button')).toBeVisible();
    
    // 3. Abrir menú móvil
    await page.click('button.mobile-menu-button');
    
    // 4. Navegar a PQR
    await page.click('a:has-text("PQR")');
    
    // 5. Verificar que la lista de PQR se muestra correctamente
    await expect(page.locator('div.pqr-list')).toBeVisible();
    
    // 6. Crear nuevo PQR desde móvil
    await page.click('button:has-text("Nueva Solicitud")');
    
    // Verificar que el formulario se adapta correctamente
    await expect(page.locator('form.pqr-form')).toBeVisible();
    
    // 7. Llenar formulario
    await page.selectOption('select[name="type"]', testPQRs.maintenance.type);
    await page.fill('input[name="title"]', testPQRs.maintenance.title);
    await page.fill('textarea[name="description"]', testPQRs.maintenance.description);
    
    // 8. Enviar formulario
    await page.click('button[type="submit"]');
    
    // Verificar confirmación
    await expect(page.locator('div.alert-success')).toBeVisible();
  });
});
