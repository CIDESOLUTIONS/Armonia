/**
 * Constantes globales para la aplicación Armonía
 */

// Roles de usuario
export const USER_ROLES = {
  ADMIN: 'ADMIN',
  COMPLEX_ADMIN: 'COMPLEX_ADMIN',
  RESIDENT: 'RESIDENT',
  STAFF: 'STAFF',
  GUEST: 'GUEST'
};

// Estados de PQR
export const PQR_STATUS = {
  OPEN: 'OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
  CANCELLED: 'CANCELLED'
};

// Prioridades de PQR
export const PQR_PRIORITY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL'
};

// Estados de asamblea
export const ASSEMBLY_STATUS = {
  SCHEDULED: 'SCHEDULED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};

// Tipos de notificación
export const NOTIFICATION_TYPES = {
  PQR: 'PQR',
  ASSEMBLY: 'ASSEMBLY',
  PAYMENT: 'PAYMENT',
  ANNOUNCEMENT: 'ANNOUNCEMENT',
  SECURITY: 'SECURITY'
};

// Configuración de JWT
export const JWT_CONFIG = {
  SECRET: process.env.JWT_SECRET || 'armonia-secret-key',
  EXPIRES_IN: '24h'
};

// Configuración de paginación
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100
};

// Configuración de seguridad
export const SECURITY = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_REQUIRES_UPPERCASE: true,
  PASSWORD_REQUIRES_NUMBER: true,
  PASSWORD_REQUIRES_SPECIAL: true,
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_TIME: 15 // minutos
};

// Configuración de correo electrónico
export const EMAIL = {
  FROM: 'notificaciones@armonia.com',
  SUBJECTS: {
    WELCOME: 'Bienvenido a Armonía',
    PASSWORD_RESET: 'Restablecimiento de contraseña',
    PQR_UPDATE: 'Actualización de su PQR',
    ASSEMBLY_INVITATION: 'Invitación a asamblea'
  }
};

// Configuración de archivos
export const FILES = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
};

// Configuración de API
export const API = {
  VERSION: 'v1',
  RATE_LIMIT: 100, // peticiones por minuto
  TIMEOUT: 30000 // 30 segundos
};
