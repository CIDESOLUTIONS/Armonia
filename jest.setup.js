/**
 * Configuración global de mocks para Jest
 * Este archivo centraliza todos los mocks necesarios para las pruebas
 */

// Importar configuración de Prisma mock extendido
require('./src/services/__mocks__/jest-prisma-setup');

// Importar mocks de enums y constantes
const { PQRCategory, PQRStatus, PQRPriority } = require('./src/services/__mocks__/pqr-constants');
const { VisitStatus, VisitType } = require('./src/services/__mocks__/intercom-constants');

// Importar utilidades de fecha
const { restoreDateNow, mockDateNow } = require('./src/services/__mocks__/date-utils');

// Asegurar que Date.now sea una función
if (typeof Date.now !== 'function') {
  Date.now = function() {
    return new Date().getTime();
  };
}

// Mock de módulos de comunicación
jest.mock('./src/lib/communications/email-service', () => ({
  sendEmail: jest.fn().mockResolvedValue({ success: true })
}));

jest.mock('./src/lib/communications/push-notification-service', () => ({
  sendPushNotification: jest.fn().mockResolvedValue({ success: true })
}));

jest.mock('./src/lib/communications/sms-service', () => ({
  sendSMS: jest.fn().mockResolvedValue({ success: true })
}));

jest.mock('./src/lib/communications/whatsapp-service', () => ({
  sendWhatsAppMessage: jest.fn().mockResolvedValue({ success: true })
}));

// Mock de utilidades de plantillas - usando ruta correcta o creando stub si no existe
try {
  // Intentar requerir el servicio real primero para verificar si existe
  require('./src/lib/templates/template-service');
  // Si existe, mockearlo
  jest.mock('./src/lib/templates/template-service', () => require('./src/services/__mocks__/template-service'));
} catch (e) {
  // Si no existe, crear un stub global para cualquier import de servicios de plantillas
  const templateServiceMock = require('./src/services/__mocks__/template-service');
  global.templateServiceMock = templateServiceMock;
}

// Mock de utilidades
jest.mock('./src/lib/prisma', () => ({
  getSchemaFromRequest: jest.fn().mockReturnValue({
    $connect: jest.fn().mockResolvedValue({}),
    $disconnect: jest.fn().mockResolvedValue({}),
    $queryRaw: jest.fn().mockResolvedValue([]),
    pQR: {
      findUnique: jest.fn().mockResolvedValue(null),
      findMany: jest.fn().mockResolvedValue([]),
      create: jest.fn().mockResolvedValue({}),
      update: jest.fn().mockResolvedValue({}),
      delete: jest.fn().mockResolvedValue({})
    },
    user: {
      findUnique: jest.fn().mockResolvedValue(null),
      findMany: jest.fn().mockResolvedValue([])
    },
    pQRNotification: {
      create: jest.fn().mockResolvedValue({})
    },
    userNotificationPreference: {
      findUnique: jest.fn().mockResolvedValue({
        userId: 1,
        channels: JSON.stringify(['EMAIL', 'WHATSAPP']),
        pqrStatusUpdates: true
      })
    }
  }),
  getPrismaClient: jest.fn(),
  getTenantPrismaClient: jest.fn()
}));

// Configuración global para pruebas
beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  // Restaurar Date.now original después de cada prueba
  restoreDateNow();
});
