/**
 * Configuración de mocks globales para Jest
 * 
 * Este archivo configura los mocks necesarios para las pruebas
 * y se carga antes de la ejecución de las pruebas.
 */

// Importar helper para mocks avanzados de Prisma
// Usando import dinámico para evitar problemas con 'require'
const prismaHelperPath = './src/services/__mocks__/prisma-mock-helper';
const { createPrismaClientMock } = jest.requireActual(prismaHelperPath);

// Crear un mock avanzado para PrismaClient usando el helper
const mockPrismaClient = createPrismaClientMock({
  pQR: {
    findUnique: {
      id: 1,
      ticketNumber: 'PQR-001',
      title: 'Solicitud de prueba',
      description: 'Descripción de prueba',
      status: 'IN_PROGRESS',
      priority: 'MEDIUM',
      category: 'MAINTENANCE',
      userId: 1,
      assignedToId: 2,
      dueDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      closedAt: null,
      reopenedAt: null,
      reopenReason: null,
      tags: ['MAINTENANCE', 'URGENT']
    },
    findMany: [
      {
        id: 1,
        ticketNumber: 'PQR-001',
        title: 'Solicitud de prueba 1',
        description: 'Descripción de prueba 1',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        category: 'MAINTENANCE',
        userId: 1,
        assignedToId: 2,
        dueDate: new Date(),
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
        closedAt: null,
        reopenedAt: null,
        reopenReason: null,
        tags: ['MAINTENANCE', 'URGENT']
      },
      {
        id: 2,
        ticketNumber: 'PQR-002',
        title: 'Solicitud de prueba 2',
        description: 'Descripción de prueba 2',
        status: 'RESOLVED',
        priority: 'HIGH',
        category: 'SECURITY',
        userId: 1,
        assignedToId: 3,
        dueDate: new Date(),
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
        closedAt: new Date(),
        reopenedAt: null,
        reopenReason: null,
        tags: ['SECURITY', 'CAMERA']
      },
      {
        id: 3,
        ticketNumber: 'PQR-003',
        title: 'Solicitud de prueba 3',
        description: 'Descripción de prueba 3',
        status: 'CLOSED',
        priority: 'LOW',
        category: 'SERVICES',
        userId: 2,
        assignedToId: 2,
        dueDate: new Date(),
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
        closedAt: new Date(),
        reopenedAt: null,
        reopenReason: null,
        tags: ['SERVICES', 'INTERNET']
      }
    ],
    groupBy: [
      { status: 'IN_PROGRESS', _count: { id: 1 } },
      { status: 'RESOLVED', _count: { id: 1 } },
      { status: 'CLOSED', _count: { id: 1 } }
    ],
    count: 3
  },
  user: {
    findUnique: {
      id: 1,
      name: 'Usuario de Prueba',
      email: 'usuario@ejemplo.com',
      role: 'RESIDENT',
      active: true
    },
    findMany: [
      {
        id: 1,
        name: 'Usuario Residente',
        email: 'residente@ejemplo.com',
        role: 'RESIDENT',
        active: true
      },
      {
        id: 2,
        name: 'Usuario Administrador',
        email: 'admin@ejemplo.com',
        role: 'ADMIN',
        active: true
      },
      {
        id: 3,
        name: 'Usuario Técnico',
        email: 'tecnico@ejemplo.com',
        role: 'STAFF',
        active: true
      }
    ],
    count: 3
  },
  pQRNotification: createPrismaModelMock(defaultData.pQRNotification || {}),
  assembly: createPrismaModelMock(defaultData.assembly || {
    findUnique: { id: 1, title: 'Asamblea de Prueba', date: new Date() },
    findMany: [],
    create: { id: 1, title: 'Nueva Asamblea', date: new Date() },
  }),
});

// Configurar mock para getSchemaFromRequest
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  prisma: mockPrismaClient, // Exportar la instancia global
  getPrisma: () => mockPrismaClient, // Exportar la función que devuelve la instancia
  getSchemaFromRequest: jest.fn((schemaName) => {
    return mockPrismaClient;
  }),
}));

// Configuración global para pruebas
global.mockPrismaClient = mockPrismaClient;

// Mock para constantes PQR
jest.mock('./src/lib/constants/pqr-constants', () => {
  return {
    PQRCategory: {
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
    },
    PQRStatus: {
      DRAFT: 'DRAFT',
      SUBMITTED: 'SUBMITTED',
      OPEN: 'OPEN',
      IN_REVIEW: 'IN_REVIEW',
      ASSIGNED: 'ASSIGNED',
      IN_PROGRESS: 'IN_PROGRESS',
      WAITING_INFO: 'WAITING_INFO',
      RESOLVED: 'RESOLVED',
      CLOSED: 'CLOSED',
      CANCELLED: 'CANCELLED',
      REOPENED: 'REOPENED',
      REJECTED: 'REJECTED'
    },
    PQRPriority: {
      LOW: 'LOW',
      MEDIUM: 'MEDIUM',
      HIGH: 'HIGH',
      CRITICAL: 'CRITICAL',
      URGENT: 'URGENT' // Añadido para compatibilidad con ambas versiones
    },
    PQRType: {
      PETITION: 'PETITION',
      COMPLAINT: 'COMPLAINT',
      CLAIM: 'CLAIM',
      SUGGESTION: 'SUGGESTION',
      REQUEST: 'REQUEST', // Añadido para compatibilidad
      INQUIRY: 'INQUIRY' // Añadido para compatibilidad
    },
    PQRChannel: {
      WEB: 'WEB',
      MOBILE: 'MOBILE',
      EMAIL: 'EMAIL',
      PHONE: 'PHONE',
      IN_PERSON: 'IN_PERSON'
    },
    PQRNotificationTemplate: {
      CREATED: 'PQR_CREATED',
      ASSIGNED: 'PQR_ASSIGNED',
      STATUS_CHANGED: 'PQR_STATUS_CHANGED',
      COMMENT_ADDED: 'PQR_COMMENT_ADDED',
      RESOLVED: 'PQR_RESOLVED',
      CLOSED: 'PQR_CLOSED',
      REOPENED: 'PQR_REOPENED',
      REMINDER: 'PQR_REMINDER',
      ESCALATED: 'PQR_ESCALATED'
    },
    PQRUserRole: {
      RESIDENT: 'RESIDENT',
      ADMIN: 'ADMIN',
      STAFF: 'STAFF',
      MANAGER: 'MANAGER',
      GUEST: 'GUEST'
    }
  };
});

// Mock para servicios de comunicación
jest.mock('./src/lib/communications/email-service', () => ({
  sendEmail: jest.fn().mockResolvedValue(true)
}));

jest.mock('./src/lib/communications/push-notification-service', () => ({
  sendPushNotification: jest.fn().mockResolvedValue(true)
}));

jest.mock('./src/lib/communications/sms-service', () => ({
  sendSMS: jest.fn().mockResolvedValue(true)
}));

jest.mock('./src/lib/communications/whatsapp-service', () => ({
  sendWhatsAppMessage: jest.fn().mockResolvedValue({ success: true })
}));

// Mock para servicios de facturación
jest.mock('./src/lib/services/invoice-template-service', () => ({
  getInvoiceTemplate: jest.fn().mockResolvedValue({
    id: 1,
    name: 'Template de prueba',
    content: '<html><body>Factura de prueba</body></html>'
  }),
  renderInvoiceTemplate: jest.fn().mockResolvedValue('<html><body>Factura renderizada</body></html>')
}));

jest.mock('./src/lib/services/invoice-rule-service', () => ({
  applyInvoiceRules: jest.fn().mockResolvedValue({
    total: 100,
    subtotal: 80,
    taxes: 20,
    discounts: 0
  })
}));

jest.mock('./src/services/assembly-advanced-service', () => ({
  calculateQuorum: jest.fn().mockResolvedValue({
    totalUnits: 100,
    presentUnits: 65,
    quorumPercentage: 65,
    quorumReached: true
  }),
  processVoting: jest.fn().mockResolvedValue({
    totalVotes: 65,
    inFavor: 40,
    against: 20,
    abstentions: 5,
    approved: true
  })
}));


// Importar constantes de PQR usando jest.requireActual para evitar ciclos de mock
const pqrConstants = jest.requireActual('./src/lib/constants/pqr-constants');
global.PQRCategory = pqrConstants.PQRCategory || {};
global.PQRStatus = pqrConstants.PQRStatus || {};
global.PQRPriority = pqrConstants.PQRPriority || {};
global.PQRType = pqrConstants.PQRType || {};
global.PQRChannel = pqrConstants.PQRChannel || {};
global.PQRNotificationTemplate = pqrConstants.PQRNotificationTemplate || {};
global.PQRUserRole = pqrConstants.PQRUserRole || {};

console.log('Mocks avanzados cargados correctamente para pruebas');