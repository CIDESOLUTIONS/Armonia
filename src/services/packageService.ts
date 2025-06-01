import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { addDays } from 'date-fns';

// Inicializar cliente Prisma
const prisma = new PrismaClient();

/**
 * Servicio para la gestión de correspondencia y paquetería
 */
export class PackageService {
  /**
   * Obtiene todos los paquetes con paginación y filtros opcionales
   */
  async getAllPackages(params: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    unitNumber?: string;
    residentId?: number;
    priority?: string;
  }) {
    const {
      page = 1,
      limit = 10,
      status,
      type,
      search,
      startDate,
      endDate,
      unitNumber,
      residentId,
      priority
    } = params;

    const skip = (page - 1) * limit;
    
    // Construir filtros
    const where: any = {};
    
    if (status) {
      where.status = status;
    }
    
    if (type) {
      where.type = type;
    }
    
    if (priority) {
      where.priority = priority;
    }
    
    if (unitNumber) {
      where.unitNumber = unitNumber;
    }
    
    if (residentId) {
      where.residentId = residentId;
    }
    
    if (search) {
      where.OR = [
        { trackingCode: { contains: search, mode: 'insensitive' } },
        { trackingNumber: { contains: search, mode: 'insensitive' } },
        { residentName: { contains: search, mode: 'insensitive' } },
        { unitNumber: { contains: search, mode: 'insensitive' } },
        { senderName: { contains: search, mode: 'insensitive' } },
        { senderCompany: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (startDate && endDate) {
      where.receivedAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    } else if (startDate) {
      where.receivedAt = {
        gte: new Date(startDate)
      };
    } else if (endDate) {
      where.receivedAt = {
        lte: new Date(endDate)
      };
    }
    
    // Ejecutar consulta con conteo total
    const [packages, total] = await Promise.all([
      prisma.package.findMany({
        where,
        skip,
        take: limit,
        orderBy: { receivedAt: 'desc' },
        include: {
          statusHistory: {
            orderBy: { changedAt: 'desc' },
            take: 5
          },
          notifications: {
            orderBy: { sentAt: 'desc' },
            take: 3
          }
        }
      }),
      prisma.package.count({ where })
    ]);
    
    return {
      data: packages,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
  
  /**
   * Obtiene un paquete por su ID
   */
  async getPackageById(id: number) {
    const packageData = await prisma.package.findUnique({
      where: { id },
      include: {
        statusHistory: {
          orderBy: { changedAt: 'desc' }
        },
        notifications: {
          orderBy: { sentAt: 'desc' }
        }
      }
    });
    
    if (!packageData) {
      throw new Error('Paquete no encontrado');
    }
    
    return packageData;
  }
  
  /**
   * Obtiene un paquete por su código de seguimiento interno
   */
  async getPackageByTrackingCode(trackingCode: string) {
    const packageData = await prisma.package.findFirst({
      where: { trackingCode },
      include: {
        statusHistory: {
          orderBy: { changedAt: 'desc' }
        },
        notifications: {
          orderBy: { sentAt: 'desc' }
        }
      }
    });
    
    if (!packageData) {
      throw new Error('Paquete no encontrado');
    }
    
    return packageData;
  }
  
  /**
   * Crea un nuevo registro de paquete
   */
  async createPackage(data: {
    type: string;
    trackingNumber?: string;
    courier?: string;
    senderName?: string;
    senderCompany?: string;
    residentId?: number;
    unitId: number;
    unitNumber: string;
    residentName: string;
    receivedByStaffId: number;
    receivedByStaffName: string;
    size?: string;
    weight?: number;
    isFragile?: boolean;
    needsRefrigeration?: boolean;
    description?: string;
    notes?: string;
    tags?: string[];
    mainPhotoUrl?: string;
    attachments?: any;
    priority?: string;
  }) {
    // Validar datos requeridos
    if (!data.type || !data.unitNumber || !data.residentName || !data.receivedByStaffId) {
      throw new Error('Faltan campos requeridos');
    }
    
    // Generar código de seguimiento interno único
    const trackingCode = this.generateTrackingCode();
    
    // Obtener configuración de paquetes
    const settings = await this.getPackageSettings();
    
    // Calcular fecha de expiración
    const expirationDate = addDays(new Date(), settings.expirationDays);
    
    // Crear el paquete
    const packageData = await prisma.package.create({
      data: {
        trackingCode,
        type: data.type as any,
        trackingNumber: data.trackingNumber,
        courier: data.courier,
        senderName: data.senderName,
        senderCompany: data.senderCompany,
        residentId: data.residentId,
        unitId: data.unitId,
        unitNumber: data.unitNumber,
        residentName: data.residentName,
        receivedAt: new Date(),
        expirationDate,
        status: 'RECEIVED',
        priority: data.priority ? (data.priority as any) : 'NORMAL',
        receivedByStaffId: data.receivedByStaffId,
        receivedByStaffName: data.receivedByStaffName,
        size: data.size,
        weight: data.weight,
        isFragile: data.isFragile || false,
        needsRefrigeration: data.needsRefrigeration || false,
        description: data.description,
        notes: data.notes,
        tags: data.tags || [],
        mainPhotoUrl: data.mainPhotoUrl,
        attachments: data.attachments
      }
    });
    
    // Crear registro en historial de estados
    await this.createStatusHistoryEntry({
      packageId: packageData.id,
      newStatus: 'RECEIVED',
      changedByUserId: data.receivedByStaffId,
      changedByUserName: data.receivedByStaffName,
      notes: 'Paquete recibido en recepción'
    });
    
    // Notificar al residente si está configurado
    if (settings.autoNotifyResident) {
      try {
        await this.notifyResident(packageData.id);
      } catch (error) {
        console.error('Error al notificar al residente:', error);
        // No fallamos la operación completa si falla la notificación
      }
    }
    
    return packageData;
  }
  
  /**
   * Actualiza la información de un paquete
   */
  async updatePackage(id: number, data: {
    trackingNumber?: string;
    courier?: string;
    senderName?: string;
    senderCompany?: string;
    residentId?: number;
    unitNumber?: string;
    residentName?: string;
    size?: string;
    weight?: number;
    isFragile?: boolean;
    needsRefrigeration?: boolean;
    description?: string;
    notes?: string;
    tags?: string[];
    mainPhotoUrl?: string;
    attachments?: any;
    priority?: string;
    updatedByUserId: number;
    updatedByUserName: string;
  }) {
    // Verificar que el paquete exista
    const packageData = await prisma.package.findUnique({
      where: { id }
    });
    
    if (!packageData) {
      throw new Error('Paquete no encontrado');
    }
    
    // Actualizar el paquete
    const updatedPackage = await prisma.package.update({
      where: { id },
      data: {
        trackingNumber: data.trackingNumber,
        courier: data.courier,
        senderName: data.senderName,
        senderCompany: data.senderCompany,
        residentId: data.residentId,
        unitNumber: data.unitNumber,
        residentName: data.residentName,
        size: data.size,
        weight: data.weight,
        isFragile: data.isFragile,
        needsRefrigeration: data.needsRefrigeration,
        description: data.description,
        notes: data.notes,
        tags: data.tags,
        mainPhotoUrl: data.mainPhotoUrl,
        attachments: data.attachments,
        priority: data.priority as any
      }
    });
    
    // Crear registro en historial de estados si hay cambios importantes
    if (data.residentId !== packageData.residentId || 
        data.unitNumber !== packageData.unitNumber || 
        data.residentName !== packageData.residentName ||
        data.priority !== packageData.priority) {
      await this.createStatusHistoryEntry({
        packageId: id,
        previousStatus: packageData.status as any,
        newStatus: packageData.status as any,
        changedByUserId: data.updatedByUserId,
        changedByUserName: data.updatedByUserName,
        notes: 'Información del paquete actualizada'
      });
    }
    
    return updatedPackage;
  }
  
  /**
   * Cambia el estado de un paquete
   */
  async changePackageStatus(id: number, data: {
    newStatus: string;
    changedByUserId: number;
    changedByUserName: string;
    notes?: string;
    deliveredByStaffId?: number;
    deliveredByStaffName?: string;
    receivedByResidentId?: number;
    receivedByResidentName?: string;
    signatureUrl?: string;
  }) {
    // Verificar que el paquete exista
    const packageData = await prisma.package.findUnique({
      where: { id }
    });
    
    if (!packageData) {
      throw new Error('Paquete no encontrado');
    }
    
    // Validar transición de estado
    if (!this.isValidStatusTransition(packageData.status as any, data.newStatus as any)) {
      throw new Error(`Transición de estado inválida: ${packageData.status} -> ${data.newStatus}`);
    }
    
    // Preparar datos para actualización
    const updateData: any = {
      status: data.newStatus
    };
    
    // Si el estado es NOTIFIED, registrar fecha de notificación
    if (data.newStatus === 'NOTIFIED') {
      updateData.notifiedAt = new Date();
    }
    
    // Si el estado es DELIVERED, registrar fecha de entrega y datos adicionales
    if (data.newStatus === 'DELIVERED') {
      updateData.deliveredAt = new Date();
      updateData.deliveredByStaffId = data.deliveredByStaffId;
      updateData.deliveredByStaffName = data.deliveredByStaffName;
      updateData.receivedByResidentId = data.receivedByResidentId;
      updateData.receivedByResidentName = data.receivedByResidentName;
      updateData.signatureUrl = data.signatureUrl;
    }
    
    // Actualizar el paquete
    const updatedPackage = await prisma.package.update({
      where: { id },
      data: updateData
    });
    
    // Crear registro en historial de estados
    await this.createStatusHistoryEntry({
      packageId: id,
      previousStatus: packageData.status as any,
      newStatus: data.newStatus as any,
      changedByUserId: data.changedByUserId,
      changedByUserName: data.changedByUserName,
      notes: data.notes
    });
    
    // Si el estado es NOTIFIED, enviar notificación al residente
    if (data.newStatus === 'NOTIFIED') {
      try {
        await this.notifyResident(id);
      } catch (error) {
        console.error('Error al notificar al residente:', error);
        // No fallamos la operación completa si falla la notificación
      }
    }
    
    return updatedPackage;
  }
  
  /**
   * Registra la entrega de un paquete
   */
  async deliverPackage(id: number, data: {
    deliveredByStaffId: number;
    deliveredByStaffName: string;
    receivedByResidentId?: number;
    receivedByResidentName: string;
    signatureUrl?: string;
    notes?: string;
  }) {
    return this.changePackageStatus(id, {
      newStatus: 'DELIVERED',
      changedByUserId: data.deliveredByStaffId,
      changedByUserName: data.deliveredByStaffName,
      notes: data.notes || 'Paquete entregado al destinatario',
      deliveredByStaffId: data.deliveredByStaffId,
      deliveredByStaffName: data.deliveredByStaffName,
      receivedByResidentId: data.receivedByResidentId,
      receivedByResidentName: data.receivedByResidentName,
      signatureUrl: data.signatureUrl
    });
  }
  
  /**
   * Marca un paquete como devuelto al remitente
   */
  async returnPackage(id: number, data: {
    returnedByStaffId: number;
    returnedByStaffName: string;
    notes?: string;
  }) {
    return this.changePackageStatus(id, {
      newStatus: 'RETURNED',
      changedByUserId: data.returnedByStaffId,
      changedByUserName: data.returnedByStaffName,
      notes: data.notes || 'Paquete devuelto al remitente'
    });
  }
  
  /**
   * Notifica al residente sobre un paquete
   */
  async notifyResident(packageId: number) {
    // Obtener datos del paquete
    const packageData = await this.getPackageById(packageId);
    
    // Obtener configuración de paquetes
    const settings = await this.getPackageSettings();
    
    // Obtener plantilla de notificación
    const template = await this.getNotificationTemplate('email');
    
    // Simular envío de notificación (aquí iría la lógica real de envío)
    const notificationContent = this.generateNotificationContent(template, packageData);
    
    // Registrar notificación
    const notification = await prisma.packageNotification.create({
      data: {
        packageId,
        type: 'email',
        recipient: `resident_${packageData.residentId}@example.com`, // Simulado
        status: 'sent',
        content: notificationContent
      }
    });
    
    // Actualizar estado del paquete a NOTIFIED si aún no lo está
    if (packageData.status === 'RECEIVED') {
      await this.changePackageStatus(packageId, {
        newStatus: 'NOTIFIED',
        changedByUserId: 0, // Sistema
        changedByUserName: 'Sistema',
        notes: 'Notificación enviada automáticamente'
      });
    }
    
    return notification;
  }
  
  /**
   * Crea una entrada en el historial de estados
   */
  async createStatusHistoryEntry(data: {
    packageId: number;
    previousStatus?: string;
    newStatus: string;
    changedByUserId: number;
    changedByUserName: string;
    notes?: string;
  }) {
    return prisma.packageStatusHistory.create({
      data: {
        packageId: data.packageId,
        previousStatus: data.previousStatus as any,
        newStatus: data.newStatus as any,
        changedByUserId: data.changedByUserId,
        changedByUserName: data.changedByUserName,
        notes: data.notes
      }
    });
  }
  
  /**
   * Obtiene estadísticas de paquetes
   */
  async getPackageStats(params: {
    startDate?: string;
    endDate?: string;
  }) {
    const { startDate, endDate } = params;
    
    // Construir filtros de fecha
    const dateFilter: any = {};
    
    if (startDate && endDate) {
      dateFilter.receivedAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    } else if (startDate) {
      dateFilter.receivedAt = {
        gte: new Date(startDate)
      };
    } else if (endDate) {
      dateFilter.receivedAt = {
        lte: new Date(endDate)
      };
    }
    
    // Obtener estadísticas
    const [
      totalPackages,
      pendingPackages,
      deliveredPackages,
      returnedPackages,
      todayCount,
      packagesByType,
      packagesByStatus
    ] = await Promise.all([
      prisma.package.count({ where: dateFilter }),
      prisma.package.count({ where: { ...dateFilter, status: { in: ['RECEIVED', 'NOTIFIED', 'PENDING'] } } }),
      prisma.package.count({ where: { ...dateFilter, status: 'DELIVERED' } }),
      prisma.package.count({ where: { ...dateFilter, status: 'RETURNED' } }),
      prisma.package.count({
        where: {
          receivedAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),
      prisma.$queryRaw`
        SELECT "type", COUNT(*) as count
        FROM "tenant"."Package"
        WHERE ${dateFilter.receivedAt ? `"receivedAt" >= '${dateFilter.receivedAt.gte.toISOString()}'::timestamp 
              AND "receivedAt" <= '${dateFilter.receivedAt.lte?.toISOString() || new Date().toISOString()}'::timestamp` : '1=1'}
        GROUP BY "type"
      `,
      prisma.$queryRaw`
        SELECT "status", COUNT(*) as count
        FROM "tenant"."Package"
        WHERE ${dateFilter.receivedAt ? `"receivedAt" >= '${dateFilter.receivedAt.gte.toISOString()}'::timestamp 
              AND "receivedAt" <= '${dateFilter.receivedAt.lte?.toISOString() || new Date().toISOString()}'::timestamp` : '1=1'}
        GROUP BY "status"
      `
    ]);
    
    return {
      totalPackages,
      pendingPackages,
      deliveredPackages,
      returnedPackages,
      todayCount,
      packagesByType,
      packagesByStatus
    };
  }
  
  /**
   * Obtiene la configuración de paquetes
   */
  async getPackageSettings() {
    // Buscar configuración existente
    let settings = await prisma.packageSettings.findFirst();
    
    // Si no existe, crear configuración por defecto
    if (!settings) {
      settings = await prisma.packageSettings.create({
        data: {
          autoNotifyResident: true,
          notificationMethods: ['email'],
          expirationDays: 30,
          reminderFrequency: 3,
          requireSignature: true,
          requirePhoto: true,
          allowAnyoneToReceive: false
        }
      });
    }
    
    return settings;
  }
  
  /**
   * Actualiza la configuración de paquetes
   */
  async updatePackageSettings(data: {
    autoNotifyResident?: boolean;
    notificationMethods?: string[];
    expirationDays?: number;
    reminderFrequency?: number;
    requireSignature?: boolean;
    requirePhoto?: boolean;
    allowAnyoneToReceive?: boolean;
  }) {
    // Obtener configuración actual
    const currentSettings = await this.getPackageSettings();
    
    // Actualizar configuración
    return prisma.packageSettings.update({
      where: { id: currentSettings.id },
      data
    });
  }
  
  /**
   * Obtiene una plantilla de notificación
   */
  async getNotificationTemplate(type: string) {
    // Buscar plantilla por defecto para el tipo especificado
    let template = await prisma.packageNotificationTemplate.findFirst({
      where: {
        type,
        isDefault: true,
        isActive: true
      }
    });
    
    // Si no existe, crear plantilla por defecto
    if (!template) {
      template = await prisma.packageNotificationTemplate.create({
        data: {
          name: `Plantilla por defecto (${type})`,
          type,
          subject: 'Notificación de paquete recibido',
          template: 'Estimado/a {{residentName}}, ha recibido un paquete de tipo {{packageType}} en recepción. Por favor, pase a recogerlo presentando su identificación. Código de seguimiento: {{trackingCode}}.',
          isDefault: true,
          isActive: true
        }
      });
    }
    
    return template;
  }
  
  /**
   * Genera un código de seguimiento único
   */
  private generateTrackingCode(): string {
    // Formato: PKG-YYYYMMDD-XXXX (donde XXXX son caracteres alfanuméricos aleatorios)
    const date = new Date();
    const dateStr = date.getFullYear().toString() +
                   (date.getMonth() + 1).toString().padStart(2, '0') +
                   date.getDate().toString().padStart(2, '0');
    const randomStr = uuidv4().substring(0, 4).toUpperCase();
    
    return `PKG-${dateStr}-${randomStr}`;
  }
  
  /**
   * Genera el contenido de una notificación
   */
  private generateNotificationContent(template: any, packageData: any): string {
    let content = template.template;
    
    // Reemplazar variables en la plantilla
    content = content.replace(/{{residentName}}/g, packageData.residentName);
    content = content.replace(/{{packageType}}/g, packageData.type);
    content = content.replace(/{{trackingCode}}/g, packageData.trackingCode);
    content = content.replace(/{{unitNumber}}/g, packageData.unitNumber);
    content = content.replace(/{{receivedAt}}/g, packageData.receivedAt.toLocaleString());
    
    return content;
  }
  
  /**
   * Valida si una transición de estado es válida
   */
  private isValidStatusTransition(currentStatus: string, newStatus: string): boolean {
    // Definir transiciones válidas
    const validTransitions: Record<string, string[]> = {
      'RECEIVED': ['NOTIFIED', 'PENDING', 'DELIVERED', 'RETURNED', 'EXPIRED'],
      'NOTIFIED': ['PENDING', 'DELIVERED', 'RETURNED', 'EXPIRED'],
      'PENDING': ['DELIVERED', 'RETURNED', 'EXPIRED'],
      'DELIVERED': [], // Estado final
      'RETURNED': [], // Estado final
      'EXPIRED': ['RETURNED'] // Solo se puede devolver
    };
    
    // Verificar si la transición es válida
    return validTransitions[currentStatus]?.includes(newStatus) || false;
  }
}

// Exportar una instancia del servicio
export const packageService = new PackageService();
