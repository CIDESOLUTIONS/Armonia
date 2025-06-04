/**
 * Constantes para el módulo PQR de la aplicación Armonía
 * Define categorías, estados, prioridades y otros valores constantes
 * Adaptado a CommonJS para compatibilidad con Jest
 */

// Categorías de PQR
const PQRCategory = {
  MAINTENANCE: 'MAINTENANCE',
  SECURITY: 'SECURITY',
  NOISE: 'NOISE',
  COMMON_AREAS: 'COMMON_AREAS',
  PAYMENTS: 'PAYMENTS',
  SERVICES: 'SERVICES',
  ADMINISTRATIVE: 'ADMINISTRATIVE',
  OTHER: 'OTHER'
};

// Estados de PQR
const PQRStatus = {
  OPEN: 'OPEN',
  ASSIGNED: 'ASSIGNED',
  IN_PROGRESS: 'IN_PROGRESS',
  PENDING_INFO: 'PENDING_INFO',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
  CANCELLED: 'CANCELLED'
};

// Prioridades de PQR
const PQRPriority = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL'
};

// Tipos de PQR
const PQRType = {
  COMPLAINT: 'COMPLAINT',
  CLAIM: 'CLAIM',
  REQUEST: 'REQUEST',
  SUGGESTION: 'SUGGESTION',
  INQUIRY: 'INQUIRY'
};

// Tipos de archivos permitidos para PQR
const PQRAllowedFileTypes = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain'
];

// Tamaño máximo de archivos para PQR (en bytes)
const PQRMaxFileSize = 5 * 1024 * 1024; // 5MB

// Límites de caracteres para campos de PQR
const PQRCharacterLimits = {
  TITLE: 100,
  DESCRIPTION: 2000,
  COMMENT: 1000
};

// Tiempos de respuesta objetivo por prioridad (en horas)
const PQRResponseTimes = {
  LOW: 72,
  MEDIUM: 48,
  HIGH: 24,
  CRITICAL: 4
};

// Plantillas de notificación para PQR
const PQRNotificationTemplates = {
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

// Exportar todas las constantes usando CommonJS para compatibilidad con Jest
module.exports = {
  PQRCategory,
  PQRStatus,
  PQRPriority,
  PQRType,
  PQRAllowedFileTypes,
  PQRMaxFileSize,
  PQRCharacterLimits,
  PQRResponseTimes,
  PQRNotificationTemplates
};
