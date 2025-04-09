# Recomendaciones para Ejecutar Pruebas en Armonía

## Estado Actual de las Pruebas

Hemos actualizado las pruebas para el landing page y el login para que coincidan con la interfaz actual de la aplicación. Sin embargo, hemos identificado algunos problemas que deben resolverse para que todas las pruebas funcionen correctamente.

## Problemas Identificados

1. **Autenticación**: Las credenciales de prueba que estamos utilizando (`admin@armonia.com` con contraseña `password123`) no parecen estar funcionando correctamente. Al intentar autenticarse a través de la API, recibimos un error 401 (No autorizado).

2. **Estructura de la Interfaz**: Algunas partes de la interfaz de usuario pueden haber cambiado respecto a lo que se definió inicialmente en las pruebas. Hemos hecho ajustes en las primeras dos pruebas (landing page y login), pero es necesario revisar y actualizar las pruebas restantes.

## Soluciones Recomendadas

### 1. Verificar y Actualizar Credenciales

Para que las pruebas de inicio de sesión funcionen, es necesario obtener las credenciales correctas:

1. **Opción 1**: Crear nuevos usuarios de prueba con contraseñas conocidas:
   ```sql
   -- Actualizar la contraseña de un usuario existente a una conocida
   UPDATE "armonia"."User" 
   SET password = '$2b$10$wdhTuxtMFEslR8L1SuZgEOAK0STVuuO7K.raMqyrge5mhmi4b/1Lm' 
   WHERE email = 'admin@armonia.com';
   ```

2. **Opción 2**: Solicitar las credenciales correctas al equipo de desarrollo.

3. **Opción 3**: Usar el endpoint de recuperación de contraseña para establecer una nueva contraseña conocida.

### 2. Actualizar las Pruebas Progresivamente

Hemos implementado un enfoque progresivo para actualizar las pruebas:

1. Ya hemos actualizado:
   - 01-landing-page.cy.ts
   - 02-login.cy.ts (con tests de sesiones desactivados temporalmente)

2. Para las pruebas restantes, se recomienda:
   - Activar cada prueba una a una para verificar su funcionamiento
   - Actualizar los selectores y expectativas conforme a la interfaz actual
   - Asegurarse de que las credenciales y permisos son correctos

### 3. Ejecutar Pruebas

Para ejecutar las pruebas, tenemos dos scripts principales:

1. **Ejecución interactiva** (recomendada para desarrollo y depuración):
   ```bash
   ./run-cypress-tests-ui.ps1
   ```

2. **Ejecución automatizada** (para CI/CD):
   ```bash
   ./run-cypress-tests.ps1
   ```

## Próximos Pasos

1. **Resolver el problema de autenticación** estableciendo credenciales válidas.
2. **Activar y validar** las pruebas de login que actualmente están desactivadas.
3. **Actualizar progresivamente** las pruebas restantes:
   - 03-admin-dashboard.cy.ts
   - 04-resident-dashboard.cy.ts
   - 05-reception-dashboard.cy.ts
   - 06-integration-flow.cy.ts

4. **Integrar las pruebas en el flujo de CI/CD** una vez que todas estén funcionando.

## Notas Importantes

- Es posible que necesitemos ajustar los tiempos de espera en algunas pruebas si la aplicación tarda más de lo esperado en responder.
- Algunos elementos de la interfaz pueden cambiar dinámicamente según el estado de la aplicación, por lo que es importante que las pruebas sean robustas.
- Para pruebas que dependen de datos específicos, puede ser necesario recrear esos datos como parte de los prerequisitos de las pruebas.

## Ejemplo de Flujo de Trabajo Recomendado

1. Verificar y actualizar credenciales
2. Ejecutar pruebas de landing page para verificar que funcionan
3. Activar y ajustar pruebas de login
4. Una vez resueltos los problemas de autenticación, actualizar y activar las pruebas restantes
5. Ejecutar la prueba de integración completa para validar todo el flujo
