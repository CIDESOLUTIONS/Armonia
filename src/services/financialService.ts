// src/services/financialService.ts
import { PrismaClient, Fee, Payment, Receipt, ReceiptType, ReceiptStatus, PaymentStatus } from '@prisma/client';
import { generatePDF } from '@/lib/pdf/pdfGenerator';
import { sendEmail } from '@/lib/email/emailSender';
import { formatCurrency } from '@/lib/utils/formatters';
import { ServerLogger } from '@/lib/logging/server-logger';

/**
 * Servicio para gestionar operaciones financieras
 */
export class FinancialService {
  private prisma: PrismaClient;
  private schema: string;

  /**
   * Constructor del servicio financiero
   * @param schema Esquema del conjunto residencial (multi-tenant)
   */
  constructor(schema: string = 'tenant') {
    this.prisma = new PrismaClient();
    this.schema = schema;
  }

  /**
   * Obtiene todas las cuotas con filtros opcionales
   * @param filters Filtros para la consulta
   * @returns Lista de cuotas
   */
  async getFees(filters: {
    propertyId?: number;
    status?: PaymentStatus;
    startDate?: Date;
    endDate?: Date;
    type?: string;
    page?: number;
    limit?: number;
  }) {
    try {
      const { propertyId, status, startDate, endDate, type, page = 1, limit = 10 } = filters;
      
      const where: any = {};
      
      if (propertyId) where.propertyId = propertyId;
      if (status) where.status = status;
      if (type) where.type = type;
      
      if (startDate || endDate) {
        where.dueDate = {};
        if (startDate) where.dueDate.gte = startDate;
        if (endDate) where.dueDate.lte = endDate;
      }
      
      const skip = (page - 1) * limit;
      
      const [fees, total] = await Promise.all([
        this.prisma.$queryRawUnsafe(`
          SELECT * FROM "${this.schema}"."Fee"
          WHERE ${this.buildWhereClause(where)}
          ORDER BY "dueDate" DESC
          LIMIT ${limit} OFFSET ${skip}
        `),
        this.prisma.$queryRawUnsafe(`
          SELECT COUNT(*) FROM "${this.schema}"."Fee"
          WHERE ${this.buildWhereClause(where)}
        `)
      ]);
      
      return {
        fees,
        total: parseInt(total[0].count),
        page,
        limit
      };
    } catch (error) {
      ServerLogger.error('Error al obtener cuotas:', error);
      throw error;
    }
  }

  /**
   * Obtiene una cuota por su ID
   * @param id ID de la cuota
   * @returns Cuota encontrada
   */
  async getFeeById(id: number) {
    try {
      return await this.prisma.$queryRawUnsafe(`
        SELECT * FROM "${this.schema}"."Fee"
        WHERE "id" = ${id}
      `);
    } catch (error) {
      ServerLogger.error(`Error al obtener cuota ${id}:`, error);
      throw error;
    }
  }

  /**
   * Registra un nuevo pago
   * @param data Datos del pago
   * @returns Pago creado
   */
  async createPayment(data: {
    feeId: number;
    amount: number;
    paymentMethod: string;
    paymentDate: Date;
    reference?: string;
    notes?: string;
    paidById: number;
    receivedById?: number;
  }) {
    try {
      const { feeId, amount, paymentMethod, paymentDate, reference, notes, paidById, receivedById } = data;
      
      // Verificar que la cuota existe
      const fee = await this.getFeeById(feeId);
      if (!fee) {
        throw new Error(`La cuota con ID ${feeId} no existe`);
      }
      
      // Crear el pago
      const payment = await this.prisma.$queryRawUnsafe(`
        INSERT INTO "${this.schema}"."Payment" (
          "feeId", "amount", "paymentMethod", "paymentDate", 
          "reference", "notes", "paidById", "receivedById", "status"
        )
        VALUES (
          ${feeId}, ${amount}, '${paymentMethod}', '${paymentDate.toISOString()}',
          ${reference ? `'${reference}'` : 'NULL'}, 
          ${notes ? `'${notes}'` : 'NULL'},
          ${paidById}, ${receivedById || 'NULL'}, 'PENDING'
        )
        RETURNING *
      `);
      
      // Actualizar estado de la cuota si el pago cubre el monto total
      if (amount >= fee.amount) {
        await this.prisma.$queryRawUnsafe(`
          UPDATE "${this.schema}"."Fee"
          SET "status" = 'PAID'
          WHERE "id" = ${feeId}
        `);
      } else {
        await this.prisma.$queryRawUnsafe(`
          UPDATE "${this.schema}"."Fee"
          SET "status" = 'PARTIAL'
          WHERE "id" = ${feeId}
        `);
      }
      
      return payment;
    } catch (error) {
      ServerLogger.error('Error al crear pago:', error);
      throw error;
    }
  }

  /**
   * Genera un recibo para un pago o conjunto de pagos
   * @param data Datos para la generación del recibo
   * @returns Recibo generado
   */
  async generateReceipt(data: {
    propertyId: number;
    feeIds: number[];
    type: ReceiptType;
    issuedById: number;
  }) {
    try {
      const { propertyId, feeIds, type, issuedById } = data;
      
      // Verificar que las cuotas existen y pertenecen a la propiedad
      const fees = await Promise.all(feeIds.map(id => this.getFeeById(id)));
      
      if (fees.some(fee => !fee || fee.propertyId !== propertyId)) {
        throw new Error('Una o más cuotas no existen o no pertenecen a la propiedad especificada');
      }
      
      // Calcular monto total
      const totalAmount = fees.reduce((sum, fee) => sum + parseFloat(fee.amount), 0);
      
      // Generar número de recibo único
      const receiptNumber = this.generateReceiptNumber(propertyId);
      
      // Crear el recibo en la base de datos
      const receipt = await this.prisma.$queryRawUnsafe(`
        INSERT INTO "${this.schema}"."Receipt" (
          "receiptNumber", "issueDate", "totalAmount", "type",
          "status", "issuedById", "propertyId"
        )
        VALUES (
          '${receiptNumber}', NOW(), ${totalAmount}, '${type}',
          'GENERATED', ${issuedById}, ${propertyId}
        )
        RETURNING *
      `);
      
      // Asociar las cuotas al recibo
      for (const feeId of feeIds) {
        await this.prisma.$queryRawUnsafe(`
          UPDATE "${this.schema}"."Fee"
          SET "receiptId" = ${receipt.id}
          WHERE "id" = ${feeId}
        `);
      }
      
      // Generar el PDF del recibo
      const property = await this.prisma.$queryRawUnsafe(`
        SELECT * FROM "${this.schema}"."Property"
        WHERE "id" = ${propertyId}
      `);
      
      const pdfPath = await this.generateReceiptPDF(receipt, fees, property);
      
      // Actualizar la URL del PDF en el recibo
      await this.prisma.$queryRawUnsafe(`
        UPDATE "${this.schema}"."Receipt"
        SET "pdfUrl" = '${pdfPath}'
        WHERE "id" = ${receipt.id}
      `);
      
      return {
        ...receipt,
        pdfUrl: pdfPath
      };
    } catch (error) {
      ServerLogger.error('Error al generar recibo:', error);
      throw error;
    }
  }

  /**
   * Genera recibos masivamente para un conjunto de propiedades
   * @param data Datos para la generación masiva de recibos
   * @returns Recibos generados
   */
  async generateBulkReceipts(data: {
    month: number;
    year: number;
    feeType?: string;
    type: ReceiptType;
    issuedById: number;
  }) {
    try {
      const { month, year, feeType, type, issuedById } = data;
      
      // Obtener cuotas del mes y año especificados
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      
      const where: any = {
        dueDate: {
          gte: startDate,
          lte: endDate
        },
        status: 'PENDING'
      };
      
      if (feeType) {
        where.type = feeType;
      }
      
      const fees = await this.prisma.$queryRawUnsafe(`
        SELECT * FROM "${this.schema}"."Fee"
        WHERE ${this.buildWhereClause(where)}
      `);
      
      // Agrupar cuotas por propiedad
      const feesByProperty: Record<number, any[]> = {};
      
      for (const fee of fees) {
        if (!feesByProperty[fee.propertyId]) {
          feesByProperty[fee.propertyId] = [];
        }
        feesByProperty[fee.propertyId].push(fee);
      }
      
      // Generar un recibo por cada propiedad
      const receipts = [];
      
      for (const [propertyId, propertyFees] of Object.entries(feesByProperty)) {
        if (propertyFees.length > 0) {
          const receipt = await this.generateReceipt({
            propertyId: parseInt(propertyId),
            feeIds: propertyFees.map(fee => fee.id),
            type,
            issuedById
          });
          
          receipts.push(receipt);
        }
      }
      
      return {
        generatedReceipts: receipts.length,
        receipts
      };
    } catch (error) {
      ServerLogger.error('Error al generar recibos masivamente:', error);
      throw error;
    }
  }

  /**
   * Envía un recibo por correo electrónico
   * @param receiptId ID del recibo a enviar
   * @param email Correo electrónico del destinatario
   * @returns Resultado del envío
   */
  async sendReceiptByEmail(receiptId: number, email: string) {
    try {
      // Obtener el recibo
      const receipt = await this.prisma.$queryRawUnsafe(`
        SELECT * FROM "${this.schema}"."Receipt"
        WHERE "id" = ${receiptId}
      `);
      
      if (!receipt) {
        throw new Error(`El recibo con ID ${receiptId} no existe`);
      }
      
      if (!receipt.pdfUrl) {
        throw new Error(`El recibo con ID ${receiptId} no tiene un PDF generado`);
      }
      
      // Obtener la propiedad y el residente
      const property = await this.prisma.$queryRawUnsafe(`
        SELECT * FROM "${this.schema}"."Property"
        WHERE "id" = ${receipt.propertyId}
      `);
      
      // Enviar el correo
      await sendEmail({
        to: email,
        subject: `Recibo de Pago #${receipt.receiptNumber}`,
        text: `Adjunto encontrará su recibo de pago #${receipt.receiptNumber} para la unidad ${property.unitNumber}.`,
        attachments: [
          {
            filename: `Recibo_${receipt.receiptNumber}.pdf`,
            path: receipt.pdfUrl
          }
        ]
      });
      
      // Actualizar estado del recibo
      await this.prisma.$queryRawUnsafe(`
        UPDATE "${this.schema}"."Receipt"
        SET "status" = 'SENT'
        WHERE "id" = ${receiptId}
      `);
      
      return { success: true, message: 'Recibo enviado exitosamente' };
    } catch (error) {
      ServerLogger.error(`Error al enviar recibo ${receiptId} por correo:`, error);
      throw error;
    }
  }

  /**
   * Genera el PDF de un recibo
   * @param receipt Datos del recibo
   * @param fees Cuotas incluidas en el recibo
   * @param property Propiedad asociada al recibo
   * @returns Ruta del archivo PDF generado
   */
  private async generateReceiptPDF(receipt: any, fees: any[], property: any) {
    try {
      // Obtener datos del conjunto residencial
      const residentialComplex = await this.prisma.$queryRawUnsafe(`
        SELECT * FROM "armonia"."ResidentialComplex"
        WHERE "schema" = '${this.schema}'
      `);
      
      // Preparar datos para la plantilla
      const templateData = {
        receipt: {
          ...receipt,
          formattedDate: new Date(receipt.issueDate).toLocaleDateString('es-CO'),
          formattedAmount: formatCurrency(receipt.totalAmount)
        },
        fees: fees.map(fee => ({
          ...fee,
          formattedAmount: formatCurrency(fee.amount),
          formattedDueDate: new Date(fee.dueDate).toLocaleDateString('es-CO')
        })),
        property,
        residentialComplex
      };
      
      // Generar el PDF según el tipo de recibo
      let template = '';
      switch (receipt.type) {
        case 'DETAILED':
          template = 'receipt-detailed';
          break;
        case 'SIMPLIFIED':
          template = 'receipt-simplified';
          break;
        default:
          template = 'receipt-standard';
      }
      
      const pdfPath = `/uploads/receipts/${receipt.receiptNumber}.pdf`;
      const fullPath = `${process.cwd()}/public${pdfPath}`;
      
      await generatePDF(template, templateData, fullPath);
      
      return pdfPath;
    } catch (error) {
      ServerLogger.error('Error al generar PDF del recibo:', error);
      throw error;
    }
  }

  /**
   * Genera un número de recibo único
   * @param propertyId ID de la propiedad
   * @returns Número de recibo
   */
  private generateReceiptNumber(propertyId: number): string {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `R-${propertyId}-${timestamp}${random}`;
  }

  /**
   * Construye la cláusula WHERE para consultas SQL
   * @param where Objeto con condiciones
   * @returns Cláusula WHERE en formato SQL
   */
  private buildWhereClause(where: any): string {
    if (!where || Object.keys(where).length === 0) {
      return '1=1';
    }
    
    const conditions = [];
    
    for (const [key, value] of Object.entries(where)) {
      if (value === null || value === undefined) continue;
      
      if (typeof value === 'object') {
        // Para rangos de fechas
        if ('gte' in value) {
          conditions.push(`"${key}" >= '${value.gte.toISOString()}'`);
        }
        if ('lte' in value) {
          conditions.push(`"${key}" <= '${value.lte.toISOString()}'`);
        }
      } else if (typeof value === 'string') {
        conditions.push(`"${key}" = '${value}'`);
      } else if (typeof value === 'number') {
        conditions.push(`"${key}" = ${value}`);
      } else if (typeof value === 'boolean') {
        conditions.push(`"${key}" = ${value}`);
      }
    }
    
    return conditions.length > 0 ? conditions.join(' AND ') : '1=1';
  }
}
