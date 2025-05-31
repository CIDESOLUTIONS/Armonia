# Sistema de Comunicaciones en Tiempo Real - Armonía

Este módulo implementa un sistema completo de comunicaciones en tiempo real para la plataforma Armonía, permitiendo notificaciones, mensajes, anuncios y eventos comunitarios.

## Componentes Principales

### 1. Contexto de Comunicaciones en Tiempo Real
`real-time-context.tsx` proporciona un contexto de React para gestionar todas las comunicaciones en tiempo real, incluyendo:
- Notificaciones del sistema
- Mensajes entre usuarios
- Estado de conexión de usuarios
- Eventos en tiempo real

### 2. Servidor WebSocket
`websocket-server.ts` implementa el servidor WebSocket para manejar comunicaciones bidireccionales, incluyendo:
- Autenticación de conexiones
- Gestión de usuarios conectados
- Envío de notificaciones y mensajes
- Manejo de eventos en tiempo real

### 3. Servicio de Notificaciones
`notification-service.ts` proporciona funciones para enviar y gestionar notificaciones:
- Notificaciones a usuarios específicos
- Notificaciones por rol (administradores, residentes, etc.)
- Notificaciones a todos los usuarios
- Confirmación de lectura de notificaciones

### 4. Tablón de Anuncios
`AnnouncementBoard.tsx` implementa un tablón de anuncios interactivo con:
- Visualización de anuncios por categoría
- Filtrado por estado (leídos/no leídos)
- Confirmación de lectura para anuncios importantes
- Soporte para archivos adjuntos

### 5. Calendario Comunitario
`CommunityCalendar.tsx` implementa un calendario de eventos comunitarios con:
- Vista mensual y de lista
- Registro de asistencia a eventos
- Límite de asistentes por evento
- Detalles completos de cada evento

## APIs Disponibles

### Notificaciones
- `GET /api/communications/notifications`: Obtiene notificaciones del usuario
- `POST /api/communications/notifications`: Crea una nueva notificación (admin)
- `PUT /api/communications/notifications/[id]/read`: Marca una notificación como leída

### Anuncios
- `GET /api/communications/announcements`: Obtiene anuncios disponibles
- `POST /api/communications/announcements`: Crea un nuevo anuncio (admin)
- `POST /api/communications/announcements/[id]/read`: Marca un anuncio como leído
- `POST /api/communications/announcements/[id]/confirm`: Confirma lectura de un anuncio

### Eventos
- `GET /api/communications/events`: Obtiene eventos del calendario
- `POST /api/communications/events`: Crea un nuevo evento (admin)
- `POST /api/communications/events/[id]/attendance`: Registra asistencia a un evento

## Validación y Pruebas

El sistema incluye herramientas para validar su funcionamiento:
- `validation.ts`: Funciones para validar componentes individuales
- `integration-test.ts`: Script para pruebas de integración completas

## Uso

Para utilizar el sistema de comunicaciones en componentes:

```tsx
import { useRealTimeCommunication } from '@/lib/communications/real-time-context';

function MyComponent() {
  const { 
    notifications, 
    unreadNotificationsCount,
    markNotificationAsRead 
  } = useRealTimeCommunication();
  
  // Usar las notificaciones y funciones relacionadas
}
```

Para enviar notificaciones desde el backend:

```ts
import { notifyUser, notifyByRole } from '@/lib/communications/notification-service';

// Notificar a un usuario específico
await notifyUser(userId, {
  type: 'info',
  title: 'Título de la notificación',
  message: 'Contenido de la notificación'
});

// Notificar a todos los usuarios con un rol específico
await notifyByRole('resident', {
  type: 'warning',
  title: 'Mantenimiento programado',
  message: 'El servicio de agua estará suspendido...',
  requireConfirmation: true
});
```
