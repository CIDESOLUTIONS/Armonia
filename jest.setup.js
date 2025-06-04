/**
 * Configuración global de mocks para Jest
 * Este archivo centraliza todos los mocks necesarios para las pruebas
 */

// Importar configuración de Prisma mock extendido
// Usando jest.requireActual para evitar problemas con 'require'
const prismaMockSetup = jest.requireActual('./src/services/__mocks__/jest-prisma-setup');

// Importar mocks de enums y constantes usando jest.requireActual
const pqrConstants = jest.requireActual('./src/services/__mocks__/pqr-constants');
const intercomConstants = jest.requireActual('./src/services/__mocks__/intercom-constants');

// Definir explícitamente las variables para evitar errores
const PQRCategory = pqrConstants.PQRCategory || {};
const PQRStatus = pqrConstants.PQRStatus || {};
const PQRPriority = pqrConstants.PQRPriority || {};
const VisitStatus = intercomConstants.VisitStatus || {};
const VisitType = intercomConstants.VisitType || {};

// Importar utilidades de fecha
const dateUtils = jest.requireActual('./src/services/__mocks__/date-utils');
const restoreDateNow = dateUtils.restoreDateNow;
const mockDateNow = dateUtils.mockDateNow;

// Asegurar que Date.now sea una función
if (typeof Date.now !== 'function') {
  Date.now = function() {
    return new Date().getTime();
  };
}

// Mock de PaymentService - usando jest.requireActual para evitar errores
const PaymentService = jest.requireActual('./src/services/__mocks__/payment-service');
// Registrar globalmente para que esté disponible en todos los tests
global.PaymentService = PaymentService;

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

// Mock de utilidades de plantillas - usando try/catch para evitar errores
const templateServiceMock = jest.requireActual('./src/services/__mocks__/template-service');
global.templateServiceMock = templateServiceMock;

// Condicionar el mock de template-service para evitar errores si no existe
try {
  // Verificar si el módulo existe antes de mockearlo
  jest.requireActual('./src/lib/templates/template-service');
  // Si existe, mockearlo
  jest.mock('./src/lib/templates/template-service', () => templateServiceMock);
} catch (e) {
  // Si no existe, no hacer nada y evitar el error
  console.log('Módulo template-service no encontrado, se usa mock global');
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
    },
    visitor: {
      findUnique: jest.fn().mockResolvedValue({
        id: 1,
        name: 'Visitante Test',
        documentType: 'CC',
        documentNumber: '123456789',
        phone: '3001234567'
      }),
      create: jest.fn().mockResolvedValue({
        id: 2,
        name: 'Nuevo Visitante',
        documentType: 'CC',
        documentNumber: '987654321',
        phone: '3007654321'
      })
    },
    visit: {
      create: jest.fn().mockResolvedValue({
        id: 1,
        visitorId: 1,
        unitId: 101,
        purpose: 'Visita social',
        status: 'PENDING',
        createdAt: new Date()
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
  if (typeof restoreDateNow === 'function') {
    restoreDateNow();
  }
});
