/**
 * Configuración global para pruebas Jest
 * Establece mocks y utilidades comunes para todas las pruebas
 */

// Importar mocks de enums y constantes
import { PQRCategory, PQRStatus, PQRPriority, PQRType } from './pqr-constants';

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
    PQRType
  };
});

// Mock de módulos de comunicación
jest.mock('../../lib/communications/email-service', () => ({
  sendEmail: jest.fn().mockResolvedValue({ success: true })
}));

jest.mock('../../lib/communications/push-notification-service', () => ({
  sendPushNotification: jest.fn().mockResolvedValue({ success: true })
}));

jest.mock('../../lib/communications/sms-service', () => ({
  sendSMS: jest.fn().mockResolvedValue({ success: true })
}));

// Mock de utilidades
jest.mock('../../lib/prisma', () => ({
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
global.beforeEach(() => {
  jest.clearAllMocks();
});

// Exportar enums y constantes para uso en pruebas
export {
  PQRCategory,
  PQRStatus,
  PQRPriority,
  PQRType
};
