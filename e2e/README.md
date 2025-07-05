## 🧪 Suite de Pruebas E2E - Armonía

Pruebas E2E para el Sistema Armonía
Este directorio contiene las pruebas end-to-end (E2E) para todos los módulos críticos de Armonía, implementadas con Playwright.

Estructura
Pruebas Principales:
complete-navigation.spec.ts: Navegación completa desde landing page a dashboard 
inventory.spec.ts: Gestión integral de inventario del conjunto 
onboarding.spec.ts: Registro de conjunto residencial y administrador
finances.spec.ts: Facturación, pagos y estado de cuenta
assemblies.spec.ts: Asambleas con votación en tiempo real
security.spec.ts: Minutas digitales y control de seguridad
reservations.spec.ts: Reservas de áreas comunes con pagos
pqr-enhanced.spec.ts: Pruebas E2E mejoradas del sistema PQR

Flujos Críticos Cubiertos
1. Navegación Completa del Sistema
Landing page y elementos principales
Selector de portales (Administrador, Residente, Recepción)
Login completo para cada tipo de usuario
Navegación del dashboard con menú lateral colapsable
Verificación de todas las funcionalidades del menú
Accesibilidad y UX del menú lateral
Logout y cambio de portales
2. Gestión Integral de Inventario
Actualización de información del conjunto residencial
Gestión completa de residentes (propietarios y arrendatarios)
Administración de propiedades y unidades
Registro de mascotas de residentes
Registro de vehículos y parqueaderos
Configuración de servicios comunes
Búsquedas y filtros avanzados
Exportación de reportes de inventario
3. Onboarding Completo
Registro de nuevo conjunto residencial
Creación de cuenta de administrador
Configuración inicial del sistema
Acceso al dashboard administrativo
4. Gestión Financiera
Creación de facturas por administrador
Procesamiento de pagos por residentes
Verificación de estados de cuenta
Reportes financieros
5. Asambleas y Votación
Programación de asambleas
Registro de asistencia en tiempo real
Votación simultánea de múltiples usuarios
Consulta de resultados y generación de actas
6. Seguridad y Minutas
Registro de minutas por guardias
Control de visitantes (entrada/salida)
Gestión de incidentes y emergencias
Consulta de reportes por administradores
7. Reservas de Áreas Comunes
Consulta de disponibilidad
Creación de reservas
Procesamiento de pagos
Gestión de calendario de reservas
8. Sistema PQR 
Creación, asignación y resolución de PQR
Dashboard de métricas y notificaciones
Flujos de reapertura y seguimiento
Ejecución
Para ejecutar las pruebas:

bash
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
Configuración
La configuración de Playwright se encuentra en playwright.config.ts en la raíz del proyecto.

Integración con CI/CD
Las pruebas están configuradas para ejecutarse en entornos de CI/CD. El flujo de trabajo está definido en .github/workflows/pqr-tests.yml

### Pruebas Implementadas

#### 1. **complete-navigation.spec.ts** - Navegación Completa del Sistema
- ✅ Landing page y elementos principales
- ✅ Selector de portales (Administrador, Residente, Recepción)
- ✅ Login completo para cada tipo de usuario
- ✅ Navegación del dashboard con menú lateral colapsable
- ✅ Verificación de todas las funcionalidades del menú
- ✅ Accesibilidad y UX del menú lateral
- ✅ Logout y cambio de portales

#### 2. **inventory.spec.ts** - Gestión Integral de Inventario
- ✅ Actualización de información del conjunto residencial
- ✅ Gestión completa de residentes (propietarios y arrendatarios)
- ✅ Administración de propiedades y unidades
- ✅ Registro de mascotas de residentes
- ✅ Registro de vehículos y parqueaderos
- ✅ Configuración de servicios comunes
- ✅ Búsquedas y filtros avanzados
- ✅ Exportación de reportes de inventario

#### 3. **onboarding.spec.ts** - Registro de Conjunto Residencial
- ✅ Registro completo de nuevo conjunto
- ✅ Configuración inicial de administrador
- ✅ Verificación de email y activación
- ✅ Configuración básica del sistema

#### 4. **finances.spec.ts** - Gestión Financiera Completa
- ✅ Configuración de cuotas de administración
- ✅ Generación automática de facturas
- ✅ Procesamiento de pagos
- ✅ Estados de cuenta de residentes
- ✅ Reportes financieros

#### 5. **assemblies.spec.ts** - Asambleas con Votación en Tiempo Real
- ✅ Creación y convocatoria de asambleas
- ✅ Registro de asistencia
- ✅ Votación en tiempo real multi-usuario
- ✅ Generación de actas digitales

#### 6. **security.spec.ts** - Minutas Digitales y Control de Acceso
- ✅ Generación de minutas digitales
- ✅ Control de acceso de visitantes
- ✅ Registro de incidentes de seguridad
- ✅ Reportes de seguridad

#### 7. **reservations.spec.ts** - Reservas con Pagos Integrados
- ✅ Reserva de áreas comunes
- ✅ Pagos integrados para reservas
- ✅ Confirmación automática
- ✅ Calendario de disponibilidad

#### 8. **pqr-enhanced.spec.ts** - Gestión Avanzada de PQR
- ✅ Flujos complejos de PQR
- ✅ Escalamiento automático
- ✅ Métricas avanzadas