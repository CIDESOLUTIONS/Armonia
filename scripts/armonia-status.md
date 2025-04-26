# Proyecto Armonía - Informe de Estado

*Generado el: 26/4/2025, 6:29:07 p. m.*

## Información General

- **Proyecto:** Armonía
- **Analizado:** 26/4/2025, 6:29:00 p. m.
- **Ubicación:** `C:\Users\meciz\Documents\armonia`
- **Repositorio:** https://github.com/CIDESOLUTIONS/Armonia.git

## Estado Actual del Proyecto

| Componente | Estado | Observaciones |
|------------|--------|---------------|
| Frontend | ✅ | Estructura correcta |
| Backend | ✅ | Base de datos operativa |
| Entorno | ✅ | Variables configuradas |
| Git | ✅ | Repositorio configurado |

## Recomendaciones

1. 🟠 **[MEDIA]** Hay cambios sin commitear en el repositorio Git.

## Estructura del Proyecto

El proyecto tiene la siguiente estructura base. Para ver más detalles, consulta el archivo de análisis completo.

```
📄 .env
📁 .git/ [excluido]
📄 .gitignore
📁 .vscode/
  📄 [JSON] settings.json
📄 [JS] combine-landing.js
📁 cypress/
  📁 config/
    📄 [JS] basic-test.config.js
    📄 [TS] test-users.ts
  📄 [TS] cypress.config.ts
  📁 downloads/
  📁 e2e/
    📄 [JS] 01-landing-page.cy.js
    📄 [JS] 02-login.cy.js
    📄 [JS] 02-register-complex.cy.js
    📄 [JS] 02b-register-complex-integration.cy.js
    📄 [JS] 03-admin-dashboard.cy.js
    📄 [JS] 04-admin-inventory.cy.js
    📄 [JS] 05-admin-assemblies.cy.js
    📄 [JS] 06-admin-financial.cy.js
    📄 [JS] 07-admin-pqr.cy.js
    📄 [JS] 08-admin-config.cy.js
    📄 [JS] 09-resident-dashboard.cy.js
    📄 [JS] 10-resident-payments.cy.js
    📄 [JS] 11-resident-reservations.cy.js
    📄 [JS] 12-resident-assemblies.cy.js
    📄 [JS] 13-resident-pqr.cy.js
    📄 [JS] basic.cy.js
    📁 old/
      ...
  📁 fixtures/
    📄 [JSON] example.json
    📄 [JSON] sample-data.json
    📄 testDocument.txt
    📄 testImage.txt
  📁 logs/
  📁 results/
    📄 [JSON] 02-register-complex.cy-result.json
    📁 landing-page-enhanced-screenshots/
    📁 landing-page-enhanced.cy-screenshots/
    📁 landing-page-screenshots/
    📁 landing-page-updated.cy-screenshots/
  📄 [JS] run-all-tests.js
  📄 [JS] run-test.js
  📄 [JS] run-tests.js
  📁 screenshots/
    📁 01-landing-page.cy.js/
  📁 support/
    📄 [JS] commands.js
    📄 [TS] commands.ts
    📄 [JS] e2e.js
  📄 [JSON] tsconfig.json
  📁 videos/
📄 [JS] cypress-basic-config.js
📄 [JS] cypress.config.js
📄 [SQL] db_initialize.sql
📄 [SQL] db_test_data.sql
📄 [SQL] db_test_data_part2.sql
📁 frontend/
  📄 .env
  📄 .env.production
  📄 [JSON] .eslintrc.json
  📁 .git/ [excluido]
  📄 .gitattributes
  📁 .github/ [excluido]
  📄 .gitignore
  📄 [JS] analyze-project.js
  📁 code/
  📄 [JSON] components.json
  📄 [JS] createTestUsers.js
  📄 [TS] cypress.config.ts
  📄 deploy.sh
  📄 eslint.config.mjs
  📁 jest/
    📄 [JS] auth.test.js
  📄 [JS] jest.config.js
  📄 [JS] jest.setup.js
  📄 [TS] middleware.ts
  📄 [TS] next-env.d.ts
  📄 [JS] next.config.js
  📁 node_modules/ [excluido]
  📄 [JSON] package-lock.json
  📄 [JSON] package.json
  📄 [JS] postcss.config.js
  📁 prisma/
    📁 migrations/
      ...
    📄 schema.prisma
    📄 [JS] seed.js
    📄 [TS] seed.ts
  📁 public/
    📁 images/
    📁 videos/
  📝 README.md
  📁 scripts/
    📄 [TS] create-tenant.ts
    📄 [JS] create-test-users.js
    📄 [TS] test-manual.ts
    📄 [JS] verify-api.js
  📄 [JS] seedUsers.js
  📁 src/
    📁 app/
      ...
    📁 components/
      ...
    📁 constants/
      ...
    📁 context/
      ...
    📁 hooks/
      ...
    📁 interfaces/
      ...
    📁 lib/
      ...
    📄 [TS] middleware.ts
    📁 models/
      ...
    📁 services/
      ...
    📁 types/
      ...
    📁 utils/
      ...
    📁 validators/
      ...
  📄 [TS] tailwind.config.ts
  📄 [JSON] tsconfig.json
  📄 tsconfig.tsbuildinfo
  📄 update_repo.sh
  📁 __tests__/
    📁 pqr/
      ...
📝 INSTRUCCIONES_PRUEBAS.md
📁 node_modules/ [excluido]
📄 [JSON] package-lock.json
📄 [JSON] package.json
📝 README.md
📁 scripts/
  📄 actualizar-y-ejecutar.ps1
  📄 analizar-armonia.ps1
  📄 [JS] analyze-armonia.js
  📄 [JSON] armonia-config.json
  📄 auto-run-basic-test.ps1
  📁 bats/
    📄 ejecutar-cypress-auto.bat
    📄 ejecutar-cypress-headless.bat
    📄 ejecutar-prueba-headless.bat
    📄 ejecutar-test-cypress.bat
  📄 check-credentials.ps1
  📄 clean-reinstall-cypress.ps1
  📄 clean-test-files.ps1
  📄 configurar-tarea-programada.ps1
  📄 create-test-users.ps1
  📄 [SQL] create_plan_table.sql
  📄 cypress-diagnosis.ps1
  📄 cypress-headless-automation.ps1
  📁 db/
    📄 [JS] setup-payment-tables.js
  📄 ejecutar-primera-prueba.ps1
  📄 ejecutar-prueba-automatica.ps1
  📄 ejecutar-prueba-simple.ps1
  📄 ejecutar-pruebas.ps1
  📄 ejecutar-test-landing.ps1
  📄 ejecutar-todas-pruebas.ps1
  📄 execute-cypress-tests.ps1
  📄 execute-single-test.ps1
  📄 fix-test-credentials.ps1
  📄 generate-report.ps1
  📄 initialize-database.ps1
  📄 install-dependencies.ps1
  📝 INSTRUCCIONES_ANALISIS_ARMONIA.md
  📝 INSTRUCCIONES_NUEVO_CHAT.md
  📝 INSTRUCCIONES_RAPIDAS.md
  📄 interactive-test.ps1
  📄 [JS] process-armonia-analysis.js
  📄 production-deployment.ps1
  📄 programar-tareas-cypress.ps1
  📄 puppeteer-test-landing.ps1
  📄 quick-fix-register.ps1
  📄 regenerate-prisma.ps1
  📄 reinstall-cypress-full.ps1
  📄 reinstall-cypress.ps1
  📄 reset-nextjs.ps1
  📄 run-all-tests.ps1
  📄 run-basic-landing-test.ps1
  📄 run-basic-test-auto.ps1
  📄 run-basic-test-debug.ps1
  📄 run-basic-test.bat
  📄 run-basic-test.ps1
  📄 run-complete-tests.ps1
  📄 run-cypress-headless.ps1
  📄 run-cypress-improved.ps1
  📄 run-cypress-test-auto.ps1
  📄 run-cypress-test.ps1
  📄 run-cypress-tests-manual.ps1
  📄 run-cypress-tests-ui.ps1
  📄 run-cypress-tests.ps1
  📄 run-landing-page-test.ps1
  📄 run-landing-test.ps1
  📄 run-manual-tests.ps1
  📄 run-sequential-tests.ps1
  📄 run-tests.ps1
  📄 setup-cypress-and-deploy.ps1
  📁 sql/
    📄 [SQL] create_payment_tables.sql
    📄 [SQL] initialize_payment_data.sql
  📄 sync-payment-system.ps1
  📄 sync-with-github.ps1
  📄 test-and-deploy.ps1
  📄 test-basic.ps1
  📄 test-landing-enhanced.ps1
  📄 test-landing-page-debug.ps1
  📄 test-landing-page-fixed.ps1
  📄 test-landing-page-only.ps1
  📄 test-landing-page.ps1
  📄 test-login.ps1
  📝 test-plan.md
  📄 update-payment-system.ps1
  📄 validate-initial-tests.ps1
  📄 verify-landing-page.ps1
```

## Tecnologías Principales

| Tecnología | Versión |
|------------|--------|
| prisma | ^6.4.0 |
| @prisma/client | ^6.5.0 |
| typescript | ^5.7.3 |

## Información de Base de Datos

### Esquema Principal (armonia)

Tablas encontradas: 4

| Tabla | Columnas | Registros |
|-------|----------|----------|
| ResidentialComplex | 16 | 5 |
| User | 9 | 11 |
| Prospect | 9 | 2 |
| PaymentTransaction | 13 | 4 |

### Esquemas Multitenant

Se encontraron 5 esquemas tenant.

| Esquema | Tablas | Estado |
|---------|--------|--------|
| tenant_cj0005 | 15 | ✅ Activo |
| tenant_cj0004 | 15 | ✅ Activo |
| tenant_cj0003 | 15 | ✅ Activo |
| tenant_cj0002 | 15 | ✅ Activo |
| tenant_cj0001 | 19 | ✅ Activo |

## Scripts Disponibles

El proyecto cuenta con 72 scripts para distintas tareas.

### Scripts de Base de Datos

- `create_plan_table.sql`
- `initialize-database.ps1`

### Scripts de Pruebas

- `auto-run-basic-test.ps1`
- `clean-reinstall-cypress.ps1`
- `clean-test-files.ps1`
- `create-test-users.ps1`
- `cypress-diagnosis.ps1`
- `cypress-headless-automation.ps1`
- `ejecutar-test-landing.ps1`
- `execute-cypress-tests.ps1`
- `execute-single-test.ps1`
- `fix-test-credentials.ps1`
- `interactive-test.ps1`
- `programar-tareas-cypress.ps1`
- `puppeteer-test-landing.ps1`
- `reinstall-cypress-full.ps1`
- `reinstall-cypress.ps1`
- `run-all-tests.ps1`
- `run-basic-landing-test.ps1`
- `run-basic-test-auto.ps1`
- `run-basic-test-debug.ps1`
- `run-basic-test.bat`
- `run-basic-test.ps1`
- `run-complete-tests.ps1`
- `run-cypress-headless.ps1`
- `run-cypress-improved.ps1`
- `run-cypress-test-auto.ps1`
- `run-cypress-test.ps1`
- `run-cypress-tests-manual.ps1`
- `run-cypress-tests-ui.ps1`
- `run-cypress-tests.ps1`
- `run-landing-page-test.ps1`
- `run-landing-test.ps1`
- `run-manual-tests.ps1`
- `run-sequential-tests.ps1`
- `run-tests.ps1`
- `setup-cypress-and-deploy.ps1`
- `test-and-deploy.ps1`
- `test-basic.ps1`
- `test-landing-enhanced.ps1`
- `test-landing-page-debug.ps1`
- `test-landing-page-fixed.ps1`
- `test-landing-page-only.ps1`
- `test-landing-page.ps1`
- `test-login.ps1`
- `test-plan.md`
- `validate-initial-tests.ps1`

### Scripts de Despliegue

- `production-deployment.ps1`

## Instrucciones para Nuevos Chats con Claude

Para continuar trabajando con Claude en un nuevo chat y mantener el contexto del proyecto:

1. Inicia un nuevo chat con Claude
2. Sube el archivo `armonia-analysis.json` como adjunto
3. Escribe: "Este es el archivo de análisis del proyecto Armonía. Por favor, revisa su contenido para entender el contexto y el estado actual del proyecto."
4. Continúa con tus preguntas específicas sobre el proyecto

---

*Este informe fue generado automáticamente para el proyecto Armonía.*
