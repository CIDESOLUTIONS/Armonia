/**
 * Constantes para el módulo PQR (Peticiones, Quejas y Reclamos)
 * Adaptado a CommonJS para compatibilidad con Jest
 */

/**
 * Categorías de PQR
 * @enum {string}
 */
const PQRCategory = {
  MAINTENANCE: 'MAINTENANCE',
  SECURITY: 'SECURITY',
  NOISE: 'NOISE',
  PAYMENTS: 'PAYMENTS',
  SERVICES: 'SERVICES',
  COMMON_AREAS: 'COMMON_AREAS',
  ADMINISTRATION: 'ADMINISTRATION',
  NEIGHBORS: 'NEIGHBORS',
  PETS: 'PETS',
  PARKING: 'PARKING',
  OTHER: 'OTHER'
};

/**
 * Estados de PQR
 * @enum {string}
 */
const PQRStatus = {
  DRAFT: 'DRAFT',
  SUBMITTED: 'SUBMITTED',
  IN_REVIEW: 'IN_REVIEW',
  ASSIGNED: 'ASSIGNED',
  IN_PROGRESS: 'IN_PROGRESS',
  WAITING_INFO: 'WAITING_INFO',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
  CANCELLED: 'CANCELLED',
  REJECTED: 'REJECTED'
};

/**
 * Prioridades de PQR
 * @enum {string}
 */
const PQRPriority = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL'
};

/**
 * Tipos de PQR
 * @enum {string}
 */
const PQRType = {
  PETITION: 'PETITION',
  COMPLAINT: 'COMPLAINT',
  CLAIM: 'CLAIM',
  SUGGESTION: 'SUGGESTION'
};

/**
 * Canales de comunicación para PQR
 * @enum {string}
 */
const PQRChannel = {
  WEB: 'WEB',
  MOBILE: 'MOBILE',
  EMAIL: 'EMAIL',
  PHONE: 'PHONE',
  IN_PERSON: 'IN_PERSON',
  OTHER: 'OTHER'
};

/**
 * Plantillas de notificación para PQR
 * @enum {string}
 */
const PQRNotificationTemplate = {
  CREATED: 'PQR_CREATED',
  ASSIGNED: 'PQR_ASSIGNED',
  STATUS_CHANGED: 'PQR_STATUS_CHANGED',
  COMMENT_ADDED: 'PQR_COMMENT_ADDED',
  RESOLVED: 'PQR_RESOLVED',
  CLOSED: 'PQR_CLOSED',
  REOPENED: 'PQR_REOPENED',
  REMINDER: 'PQR_REMINDER',
  ESCALATED: 'PQR_ESCALATED'
};

/**
 * Roles de usuario para PQR
 * @enum {string}
 */
const PQRUserRole = {
  REQUESTER: 'REQUESTER',
  ASSIGNEE: 'ASSIGNEE',
  SUPERVISOR: 'SUPERVISOR',
  ADMIN: 'ADMIN',
  VIEWER: 'VIEWER'
};

/**
 * Configuración de tiempos para PQR (en horas)
 * @type {Object}
 */
const PQRTimeConfig = {
  RESPONSE_TIME: {
    LOW: 72,
    MEDIUM: 48,
    HIGH: 24,
    CRITICAL: 4
  },
  RESOLUTION_TIME: {
    LOW: 240,
    MEDIUM: 120,
    HIGH: 72,
    CRITICAL: 24
  },
  REMINDER_BEFORE_DUE: 24,
  ESCALATION_AFTER_DUE: 24
};

/**
 * Configuración de asignación automática para PQR
 * @type {Object}
 */
const PQRAssignmentConfig = {
  ENABLED: true,
  CATEGORIES: {
    MAINTENANCE: 'maintenance_team',
    SECURITY: 'security_team',
    PAYMENTS: 'finance_team',
    DEFAULT: 'admin_team'
  },
  LOAD_BALANCING: true,
  MAX_ASSIGNMENTS_PER_USER: 10
};

// Exportar constantes usando CommonJS para compatibilidad con Jest
module.exports = {
  PQRCategory,
  PQRStatus,
  PQRPriority,
  PQRType,
  PQRChannel,
  PQRNotificationTemplate,
  PQRUserRole,
  PQRTimeConfig,
  PQRAssignmentConfig
};
