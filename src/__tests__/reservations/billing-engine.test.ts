// src/__tests__/reservations/billing-engine.test.ts
import { BillingEngine } from '@/lib/services/billing-engine';
import { TransactionStatus } from '@prisma/client';

// Mock de Prisma
jest.mock('@/lib/prisma', () => ({
  getPrisma: jest.fn(() => ({
    transaction: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn()
    },
    reservation: {
      findUnique: jest.fn(),
      update: jest.fn()
    },
    paymentSettings: {
      findFirst: jest.fn(),
      create: jest.fn()
    },
    paymentGateway: {
      findUnique: jest.fn(),
      findFirst: jest.fn()
    },
    paymentMethod: {
      findFirst: jest.fn()
    }
  }))
}));

describe('BillingEngine', () => {
  let billingEngine: BillingEngine;
  let mockPrisma: any;

  beforeEach(() => {
    billingEngine = new BillingEngine();
    const { getPrisma } = require('@/lib/prisma');
    mockPrisma = getPrisma();
    jest.clearAllMocks();
  });

  describe('createPayment', () => {
    beforeEach(() => {
      // Mock configuraciones por defecto
      mockPrisma.paymentSettings.findFirst.mockResolvedValue({
        id: 1,
        defaultGatewayId: 1,
        paymentExpiry: 24,
        allowSaveCards: true,
        minPaymentAmount: 1000
      });

      mockPrisma.paymentGateway.findUnique.mockResolvedValue({
        id: 1,
        name: 'MockGateway',
        isActive: true,
        testMode: true
      });

      mockPrisma.paymentMethod.findFirst.mockResolvedValue({
        id: 1,
        name: 'Tarjeta de Crédito',
        isActive: true
      });
    });

    it('should create a payment successfully', async () => {
      const mockTransaction = {
        id: 'txn_123',
        userId: 1,
        amount: 50000,
        currency: 'COP',
        description: 'Test payment',
        status: 'PENDING',
        gatewayId: 1,
        methodId: 1,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      };

      mockPrisma.transaction.create.mockResolvedValue(mockTransaction);
      mockPrisma.transaction.update.mockResolvedValue({
        ...mockTransaction,
        paymentUrl: 'https://checkout.example.com/pay/txn_123',
        gatewayReference: 'PAY-123'
      });

      const paymentRequest = {
        userId: 1,
        amount: 50000,
        description: 'Test payment'
      };

      const result = await billingEngine.createPayment(paymentRequest);

      expect(result).toEqual({
        transactionId: 'txn_123',
        paymentUrl: 'https://checkout.example.com/pay/txn_123',
        status: 'PENDING',
        gatewayReference: 'PAY-123',
        expiresAt: expect.any(Date)
      });

      expect(mockPrisma.transaction.create).toHaveBeenCalledWith({
        data: {
          userId: 1,
          amount: 50000,
          currency: 'COP',
          description: 'Test payment',
          status: 'PENDING',
          gatewayId: 1,
          methodId: 1,
          paymentData: undefined,
          metadata: {
            returnUrl: undefined,
            ipAddress: null,
            userAgent: null
          },
          expiresAt: expect.any(Date),
          attempts: 1
        }
      });
    });

    it('should validate payment request data', async () => {
      const invalidRequest = {
        userId: 1,
        amount: -100, // Invalid negative amount
        description: 'Test payment'
      };

      await expect(billingEngine.createPayment(invalidRequest)).rejects.toThrow('Datos de pago inválidos');
    });

    it('should handle missing gateway configuration', async () => {
      mockPrisma.paymentGateway.findUnique.mockResolvedValue(null);
      mockPrisma.paymentGateway.findFirst.mockResolvedValue(null);

      const paymentRequest = {
        userId: 1,
        amount: 50000,
        description: 'Test payment'
      };

      await expect(billingEngine.createPayment(paymentRequest)).rejects.toThrow('No hay pasarela de pago configurada');
    });
  });

  describe('createReservationPayment', () => {
    beforeEach(() => {
      // Mock configuraciones por defecto
      mockPrisma.paymentSettings.findFirst.mockResolvedValue({
        id: 1,
        defaultGatewayId: 1,
        paymentExpiry: 24
      });

      mockPrisma.paymentGateway.findUnique.mockResolvedValue({
        id: 1,
        name: 'MockGateway',
        isActive: true
      });

      mockPrisma.paymentMethod.findFirst.mockResolvedValue({
        id: 1,
        name: 'Tarjeta de Crédito',
        isActive: true
      });
    });

    it('should create payment for reservation successfully', async () => {
      const mockReservation = {
        id: 1,
        userId: 1,
        commonAreaId: 1,
        startDateTime: new Date(),
        endDateTime: new Date(),
        commonArea: {
          id: 1,
          name: 'Salón de Eventos',
          feeAmount: 100000
        }
      };

      mockPrisma.reservation.findUnique.mockResolvedValue(mockReservation);

      const mockTransaction = {
        id: 'txn_reservation_123',
        userId: 1,
        amount: 100000,
        currency: 'COP',
        description: 'Pago de reserva - Salón de Eventos',
        status: 'PENDING',
        gatewayId: 1,
        methodId: 1,
        createdAt: new Date()
      };

      mockPrisma.transaction.create.mockResolvedValue(mockTransaction);
      mockPrisma.transaction.update.mockResolvedValue({
        ...mockTransaction,
        paymentUrl: 'https://checkout.example.com/pay/txn_reservation_123'
      });

      mockPrisma.reservation.update.mockResolvedValue({
        ...mockReservation,
        requiresPayment: true,
        paymentAmount: 100000,
        paymentStatus: 'PENDING'
      });

      const reservationPayment = {
        reservationId: 1,
        amount: 100000,
        description: 'Pago de reserva - Salón de Eventos',
        dueDate: new Date()
      };

      const result = await billingEngine.createReservationPayment(reservationPayment);

      expect(result.transactionId).toBe('txn_reservation_123');
      expect(mockPrisma.reservation.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          requiresPayment: true,
          paymentAmount: 100000,
          paymentStatus: 'PENDING'
        }
      });
    });

    it('should handle non-existent reservation', async () => {
      mockPrisma.reservation.findUnique.mockResolvedValue(null);

      const reservationPayment = {
        reservationId: 999,
        amount: 100000,
        description: 'Payment for non-existent reservation',
        dueDate: new Date()
      };

      await expect(billingEngine.createReservationPayment(reservationPayment)).rejects.toThrow('Reserva no encontrada');
    });
  });

  describe('confirmPayment', () => {
    it('should confirm payment successfully', async () => {
      const mockTransaction = {
        id: 'txn_123',
        userId: 1,
        amount: 50000,
        status: 'PENDING',
        metadata: {
          type: 'reservation',
          reservationId: 1
        }
      };

      mockPrisma.transaction.update.mockResolvedValue({
        ...mockTransaction,
        status: 'COMPLETED',
        completedAt: new Date()
      });

      mockPrisma.reservation.update.mockResolvedValue({
        id: 1,
        paymentStatus: 'COMPLETED',
        status: 'APPROVED'
      });

      await billingEngine.confirmPayment('txn_123', {
        gatewayReference: 'PAY-123',
        gatewayResponse: { success: true },
        status: 'COMPLETED'
      });

      expect(mockPrisma.transaction.update).toHaveBeenCalledWith({
        where: { id: 'txn_123' },
        data: {
          status: 'COMPLETED',
          gatewayReference: 'PAY-123',
          gatewayResponse: { success: true },
          completedAt: expect.any(Date)
        },
        include: {
          paymentData: true,
          metadata: true
        }
      });

      expect(mockPrisma.reservation.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          paymentStatus: 'COMPLETED',
          status: 'APPROVED'
        }
      });
    });

    it('should validate confirmation data', async () => {
      const invalidConfirmation = {
        gatewayReference: '', // Empty reference
        gatewayResponse: {},
        status: 'INVALID_STATUS' as any
      };

      await expect(billingEngine.confirmPayment('txn_123', invalidConfirmation)).rejects.toThrow('Datos de confirmación inválidos');
    });
  });

  describe('getTransactionStatus', () => {
    it('should return transaction status successfully', async () => {
      const mockTransaction = {
        status: 'COMPLETED' as TransactionStatus,
        amount: 50000,
        currency: 'COP',
        description: 'Test payment',
        createdAt: new Date(),
        completedAt: new Date(),
        gatewayReference: 'PAY-123'
      };

      mockPrisma.transaction.findUnique.mockResolvedValue(mockTransaction);

      const result = await billingEngine.getTransactionStatus('txn_123');

      expect(result).toEqual(mockTransaction);
      expect(mockPrisma.transaction.findUnique).toHaveBeenCalledWith({
        where: { id: 'txn_123' },
        select: {
          status: true,
          amount: true,
          currency: true,
          description: true,
          createdAt: true,
          completedAt: true,
          gatewayReference: true
        }
      });
    });

    it('should handle non-existent transaction', async () => {
      mockPrisma.transaction.findUnique.mockResolvedValue(null);

      await expect(billingEngine.getTransactionStatus('non_existent')).rejects.toThrow('Transacción no encontrada');
    });
  });

  describe('processRefund', () => {
    it('should process refund successfully', async () => {
      const originalTransaction = {
        id: 'txn_123',
        userId: 1,
        amount: 50000,
        currency: 'COP',
        description: 'Original payment',
        status: 'COMPLETED',
        gatewayId: 1,
        methodId: 1,
        gatewayReference: 'PAY-123'
      };

      const refundTransaction = {
        id: 'refund_123',
        userId: 1,
        amount: -50000,
        currency: 'COP',
        description: 'Reembolso: Original payment',
        status: 'COMPLETED',
        gatewayId: 1,
        methodId: 1,
        gatewayReference: 'REFUND-PAY-123'
      };

      mockPrisma.transaction.findUnique.mockResolvedValue(originalTransaction);
      mockPrisma.transaction.create.mockResolvedValue(refundTransaction);
      mockPrisma.transaction.update.mockResolvedValue({
        ...originalTransaction,
        status: 'REFUNDED'
      });

      const result = await billingEngine.processRefund('txn_123', undefined, 'Customer request');

      expect(result).toEqual({
        refundId: 'refund_123',
        status: 'COMPLETED'
      });

      expect(mockPrisma.transaction.create).toHaveBeenCalledWith({
        data: {
          userId: 1,
          amount: -50000,
          currency: 'COP',
          description: 'Reembolso: Original payment',
          status: 'COMPLETED',
          gatewayId: 1,
          methodId: 1,
          gatewayReference: 'REFUND-PAY-123',
          metadata: {
            originalTransactionId: 'txn_123',
            refundReason: 'Customer request',
            refundType: 'full'
          },
          completedAt: expect.any(Date)
        }
      });

      expect(mockPrisma.transaction.update).toHaveBeenCalledWith({
        where: { id: 'txn_123' },
        data: {
          status: 'REFUNDED'
        }
      });
    });

    it('should not refund non-completed transactions', async () => {
      const pendingTransaction = {
        id: 'txn_123',
        status: 'PENDING'
      };

      mockPrisma.transaction.findUnique.mockResolvedValue(pendingTransaction);

      await expect(billingEngine.processRefund('txn_123')).rejects.toThrow('Solo se pueden reembolsar transacciones completadas');
    });

    it('should handle partial refunds', async () => {
      const originalTransaction = {
        id: 'txn_123',
        userId: 1,
        amount: 100000,
        currency: 'COP',
        description: 'Original payment',
        status: 'COMPLETED',
        gatewayId: 1,
        methodId: 1,
        gatewayReference: 'PAY-123'
      };

      const refundTransaction = {
        id: 'refund_123',
        amount: -30000 // Partial refund
      };

      mockPrisma.transaction.findUnique.mockResolvedValue(originalTransaction);
      mockPrisma.transaction.create.mockResolvedValue(refundTransaction);
      mockPrisma.transaction.update.mockResolvedValue(originalTransaction);

      const result = await billingEngine.processRefund('txn_123', 30000, 'Partial refund requested');

      expect(mockPrisma.transaction.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          amount: -30000
        })
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      mockPrisma.paymentSettings.findFirst.mockRejectedValue(new Error('Database connection failed'));

      const paymentRequest = {
        userId: 1,
        amount: 50000,
        description: 'Test payment'
      };

      await expect(billingEngine.createPayment(paymentRequest)).rejects.toThrow('Error creando pago');
    });

    it('should handle missing payment method configuration', async () => {
      mockPrisma.paymentSettings.findFirst.mockResolvedValue({
        id: 1,
        defaultGatewayId: 1,
        paymentExpiry: 24
      });

      mockPrisma.paymentGateway.findUnique.mockResolvedValue({
        id: 1,
        name: 'MockGateway',
        isActive: true
      });

      mockPrisma.paymentMethod.findFirst.mockResolvedValue(null);

      const paymentRequest = {
        userId: 1,
        amount: 50000,
        description: 'Test payment'
      };

      await expect(billingEngine.createPayment(paymentRequest)).rejects.toThrow('No hay métodos de pago configurados');
    });
  });

  describe('Configuration Management', () => {
    it('should create default payment settings when none exist', async () => {
      mockPrisma.paymentSettings.findFirst.mockResolvedValue(null);
      
      const defaultSettings = {
        id: 1,
        allowSaveCards: true,
        minPaymentAmount: 1000,
        paymentExpiry: 24,
        autoGenerateReceipt: true,
        notifyOnPayment: true
      };

      mockPrisma.paymentSettings.create.mockResolvedValue(defaultSettings);
      mockPrisma.paymentGateway.findFirst.mockResolvedValue({
        id: 1,
        name: 'DefaultGateway',
        isActive: true
      });
      mockPrisma.paymentMethod.findFirst.mockResolvedValue({
        id: 1,
        name: 'Default Method',
        isActive: true
      });

      // Mock the payment creation process
      mockPrisma.transaction.create.mockResolvedValue({
        id: 'txn_123',
        userId: 1,
        amount: 50000
      });
      mockPrisma.transaction.update.mockResolvedValue({
        id: 'txn_123',
        paymentUrl: 'https://test.com',
        gatewayReference: 'PAY-123'
      });

      const paymentRequest = {
        userId: 1,
        amount: 50000,
        description: 'Test payment'
      };

      await billingEngine.createPayment(paymentRequest);

      expect(mockPrisma.paymentSettings.create).toHaveBeenCalledWith({
        data: {
          allowSaveCards: true,
          minPaymentAmount: 1000,
          paymentExpiry: 24,
          autoGenerateReceipt: true,
          notifyOnPayment: true
        }
      });
    });
  });
});
