# Diseño del Sistema de Gestión de Incidentes

## Introducción

Este documento describe el diseño del sistema de gestión de incidentes para el proyecto Armonía, como parte de la fase 3 de desarrollo. El sistema permitirá gestionar de manera eficiente todos los tipos de incidentes en conjuntos residenciales, desde problemas de seguridad hasta mantenimiento y emergencias.

## Análisis del Modelo Actual

El modelo actual (`Incident` e `IncidentUpdate`) en el esquema Prisma contiene campos básicos:
- Título y descripción del incidente
- Categorización simple (seguridad, mantenimiento, emergencia)
- Priorización básica
- Asignación a responsables
- Seguimiento de estado simple
- Soporte básico para adjuntos
- Actualizaciones como entradas separadas

## Ampliaciones Diseñadas

Para implementar un sistema completo de gestión de incidentes, se han diseñado las siguientes ampliaciones:

### 1. Enumeraciones Tipadas

Se han creado enumeraciones para:
- Categorías de incidentes (seguridad, mantenimiento, emergencia, etc.)
- Prioridades (baja, media, alta, crítica)
- Estados (reportado, asignado, en progreso, resuelto, etc.)
- Tipos de notificación (email, SMS, push, etc.)
- Tipos de adjuntos (imagen, documento, video, etc.)

### 2. Modelo Principal Mejorado

El modelo `Incident` ha sido ampliado con:
- Número único de incidente para referencia
- Categorización avanzada con subcategorías
- Ubicación detallada del incidente
- Fechas y tiempos completos para seguimiento
- Información detallada de personas involucradas
- Campos para resolución y causa raíz
- Etiquetas y clasificación avanzada
- Campos para SLA y métricas
- Relaciones con otros módulos (visitantes, paquetes)
- Soporte para múltiples adjuntos

### 3. Workflow y Trazabilidad

Se han implementado modelos para:
- `IncidentStatusHistory`: Historial completo de cambios de estado
- `IncidentComment`: Sistema de comentarios con respuestas anidadas
- `IncidentUpdate`: Actualizaciones de progreso mejoradas

### 4. Sistema de Notificaciones

Se han agregado modelos para:
- `IncidentNotification`: Registro de cada notificación enviada
- `IncidentNotificationTemplate`: Plantillas personalizables para diferentes eventos

### 5. SLA y Equipos

Se han creado modelos para:
- `IncidentSLA`: Definición de acuerdos de nivel de servicio
- `IncidentTeam`: Equipos de atención por categorías
- `IncidentSettings`: Configuración personalizable del sistema

### 6. Reportes y Categorías Personalizadas

Se han agregado modelos para:
- `IncidentReport`: Generación y programación de reportes
- `IncidentCustomCategory`: Categorías personalizables por conjunto

## Beneficios del Nuevo Diseño

- **Workflow avanzado**: Transiciones de estado controladas y trazabilidad completa
- **SLA integrado**: Tiempos de respuesta y resolución con alertas
- **Notificaciones automáticas**: Sistema completo de alertas y seguimiento
- **Colaboración mejorada**: Comentarios, equipos y asignaciones
- **Análisis avanzado**: Reportes, métricas y tendencias
- **Personalización**: Adaptable a las necesidades de cada conjunto

## Próximos Pasos

1. Ejecutar migraciones Prisma para actualizar la base de datos
2. Desarrollar servicios de acceso a datos
3. Implementar APIs RESTful
4. Validar el funcionamiento integral
5. Actualizar documentación técnica
