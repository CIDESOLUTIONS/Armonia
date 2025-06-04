/**
 * Configuración global de mocks para Jest
 * Este archivo centraliza todos los mocks necesarios para las pruebas
 */

// Importar mocks de enums y constantes
const { PQRCategory, PQRStatus, PQRPriority } = require('./src/services/__mocks__/pqr-constants');
const { VisitStatus, VisitType } = require('./src/services/__mocks__/intercom-constants');

// Configurar mocks globales para módulos externos
jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
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
      }
    })),
    // Exportar enums para que sean accesibles como si vinieran de @prisma/client
    PQRCategory,
    PQRStatus,
    PQRPriority,
    VisitStatus,
    VisitType
  };
});

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
    }
  })
}));

// Configuración global para pruebas
beforeEach(() => {
  jest.clearAllMocks();
});
