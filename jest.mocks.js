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

// Crear un mock completo para PrismaClient
const createMockPrismaClient = () => {
  // Datos mock para pruebas
  const mockPQRs = [
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
      createdAt: new Date('2025-06-01'),
      updatedAt: new Date('2025-06-02'),
      dueDate: new Date('2025-06-10'),
      closedAt: null
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
      createdAt: new Date('2025-05-28'),
      updatedAt: new Date('2025-06-01'),
      dueDate: new Date('2025-06-05'),
      closedAt: new Date('2025-06-01')
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
      createdAt: new Date('2025-05-15'),
      updatedAt: new Date('2025-05-20'),
      dueDate: new Date('2025-05-25'),
      closedAt: new Date('2025-05-20')
    }
  ];

  const mockUsers = [
    {
      id: 1,
      name: 'Usuario Reportante',
      email: 'reportante@ejemplo.com',
      role: 'RESIDENT'
    },
    {
      id: 2,
      name: 'Usuario Asignado',
      email: 'asignado@ejemplo.com',
      role: 'MAINTENANCE'
    },
    {
      id: 3,
      name: 'Administrador',
      email: 'admin@ejemplo.com',
      role: 'COMPLEX_ADMIN'
    }
  ];

  const mockNotifications = [
    {
      id: 1,
      pqrId: 1,
      userId: 1,
      type: 'STATUS_CHANGE',
      title: 'Cambio de estado',
      content: 'El PQR ha cambiado de estado',
      sentAt: new Date()
    }
  ];

  // Crear funciones mock para cada modelo
  const createModelMock = (data) => ({
    findUnique: jest.fn().mockImplementation(({ where }) => {
      const item = data.find(i => {
        for (const key in where) {
          if (i[key] !== where[key]) return false;
        }
        return true;
      });
      return Promise.resolve(item || null);
    }),
    findMany: jest.fn().mockImplementation(({ where } = {}) => {
      if (!where) return Promise.resolve(data);
      
      const items = data.filter(i => {
        for (const key in where) {
          if (typeof where[key] === 'object') {
            // Manejar operadores como 'in', 'gte', 'lte'
            if (where[key].in && !where[key].in.includes(i[key])) return false;
            if (where[key].gte && i[key] < where[key].gte) return false;
            if (where[key].lte && i[key] > where[key].lte) return false;
          } else if (i[key] !== where[key]) {
            return false;
          }
        }
        return true;
      });
      
      return Promise.resolve(items);
    }),
    create: jest.fn().mockImplementation(({ data }) => {
      const newItem = { id: data.id || Math.max(...data.map(i => i.id), 0) + 1, ...data };
      data.push(newItem);
      return Promise.resolve(newItem);
    }),
    update: jest.fn().mockImplementation(({ where, data }) => {
      const index = data.findIndex(i => i.id === where.id);
      if (index === -1) return Promise.resolve(null);
      
      const updatedItem = { ...data[index], ...data };
      data[index] = updatedItem;
      return Promise.resolve(updatedItem);
    }),
    delete: jest.fn().mockImplementation(({ where }) => {
      const index = data.findIndex(i => i.id === where.id);
      if (index === -1) return Promise.resolve(null);
      
      const deletedItem = data[index];
      data.splice(index, 1);
      return Promise.resolve(deletedItem);
    }),
    count: jest.fn().mockImplementation(({ where } = {}) => {
      if (!where) return Promise.resolve(data.length);
      
      const count = data.filter(i => {
        for (const key in where) {
          if (typeof where[key] === 'object') {
            // Manejar operadores como 'in', 'gte', 'lte'
            if (where[key].in && !where[key].in.includes(i[key])) return false;
            if (where[key].gte && i[key] < where[key].gte) return false;
            if (where[key].lte && i[key] > where[key].lte) return false;
          } else if (i[key] !== where[key]) {
            return false;
          }
        }
        return true;
      }).length;
      
      return Promise.resolve(count);
    }),
    groupBy: jest.fn().mockImplementation(() => {
      // Implementación básica para groupBy
      return Promise.resolve([
        { _count: { id: 2 }, category: 'MAINTENANCE' },
        { _count: { id: 1 }, category: 'SECURITY' }
      ]);
    })
  });

  // Crear el mock completo de PrismaClient
  return {
    pQR: createModelMock(mockPQRs),
    user: createModelMock(mockUsers),
    pQRNotification: createModelMock(mockNotifications),
    $queryRaw: jest.fn().mockImplementation((query) => {
      // Implementación básica para consultas raw
      if (query.includes('notification_templates')) {
        return Promise.resolve([]);
      }
      if (query.includes('PQRSettings')) {
        return Promise.resolve([{ autoNotifyEnabled: true, satisfactionSurveyEnabled: true }]);
      }
      if (query.includes('PQRAssignmentRule')) {
        return Promise.resolve([]);
      }
      return Promise.resolve([]);
    }),
    $transaction: jest.fn().mockImplementation((callback) => {
      // Ejecutar el callback con el mismo mock de prisma
      return callback(createMockPrismaClient());
    })
  };
};

// Configurar mock global para PrismaClient
global.mockPrismaClient = createMockPrismaClient();

// Configurar mock para getSchemaFromRequest
jest.mock('./src/lib/prisma', () => ({
  getSchemaFromRequest: jest.fn().mockReturnValue(global.mockPrismaClient)
}));

console.log('Mocks extendidos cargados correctamente para pruebas');
