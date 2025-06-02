# Análisis para Integración de Pagos - Fase 2 del Proyecto Armonía

## Resumen Ejecutivo

Este documento presenta el análisis y plan de implementación para la Integración de Pagos, identificada como la segunda funcionalidad prioritaria de la Fase 2 según el plan integral de desarrollo del proyecto Armonía. Esta funcionalidad permitirá a los residentes realizar pagos en línea de cuotas de administración y otros servicios, complementando el sistema financiero ya implementado.

## Objetivos

1. Implementar una integración robusta con múltiples pasarelas de pago
2. Proporcionar una experiencia de usuario fluida y segura para el proceso de pago
3. Garantizar la conciliación automática de pagos recibidos
4. Mantener un registro completo de transacciones para auditoría
5. Cumplir con estándares de seguridad para procesamiento de pagos

## Análisis de Pasarelas de Pago

### Criterios de Selección

Para seleccionar las pasarelas de pago más adecuadas, se han considerado los siguientes criterios:

1. **Disponibilidad en Colombia**: Soporte para el mercado local
2. **Comisiones**: Estructura de costos competitiva
3. **Métodos de pago**: Variedad de opciones (tarjetas, PSE, efectivo)
4. **Facilidad de integración**: Documentación y SDKs disponibles
5. **Seguridad**: Cumplimiento con estándares PCI-DSS
6. **Soporte**: Nivel de atención al cliente
7. **Escalabilidad**: Capacidad para manejar volumen creciente

### Pasarelas Recomendadas

Basado en los criterios anteriores, se recomienda integrar las siguientes pasarelas:

#### 1. PayU Latam

**Fortalezas**:
- Amplia presencia en Colombia y Latinoamérica
- Soporte para múltiples métodos de pago (tarjetas, PSE, efectivo)
- API bien documentada y SDK para JavaScript
- Tokenización de tarjetas para pagos recurrentes
- Panel de administración robusto

**Consideraciones**:
- Comisiones ligeramente más altas que competidores
- Proceso de onboarding puede ser extenso

#### 2. Wompi

**Fortalezas**:
- Desarrollada por Bancolombia, alta confiabilidad
- Comisiones competitivas
- Proceso de integración simplificado
- Buena experiencia de usuario
- Soporte para pagos con QR

**Consideraciones**:
- Menos métodos de pago que PayU
- Menos presencia internacional

## Arquitectura Propuesta

### Componentes Principales

1. **Módulo de Configuración de Pasarelas**:
   - Gestión de credenciales por ambiente
   - Configuración de métodos de pago habilitados
   - Personalización de experiencia por pasarela

2. **Servicio de Procesamiento de Pagos**:
   - Interfaz unificada para múltiples pasarelas
   - Manejo de intentos de pago
   - Procesamiento de callbacks y webhooks
   - Conciliación automática

3. **Registro de Transacciones**:
   - Historial completo de intentos de pago
   - Estados detallados de transacciones
   - Trazabilidad para auditoría

4. **Interfaz de Usuario**:
   - Formularios de pago optimizados
   - Selección inteligente de método de pago
   - Confirmaciones y recibos

### Diagrama de Flujo

```
Usuario → Selección de Factura → Selección de Método de Pago → Procesamiento → Confirmación → Actualización de Estado → Generación de Recibo
```

### Integración con Componentes Existentes

- **Sistema Financiero**: Actualización automática de estados de cuenta
- **Sistema de Notificaciones**: Alertas sobre pagos exitosos o fallidos
- **Generación de PDFs**: Creación de recibos de pago
- **Registro de Actividad**: Auditoría de transacciones

## Modelos de Datos Requeridos

### PaymentGateway

```prisma
model PaymentGateway {
  id                Int               @id @default(autoincrement())
  name              String            // Nombre de la pasarela (PayU, Wompi, etc.)
  isActive          Boolean           @default(true)
  apiKey            String?           // Clave API (encriptada)
  apiSecret         String?           // Secreto API (encriptado)
  merchantId        String?           // ID de comercio
  accountId         String?           // ID de cuenta (si aplica)
  testMode          Boolean           @default(false)
  supportedMethods  String[]          // Métodos de pago soportados
  webhookUrl        String?           // URL para webhooks
  webhookSecret     String?           // Secreto para validar webhooks
  config            Json?             // Configuración adicional específica
  transactions      Transaction[]     // Transacciones asociadas
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  
  @@schema("tenant")
}
```

### PaymentMethod

```prisma
model PaymentMethod {
  id                Int               @id @default(autoincrement())
  name              String            // Nombre del método (Tarjeta, PSE, etc.)
  code              String            // Código único
  isActive          Boolean           @default(true)
  icon              String?           // Icono para UI
  gatewayMethods    Json              // Mapeo a métodos específicos de pasarelas
  surcharge         Float             @default(0) // Recargo adicional (%)
  minAmount         Float?            // Monto mínimo
  maxAmount         Float?            // Monto máximo
  instructions      String?           // Instrucciones especiales
  transactions      Transaction[]     // Transacciones asociadas
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  
  @@schema("tenant")
}
```

### Transaction

```prisma
model Transaction {
  id                String            @id @default(uuid())
  userId            Int               // Usuario que realiza el pago
  invoiceId         Int?              // Factura asociada (opcional)
  amount            Float             // Monto de la transacción
  currency          String            @default("COP")
  description       String            // Descripción del pago
  status            TransactionStatus // Estado de la transacción
  gatewayId         Int               // Pasarela utilizada
  gateway           PaymentGateway    @relation(fields: [gatewayId], references: [id])
  methodId          Int               // Método de pago utilizado
  method            PaymentMethod     @relation(fields: [methodId], references: [id])
  gatewayReference  String?           // Referencia en la pasarela
  gatewayResponse   Json?             // Respuesta completa de la pasarela
  paymentUrl        String?           // URL de pago (si aplica)
  paymentData       Json?             // Datos adicionales del pago
  metadata          Json?             // Metadatos adicionales
  errorCode         String?           // Código de error (si aplica)
  errorMessage      String?           // Mensaje de error (si aplica)
  receiptId         String?           // ID del recibo generado
  receiptUrl        String?           // URL del recibo
  ipAddress         String?           // IP del pagador
  userAgent         String?           // User-Agent del pagador
  attempts          Int               @default(1) // Número de intentos
  expiresAt         DateTime?         // Fecha de expiración
  completedAt       DateTime?         // Fecha de completado
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  
  @@index([userId])
  @@index([invoiceId])
  @@index([status])
  @@index([gatewayId])
  @@index([createdAt])
  @@schema("tenant")
}
```

### PaymentToken

```prisma
model PaymentToken {
  id                String            @id @default(uuid())
  userId            Int               // Usuario propietario
  gatewayId         Int               // Pasarela asociada
  gateway           PaymentGateway    @relation(fields: [gatewayId], references: [id])
  type              String            // Tipo de token (tarjeta, cuenta)
  token             String            // Token encriptado
  lastFour          String?           // Últimos 4 dígitos (tarjetas)
  brand             String?           // Marca (Visa, Mastercard, etc.)
  expiryMonth       Int?              // Mes de expiración
  expiryYear        Int?              // Año de expiración
  holderName        String?           // Nombre del titular
  isDefault         Boolean           @default(false)
  isActive          Boolean           @default(true)
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  
  @@index([userId])
  @@index([gatewayId])
  @@schema("tenant")
}
```

### Enumeraciones

```prisma
enum TransactionStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
  REFUNDED
  CANCELLED
  EXPIRED
}
```

## Plan de Implementación

### Fase 1: Configuración Base (3 días)

1. Definición de modelos de datos en Prisma
2. Implementación de servicios base para gestión de pasarelas
3. Configuración de entornos de prueba en pasarelas seleccionadas

### Fase 2: Integración con Pasarelas (5 días)

1. Implementación de adaptadores para PayU Latam
2. Implementación de adaptadores para Wompi
3. Desarrollo de servicio unificado de procesamiento
4. Manejo de webhooks y callbacks

### Fase 3: Interfaz de Usuario (4 días)

1. Desarrollo de componentes para selección de método de pago
2. Implementación de formularios de pago
3. Pantallas de confirmación y resultado
4. Integración con sistema de notificaciones

### Fase 4: Pruebas y Optimización (3 días)

1. Pruebas de integración con pasarelas
2. Validación de flujos completos
3. Pruebas de seguridad
4. Optimización de experiencia de usuario

## Consideraciones de Seguridad

1. **Encriptación de Datos Sensibles**:
   - Credenciales de pasarelas
   - Tokens de pago
   - Información de tarjetas

2. **Validación de Webhooks**:
   - Verificación de firmas
   - Validación de IPs de origen
   - Protección contra replay attacks

3. **Cumplimiento PCI-DSS**:
   - No almacenar datos completos de tarjetas
   - Utilizar tokenización
   - Implementar TLS 1.2+

4. **Prevención de Fraude**:
   - Validación de límites de transacción
   - Detección de patrones sospechosos
   - Registro de IPs y dispositivos

## Métricas de Éxito

1. **Tasa de Conversión**: >90% de intentos de pago completados
2. **Tiempo de Procesamiento**: <3 segundos para confirmación
3. **Disponibilidad**: >99.9% de uptime del servicio de pagos
4. **Satisfacción de Usuario**: >4.5/5 en encuestas post-pago
5. **Adopción**: >50% de pagos realizados en línea en los primeros 3 meses

## Próximos Pasos

1. Finalizar selección de pasarelas con análisis de costos detallado
2. Implementar modelos de datos en Prisma
3. Desarrollar servicios base de integración
4. Configurar cuentas de prueba en pasarelas seleccionadas

## Conclusión

La integración de pagos representa una mejora significativa para el proyecto Armonía, permitiendo a los residentes realizar pagos de manera conveniente y segura. La arquitectura propuesta es flexible, segura y escalable, permitiendo añadir nuevas pasarelas o métodos de pago en el futuro.

La implementación seguirá las mejores prácticas de seguridad y experiencia de usuario, asegurando una adopción rápida y una alta satisfacción de los usuarios.

---

Documento preparado el 2 de junio de 2025 como parte de la Fase 2 del Plan Integral de Desarrollo del proyecto Armonía.
