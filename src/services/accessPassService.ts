import { getPrisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode';
import { format, addDays, addHours, isAfter } from 'date-fns';

// Inicializar cliente Prisma
const prisma = getPrisma();

/**
 * Servicio para la gestión de pases de acceso
 */
export class AccessPassService {
  /**
   * Genera un nuevo pase de acceso
   */
  async generateAccessPass(data: {
    visitorName: string;
    documentType: string;
    documentNumber: string;
    destination: string;
    residentId?: number;
    residentName?: string;
    validFrom: Date;
    validUntil: Date;
    passType: 'SINGLE_USE' | 'TEMPORARY' | 'RECURRENT';
    createdBy: number;
    preRegisterId?: number;
    notes?: string;
  }) {
    // Validar datos requeridos
    if (!data.visitorName || !data.documentType || !data.documentNumber || !data.destination) {
      throw new Error('Faltan campos requeridos');
    }
    
    // Validar fechas
    if (isAfter(data.validFrom, data.validUntil)) {
      throw new Error('La fecha de inicio debe ser anterior a la fecha de fin');
    }
    
    // Generar código único para el pase
    const passCode = uuidv4().substring(0, 8).toUpperCase();
    
    // Crear el pase de acceso
    const accessPass = await prisma.accessPass.create({
      data: {
        passCode,
        visitorName: data.visitorName,
        documentType: data.documentType as any,
        documentNumber: data.documentNumber,
        destination: data.destination,
        residentId: data.residentId,
        residentName: data.residentName,
        validFrom: data.validFrom,
        validUntil: data.validUntil,
        passType: data.passType as any,
        status: 'ACTIVE',
        usageCount: 0,
        maxUsageCount: data.passType === 'SINGLE_USE' ? 1 : null,
        createdBy: data.createdBy,
        preRegisterId: data.preRegisterId,
        notes: data.notes
      }
    });
    
    // Generar QR para el pase
    const qrData = await this.generateQRForPass(accessPass.id);
    
    // Actualizar el pase con la URL del QR
    const updatedPass = await prisma.accessPass.update({
      where: { id: accessPass.id },
      data: { qrCodeUrl: qrData.qrDataUrl }
    });
    
    return {
      ...updatedPass,
      qrData: qrData.qrDataUrl
    };
  }
  
  /**
   * Genera un código QR para un pase de acceso
   */
  async generateQRForPass(passId: number) {
    // Obtener datos del pase
    const pass = await prisma.accessPass.findUnique({
      where: { id: passId }
    });
    
    if (!pass) {
      throw new Error('Pase de acceso no encontrado');
    }
    
    // Crear datos para el QR
    const qrContent = JSON.stringify({
      id: pass.id,
      code: pass.passCode,
      visitorName: pass.visitorName,
      documentNumber: pass.documentNumber,
      validUntil: pass.validUntil,
      type: pass.passType,
      timestamp: new Date().toISOString()
    });
    
    // Generar QR como data URL
    const qrDataUrl = await QRCode.toDataURL(qrContent, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 300
    });
    
    return {
      passId,
      qrDataUrl,
      content: qrContent
    };
  }
  
  /**
   * Valida un pase de acceso
   */
  async validateAccessPass(passCode: string) {
    // Buscar el pase por su código
    const pass = await prisma.accessPass.findFirst({
      where: { passCode }
    });
    
    if (!pass) {
      return {
        valid: false,
        message: 'Pase de acceso no encontrado'
      };
    }
    
    // Verificar si el pase está activo
    if (pass.status !== 'ACTIVE') {
      return {
        valid: false,
        message: `Pase ${pass.status === 'USED' ? 'ya utilizado' : pass.status === 'EXPIRED' ? 'expirado' : 'revocado'}`,
        pass
      };
    }
    
    // Verificar si el pase está dentro del período de validez
    const now = new Date();
    if (isAfter(now, pass.validUntil)) {
      // Actualizar estado a expirado
      await prisma.accessPass.update({
        where: { id: pass.id },
        data: { status: 'EXPIRED' }
      });
      
      return {
        valid: false,
        message: 'Pase expirado',
        pass
      };
    }
    
    // Verificar si es un pase de un solo uso y ya fue utilizado
    if (pass.passType === 'SINGLE_USE' && pass.usageCount >= 1) {
      // Actualizar estado a usado
      await prisma.accessPass.update({
        where: { id: pass.id },
        data: { status: 'USED' }
      });
      
      return {
        valid: false,
        message: 'Pase de un solo uso ya utilizado',
        pass
      };
    }
    
    return {
      valid: true,
      message: 'Pase válido',
      pass
    };
  }
  
  /**
   * Registra el uso de un pase de acceso
   */
  async registerPassUsage(passId: number, data: {
    action: 'ENTRY' | 'EXIT' | 'DENIED';
    location: string;
    registeredBy: number;
    notes?: string;
  }) {
    // Verificar que el pase exista
    const pass = await prisma.accessPass.findUnique({
      where: { id: passId }
    });
    
    if (!pass) {
      throw new Error('Pase de acceso no encontrado');
    }
    
    // Crear registro en bitácora de accesos
    const accessLog = await prisma.accessLog.create({
      data: {
        action: data.action as any,
        location: data.location,
        notes: data.notes,
        registeredBy: data.registeredBy,
        accessPassId: passId
      }
    });
    
    // Si la acción es ENTRY, incrementar el contador de uso
    if (data.action === 'ENTRY') {
      const updatedPass = await prisma.accessPass.update({
        where: { id: passId },
        data: {
          usageCount: { increment: 1 },
          // Si es un pase de un solo uso y ya se utilizó, marcarlo como usado
          status: pass.passType === 'SINGLE_USE' ? 'USED' : pass.status
        }
      });
      
      return {
        accessLog,
        pass: updatedPass
      };
    }
    
    return {
      accessLog,
      pass
    };
  }
  
  /**
   * Revoca un pase de acceso
   */
  async revokeAccessPass(passId: number, data: {
    revokedBy: number;
    reason: string;
  }) {
    // Verificar que el pase exista
    const pass = await prisma.accessPass.findUnique({
      where: { id: passId }
    });
    
    if (!pass) {
      throw new Error('Pase de acceso no encontrado');
    }
    
    // Actualizar estado a revocado
    const updatedPass = await prisma.accessPass.update({
      where: { id: passId },
      data: {
        status: 'REVOKED',
        notes: pass.notes 
          ? `${pass.notes}\nRevocado: ${data.reason}`
          : `Revocado: ${data.reason}`
      }
    });
    
    // Crear registro en bitácora de accesos
    await prisma.accessLog.create({
      data: {
        action: 'DENIED',
        location: 'Sistema',
        notes: `Pase revocado: ${data.reason}`,
        registeredBy: data.revokedBy,
        accessPassId: passId
      }
    });
    
    return updatedPass;
  }
  
  /**
   * Obtiene todos los pases de acceso con paginación y filtros
   */
  async getAllAccessPasses(params: {
    page?: number;
    limit?: number;
    status?: string;
    passType?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const {
      page = 1,
      limit = 10,
      status,
      passType,
      search,
      startDate,
      endDate
    } = params;

    const skip = (page - 1) * limit;
    
    // Construir filtros
    const where: any = {};
    
    if (status) {
      where.status = status;
    }
    
    if (passType) {
      where.passType = passType;
    }
    
    if (search) {
      where.OR = [
        { visitorName: { contains: search, mode: 'insensitive' } },
        { documentNumber: { contains: search } },
        { destination: { contains: search, mode: 'insensitive' } },
        { residentName: { contains: search, mode: 'insensitive' } },
        { passCode: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (startDate && endDate) {
      where.validFrom = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    } else if (startDate) {
      where.validFrom = {
        gte: new Date(startDate)
      };
    } else if (endDate) {
      where.validFrom = {
        lte: new Date(endDate)
      };
    }
    
    // Ejecutar consulta con conteo total
    const [passes, total] = await Promise.all([
      prisma.accessPass.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          accessLogs: {
            orderBy: { timestamp: 'desc' },
            take: 5
          }
        }
      }),
      prisma.accessPass.count({ where })
    ]);
    
    return {
      data: passes,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
  
  /**
   * Obtiene un pase de acceso por su ID
   */
  async getAccessPassById(id: number) {
    const pass = await prisma.accessPass.findUnique({
      where: { id },
      include: {
        accessLogs: {
          orderBy: { timestamp: 'desc' }
        }
      }
    });
    
    if (!pass) {
      throw new Error('Pase de acceso no encontrado');
    }
    
    return pass;
  }
  
  /**
   * Crea pases de acceso predefinidos
   */
  async createPredefinedPasses() {
    const now = new Date();
    
    // Pase de un solo uso (válido por 24 horas)
    const singleUsePass = await this.generateAccessPass({
      visitorName: 'Visitante Temporal',
      documentType: 'CC',
      documentNumber: '1234567890',
      destination: 'Administración',
      residentName: 'Administrador',
      validFrom: now,
      validUntil: addHours(now, 24),
      passType: 'SINGLE_USE',
      createdBy: 1,
      notes: 'Pase de un solo uso para demostración'
    });
    
    // Pase temporal (válido por 7 días)
    const temporaryPass = await this.generateAccessPass({
      visitorName: 'Contratista Temporal',
      documentType: 'CC',
      documentNumber: '9876543210',
      destination: 'Áreas comunes',
      residentName: 'Administrador',
      validFrom: now,
      validUntil: addDays(now, 7),
      passType: 'TEMPORARY',
      createdBy: 1,
      notes: 'Pase temporal para trabajos de mantenimiento'
    });
    
    // Pase recurrente (válido por 30 días)
    const recurrentPass = await this.generateAccessPass({
      visitorName: 'Personal de Limpieza',
      documentType: 'CC',
      documentNumber: '5555555555',
      destination: 'Todo el conjunto',
      residentName: 'Administrador',
      validFrom: now,
      validUntil: addDays(now, 30),
      passType: 'RECURRENT',
      createdBy: 1,
      notes: 'Pase recurrente para personal de servicios'
    });
    
    return {
      singleUsePass,
      temporaryPass,
      recurrentPass
    };
  }
}

// Exportar una instancia del servicio
export const accessPassService = new AccessPassService();
