# Documentación de Módulos Faltantes - Proyecto Armonía

## Resumen

Este documento registra los módulos y servicios faltantes que están bloqueando la ejecución completa de las pruebas unitarias en el proyecto Armonía. Estos módulos deberán ser implementados o mockeados como parte de la Fase 4 del desarrollo.

## Módulos Faltantes Críticos

### Servicios de Facturación
- `src/lib/services/invoice-template-service.js` - Servicio para gestión de plantillas de facturas
- `src/lib/services/invoice-rule-service.js` - Servicio para gestión de reglas de facturación

### Servicios de Asambleas
- `src/services/assembly-advanced-service.js` - Servicio avanzado para gestión de asambleas

### Servicios de Comunicación
- `src/lib/communications/email-service.js` - Servicio para envío de correos electrónicos
- `src/lib/utils/encryption.js` - Utilidad para encriptación/desencriptación de datos
- `src/lib/services/notification-service.js` - Servicio para gestión de notificaciones

## Problemas de Configuración

### Pruebas de Autenticación
Las pruebas de autenticación (`auth.test.js` y `auth.test.ts`) están generando errores de Jest worker que exceden el límite de reintentos. Esto puede deberse a:
- Incompatibilidades entre ESM y CommonJS
- Problemas con la biblioteca `jose` para JWT
- Conflictos con la configuración de Next.js

### Pruebas E2E con Playwright
Las pruebas E2E con Playwright deben ejecutarse de forma independiente con `npx playwright test` y no a través de Jest. Se han excluido temporalmente de la ejecución de Jest mediante `testPathIgnorePatterns`.

## Impacto en la Cobertura

Actualmente, el proyecto tiene:
- 21 suites de pruebas totales
- 3 suites pasando correctamente (14%)
- 18 suites fallando (86%)
- 93 pruebas individuales totales
- 49 pruebas pasando correctamente (53%)
- 44 pruebas fallando (47%)

## Recomendaciones para la Fase 4

1. **Priorizar la implementación de los módulos faltantes críticos**, especialmente aquellos relacionados con facturación y comunicaciones.

2. **Refactorizar la configuración de pruebas** para separar claramente:
   - Pruebas unitarias (Jest)
   - Pruebas de integración (Jest)
   - Pruebas E2E (Playwright)

3. **Resolver los problemas de compatibilidad ESM/CommonJS** mediante:
   - Estandarización de la sintaxis de módulos en todo el proyecto
   - Configuración adecuada de Babel/ts-jest
   - Uso consistente de imports/requires

4. **Implementar una estrategia de mocks más robusta** para dependencias externas y servicios internos.

5. **Establecer un pipeline de CI/CD** que valide tanto lint como pruebas unitarias y E2E de forma separada.

## Conclusión

La estabilización de las pruebas es fundamental para garantizar la calidad del código y facilitar el desarrollo futuro. Abordar estos problemas al inicio de la Fase 4 permitirá un desarrollo más ágil y confiable para el resto del proyecto.
