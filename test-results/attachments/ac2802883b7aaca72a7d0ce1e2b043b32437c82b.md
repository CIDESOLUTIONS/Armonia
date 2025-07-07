# Test info

- Name: Navegación Completa - Landing a Dashboard >> Flujo completo: Landing → Portal Administrador → Dashboard completo
- Location: C:\Users\meciz\Documents\armonia\e2e\complete-navigation.spec.ts:79:7

# Error details

```
Error: browserType.launch: Executable doesn't exist at C:\Users\meciz\AppData\Local\ms-playwright\webkit-2158\Playwright.exe
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
   2 |  * Pruebas E2E para Navegación Completa del Sistema Armonía
   3 |  *
   4 |  * Estas pruebas verifican el flujo completo desde landing page:
   5 |  * - Landing page inicial
   6 |  * - Selector de portales (Administrador, Residente, Recepción)
   7 |  * - Proceso de login para cada tipo de usuario
   8 |  * - Navegación completa del dashboard con menú lateral colapsable
   9 |  * - Verificación de todas las funcionalidades del menú lateral
   10 |  */
   11 | import { test, expect, Page } from '@playwright/test';
   12 | // Datos de usuarios de prueba para cada portal
   13 | const testUsers = {
   14 |   admin: {
   15 |     email: 'admin.completo@test.com',
   16 |     password: 'AdminComplete123!',
   17 |     name: 'Administrador Completo',
   18 |     role: 'ADMIN'
   19 |   },
   20 |   resident: {
   21 |     email: 'residente.completo@test.com',
   22 |     password: 'ResidentComplete123!',
   23 |     name: 'Juan Pérez Residente',
   24 |     role: 'RESIDENT',
   25 |     unit: 'Apto 301'
   26 |   },
   27 |   reception: {
   28 |     email: 'recepcion.completa@test.com',
   29 |     password: 'ReceptionComplete123!',
   30 |     name: 'María García Recepcionista',
   31 |     role: 'RECEPTION'
   32 |   }
   33 | };
   34 | // Elementos del menú lateral por tipo de usuario
   35 | const menuItems = {
   36 |   admin: [
   37 |     { name: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
   38 |     { name: 'Inventario', href: '/inventory', icon: 'inventory' },
   39 |     { name: 'Finanzas', href: '/finances', icon: 'finances' },
   40 |     { name: 'Asambleas', href: '/assemblies', icon: 'assemblies' },
   41 |     { name: 'PQR', href: '/pqr', icon: 'pqr' },
   42 |     { name: 'Seguridad', href: '/security', icon: 'security' },
   43 |     { name: 'Reservas', href: '/reservations', icon: 'reservations' },
   44 |     { name: 'Comunicaciones', href: '/communications', icon: 'communications' },
   45 |     { name: 'Servicios', href: '/services', icon: 'services' },
   46 |     { name: 'Cámaras', href: '/cameras', icon: 'cameras' },
   47 |     { name: 'Visitantes', href: '/visitors', icon: 'visitors' },
   48 |     { name: 'Reportes', href: '/reports', icon: 'reports' },
   49 |     { name: 'Configuración', href: '/settings', icon: 'settings' }
   50 |   ],
   51 |   resident: [
   52 |     { name: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
   53 |     { name: 'Mi Cuenta', href: '/account', icon: 'account' },
   54 |     { name: 'Pagos', href: '/payments', icon: 'payments' },
   55 |     { name: 'PQR', href: '/pqr', icon: 'pqr' },
   56 |     { name: 'Reservas', href: '/reservations', icon: 'reservations' },
   57 |     { name: 'Comunicaciones', href: '/communications', icon: 'communications' },
   58 |     { name: 'Documentos', href: '/documents', icon: 'documents' },
   59 |     { name: 'Votaciones', href: '/voting', icon: 'voting' },
   60 |     { name: 'Visitantes', href: '/visitors', icon: 'visitors' }
   61 |   ],
   62 |   reception: [
   63 |     { name: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
   64 |     { name: 'Visitantes', href: '/visitors', icon: 'visitors' },
   65 |     { name: 'Paquetes', href: '/packages', icon: 'packages' },
   66 |     { name: 'Incidentes', href: '/incidents', icon: 'incidents' },
   67 |     { name: 'Directorio', href: '/directory', icon: 'directory' },
   68 |     { name: 'Comunicaciones', href: '/communications', icon: 'communications' },
   69 |     { name: 'Cámaras', href: '/cameras', icon: 'cameras' },
   70 |     { name: 'Reportes', href: '/reports', icon: 'reports' }
   71 |   ]
   72 | };
   73 | test.describe('Navegación Completa - Landing a Dashboard', () => {
   74 |   test.beforeEach(async ({ page }) => {
   75 |     test.setTimeout(120000); // 2 minutos para pruebas completas
   76 |     await page.goto('/');
   77 |     await page.waitForLoadState('networkidle');
   78 |   });
>  79 |   test('Flujo completo: Landing → Portal Administrador → Dashboard completo', async ({ page }) => {
      |       ^ Error: browserType.launch: Executable doesn't exist at C:\Users\meciz\AppData\Local\ms-playwright\webkit-2158\Playwright.exe
   80 |     // PASO 1: Verificar landing page
   81 |     await test.step('Verificar elementos de la landing page', async () => {
   82 |       // Verificar elementos principales de la landing
   83 |       await expect(page.locator('h1, .hero-title')).toBeVisible();
   84 |       await expect(page.locator('text=/Armonía/i')).toBeVisible();
   85 |       
   86 |       // Verificar secciones principales
   87 |       await expect(page.locator('text=/gestión/i, text=/conjuntos/i, text=/residencial/i')).toBeVisible();
   88 |       
   89 |       // Verificar botones de acción
   90 |       const ctaButtons = page.locator('button:has-text("Comenzar"), a:has-text("Iniciar"), button:has-text("Probar")');
   91 |       await expect(ctaButtons.first()).toBeVisible();
   92 |     });
   93 |     // PASO 2: Navegar al selector de portales
   94 |     await test.step('Navegar al selector de portales', async () => {
   95 |       // Buscar botón de acceso/login
   96 |       const accessButton = page.locator('button:has-text("Acceder"), a:has-text("Login"), button:has-text("Ingresar"), a:has-text("Portal")').first();
   97 |       await expect(accessButton).toBeVisible({ timeout: 10000 });
   98 |       await accessButton.click();
   99 |       await page.waitForLoadState('networkidle');
  100 |       
  101 |       // Verificar que llegamos al selector de portales
  102 |       await expect(page).toHaveURL(/.*portal-selector|portales|access/);
  103 |       await expect(page.locator('text=/selecciona.*portal/i, text=/tipo.*usuario/i')).toBeVisible();
  104 |     });
  105 |     // PASO 3: Seleccionar portal de Administrador
  106 |     await test.step('Seleccionar portal de Administrador', async () => {
  107 |       // Buscar y hacer clic en el portal de administrador
  108 |       const adminPortal = page.locator('button:has-text("Administrador"), .admin-portal, [data-portal="admin"]').first();
  109 |       await expect(adminPortal).toBeVisible({ timeout: 10000 });
  110 |       await adminPortal.click();
  111 |       await page.waitForLoadState('networkidle');
  112 |       
  113 |       // Verificar que llegamos al login de administrador
  114 |       await expect(page).toHaveURL(/.*login.*admin|admin.*login/);
  115 |       await expect(page.locator('text=/administrador/i')).toBeVisible();
  116 |     });
  117 |     // PASO 4: Login como Administrador
  118 |     await test.step('Login como Administrador', async () => {
  119 |       // Llenar formulario de login
  120 |       await page.fill('input[name="email"], input[type="email"]', testUsers.admin.email);
  121 |       await page.fill('input[name="password"], input[type="password"]', testUsers.admin.password);
  122 |       
  123 |       const loginButton = page.locator('button[type="submit"], button:has-text("Iniciar"), button:has-text("Ingresar")').first();
  124 |       await loginButton.click();
  125 |       
  126 |       await page.waitForLoadState('networkidle');
  127 |       
  128 |       // Verificar acceso exitoso al dashboard
  129 |       await expect(page).toHaveURL(/.*dashboard|admin/);
  130 |       await expect(page.locator(`text="${testUsers.admin.name}", text=/bienvenido/i`)).toBeVisible({ timeout: 15000 });
  131 |     });
  132 |     // PASO 5: Verificar estructura del dashboard
  133 |     await test.step('Verificar estructura del dashboard de administrador', async () => {
  134 |       // Verificar header principal
  135 |       await expect(page.locator('header, .header, nav')).toBeVisible();
  136 |       
  137 |       // Verificar menú lateral
  138 |       const sidebar = page.locator('.sidebar, #sidebar, nav[role="navigation"]').first();
  139 |       await expect(sidebar).toBeVisible();
  140 |       
  141 |       // Verificar que el menú es colapsable
  142 |       const toggleButton = page.locator('button[aria-label*="toggle"], .menu-toggle, .sidebar-toggle').first();
  143 |       if (await toggleButton.isVisible()) {
  144 |         await toggleButton.click();
  145 |         await page.waitForTimeout(500);
  146 |         await toggleButton.click(); // Volver a expandir
  147 |       }
  148 |       
  149 |       // Verificar área de contenido principal
  150 |       await expect(page.locator('main, .main-content, .dashboard-content')).toBeVisible();
  151 |     });
  152 |     // PASO 6: Navegar por todas las opciones del menú lateral
  153 |     await test.step('Navegar por todas las opciones del menú lateral', async () => {
  154 |       for (const menuItem of menuItems.admin) {
  155 |         // Buscar el elemento del menú
  156 |         const menuLink = page.locator(`a:has-text("${menuItem.name}"), [href*="${menuItem.href}"], .menu-item:has-text("${menuItem.name}")`).first();
  157 |         
  158 |         if (await menuLink.isVisible()) {
  159 |           await menuLink.click();
  160 |           await page.waitForLoadState('networkidle');
  161 |           
  162 |           // Verificar que navegamos a la página correcta
  163 |           await expect(page).toHaveURL(new RegExp(menuItem.href.replace('/', '\\/') + '|' + menuItem.name.toLowerCase()));
  164 |           
  165 |           // Verificar contenido específico de la página
  166 |           await expect(page.locator(`h1:has-text("${menuItem.name}"), .page-title:has-text("${menuItem.name}"), h2:has-text("${menuItem.name}")`)).toBeVisible({ timeout: 10000 });
  167 |           
  168 |           // Esperar un momento entre navegaciones
  169 |           await page.waitForTimeout(1000);
  170 |         }
  171 |       }
  172 |     });
  173 |     // PASO 7: Verificar funcionalidades específicas por módulo
  174 |     await test.step('Verificar funcionalidades específicas de módulos clave', async () => {
  175 |       
  176 |       // Dashboard principal
  177 |       await page.locator('a:has-text("Dashboard")').first().click();
  178 |       await expect(page.locator('text=/estadísticas/i, .stats, .metrics')).toBeVisible();
  179 |       
```