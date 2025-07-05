/**
 * Enums para el servicio de Intercom
 * Adaptado a CommonJS para compatibilidad con Jest
 */

// Estados de visita
const VisitStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  IN_PROGRESS: 'IN_PROGRESS',
  EXPIRED: 'EXPIRED'
};

// Tipos de visitante
const VisitorType = {
  GUEST: 'GUEST',
  DELIVERY: 'DELIVERY',
  SERVICE: 'SERVICE',
  STAFF: 'STAFF',
  EMERGENCY: 'EMERGENCY',
  OTHER: 'OTHER'
};

// Tipos de notificación
const NotificationType = {
  SMS: 'SMS',
  EMAIL: 'EMAIL',
  PUSH: 'PUSH',
  CALL: 'CALL',
  INTERCOM: 'INTERCOM'
};

// Tipos de acceso
const AccessType = {
  TEMPORARY: 'TEMPORARY',
  PERMANENT: 'PERMANENT',
  SCHEDULED: 'SCHEDULED',
  EMERGENCY: 'EMERGENCY'
};

// Exportar enums usando CommonJS para compatibilidad con Jest
module.exports = {
  VisitStatus,
  VisitorType,
  NotificationType,
  AccessType
};
