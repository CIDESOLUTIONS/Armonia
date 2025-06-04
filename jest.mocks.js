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

// Configuración global para pruebas
global.mockPrismaClient = {
  $queryRaw: jest.fn().mockResolvedValue([]),
  pQR: {
    findUnique: jest.fn().mockResolvedValue({
      id: 1,
      ticketNumber: 'PQR-001',
      title: 'Solicitud de prueba',
      status: 'IN_PROGRESS',
      userId: 1,
      assignedToId: 2,
      dueDate: new Date()
    }),
    findMany: jest.fn().mockResolvedValue([])
  },
  user: {
    findUnique: jest.fn().mockResolvedValue({
      id: 1,
      name: 'Usuario de Prueba',
      email: 'usuario@ejemplo.com'
    })
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
    })
  }
};

// Configurar mock para getSchemaFromRequest
jest.mock('./src/lib/prisma', () => ({
  getSchemaFromRequest: jest.fn().mockReturnValue(global.mockPrismaClient)
}));
