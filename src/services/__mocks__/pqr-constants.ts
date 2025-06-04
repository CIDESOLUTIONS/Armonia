/**
 * Mock de constantes para el módulo PQR de la aplicación Armonía
 * Para uso en pruebas unitarias y de integración
 */

// Categorías de PQR
export const PQRCategory = {
  MAINTENANCE: 'MAINTENANCE',
  SECURITY: 'SECURITY',
  NOISE: 'NOISE',
  COMMON_AREAS: 'COMMON_AREAS',
  PAYMENTS: 'PAYMENTS',
  SERVICES: 'SERVICES',
  ADMINISTRATIVE: 'ADMINISTRATIVE',
  FINANCIAL: 'FINANCIAL',
  COMMUNITY: 'COMMUNITY',
  SUGGESTION: 'SUGGESTION',
  COMPLAINT: 'COMPLAINT',
  OTHER: 'OTHER'
};

// Estados de PQR
export const PQRStatus = {
  OPEN: 'OPEN',
  ASSIGNED: 'ASSIGNED',
  IN_PROGRESS: 'IN_PROGRESS',
  PENDING_INFO: 'PENDING_INFO',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
  CANCELLED: 'CANCELLED'
};

// Prioridades de PQR
export const PQRPriority = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
  CRITICAL: 'CRITICAL'
};

// Tipos de PQR
export const PQRType = {
  COMPLAINT: 'COMPLAINT',
  CLAIM: 'CLAIM',
  REQUEST: 'REQUEST',
  SUGGESTION: 'SUGGESTION',
  INQUIRY: 'INQUIRY'
};

// Plantillas de notificación para PQR
export const PQRNotificationTemplates = {
  CREATED: {
    TITLE: 'Nueva PQR: {{title}}',
    BODY: 'Se ha creado una nueva PQR con ID #{{id}}. {{description}}'
  },
  ASSIGNED: {
    TITLE: 'PQR #{{id}} asignada',
    BODY: 'La PQR "{{title}}" ha sido asignada a {{assignee}}.'
  },
  STATUS_CHANGED: {
    TITLE: 'Actualización de PQR #{{id}}',
    BODY: 'La PQR "{{title}}" ha cambiado de estado a {{status}}.'
  },
  COMMENT_ADDED: {
    TITLE: 'Nuevo comentario en PQR #{{id}}',
    BODY: '{{author}} ha comentado en la PQR "{{title}}": {{comment}}'
  },
  RESOLVED: {
    TITLE: 'PQR #{{id}} resuelta',
    BODY: 'La PQR "{{title}}" ha sido marcada como resuelta.'
  },
  CLOSED: {
    TITLE: 'PQR #{{id}} cerrada',
    BODY: 'La PQR "{{title}}" ha sido cerrada.'
  }
};

// Exportar todas las constantes
export default {
  PQRCategory,
  PQRStatus,
  PQRPriority,
  PQRType,
  PQRNotificationTemplates
};
