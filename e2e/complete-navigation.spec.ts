/**
 * Pruebas E2E para Navegación Completa del Sistema Armonía
 *
 * Estas pruebas verifican el flujo completo desde landing page:
 * - Landing page inicial
 * - Selector de portales (Administrador, Residente, Recepción)
 * - Proceso de login para cada tipo de usuario
 * - Navegación completa del dashboard con menú lateral colapsable
 * - Verificación de todas las funcionalidades del menú lateral
 */
import { test, expect, Page } from '@playwright/test';
// Datos de usuarios de prueba para cada portal
const testUsers = {
  admin: {
    email: 'admin.completo@test.com',
    password: 'AdminComplete123!',
    name: 'Administrador Completo',
    role: 'ADMIN'
  },
  resident: {
    email: 'residente.completo@test.com',
    password: 'ResidentComplete123!',
    name: 'Juan Pérez Residente',
    role: 'RESIDENT',
    unit: 'Apto 301'
  },
  reception: {
    email: 'recepcion.completa@test.com',
    password: 'ReceptionComplete123!',
    name: 'María García Recepcionista',
    role: 'RECEPTION'
  }
};
// Elementos del menú lateral por tipo de usuario
const menuItems = {
  admin: [
    { name: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
    { name: 'Inventario', href: '/inventory', icon: 'inventory' },
    { name: 'Finanzas', href: '/finances', icon: 'finances' },
    { name: 'Asambleas', href: '/assemblies', icon: 'assemblies' },
    { name: 'PQR', href: '/pqr', icon: 'pqr' },
    { name: 'Seguridad', href: '/security', icon: 'security' },
    { name: 'Reservas', href: '/reservations', icon: 'reservations' },
    { name: 'Comunicaciones', href: '/communications', icon: 'communications' },
    { name: 'Servicios', href: '/services', icon: 'services' },
    { name: 'Cámaras', href: '/cameras', icon: 'cameras' },
    { name: 'Visitantes', href: '/visitors', icon: 'visitors' },
    { name: 'Reportes', href: '/reports', icon: 'reports' },
    { name: 'Configuración', href: '/settings', icon: 'settings' }
  ],
  resident: [
    { name: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
    { name: 'Mi Cuenta', href: '/account', icon: 'account' },
    { name: 'Pagos', href: '/payments', icon: 'payments' },
    { name: 'PQR', href: '/pqr', icon: 'pqr' },
    { name: 'Reservas', href: '/reservations', icon: 'reservations' },
    { name: 'Comunicaciones', href: '/communications', icon: 'communications' },
    { name: 'Documentos', href: '/documents', icon: 'documents' },
    { name: 'Votaciones', href: '/voting', icon: 'voting' },
    { name: 'Visitantes', href: '/visitors', icon: 'visitors' }
  ],
  reception: [
    { name: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
    { name: 'Visitantes', href: '/visitors', icon: 'visitors' },
    { name: 'Paquetes', href: '/packages', icon: 'packages' },
    { name: 'Incidentes', href: '/incidents', icon: 'incidents' },
    { name: 'Directorio', href: '/directory', icon: 'directory' },
    { name: 'Comunicaciones', href: '/communications', icon: 'communications' },
    { name: 'Cámaras', href: '/cameras', icon: 'cameras' },
    { name: 'Reportes', href: '/reports', icon: 'reports' }
  ]
};
test.describe('Navegación Completa - Landing a Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(120000); // 2 minutos para pruebas completas
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });
  test('Flujo completo: Landing → Portal Administrador → Dashboard completo', async ({ page }) => {
    // PASO 1: Verificar landing page
    await test.step('Verificar elementos de la landing page', async () => {
      // Verificar elementos principales de la landing
      await expect(page.locator('h1, .hero-title')).toBeVisible();
      await expect(page.locator('text=/Armonía/i')).toBeVisible();
      
      // Verificar secciones principales
      await expect(page.locator('text=/gestión/i, text=/conjuntos/i, text=/residencial/i')).toBeVisible();
      
      // Verificar botones de acción
      const ctaButtons = page.locator('button:has-text("Comenzar"), a:has-text("Iniciar"), button:has-text("Probar")');
      await expect(ctaButtons.first()).toBeVisible();
    });
    // PASO 2: Navegar al selector de portales
    await test.step('Navegar al selector de portales', async () => {
      // Buscar botón de acceso/login
      const accessButton = page.locator('button:has-text("Acceder"), a:has-text("Login"), button:has-text("Ingresar"), a:has-text("Portal")').first();
      await expect(accessButton).toBeVisible({ timeout: 10000 });
      await accessButton.click();
      await page.waitForLoadState('networkidle');
      
      // Verificar que llegamos al selector de portales
      await expect(page).toHaveURL(/.*portal-selector|portales|access/);
      await expect(page.locator('text=/selecciona.*portal/i, text=/tipo.*usuario/i')).toBeVisible();
    });
    // PASO 3: Seleccionar portal de Administrador
    await test.step('Seleccionar portal de Administrador', async () => {
      // Buscar y hacer clic en el portal de administrador
      const adminPortal = page.locator('button:has-text("Administrador"), .admin-portal, [data-portal="admin"]').first();
      await expect(adminPortal).toBeVisible({ timeout: 10000 });
      await adminPortal.click();
      await page.waitForLoadState('networkidle');
      
      // Verificar que llegamos al login de administrador
      await expect(page).toHaveURL(/.*login.*admin|admin.*login/);
      await expect(page.locator('text=/administrador/i')).toBeVisible();
    });
    // PASO 4: Login como Administrador
    await test.step('Login como Administrador', async () => {
      // Llenar formulario de login
      await page.fill('input[name="email"], input[type="email"]', testUsers.admin.email);
      await page.fill('input[name="password"], input[type="password"]', testUsers.admin.password);
      
      const loginButton = page.locator('button[type="submit"], button:has-text("Iniciar"), button:has-text("Ingresar")').first();
      await loginButton.click();
      
      await page.waitForLoadState('networkidle');
      
      // Verificar acceso exitoso al dashboard
      await expect(page).toHaveURL(/.*dashboard|admin/);
      await expect(page.locator(`text="${testUsers.admin.name}", text=/bienvenido/i`)).toBeVisible({ timeout: 15000 });
    });
    // PASO 5: Verificar estructura del dashboard
    await test.step('Verificar estructura del dashboard de administrador', async () => {
      // Verificar header principal
      await expect(page.locator('header, .header, nav')).toBeVisible();
      
      // Verificar menú lateral
      const sidebar = page.locator('.sidebar, #sidebar, nav[role="navigation"]').first();
      await expect(sidebar).toBeVisible();
      
      // Verificar que el menú es colapsable
      const toggleButton = page.locator('button[aria-label*="toggle"], .menu-toggle, .sidebar-toggle').first();
      if (await toggleButton.isVisible()) {
        await toggleButton.click();
        await page.waitForTimeout(500);
        await toggleButton.click(); // Volver a expandir
      }
      
      // Verificar área de contenido principal
      await expect(page.locator('main, .main-content, .dashboard-content')).toBeVisible();
    });
    // PASO 6: Navegar por todas las opciones del menú lateral
    await test.step('Navegar por todas las opciones del menú lateral', async () => {
      for (const menuItem of menuItems.admin) {
        // Buscar el elemento del menú
        const menuLink = page.locator(`a:has-text("${menuItem.name}"), [href*="${menuItem.href}"], .menu-item:has-text("${menuItem.name}")`).first();
        
        if (await menuLink.isVisible()) {
          await menuLink.click();
          await page.waitForLoadState('networkidle');
          
          // Verificar que navegamos a la página correcta
          await expect(page).toHaveURL(new RegExp(menuItem.href.replace('/', '\\/') + '|' + menuItem.name.toLowerCase()));
          
          // Verificar contenido específico de la página
          await expect(page.locator(`h1:has-text("${menuItem.name}"), .page-title:has-text("${menuItem.name}"), h2:has-text("${menuItem.name}")`)).toBeVisible({ timeout: 10000 });
          
          // Esperar un momento entre navegaciones
          await page.waitForTimeout(1000);
        }
      }
    });
    // PASO 7: Verificar funcionalidades específicas por módulo
    await test.step('Verificar funcionalidades específicas de módulos clave', async () => {
      
      // Dashboard principal
      await page.locator('a:has-text("Dashboard")').first().click();
      await expect(page.locator('text=/estadísticas/i, .stats, .metrics')).toBeVisible();
      
      // Inventario
      await page.locator('a:has-text("Inventario")').first().click();
      await expect(page.locator('text=/residentes/i, text=/propiedades/i')).toBeVisible();
      
      // Finanzas
      await page.locator('a:has-text("Finanzas")').first().click();
      await expect(page.locator('text=/facturación/i, text=/pagos/i, text=/ingresos/i')).toBeVisible();
      
      // Asambleas
      const assemblyLink = page.locator('a:has-text("Asambleas")').first();
      if (await assemblyLink.isVisible()) {
        await assemblyLink.click();
        await expect(page.locator('text=/votación/i, text=/asamblea/i')).toBeVisible();
      }
      
      // PQR
      await page.locator('a:has-text("PQR")').first().click();
      await expect(page.locator('text=/peticiones/i, text=/quejas/i, text=/reclamos/i')).toBeVisible();
      
      // Seguridad
      const securityLink = page.locator('a:has-text("Seguridad")').first();
      if (await securityLink.isVisible()) {
        await securityLink.click();
        await expect(page.locator('text=/acceso/i, text=/control/i, text=/visitantes/i')).toBeVisible();
      }
    });
    // PASO 8: Verificar responsive y funcionalidades del menú
    await test.step('Verificar funcionalidades responsivas del menú', async () => {
      // Probar colapsar/expandir menú
      const menuToggle = page.locator('.menu-toggle, .sidebar-toggle, button[aria-label*="menu"]').first();
      if (await menuToggle.isVisible()) {
        // Colapsar
        await menuToggle.click();
        await page.waitForTimeout(500);
        
        // Verificar que el menú se colapsó
        const collapsedSidebar = page.locator('.sidebar-collapsed, .sidebar.collapsed, nav.collapsed').first();
        if (await collapsedSidebar.isVisible()) {
          // Expandir nuevamente
          await menuToggle.click();
          await page.waitForTimeout(500);
        }
      }
      
      // Verificar tooltips en menú colapsado (si existen)
      const tooltipTrigger = page.locator('.menu-item[title], .nav-item[data-tooltip]').first();
      if (await tooltipTrigger.isVisible()) {
        await tooltipTrigger.hover();
        await expect(page.locator('.tooltip, [role="tooltip"]')).toBeVisible();
      }
    });
  });
  test('Flujo completo: Landing → Portal Residente → Dashboard residente', async ({ page }) => {
    // PASO 1: Navegar desde landing al portal residente
    await test.step('Navegar al portal de residente', async () => {
      const accessButton = page.locator('button:has-text("Acceder"), a:has-text("Portal")').first();
      await accessButton.click();
      await page.waitForLoadState('networkidle');
      // Seleccionar portal residente
      const residentPortal = page.locator('button:has-text("Residente"), .resident-portal, [data-portal="resident"]').first();
      await expect(residentPortal).toBeVisible();
      await residentPortal.click();
      await page.waitForLoadState('networkidle');
    });
    // PASO 2: Login como residente
    await test.step('Login como residente', async () => {
      await page.fill('input[name="email"]', testUsers.resident.email);
      await page.fill('input[name="password"]', testUsers.resident.password);
      
      const loginButton = page.locator('button[type="submit"]').first();
      await loginButton.click();
      await page.waitForLoadState('networkidle');
      
      await expect(page).toHaveURL(/.*dashboard|resident/);
      await expect(page.locator(`text="${testUsers.resident.name}", text=/residente/i`)).toBeVisible();
    });
    // PASO 3: Navegar por el menú de residente
    await test.step('Navegar por opciones del menú de residente', async () => {
      for (const menuItem of menuItems.resident) {
        const menuLink = page.locator(`a:has-text("${menuItem.name}")`).first();
        
        if (await menuLink.isVisible()) {
          await menuLink.click();
          await page.waitForLoadState('networkidle');
          
          // Verificar navegación exitosa
          await expect(page.locator(`h1:has-text("${menuItem.name}"), .page-title`)).toBeVisible({ timeout: 10000 });
          await page.waitForTimeout(800);
        }
      }
    });
    // PASO 4: Verificar funcionalidades específicas de residente
    await test.step('Verificar funcionalidades específicas de residente', async () => {
      // Mi cuenta
      await page.locator('a:has-text("Mi Cuenta")').first().click();
      await expect(page.locator('text=/información personal/i, text=/datos/i')).toBeVisible();
      
      // Pagos
      await page.locator('a:has-text("Pagos")').first().click();
      await expect(page.locator('text=/estado de cuenta/i, text=/facturas/i')).toBeVisible();
      
      // Reservas
      await page.locator('a:has-text("Reservas")').first().click();
      await expect(page.locator('text=/áreas comunes/i, text=/salón/i, text=/gimnasio/i')).toBeVisible();
    });
  });
  test('Flujo completo: Landing → Portal Recepción → Dashboard recepción', async ({ page }) => {
    // PASO 1: Navegar al portal de recepción
    await test.step('Navegar al portal de recepción', async () => {
      const accessButton = page.locator('button:has-text("Acceder"), a:has-text("Portal")').first();
      await accessButton.click();
      await page.waitForLoadState('networkidle');
      // Seleccionar portal recepción
      const receptionPortal = page.locator('button:has-text("Recepción"), .reception-portal, [data-portal="reception"]').first();
      await expect(receptionPortal).toBeVisible();
      await receptionPortal.click();
      await page.waitForLoadState('networkidle');
    });
    // PASO 2: Login como recepcionista
    await test.step('Login como recepcionista', async () => {
      await page.fill('input[name="email"]', testUsers.reception.email);
      await page.fill('input[name="password"]', testUsers.reception.password);
      
      const loginButton = page.locator('button[type="submit"]').first();
      await loginButton.click();
      await page.waitForLoadState('networkidle');
      
      await expect(page).toHaveURL(/.*dashboard|reception/);
      await expect(page.locator(`text="${testUsers.reception.name}", text=/recepción/i`)).toBeVisible();
    });
    // PASO 3: Navegar por el menú de recepción
    await test.step('Navegar por opciones del menú de recepción', async () => {
      for (const menuItem of menuItems.reception) {
        const menuLink = page.locator(`a:has-text("${menuItem.name}")`).first();
        
        if (await menuLink.isVisible()) {
          await menuLink.click();
          await page.waitForLoadState('networkidle');
          
          await expect(page.locator(`h1:has-text("${menuItem.name}"), .page-title`)).toBeVisible({ timeout: 10000 });
          await page.waitForTimeout(800);
        }
      }
    });
    // PASO 4: Verificar funcionalidades específicas de recepción
    await test.step('Verificar funcionalidades específicas de recepción', async () => {
      // Visitantes
      await page.locator('a:has-text("Visitantes")').first().click();
      await expect(page.locator('text=/registro de visitas/i, text=/autorización/i')).toBeVisible();
      
      // Paquetes
      await page.locator('a:has-text("Paquetes")').first().click();
      await expect(page.locator('text=/correspondencia/i, text=/entrega/i')).toBeVisible();
      
      // Incidentes
      await page.locator('a:has-text("Incidentes")').first().click();
      await expect(page.locator('text=/reportar/i, text=/novedad/i')).toBeVisible();
    });
  });
  test('Verificar accesibilidad y UX del menú lateral', async ({ page }) => {
    // Login como administrador
    await page.goto('/portal-selector');
    await page.locator('button:has-text("Administrador")').first().click();
    await page.fill('input[name="email"]', testUsers.admin.email);
    await page.fill('input[name="password"]', testUsers.admin.password);
    await page.locator('button[type="submit"]').first().click();
    await page.waitForLoadState('networkidle');
    // PASO 1: Verificar accesibilidad del menú
    await test.step('Verificar accesibilidad del menú lateral', async () => {
      // Verificar que el menú tiene atributos de accesibilidad
      const sidebar = page.locator('nav[role="navigation"], .sidebar').first();
      await expect(sidebar).toBeVisible();
      
      // Verificar navegación por teclado
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Verificar que los elementos del menú son focuseables
      const firstMenuItem = page.locator('.menu-item a, nav a').first();
      await firstMenuItem.focus();
      await expect(firstMenuItem).toBeFocused();
    });
    // PASO 2: Verificar estados del menú
    await test.step('Verificar estados activo/inactivo del menú', async () => {
      // Navegar a diferentes secciones y verificar estado activo
      await page.locator('a:has-text("Inventario")').first().click();
      await expect(page.locator('a:has-text("Inventario").active, .menu-item.active:has-text("Inventario")')).toBeVisible();
      
      await page.locator('a:has-text("Finanzas")').first().click();
      await expect(page.locator('a:has-text("Finanzas").active, .menu-item.active:has-text("Finanzas")')).toBeVisible();
    });
    // PASO 3: Verificar responsive del menú
    await test.step('Verificar comportamiento responsive', async () => {
      // Simular pantalla móvil
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.waitForTimeout(500);
      
      // Verificar que el menú se adapta o se oculta en móvil
      const mobileMenu = page.locator('.mobile-menu, .sidebar-mobile').first();
      const menuToggle = page.locator('.menu-toggle, .hamburger').first();
      
      if (await menuToggle.isVisible()) {
        await menuToggle.click();
        await page.waitForTimeout(500);
      }
      
      // Restaurar tamaño desktop
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.waitForTimeout(500);
    });
  });
  test('Verificar logout y cambio de portales', async ({ page }) => {
    // Login inicial como administrador
    await page.goto('/portal-selector');
    await page.locator('button:has-text("Administrador")').first().click();
    await page.fill('input[name="email"]', testUsers.admin.email);
    await page.fill('input[name="password"]', testUsers.admin.password);
    await page.locator('button[type="submit"]').first().click();
    await page.waitForLoadState('networkidle');
    // PASO 1: Verificar función de logout
    await test.step('Verificar logout desde dashboard', async () => {
      // Buscar botón de logout
      const logoutButton = page.locator('button:has-text("Salir"), button:has-text("Logout"), .logout-btn').first();
      await expect(logoutButton).toBeVisible();
      await logoutButton.click();
      
      // Verificar que regresamos a la página de login o landing
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(/.*login|portal|landing|\//);
    });
    // PASO 2: Verificar cambio de portal
    await test.step('Cambiar a portal residente', async () => {
      // Si estamos en login, ir al selector de portales
      if (page.url().includes('login')) {
        await page.goto('/portal-selector');
      }
      
      // Seleccionar portal residente
      await page.locator('button:has-text("Residente")').first().click();
      await page.fill('input[name="email"]', testUsers.resident.email);
      await page.fill('input[name="password"]', testUsers.resident.password);
      await page.locator('button[type="submit"]').first().click();
      await page.waitForLoadState('networkidle');
      
      // Verificar que estamos en dashboard residente
      await expect(page).toHaveURL(/.*dashboard|resident/);
      await expect(page.locator('text=/residente/i')).toBeVisible();
    });
  });
});