// src/lib/financial/billing-engine.ts
import { PlanType } from '@prisma/client';
import { getPrisma } from '@/lib/prisma';
import { FreemiumService } from '@/lib/freemium-service';

export interface BillingPeriod {
  startDate: Date;
  endDate: Date;
  year: number;
  month: number;
}

export interface FeeStructure {
  id: number;
  name: string;
  type: 'MONTHLY' | 'EXTRAORDINARY' | 'SPECIAL_ASSESSMENT';
  baseAmount: number;
  isPerUnit: boolean;
  isActive: boolean;
  dueDay: number; // Día del mes en que vence
  complexId: number;
}

export interface GeneratedBill {
  propertyId: number;
  period: BillingPeriod;
  fees: Array<{
    feeId: number;
    name: string;
    amount: number;
    type: string;
  }>;
  totalAmount: number;
  dueDate: Date;
  generatedAt: Date;
}

export class BillingEngine {
  
  /**
   * Genera facturas automáticas para un período específico
   */
  static async generateBillsForPeriod(
    complexId: number,
    period: BillingPeriod
  ): Promise<GeneratedBill[]> {
    const prisma = getPrisma();
    
    // Verificar si el complejo tiene acceso a facturación avanzada
    const complex = await prisma.residentialComplex.findUnique({
      where: { id: complexId },
      select: { planType: true, isTrialActive: true }
    });

    if (!complex) {
      throw new Error('Complejo no encontrado');
    }

    const hasAccess = FreemiumService.hasFeatureAccess(
      complex.planType, 
      'facturación_automática'
    );

    if (!hasAccess && !complex.isTrialActive) {
      throw new Error('Funcionalidad no disponible en su plan actual');
    }

    // Obtener propiedades activas del complejo
    const properties = await prisma.property.findMany({
      where: { 
        complexId,
        isActive: true 
      },
      include: {
        owner: true,
        residents: true
      }
    });

    // Obtener estructura de cuotas activas
    const fees = await prisma.fee.findMany({
      where: {
        complexId,
        isActive: true
      }
    });

    const generatedBills: GeneratedBill[] = [];

    // Generar factura para cada propiedad
    for (const property of properties) {
      const billFees: GeneratedBill['fees'] = [];
      let totalAmount = 0;

      // Calcular cada cuota
      for (const fee of fees) {
        let amount = fee.baseAmount;
        
        // Si es por unidad, calcular según área o valor de la propiedad
        if (fee.isPerUnit && property.area) {
          amount = fee.baseAmount * property.area;
        }

        billFees.push({
          feeId: fee.id,
          name: fee.name,
          amount,
          type: fee.type
        });

        totalAmount += amount;
      }

      // Fecha de vencimiento (por defecto día 15 del mes siguiente)
      const dueDate = new Date(period.year, period.month, 15);

      const generatedBill: GeneratedBill = {
        propertyId: property.id,
        period,
        fees: billFees,
        totalAmount,
        dueDate,
        generatedAt: new Date()
      };

      generatedBills.push(generatedBill);
    }

    return generatedBills;
  }

  /**
   * Persiste las facturas generadas en la base de datos
   */
  static async saveBills(bills: GeneratedBill[]): Promise<void> {
    const prisma = getPrisma();

    await prisma.$transaction(async (tx) => {
      for (const bill of bills) {
        await tx.bill.create({
          data: {
            propertyId: bill.propertyId,
            billingPeriod: `${bill.period.year}-${String(bill.period.month).padStart(2, '0')}`,
            totalAmount: bill.totalAmount,
            dueDate: bill.dueDate,
            status: 'PENDING',
            generatedAt: bill.generatedAt,
            billItems: {
              create: bill.fees.map(fee => ({
                feeId: fee.feeId,
                name: fee.name,
                amount: fee.amount,
                type: fee.type
              }))
            }
          }
        });
      }
    });
  }

  /**
   * Obtiene período de facturación actual
   */
  static getCurrentBillingPeriod(): BillingPeriod {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // JavaScript months are 0-indexed

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // Last day of the month

    return {
      startDate,
      endDate,
      year,
      month
    };
  }

  /**
   * Calcula intereses por mora
   */
  static calculateLateFee(
    originalAmount: number,
    daysLate: number,
    interestRate: number = 0.03 // 3% mensual por defecto
  ): number {
    if (daysLate <= 0) return 0;
    
    const monthlyRate = interestRate;
    const dailyRate = monthlyRate / 30;
    const lateFee = originalAmount * dailyRate * daysLate;
    
    return Math.round(lateFee * 100) / 100; // Redondear a 2 decimales
  }

  /**
   * Procesa pagos automáticamente
   */
  static async processPayment(
    billId: number,
    amount: number,
    paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'CREDIT_CARD' | 'PSE',
    reference?: string
  ): Promise<boolean> {
    const prisma = getPrisma();

    const bill = await prisma.bill.findUnique({
      where: { id: billId },
      include: { billItems: true }
    });

    if (!bill) {
      throw new Error('Factura no encontrada');
    }

    if (bill.status === 'PAID') {
      throw new Error('Factura ya está pagada');
    }

    // Verificar si el monto cubre la deuda
    const isFullPayment = amount >= bill.totalAmount;

    await prisma.$transaction(async (tx) => {
      // Crear registro de pago
      await tx.payment.create({
        data: {
          billId,
          amount,
          paymentMethod,
          reference: reference || `PAY-${Date.now()}`,
          paidAt: new Date(),
          status: 'CONFIRMED'
        }
      });

      // Actualizar estado de la factura si está completamente pagada
      if (isFullPayment) {
        await tx.bill.update({
          where: { id: billId },
          data: {
            status: 'PAID',
            paidAt: new Date()
          }
        });
      }
    });

    return isFullPayment;
  }

  /**
   * Genera reporte financiero del período
   */
  static async generateFinancialReport(
    complexId: number,
    startDate: Date,
    endDate: Date
  ) {
    const prisma = getPrisma();

    const [bills, payments, expenses] = await Promise.all([
      // Facturas del período
      prisma.bill.findMany({
        where: {
          property: { complexId },
          generatedAt: {
            gte: startDate,
            lte: endDate
          }
        },
        include: {
          billItems: true,
          payments: true,
          property: true
        }
      }),

      // Pagos del período
      prisma.payment.findMany({
        where: {
          bill: {
            property: { complexId }
          },
          paidAt: {
            gte: startDate,
            lte: endDate
          }
        }
      }),

      // Gastos del período (si existe tabla de expenses)
      prisma.expense?.findMany({
        where: {
          complexId,
          expenseDate: {
            gte: startDate,
            lte: endDate
          }
        }
      }) || []
    ]);

    const totalBilled = bills.reduce((sum, bill) => sum + bill.totalAmount, 0);
    const totalCollected = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalExpenses = expenses.reduce((sum: number, expense: any) => sum + expense.amount, 0);
    const collectionRate = totalBilled > 0 ? (totalCollected / totalBilled) * 100 : 0;

    return {
      period: { startDate, endDate },
      summary: {
        totalBilled,
        totalCollected,
        totalExpenses,
        netIncome: totalCollected - totalExpenses,
        collectionRate,
        pendingAmount: totalBilled - totalCollected
      },
      bills: bills.length,
      payments: payments.length,
      expenses: expenses.length
    };
  }
}
