# Pruebas E2E para el Sistema PQR

Este directorio contiene las pruebas end-to-end (E2E) para el sistema PQR de Armonía, implementadas con Playwright.

## Estructura

- `pqr-enhanced.spec.ts`: Pruebas E2E mejoradas que cubren los flujos completos de usuario
- `pqr.spec.ts`: Pruebas E2E básicas (versión anterior)

## Flujos cubiertos

1. **Flujo completo**: Creación, asignación y resolución de PQR
2. **Flujo de reapertura**: Resolución, reapertura y resolución final
3. **Dashboard de métricas**: Visualización y filtrado de métricas
4. **Notificaciones y recordatorios**: Gestión de notificaciones
5. **Responsividad móvil**: Pruebas en dispositivos móviles

## Ejecución

Para ejecutar las pruebas:

```bash
# Instalar dependencias
npm install

# Instalar navegadores de Playwright
npx playwright install

# Ejecutar todas las pruebas
npx playwright test

# Ejecutar pruebas específicas
npx playwright test pqr-enhanced.spec.ts

# Ejecutar en un navegador específico
npx playwright test --project=chromium

# Ver reporte HTML
npx playwright show-report
```

## Configuración

La configuración de Playwright se encuentra en `playwright.config.ts` en la raíz del proyecto.

## Integración con CI/CD

Las pruebas están configuradas para ejecutarse en entornos de CI/CD. El flujo de trabajo está definido en `.github/workflows/pqr-tests.yml`.
