# Documentación Técnica: Sistema de Visitantes - Proyecto Armonía

## Introducción

Este documento proporciona la documentación técnica completa del sistema de visitantes implementado para el proyecto Armonía en su fase 3. El sistema permite la gestión integral de visitantes, incluyendo registro, pre-registro, pases de acceso y bitácora de entradas y salidas.

## Arquitectura

El sistema de visitantes está implementado siguiendo una arquitectura multi-tenant, donde cada conjunto residencial tiene su propio esquema en la base de datos PostgreSQL. La implementación utiliza:

- **Prisma ORM**: Para la definición de modelos y acceso a datos
- **Next.js API Routes**: Para la implementación de endpoints RESTful
- **Middleware de seguridad**: Para protección CSRF, XSS y auditoría

## Modelos de Datos

### Visitante (Visitor)

Representa a una persona que visita el conjunto residencial.

```prisma
model Visitor {
  id              Int       @id @default(autoincrement())
  name            String    // Nombre del visitante
  documentType    DocumentType // Tipo de documento
  documentNumber  String    // Número de documento
  destination     String    // Destino dentro del conjunto
  residentName    String?   // Nombre del residente que visita
  entryTime       DateTime  // Hora de entrada
  exitTime        DateTime? // Hora de salida (null si aún no ha salido)
  plate           String?   // Placa del vehículo
  photoUrl        String?   // URL de la foto del visitante
  status          VisitorStatus // Estado del visitante (ACTIVE/DEPARTED)
  notes           String?   // Notas adicionales
  preRegisterId   Int?      // ID del pre-registro (si aplica)
  preRegister     PreRegisteredVisitor? @relation(fields: [preRegisterId], references: [id])
  accessPassId    Int?      // ID del pase de acceso utilizado
  accessPass      AccessPass? @relation(fields: [accessPassId], references: [id])
  purpose         String?   // Propósito de la visita
  company         String?   // Empresa a la que representa
  temperature     Float?    // Temperatura registrada
  belongings      Json?     // Registro de pertenencias
  signature       String?   // URL de la firma digital
  registeredBy    Int       // ID del usuario que registró al visitante
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  accessLogs      AccessLog[] // Relación con los registros de acceso
  
  @@index([documentType, documentNumber])
  @@index([status])
  @@index([entryTime])
  @@index([destination])
  @@index([preRegisterId])
  
  @@schema("tenant")
}
```

### Pre-registro (PreRegisteredVisitor)

Permite a los residentes registrar visitantes con anticipación.

```prisma
model PreRegisteredVisitor {
  id              Int       @id @default(autoincrement())
  name            String    // Nombre del visitante
  documentType    DocumentType? // Tipo de documento
  documentNumber  String?   // Número de documento
  residentId      Int       // ID del residente que autoriza
  unitId          Int       // ID de la unidad de destino
  expectedDate    DateTime  // Fecha esperada de visita
  validFrom       DateTime  // Inicio de validez del pre-registro
  validUntil      DateTime  // Fin de validez del pre-registro
  purpose         String?   // Propósito de la visita
  isRecurrent     Boolean   @default(false) // Si es un visitante recurrente
  recurrenceRule  String?   // Regla de recurrencia
  accessCode      String    // Código único para acceso
  status          String    // Estado del pre-registro
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  visitors        Visitor[] // Relación con visitantes registrados
  accessPasses    AccessPass[] // Relación con pases de acceso
  
  @@index([residentId])
  @@index([status])
  @@index([validFrom, validUntil])
  
  @@schema("tenant")
}
```

### Pase de Acceso (AccessPass)

Proporciona acceso controlado a visitantes mediante códigos QR.

```prisma
model AccessPass {
  id              Int       @id @default(autoincrement())
  code            String    @unique // Código único del pase
  qrUrl           String    // URL de la imagen QR generada
  type            AccessPassType // Tipo de pase
  validFrom       DateTime  // Inicio de validez
  validUntil      DateTime  // Fin de validez
  usageCount      Int       @default(0) // Número de veces utilizado
  maxUsages       Int       @default(1) // Máximo de usos permitidos
  status          AccessPassStatus // Estado del pase
  
  preRegisterId   Int?      // ID del pre-registro (si aplica)
  preRegister     PreRegisteredVisitor? @relation(fields: [preRegisterId], references: [id])
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  visitors        Visitor[] // Relación con visitantes que usaron el pase
  accessLogs      AccessLog[] // Relación con registros de acceso
  
  @@index([code])
  @@index([status])
  @@index([validFrom, validUntil])
  @@index([preRegisterId])
  
  @@schema("tenant")
}
```

### Bitácora de Accesos (AccessLog)

Registra todas las entradas, salidas y accesos denegados.

```prisma
model AccessLog {
  id              Int       @id @default(autoincrement())
  action          AccessAction // Tipo de acción (ENTRY/EXIT/DENIED)
  timestamp       DateTime  @default(now()) // Momento del registro
  location        String    // Punto de acceso
  notes           String?   // Notas adicionales
  registeredBy    Int       // ID del usuario que registró el acceso
  
  visitorId       Int?      // ID del visitante (si aplica)
  visitor         Visitor?  @relation(fields: [visitorId], references: [id])
  
  accessPassId    Int?      // ID del pase de acceso (si aplica)
  accessPass      AccessPass? @relation(fields: [accessPassId], references: [id])
  
  @@index([action])
  @@index([timestamp])
  @@index([visitorId])
  @@index([accessPassId])
  
  @@schema("tenant")
}
```

## Servicios de Acceso a Datos

### VisitorService

Proporciona métodos para la gestión de visitantes.

```typescript
class VisitorService {
  // Obtiene todos los visitantes con paginación y filtros
  async getAllVisitors(params: { page?, limit?, status?, search?, startDate?, endDate? })
  
  // Obtiene un visitante por su ID
  async getVisitorById(id: number)
  
  // Crea un nuevo registro de visitante
  async createVisitor(data: { name, documentType, documentNumber, destination, ... })
  
  // Registra la salida de un visitante
  async registerExit(id: number, data: { notes?, registeredBy })
  
  // Actualiza la información de un visitante
  async updateVisitor(id: number, data: { name?, destination?, ... })
  
  // Obtiene estadísticas de visitantes
  async getVisitorStats(params: { startDate?, endDate? })
}
```

### PreRegistrationService

Gestiona el pre-registro de visitantes.

```typescript
class PreRegistrationService {
  // Crea un nuevo pre-registro de visitante
  async createPreRegistration(data: { visitorName, documentType, ... })
  
  // Notifica a un visitante sobre su pre-registro
  async notifyVisitor(data: { preRegistrationId, accessPassId? })
  
  // Cancela un pre-registro
  async cancelPreRegistration(id: number, data: { cancelledBy, reason })
  
  // Obtiene todos los pre-registros con paginación y filtros
  async getAllPreRegistrations(params: { page?, limit?, ... })
  
  // Obtiene un pre-registro por su ID
  async getPreRegistrationById(id: number)
  
  // Obtiene un pre-registro por su código
  async getPreRegistrationByCode(code: string)
  
  // Actualiza un pre-registro
  async updatePreRegistration(id: number, data: { visitorName?, ... })
}
```

### AccessPassService

Gestiona los pases de acceso.

```typescript
class AccessPassService {
  // Genera un nuevo pase de acceso
  async generateAccessPass(data: { visitorName, documentType, ... })
  
  // Genera un código QR para un pase de acceso
  async generateQRForPass(passId: number)
  
  // Valida un pase de acceso
  async validateAccessPass(passCode: string)
  
  // Registra el uso de un pase de acceso
  async registerPassUsage(passId: number, data: { action, location, ... })
  
  // Revoca un pase de acceso
  async revokeAccessPass(passId: number, data: { revokedBy, reason })
  
  // Obtiene todos los pases de acceso con paginación y filtros
  async getAllAccessPasses(params: { page?, limit?, ... })
  
  // Obtiene un pase de acceso por su ID
  async getAccessPassById(id: number)
}
```

## APIs RESTful

### Endpoints de Visitantes

#### GET /api/visitors
Obtiene la lista de visitantes con paginación y filtros.

**Parámetros de consulta:**
- `page`: Número de página (default: 1)
- `limit`: Límite de resultados por página (default: 10)
- `status`: Filtro por estado (ACTIVE/DEPARTED)
- `search`: Búsqueda por nombre, documento o destino
- `startDate`: Fecha de inicio para filtrar
- `endDate`: Fecha de fin para filtrar

**Respuesta:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Juan Pérez",
      "documentType": "CC",
      "documentNumber": "1234567890",
      "destination": "Apartamento 101",
      "entryTime": "2025-06-01T10:30:00Z",
      "status": "ACTIVE",
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

#### POST /api/visitors
Crea un nuevo registro de visitante.

**Cuerpo de la solicitud:**
```json
{
  "name": "Juan Pérez",
  "documentType": "CC",
  "documentNumber": "1234567890",
  "destination": "Apartamento 101",
  "residentName": "María Rodríguez",
  "plate": "ABC123",
  "purpose": "Visita familiar",
  "registeredBy": 1
}
```

**Respuesta:**
```json
{
  "id": 1,
  "name": "Juan Pérez",
  "documentType": "CC",
  "documentNumber": "1234567890",
  "destination": "Apartamento 101",
  "entryTime": "2025-06-01T10:30:00Z",
  "status": "ACTIVE",
  ...
}
```

#### GET /api/visitors/[id]
Obtiene un visitante por su ID.

**Respuesta:**
```json
{
  "id": 1,
  "name": "Juan Pérez",
  "documentType": "CC",
  "documentNumber": "1234567890",
  "destination": "Apartamento 101",
  "entryTime": "2025-06-01T10:30:00Z",
  "status": "ACTIVE",
  ...
}
```

#### PUT /api/visitors/[id]
Actualiza la información de un visitante.

**Cuerpo de la solicitud:**
```json
{
  "name": "Juan Pérez Gómez",
  "destination": "Apartamento 102",
  "notes": "Cambio de destino",
  "updatedBy": 1
}
```

#### POST /api/visitors/[id]/exit
Registra la salida de un visitante.

**Cuerpo de la solicitud:**
```json
{
  "notes": "Salida normal",
  "registeredBy": 1
}
```

### Endpoints de Pre-registro

#### GET /api/visitors/pre-register
Obtiene la lista de pre-registros con paginación y filtros.

#### POST /api/visitors/pre-register
Crea un nuevo pre-registro de visitante.

#### GET /api/visitors/pre-register/[id]
Obtiene un pre-registro por su ID.

#### PUT /api/visitors/pre-register/[id]
Actualiza un pre-registro.

#### POST /api/visitors/pre-register/[id]/cancel
Cancela un pre-registro.

#### POST /api/visitors/pre-register/[id]/notify
Notifica a un visitante sobre su pre-registro.

### Endpoints de Pases de Acceso

#### GET /api/visitors/access-pass
Obtiene la lista de pases de acceso con paginación y filtros.

#### POST /api/visitors/access-pass
Genera un nuevo pase de acceso.

#### GET /api/visitors/access-pass/[id]
Obtiene un pase de acceso por su ID.

#### POST /api/visitors/access-pass/[id]/validate
Valida un pase de acceso.

#### POST /api/visitors/access-pass/[id]/usage
Registra el uso de un pase de acceso.

#### POST /api/visitors/access-pass/[id]/revoke
Revoca un pase de acceso.

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
  name: sanitizeInput(requestData.name),
  documentNumber: sanitizeInput(requestData.documentNumber),
  // ...
};
```

### Auditoría

Todas las operaciones críticas son registradas en el sistema de auditoría mediante la función `logAuditEvent`.

```typescript
await logAuditEvent({
  userId: sanitizedData.registeredBy,
  entityType: 'VISITOR',
  entityId: visitor.id.toString(),
  action: 'VISITOR_CREATED',
  details: JSON.stringify({
    name: visitor.name,
    documentNumber: visitor.documentNumber,
    destination: visitor.destination
  })
});
```

## Integración Multi-tenant

El sistema está diseñado para funcionar en una arquitectura multi-tenant, donde cada conjunto residencial tiene su propio esquema en la base de datos. Todos los modelos relacionados con visitantes están definidos con `@@schema("tenant")`, lo que permite su creación en cada esquema de tenant.

## Próximos Pasos

1. Desarrollar componentes de interfaz de usuario para el panel de recepción
2. Implementar sistema de generación de códigos QR
3. Desarrollar sistema de control de correspondencia y paquetería
4. Implementar registro y gestión de incidentes

## Conclusión

El sistema de visitantes proporciona una base sólida para la gestión de accesos en conjuntos residenciales, con características avanzadas como pre-registro, pases de acceso con QR y trazabilidad completa de entradas y salidas.
