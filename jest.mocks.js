/**
 * Configuración de mocks globales para Jest
 * 
 * Este archivo configura los mocks necesarios para las pruebas
 * y se carga antes de la ejecución de las pruebas.
 */

// Mock para constantes PQR
jest.mock('./src/lib/constants/pqr-constants', () => ({
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
    CRITICAL: 'CRITICAL'
  },
  PQRType: {
    PETITION: 'PETITION',
    COMPLAINT: 'COMPLAINT',
    CLAIM: 'CLAIM',
    SUGGESTION: 'SUGGESTION'
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
}));

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

// Mock para servicios de asambleas
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

// Crear un mock más completo para PrismaClient
const mockPrismaClient = {
  $queryRaw: jest.fn().mockResolvedValue([]),
  $transaction: jest.fn(async (callback) => {
    return await callback(mockPrismaClient);
  }),
  pQR: {
    findUnique: jest.fn().mockResolvedValue({
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
    }),
    findMany: jest.fn().mockResolvedValue([
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
    ]),
    create: jest.fn().mockResolvedValue({
      id: 4,
      ticketNumber: 'PQR-004',
      title: 'Nueva solicitud',
      description: 'Nueva descripción',
      status: 'SUBMITTED',
      priority: 'MEDIUM',
      category: 'OTHER',
      userId: 1,
      assignedToId: null,
      dueDate: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      closedAt: null,
      reopenedAt: null,
      reopenReason: null,
      tags: ['OTHER']
    }),
    update: jest.fn().mockResolvedValue({
      id: 1,
      ticketNumber: 'PQR-001',
      title: 'Solicitud actualizada',
      description: 'Descripción actualizada',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
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
    }),
    count: jest.fn().mockResolvedValue(3),
    groupBy: jest.fn().mockImplementation((args) => {
      if (args._count && args.by.includes('status')) {
        return Promise.resolve([
          { status: 'IN_PROGRESS', _count: 1 },
          { status: 'RESOLVED', _count: 1 },
          { status: 'CLOSED', _count: 1 }
        ]);
      }
      if (args._count && args.by.includes('category')) {
        return Promise.resolve([
          { category: 'MAINTENANCE', _count: 1 },
          { category: 'SECURITY', _count: 1 },
          { category: 'SERVICES', _count: 1 }
        ]);
      }
      if (args._count && args.by.includes('priority')) {
        return Promise.resolve([
          { priority: 'LOW', _count: 1 },
          { priority: 'MEDIUM', _count: 1 },
          { priority: 'HIGH', _count: 1 }
        ]);
      }
      if (args._count && args.by.includes('assignedToId')) {
        return Promise.resolve([
          { assignedToId: 2, _count: 2 },
          { assignedToId: 3, _count: 1 }
        ]);
      }
      return Promise.resolve([]);
    })
  },
  user: {
    findUnique: jest.fn().mockResolvedValue({
      id: 1,
      name: 'Usuario de Prueba',
      email: 'usuario@ejemplo.com',
      role: 'RESIDENT',
      active: true
    }),
    findMany: jest.fn().mockResolvedValue([
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
    ]),
    count: jest.fn().mockResolvedValue(3)
  },
  pQRNotification: {
    create: jest.fn().mockResolvedValue({
      id: 1,
      pqrId: 1,
      userId: 1,
      type: 'STATUS_CHANGE',
      title: 'Cambio de estado',
      content: 'El PQR ha cambiado de estado',
      sentAt: new Date()
    }),
    findMany: jest.fn().mockResolvedValue([
      {
        id: 1,
        pqrId: 1,
        userId: 1,
        type: 'STATUS_CHANGE',
        title: 'Cambio de estado',
        content: 'El PQR ha cambiado de estado',
        sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        id: 2,
        pqrId: 1,
        userId: 2,
        type: 'COMMENT_ADDED',
        title: 'Nuevo comentario',
        content: 'Se ha añadido un comentario al PQR',
        sentAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      }
    ]),
    count: jest.fn().mockResolvedValue(2)
  },
  pQRComment: {
    create: jest.fn().mockResolvedValue({
      id: 1,
      pqrId: 1,
      userId: 1,
      content: 'Comentario de prueba',
      createdAt: new Date()
    }),
    findMany: jest.fn().mockResolvedValue([
      {
        id: 1,
        pqrId: 1,
        userId: 1,
        content: 'Comentario de prueba 1',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        id: 2,
        pqrId: 1,
        userId: 2,
        content: 'Comentario de prueba 2',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      }
    ]),
    count: jest.fn().mockResolvedValue(2)
  },
  pQRHistory: {
    create: jest.fn().mockResolvedValue({
      id: 1,
      pqrId: 1,
      userId: 1,
      action: 'STATUS_CHANGE',
      previousValue: 'SUBMITTED',
      newValue: 'IN_PROGRESS',
      createdAt: new Date()
    }),
    findMany: jest.fn().mockResolvedValue([
      {
        id: 1,
        pqrId: 1,
        userId: 1,
        action: 'CREATED',
        previousValue: null,
        newValue: 'SUBMITTED',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      },
      {
        id: 2,
        pqrId: 1,
        userId: 2,
        action: 'STATUS_CHANGE',
        previousValue: 'SUBMITTED',
        newValue: 'IN_PROGRESS',
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
      }
    ]),
    count: jest.fn().mockResolvedValue(2)
  },
  pQRSatisfactionSurvey: {
    create: jest.fn().mockResolvedValue({
      id: 1,
      pqrId: 1,
      userId: 1,
      rating: 4,
      comment: 'Buen servicio',
      createdAt: new Date()
    }),
    findMany: jest.fn().mockResolvedValue([
      {
        id: 1,
        pqrId: 2,
        userId: 1,
        rating: 4,
        comment: 'Buen servicio',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
      },
      {
        id: 2,
        pqrId: 3,
        userId: 2,
        rating: 5,
        comment: 'Excelente servicio',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      }
    ]),
    avg: jest.fn().mockResolvedValue(4.5),
    count: jest.fn().mockResolvedValue(2)
  }
};

// Configurar mock para getSchemaFromRequest
jest.mock('./src/lib/prisma', () => ({
  getSchemaFromRequest: jest.fn().mockReturnValue(mockPrismaClient)
}));

// Configuración global para pruebas
global.mockPrismaClient = mockPrismaClient;
global.PQRCategory = require('./src/lib/constants/pqr-constants').PQRCategory;
global.PQRStatus = require('./src/lib/constants/pqr-constants').PQRStatus;
global.PQRPriority = require('./src/lib/constants/pqr-constants').PQRPriority;
global.PQRType = require('./src/lib/constants/pqr-constants').PQRType;
global.PQRChannel = require('./src/lib/constants/pqr-constants').PQRChannel;
global.PQRNotificationTemplate = require('./src/lib/constants/pqr-constants').PQRNotificationTemplate;
global.PQRUserRole = require('./src/lib/constants/pqr-constants').PQRUserRole;

console.log('Mocks extendidos cargados correctamente para pruebas');
