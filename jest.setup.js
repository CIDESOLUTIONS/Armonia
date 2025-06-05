/**
 * Configuración global de mocks para Jest
 * Este archivo centraliza todos los mocks necesarios para las pruebas
 */

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

// Mock de utilidades de plantillas - usando factory inline para evitar errores de referencia
jest.mock('./src/lib/templates/template-service', () => ({
  registerTemplate: jest.fn().mockReturnValue(true),
  getTemplate: jest.fn().mockReturnValue({
    content: '<html><body>Plantilla de prueba</body></html>',
    defaultVars: { appName: 'Armonía Test' }
  }),
  renderTemplate: jest.fn().mockReturnValue('<html><body>Plantilla renderizada</body></html>'),
  removeTemplate: jest.fn().mockReturnValue(true),
  updateTemplate: jest.fn().mockReturnValue(true),
  getAllTemplateNames: jest.fn().mockReturnValue(['email', 'notification', 'receipt']),
  hasTemplate: jest.fn().mockReturnValue(true)
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

// Definir constantes globales para pruebas
global.PQRCategory = {
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

global.PQRStatus = {
  OPEN: 'OPEN',
  ASSIGNED: 'ASSIGNED',
  IN_PROGRESS: 'IN_PROGRESS',
  PENDING_INFO: 'PENDING_INFO',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
  CANCELLED: 'CANCELLED'
};

global.PQRPriority = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
  CRITICAL: 'CRITICAL'
};

global.VisitStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};

global.VisitType = {
  DELIVERY: 'DELIVERY',
  GUEST: 'GUEST',
  SERVICE: 'SERVICE',
  FAMILY: 'FAMILY',
  OTHER: 'OTHER'
};

// Mock para Date.now
const originalDateNow = Date.now;
global.mockDateNow = (mockTimestamp) => {
  Date.now = jest.fn(() => mockTimestamp);
};

global.restoreDateNow = () => {
  Date.now = originalDateNow;
};

// Mock de PaymentService
global.PaymentService = {
  processPayment: jest.fn().mockResolvedValue({ success: true, transactionId: 'mock-tx-123' }),
  getPaymentStatus: jest.fn().mockResolvedValue({ status: 'COMPLETED' }),
  refundPayment: jest.fn().mockResolvedValue({ success: true, refundId: 'mock-refund-123' })
};

// Configuración global para pruebas
beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  // Restaurar Date.now original después de cada prueba
  global.restoreDateNow();
});
