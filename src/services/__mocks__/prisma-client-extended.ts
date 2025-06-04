/**
 * Mock extendido de PrismaClient para pruebas unitarias y de integración
 * Proporciona enums, constantes y submodelos completos para pruebas avanzadas
 */

// Importar enums y constantes desde nuestros mocks centralizados
import { PQRCategory, PQRStatus, PQRPriority, PQRType } from './pqr-constants';
import { VisitStatus, VisitType } from './intercom-constants';

// Exportar enums para que sean accesibles como si vinieran de @prisma/client
export {
  PQRCategory,
  PQRStatus,
  PQRPriority,
  PQRType,
  VisitStatus,
  VisitType
};

// Mock completo de PrismaClient con todos los submodelos necesarios
export class PrismaClient {
  constructor(options = {}) {
    // No hacer nada en el constructor para pruebas
  }

  // Mock de métodos comunes
  $connect() {
    return Promise.resolve();
  }

  $disconnect() {
    return Promise.resolve();
  }

  $queryRaw() {
    return Promise.resolve([]);
  }

  // Mock de modelos comunes con todos los métodos necesarios
  pQR = {
    findUnique: jest.fn().mockResolvedValue({
      id: 1,
      ticketNumber: 'PQR-001',
      title: 'Problema de prueba',
      description: 'Descripción de prueba',
      status: PQRStatus.OPEN,
      category: PQRCategory.MAINTENANCE,
      priority: PQRPriority.MEDIUM,
      userId: 1,
      assignedToId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      dueDate: new Date(Date.now() + 86400000) // 1 día después
    }),
    findMany: jest.fn().mockResolvedValue([
      {
        id: 1,
        ticketNumber: 'PQR-001',
        title: 'Problema de prueba 1',
        description: 'Descripción de prueba 1',
        status: PQRStatus.OPEN,
        category: PQRCategory.MAINTENANCE,
        priority: PQRPriority.MEDIUM,
        userId: 1,
        assignedToId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        dueDate: new Date(Date.now() + 86400000)
      },
      {
        id: 2,
        ticketNumber: 'PQR-002',
        title: 'Problema de prueba 2',
        description: 'Descripción de prueba 2',
        status: PQRStatus.ASSIGNED,
        category: PQRCategory.SECURITY,
        priority: PQRPriority.HIGH,
        userId: 2,
        assignedToId: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
        dueDate: new Date(Date.now() + 43200000) // 12 horas después
      }
    ]),
    create: jest.fn().mockResolvedValue({
      id: 3,
      ticketNumber: 'PQR-003',
      title: 'Nuevo problema',
      description: 'Nueva descripción',
      status: PQRStatus.OPEN,
      category: PQRCategory.OTHER,
      priority: PQRPriority.MEDIUM,
      userId: 1,
      assignedToId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      dueDate: new Date(Date.now() + 86400000)
    }),
    update: jest.fn().mockResolvedValue({
      id: 1,
      ticketNumber: 'PQR-001',
      title: 'Problema actualizado',
      description: 'Descripción actualizada',
      status: PQRStatus.IN_PROGRESS,
      category: PQRCategory.MAINTENANCE,
      priority: PQRPriority.HIGH,
      userId: 1,
      assignedToId: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
      dueDate: new Date(Date.now() + 86400000)
    }),
    delete: jest.fn().mockResolvedValue({
      id: 1,
      ticketNumber: 'PQR-001'
    }),
    count: jest.fn().mockResolvedValue(10),
    groupBy: jest.fn().mockImplementation((args) => {
      if (args._count && args.by.includes('status')) {
        return Promise.resolve([
          { status: PQRStatus.OPEN, _count: { status: 5 } },
          { status: PQRStatus.IN_PROGRESS, _count: { status: 3 } },
          { status: PQRStatus.RESOLVED, _count: { status: 2 } }
        ]);
      }
      if (args._count && args.by.includes('priority')) {
        return Promise.resolve([
          { priority: PQRPriority.HIGH, _count: { priority: 3 } },
          { priority: PQRPriority.MEDIUM, _count: { priority: 5 } },
          { priority: PQRPriority.LOW, _count: { priority: 2 } }
        ]);
      }
      return Promise.resolve([]);
    })
  };

  user = {
    findUnique: jest.fn().mockResolvedValue({
      id: 1,
      name: 'Usuario Prueba',
      email: 'usuario@ejemplo.com',
      role: 'RESIDENT',
      active: true,
      complexId: 1,
      unitId: 101
    }),
    findMany: jest.fn().mockResolvedValue([
      {
        id: 1,
        name: 'Usuario Prueba 1',
        email: 'usuario1@ejemplo.com',
        role: 'RESIDENT',
        active: true,
        complexId: 1,
        unitId: 101
      },
      {
        id: 2,
        name: 'Usuario Prueba 2',
        email: 'usuario2@ejemplo.com',
        role: 'ADMIN',
        active: true,
        complexId: 1,
        unitId: null
      }
    ]),
    create: jest.fn().mockResolvedValue({
      id: 3,
      name: 'Nuevo Usuario',
      email: 'nuevo@ejemplo.com',
      role: 'RESIDENT',
      active: true,
      complexId: 1,
      unitId: 102
    }),
    update: jest.fn().mockResolvedValue({
      id: 1,
      name: 'Usuario Actualizado',
      email: 'actualizado@ejemplo.com',
      role: 'RESIDENT',
      active: true,
      complexId: 1,
      unitId: 101
    })
  };

  pQRNotification = {
    create: jest.fn().mockResolvedValue({
      id: 1,
      pqrId: 1,
      userId: 1,
      type: 'STATUS_CHANGE',
      title: 'Cambio de estado',
      content: 'El PQR ha cambiado de estado',
      sentAt: new Date(),
      readAt: null
    }),
    findMany: jest.fn().mockResolvedValue([
      {
        id: 1,
        pqrId: 1,
        userId: 1,
        type: 'STATUS_CHANGE',
        title: 'Cambio de estado',
        content: 'El PQR ha cambiado de estado',
        sentAt: new Date(),
        readAt: null
      }
    ])
  };

  // Submodelos adicionales necesarios para pruebas avanzadas
  userNotificationPreference = {
    findUnique: jest.fn().mockResolvedValue({
      userId: 1,
      channels: JSON.stringify(['EMAIL', 'WHATSAPP']),
      pqrStatusUpdates: true,
      communityAnnouncements: true,
      maintenanceAlerts: true,
      securityAlerts: true,
      billingReminders: true,
      eventReminders: true
    }),
    findMany: jest.fn().mockResolvedValue([
      {
        userId: 1,
        channels: JSON.stringify(['EMAIL', 'WHATSAPP']),
        pqrStatusUpdates: true,
        communityAnnouncements: true
      },
      {
        userId: 2,
        channels: JSON.stringify(['EMAIL', 'SMS']),
        pqrStatusUpdates: true,
        communityAnnouncements: false
      }
    ]),
    upsert: jest.fn().mockResolvedValue({
      userId: 1,
      channels: JSON.stringify(['EMAIL', 'PUSH', 'SMS']),
      pqrStatusUpdates: true,
      communityAnnouncements: true
    })
  };

  pQRAssignmentRule = {
    findMany: jest.fn().mockResolvedValue([
      {
        id: 1,
        name: 'Regla de mantenimiento',
        description: 'Asigna PQRs de mantenimiento',
        isActive: true,
        priority: 1,
        categories: [PQRCategory.MAINTENANCE],
        keywords: ['fuga', 'gotera', 'luz'],
        setPriority: PQRPriority.HIGH,
        assignToTeamId: 1,
        assignToUserId: null
      },
      {
        id: 2,
        name: 'Regla de seguridad',
        description: 'Asigna PQRs de seguridad',
        isActive: true,
        priority: 2,
        categories: [PQRCategory.SECURITY],
        keywords: ['robo', 'alarma', 'cámara'],
        setPriority: PQRPriority.URGENT,
        assignToTeamId: 2,
        assignToUserId: null
      }
    ])
  };

  pQRTeam = {
    findMany: jest.fn().mockResolvedValue([
      {
        id: 1,
        name: 'Equipo de mantenimiento',
        description: 'Equipo encargado de mantenimiento',
        isActive: true,
        categories: [PQRCategory.MAINTENANCE],
        leaderId: 3
      },
      {
        id: 2,
        name: 'Equipo de seguridad',
        description: 'Equipo encargado de seguridad',
        isActive: true,
        categories: [PQRCategory.SECURITY],
        leaderId: 4
      }
    ]),
    findUnique: jest.fn().mockResolvedValue({
      id: 1,
      name: 'Equipo de mantenimiento',
      description: 'Equipo encargado de mantenimiento',
      isActive: true,
      categories: [PQRCategory.MAINTENANCE],
      leaderId: 3
    })
  };

  pQRSLA = {
    findMany: jest.fn().mockResolvedValue([
      {
        id: 1,
        category: PQRCategory.MAINTENANCE,
        priority: PQRPriority.HIGH,
        resolutionTime: 240, // 4 horas en minutos
        businessHoursOnly: true,
        isActive: true
      },
      {
        id: 2,
        category: PQRCategory.SECURITY,
        priority: PQRPriority.URGENT,
        resolutionTime: 60, // 1 hora en minutos
        businessHoursOnly: false,
        isActive: true
      }
    ])
  };

  pQRSettings = {
    findUnique: jest.fn().mockResolvedValue({
      schemaName: 'public',
      autoCategorizeEnabled: true,
      autoAssignEnabled: true,
      autoNotifyEnabled: true,
      satisfactionSurveyEnabled: true
    })
  };

  // Modelos para monitoreo
  monitoringConfig = {
    findUnique: jest.fn().mockResolvedValue({
      id: 1,
      name: 'Configuración de monitoreo',
      description: 'Configuración para monitoreo de áreas comunes',
      isActive: true,
      alertThreshold: 80,
      checkInterval: 300,
      notifyUsers: [1, 2, 3],
      createdAt: new Date(),
      updatedAt: new Date()
    }),
    findMany: jest.fn().mockResolvedValue([
      {
        id: 1,
        name: 'Configuración de monitoreo 1',
        description: 'Configuración para monitoreo de áreas comunes',
        isActive: true,
        alertThreshold: 80,
        checkInterval: 300,
        notifyUsers: [1, 2, 3],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        name: 'Configuración de monitoreo 2',
        description: 'Configuración para monitoreo de accesos',
        isActive: true,
        alertThreshold: 90,
        checkInterval: 600,
        notifyUsers: [1, 4],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]),
    create: jest.fn().mockResolvedValue({
      id: 3,
      name: 'Nueva configuración',
      description: 'Nueva configuración de monitoreo',
      isActive: true,
      alertThreshold: 85,
      checkInterval: 450,
      notifyUsers: [1, 2],
      createdAt: new Date(),
      updatedAt: new Date()
    }),
    update: jest.fn().mockResolvedValue({
      id: 1,
      name: 'Configuración actualizada',
      description: 'Configuración actualizada de monitoreo',
      isActive: true,
      alertThreshold: 75,
      checkInterval: 400,
      notifyUsers: [1, 2, 3, 4],
      createdAt: new Date(),
      updatedAt: new Date()
    }),
    delete: jest.fn().mockResolvedValue({
      id: 1,
      name: 'Configuración eliminada'
    })
  };

  // Modelos para visitas
  visit = {
    findUnique: jest.fn().mockResolvedValue({
      id: 1,
      visitorName: 'Visitante Prueba',
      visitorId: '12345678',
      visitorPhone: '3001234567',
      unitId: 101,
      purpose: 'Entrega de paquete',
      status: VisitStatus.PENDING,
      scheduledAt: new Date(),
      arrivedAt: null,
      departedAt: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }),
    findMany: jest.fn().mockResolvedValue([
      {
        id: 1,
        visitorName: 'Visitante Prueba 1',
        visitorId: '12345678',
        visitorPhone: '3001234567',
        unitId: 101,
        purpose: 'Entrega de paquete',
        status: VisitStatus.PENDING,
        scheduledAt: new Date(),
        arrivedAt: null,
        departedAt: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        visitorName: 'Visitante Prueba 2',
        visitorId: '87654321',
        visitorPhone: '3007654321',
        unitId: 102,
        purpose: 'Visita familiar',
        status: VisitStatus.APPROVED,
        scheduledAt: new Date(),
        arrivedAt: null,
        departedAt: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]),
    create: jest.fn().mockResolvedValue({
      id: 3,
      visitorName: 'Nuevo Visitante',
      visitorId: '11223344',
      visitorPhone: '3009876543',
      unitId: 103,
      purpose: 'Mantenimiento',
      status: VisitStatus.PENDING,
      scheduledAt: new Date(),
      arrivedAt: null,
      departedAt: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }),
    update: jest.fn().mockResolvedValue({
      id: 1,
      visitorName: 'Visitante Actualizado',
      visitorId: '12345678',
      visitorPhone: '3001234567',
      unitId: 101,
      purpose: 'Entrega de paquete',
      status: VisitStatus.APPROVED,
      scheduledAt: new Date(),
      arrivedAt: new Date(),
      departedAt: null,
      createdAt: new Date(),
      updatedAt: new Date()
    })
  };

  // Modelos para finanzas
  receipt = {
    findUnique: jest.fn().mockResolvedValue({
      id: 1,
      receiptNumber: 'REC-001',
      userId: 1,
      amount: 150000,
      concept: 'Cuota de administración',
      status: 'PAID',
      pdfUrl: '/receipts/REC-001.pdf',
      createdAt: new Date(),
      paidAt: new Date()
    }),
    findMany: jest.fn().mockResolvedValue([
      {
        id: 1,
        receiptNumber: 'REC-001',
        userId: 1,
        amount: 150000,
        concept: 'Cuota de administración',
        status: 'PAID',
        pdfUrl: '/receipts/REC-001.pdf',
        createdAt: new Date(),
        paidAt: new Date()
      },
      {
        id: 2,
        receiptNumber: 'REC-002',
        userId: 2,
        amount: 150000,
        concept: 'Cuota de administración',
        status: 'PENDING',
        pdfUrl: null,
        createdAt: new Date(),
        paidAt: null
      }
    ]),
    create: jest.fn().mockResolvedValue({
      id: 3,
      receiptNumber: 'REC-003',
      userId: 1,
      amount: 50000,
      concept: 'Multa',
      status: 'PENDING',
      pdfUrl: null,
      createdAt: new Date(),
      paidAt: null
    }),
    update: jest.fn().mockResolvedValue({
      id: 2,
      receiptNumber: 'REC-002',
      userId: 2,
      amount: 150000,
      concept: 'Cuota de administración',
      status: 'PAID',
      pdfUrl: '/receipts/REC-002.pdf',
      createdAt: new Date(),
      paidAt: new Date()
    })
  };

  payment = {
    findUnique: jest.fn().mockResolvedValue({
      id: 1,
      receiptId: 1,
      userId: 1,
      amount: 150000,
      paymentMethod: 'CREDIT_CARD',
      transactionId: 'txn_123456',
      status: 'COMPLETED',
      createdAt: new Date(),
      completedAt: new Date()
    }),
    findMany: jest.fn().mockResolvedValue([
      {
        id: 1,
        receiptId: 1,
        userId: 1,
        amount: 150000,
        paymentMethod: 'CREDIT_CARD',
        transactionId: 'txn_123456',
        status: 'COMPLETED',
        createdAt: new Date(),
        completedAt: new Date()
      }
    ]),
    create: jest.fn().mockResolvedValue({
      id: 2,
      receiptId: 2,
      userId: 2,
      amount: 150000,
      paymentMethod: 'BANK_TRANSFER',
      transactionId: 'txn_654321',
      status: 'PENDING',
      createdAt: new Date(),
      completedAt: null
    }),
    update: jest.fn().mockResolvedValue({
      id: 2,
      receiptId: 2,
      userId: 2,
      amount: 150000,
      paymentMethod: 'BANK_TRANSFER',
      transactionId: 'txn_654321',
      status: 'COMPLETED',
      createdAt: new Date(),
      completedAt: new Date()
    })
  };
}

// Exportar la clase como default
export default PrismaClient;
