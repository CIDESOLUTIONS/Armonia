# Instrucciones para Ejecutar Pruebas Cypress - Proyecto Armonía

## Problema Actual

Hemos detectado un problema con la instalación de Cypress que está causando errores cuando se intenta ejecutar las pruebas desde scripts de PowerShell a través de la herramienta MCP. El error específico es:

```
TypeError [ERR_INVALID_ARG_TYPE]: The "paths[0]" argument must be of type string. Received undefined
```

## Solución: Ejecutar Pruebas Manualmente

Dado que has mencionado que las pruebas funcionan cuando las ejecutas manualmente, aquí tienes una lista de comandos para ejecutar cada prueba individualmente desde PowerShell:

1. Asegúrate de que la aplicación esté en ejecución:
   ```
   cd C:\Users\meciz\Documents\armonia\frontend
   npm run dev
   ```

2. En otra ventana de PowerShell, ejecuta las siguientes pruebas una por una:

   ```powershell
   # Cambiar al directorio del proyecto
   cd C:\Users\meciz\Documents\armonia

   # Prueba básica
   npx cypress run --spec "cypress/e2e/basic.cy.js" --headless

   # Prueba básica de landing page
   npx cypress run --spec "cypress/e2e/landing-page-basic.cy.js" --headless

   # Prueba completa de landing page
   npx cypress run --spec "cypress/e2e/landing-page-updated.cy.ts" --headless

   # Prueba de login
   npx cypress run --spec "cypress/e2e/02-login-updated.cy.ts" --headless

   # Prueba de panel admin
   npx cypress run --spec "cypress/e2e/03-admin-dashboard-updated.cy.ts" --headless

   # Prueba de panel residente
   npx cypress run --spec "cypress/e2e/04-resident-dashboard-updated.cy.ts" --headless

   # Prueba de panel recepción
   npx cypress run --spec "cypress/e2e/05-reception-dashboard-updated.cy.ts" --headless

   # Prueba de flujo de integración
   npx cypress run --spec "cypress/e2e/06-integration-flow-updated.cy.ts" --headless
   ```

## Usuarios de Prueba

Para las pruebas, se han configurado los siguientes usuarios:

1. **Administrador**:
   - Email: admin@armonia.com
   - Contraseña: Admin123!

2. **Residente**:
   - Email: resident@armonia.com
   - Contraseña: Resident123!

3. **Recepción**:
   - Email: reception@armonia.com
   - Contraseña: Reception123!

## Recopilación de Resultados

Los resultados de las pruebas se guardan en:

- **Videos**: `C:\Users\meciz\Documents\armonia\cypress\videos\`
- **Capturas de pantalla** (en caso de error): `C:\Users\meciz\Documents\armonia\cypress\screenshots\`

## Ejecutar la Interfaz Gráfica de Cypress

Para ejecutar las pruebas con la interfaz gráfica de Cypress:

```powershell
cd C:\Users\meciz\Documents\armonia
npx cypress open
```

Esto abrirá la interfaz gráfica de Cypress donde podrás seleccionar y ejecutar pruebas individuales en un navegador con retroalimentación visual.

## Para Futuros Pasos

Para resolver el problema con la instalación de Cypress, puedes intentar:

1. Desinstalar completamente Cypress:
   ```
   npm uninstall cypress
   npm cache clean --force
   ```

2. Eliminar el directorio de caché de Cypress:
   ```
   rm -r $env:APPDATA\Cypress
   ```

3. Instalar una versión específica de Cypress:
   ```
   npm install cypress@12.17.4 --save-dev
   ```

4. Verificar la instalación:
   ```
   npx cypress verify
   ```

## Recomendación para Paso a Producción

Para el paso a producción del proyecto Armonía, se recomienda una estrategia basada en contenedores Docker con los siguientes componentes:

1. **Contenedores Docker**:
   - Frontend (Next.js)
   - Base de datos (PostgreSQL)

2. **CI/CD Pipeline**:
   - Integración con GitHub Actions
   - Pruebas automáticas en cada PR
   - Despliegue automático a entornos de desarrollo, pruebas y producción

3. **Estrategia de Despliegue**:
   - Despliegue Blue-Green
   - Balanceo de carga
   - Copias de seguridad automáticas

Cuando estés listo para implementar esta estrategia, podemos generar los archivos Docker y configuraciones necesarias.
