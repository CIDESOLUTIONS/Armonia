// src/__tests__/financial/billing-engine.test.ts
import { BillingEngine } from '@/lib/financial/billing-engine';
import { FreemiumService } from '@/lib/freemium-service';

// Mock de Prisma
jest.mock('@/lib/prisma', () => ({
  getPrisma: jest.fn(() => ({
    residentialComplex: {
      findUnique: jest.fn()
    },
    property: {
      findMany: jest.fn()
    },
    fee: {
      findMany: jest.fn()
    },
    bill: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn()
    },
    payment: {
      create: jest.fn()
    },
    $transaction: jest.fn((callback) => callback({
      bill: {
        create: jest.fn(),
        update: jest.fn()
      },
      payment: {
        create: jest.fn()
      }
    }))
  }))
}));

describe('BillingEngine', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateBillsForPeriod', () => {
    it('should generate bills for all active properties', async () => {
      const { getPrisma } = require('@/lib/prisma');
      const mockPrisma = getPrisma();

      // Mock data
      const mockComplex = {
        id: 1,
        planType: 'PREMIUM',
        isTrialActive: false
      };

      const mockProperties = [
        {
          id: 1,
          area: 100,
          isActive: true,
          owner: { id: 1, name: 'Owner 1' },
          residents: []
        },
        {
          id: 2,
          area: 80,
          isActive: true,
          owner: { id: 2, name: 'Owner 2' },
          residents: []
        }
      ];

      const mockFees = [
        {
          id: 1,
          name: 'Administración',
          baseAmount: 100000,
          type: 'MONTHLY',
          isPerUnit: false
        },
        {
          id: 2,
          name: 'Fondo de Reserva',
          baseAmount: 1000,
          type: 'MONTHLY',
          isPerUnit: true
        }
      ];

      // Setup mocks
      mockPrisma.residentialComplex.findUnique.mockResolvedValue(mockComplex);
      mockPrisma.property.findMany.mockResolvedValue(mockProperties);
      mockPrisma.fee.findMany.mockResolvedValue(mockFees);

      // Mock FreemiumService
      jest.spyOn(FreemiumService, 'hasFeatureAccess').mockReturnValue(true);

      const period = {
        startDate: new Date(2024, 0, 1),
        endDate: new Date(2024, 0, 31),
        year: 2024,
        month: 1
      };

      // Execute
      const bills = await BillingEngine.generateBillsForPeriod(1, period);

      // Assertions
      expect(bills).toHaveLength(2);
      
      // Verificar primera factura
      expect(bills[0]).toMatchObject({
        propertyId: 1,
        period,
        fees: [
          { feeId: 1, name: 'Administración', amount: 100000, type: 'MONTHLY' },
          { feeId: 2, name: 'Fondo de Reserva', amount: 100000, type: 'MONTHLY' } // 1000 * 100 (área)
        ],
        totalAmount: 200000
      });

      // Verificar segunda factura
      expect(bills[1]).toMatchObject({
        propertyId: 2,
        totalAmount: 180000 // 100000 + (1000 * 80)
      });

      expect(mockPrisma.residentialComplex.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        select: { planType: true, isTrialActive: true }
      });
    });

    it('should throw error for complexes without billing access', async () => {
      const { getPrisma } = require('@/lib/prisma');
      const mockPrisma = getPrisma();

      const mockComplex = {
        id: 1,
        planType: 'BASIC',
        isTrialActive: false
      };

      mockPrisma.residentialComplex.findUnique.mockResolvedValue(mockComplex);
      jest.spyOn(FreemiumService, 'hasFeatureAccess').mockReturnValue(false);

      const period = {
        startDate: new Date(2024, 0, 1),
        endDate: new Date(2024, 0, 31),
        year: 2024,
        month: 1
      };

      await expect(
        BillingEngine.generateBillsForPeriod(1, period)
      ).rejects.toThrow('Funcionalidad no disponible en su plan actual');
    });
  });

  describe('calculateLateFee', () => {
    it('should calculate correct late fees', () => {
      // 3% mensual, 30 días de retraso = 3%
      const lateFee = BillingEngine.calculateLateFee(100000, 30, 0.03);
      expect(lateFee).toBe(3000);
    });

    it('should return 0 for no late days', () => {
      const lateFee = BillingEngine.calculateLateFee(100000, 0, 0.03);
      expect(lateFee).toBe(0);
    });

    it('should handle partial month delays', () => {
      // 15 días = 50% del mes = 1.5%
      const lateFee = BillingEngine.calculateLateFee(100000, 15, 0.03);
      expect(lateFee).toBe(1500);
    });
  });

  describe('processPayment', () => {
    it('should process full payment correctly', async () => {
      const { getPrisma } = require('@/lib/prisma');
      const mockPrisma = getPrisma();

      const mockBill = {
        id: 1,
        totalAmount: 100000,
        status: 'PENDING',
        billItems: []
      };

      mockPrisma.bill.findUnique.mockResolvedValue(mockBill);

      const result = await BillingEngine.processPayment(1, 100000, 'BANK_TRANSFER', 'REF123');

      expect(result).toBe(true); // Full payment
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it('should process partial payment correctly', async () => {
      const { getPrisma } = require('@/lib/prisma');
      const mockPrisma = getPrisma();

      const mockBill = {
        id: 1,
        totalAmount: 100000,
        status: 'PENDING',
        billItems: []
      };

      mockPrisma.bill.findUnique.mockResolvedValue(mockBill);

      const result = await BillingEngine.processPayment(1, 50000, 'CREDIT_CARD');

      expect(result).toBe(false); // Partial payment
    });

    it('should throw error for already paid bills', async () => {
      const { getPrisma } = require('@/lib/prisma');
      const mockPrisma = getPrisma();

      const mockBill = {
        id: 1,
        totalAmount: 100000,
        status: 'PAID',
        billItems: []
      };

      mockPrisma.bill.findUnique.mockResolvedValue(mockBill);

      await expect(
        BillingEngine.processPayment(1, 100000, 'CASH')
      ).rejects.toThrow('Factura ya está pagada');
    });
  });

  describe('getCurrentBillingPeriod', () => {
    it('should return correct current period', () => {
      const mockDate = new Date(2024, 2, 15); // March 15, 2024
      jest.useFakeTimers();
      jest.setSystemTime(mockDate);

      const period = BillingEngine.getCurrentBillingPeriod();

      expect(period.year).toBe(2024);
      expect(period.month).toBe(3);
      expect(period.startDate).toEqual(new Date(2024, 2, 1));
      expect(period.endDate).toEqual(new Date(2024, 2, 31));

      jest.useRealTimers();
    });
  });
});
