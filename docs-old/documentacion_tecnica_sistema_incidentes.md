# Documentación Técnica: Sistema de Gestión de Incidentes

## Introducción

Este documento proporciona la documentación técnica completa del sistema de gestión de incidentes implementado para el proyecto Armonía en su fase 3. El sistema permite la gestión integral de todos los tipos de incidentes en conjuntos residenciales, desde problemas de seguridad hasta mantenimiento y emergencias, con flujos de trabajo avanzados, seguimiento detallado y notificaciones.

## Arquitectura

El sistema de gestión de incidentes está implementado siguiendo una arquitectura multi-tenant, donde cada conjunto residencial tiene su propio esquema en la base de datos PostgreSQL. La implementación utiliza:

- **Prisma ORM**: Para la definición de modelos y acceso a datos
- **Next.js API Routes**: Para la implementación de endpoints RESTful
- **Middleware de seguridad**: Para protección CSRF, XSS y auditoría

## Modelos de Datos

### Enumeraciones

#### IncidentCategory
```prisma
enum IncidentCategory {
  SECURITY       // Seguridad (robos, intrusiones, alarmas)
  MAINTENANCE    // Mantenimiento (daños, reparaciones)
  EMERGENCY      // Emergencias (incendios, inundaciones)
  NOISE          // Ruido o perturbaciones
  PARKING        // Problemas de estacionamiento
  COMMON_AREAS   // Problemas en áreas comunes
  NEIGHBOR       // Conflictos entre vecinos
  SERVICES       // Servicios públicos (agua, luz, gas)
  PETS           // Problemas con mascotas
  OTHER          // Otros tipos
}
```

#### IncidentPriority
```prisma
enum IncidentPriority {
  LOW           // Baja prioridad
  MEDIUM        // Prioridad media
  HIGH          // Alta prioridad
  CRITICAL      // Crítica (emergencia)
}
```

#### IncidentStatus
```prisma
enum IncidentStatus {
  REPORTED      // Reportado (inicial)
  ASSIGNED      // Asignado a responsable
  IN_PROGRESS   // En proceso de atención
  ON_HOLD       // En espera (por materiales, terceros, etc.)
  RESOLVED      // Resuelto
  CLOSED        // Cerrado
  CANCELLED     // Cancelado
  REOPENED      // Reabierto
}
```

### Modelos Principales

#### Incident
```prisma
model Incident {
  id                Int               @id @default(autoincrement())
  incidentNumber    String            // Número único de incidente (ej: INC-20250601-001)
  title             String            // Título del incidente
  description       String            // Descripción detallada
  
  // Categorización
  category          IncidentCategory  // Categoría del incidente
  subcategory       String?           // Subcategoría (opcional)
  priority          IncidentPriority  // Prioridad
  impact            String?           // Impacto (Alto, Medio, Bajo)
  
  // Ubicación
  location          String            // Ubicación del incidente
  unitId            Int?              // ID de la unidad relacionada (si aplica)
  unitNumber        String?           // Número de la unidad (si aplica)
  area              String?           // Área específica
  
  // Fechas y tiempos
  reportedAt        DateTime          // Fecha y hora del reporte
  assignedAt        DateTime?         // Fecha y hora de asignación
  startedAt         DateTime?         // Fecha y hora de inicio de atención
  resolvedAt        DateTime?         // Fecha y hora de resolución
  closedAt          DateTime?         // Fecha y hora de cierre
  dueDate           DateTime?         // Fecha límite según SLA
  
  // Personas involucradas
  reportedById      Int               // ID del usuario que reporta
  reportedByName    String            // Nombre de quien reporta
  reportedByRole    String            // Rol de quien reporta (residente, staff, admin)
  assignedToId      Int?              // ID del responsable asignado
  assignedToName    String?           // Nombre del responsable
  assignedToRole    String?           // Rol del responsable
  
  // Estado y seguimiento
  status            IncidentStatus    @default(REPORTED) // Estado actual
  resolution        String?           // Descripción de la resolución
  rootCause         String?           // Causa raíz identificada
  preventiveActions String?           // Acciones preventivas recomendadas
  
  // Etiquetas y clasificación
  isPublic          Boolean           @default(false) // Si es visible para todos los residentes
  isEmergency       Boolean           @default(false) // Si requiere atención inmediata
  requiresFollowUp  Boolean           @default(false) // Si requiere seguimiento posterior
  tags              String[]          // Etiquetas para categorización
  
  // SLA y métricas
  slaId             Int?              // ID del SLA aplicable
  responseTime      Int?              // Tiempo de respuesta en minutos
  resolutionTime    Int?              // Tiempo de resolución en minutos
  slaBreached       Boolean?          // Si se incumplió el SLA
  
  // Relaciones con otros módulos
  relatedIncidentIds String[]         // IDs de incidentes relacionados
  visitorId         Int?              // ID de visitante relacionado (si aplica)
  packageId         Int?              // ID de paquete relacionado (si aplica)
  
  // Archivos adjuntos
  mainPhotoUrl      String?           // URL de la foto principal
  attachments       Json?             // Lista de adjuntos con metadatos
  
  // Auditoría y relaciones
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  updates           IncidentUpdate[]  // Actualizaciones del incidente
  comments          IncidentComment[] // Comentarios
  statusHistory     IncidentStatusHistory[] // Historial de estados
  notifications     IncidentNotification[]  // Notificaciones enviadas
  
  // Índices para optimización
  @@index([status])
  @@index([category])
  @@index([priority])
  @@index([reportedAt])
  @@index([assignedToId])
  @@index([unitNumber])
  @@index([incidentNumber])
}
```

#### IncidentUpdate
```prisma
model IncidentUpdate {
  id                Int               @id @default(autoincrement())
  incidentId        Int               // ID del incidente
  incident          Incident          @relation(fields: [incidentId], references: [id])
  content           String            // Contenido de la actualización
  type              String            // Tipo de actualización (progress, note, action)
  authorId          Int               // ID del autor
  authorName        String            // Nombre del autor
  authorRole        String            // Rol del autor
  isInternal        Boolean           @default(false) // Si es solo para personal interno
  timestamp         DateTime          @default(now()) // Fecha y hora de la actualización
  attachments       Json?             // Adjuntos específicos de esta actualización
}
```

#### IncidentComment
```prisma
model IncidentComment {
  id                Int               @id @default(autoincrement())
  incidentId        Int               // ID del incidente
  incident          Incident          @relation(fields: [incidentId], references: [id])
  content           String            // Contenido del comentario
  authorId          Int               // ID del autor
  authorName        String            // Nombre del autor
  authorRole        String            // Rol del autor
  isInternal        Boolean           @default(false) // Si es solo para personal interno
  timestamp         DateTime          @default(now()) // Fecha y hora del comentario
  parentId          Int?              // ID del comentario padre (para respuestas)
  attachments       Json?             // Adjuntos específicos de este comentario
}
```

#### IncidentStatusHistory
```prisma
model IncidentStatusHistory {
  id                Int               @id @default(autoincrement())
  incidentId        Int               // ID del incidente
  incident          Incident          @relation(fields: [incidentId], references: [id])
  previousStatus    IncidentStatus?   // Estado anterior
  newStatus         IncidentStatus    // Nuevo estado
  changedAt         DateTime          @default(now()) // Fecha y hora del cambio
  changedById       Int               // ID del usuario que realizó el cambio
  changedByName     String            // Nombre del usuario
  changedByRole     String            // Rol del usuario
  reason            String?           // Razón del cambio
  timeInStatus      Int?              // Tiempo en el estado anterior (minutos)
}
```

#### IncidentNotification
```prisma
model IncidentNotification {
  id                Int               @id @default(autoincrement())
  incidentId        Int               // ID del incidente
  incident          Incident          @relation(fields: [incidentId], references: [id])
  type              NotificationType  // Tipo de notificación
  recipient         String            // Destinatario (email, teléfono, etc.)
  recipientId       Int?              // ID del destinatario (si es usuario)
  recipientRole     String?           // Rol del destinatario
  subject           String            // Asunto de la notificación
  content           String            // Contenido de la notificación
  sentAt            DateTime          @default(now()) // Fecha y hora de envío
  status            String            // Estado (sent, delivered, read, failed)
}
```

#### IncidentSLA
```prisma
model IncidentSLA {
  id                Int               @id @default(autoincrement())
  name              String            // Nombre del SLA
  description       String?           // Descripción
  category          IncidentCategory? // Categoría aplicable (null = todas)
  priority          IncidentPriority? // Prioridad aplicable (null = todas)
  responseTime      Int               // Tiempo de respuesta objetivo (minutos)
  resolutionTime    Int               // Tiempo de resolución objetivo (minutos)
  businessHoursOnly Boolean           @default(true) // Si aplica solo en horario laboral
  escalationRules   Json?             // Reglas de escalamiento
  notifyRules       Json?             // Reglas de notificación
  isActive          Boolean           @default(true) // Si está activo
}
```

#### IncidentSettings
```prisma
model IncidentSettings {
  id                      Int       @id @default(autoincrement())
  autoAssignEnabled       Boolean   @default(false) // Asignación automática
  autoNotifyResident      Boolean   @default(true)  // Notificar automáticamente al residente
  autoNotifyStaff         Boolean   @default(true)  // Notificar automáticamente al personal
  notificationMethods     String[]  // Métodos de notificación
  requirePhoto            Boolean   @default(false) // Requerir foto al reportar
  allowAnonymousReports   Boolean   @default(false) // Permitir reportes anónimos
  publicIncidentsEnabled  Boolean   @default(true)  // Habilitar incidentes públicos
  residentCanClose        Boolean   @default(false) // Residentes pueden cerrar sus incidentes
}
```

## Servicios de Acceso a Datos

### IncidentService

El servicio `IncidentService` proporciona métodos para la gestión completa de incidentes:

#### Métodos Principales

```typescript
class IncidentService {
  // Obtiene todos los incidentes con paginación y filtros
  async getAllIncidents(params: { page?, limit?, status?, category?, priority?, search?, ... })
  
  // Obtiene un incidente por su ID
  async getIncidentById(id: number, includeInternal: boolean = false)
  
  // Obtiene un incidente por su número único
  async getIncidentByNumber(incidentNumber: string, includeInternal: boolean = false)
  
  // Crea un nuevo incidente
  async createIncident(data: { title, description, category, priority, location, ... })
  
  // Actualiza la información de un incidente
  async updateIncident(id: number, data: { title?, description?, category?, ... })
  
  // Cambia el estado de un incidente
  async changeIncidentStatus(id: number, data: { newStatus, changedById, ... })
  
  // Asigna un incidente a un responsable
  async assignIncident(id: number, data: { assignedToId, assignedToName, ... })
  
  // Resuelve un incidente
  async resolveIncident(id: number, data: { resolution, rootCause?, ... })
  
  // Cierra un incidente
  async closeIncident(id: number, data: { closedById, closedByName, ... })
  
  // Reabre un incidente
  async reopenIncident(id: number, data: { reopenedById, reopenedByName, reason })
  
  // Crea una actualización para un incidente
  async createIncidentUpdate(data: { incidentId, content, type, ... })
  
  // Crea un comentario para un incidente
  async createIncidentComment(data: { incidentId, content, authorId, ... })
  
  // Crea una entrada en el historial de estados
  async createStatusHistoryEntry(data: { incidentId, newStatus, ... })
  
  // Notifica al personal sobre un nuevo incidente
  async notifyStaff(incidentId: number)
  
  // Notifica sobre un cambio de estado
  async notifyStatusChange(incidentId: number, newStatus: string)
  
  // Notifica sobre una asignación
  async notifyAssignment(incidentId: number)
  
  // Notifica sobre un nuevo comentario
  async notifyNewComment(incidentId: number, commentId: number)
  
  // Asigna automáticamente un incidente según reglas
  async autoAssignIncident(incidentId: number)
  
  // Obtiene estadísticas de incidentes
  async getIncidentStats(params: { startDate?, endDate? })
  
  // Obtiene la configuración de incidentes
  async getIncidentSettings()
  
  // Actualiza la configuración de incidentes
  async updateIncidentSettings(data: { autoAssignEnabled?, ... })
  
  // Obtiene una plantilla de notificación
  async getNotificationTemplate(type: string, eventType: string)
  
  // Obtiene el SLA aplicable para una categoría y prioridad
  async getApplicableSLA(category: string, priority: string)
}
```

#### Métodos Privados

```typescript
class IncidentService {
  // Genera un número único de incidente
  private generateIncidentNumber(): string
  
  // Genera el contenido de una notificación
  private generateNotificationContent(template: any, incident: any, extraData: any = {}): string
  
  // Valida si una transición de estado es válida
  private isValidStatusTransition(currentStatus: string, newStatus: string): boolean
}
```

## APIs RESTful

### Endpoints Principales

#### GET /api/incidents
Obtiene la lista de incidentes con paginación y filtros.

**Parámetros de consulta:**
- `page`: Número de página (default: 1)
- `limit`: Límite de resultados por página (default: 10)
- `status`: Filtro por estado
- `category`: Filtro por categoría
- `priority`: Filtro por prioridad
- `search`: Búsqueda por texto
- `startDate`: Fecha de inicio para filtrar
- `endDate`: Fecha de fin para filtrar
- `unitNumber`: Filtro por número de unidad
- `reportedById`: Filtro por ID de quien reporta
- `assignedToId`: Filtro por ID de responsable
- `isPublic`: Filtro por visibilidad pública
- `isEmergency`: Filtro por emergencia
- `tags`: Filtro por etiquetas (separadas por coma)

**Respuesta:**
```json
{
  "data": [
    {
      "id": 1,
      "incidentNumber": "INC-20250601-A1B2",
      "title": "Fuga de agua en pasillo",
      "category": "MAINTENANCE",
      "priority": "HIGH",
      "location": "Pasillo principal, piso 3",
      "reportedAt": "2025-06-01T10:30:00Z",
      "status": "IN_PROGRESS",
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

#### POST /api/incidents
Crea un nuevo incidente.

**Cuerpo de la solicitud:**
```json
{
  "title": "Fuga de agua en pasillo",
  "description": "Hay una fuga de agua en el pasillo principal del piso 3, cerca del apartamento 302.",
  "category": "MAINTENANCE",
  "priority": "HIGH",
  "location": "Pasillo principal, piso 3",
  "unitNumber": "Apartamento 302",
  "isEmergency": true,
  "tags": ["agua", "fuga", "pasillo"]
}
```

**Respuesta:**
```json
{
  "id": 1,
  "incidentNumber": "INC-20250601-A1B2",
  "title": "Fuga de agua en pasillo",
  "status": "REPORTED",
  "reportedAt": "2025-06-01T10:30:00Z",
  ...
}
```

#### GET /api/incidents/[id]
Obtiene un incidente por su ID.

**Respuesta:**
```json
{
  "id": 1,
  "incidentNumber": "INC-20250601-A1B2",
  "title": "Fuga de agua en pasillo",
  "description": "Hay una fuga de agua en el pasillo principal del piso 3, cerca del apartamento 302.",
  "category": "MAINTENANCE",
  "priority": "HIGH",
  "location": "Pasillo principal, piso 3",
  "status": "IN_PROGRESS",
  "reportedAt": "2025-06-01T10:30:00Z",
  "reportedByName": "Juan Pérez",
  "assignedToName": "Carlos Rodríguez",
  "statusHistory": [
    {
      "id": 1,
      "newStatus": "REPORTED",
      "changedAt": "2025-06-01T10:30:00Z",
      "changedByName": "Juan Pérez"
    },
    {
      "id": 2,
      "previousStatus": "REPORTED",
      "newStatus": "ASSIGNED",
      "changedAt": "2025-06-01T10:35:00Z",
      "changedByName": "Admin Sistema"
    },
    {
      "id": 3,
      "previousStatus": "ASSIGNED",
      "newStatus": "IN_PROGRESS",
      "changedAt": "2025-06-01T10:40:00Z",
      "changedByName": "Carlos Rodríguez"
    }
  ],
  "comments": [
    {
      "id": 1,
      "content": "Ya estoy en camino para revisar la fuga.",
      "authorName": "Carlos Rodríguez",
      "timestamp": "2025-06-01T10:45:00Z"
    }
  ],
  ...
}
```

#### PUT /api/incidents/[id]
Actualiza la información de un incidente.

**Cuerpo de la solicitud:**
```json
{
  "title": "Fuga de agua grave en pasillo",
  "priority": "CRITICAL",
  "description": "Hay una fuga de agua importante en el pasillo principal del piso 3. El agua está filtrándose a los apartamentos 301 y 302."
}
```

#### DELETE /api/incidents/[id]
Cancela un incidente (no lo elimina físicamente).

**Cuerpo de la solicitud:**
```json
{
  "reason": "Duplicado con el incidente INC-20250601-C3D4"
}
```

#### POST /api/incidents/[id]/status
Cambia el estado de un incidente.

**Cuerpo de la solicitud:**
```json
{
  "newStatus": "RESOLVED",
  "reason": "Fuga reparada",
  "resolution": "Se reemplazó la tubería dañada y se verificó que no hay más fugas.",
  "rootCause": "Tubería oxidada por antigüedad",
  "preventiveActions": "Revisar tuberías similares en otros pisos"
}
```

#### POST /api/incidents/[id]/assign
Asigna un incidente a un responsable.

**Cuerpo de la solicitud:**
```json
{
  "assignedToId": 5,
  "assignedToName": "Carlos Rodríguez",
  "assignedToRole": "STAFF",
  "notes": "Asignado al técnico de plomería"
}
```

#### GET /api/incidents/[id]/comments
Obtiene los comentarios de un incidente.

**Respuesta:**
```json
[
  {
    "id": 1,
    "content": "Ya estoy en camino para revisar la fuga.",
    "authorName": "Carlos Rodríguez",
    "authorRole": "STAFF",
    "timestamp": "2025-06-01T10:45:00Z",
    "isInternal": false
  },
  {
    "id": 2,
    "content": "Gracias por la rápida respuesta.",
    "authorName": "Juan Pérez",
    "authorRole": "RESIDENT",
    "timestamp": "2025-06-01T10:50:00Z",
    "isInternal": false
  }
]
```

#### POST /api/incidents/[id]/comments
Crea un comentario para un incidente.

**Cuerpo de la solicitud:**
```json
{
  "content": "He llegado al lugar y estoy evaluando la situación. La fuga parece provenir de una tubería principal.",
  "isInternal": false,
  "attachments": {
    "photos": [
      {
        "url": "https://example.com/photos/incident1_photo1.jpg",
        "description": "Foto de la fuga"
      }
    ]
  }
}
```

### Seguridad

#### Protección CSRF

Todos los endpoints que modifican datos (POST, PUT, DELETE) implementan validación de tokens CSRF:

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

#### Protección XSS

Todos los datos de entrada son sanitizados para prevenir ataques XSS:

```typescript
const sanitizedData = {
  title: sanitizeInput(requestData.title),
  description: sanitizeInput(requestData.description),
  // ...
};
```

#### Auditoría

Todas las operaciones críticas son registradas en el sistema de auditoría:

```typescript
await logAuditEvent({
  userId: session.user.id,
  entityType: 'INCIDENT',
  entityId: incident.id.toString(),
  action: 'INCIDENT_CREATED',
  details: JSON.stringify({
    title: incident.title,
    category: incident.category,
    priority: incident.priority
  })
});
```

#### Control de Acceso

El acceso a los endpoints está controlado según el rol del usuario:

```typescript
// Verificar permisos de acceso
const isAdmin = session.user.role === 'ADMIN' || session.user.role === 'COMPLEX_ADMIN';
const isStaff = session.user.role === 'STAFF';
const isOwner = incident.reportedById === session.user.id;
const isPublic = incident.isPublic;

// Residentes solo pueden ver sus propios incidentes o los públicos
if (!isAdmin && !isStaff && !isOwner && !isPublic) {
  return NextResponse.json(
    { error: 'No autorizado para ver este incidente' },
    { status: 403 }
  );
}
```

## Flujos Funcionales

### 1. Reporte de Incidente

1. Un residente reporta un incidente a través de la aplicación
2. El sistema genera un número único de incidente
3. El sistema registra el incidente con estado "REPORTED"
4. Si está configurado, el sistema notifica automáticamente al personal

### 2. Asignación de Incidente

1. Un administrador o el sistema (si está configurada la asignación automática) asigna el incidente a un miembro del personal
2. El sistema cambia el estado a "ASSIGNED"
3. El sistema notifica al personal asignado
4. El sistema registra la asignación en el historial

### 3. Atención del Incidente

1. El personal asignado cambia el estado a "IN_PROGRESS"
2. El personal puede agregar comentarios y actualizaciones
3. El residente puede ver el progreso y agregar comentarios
4. El sistema registra todos los cambios y comentarios

### 4. Resolución del Incidente

1. El personal resuelve el problema y cambia el estado a "RESOLVED"
2. El personal registra la resolución, causa raíz y acciones preventivas
3. El sistema notifica al residente
4. El sistema calcula si se cumplió el SLA

### 5. Cierre del Incidente

1. Un administrador o el residente (si está permitido) cierra el incidente
2. El sistema cambia el estado a "CLOSED"
3. El sistema registra el cierre en el historial
4. El incidente queda disponible para consultas históricas

### 6. Reapertura del Incidente

1. Si el problema persiste, un administrador, personal o el residente puede reabrir el incidente
2. El sistema cambia el estado a "REOPENED"
3. El sistema notifica a las partes involucradas
4. El incidente vuelve al flujo de atención

## Integración Multi-tenant

El sistema está diseñado para funcionar en una arquitectura multi-tenant, donde cada conjunto residencial tiene su propio esquema en la base de datos. Todos los modelos relacionados con incidentes están definidos con `@@schema("tenant")`, lo que permite su creación en cada esquema de tenant.

## Recomendaciones para Integración UI

1. **Dashboard de Incidentes**: Panel con estadísticas, gráficos y listado de incidentes recientes
2. **Formulario de Reporte**: Interfaz intuitiva para reportar nuevos incidentes
3. **Vista de Detalle**: Página detallada con historial, comentarios y acciones disponibles
4. **Panel de Administración**: Interfaz para gestionar asignaciones, SLAs y configuración
5. **Notificaciones**: Sistema de alertas en tiempo real para cambios de estado

## Próximos Pasos

1. Desarrollar componentes de interfaz de usuario para el panel de incidentes
2. Implementar notificaciones en tiempo real mediante WebSockets
3. Desarrollar reportes avanzados y dashboards analíticos
4. Integrar con sistemas externos (correo electrónico, SMS, WhatsApp)

## Conclusión

El sistema de gestión de incidentes proporciona una solución completa para la gestión de todo tipo de incidentes en conjuntos residenciales, con características avanzadas como workflow de estados, SLAs, notificaciones, trazabilidad y configuración personalizable. La arquitectura multi-tenant permite su uso en múltiples conjuntos residenciales, cada uno con su propia configuración y datos aislados.
