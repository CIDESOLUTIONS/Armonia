/**
 * Pruebas E2E para el módulo de Asambleas
 * 
 * Estas pruebas verifican el flujo completo de gestión de asambleas:
 * creación, configuración, votación en tiempo real y consulta de resultados.
 */
import { test, expect, Page, Browser } from '@playwright/test';
// Datos de prueba
const testUsers = {
  admin: {
    email: 'admin.asambleas@test.com',
    password: 'AssemblyAdmin123!',
    name: 'Admin Asambleas'
  },
  resident1: {
    email: 'residente1.asamblea@test.com',
    password: 'Resident1123!',
    name: 'María Resident Test',
    unitNumber: 'Apto 201'
  },
  resident2: {
    email: 'residente2.asamblea@test.com', 
    password: 'Resident2123!',
    name: 'Carlos Resident Test',
    unitNumber: 'Apto 301'
  },
  resident3: {
    email: 'residente3.asamblea@test.com',
    password: 'Resident3123!', 
    name: 'Ana Resident Test',
    unitNumber: 'Apto 401'
  }
};
const testAssembly = {
  title: 'Asamblea Ordinaria - Marzo 2025',
  description: 'Asamblea ordinaria para aprobación de presupuesto y elección de consejo de administración',
  date: '2025-03-15',
  time: '14:00',
  location: 'Salón Social - Conjunto Los Robles',
  quorum: '50', // 50% mínimo
  type: 'ORDINARY'
};
const testProposals = [
  {
    title: 'Aprobación Presupuesto 2025',
    description: 'Aprobar el presupuesto anual para el año 2025 con un incremento del 8%',
    type: 'BUDGET_APPROVAL',
    options: ['A favor', 'En contra', 'Abstención']
  },
  {
    title: 'Renovación Piscina',
    description: 'Autorizar la inversión de $50,000,000 para renovación completa de la piscina',
    type: 'INVESTMENT',
    options: ['Aprobar', 'Rechazar', 'Posponer']
  },
  {
    title: 'Elección Consejo Administración',
    description: 'Elegir 3 miembros del consejo de administración para período 2025-2027',
    type: 'ELECTION',
    options: ['Candidato A - María García', 'Candidato B - Juan López', 'Candidato C - Ana Martínez']
  }
];
test.describe('Asambleas - Gestión y Votación', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(90000); // Timeout extendido para procesos de votación
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });
  test('Flujo completo: Crear asamblea, votar y consultar resultados', async ({ browser }) => {
    // PASO 1: Admin crea la asamblea
    await test.step('Admin crea nueva asamblea', async () => {
      const adminPage = await browser.newPage();
      
      // Login como administrador
      await adminPage.goto('/login');
      await adminPage.fill('input[name="email"]', testUsers.admin.email);
      await adminPage.fill('input[name="password"]', testUsers.admin.password);
      await adminPage.locator('button[type="submit"]').click();
      await adminPage.waitForLoadState('networkidle');
      // Navegar al módulo de asambleas
      const assemblyLink = adminPage.locator('a:has-text("Asambleas"), a:has-text("Assemblies"), [href*="assembl"]').first();
      await expect(assemblyLink).toBeVisible({ timeout: 10000 });
      await assemblyLink.click();
      await adminPage.waitForLoadState('networkidle');
      // Crear nueva asamblea
      const createButton = adminPage.locator('button:has-text("Crear"), button:has-text("Nueva"), button:has-text("Programar")').first();
      await expect(createButton).toBeVisible();
      await createButton.click();
      // Llenar formulario de asamblea
      await adminPage.fill('input[name="title"], #assembly-title', testAssembly.title);
      await adminPage.fill('textarea[name="description"], #assembly-description', testAssembly.description);
      await adminPage.fill('input[name="date"], input[type="date"], #assembly-date', testAssembly.date);
      await adminPage.fill('input[name="time"], input[type="time"], #assembly-time', testAssembly.time);
      await adminPage.fill('input[name="location"], #assembly-location', testAssembly.location);
      await adminPage.fill('input[name="quorum"], #assembly-quorum', testAssembly.quorum);
      // Seleccionar tipo si existe
      const typeSelect = adminPage.locator('select[name="type"], #assembly-type').first();
      if (await typeSelect.isVisible()) {
        await typeSelect.selectOption(testAssembly.type);
      }
      // Guardar asamblea
      const saveButton = adminPage.locator('button[type="submit"], button:has-text("Crear"), button:has-text("Guardar")').first();
      await saveButton.click();
      await expect(adminPage.locator('text=/creada/i, text=/programada/i, text=/éxito/i')).toBeVisible({ timeout: 15000 });
      await adminPage.close();
    });
    // PASO 2: Admin configura propuestas/votaciones
    await test.step('Configurar propuestas para votación', async () => {
      const adminPage = await browser.newPage();
      
      await adminPage.goto('/login');
      await adminPage.fill('input[name="email"]', testUsers.admin.email);
      await adminPage.fill('input[name="password"]', testUsers.admin.password);
      await adminPage.locator('button[type="submit"]').click();
      await adminPage.waitForLoadState('networkidle');
      // Navegar a asambleas y seleccionar la creada
      await adminPage.locator('a:has-text("Asambleas")').first().click();
      await adminPage.waitForLoadState('networkidle');
      
      // Buscar y hacer clic en la asamblea creada
      await adminPage.locator(`text="${testAssembly.title}"`).click();
      await adminPage.waitForLoadState('networkidle');
      // Agregar propuestas
      for (const proposal of testProposals) {
        const addProposalButton = adminPage.locator('button:has-text("Agregar"), button:has-text("Nueva Propuesta")').first();
        if (await addProposalButton.isVisible()) {
          await addProposalButton.click();
          await adminPage.fill('input[name="proposalTitle"], #proposal-title', proposal.title);
          await adminPage.fill('textarea[name="proposalDescription"], #proposal-description', proposal.description);
          
          // Agregar opciones de votación
          for (let i = 0; i < proposal.options.length; i++) {
            const optionInput = adminPage.locator(`input[name="option${i}"], #option-${i}`).first();
            if (await optionInput.isVisible()) {
              await optionInput.fill(proposal.options[i]);
            }
          }
          const saveProposalButton = adminPage.locator('button:has-text("Guardar Propuesta"), button[type="submit"]').first();
          await saveProposalButton.click();
          await adminPage.waitForTimeout(2000);
        }
      }
      await adminPage.close();
    });
    // PASO 3: Iniciar la asamblea
    await test.step('Iniciar asamblea en vivo', async () => {
      const adminPage = await browser.newPage();
      
      await adminPage.goto('/login');
      await adminPage.fill('input[name="email"]', testUsers.admin.email);
      await adminPage.fill('input[name="password"]', testUsers.admin.password);
      await adminPage.locator('button[type="submit"]').click();
      await adminPage.waitForLoadState('networkidle');
      await adminPage.locator('a:has-text("Asambleas")').first().click();
      await adminPage.locator(`text="${testAssembly.title}"`).click();
      // Iniciar asamblea
      const startButton = adminPage.locator('button:has-text("Iniciar"), button:has-text("Comenzar")').first();
      if (await startButton.isVisible()) {
        await startButton.click();
        await expect(adminPage.locator('text=/iniciada/i, text=/activa/i, text=/vivo/i')).toBeVisible();
      }
      await adminPage.close();
    });
    // PASO 4: Residentes se conectan y registran asistencia
    await test.step('Residentes registran asistencia', async () => {
      const residents = [testUsers.resident1, testUsers.resident2, testUsers.resident3];
      const residentPages = [];
      for (const resident of residents) {
        const residentPage = await browser.newPage();
        residentPages.push(residentPage);
        // Login del residente
        await residentPage.goto('/login');
        await residentPage.fill('input[name="email"]', resident.email);
        await residentPage.fill('input[name="password"]', resident.password);
        await residentPage.locator('button[type="submit"]').click();
        await residentPage.waitForLoadState('networkidle');
        // Navegar a asamblea activa
        const assemblyLink = residentPage.locator('a:has-text("Asamblea"), [href*="assembly"]').first();
        if (await assemblyLink.isVisible()) {
          await assemblyLink.click();
        } else {
          await residentPage.goto('/assembly/live');
        }
        // Registrar asistencia
        const attendButton = residentPage.locator('button:has-text("Confirmar Asistencia"), button:has-text("Presente")').first();
        if (await attendButton.isVisible()) {
          await attendButton.click();
          await expect(residentPage.locator('text=/asistencia.*registrada/i, text=/presente/i')).toBeVisible();
        }
      }
      // Verificar que se alcanzó el quórum
      const adminPage = await browser.newPage();
      await adminPage.goto('/login');
      await adminPage.fill('input[name="email"]', testUsers.admin.email);
      await adminPage.fill('input[name="password"]', testUsers.admin.password);
      await adminPage.locator('button[type="submit"]').click();
      await adminPage.waitForLoadState('networkidle');
      
      await adminPage.goto('/assembly/live');
      await expect(adminPage.locator('text=/quórum/i, text=/alcanzado/i')).toBeVisible({ timeout: 10000 });
      // Cerrar páginas de residentes temporalmente
      for (const page of residentPages) {
        await page.close();
      }
      await adminPage.close();
    });
    // PASO 5: Votación en tiempo real
    await test.step('Proceso de votación en tiempo real', async () => {
      const residents = [testUsers.resident1, testUsers.resident2, testUsers.resident3];
      
      // Admin abre votación para primera propuesta
      const adminPage = await browser.newPage();
      await adminPage.goto('/login');
      await adminPage.fill('input[name="email"]', testUsers.admin.email);
      await adminPage.fill('input[name="password"]', testUsers.admin.password);
      await adminPage.locator('button[type="submit"]').click();
      await adminPage.waitForLoadState('networkidle');
      
      await adminPage.goto('/assembly/live');
      
      // Abrir votación para primera propuesta
      const openVotingButton = adminPage.locator('button:has-text("Abrir Votación"), button:has-text("Iniciar Voto")').first();
      if (await openVotingButton.isVisible()) {
        await openVotingButton.click();
        await expect(adminPage.locator('text=/votación.*abierta/i, text=/pueden.*votar/i')).toBeVisible();
      }
      // Residentes votan
      const residentPages = [];
      const votes = ['A favor', 'A favor', 'En contra']; // Votos de cada residente
      for (let i = 0; i < residents.length; i++) {
        const residentPage = await browser.newPage();
        residentPages.push(residentPage);
        
        await residentPage.goto('/login');
        await residentPage.fill('input[name="email"]', residents[i].email);
        await residentPage.fill('input[name="password"]', residents[i].password);
        await residentPage.locator('button[type="submit"]').click();
        await residentPage.waitForLoadState('networkidle');
        
        await residentPage.goto('/assembly/live');
        
        // Emitir voto
        const voteOption = residentPage.locator(`button:has-text("${votes[i]}"), input[value="${votes[i]}"]`).first();
        if (await voteOption.isVisible()) {
          await voteOption.click();
          
          const confirmVoteButton = residentPage.locator('button:has-text("Confirmar Voto"), button[type="submit"]').first();
          if (await confirmVoteButton.isVisible()) {
            await confirmVoteButton.click();
          }
          
          await expect(residentPage.locator('text=/voto.*registrado/i, text=/gracias/i')).toBeVisible();
        }
      }
      // Admin cierra votación
      const closeVotingButton = adminPage.locator('button:has-text("Cerrar Votación"), button:has-text("Finalizar")').first();
      if (await closeVotingButton.isVisible()) {
        await closeVotingButton.click();
        await expect(adminPage.locator('text=/votación.*cerrada/i, text=/resultados/i')).toBeVisible();
      }
      // Cerrar páginas
      for (const page of residentPages) {
        await page.close();
      }
      await adminPage.close();
    });
    // PASO 6: Consultar resultados
    await test.step('Consultar resultados de votación', async () => {
      const adminPage = await browser.newPage();
      
      await adminPage.goto('/login');
      await adminPage.fill('input[name="email"]', testUsers.admin.email);
      await adminPage.fill('input[name="password"]', testUsers.admin.password);
      await adminPage.locator('button[type="submit"]').click();
      await adminPage.waitForLoadState('networkidle');
      
      await adminPage.goto('/assembly/live');
      
      // Verificar resultados mostrados
      await expect(adminPage.locator('text="A favor": 2, text="En contra": 1')).toBeVisible();
      await expect(adminPage.locator('text=/aprobada/i, text=/ganadora/i')).toBeVisible();
      
      // Generar acta final
      const generateActaButton = adminPage.locator('button:has-text("Generar Acta"), button:has-text("Finalizar")').first();
      if (await generateActaButton.isVisible()) {
        await generateActaButton.click();
        await expect(adminPage.locator('text=/acta.*generada/i, text=/asamblea.*finalizada/i')).toBeVisible();
      }
      await adminPage.close();
    });
    // PASO 7: Verificar acceso a resultados desde cualquier usuario
    await test.step('Verificar acceso a resultados históricos', async () => {
      const residentPage = await browser.newPage();
      
      await residentPage.goto('/login');
      await residentPage.fill('input[name="email"]', testUsers.resident1.email);
      await residentPage.fill('input[name="password"]', testUsers.resident1.password);
      await residentPage.locator('button[type="submit"]').click();
      await residentPage.waitForLoadState('networkidle');
      
      // Navegar a histórico de asambleas
      const historyLink = residentPage.locator('a:has-text("Asambleas"), a:has-text("Histórico")').first();
      if (await historyLink.isVisible()) {
        await historyLink.click();
        
        // Verificar que aparece la asamblea finalizada
        await expect(residentPage.locator(`text="${testAssembly.title}"`)).toBeVisible();
        await expect(residentPage.locator('text=/finalizada/i, text=/completada/i')).toBeVisible();
        
        // Ver detalles de resultados
        await residentPage.locator(`text="${testAssembly.title}"`).click();
        await expect(residentPage.locator('text=/resultados/i, text=/acta/i')).toBeVisible();
      }
      await residentPage.close();
    });
  });
  test('Validación de quórum insuficiente', async ({ page }) => {
    
    // Login como admin
    await page.goto('/login');
    await page.fill('input[name="email"]', testUsers.admin.email);
    await page.fill('input[name="password"]', testUsers.admin.password);
    await page.locator('button[type="submit"]').click();
    await page.waitForLoadState('networkidle');
    // Intentar iniciar asamblea sin suficientes asistentes
    await page.goto('/assembly/live');
    
    const startVotingButton = page.locator('button:has-text("Iniciar Votación")').first();
    if (await startVotingButton.isVisible()) {
      await startVotingButton.click();
      
      // Verificar mensaje de quórum insuficiente
      await expect(page.locator('text=/quórum.*insuficiente/i, text=/no.*alcanzado/i')).toBeVisible();
    }
  });
  test('Prevención de voto múltiple', async ({ browser }) => {
    
    // Este test verifica que un residente no pueda votar múltiples veces
    const residentPage = await browser.newPage();
    
    await residentPage.goto('/login');
    await residentPage.fill('input[name="email"]', testUsers.resident1.email);
    await residentPage.fill('input[name="password"]', testUsers.resident1.password);
    await residentPage.locator('button[type="submit"]').click();
    await residentPage.waitForLoadState('networkidle');
    
    await residentPage.goto('/assembly/live');
    
    // Intentar votar por segunda vez
    const voteButton = residentPage.locator('button:has-text("A favor")').first();
    if (await voteButton.isVisible()) {
      await voteButton.click();
      
      // Verificar que no se puede votar nuevamente
      await expect(residentPage.locator('text=/ya.*votó/i, text=/voto.*registrado/i')).toBeVisible();
      await expect(voteButton).toBeDisabled();
    }
    await residentPage.close();
  });
});