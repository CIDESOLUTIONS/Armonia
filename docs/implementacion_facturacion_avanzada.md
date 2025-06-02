# Implementación de Facturación Avanzada - Fase 3

## Resumen Ejecutivo

Este documento detalla la implementación de la funcionalidad de Facturación Avanzada, que forma parte de la Fase 3 del proyecto Armonía. Esta funcionalidad permite la creación de plantillas personalizables para facturas, automatización de la facturación mediante reglas configurables y mejoras significativas en el proceso de gestión de pagos.

## Objetivos Alcanzados

1. **Modelos de Datos Avanzados**:
   - Esquema completo para plantillas de facturas personalizables
   - Modelo de reglas de facturación automática con múltiples frecuencias y criterios
   - Estructura para notificaciones y recordatorios de pago

2. **Servicios Backend**:
   - Servicio de plantillas de facturas con soporte para HTML y CSS personalizado
   - Servicio de reglas de facturación con programación automática
   - Servicio de facturas con generación de PDF y envío automático

3. **Componentes Frontend**:
   - Gestor de plantillas con editor visual y previsualización
   - Configurador de reglas de facturación con múltiples criterios
   - Interfaz mejorada para visualización y pago de facturas

4. **Automatización**:
   - Generación automática de facturas según reglas configuradas
   - Cálculo dinámico de montos basado en fórmulas personalizables
   - Notificaciones automáticas de facturas pendientes y vencidas

## Detalles Técnicos

### Modelos de Datos

Se ha implementado un esquema Prisma completo (`schema_invoice_advanced.prisma`) que incluye:

```prisma
model InvoiceTemplate {
  id          Int      @id @default(autoincrement())
  name        String
  description String?
  isDefault   Boolean  @default(false)
  isActive    Boolean  @default(true)
  headerHtml  String   @db.Text
  bodyHtml    String   @db.Text
  footerHtml  String   @db.Text
  cssStyles   String   @db.Text
  logoUrl     String?
  paperSize   String   @default("A4")
  orientation String   @default("PORTRAIT")
  margins     Json     @default("{\"top\":\"20mm\",\"right\":\"20mm\",\"bottom\":\"20mm\",\"left\":\"20mm\"}")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  createdBy   User?    @relation(fields: [createdById], references: [id])
  createdById Int?
  invoices    Invoice[]
}

model InvoiceRule {
  id                Int       @id @default(autoincrement())
  name              String
  description       String?
  isActive          Boolean   @default(true)
  frequency         String    // DAILY, WEEKLY, BIWEEKLY, MONTHLY, BIMONTHLY, QUARTERLY, SEMIANNUAL, ANNUAL, CUSTOM
  dayOfMonth        Int?      // Para frecuencias mensuales o superiores
  dayOfWeek         Int?      // Para frecuencias semanales o quincenales (0-6, domingo a sábado)
  startDate         DateTime
  endDate           DateTime?
  lastRun           DateTime?
  nextRun           DateTime
  feeType           String    // ORDINARY, EXTRAORDINARY, PENALTY, OTHER
  amount            Decimal?  @db.Decimal(12, 2)
  formula           String?   @db.Text
  applyTo           String    // ALL_PROPERTIES, FILTERED, PROPERTY_TYPE, SPECIFIC
  filterCriteria    Json?
  gracePeriod       Int       @default(15) // Días de gracia antes de marcar como vencida
  lateFeePercentage Decimal?  @db.Decimal(5, 2)
  lateFeeAmount     Decimal?  @db.Decimal(12, 2)
  notifyDaysBefore  Int       @default(3)
  notifyOnDueDate   Boolean   @default(true)
  notifyWhenOverdue Boolean   @default(true)
  templateId        Int?
  template          InvoiceTemplate? @relation(fields: [templateId], references: [id])
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  createdBy         User?     @relation(fields: [createdById], references: [id])
  createdById       Int?
  invoices          Invoice[]
}
```

### Servicios Implementados

1. **InvoiceTemplateService**: Gestiona las plantillas de facturas, permitiendo la creación, edición y eliminación de plantillas personalizadas. Incluye funcionalidades para renderizar facturas en HTML y generar PDFs.

2. **InvoiceRuleService**: Administra las reglas de facturación automática, con soporte para diferentes frecuencias, criterios de aplicación y cálculo de montos. Incluye la lógica para programar la ejecución automática de reglas.

3. **InvoiceService**: Proporciona funcionalidades para la gestión completa de facturas, incluyendo creación, actualización, cambio de estado, generación de PDF y envío por correo electrónico.

### Componentes Frontend

1. **InvoiceTemplateManager**: Interfaz completa para la gestión de plantillas, con editor visual de HTML y CSS, previsualización en tiempo real y opciones de configuración avanzadas.

2. **InvoiceRuleManager**: Componente para la configuración de reglas de facturación automática, con soporte para diferentes frecuencias, criterios de filtrado y fórmulas de cálculo.

3. **Componentes adicionales**: Formularios de pago, visualización de historial de transacciones y paneles de administración para la gestión integral de la facturación.

### Pruebas Automatizadas

Se han implementado pruebas unitarias exhaustivas para los servicios principales:

1. **invoiceTemplateService.test.ts**: Pruebas para la gestión de plantillas, renderizado y generación de PDFs.

2. **invoiceRuleService.test.ts**: Pruebas para la creación, actualización y ejecución de reglas de facturación automática.

## Beneficios y Mejoras

1. **Para Administradores**:
   - Reducción significativa del tiempo dedicado a la facturación manual
   - Mayor flexibilidad en la configuración de cuotas y cargos
   - Mejor seguimiento de pagos y morosidad

2. **Para Residentes**:
   - Facturas más claras y profesionales
   - Múltiples opciones de pago integradas
   - Notificaciones oportunas sobre vencimientos

3. **Para el Sistema**:
   - Mayor automatización y reducción de errores humanos
   - Mejor trazabilidad de transacciones
   - Integración completa con el módulo de pagos

## Próximos Pasos

1. **Integración con Cámaras IP**: Siguiente funcionalidad prioritaria de la Fase 3, que permitirá la visualización y gestión de cámaras de seguridad dentro de la plataforma.

2. **Monitoreo y Pruebas Avanzadas**: Implementación de herramientas de monitoreo y pruebas automatizadas para garantizar la estabilidad y rendimiento del sistema.

3. **Mejoras Continuas**: Basadas en retroalimentación de usuarios, se planificarán mejoras adicionales para la funcionalidad de facturación en futuras iteraciones.

## Conclusión

La implementación de la Facturación Avanzada representa un avance significativo en la automatización y profesionalización de los procesos administrativos de la plataforma Armonía. Esta funcionalidad no solo mejora la eficiencia operativa, sino que también eleva la experiencia de usuario tanto para administradores como para residentes.

La arquitectura modular y extensible desarrollada permite futuras ampliaciones y personalizaciones, asegurando que el sistema pueda adaptarse a las necesidades cambiantes de las propiedades horizontales.
