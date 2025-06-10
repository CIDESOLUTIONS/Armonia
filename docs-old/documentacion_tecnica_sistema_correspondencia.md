# Documentación Técnica: Sistema de Control de Correspondencia y Paquetería

## Introducción

Este documento proporciona la documentación técnica completa del sistema de control de correspondencia y paquetería implementado para el proyecto Armonía en su fase 3. El sistema permite la gestión integral de todo tipo de correspondencia, incluyendo paquetes, correo, documentos y entregas, con seguimiento detallado de estados, notificaciones y trazabilidad completa.

## Arquitectura

El sistema de control de correspondencia y paquetería está implementado siguiendo una arquitectura multi-tenant, donde cada conjunto residencial tiene su propio esquema en la base de datos PostgreSQL. La implementación utiliza:

- **Prisma ORM**: Para la definición de modelos y acceso a datos
- **Next.js API Routes**: Para la implementación de endpoints RESTful
- **Middleware de seguridad**: Para protección CSRF, XSS y auditoría

## Modelos de Datos

### Paquete (Package)

Representa cualquier tipo de correspondencia recibida en la recepción del conjunto residencial.

```prisma
model Package {
  id                Int             @id @default(autoincrement())
  trackingCode      String?         // Código interno de seguimiento
  type              PackageType     // Tipo de correspondencia (enum)
  trackingNumber    String?         // Número de seguimiento externo
  courier           String?         // Empresa de mensajería
  senderName        String?         // Nombre del remitente
  senderCompany     String?         // Empresa del remitente
  
  // Información del destinatario
  residentId        Int?            // ID del residente destinatario
  unitId            Int             // ID de la unidad de destino
  unitNumber        String          // Número de la unidad
  residentName      String          // Nombre del residente destinatario
  
  // Fechas y estados
  receivedAt        DateTime        // Fecha y hora de recepción
  notifiedAt        DateTime?       // Fecha y hora de notificación
  deliveredAt       DateTime?       // Fecha y hora de entrega
  expirationDate    DateTime?       // Fecha de expiración
  status            PackageStatus   @default(RECEIVED)
  priority          PackagePriority @default(NORMAL)
  
  // Información de recepción y entrega
  receivedByStaffId Int             // ID del personal que recibió
  receivedByStaffName String        // Nombre del personal que recibió
  deliveredByStaffId Int?           // ID del personal que entregó
  deliveredByStaffName String?      // Nombre del personal que entregó
  receivedByResidentId Int?         // ID del residente que recibió
  receivedByResidentName String?    // Nombre de quien recibió
  
  // Características físicas
  size              String?         // Tamaño (Small, Medium, Large)
  weight            Float?          // Peso en kg
  isFragile         Boolean         @default(false)
  needsRefrigeration Boolean        @default(false)
  
  // Contenido y notas
  description       String?         // Descripción del contenido
  notes             String?         // Notas adicionales
  tags              String[]        // Etiquetas para categorización
  
  // Archivos adjuntos
  mainPhotoUrl      String?         // URL de la foto principal
  attachments       Json?           // URLs de fotos adicionales
  signatureUrl      String?         // URL de la firma digital
  
  // Auditoría y relaciones
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt
  statusHistory     PackageStatusHistory[]
  notifications     PackageNotification[]
  
  // Índices para optimización
  @@index([status])
  @@index([receivedAt])
  @@index([unitNumber])
  @@index([residentId])
  @@index([trackingCode])
  @@index([trackingNumber])
  
  @@schema("tenant")
}
```

### Historial de Estados (PackageStatusHistory)

Registra cada cambio de estado de un paquete para mantener trazabilidad completa.

```prisma
model PackageStatusHistory {
  id              Int             @id @default(autoincrement())
  packageId       Int             // ID del paquete
  package         Package         @relation(fields: [packageId], references: [id])
  previousStatus  PackageStatus?  // Estado anterior
  newStatus       PackageStatus   // Nuevo estado
  changedAt       DateTime        @default(now())
  changedByUserId Int             // ID del usuario que realizó el cambio
  changedByUserName String        // Nombre del usuario
  notes           String?         // Notas sobre el cambio
  
  @@index([packageId])
  @@index([changedAt])
  
  @@schema("tenant")
}
```

### Notificación de Paquete (PackageNotification)

Registra cada notificación enviada a un residente sobre un paquete.

```prisma
model PackageNotification {
  id              Int             @id @default(autoincrement())
  packageId       Int             // ID del paquete
  package         Package         @relation(fields: [packageId], references: [id])
  type            String          // Tipo de notificación
  recipient       String          // Destinatario
  sentAt          DateTime        @default(now())
  status          String          // Estado de la notificación
  content         String          // Contenido
  
  @@index([packageId])
  @@index([sentAt])
  
  @@schema("tenant")
}
```

### Plantilla de Notificación (PackageNotificationTemplate)

Define plantillas personalizables para diferentes tipos de notificaciones.

```prisma
model PackageNotificationTemplate {
  id              Int             @id @default(autoincrement())
  name            String          // Nombre de la plantilla
  type            String          // Tipo de notificación
  subject         String          // Asunto (para emails)
  template        String          // Plantilla con variables
  isDefault       Boolean         @default(false)
  isActive        Boolean         @default(true)
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  
  @@schema("tenant")
}
```

### Configuración de Paquetes (PackageSettings)

Permite personalizar el comportamiento del sistema para cada conjunto residencial.

```prisma
model PackageSettings {
  id                      Int       @id @default(autoincrement())
  autoNotifyResident      Boolean   @default(true)
  notificationMethods     String[]
  expirationDays          Int       @default(30)
  reminderFrequency       Int       @default(3)
  requireSignature        Boolean   @default(true)
  requirePhoto            Boolean   @default(true)
  allowAnyoneToReceive    Boolean   @default(false)
  updatedAt               DateTime  @updatedAt
  
  @@schema("tenant")
}
```

### Reportes de Paquetes (PackageReport)

Define reportes programados para análisis y seguimiento.

```prisma
model PackageReport {
  id              Int       @id @default(autoincrement())
  name            String    // Nombre del reporte
  type            String    // Tipo de reporte
  parameters      Json      // Parámetros
  schedule        String?   // Programación
  recipients      String[]  // Destinatarios
  lastRun         DateTime? // Última ejecución
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  @@schema("tenant")
}
```

## Enumeraciones

### Tipo de Paquete (PackageType)

```prisma
enum PackageType {
  PACKAGE    // Paquete o encomienda
  MAIL       // Correo o carta
  DOCUMENT   // Documento
  FOOD       // Comida o delivery
  OTHER      // Otro tipo
}
```

### Estado de Paquete (PackageStatus)

```prisma
enum PackageStatus {
  RECEIVED   // Recibido en recepción
  NOTIFIED   // Residente notificado
  PENDING    // Pendiente de entrega
  DELIVERED  // Entregado al destinatario
  RETURNED   // Devuelto al remitente
  EXPIRED    // Expirado (no reclamado)
}
```

### Prioridad de Paquete (PackagePriority)

```prisma
enum PackagePriority {
  LOW        // Baja prioridad
  NORMAL     // Prioridad normal
  HIGH       // Alta prioridad
  URGENT     // Urgente
}
```

## Servicios de Acceso a Datos

### PackageService

Proporciona métodos para la gestión completa de paquetes y correspondencia.

```typescript
class PackageService {
  // Obtiene todos los paquetes con paginación y filtros
  async getAllPackages(params: { page?, limit?, status?, type?, search?, ... })
  
  // Obtiene un paquete por su ID
  async getPackageById(id: number)
  
  // Obtiene un paquete por su código de seguimiento
  async getPackageByTrackingCode(trackingCode: string)
  
  // Crea un nuevo registro de paquete
  async createPackage(data: { type, unitNumber, residentName, ... })
  
  // Actualiza la información de un paquete
  async updatePackage(id: number, data: { trackingNumber?, courier?, ... })
  
  // Cambia el estado de un paquete
  async changePackageStatus(id: number, data: { newStatus, changedByUserId, ... })
  
  // Registra la entrega de un paquete
  async deliverPackage(id: number, data: { deliveredByStaffId, ... })
  
  // Marca un paquete como devuelto al remitente
  async returnPackage(id: number, data: { returnedByStaffId, ... })
  
  // Notifica al residente sobre un paquete
  async notifyResident(packageId: number)
  
  // Crea una entrada en el historial de estados
  async createStatusHistoryEntry(data: { packageId, newStatus, ... })
  
  // Obtiene estadísticas de paquetes
  async getPackageStats(params: { startDate?, endDate? })
  
  // Obtiene la configuración de paquetes
  async getPackageSettings()
  
  // Actualiza la configuración de paquetes
  async updatePackageSettings(data: { autoNotifyResident?, ... })
  
  // Obtiene una plantilla de notificación
  async getNotificationTemplate(type: string)
  
  // Métodos privados de utilidad
  private generateTrackingCode(): string
  private generateNotificationContent(template: any, packageData: any): string
  private isValidStatusTransition(currentStatus: string, newStatus: string): boolean
}
```

## APIs RESTful

### Endpoints de Paquetes

#### GET /api/correspondence/packages
Obtiene la lista de paquetes con paginación y filtros.

**Parámetros de consulta:**
- `page`: Número de página (default: 1)
- `limit`: Límite de resultados por página (default: 10)
- `status`: Filtro por estado
- `type`: Filtro por tipo
- `search`: Búsqueda por texto
- `startDate`: Fecha de inicio para filtrar
- `endDate`: Fecha de fin para filtrar
- `unitNumber`: Filtro por número de unidad
- `residentId`: Filtro por ID de residente
- `priority`: Filtro por prioridad

**Respuesta:**
```json
{
  "data": [
    {
      "id": 1,
      "trackingCode": "PKG-20250601-A1B2",
      "type": "PACKAGE",
      "unitNumber": "Apartamento 101",
      "residentName": "Juan Pérez",
      "receivedAt": "2025-06-01T10:30:00Z",
      "status": "RECEIVED",
      ...
    },
    ...
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

#### POST /api/correspondence/packages
Crea un nuevo registro de paquete.

**Cuerpo de la solicitud:**
```json
{
  "type": "PACKAGE",
  "trackingNumber": "ABC123456",
  "courier": "Servientrega",
  "senderName": "Amazon",
  "unitId": 101,
  "unitNumber": "Apartamento 101",
  "residentName": "Juan Pérez",
  "receivedByStaffId": 1,
  "receivedByStaffName": "María Rodríguez",
  "size": "Medium",
  "weight": 2.5,
  "isFragile": true,
  "description": "Caja sellada",
  "priority": "NORMAL"
}
```

**Respuesta:**
```json
{
  "id": 1,
  "trackingCode": "PKG-20250601-A1B2",
  "type": "PACKAGE",
  "status": "RECEIVED",
  "receivedAt": "2025-06-01T10:30:00Z",
  ...
}
```

#### GET /api/correspondence/packages/[id]
Obtiene un paquete por su ID.

**Respuesta:**
```json
{
  "id": 1,
  "trackingCode": "PKG-20250601-A1B2",
  "type": "PACKAGE",
  "status": "RECEIVED",
  "receivedAt": "2025-06-01T10:30:00Z",
  "statusHistory": [
    {
      "id": 1,
      "newStatus": "RECEIVED",
      "changedAt": "2025-06-01T10:30:00Z",
      "changedByUserName": "María Rodríguez"
    }
  ],
  "notifications": [
    {
      "id": 1,
      "type": "email",
      "sentAt": "2025-06-01T10:35:00Z",
      "status": "sent"
    }
  ],
  ...
}
```

#### PUT /api/correspondence/packages/[id]
Actualiza la información de un paquete.

**Cuerpo de la solicitud:**
```json
{
  "trackingNumber": "XYZ789",
  "courier": "DHL",
  "description": "Caja sellada con etiqueta de frágil",
  "priority": "HIGH",
  "updatedByUserId": 1,
  "updatedByUserName": "María Rodríguez"
}
```

#### POST /api/correspondence/packages/[id]/status
Cambia el estado de un paquete.

**Cuerpo de la solicitud:**
```json
{
  "newStatus": "NOTIFIED",
  "changedByUserId": 1,
  "changedByUserName": "María Rodríguez",
  "notes": "Residente notificado por email"
}
```

#### POST /api/correspondence/packages/[id]/deliver
Registra la entrega de un paquete.

**Cuerpo de la solicitud:**
```json
{
  "deliveredByStaffId": 1,
  "deliveredByStaffName": "María Rodríguez",
  "receivedByResidentId": 101,
  "receivedByResidentName": "Juan Pérez",
  "signatureUrl": "https://example.com/signatures/sign123.png",
  "notes": "Entregado en mano"
}
```

#### POST /api/correspondence/packages/[id]/return
Marca un paquete como devuelto al remitente.

**Cuerpo de la solicitud:**
```json
{
  "returnedByStaffId": 1,
  "returnedByStaffName": "María Rodríguez",
  "notes": "Devuelto por expiración"
}
```

#### POST /api/correspondence/packages/[id]/notify
Notifica al residente sobre un paquete.

**Cuerpo de la solicitud:**
```json
{
  "notifiedBy": 1
}
```

#### GET /api/correspondence/packages/stats
Obtiene estadísticas de paquetes.

**Parámetros de consulta:**
- `startDate`: Fecha de inicio para filtrar
- `endDate`: Fecha de fin para filtrar

**Respuesta:**
```json
{
  "totalPackages": 150,
  "pendingPackages": 25,
  "deliveredPackages": 120,
  "returnedPackages": 5,
  "todayCount": 12,
  "packagesByType": [
    { "type": "PACKAGE", "count": 80 },
    { "type": "MAIL", "count": 50 },
    { "type": "DOCUMENT", "count": 20 }
  ],
  "packagesByStatus": [
    { "status": "DELIVERED", "count": 120 },
    { "status": "RECEIVED", "count": 15 },
    { "status": "NOTIFIED", "count": 10 }
  ]
}
```

#### GET /api/correspondence/packages/settings
Obtiene la configuración de paquetes.

**Respuesta:**
```json
{
  "id": 1,
  "autoNotifyResident": true,
  "notificationMethods": ["email"],
  "expirationDays": 30,
  "reminderFrequency": 3,
  "requireSignature": true,
  "requirePhoto": true,
  "allowAnyoneToReceive": false
}
```

#### PUT /api/correspondence/packages/settings
Actualiza la configuración de paquetes.

**Cuerpo de la solicitud:**
```json
{
  "autoNotifyResident": true,
  "notificationMethods": ["email", "sms"],
  "expirationDays": 15,
  "requireSignature": true,
  "updatedBy": 1
}
```

## Seguridad

### Protección CSRF

Todos los endpoints que modifican datos (POST, PUT, DELETE) implementan validación de tokens CSRF mediante el middleware `validateCsrfToken`.

```typescript
// Validar token CSRF
const csrfValidation = await validateCsrfToken(request);
if (!csrfValidation.valid) {
  return NextResponse.json(
    { error: 'Token CSRF inválido' },
    { status: 403 }
  );
}
```

### Protección XSS

Todos los datos de entrada son sanitizados para prevenir ataques XSS mediante la función `sanitizeInput`.

```typescript
const sanitizedData = {
  trackingNumber: sanitizeInput(requestData.trackingNumber),
  courier: sanitizeInput(requestData.courier),
  // ...
};
```

### Auditoría

Todas las operaciones críticas son registradas en el sistema de auditoría mediante la función `logAuditEvent`.

```typescript
await logAuditEvent({
  userId: sanitizedData.receivedByStaffId,
  entityType: 'PACKAGE',
  entityId: packageData.id.toString(),
  action: 'PACKAGE_CREATED',
  details: JSON.stringify({
    type: packageData.type,
    trackingCode: packageData.trackingCode,
    unitNumber: packageData.unitNumber
  })
});
```

## Flujos Funcionales

### 1. Recepción de Paquete

1. El personal de recepción recibe un paquete
2. Registra el paquete en el sistema (POST /api/correspondence/packages)
3. El sistema genera un código de seguimiento único
4. El sistema registra el estado inicial como "RECEIVED"
5. Si está configurado, el sistema notifica automáticamente al residente

### 2. Notificación al Residente

1. El sistema envía una notificación al residente (automática o manual)
2. Se registra la notificación en el sistema
3. El estado del paquete cambia a "NOTIFIED"
4. Se crea una entrada en el historial de estados

### 3. Entrega de Paquete

1. El residente se presenta en recepción para recoger el paquete
2. El personal verifica la identidad del residente
3. Registra la entrega en el sistema (POST /api/correspondence/packages/[id]/deliver)
4. Opcionalmente, captura la firma del residente
5. El estado del paquete cambia a "DELIVERED"
6. Se crea una entrada en el historial de estados

### 4. Devolución de Paquete

1. Si un paquete no es reclamado dentro del período configurado, puede ser devuelto
2. El personal registra la devolución (POST /api/correspondence/packages/[id]/return)
3. El estado del paquete cambia a "RETURNED"
4. Se crea una entrada en el historial de estados

## Integración Multi-tenant

El sistema está diseñado para funcionar en una arquitectura multi-tenant, donde cada conjunto residencial tiene su propio esquema en la base de datos. Todos los modelos relacionados con paquetes están definidos con `@@schema("tenant")`, lo que permite su creación en cada esquema de tenant.

## Recomendaciones para Integración UI

1. **Panel de Control**: Implementar un dashboard con estadísticas y gráficos
2. **Lista de Paquetes**: Vista con filtros, búsqueda y paginación
3. **Detalle de Paquete**: Vista detallada con historial y opciones de acción
4. **Formulario de Recepción**: Interfaz intuitiva para registro rápido
5. **Formulario de Entrega**: Con captura de firma digital
6. **Configuración**: Panel para personalizar el comportamiento del sistema

## Próximos Pasos

1. Desarrollar componentes de interfaz de usuario para el panel de recepción
2. Implementar sistema de generación de códigos QR para paquetes
3. Integrar con sistema de notificaciones push/email
4. Desarrollar reportes avanzados y dashboards

## Conclusión

El sistema de control de correspondencia y paquetería proporciona una solución completa para la gestión de todo tipo de correspondencia en conjuntos residenciales, con características avanzadas como seguimiento de estados, notificaciones, trazabilidad y configuración personalizable.
