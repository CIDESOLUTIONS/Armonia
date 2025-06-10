# Análisis y Requisitos para Integración con Cámaras IP - Fase 3

## Introducción

Este documento presenta el análisis técnico y los requisitos para la implementación de la integración con cámaras IP en el proyecto Armonía, como parte de la Fase 3 del plan integral de desarrollo. Esta funcionalidad permitirá a los administradores y residentes visualizar y gestionar las cámaras de seguridad del conjunto residencial directamente desde la plataforma.

## Objetivos

1. Integrar sistemas de videovigilancia IP con la plataforma Armonía
2. Proporcionar visualización en tiempo real de las cámaras de seguridad
3. Permitir la gestión centralizada de dispositivos de videovigilancia
4. Implementar controles de acceso basados en roles para la visualización de cámaras
5. Habilitar funcionalidades de grabación y reproducción de eventos

## Análisis Técnico

### Protocolos y Estándares

Para garantizar la compatibilidad con la mayor cantidad de dispositivos, se implementarán los siguientes protocolos:

1. **RTSP (Real Time Streaming Protocol)**: Protocolo estándar para la transmisión de video en tiempo real.
2. **ONVIF (Open Network Video Interface Forum)**: Estándar abierto que garantiza la interoperabilidad entre productos de videovigilancia.
3. **HTTP/HTTPS**: Para la comunicación con las APIs de las cámaras y la configuración de dispositivos.
4. **WebRTC**: Para la transmisión de video de baja latencia en navegadores web.

### Arquitectura Propuesta

La arquitectura para la integración de cámaras IP constará de los siguientes componentes:

1. **Servicio de Descubrimiento**: Detectará automáticamente cámaras IP en la red local mediante protocolos ONVIF y UPnP.
2. **Servicio de Gestión de Dispositivos**: Administrará la configuración, credenciales y estado de las cámaras.
3. **Servicio de Streaming**: Gestionará la transmisión de video desde las cámaras hacia los clientes.
4. **Servicio de Grabación**: Permitirá la grabación programada o por eventos de las cámaras.
5. **Componentes Frontend**: Visualizadores de video, controles de cámara y paneles de administración.

### Consideraciones de Seguridad

La integración con cámaras IP presenta desafíos importantes de seguridad que deben abordarse:

1. **Autenticación y Autorización**:
   - Implementación de autenticación robusta para acceso a las cámaras
   - Control de acceso basado en roles (RBAC) para determinar qué usuarios pueden ver qué cámaras
   - Tokens de sesión con tiempo limitado para acceso a streams de video

2. **Cifrado y Protección de Datos**:
   - Uso obligatorio de HTTPS para todas las comunicaciones de configuración
   - Cifrado de credenciales de cámaras almacenadas en la base de datos
   - Preferencia por RTSP sobre SSL cuando esté disponible

3. **Seguridad de Red**:
   - Aislamiento de cámaras en VLAN separada cuando sea posible
   - Implementación de proxy inverso para evitar exposición directa de cámaras a internet
   - Limitación de tasas de conexión para prevenir ataques DoS

4. **Auditoría y Monitoreo**:
   - Registro detallado de todos los accesos a cámaras
   - Alertas automáticas ante intentos de acceso no autorizados
   - Monitoreo de estado de las cámaras y notificación de desconexiones

## Requisitos Funcionales

### Gestión de Dispositivos

1. **Descubrimiento y Registro**:
   - Detección automática de cámaras en la red local
   - Registro manual de cámaras mediante URL y credenciales
   - Agrupación de cámaras por zonas o ubicaciones

2. **Configuración**:
   - Ajuste de parámetros básicos (resolución, FPS, calidad)
   - Configuración de credenciales de acceso
   - Programación de grabación y detección de movimiento

3. **Monitoreo de Estado**:
   - Verificación periódica de conectividad
   - Alertas de desconexión o problemas técnicos
   - Estadísticas de uso y rendimiento

### Visualización de Video

1. **Visualización en Tiempo Real**:
   - Reproductor de video compatible con múltiples navegadores
   - Soporte para visualización en dispositivos móviles
   - Opciones de calidad adaptativa según ancho de banda

2. **Vista Multi-cámara**:
   - Visualización simultánea de múltiples cámaras
   - Layouts configurables (2x2, 3x3, etc.)
   - Rotación automática entre cámaras

3. **Controles de Cámara**:
   - Pan, Tilt, Zoom (PTZ) para cámaras compatibles
   - Ajustes de brillo, contraste y otros parámetros
   - Captura de instantáneas

### Grabación y Reproducción

1. **Grabación Programada**:
   - Configuración de horarios de grabación
   - Ajustes de calidad y retención de grabaciones
   - Grabación en servidor local o en la nube

2. **Grabación por Eventos**:
   - Detección de movimiento
   - Integración con sensores y alarmas
   - Grabación pre y post evento

3. **Reproducción y Exportación**:
   - Línea de tiempo para navegación de grabaciones
   - Exportación de clips de video
   - Búsqueda por fecha, hora y eventos

### Control de Acceso

1. **Permisos por Rol**:
   - Administradores: acceso completo a todas las cámaras
   - Seguridad: visualización y control de todas las cámaras
   - Residentes: acceso limitado a cámaras de áreas comunes
   - Personalizado: permisos específicos por usuario y cámara

2. **Restricciones Temporales**:
   - Limitación de acceso por horarios
   - Caducidad automática de permisos temporales
   - Registro de tiempo de visualización

## Requisitos No Funcionales

1. **Rendimiento**:
   - Latencia máxima de 2 segundos para visualización en tiempo real
   - Soporte para al menos 16 cámaras simultáneas en el servidor
   - Optimización para diferentes anchos de banda

2. **Escalabilidad**:
   - Arquitectura que permita añadir más cámaras sin degradación del rendimiento
   - Soporte para múltiples servidores de streaming en instalaciones grandes
   - Balanceo de carga para distribución de conexiones

3. **Compatibilidad**:
   - Soporte para los principales fabricantes de cámaras IP
   - Compatibilidad con estándares ONVIF Perfil S como mínimo
   - Funcionamiento en navegadores modernos sin plugins adicionales

4. **Usabilidad**:
   - Interfaz intuitiva para administradores y usuarios finales
   - Tiempo de carga inicial inferior a 3 segundos
   - Diseño responsive para dispositivos móviles

## Modelo de Datos Propuesto

```prisma
model Camera {
  id                Int       @id @default(autoincrement())
  name              String
  description       String?
  manufacturer      String?
  model             String?
  serialNumber      String?
  firmwareVersion   String?
  ipAddress         String
  port              Int       @default(554)
  username          String?
  password          String?   // Almacenado cifrado
  rtspUrl           String?
  onvifUrl          String?
  httpUrl           String?
  isActive          Boolean   @default(true)
  status            String    @default("UNKNOWN") // ONLINE, OFFLINE, UNKNOWN
  lastStatusCheck   DateTime?
  location          String?
  zone              Zone?     @relation(fields: [zoneId], references: [id])
  zoneId            Int?
  ptzEnabled        Boolean   @default(false)
  recordingEnabled  Boolean   @default(false)
  motionDetection   Boolean   @default(false)
  streamSettings    Json?     // Configuración de resolución, FPS, etc.
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  createdBy         User?     @relation("CameraCreator", fields: [createdById], references: [id])
  createdById       Int?
  recordings        Recording[]
  snapshots         Snapshot[]
  cameraPermissions CameraPermission[]
}

model Zone {
  id          Int       @id @default(autoincrement())
  name        String
  description String?
  isPublic    Boolean   @default(false) // Si es true, todos los residentes pueden ver
  cameras     Camera[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model Recording {
  id          Int       @id @default(autoincrement())
  camera      Camera    @relation(fields: [cameraId], references: [id])
  cameraId    Int
  startTime   DateTime
  endTime     DateTime?
  duration    Int?      // En segundos
  fileSize    Int?      // En bytes
  filePath    String
  thumbnailPath String?
  triggerType String    // SCHEDULED, MOTION, MANUAL
  status      String    // RECORDING, COMPLETED, FAILED
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model Snapshot {
  id          Int       @id @default(autoincrement())
  camera      Camera    @relation(fields: [cameraId], references: [id])
  cameraId    Int
  timestamp   DateTime
  filePath    String
  takenBy     User?     @relation(fields: [takenById], references: [id])
  takenById   Int?
  description String?
  createdAt   DateTime  @default(now())
}

model CameraPermission {
  id          Int       @id @default(autoincrement())
  camera      Camera    @relation(fields: [cameraId], references: [id])
  cameraId    Int
  user        User      @relation(fields: [userId], references: [id])
  userId      Int
  canView     Boolean   @default(true)
  canControl  Boolean   @default(false)
  canRecord   Boolean   @default(false)
  startTime   DateTime? // Hora de inicio de permiso (opcional)
  endTime     DateTime? // Hora de fin de permiso (opcional)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  createdBy   User?     @relation("PermissionCreator", fields: [createdById], references: [id])
  createdById Int?

  @@unique([cameraId, userId])
}
```

## Tecnologías Recomendadas

1. **Backend**:
   - Node.js con Express para APIs REST
   - Socket.IO para comunicación en tiempo real
   - FFmpeg para transcodificación y manipulación de video
   - node-onvif para comunicación con cámaras ONVIF

2. **Frontend**:
   - React para componentes de UI
   - Video.js o HLS.js para reproducción de video
   - WebRTC para streaming de baja latencia
   - React Grid Layout para vistas multi-cámara

3. **Almacenamiento**:
   - Sistema de archivos para grabaciones (con opción de NAS)
   - Base de datos PostgreSQL para metadatos
   - Redis para caché y gestión de sesiones

## Plan de Implementación

La implementación se dividirá en las siguientes fases:

1. **Fase 1: Infraestructura Base**
   - Definición de modelos de datos
   - Implementación de servicios de descubrimiento y gestión de dispositivos
   - Configuración de seguridad y cifrado

2. **Fase 2: Visualización Básica**
   - Desarrollo de componentes de visualización de video
   - Implementación de controles básicos de cámara
   - Integración con sistema de autenticación existente

3. **Fase 3: Grabación y Reproducción**
   - Implementación de servicio de grabación
   - Desarrollo de interfaz de reproducción
   - Gestión de almacenamiento y retención

4. **Fase 4: Funcionalidades Avanzadas**
   - Control PTZ avanzado
   - Detección de movimiento y eventos
   - Notificaciones y alertas

## Consideraciones de Implementación

1. **Optimización de Recursos**:
   - Implementación de streaming adaptativo
   - Transcodificación bajo demanda para dispositivos de baja capacidad
   - Gestión eficiente de conexiones simultáneas

2. **Manejo de Fallos**:
   - Reconexión automática a cámaras
   - Fallback a calidad inferior en caso de problemas de red
   - Registro detallado de errores para diagnóstico

3. **Pruebas**:
   - Pruebas con diferentes modelos de cámaras
   - Simulación de condiciones de red adversas
   - Pruebas de carga para múltiples conexiones simultáneas

## Conclusión

La integración con cámaras IP representa una mejora significativa en las capacidades de seguridad y monitoreo de la plataforma Armonía. La implementación propuesta garantiza compatibilidad con una amplia gama de dispositivos, seguridad robusta y una experiencia de usuario fluida.

Este análisis servirá como base para la implementación de la funcionalidad, que se desarrollará siguiendo el enfoque incremental y modular establecido para el proyecto Armonía.
