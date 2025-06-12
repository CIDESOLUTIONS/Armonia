import { getPrisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';
import { addDays, isAfter } from 'date-fns';
import { accessPassService } from './accessPassService';

// Inicializar cliente Prisma
const prisma = getPrisma();

/**
 * Servicio para la gestión de pre-registros de visitantes
 */
export class PreRegistrationService {
  /**
   * Crea un nuevo pre-registro de visitante
   */
  async createPreRegistration(data: {
    visitorName: string;
    documentType: string;
    documentNumber: string;
    purpose?: string;
    expectedArrivalDate: Date;
    validUntil: Date;
    residentId: number;
    residentName: string;
    residentUnit: string;
    generatePass?: boolean;
    passType?: 'SINGLE_USE' | 'TEMPORARY' | 'RECURRENT';
    notes?: string;
    notifyVisitor?: boolean;
    visitorEmail?: string;
    visitorPhone?: string;
  }) {
    // Validar datos requeridos
    if (!data.visitorName || !data.documentType || !data.documentNumber || !data.residentId) {
      throw new Error('Faltan campos requeridos');
    }
    
    // Validar fechas
    if (isAfter(new Date(), data.validUntil)) {
      throw new Error('La fecha de validez debe ser posterior a la fecha actual');
    }
    
    // Generar código único para el pre-registro
    const registrationCode = uuidv4().substring(0, 6).toUpperCase();
    
    // Crear el pre-registro
    const preRegistration = await prisma.preRegisteredVisitor.create({
      data: {
        registrationCode,
        visitorName: data.visitorName,
        documentType: data.documentType as any,
        documentNumber: data.documentNumber,
        purpose: data.purpose,
        expectedArrivalDate: data.expectedArrivalDate,
        validUntil: data.validUntil,
        status: 'ACTIVE',
        residentId: data.residentId,
        residentName: data.residentName,
        residentUnit: data.residentUnit,
        notes: data.notes,
        visitorEmail: data.visitorEmail,
        visitorPhone: data.visitorPhone
      }
    });
    
    // Si se solicita generar un pase de acceso
    let accessPass = null;
    if (data.generatePass) {
      try {
        accessPass = await accessPassService.generateAccessPass({
          visitorName: data.visitorName,
          documentType: data.documentType,
          documentNumber: data.documentNumber,
          destination: data.residentUnit,
          residentId: data.residentId,
          residentName: data.residentName,
          validFrom: data.expectedArrivalDate,
          validUntil: data.validUntil,
          passType: data.passType || 'SINGLE_USE',
          createdBy: data.residentId,
          preRegisterId: preRegistration.id,
          notes: `Pre-registro: ${data.notes || ''}`
        });
        
        // Actualizar el pre-registro con el ID del pase
        await prisma.preRegisteredVisitor.update({
          where: { id: preRegistration.id },
          data: { accessPassId: accessPass.id }
        });
      } catch (error) {
        console.error('Error al generar pase de acceso:', error);
        // No fallamos la operación completa si falla la generación del pase
      }
    }
    
    // Si se solicita notificar al visitante
    if (data.notifyVisitor && (data.visitorEmail || data.visitorPhone)) {
      try {
        await this.notifyVisitor({
          preRegistrationId: preRegistration.id,
          accessPassId: accessPass?.id
        });
      } catch (error) {
        console.error('Error al notificar al visitante:', error);
        // No fallamos la operación completa si falla la notificación
      }
    }
    
    return {
      preRegistration: await prisma.preRegisteredVisitor.findUnique({
        where: { id: preRegistration.id },
        include: { accessPass: true }
      }),
      accessPass
    };
  }
  
  /**
   * Notifica a un visitante sobre su pre-registro
   */
  async notifyVisitor(data: {
    preRegistrationId: number;
    accessPassId?: number;
  }) {
    // Obtener datos del pre-registro
    const preRegistration = await prisma.preRegisteredVisitor.findUnique({
      where: { id: data.preRegistrationId },
      include: { accessPass: true }
    });
    
    if (!preRegistration) {
      throw new Error('Pre-registro no encontrado');
    }
    
    // Verificar si hay información de contacto
    if (!preRegistration.visitorEmail && !preRegistration.visitorPhone) {
      throw new Error('No hay información de contacto para el visitante');
    }
    
    // Aquí iría la lógica para enviar notificaciones por email o SMS
    // Por ahora, solo simulamos el envío
    
    // Registrar la notificación
    await prisma.notification.create({
      data: {
        userId: preRegistration.residentId,
        title: 'Pre-registro de visita',
        message: `Se ha enviado una notificación a ${preRegistration.visitorName} sobre su pre-registro`,
        type: 'INFO',
        read: false
      }
    });
    
    return {
      success: true,
      message: 'Notificación enviada al visitante',
      channels: [
        preRegistration.visitorEmail ? 'email' : null,
        preRegistration.visitorPhone ? 'sms' : null
      ].filter(Boolean)
    };
  }
  
  /**
   * Cancela un pre-registro
   */
  async cancelPreRegistration(id: number, data: {
    cancelledBy: number;
    reason: string;
  }) {
    // Verificar que el pre-registro exista
    const preRegistration = await prisma.preRegisteredVisitor.findUnique({
      where: { id },
      include: { accessPass: true }
    });
    
    if (!preRegistration) {
      throw new Error('Pre-registro no encontrado');
    }
    
    // Actualizar estado a cancelado
    const updatedPreRegistration = await prisma.preRegisteredVisitor.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        notes: preRegistration.notes 
          ? `${preRegistration.notes}\nCancelado: ${data.reason}`
          : `Cancelado: ${data.reason}`
      }
    });
    
    // Si hay un pase de acceso asociado, revocarlo
    if (preRegistration.accessPassId) {
      try {
        await accessPassService.revokeAccessPass(preRegistration.accessPassId, {
          revokedBy: data.cancelledBy,
          reason: `Pre-registro cancelado: ${data.reason}`
        });
      } catch (error) {
        console.error('Error al revocar pase de acceso:', error);
        // No fallamos la operación completa si falla la revocación del pase
      }
    }
    
    // Registrar la notificación
    await prisma.notification.create({
      data: {
        userId: preRegistration.residentId,
        title: 'Pre-registro cancelado',
        message: `El pre-registro para ${preRegistration.visitorName} ha sido cancelado: ${data.reason}`,
        type: 'WARNING',
        read: false
      }
    });
    
    return updatedPreRegistration;
  }
  
  /**
   * Obtiene todos los pre-registros con paginación y filtros
   */
  async getAllPreRegistrations(params: {
    page?: number;
    limit?: number;
    status?: string;
    residentId?: number;
    search?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const {
      page = 1,
      limit = 10,
      status,
      residentId,
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
    
    if (residentId) {
      where.residentId = residentId;
    }
    
    if (search) {
      where.OR = [
        { visitorName: { contains: search, mode: 'insensitive' } },
        { documentNumber: { contains: search } },
        { residentName: { contains: search, mode: 'insensitive' } },
        { residentUnit: { contains: search, mode: 'insensitive' } },
        { registrationCode: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (startDate && endDate) {
      where.expectedArrivalDate = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    } else if (startDate) {
      where.expectedArrivalDate = {
        gte: new Date(startDate)
      };
    } else if (endDate) {
      where.expectedArrivalDate = {
        lte: new Date(endDate)
      };
    }
    
    // Ejecutar consulta con conteo total
    const [preRegistrations, total] = await Promise.all([
      prisma.preRegisteredVisitor.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          accessPass: true
        }
      }),
      prisma.preRegisteredVisitor.count({ where })
    ]);
    
    return {
      data: preRegistrations,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
  
  /**
   * Obtiene un pre-registro por su ID
   */
  async getPreRegistrationById(id: number) {
    const preRegistration = await prisma.preRegisteredVisitor.findUnique({
      where: { id },
      include: {
        accessPass: {
          include: {
            accessLogs: {
              orderBy: { timestamp: 'desc' }
            }
          }
        }
      }
    });
    
    if (!preRegistration) {
      throw new Error('Pre-registro no encontrado');
    }
    
    return preRegistration;
  }
  
  /**
   * Obtiene un pre-registro por su código
   */
  async getPreRegistrationByCode(code: string) {
    const preRegistration = await prisma.preRegisteredVisitor.findFirst({
      where: { registrationCode: code },
      include: {
        accessPass: true
      }
    });
    
    if (!preRegistration) {
      throw new Error('Pre-registro no encontrado');
    }
    
    return preRegistration;
  }
  
  /**
   * Actualiza un pre-registro
   */
  async updatePreRegistration(id: number, data: {
    visitorName?: string;
    purpose?: string;
    expectedArrivalDate?: Date;
    validUntil?: Date;
    notes?: string;
    visitorEmail?: string;
    visitorPhone?: string;
  }) {
    // Verificar que el pre-registro exista
    const preRegistration = await prisma.preRegisteredVisitor.findUnique({
      where: { id }
    });
    
    if (!preRegistration) {
      throw new Error('Pre-registro no encontrado');
    }
    
    // Actualizar el pre-registro
    const updatedPreRegistration = await prisma.preRegisteredVisitor.update({
      where: { id },
      data
    });
    
    return updatedPreRegistration;
  }
  
  /**
   * Crea pre-registros de ejemplo
   */
  async createSamplePreRegistrations(residentId: number, residentName: string, residentUnit: string) {
    const now = new Date();
    
    // Pre-registro para hoy
    const todayPreReg = await this.createPreRegistration({
      visitorName: 'Familiar Ejemplo',
      documentType: 'CC',
      documentNumber: '1122334455',
      purpose: 'Visita familiar',
      expectedArrivalDate: now,
      validUntil: addDays(now, 1),
      residentId,
      residentName,
      residentUnit,
      generatePass: true,
      passType: 'SINGLE_USE',
      notes: 'Pre-registro de ejemplo para hoy',
      notifyVisitor: false
    });
    
    // Pre-registro para mañana
    const tomorrowPreReg = await this.createPreRegistration({
      visitorName: 'Técnico Ejemplo',
      documentType: 'CC',
      documentNumber: '9988776655',
      purpose: 'Mantenimiento',
      expectedArrivalDate: addDays(now, 1),
      validUntil: addDays(now, 2),
      residentId,
      residentName,
      residentUnit,
      generatePass: true,
      passType: 'SINGLE_USE',
      notes: 'Pre-registro de ejemplo para mañana',
      notifyVisitor: false
    });
    
    // Pre-registro recurrente
    const recurrentPreReg = await this.createPreRegistration({
      visitorName: 'Empleada Doméstica',
      documentType: 'CC',
      documentNumber: '5544332211',
      purpose: 'Servicio doméstico',
      expectedArrivalDate: now,
      validUntil: addDays(now, 30),
      residentId,
      residentName,
      residentUnit,
      generatePass: true,
      passType: 'RECURRENT',
      notes: 'Pre-registro recurrente de ejemplo',
      notifyVisitor: false
    });
    
    return {
      todayPreReg,
      tomorrowPreReg,
      recurrentPreReg
    };
  }
}

// Exportar una instancia del servicio
export const preRegistrationService = new PreRegistrationService();
