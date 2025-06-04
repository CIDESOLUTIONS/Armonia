/**
 * Mock de constantes para el módulo de Intercom de la aplicación Armonía
 * Define estados de visitas, tipos y otros valores constantes
 * Adaptado a CommonJS para compatibilidad con Jest
 */

// Estados de visitas
export const VisitStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};

// Tipos de visitas
export const VisitType = {
  DELIVERY: 'DELIVERY',
  GUEST: 'GUEST',
  SERVICE: 'SERVICE',
  FAMILY: 'FAMILY',
  OTHER: 'OTHER'
};

// Tipos de notificaciones de intercom
export const IntercomNotificationType = {
  VISIT_REQUEST: 'VISIT_REQUEST',
  VISIT_APPROVED: 'VISIT_APPROVED',
  VISIT_REJECTED: 'VISIT_REJECTED',
  VISIT_ARRIVED: 'VISIT_ARRIVED',
  VISIT_COMPLETED: 'VISIT_COMPLETED',
  PACKAGE_ARRIVED: 'PACKAGE_ARRIVED',
  EMERGENCY: 'EMERGENCY',
  ANNOUNCEMENT: 'ANNOUNCEMENT'
};

// Prioridades de notificaciones
export const NotificationPriority = {
  LOW: 'LOW',
  NORMAL: 'NORMAL',
  HIGH: 'HIGH',
  URGENT: 'URGENT'
};

// Exportar todas las constantes
export default {
  VisitStatus,
  VisitType,
  IntercomNotificationType,
  NotificationPriority
};
