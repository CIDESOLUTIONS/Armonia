# Análisis para Implementación de Citofonía Virtual - Fase 2 del Proyecto Armonía

## Resumen Ejecutivo

Este documento presenta el análisis y plan de implementación para la Citofonía Virtual, identificada como la tercera funcionalidad prioritaria de la Fase 2 según el plan integral de desarrollo del proyecto Armonía. Esta funcionalidad permitirá a los residentes recibir notificaciones de visitantes a través de WhatsApp y Telegram, mejorando significativamente la seguridad y control de accesos mientras reduce costos operativos.

## Objetivos

1. Implementar un sistema de citofonía virtual con integraciones a WhatsApp y Telegram
2. Proporcionar una experiencia fluida para residentes, visitantes y personal de seguridad
3. Garantizar tiempos de respuesta rápidos (<3 segundos) para notificaciones de acceso
4. Mantener un registro completo de visitas y accesos para auditoría
5. Reducir costos operativos asociados a sistemas tradicionales de citofonía

## Análisis de APIs de Mensajería

### WhatsApp Business API

#### Características Principales
- Mensajes de texto, imágenes y documentos
- Plantillas de mensajes pre-aprobadas
- Notificaciones interactivas con botones
- Webhooks para recepción de mensajes
- Límites de mensajería según nivel de cuenta

#### Requisitos de Implementación
- Cuenta de WhatsApp Business API (a través de proveedor oficial)
- Proceso de verificación de negocio
- Aprobación de plantillas de mensajes
- Servidor con HTTPS para webhooks
- Cumplimiento de políticas de uso

#### Proveedores Recomendados
- **Twilio**: Integración robusta, buena documentación, soporte 24/7
- **MessageBird**: Precios competitivos, API sencilla
- **Gupshup**: Especializado en mercados emergentes, buen soporte regional

### Telegram Bot API

#### Características Principales
- Creación de bots interactivos
- Mensajes de texto, multimedia y documentos
- Teclados personalizados y comandos
- Webhooks o polling para recepción de mensajes
- Sin límites estrictos de mensajería

#### Requisitos de Implementación
- Creación de bot a través de BotFather
- Servidor para procesamiento de mensajes
- Configuración de webhooks o polling
- Manejo de estados de conversación

#### Ventajas sobre WhatsApp
- Proceso de aprobación más sencillo
- Sin costos por mensaje
- Mayor flexibilidad en interacciones
- Mejor soporte para grupos

## Arquitectura Propuesta

### Componentes Principales

1. **Módulo de Configuración de Citofonía**:
   - Gestión de preferencias de notificación por residente
   - Configuración de mensajes y plantillas
   - Asignación de unidades a residentes
   - Configuración de tiempos de espera y reintentos

2. **Servicio de Integración de Mensajería**:
   - Adaptadores para WhatsApp y Telegram
   - Cola de mensajes para garantizar entrega
   - Manejo de respuestas y estados
   - Reintentos automáticos

3. **Flujo de Citofonía**:
   - Registro de visitantes
   - Notificación a residentes
   - Procesamiento de respuestas
   - Autorización o rechazo de acceso

4. **Registro de Visitas**:
   - Historial completo de intentos de acceso
   - Estados detallados de notificaciones
   - Trazabilidad para auditoría
   - Estadísticas de uso

### Diagrama de Flujo

```
Visitante → Registro en Recepción → Notificación a Residente → Respuesta → Autorización/Rechazo → Registro de Acceso
```

### Integración con Componentes Existentes

- **Sistema de Usuarios**: Identificación de residentes y sus preferencias
- **Sistema de Comunicaciones**: Notificaciones adicionales sobre visitas
- **Sistema de Seguridad**: Registro de accesos y visitantes
- **Registro de Actividad**: Auditoría de accesos

## Modelos de Datos Requeridos

### VisitorType

```prisma
model VisitorType {
  id                Int               @id @default(autoincrement())
  name              String            // Tipo de visitante (Familiar, Servicio, Delivery, etc.)
  description       String?           // Descripción opcional
  requiresApproval  Boolean           @default(true) // Si requiere aprobación explícita
  color             String?           // Color para UI
  icon              String?           // Icono para UI
  visitors          Visitor[]         // Visitantes asociados
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  
  @@schema("tenant")
}
```

### Visitor

```prisma
model Visitor {
  id                String            @id @default(uuid())
  name              String            // Nombre del visitante
  identification    String?           // Documento de identidad
  phone             String?           // Teléfono de contacto
  photo             String?           // URL de foto (opcional)
  typeId            Int               // Tipo de visitante
  type              VisitorType       @relation(fields: [typeId], references: [id])
  company           String?           // Empresa (si aplica)
  isFrequent        Boolean           @default(false) // Si es visitante frecuente
  isBlocked         Boolean           @default(false) // Si está bloqueado
  blockReason       String?           // Razón de bloqueo
  visits            Visit[]           // Visitas asociadas
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  
  @@index([typeId])
  @@index([isFrequent])
  @@index([isBlocked])
  @@schema("tenant")
}
```

### Visit

```prisma
model Visit {
  id                String            @id @default(uuid())
  visitorId         String            // Visitante
  visitor           Visitor           @relation(fields: [visitorId], references: [id])
  unitId            Int               // Unidad a visitar
  unit              Unit              @relation(fields: [unitId], references: [id])
  purpose           String            // Propósito de la visita
  status            VisitStatus       // Estado de la visita
  entryTime         DateTime?         // Hora de entrada
  exitTime          DateTime?         // Hora de salida
  authorizedBy      Int?              // Usuario que autorizó
  authorizedByUser  User?             @relation(fields: [authorizedBy], references: [id])
  notes             String?           // Notas adicionales
  notifications     VirtualIntercomNotification[] // Notificaciones enviadas
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  
  @@index([visitorId])
  @@index([unitId])
  @@index([status])
  @@index([entryTime])
  @@schema("tenant")
}
```

### VirtualIntercomNotification

```prisma
model VirtualIntercomNotification {
  id                String            @id @default(uuid())
  visitId           String            // Visita asociada
  visit             Visit             @relation(fields: [visitId], references: [id])
  userId            Int               // Usuario notificado
  user              User              @relation(fields: [userId], references: [id])
  channel           NotificationChannel // Canal de notificación (WhatsApp, Telegram)
  status            NotificationStatus // Estado de la notificación
  sentAt            DateTime          @default(now()) // Fecha de envío
  deliveredAt       DateTime?         // Fecha de entrega
  readAt            DateTime?         // Fecha de lectura
  respondedAt       DateTime?         // Fecha de respuesta
  response          String?           // Respuesta del usuario
  responseType      ResponseType?     // Tipo de respuesta (Aprobar, Rechazar)
  messageId         String?           // ID del mensaje en el canal
  errorMessage      String?           // Mensaje de error (si aplica)
  retries           Int               @default(0) // Número de reintentos
  
  @@index([visitId])
  @@index([userId])
  @@index([channel])
  @@index([status])
  @@schema("tenant")
}
```

### UserIntercomPreference

```prisma
model UserIntercomPreference {
  id                Int               @id @default(autoincrement())
  userId            Int               // Usuario
  user              User              @relation(fields: [userId], references: [id])
  whatsappEnabled   Boolean           @default(true) // Notificaciones por WhatsApp habilitadas
  whatsappNumber    String?           // Número de WhatsApp
  telegramEnabled   Boolean           @default(false) // Notificaciones por Telegram habilitadas
  telegramUsername  String?           // Usuario de Telegram
  telegramChatId    String?           // Chat ID de Telegram
  notifyAllVisitors Boolean           @default(true) // Notificar todos los visitantes
  allowedVisitorTypes Int[]           // Tipos de visitantes permitidos sin notificación
  autoApproveTypes  Int[]             // Tipos de visitantes con aprobación automática
  quietHoursStart   String?           // Inicio de horas de silencio (HH:MM)
  quietHoursEnd     String?           // Fin de horas de silencio (HH:MM)
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  
  @@unique([userId])
  @@schema("tenant")
}
```

### IntercomSettings

```prisma
model IntercomSettings {
  id                Int               @id @default(autoincrement())
  whatsappEnabled   Boolean           @default(true) // WhatsApp habilitado a nivel de sistema
  whatsappProvider  String?           // Proveedor de WhatsApp (Twilio, MessageBird, etc.)
  whatsappConfig    Json?             // Configuración de WhatsApp
  telegramEnabled   Boolean           @default(true) // Telegram habilitado a nivel de sistema
  telegramBotToken  String?           // Token del bot de Telegram
  telegramConfig    Json?             // Configuración de Telegram
  defaultResponseTimeout Int          @default(60) // Tiempo de espera para respuesta (segundos)
  maxRetries        Int               @default(2) // Máximo de reintentos
  retryDelay        Int               @default(30) // Tiempo entre reintentos (segundos)
  messageTemplates  Json              // Plantillas de mensajes
  updatedAt         DateTime          @updatedAt
  
  @@schema("tenant")
}
```

### Enumeraciones

```prisma
enum VisitStatus {
  PENDING
  NOTIFIED
  APPROVED
  REJECTED
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

enum NotificationChannel {
  WHATSAPP
  TELEGRAM
  SMS
  EMAIL
  APP
}

enum NotificationStatus {
  PENDING
  SENT
  DELIVERED
  READ
  RESPONDED
  FAILED
  EXPIRED
}

enum ResponseType {
  APPROVE
  REJECT
  CUSTOM
}
```

## Plan de Implementación

### Fase 1: Configuración Base (3 días)

1. Definición de modelos de datos en Prisma
2. Implementación de servicios base para gestión de visitantes y visitas
3. Configuración de entornos de prueba para WhatsApp y Telegram

### Fase 2: Integración con APIs de Mensajería (5 días)

1. Implementación de adaptador para WhatsApp Business API
2. Implementación de adaptador para Telegram Bot API
3. Desarrollo de servicio unificado de mensajería
4. Manejo de webhooks y respuestas

### Fase 3: Interfaz de Usuario (4 días)

1. Desarrollo de componentes para registro de visitantes
2. Implementación de pantallas de configuración de preferencias
3. Visualización de historial de visitas
4. Panel de administración para seguridad

### Fase 4: Pruebas y Optimización (3 días)

1. Pruebas de integración con APIs de mensajería
2. Validación de flujos completos
3. Pruebas de rendimiento y tiempos de respuesta
4. Optimización de experiencia de usuario

## Consideraciones Técnicas

1. **Rendimiento y Escalabilidad**:
   - Implementación de colas de mensajes para garantizar entrega
   - Manejo asíncrono de notificaciones
   - Optimización para alto volumen de visitas

2. **Seguridad**:
   - Encriptación de datos sensibles
   - Validación de identidad de visitantes
   - Protección contra suplantación de identidad

3. **Disponibilidad**:
   - Mecanismos de fallback entre canales
   - Monitoreo de estado de APIs externas
   - Reintentos automáticos en caso de fallo

4. **Usabilidad**:
   - Mensajes claros y concisos
   - Opciones de respuesta simples
   - Confirmaciones visuales de acciones

## Métricas de Éxito

1. **Tiempo de Respuesta**: <3 segundos para entrega de notificaciones
2. **Tasa de Entrega**: >95% de notificaciones entregadas exitosamente
3. **Tasa de Respuesta**: >80% de notificaciones respondidas por residentes
4. **Satisfacción de Usuario**: >4.5/5 en encuestas post-implementación
5. **Adopción**: >70% de residentes utilizando el sistema en los primeros 3 meses

## Próximos Pasos

1. Crear cuentas de desarrollo en proveedores de WhatsApp Business API
2. Configurar bot de Telegram para pruebas
3. Implementar modelos de datos en Prisma
4. Desarrollar adaptadores base para WhatsApp y Telegram

## Conclusión

La implementación de la Citofonía Virtual representa una mejora significativa en la experiencia de residentes y visitantes, así como en la seguridad y eficiencia operativa del conjunto residencial. La arquitectura propuesta es flexible, segura y escalable, permitiendo una adopción gradual y adaptación a las necesidades específicas de cada comunidad.

La integración con WhatsApp y Telegram aprovecha canales de comunicación ya utilizados por los residentes, minimizando la curva de aprendizaje y maximizando la adopción del sistema.

---

Documento preparado el 2 de junio de 2025 como parte de la Fase 2 del Plan Integral de Desarrollo del proyecto Armonía.
