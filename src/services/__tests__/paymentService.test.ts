import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { PaymentService } from '../../lib/services/payment-service';
import { getPrisma } from '@/lib/prisma';
import { encryptData, decryptData } from '../../lib/utils/encryption';

// Mock de dependencias
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    paymentGateway: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn()
    },
    paymentMethod: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn()
    },
    transaction: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn()
    },
    paymentToken: {
      findFirst: jest.fn(),
      create: jest.fn(),
      delete: jest.fn()
    },
    invoice: {
      findUnique: jest.fn(),
      update: jest.fn()
    }
  };
  return {
    PrismaClient: jest.fn(() => mockPrismaClient)
  };
});

// Mock de utilidades de encriptación
jest.mock('../../lib/utils/encryption', () => ({
  encryptData: jest.fn(data => `encrypted_${data}`),
  decryptData: jest.fn(data => data.replace('encrypted_', ''))
}));

describe('PaymentService', () => {
  let service;
  let prisma;
  
  beforeEach(() => {
    // Limpiar todos los mocks
    jest.clearAllMocks();
    
    // Instanciar el servicio y obtener las dependencias mockeadas
    // Instanciar el servicio y obtener las dependencias mockeadas
    // No se instancia el servicio ya que todos los métodos son estáticos
    prisma = getPrisma();
  });
  
  describe('createTransaction', () => {
    it('debe crear una transacción con datos válidos', async () => {
      // Datos de prueba
      const transactionData = {
        amount: 100000,
        description: 'Pago de administración',
        paymentMethodId: 1,
        userId: 123
      };
      
      // Mock de respuestas de Prisma
      const mockPaymentMethod = {
        id: 1,
        name: 'Tarjeta de Crédito',
        type: 'CREDIT_CARD',
        gatewayId: 1
      };
      
      const mockGateway = {
        id: 1,
        name: 'PayU Latam',
        type: 'PAYU',
        apiKey: 'encrypted_test_api_key',
        apiSecret: 'encrypted_test_api_secret',
        merchantId: 'test_merchant',
        isActive: true
      };
      
      const mockTransaction = {
        id: 1,
        ...transactionData,
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      prisma.paymentMethod.findUnique.mockResolvedValue(mockPaymentMethod);
      prisma.paymentGateway.findFirst.mockResolvedValue(mockGateway);
      prisma.transaction.create.mockResolvedValue(mockTransaction);
      
      // Ejecutar el método
      const result = await PaymentService.createTransaction(transactionData);
      
      // Verificaciones
      expect(prisma.paymentMethod.findUnique).toHaveBeenCalledWith({
        where: { id: transactionData.paymentMethodId }
      });
      
      expect(prisma.paymentGateway.findFirst).toHaveBeenCalledWith({
        where: { id: mockPaymentMethod.gatewayId, isActive: true }
      });
      
      expect(prisma.transaction.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          amount: transactionData.amount,
          description: transactionData.description,
          paymentMethodId: transactionData.paymentMethodId,
          userId: transactionData.userId,
          status: 'PENDING',
          gatewayId: mockGateway.id
        })
      });
      
      expect(result).toEqual(mockTransaction);
    });
    
    it('debe rechazar transacción si el método de pago no existe', async () => {
      // Datos de prueba
      const transactionData = {
        amount: 100000,
        description: 'Pago de administración',
        paymentMethodId: 999, // ID inexistente
        userId: 123
      };
      
      // Mock de respuestas de Prisma
      prisma.paymentMethod.findUnique.mockResolvedValue(null);
      
      // Ejecutar el método y verificar que lanza error
      await expect(PaymentService.createTransaction(transactionData))
        .rejects
        .toThrow('Método de pago no encontrado');
    });
    
    it('debe rechazar transacción si la pasarela no está activa', async () => {
      // Datos de prueba
      const transactionData = {
        amount: 100000,
        description: 'Pago de administración',
        paymentMethodId: 1,
        userId: 123
      };
      
      // Mock de respuestas de Prisma
      const mockPaymentMethod = {
        id: 1,
        name: 'Tarjeta de Crédito',
        type: 'CREDIT_CARD',
        gatewayId: 1
      };
      
      prisma.paymentMethod.findUnique.mockResolvedValue(mockPaymentMethod);
      prisma.paymentGateway.findFirst.mockResolvedValue(null); // Pasarela no encontrada o inactiva
      
      // Ejecutar el método y verificar que lanza error
      await expect(PaymentService.createTransaction(transactionData))
        .rejects
        .toThrow('Pasarela de pago no disponible');
    });
  });
  
  describe('processTransaction', () => {
    it('debe procesar una transacción pendiente', async () => {
      // Datos de prueba
      const transactionId = 1;
      
      // Mock de respuestas de Prisma
      const mockTransaction = {
        id: transactionId,
        amount: 100000,
        description: 'Pago de administración',
        status: 'PENDING',
        paymentMethodId: 1,
        gatewayId: 1,
        userId: 123
      };
      
      const mockPaymentMethod = {
        id: 1,
        name: 'Tarjeta de Crédito',
        type: 'CREDIT_CARD',
        gatewayId: 1
      };
      
      const mockGateway = {
        id: 1,
        name: 'PayU Latam',
        type: 'PAYU',
        apiKey: 'encrypted_test_api_key',
        apiSecret: 'encrypted_test_api_secret',
        merchantId: 'test_merchant',
        isActive: true
      };
      
      const mockUpdatedTransaction = {
        ...mockTransaction,
        status: 'PROCESSING',
        gatewayReference: 'ref-123',
        updatedAt: new Date()
      };
      
      prisma.transaction.findUnique.mockResolvedValue(mockTransaction);
      prisma.paymentMethod.findUnique.mockResolvedValue(mockPaymentMethod);
      prisma.paymentGateway.findFirst.mockResolvedValue(mockGateway);
      prisma.transaction.update.mockResolvedValue(mockUpdatedTransaction);
      
      // Mock del adaptador de pasarela (normalmente sería una clase separada)
      jest.spyOn(PaymentService as any, 'getGatewayAdapter').mockReturnValue({
        initializePayment: jest.fn().mockResolvedValue({
          success: true,
          redirectUrl: 'https://gateway.example.com/pay',
          reference: 'ref-123'
        })
      });
      
      // Ejecutar el método
      const result = await PaymentService.processTransaction(transactionId);
      
      // Verificaciones
      expect(prisma.transaction.findUnique).toHaveBeenCalledWith({
        where: { id: transactionId },
        include: { paymentMethod: true }
      });
      
      expect(PaymentService.getGatewayAdapter).toHaveBeenCalledWith(mockGateway.type, {
        apiKey: 'test_api_key',
        apiSecret: 'test_api_secret',
        merchantId: 'test_merchant'
      });
      
      expect(prisma.transaction.update).toHaveBeenCalledWith({
        where: { id: transactionId },
        data: expect.objectContaining({
          status: 'PROCESSING',
          gatewayReference: 'ref-123'
        })
      });
      
      expect(result).toEqual({
        success: true,
        redirectUrl: 'https://gateway.example.com/pay',
        status: 'PROCESSING'
      });
    });
    
    it('debe rechazar procesamiento si la transacción no existe', async () => {
      // Datos de prueba
      const transactionId = 999; // ID inexistente
      
      // Mock de respuestas de Prisma
      prisma.transaction.findUnique.mockResolvedValue(null);
      
      // Ejecutar el método y verificar que lanza error
      await expect(PaymentService.processTransaction(transactionId))
        .rejects
        .toThrow('Transacción no encontrada');
    });
    
    it('debe rechazar procesamiento si la transacción no está pendiente', async () => {
      // Datos de prueba
      const transactionId = 1;
      
      // Mock de respuestas de Prisma
      const mockTransaction = {
        id: transactionId,
        status: 'PROCESSING', // Ya está en procesamiento
        paymentMethodId: 1,
        gatewayId: 1
      };
      
      prisma.transaction.findUnique.mockResolvedValue(mockTransaction);
      
      // Ejecutar el método y verificar que lanza error
      await expect(PaymentService.processTransaction(transactionId))
        .rejects
        .toThrow('La transacción no está en estado pendiente');
    });
  });
  
  describe('processWebhook', () => {
    it('debe procesar un webhook de pago exitoso', async () => {
      // Datos de prueba
      const webhookData = {
        gateway: 'payu',
        body: {
          reference_sale: 'ref-123',
          state_pol: '4', // Estado de pago aprobado en PayU
          value: '100000',
          transaction_id: 'gateway-tx-123'
        },
        headers: {
          'x-signature': 'valid-signature'
        },
        ip: '192.168.1.1'
      };
      
      // Mock de respuestas de Prisma
      prisma.transaction.findFirst.mockResolvedValue(mockTransaction);
      prisma.paymentGateway.findFirst.mockResolvedValue(mockGateway);
      prisma.transaction.update.mockResolvedValue(mockUpdatedTransaction);
      prisma.invoice.findUnique.mockResolvedValue(mockInvoice);
      prisma.invoice.update.mockResolvedValue(mockUpdatedInvoice);
      
      // Mock del adaptador de pasarela
      jest.spyOn(PaymentService as any, 'getGatewayAdapter').mockReturnValue({
        validateWebhook: jest.fn().mockReturnValue(true),
        parseWebhookStatus: jest.fn().mockReturnValue('COMPLETED')
      });
      
      // Ejecutar el método
      const result = await PaymentService.processWebhook(
        webhookData.gateway,
        webhookData.body,
        webhookData.headers['x-signature']
      );
      
      // Verificaciones
      expect(prisma.transaction.findFirst).toHaveBeenCalledWith({
        where: { gatewayReference: 'ref-123' }
      });
      
      expect(PaymentService.getGatewayAdapter).toHaveBeenCalledWith('PAYU', {
        apiKey: 'test_api_key',
        apiSecret: 'test_api_secret',
        merchantId: 'test_merchant'
      });
      
      expect(prisma.transaction.update).toHaveBeenCalledWith({
        where: { id: mockTransaction.id },
        data: expect.objectContaining({
          status: 'COMPLETED',
          gatewayResponse: webhookData.body
        })
      });
      
      // Verificar actualización de factura
      expect(prisma.invoice.update).toHaveBeenCalledWith({
        where: { id: mockTransaction.invoiceId },
        data: expect.objectContaining({
          status: 'PAID',
          paymentDate: expect.any(Date)
        })
      });
      
      expect(result).toEqual({
        transactionId: mockTransaction.id,
        status: 'COMPLETED',
        previousStatus: 'PROCESSING'
      });
    });
    
    it('debe rechazar webhook con firma inválida', async () => {
      // Datos de prueba
      const webhookData = {
        gateway: 'payu',
        body: {
          reference_sale: 'ref-123'
        },
        headers: {
          'x-signature': 'invalid-signature'
        },
        ip: '192.168.1.1'
      };
      
      // Mock de respuestas de Prisma
      const mockTransaction = {
        id: 1,
        gatewayReference: 'ref-123',
        gatewayId: 1
      };
      
      const mockGateway = {
        id: 1,
        type: 'PAYU',
        apiKey: 'encrypted_test_api_key',
        apiSecret: 'encrypted_test_api_secret'
      };
      
      prisma.transaction.findFirst.mockResolvedValue(mockTransaction);
      prisma.paymentGateway.findFirst.mockResolvedValue(mockGateway);
      
      // Mock del adaptador de pasarela con validación fallida
      jest.spyOn(PaymentService as any, 'getGatewayAdapter').mockReturnValue({
        validateWebhook: jest.fn().mockReturnValue(false)
      });
      
      // Ejecutar el método y verificar que lanza error
      await expect(PaymentService.processWebhook(
        webhookData.gateway,
        webhookData.body,
        webhookData.headers['x-signature']
      ))
        .rejects
        .toThrow('Firma de webhook inválida');
    });
  });
  
  describe('getTransactions', () => {
    it('debe obtener transacciones con paginación', async () => {
      // Datos de prueba
      const filters = {
        page: 1,
        limit: 10,
        status: 'COMPLETED'
      };
      
      // Mock de respuestas de Prisma
      const mockTransactions = [
        { id: 1, amount: 100000, status: 'COMPLETED' },
        { id: 2, amount: 50000, status: 'COMPLETED' }
      ];
      
      prisma.transaction.findMany.mockResolvedValue(mockTransactions);
      prisma.transaction.count.mockResolvedValue(2);
      
      // Ejecutar el método
      const result = await PaymentService.getTransactions(filters);
      
      // Verificaciones
      expect(prisma.transaction.findMany).toHaveBeenCalledWith({
        where: { status: 'COMPLETED' },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { paymentMethod: true }
      });
      
      expect(prisma.transaction.count).toHaveBeenCalledWith({
        where: { status: 'COMPLETED' }
      });
      
      expect(result).toEqual({
        data: mockTransactions,
        meta: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1
        }
      });
    });
    
    it('debe filtrar transacciones por fecha', async () => {
      // Datos de prueba
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');
      
      const filters = {
        page: 1,
        limit: 10,
        startDate,
        endDate
      };
      
      // Mock de respuestas de Prisma
      prisma.transaction.findMany.mockResolvedValue([]);
      prisma.transaction.count.mockResolvedValue(0);
      
      // Ejecutar el método
      await PaymentService.getTransactions(filters);
      
      // Verificaciones
      expect(prisma.transaction.findMany).toHaveBeenCalledWith({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { paymentMethod: true }
      });
    });
  });
  
  describe('savePaymentToken', () => {
    it('debe guardar un token de pago', async () => {
      // Datos de prueba
      const tokenData = {
        userId: 123,
        paymentMethodId: 1,
        token: 'card_token_123',
        lastFour: '4242',
        cardType: 'visa',
        expiryMonth: '12',
        expiryYear: '2028'
      };
      
      // Mock de respuestas de Prisma
      const mockToken = {
        id: 1,
        ...tokenData,
        token: 'encrypted_card_token_123',
        createdAt: new Date()
      };
      
      prisma.paymentToken.create.mockResolvedValue(mockToken);
      
      // Ejecutar el método
      const result = await PaymentService.savePaymentToken(tokenData);
      
      // Verificaciones
      expect(encryptData).toHaveBeenCalledWith(tokenData.token);
      
      expect(prisma.paymentToken.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: tokenData.userId,
          paymentMethodId: tokenData.paymentMethodId,
          token: 'encrypted_card_token_123',
          lastFour: tokenData.lastFour,
          cardType: tokenData.cardType,
          expiryMonth: tokenData.expiryMonth,
          expiryYear: tokenData.expiryYear
        })
      });
      
      expect(result).toEqual({
        ...mockToken,
        token: undefined // El token no debe ser devuelto
      });
    });
  });
});
