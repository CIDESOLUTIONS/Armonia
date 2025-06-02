/**
 * Pruebas E2E para el sistema PQR
 * 
 * Estas pruebas verifican los flujos completos de usuario en el sistema PQR,
 * desde la creación hasta la resolución de solicitudes.
 */

import { test, expect, Page } from '@playwright/test';

// Datos de prueba
const testUser = {
  email: 'residente@example.com',
  password: 'password123'
};

const testAdmin = {
  email: 'admin@example.com',
  password: 'admin123'
};

// Datos para PQR de prueba
const testPQR = {
  title: 'Fuga de agua en baño comunal',
  description: 'Hay una fuga de agua importante en el baño del primer piso que requiere atención urgente.',
  type: 'COMPLAINT',
  location: 'Baño primer piso'
};

test.describe('Sistema PQR - Flujos principales', () => {
  test.beforeEach(async ({ page }) => {
    // Navegar a la página de inicio
    await page.goto('/');
  });

  test('Flujo completo: Creación, asignación y resolución de PQR', async ({ page }) => {
    // 1. Login como residente
    await loginUser(page, testUser);
    
    // Verificar que estamos en el dashboard de residente
    await expect(page.locator('h1:has-text("Dashboard de Residente")')).toBeVisible();
    
    // 2. Navegar a la sección de PQR
    await page.click('text=PQR');
    await expect(page.locator('h2:has-text("Mis Solicitudes")')).toBeVisible();
    
    // 3. Crear nuevo PQR
    await page.click('button:has-text("Nueva Solicitud")');
    await expect(page.locator('h2:has-text("Crear Nueva Solicitud")')).toBeVisible();
    
    // Llenar formulario
    await page.selectOption('select[name="type"]', testPQR.type);
    await page.fill('input[name="title"]', testPQR.title);
    await page.fill('textarea[name="description"]', testPQR.description);
    await page.fill('input[name="location"]', testPQR.location);
    
    // Opcional: Subir archivo adjunto si está disponible
    const fileUploadHandle = page.locator('input[type="file"]');
    if (await fileUploadHandle.isVisible()) {
      // await fileUploadHandle.setInputFiles('path/to/test/image.jpg');
    }
    
    // Enviar formulario
    await page.click('button[type="submit"]');
    
    // Verificar confirmación
    await expect(page.locator('div.alert-success')).toContainText('Solicitud creada correctamente');
    
    // Obtener número de ticket del mensaje de confirmación
    const alertText = await page.locator('div.alert-success').textContent();
    const ticketNumberMatch = alertText?.match(/PQR-\d+-\d+/);
    const ticketNumber = ticketNumberMatch ? ticketNumberMatch[0] : '';
    
    // Verificar que el PQR aparece en la lista
    await expect(page.locator(`tr:has-text("${testPQR.title}")`)).toBeVisible();
    
    // 4. Cerrar sesión como residente
    await page.click('button:has-text("Cerrar Sesión")');
    
    // 5. Login como administrador
    await loginUser(page, testAdmin);
    
    // Verificar que estamos en el dashboard de administrador
    await expect(page.locator('h1:has-text("Dashboard de Administración")')).toBeVisible();
    
    // 6. Navegar a la sección de PQR
    await page.click('text=Gestión de PQR');
    await expect(page.locator('h2:has-text("Gestión de Solicitudes")')).toBeVisible();
    
    // 7. Buscar el PQR creado
    await page.fill('input[placeholder="Buscar por título o número"]', ticketNumber || testPQR.title);
    await page.click('button:has-text("Buscar")');
    
    // Verificar que se encuentra el PQR
    await expect(page.locator(`tr:has-text("${testPQR.title}")`)).toBeVisible();
    
    // 8. Abrir el PQR para revisión
    await page.click(`tr:has-text("${testPQR.title}") a:has-text("Ver")`);
    await expect(page.locator(`h2:has-text("${testPQR.title}")`)).toBeVisible();
    
    // 9. Categorizar y asignar el PQR
    await page.click('button:has-text("Categorizar")');
    await page.selectOption('select[name="category"]', 'MAINTENANCE');
    await page.selectOption('select[name="priority"]', 'HIGH');
    await page.click('button:has-text("Guardar")');
    
    // Verificar actualización
    await expect(page.locator('div.alert-success')).toContainText('PQR categorizado correctamente');
    
    // 10. Asignar a equipo o persona
    await page.click('button:has-text("Asignar")');
    await page.selectOption('select[name="assignType"]', 'team');
    await page.selectOption('select[name="assignTeamId"]', '2'); // ID del equipo de mantenimiento
    await page.click('button:has-text("Guardar")');
    
    // Verificar asignación
    await expect(page.locator('div.alert-success')).toContainText('PQR asignado correctamente');
    await expect(page.locator('div.badge:has-text("ASSIGNED")')).toBeVisible();
    
    // 11. Cambiar estado a "En Progreso"
    await page.click('button:has-text("Cambiar Estado")');
    await page.selectOption('select[name="status"]', 'IN_PROGRESS');
    await page.fill('textarea[name="comment"]', 'Se ha enviado un técnico para revisar la fuga');
    await page.click('button:has-text("Guardar")');
    
    // Verificar cambio de estado
    await expect(page.locator('div.alert-success')).toContainText('Estado actualizado correctamente');
    await expect(page.locator('div.badge:has-text("IN_PROGRESS")')).toBeVisible();
    
    // 12. Resolver el PQR
    await page.click('button:has-text("Cambiar Estado")');
    await page.selectOption('select[name="status"]', 'RESOLVED');
    await page.fill('textarea[name="comment"]', 'Se ha reparado la fuga de agua y verificado su correcto funcionamiento');
    await page.click('button:has-text("Guardar")');
    
    // Verificar resolución
    await expect(page.locator('div.alert-success')).toContainText('Estado actualizado correctamente');
    await expect(page.locator('div.badge:has-text("RESOLVED")')).toBeVisible();
    
    // 13. Cerrar sesión como administrador
    await page.click('button:has-text("Cerrar Sesión")');
    
    // 14. Login nuevamente como residente para verificar
    await loginUser(page, testUser);
    
    // Navegar a la sección de PQR
    await page.click('text=PQR');
    
    // Buscar el PQR
    await page.fill('input[placeholder="Buscar"]', ticketNumber || testPQR.title);
    await page.click('button:has-text("Buscar")');
    
    // Verificar estado resuelto
    await expect(page.locator(`tr:has-text("${testPQR.title}")`)).toContainText('RESOLVED');
    
    // 15. Abrir el PQR para calificar
    await page.click(`tr:has-text("${testPQR.title}") a:has-text("Ver")`);
    
    // Calificar la resolución
    await page.click('button:has-text("Calificar")');
    await page.click('div.rating span:nth-child(5)'); // 5 estrellas
    await page.fill('textarea[name="comment"]', 'Excelente servicio, rápido y efectivo');
    await page.click('button:has-text("Enviar")');
    
    // Verificar confirmación
    await expect(page.locator('div.alert-success')).toContainText('Gracias por su calificación');
    
    // 16. Cerrar el PQR
    await page.click('button:has-text("Cerrar Solicitud")');
    await page.click('button:has-text("Confirmar")');
    
    // Verificar cierre
    await expect(page.locator('div.alert-success')).toContainText('Solicitud cerrada correctamente');
    await expect(page.locator('div.badge:has-text("CLOSED")')).toBeVisible();
  });

  test('Dashboard de métricas PQR', async ({ page }) => {
    // 1. Login como administrador
    await loginUser(page, testAdmin);
    
    // Verificar que estamos en el dashboard de administrador
    await expect(page.locator('h1:has-text("Dashboard de Administración")')).toBeVisible();
    
    // 2. Navegar al dashboard de métricas PQR
    await page.click('text=Métricas PQR');
    await expect(page.locator('h2:has-text("Dashboard de Métricas PQR")')).toBeVisible();
    
    // 3. Verificar componentes del dashboard
    // Resumen
    await expect(page.locator('div.card:has-text("Resumen")')).toBeVisible();
    
    // Gráficos
    await expect(page.locator('div.chart-container')).toHaveCount(4);
    
    // Tabla de SLA
    await expect(page.locator('table:has-text("Cumplimiento de SLA")')).toBeVisible();
    
    // 4. Aplicar filtros
    await page.click('button:has-text("Filtros")');
    
    // Filtrar por fecha (último mes)
    await page.click('text=Último mes');
    
    // Filtrar por categoría
    await page.selectOption('select[name="category"]', 'MAINTENANCE');
    
    // Aplicar filtros
    await page.click('button:has-text("Aplicar")');
    
    // Verificar que se actualizan los datos
    await expect(page.locator('div.loading-indicator')).not.toBeVisible();
    
    // 5. Exportar reporte
    await page.click('button:has-text("Exportar")');
    await page.click('a:has-text("Exportar a Excel")');
    
    // Verificar descarga (esto puede variar según la implementación)
    // await expect(page.locator('div.alert-success')).toContainText('Reporte exportado correctamente');
  });
});

// Función auxiliar para login
async function loginUser(page: Page, user: { email: string; password: string }) {
  await page.goto('/login');
  await page.fill('input[name="email"]', user.email);
  await page.fill('input[name="password"]', user.password);
  await page.click('button[type="submit"]');
  
  // Esperar a que se complete el login
  await page.waitForNavigation();
}
