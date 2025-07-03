📁 Estructura del Proyecto (3 niveles):

📦 Dependencias NPM:

armonia-frontend@0.1.0 C:\Users\meciz\Documents\armonia
├── @auth/prisma-adapter@2.9.1
├── @babel/plugin-transform-runtime@7.27.4
├── @babel/preset-env@7.27.2
├── @babel/preset-react@7.27.1
├── @babel/preset-typescript@7.27.1
├── @emnapi/runtime@1.4.3 extraneous
├── @eslint/js@9.28.0
├── @headlessui/react@2.2.4
├── @heroicons/react@2.2.0
├── @playwright/test@1.52.0
├── @prisma/client@6.9.0
├── @radix-ui/react-alert-dialog@1.1.14
├── @radix-ui/react-avatar@1.1.10
├── @radix-ui/react-checkbox@1.3.2
├── @radix-ui/react-dialog@1.1.14
├── @radix-ui/react-dropdown-menu@2.1.15
├── @radix-ui/react-label@2.1.7
├── @radix-ui/react-popover@1.1.14
├── @radix-ui/react-progress@1.1.7
├── @radix-ui/react-scroll-area@1.2.9
├── @radix-ui/react-select@2.2.5
├── @radix-ui/react-separator@1.1.7
├── @radix-ui/react-slot@1.2.3
├── @radix-ui/react-switch@1.2.5
├── @radix-ui/react-tabs@1.1.12
├── @radix-ui/react-toast@1.2.14
├── @tailwindcss/forms@0.5.10
├── @testing-library/jest-dom@6.6.3
├── @testing-library/react@16.3.0
├── @types/bcrypt@5.0.2
├── @types/cypress@0.1.6
├── @types/jest@29.5.14
├── @types/jsonwebtoken@9.0.9
├── @types/node@20.17.57
├── @types/pg@8.15.4
├── @types/react-dom@19.1.6
├── @types/react@19.1.6
├── autoprefixer@10.4.21
├── axios@1.9.0
├── babel-jest@30.0.0-beta.3
├── bcrypt@5.1.1
├── bcryptjs@3.0.2
├── chart.js@4.4.9
├── class-variance-authority@0.7.1
├── clsx@2.1.1
├── date-fns@4.1.0
├── dotenv@16.5.0
├── eslint-config-next@15.3.3
├── eslint-plugin-react@7.37.5
├── eslint@9.28.0
├── framer-motion@12.16.0
├── globals@16.2.0
├── identity-obj-proxy@3.0.0
├── isomorphic-dompurify@2.25.0
├── jest-environment-jsdom@29.7.0
├── jest@29.7.0
├── joi@17.13.3
├── jose@6.0.11
├── jsonwebtoken@9.0.2
├── jspdf-autotable@5.0.2
├── jspdf@3.0.1
├── jwt-decode@4.0.0
├── lucide-react@0.475.0
├── next-auth@4.24.11
├── next@15.3.3
├── node-onvif@0.1.7
├── UNMET DEPENDENCY node-rtsp-stream@^0.0.9
├── nodemailer@6.10.1
├── pdf-lib@1.17.1
├── pg@8.16.0
├── postcss@8.5.4
├── prisma@6.9.0
├── qrcode@1.5.4
├── react-chartjs-2@5.3.0
├── react-day-picker@9.7.0
├── react-dom@19.1.0
├── react-hot-toast@2.5.2
├── react@19.1.0
├── recharts@2.15.3
├── socket.io-client@4.8.1
├── socket.io@4.8.1
├── tailwind-merge@3.3.0
├── tailwindcss-animate@1.0.7
├── tailwindcss@3.4.17
├── ts-jest@29.3.4
├── ts-node@10.9.2
├── tsyringe@4.10.0
├── typescript-eslint@8.33.1
├── typescript@5.8.3
├── ws@8.18.2
└── zod@3.25.51

npm error code ELSPROBLEMS
npm error extraneous: @emnapi/runtime@1.4.3 C:\Users\meciz\Documents\armonia\node_modules\@emnapi\runtime
npm error missing: node-rtsp-stream@^0.0.9, required by armonia-frontend@0.1.0
npm error A complete log of this run can be found in: C:\Users\meciz\AppData\Local\npm-cache\_logs\2025-06-15T20_08_24_001Z-debug-0.log

🔢 Versiones Técnicas:

Node.js:
v22.14.0

Prisma:
Environment variables loaded from .env
Prisma schema loaded from prisma\schema.prisma
prisma                  : 6.9.0
@prisma/client          : 6.9.0
Computed binaryTarget   : windows
Operating System        : win32
Architecture            : x64
Node.js                 : v22.14.0
TypeScript              : 5.8.3
Query Engine (Node-API) : libquery-engine 81e4af48011447c3cc503a190e86995b66d2a28e (at node_modules\@prisma\engines\query_engine-windows.dll.node)
Schema Engine           : schema-engine-cli 81e4af48011447c3cc503a190e86995b66d2a28e (at node_modules\@prisma\engines\schema-engine-windows.exe)
Schema Wasm             : @prisma/prisma-schema-wasm 6.9.0-10.81e4af48011447c3cc503a190e86995b66d2a28e
Default Engines Hash    : 81e4af48011447c3cc503a190e86995b66d2a28e
Studio                  : 0.511.0
Preview Features        : multiSchema

PostgreSQL (si disponible):
psql (PostgreSQL) 17.5

📄 Contenido de package.json:
-----------------------------
{
  "name": "armonia-frontend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "npx prisma generate && next build",
    "start": "next start",
    "lint": "eslint . --config eslint.config.mjs",
    "test": "jest",
    "test:watch": "jest --watch",
    "cypress:open": "cypress open",
    "cypress:run": "cypress run",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate deploy",
    "prisma:studio": "prisma studio",
    "prisma:seed": "node prisma/seed.js",
    "db:reset": "prisma migrate reset --force",
    "db:push": "prisma db push",
    "prepare": "prisma generate"
  },
  "prisma": {
    "seed": "node prisma/seed.js"
  },
  "dependencies": {
    "@auth/prisma-adapter": "^2.9.1",
    "@headlessui/react": "^2.2.0",
    "@heroicons/react": "^2.2.0",
    "@prisma/client": "^6.5.0",
    "@radix-ui/react-alert-dialog": "^1.1.6",
    "@radix-ui/react-avatar": "^1.1.10",
    "@radix-ui/react-checkbox": "^1.1.4",
    "@radix-ui/react-dialog": "^1.1.6",
    "@radix-ui/react-dropdown-menu": "^2.1.6",
    "@radix-ui/react-label": "^2.1.2",
    "@radix-ui/react-popover": "^1.1.6",
    "@radix-ui/react-progress": "^1.1.2",
    "@radix-ui/react-scroll-area": "^1.2.9",
    "@radix-ui/react-select": "^2.1.6",
    "@radix-ui/react-separator": "^1.1.2",
    "@radix-ui/react-slot": "^1.1.2",
    "@radix-ui/react-switch": "^1.1.3",
    "@radix-ui/react-tabs": "^1.1.3",
    "@radix-ui/react-toast": "^1.2.6",
    "@types/bcrypt": "^5.0.2",
    "axios": "^1.9.0",
    "bcrypt": "^5.1.1",
    "bcryptjs": "^3.0.2",
    "chart.js": "^4.4.8",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "date-fns": "^4.1.0",
    "dotenv": "^16.4.7",
    "framer-motion": "^12.4.7",
    "isomorphic-dompurify": "^2.25.0",
    "joi": "^17.13.3",
    "jose": "^6.0.10",
    "jsonwebtoken": "^9.0.2",
    "jspdf": "^3.0.1",
    "jspdf-autotable": "^5.0.2",
    "jwt-decode": "^4.0.0",
    "lucide-react": "^0.475.0",
    "next": "^15.3.3",
    "next-auth": "^4.24.11",
    "node-onvif": "^0.1.7",
    "node-rtsp-stream": "^0.0.9",
    "nodemailer": "^6.10.0",
    "pdf-lib": "^1.17.1",
    "pg": "^8.14.1",
    "qrcode": "^1.5.4",
    "react": "^19.1.0",
    "react-chartjs-2": "^5.3.0",
    "react-day-picker": "^9.6.5",
    "react-dom": "^19.1.0",
    "react-hot-toast": "^2.5.2",
    "recharts": "^2.15.1",
    "socket.io": "^4.8.1",
    "socket.io-client": "^4.8.1",
    "tailwind-merge": "^3.0.2",
    "tsyringe": "^4.8.0",
    "ws": "^8.18.2"
  },
  "devDependencies": {
    "@babel/plugin-transform-runtime": "^7.27.4",
    "@babel/preset-env": "^7.27.2",
    "@babel/preset-react": "^7.27.1",
    "@babel/preset-typescript": "^7.27.1",
    "@eslint/js": "^9.22.0",
    "@playwright/test": "^1.52.0",
    "@tailwindcss/forms": "^0.5.7",
    "@testing-library/jest-dom": "^6.4.2",
    "@testing-library/react": "^16.3.0",
    "@types/cypress": "^0.1.6",
    "@types/jest": "^29.5.12",
    "@types/jsonwebtoken": "^9.0.9",
    "@types/node": "^20.17.24",
    "@types/pg": "^8.11.11",
    "@types/react": "^19.1.6",
    "@types/react-dom": "^19.1.6",
    "autoprefixer": "^10.4.18",
    "babel-jest": "^30.0.0-beta.3",
    "eslint": "^9.22.0",
    "eslint-config-next": "^15.3.3",
    "eslint-plugin-react": "^7.37.4",
    "globals": "^16.0.0",
    "identity-obj-proxy": "^3.0.0",
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0",
    "postcss": "^8.4.35",
    "prisma": "^6.5.0",
    "tailwindcss": "^3.4.17",
    "tailwindcss-animate": "^1.0.7",
    "ts-jest": "^29.1.2",
    "ts-node": "^10.9.2",
    "typescript": "^5.8.2",
    "typescript-eslint": "^8.26.1",
    "zod": "^3.24.2"
  }
}

-----------------------------


📄 Contenido de tsconfig.json:
-----------------------------
{
  "compilerOptions": {
    "target": "es6",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@prisma/*": ["../node_modules/@prisma/*"],
      "@prisma/client": ["./node_modules/@prisma/client"],
      "@/lib/*": ["src/lib/*"]
    },
    "plugins": [{ "name": "next" }],
    "typeRoots": ["./node_modules/@types", "./src/types"],
    "noImplicitAny": false
  },
  "include": [
    "next-env.d.ts", 
    "**/*.ts", 
    "**/*.tsx", 
    ".next/types/**/*.ts",
    "src/types/**/*.d.ts"
  ],
  "exclude": ["node_modules"]
}
-----------------------------


📄 Contenido de next.config.js:
-----------------------------
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuraciones básicas
  reactStrictMode: true,
  
  // Asegurar que Next.js maneje correctamente las rutas con grupos
  serverExternalPackages: ["@prisma/client"]
}

module.exports = nextConfig;
-----------------------------


📄 Contenido de .env:
-----------------------------
# Database Configuration
DB_HOST=localhost
DB_NAME=armonia
DB_USER=postgres
DB_PASSWORD=Meciza1964!
DB_PORT=5432
PGPASSWORD=Meciza1964!
# Prisma Connection URL
DATABASE_URL="postgresql://postgres:Meciza1964!@localhost:5432/armonia?schema=armonia"
SHADOW_DATABASE_URL="postgresql://postgres:Meciza1964!@localhost:5432/armonia?schema=armonia"
JWT_SECRET="Armonia_Entre_Todos_2025"
EMAIL_USER=CideCustomers@gmail.com
EMAIL_PASS="enzrpswismwqxqxo"

-----------------------------


📄 Contenido de prisma/schema.prisma:
-----------------------------
// Esquema Prisma para el sistema de gestión de incidentes
// Ampliación del modelo existente con nuevas funcionalidades

// Definición del datasource
datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  schemas    = ["armonia", "tenant"]
}

// Definición del generator
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["multiSchema"]
}

// Enumeración para categorías de incidentes
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
  
  @@schema("tenant")
}

// Enumeración para prioridades de incidentes
enum IncidentPriority {
  LOW           // Baja prioridad
  MEDIUM        // Prioridad media
  HIGH          // Alta prioridad
  CRITICAL      // Crítica (emergencia)
  
  @@schema("tenant")
}

// Enumeración para estados de incidentes
enum IncidentStatus {
  REPORTED      // Reportado (inicial)
  ASSIGNED      // Asignado a responsable
  IN_PROGRESS   // En proceso de atención
  ON_HOLD       // En espera (por materiales, terceros, etc.)
  RESOLVED      // Resuelto
  CLOSED        // Cerrado
  CANCELLED     // Cancelado
  REOPENED      // Reabierto
  
  @@schema("tenant")
}

// Enumeración para tipos de notificación
enum NotificationType {
  EMAIL         // Correo electrónico
  SMS           // Mensaje de texto
  PUSH          // Notificación push
  APP           // Notificación en app
  WHATSAPP      // Mensaje de WhatsApp
  
  @@schema("tenant")
}

// Enumeración para tipos de adjuntos
enum AttachmentType {
  IMAGE         // Imagen
  DOCUMENT      // Documento
  VIDEO         // Video
  AUDIO         // Audio
  OTHER         // Otro tipo
  
  @@schema("tenant")
}

// Enumeración para planes freemium
enum PlanType {
  BASIC         // Gratuito: hasta 30 unidades, funcionalidades básicas, 1 año de históricos
  STANDARD      // $25/mes: hasta 30 unidades + $1/unidad adicional, funcionalidades avanzadas, 3 años de históricos
  PREMIUM       // $50/mes: hasta 80 unidades + $1/unidad adicional, todas las funcionalidades, históricos ilimitados
  
  @@schema("armonia")
}

// Modelo ampliado para Incidentes
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
  
  @@schema("tenant")
}

// Modelo mejorado para actualizaciones de incidentes
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
  
  @@index([incidentId])
  @@index([timestamp])
  
  @@schema("tenant")
}

// Nuevo modelo para comentarios de incidentes
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
  
  @@index([incidentId])
  @@index([timestamp])
  
  @@schema("tenant")
}

// Nuevo modelo para historial de estados de incidentes
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
  
  @@index([incidentId])
  @@index([changedAt])
  
  @@schema("tenant")
}

// Nuevo modelo para notificaciones de incidentes
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
  
  @@index([incidentId])
  @@index([sentAt])
  
  @@schema("tenant")
}

// Nuevo modelo para SLA de incidentes
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
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  
  @@schema("tenant")
}

// Nuevo modelo para plantillas de notificación de incidentes
model IncidentNotificationTemplate {
  id                Int               @id @default(autoincrement())
  name              String            // Nombre de la plantilla
  type              NotificationType  // Tipo de notificación
  eventType         String            // Tipo de evento (created, assigned, updated, etc.)
  subject           String            // Asunto (para emails)
  template          String            // Plantilla con variables
  isDefault         Boolean           @default(false) // Si es la plantilla predeterminada
  isActive          Boolean           @default(true)  // Si está activa
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  
  @@schema("tenant")
}

// Nuevo modelo para configuración de incidentes
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
  updatedAt               DateTime  @updatedAt
  
  @@schema("tenant")
}

// Nuevo modelo para categorías personalizadas de incidentes
model IncidentCustomCategory {
  id                Int       @id @default(autoincrement())
  name              String    // Nombre de la categoría
  parentCategory    IncidentCategory // Categoría principal
  description       String?   // Descripción
  isActive          Boolean   @default(true) // Si está activa
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  @@schema("tenant")
}

// Nuevo modelo para reportes de incidentes
model IncidentReport {
  id                Int       @id @default(autoincrement())
  name              String    // Nombre del reporte
  type              String    // Tipo de reporte (daily, weekly, monthly, custom)
  parameters        Json      // Parámetros del reporte
  schedule          String?   // Programación (cron expression)
  recipients        String[]  // Destinatarios del reporte
  lastRun           DateTime? // Última ejecución
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  @@schema("tenant")
}

// Nuevo modelo para equipos de atención de incidentes
model IncidentTeam {
  id                Int       @id @default(autoincrement())
  name              String    // Nombre del equipo
  description       String?   // Descripción
  memberIds         Int[]     // IDs de los miembros
  categories        IncidentCategory[] // Categorías que atiende
  isActive          Boolean   @default(true) // Si está activo
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  @@schema("tenant")
}

// Modelos existentes que deben mantenerse
model ResidentialComplex {
  id          Int      @id @default(autoincrement())
  name        String
  schemaName  String   @unique  // Nombre del schema en la DB
  totalUnits  Int
  adminEmail  String
  adminName   String
  adminPhone  String?
  address     String?
  city        String?
  state       String?
  country     String?  @default("Colombia")
  propertyTypes Json?
  // Campos del modelo freemium
  planType    PlanType @default(BASIC)  // Plan actual del conjunto
  planStartDate DateTime @default(now()) // Fecha de inicio del plan
  planEndDate   DateTime? // Fecha de fin del plan (null para BASIC)
  trialEndDate  DateTime? // Fecha de fin del período de prueba
  isTrialActive Boolean  @default(true)  // Si está en período de prueba
  maxUnits      Int      @default(30)    // Máximo de unidades permitidas según plan
  // Campos de auditoría
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  users       User[]
  subscriptions Subscription[]
  @@schema("armonia")
}

model User {
  id          Int      @id @default(autoincrement())
  email       String   @unique
  name        String?
  password    String
  role        String   // 'ADMIN', 'COMPLEX_ADMIN', 'RESIDENT', 'STAFF'
  active      Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  complexId   Int?
  complex     ResidentialComplex? @relation(fields: [complexId], references: [id])
  @@schema("armonia")
}

model Prospect {
  id          Int      @id @default(autoincrement())
  name        String
  email       String
  phone       String?
  complexName String
  units       Int
  message     String?
  createdAt   DateTime @default(now())
  contacted   Boolean  @default(false)
  @@schema("armonia")
}

// Modelo para historial de suscripciones y facturación
model Subscription {
  id          Int      @id @default(autoincrement())
  complexId   Int
  complex     ResidentialComplex @relation(fields: [complexId], references: [id])
  planType    PlanType
  startDate   DateTime
  endDate     DateTime?
  isActive    Boolean  @default(true)
  amount      Decimal  @db.Decimal(10,2) // Monto mensual
  currency    String   @default("USD")
  // Datos de facturación
  billingEmail     String
  billingName      String
  billingAddress   String?
  billingCity      String?
  billingCountry   String? @default("Colombia")
  // Metadatos
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@schema("armonia")
}

// Otros modelos existentes necesarios para mantener la integridad del esquema
// Enumeraciones para el sistema de visitantes
enum DocumentType {
  CC      // Cédula de Ciudadanía
  CE      // Cédula de Extranjería
  PASSPORT // Pasaporte
  OTHER   // Otro tipo de documento
  
  @@schema("tenant")
}

enum VisitorStatus {
  ACTIVE   // Visitante actualmente en las instalaciones
  DEPARTED // Visitante que ya salió
  
  @@schema("tenant")
}

enum AccessPassType {
  SINGLE_USE // Pase de un solo uso
  TEMPORARY  // Pase temporal con validez limitada
  RECURRENT  // Pase recurrente (ej: servicios de limpieza)
  
  @@schema("tenant")
}

enum AccessPassStatus {
  ACTIVE  // Pase activo y válido
  USED    // Pase ya utilizado (para single_use)
  EXPIRED // Pase expirado
  REVOKED // Pase revocado por administración
  
  @@schema("tenant")
}

enum AccessAction {
  ENTRY  // Registro de entrada
  EXIT   // Registro de salida
  DENIED // Acceso denegado
  
  @@schema("tenant")
}

// Enumeración para tipos de correspondencia
enum PackageType {
  PACKAGE    // Paquete o encomienda
  MAIL       // Correo o carta
  DOCUMENT   // Documento
  FOOD       // Comida o delivery
  OTHER      // Otro tipo
  
  @@schema("tenant")
}

// Enumeración para estados de correspondencia
enum PackageStatus {
  RECEIVED   // Recibido en recepción
  NOTIFIED   // Residente notificado
  PENDING    // Pendiente de entrega
  DELIVERED  // Entregado al destinatario
  RETURNED   // Devuelto al remitente
  EXPIRED    // Expirado (no reclamado)
  
  @@schema("tenant")
}

// Enumeración para prioridades
enum PackagePriority {
  LOW        // Baja prioridad
  NORMAL     // Prioridad normal
  HIGH       // Alta prioridad
  URGENT     // Urgente
  
  @@schema("tenant")
}

// Otros modelos existentes necesarios para mantener la integridad del esquema
model Visitor {
  id              Int       @id @default(autoincrement())
  name            String
  documentType    DocumentType
  documentNumber  String
  destination     String
  residentName    String?
  entryTime       DateTime
  exitTime        DateTime?
  plate           String?
  photoUrl        String?
  status          VisitorStatus
  notes           String?
  preRegisterId   Int?
  preRegister     PreRegisteredVisitor? @relation(fields: [preRegisterId], references: [id])
  accessPassId    Int?
  accessPass      AccessPass? @relation(fields: [accessPassId], references: [id])
  purpose         String?
  company         String?
  temperature     Float?
  belongings      Json?
  signature       String?
  registeredBy    Int
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  accessLogs      AccessLog[]
  
  @@index([documentType, documentNumber])
  @@index([status])
  @@index([entryTime])
  @@index([destination])
  @@index([preRegisterId])
  
  @@schema("tenant")
}

model PreRegisteredVisitor {
  id              Int       @id @default(autoincrement())
  name            String
  documentType    DocumentType?
  documentNumber  String?
  residentId      Int
  unitId          Int
  expectedDate    DateTime
  validFrom       DateTime
  validUntil      DateTime
  purpose         String?
  isRecurrent     Boolean   @default(false)
  recurrenceRule  String?
  accessCode      String
  status          String
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  visitors        Visitor[]
  accessPasses    AccessPass[]
  
  @@index([residentId])
  @@index([status])
  @@index([validFrom, validUntil])
  
  @@schema("tenant")
}

model AccessPass {
  id              Int       @id @default(autoincrement())
  code            String    @unique
  qrUrl           String
  type            AccessPassType
  validFrom       DateTime
  validUntil      DateTime
  usageCount      Int       @default(0)
  maxUsages       Int       @default(1)
  status          AccessPassStatus
  preRegisterId   Int?
  preRegister     PreRegisteredVisitor? @relation(fields: [preRegisterId], references: [id])
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  visitors        Visitor[]
  accessLogs      AccessLog[]
  
  @@index([code])
  @@index([status])
  @@index([validFrom, validUntil])
  @@index([preRegisterId])
  
  @@schema("tenant")
}

model AccessLog {
  id              Int       @id @default(autoincrement())
  action          AccessAction
  timestamp       DateTime  @default(now())
  location        String
  notes           String?
  registeredBy    Int
  visitorId       Int?
  visitor         Visitor?  @relation(fields: [visitorId], references: [id])
  accessPassId    Int?
  accessPass      AccessPass? @relation(fields: [accessPassId], references: [id])
  
  @@index([action])
  @@index([timestamp])
  @@index([visitorId])
  @@index([accessPassId])
  
  @@schema("tenant")
}

model Resident {
  id              Int       @id @default(autoincrement())
  userId          Int
  unit            String
  residentType    String
  documentType    String
  documentNumber  String
  phone           String?
  emergencyContact String?
  vehicles        Json?
  moveInDate      DateTime?
  moveOutDate     DateTime?
  isActive        Boolean   @default(true)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  @@schema("tenant")
}

model Package {
  id                Int             @id @default(autoincrement())
  trackingCode      String?
  type              PackageType
  trackingNumber    String?
  courier           String?
  senderName        String?
  senderCompany     String?
  residentId        Int?
  unitId            Int
  unitNumber        String
  residentName      String
  receivedAt        DateTime
  notifiedAt        DateTime?
  deliveredAt       DateTime?
  expirationDate    DateTime?
  status            PackageStatus   @default(RECEIVED)
  priority          PackagePriority @default(NORMAL)
  receivedByStaffId Int
  receivedByStaffName String
  deliveredByStaffId Int?
  deliveredByStaffName String?
  receivedByResidentId Int?
  receivedByResidentName String?
  size              String?
  weight            Float?
  isFragile         Boolean         @default(false)
  needsRefrigeration Boolean        @default(false)
  description       String?
  notes             String?
  tags              String[]
  mainPhotoUrl      String?
  attachments       Json?
  signatureUrl      String?
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt
  statusHistory     PackageStatusHistory[]
  notifications     PackageNotification[]
  
  @@index([status])
  @@index([receivedAt])
  @@index([unitNumber])
  @@index([residentId])
  @@index([trackingCode])
  @@index([trackingNumber])
  
  @@schema("tenant")
}

model PackageStatusHistory {
  id              Int             @id @default(autoincrement())
  packageId       Int
  package         Package         @relation(fields: [packageId], references: [id])
  previousStatus  PackageStatus?
  newStatus       PackageStatus
  changedAt       DateTime        @default(now())
  changedByUserId Int
  changedByUserName String
  notes           String?
  
  @@index([packageId])
  @@index([changedAt])
  
  @@schema("tenant")
}

model PackageNotification {
  id              Int             @id @default(autoincrement())
  packageId       Int
  package         Package         @relation(fields: [packageId], references: [id])
  type            String
  recipient       String
  sentAt          DateTime        @default(now())
  status          String
  content         String
  
  @@index([packageId])
  @@index([sentAt])
  
  @@schema("tenant")
}

model PackageNotificationTemplate {
  id              Int             @id @default(autoincrement())
  name            String
  type            String
  subject         String
  template        String
  isDefault       Boolean         @default(false)
  isActive        Boolean         @default(true)
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  
  @@schema("tenant")
}

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

model PackageReport {
  id              Int       @id @default(autoincrement())
  name            String
  type            String
  parameters      Json
  schedule        String?
  recipients      String[]
  lastRun         DateTime?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  @@schema("tenant")
}

-----------------------------

