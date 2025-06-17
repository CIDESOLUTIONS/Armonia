/**
 * Pruebas E2E para el flujo de Onboarding
 * 
 * Estas pruebas verifican el flujo completo de registro de un nuevo conjunto
 * residencial y la creación de su administrador principal.
 */
import { test, expect, Page } from '@playwright/test';
// Datos de prueba para conjunto residencial
const testComplex = {
  name: 'Conjunto Residencial Los Robles E2E Test',
  nit: '900123456-1',
  address: 'Calle 123 #45-67, Bogotá',
  phone: '(601) 234-5678',
  email: 'admin@losrobles-test.com',
  units: '48',
  towers: '2',
  floors: '6',
  commonAreas: 'Salón Social, Gimnasio, Piscina, Zona BBQ'
};
// Datos del administrador principal
const adminUser = {
  name: 'Carlos Administrador Test',
  email: 'carlos.admin@losrobles-test.com',
  phone: '3001234567',
  dni: '12345678',
  password: 'AdminTest123!',
  confirmPassword: 'AdminTest123!'
};
test.describe('Onboarding - Registro de Conjunto Residencial', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navegar a la página principal
    await page.goto('/');
    
    // Esperar a que la página cargue completamente
    await page.waitForLoadState('networkidle');
  });
  test('Flujo completo de registro de conjunto residencial', async ({ page }) => {
    
    // PASO 1: Navegar a página de registro
    await test.step('Navegar a página de registro', async () => {
      // Buscar y hacer clic en el botón de registro
      const registerButton = page.locator('text="Registrar Conjunto"').first();
      await expect(registerButton).toBeVisible({ timeout: 10000 });
      await registerButton.click();
      
      // Verificar que estamos en la página de registro
      await expect(page).toHaveURL(/.*register-complex/);
      await expect(page.locator('h1, h2')).toContainText(/registr/i);
    });
    // PASO 2: Completar información del conjunto residencial
    await test.step('Completar información del conjunto', async () => {
      
      // Llenar datos básicos del conjunto
      await page.fill('input[name="name"], input[placeholder*="nombre"], #complex-name', testComplex.name);
      await page.fill('input[name="nit"], input[placeholder*="nit"], #complex-nit', testComplex.nit);
      await page.fill('input[name="address"], input[placeholder*="dirección"], #complex-address', testComplex.address);
      await page.fill('input[name="phone"], input[placeholder*="teléfono"], #complex-phone', testComplex.phone);
      await page.fill('input[name="email"], input[placeholder*="email"], #complex-email', testComplex.email);
      
      // Información de estructura
      await page.fill('input[name="units"], input[placeholder*="unidades"], #units', testComplex.units);
      await page.fill('input[name="towers"], input[placeholder*="torres"], #towers', testComplex.towers);
      await page.fill('input[name="floors"], input[placeholder*="pisos"], #floors', testComplex.floors);
      
      // Áreas comunes (si hay campo de texto)
      const commonAreasField = page.locator('textarea[name="commonAreas"], input[name="commonAreas"], #common-areas').first();
      if (await commonAreasField.isVisible()) {
        await commonAreasField.fill(testComplex.commonAreas);
      }
    });
    // PASO 3: Configurar administrador principal
    await test.step('Configurar administrador principal', async () => {
      
      // Scroll hacia abajo para ver los campos del administrador
      await page.locator('text=/administrador/i').first().scrollIntoViewIfNeeded();
      
      // Llenar datos del administrador
      await page.fill('input[name="adminName"], input[placeholder*="nombre"], #admin-name', adminUser.name);
      await page.fill('input[name="adminEmail"], input[placeholder*="email"], #admin-email', adminUser.email);
      await page.fill('input[name="adminPhone"], input[placeholder*="teléfono"], #admin-phone', adminUser.phone);
      await page.fill('input[name="adminDni"], input[placeholder*="documento"], #admin-dni', adminUser.dni);
      
      // Contraseñas
      await page.fill('input[name="password"], input[type="password"]', adminUser.password);
      await page.fill('input[name="confirmPassword"], input[placeholder*="confirmar"]', adminUser.confirmPassword);
    });
    // PASO 4: Aceptar términos y condiciones
    await test.step('Aceptar términos y condiciones', async () => {
      
      // Buscar y marcar checkbox de términos
      const termsCheckbox = page.locator('input[type="checkbox"]').first();
      if (await termsCheckbox.isVisible()) {
        await termsCheckbox.check();
      }
    });
    // PASO 5: Enviar formulario de registro
    await test.step('Enviar formulario de registro', async () => {
      
      // Buscar botón de envío
      const submitButton = page.locator('button[type="submit"], button:has-text("Registrar"), button:has-text("Crear")').first();
      await expect(submitButton).toBeVisible();
      await expect(submitButton).toBeEnabled();
      
      // Hacer clic en registrar
      await submitButton.click();
      
      // Esperar respuesta del servidor
      await page.waitForLoadState('networkidle');
    });
    // PASO 6: Verificar registro exitoso
    await test.step('Verificar registro exitoso', async () => {
      
      // Verificar redirección o mensaje de éxito
      // Puede redirigir al login o mostrar mensaje de confirmación
      await expect(page.locator('text=/éxito/i, text=/exitoso/i, text=/registrado/i, text=/creado/i')).toBeVisible({ timeout: 15000 });
      
      // O verificar redirección al login/dashboard
      await page.waitForTimeout(2000);
      const currentUrl = page.url();
      expect(currentUrl).toMatch(/login|dashboard|success|confirmation/);
    });
    // PASO 7: Verificar acceso del administrador
    await test.step('Verificar acceso del administrador', async () => {
      
      // Si no estamos en login, navegar allí
      if (!page.url().includes('login')) {
        await page.goto('/login');
      }
      
      // Realizar login con las credenciales del administrador
      await page.fill('input[name="email"], input[type="email"]', adminUser.email);
      await page.fill('input[name="password"], input[type="password"]', adminUser.password);
      
      const loginButton = page.locator('button[type="submit"], button:has-text("Iniciar"), button:has-text("Login")').first();
      await loginButton.click();
      
      // Esperar carga del dashboard
      await page.waitForLoadState('networkidle');
      
      // Verificar que estamos en el dashboard de administración
      await expect(page).toHaveURL(/.*dashboard|admin/);
      await expect(page.locator('text=/dashboard/i, text=/panel/i, text=/administración/i')).toBeVisible({ timeout: 10000 });
      
      // Verificar que aparece el nombre del conjunto o del usuario
      await expect(page.locator(`text="${testComplex.name}", text="${adminUser.name}"`)).toBeVisible();
    });
  });
  test('Validación de campos requeridos en registro', async ({ page }) => {
    
    // Navegar a registro
    await page.goto('/register-complex');
    
    // Intentar enviar formulario vacío
    const submitButton = page.locator('button[type="submit"], button:has-text("Registrar")').first();
    if (await submitButton.isVisible()) {
      await submitButton.click();
      
      // Verificar que aparecen mensajes de validación
      await expect(page.locator('text=/requerido/i, text=/obligatorio/i, .error, .invalid')).toBeVisible();
    }
  });
  test('Validación de email duplicado', async ({ page }) => {
    
    // Este test verificaría el comportamiento cuando se intenta registrar
    // un conjunto con un email que ya existe
    // Implementación depende de la lógica específica de la aplicación
    
    await page.goto('/register-complex');
    
    // Llenar formulario con email existente conocido
    await page.fill('input[name="email"], #complex-email', 'admin@existing-complex.com');
    await page.fill('input[name="name"], #complex-name', 'Test Complex');
    
    // Enviar y verificar mensaje de error
    const submitButton = page.locator('button[type="submit"]').first();
    if (await submitButton.isVisible()) {
      await submitButton.click();
      await expect(page.locator('text=/email.*existe/i, text=/ya.*registrado/i')).toBeVisible({ timeout: 10000 });
    }
  });
});