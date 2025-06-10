# Endpoints API para Sistema de Reservas de Áreas Comunes

## Descripción General

Este documento define los endpoints REST necesarios para implementar el sistema de reservas de áreas comunes en el proyecto Armonía. Los endpoints están diseñados para soportar todas las operaciones CRUD (Crear, Leer, Actualizar, Eliminar) para áreas comunes, reservas y configuraciones relacionadas.

## Endpoints para Áreas Comunes

### 1. Gestión de Áreas Comunes

#### GET /api/common-areas
- **Descripción**: Obtiene la lista de todas las áreas comunes disponibles
- **Parámetros de consulta**:
  - `active` (opcional): Filtrar por estado activo/inactivo
  - `requiresApproval` (opcional): Filtrar por áreas que requieren aprobación
  - `hasFee` (opcional): Filtrar por áreas con costo
- **Respuesta**: Array de objetos CommonArea

#### GET /api/common-areas/:id
- **Descripción**: Obtiene los detalles de un área común específica
- **Parámetros de ruta**:
  - `id`: Identificador del área común
- **Respuesta**: Objeto CommonArea con sus reglas y configuración de disponibilidad

#### POST /api/common-areas
- **Descripción**: Crea una nueva área común
- **Cuerpo de la solicitud**: Datos del área común (nombre, descripción, ubicación, etc.)
- **Respuesta**: Objeto CommonArea creado

#### PUT /api/common-areas/:id
- **Descripción**: Actualiza un área común existente
- **Parámetros de ruta**:
  - `id`: Identificador del área común
- **Cuerpo de la solicitud**: Datos actualizados del área común
- **Respuesta**: Objeto CommonArea actualizado

#### DELETE /api/common-areas/:id
- **Descripción**: Desactiva un área común (no elimina, solo marca como inactiva)
- **Parámetros de ruta**:
  - `id`: Identificador del área común
- **Respuesta**: Confirmación de desactivación

### 2. Disponibilidad de Áreas Comunes

#### GET /api/common-areas/:id/availability
- **Descripción**: Obtiene la configuración de disponibilidad de un área común
- **Parámetros de ruta**:
  - `id`: Identificador del área común
- **Parámetros de consulta**:
  - `startDate` (opcional): Fecha de inicio para verificar disponibilidad
  - `endDate` (opcional): Fecha de fin para verificar disponibilidad
- **Respuesta**: Objeto con la configuración de disponibilidad y slots disponibles/ocupados

#### PUT /api/common-areas/:id/availability
- **Descripción**: Actualiza la configuración de disponibilidad de un área común
- **Parámetros de ruta**:
  - `id`: Identificador del área común
- **Cuerpo de la solicitud**: Datos de configuración de disponibilidad
- **Respuesta**: Objeto AvailabilityConfig actualizado

## Endpoints para Reservas

### 1. Gestión de Reservas

#### GET /api/reservations
- **Descripción**: Obtiene la lista de reservas según filtros
- **Parámetros de consulta**:
  - `userId` (opcional): Filtrar por usuario
  - `propertyId` (opcional): Filtrar por propiedad
  - `commonAreaId` (opcional): Filtrar por área común
  - `status` (opcional): Filtrar por estado (PENDING, APPROVED, etc.)
  - `startDate` (opcional): Fecha de inicio para filtrar
  - `endDate` (opcional): Fecha de fin para filtrar
- **Respuesta**: Array de objetos Reservation

#### GET /api/reservations/:id
- **Descripción**: Obtiene los detalles de una reserva específica
- **Parámetros de ruta**:
  - `id`: Identificador de la reserva
- **Respuesta**: Objeto Reservation con detalles del área común y usuario

#### POST /api/reservations
- **Descripción**: Crea una nueva solicitud de reserva
- **Cuerpo de la solicitud**: Datos de la reserva (área común, fechas, descripción, etc.)
- **Respuesta**: Objeto Reservation creado

#### PUT /api/reservations/:id
- **Descripción**: Actualiza una reserva existente
- **Parámetros de ruta**:
  - `id`: Identificador de la reserva
- **Cuerpo de la solicitud**: Datos actualizados de la reserva
- **Respuesta**: Objeto Reservation actualizado

#### DELETE /api/reservations/:id
- **Descripción**: Cancela una reserva
- **Parámetros de ruta**:
  - `id`: Identificador de la reserva
- **Cuerpo de la solicitud**: Razón de cancelación
- **Respuesta**: Confirmación de cancelación

### 2. Aprobación de Reservas

#### PUT /api/reservations/:id/approve
- **Descripción**: Aprueba una solicitud de reserva pendiente
- **Parámetros de ruta**:
  - `id`: Identificador de la reserva
- **Cuerpo de la solicitud**: ID del administrador que aprueba
- **Respuesta**: Objeto Reservation actualizado

#### PUT /api/reservations/:id/reject
- **Descripción**: Rechaza una solicitud de reserva pendiente
- **Parámetros de ruta**:
  - `id`: Identificador de la reserva
- **Cuerpo de la solicitud**: Razón de rechazo y ID del administrador
- **Respuesta**: Objeto Reservation actualizado

## Endpoints para Notificaciones

### 1. Gestión de Notificaciones

#### GET /api/notifications
- **Descripción**: Obtiene las notificaciones del usuario actual
- **Parámetros de consulta**:
  - `isRead` (opcional): Filtrar por estado de lectura
  - `type` (opcional): Filtrar por tipo de notificación
- **Respuesta**: Array de objetos ReservationNotification

#### GET /api/notifications/:id
- **Descripción**: Obtiene los detalles de una notificación específica
- **Parámetros de ruta**:
  - `id`: Identificador de la notificación
- **Respuesta**: Objeto ReservationNotification

#### PUT /api/notifications/:id/read
- **Descripción**: Marca una notificación como leída
- **Parámetros de ruta**:
  - `id`: Identificador de la notificación
- **Respuesta**: Objeto ReservationNotification actualizado

## Consideraciones de Seguridad

- Todos los endpoints deben validar la autenticación del usuario
- Los endpoints de administración (creación/modificación de áreas comunes, aprobación de reservas) deben validar permisos de administrador
- Las operaciones de reserva deben validar que el usuario tenga una propiedad asociada en el conjunto residencial
- Las cancelaciones deben respetar las reglas de tiempo mínimo configuradas

## Integración con Otros Sistemas

- El sistema de reservas debe integrarse con el sistema de notificaciones para enviar alertas
- Para áreas con costo, debe integrarse con el sistema financiero para registrar pagos
- Las reservas deben validar contra el sistema de usuarios y propiedades para verificar permisos

Este diseño de endpoints proporciona una API RESTful completa para soportar todas las funcionalidades requeridas por el sistema de reservas de áreas comunes en el proyecto Armonía.
