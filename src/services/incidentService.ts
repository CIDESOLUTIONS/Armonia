import { getPrisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';
import { addDays, differenceInMinutes } from 'date-fns';

// Inicializar cliente Prisma
const prisma = getPrisma();

/**
 * Servicio para la gestión de incidentes
 */
export class IncidentService {
  /**
   * Obtiene todos los incidentes con paginación y filtros opcionales
   */
  async getAllIncidents(params: {
    page?: number;
    limit?: number;
    status?: string;
    category?: string;
    priority?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    unitNumber?: string;
    reportedById?: number;
    assignedToId?: number;
    isPublic?: boolean;
    isEmergency?: boolean;
    tags?: string[];
  }) {
    const {
      page = 1,
      limit = 10,
      status,
      category,
      priority,
      search,
      startDate,
      endDate,
      unitNumber,
      reportedById,
      assignedToId,
      isPublic,
      isEmergency,
      tags
    } = params;

    const skip = (page - 1) * limit;
    
    // Construir filtros
    const where: any = {};
    
    if (status) {
      where.status = status;
    }
    
    if (category) {
      where.category = category;
    }
    
    if (priority) {
      where.priority = priority;
    }
    
    if (unitNumber) {
      where.unitNumber = unitNumber;
    }
    
    if (reportedById) {
      where.reportedById = reportedById;
    }
    
    if (assignedToId) {
      where.assignedToId = assignedToId;
    }
    
    if (isPublic !== undefined) {
      where.isPublic = isPublic;
    }
    
    if (isEmergency !== undefined) {
      where.isEmergency = isEmergency;
    }
    
    if (tags && tags.length > 0) {
      where.tags = {
        hasSome: tags
      };
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { incidentNumber: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
        { reportedByName: { contains: search, mode: 'insensitive' } },
        { assignedToName: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (startDate && endDate) {
      where.reportedAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    } else if (startDate) {
      where.reportedAt = {
        gte: new Date(startDate)
      };
    } else if (endDate) {
      where.reportedAt = {
        lte: new Date(endDate)
      };
    }
    
    // Ejecutar consulta con conteo total
    const [incidents, total] = await Promise.all([
      prisma.incident.findMany({
        where,
        skip,
        take: limit,
        orderBy: { reportedAt: 'desc' },
        include: {
          statusHistory: {
            orderBy: { changedAt: 'desc' },
            take: 1
          },
          updates: {
            orderBy: { timestamp: 'desc' },
            take: 3
          },
          comments: {
            where: { isInternal: false },
            orderBy: { timestamp: 'desc' },
            take: 3
          }
        }
      }),
      prisma.incident.count({ where })
    ]);
    
    return {
      data: incidents,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
  
  /**
   * Obtiene un incidente por su ID
   */
  async getIncidentById(id: number, includeInternal: boolean = false) {
    const incident = await prisma.incident.findUnique({
      where: { id },
      include: {
        statusHistory: {
          orderBy: { changedAt: 'desc' }
        },
        updates: {
          orderBy: { timestamp: 'desc' }
        },
        comments: {
          where: includeInternal ? {} : { isInternal: false },
          orderBy: { timestamp: 'desc' }
        },
        notifications: {
          orderBy: { sentAt: 'desc' },
          take: 10
        }
      }
    });
    
    if (!incident) {
      throw new Error('Incidente no encontrado');
    }
    
    return incident;
  }
  
  /**
   * Obtiene un incidente por su número único
   */
  async getIncidentByNumber(incidentNumber: string, includeInternal: boolean = false) {
    const incident = await prisma.incident.findFirst({
      where: { incidentNumber },
      include: {
        statusHistory: {
          orderBy: { changedAt: 'desc' }
        },
        updates: {
          orderBy: { timestamp: 'desc' }
        },
        comments: {
          where: includeInternal ? {} : { isInternal: false },
          orderBy: { timestamp: 'desc' }
        },
        notifications: {
          orderBy: { sentAt: 'desc' },
          take: 10
        }
      }
    });
    
    if (!incident) {
      throw new Error('Incidente no encontrado');
    }
    
    return incident;
  }
  
  /**
   * Crea un nuevo incidente
   */
  async createIncident(data: {
    title: string;
    description: string;
    category: string;
    subcategory?: string;
    priority: string;
    impact?: string;
    location: string;
    unitId?: number;
    unitNumber?: string;
    area?: string;
    reportedById: number;
    reportedByName: string;
    reportedByRole: string;
    isPublic?: boolean;
    isEmergency?: boolean;
    requiresFollowUp?: boolean;
    tags?: string[];
    mainPhotoUrl?: string;
    attachments?: any;
    relatedIncidentIds?: string[];
    visitorId?: number;
    packageId?: number;
  }) {
    // Validar datos requeridos
    if (!data.title || !data.description || !data.category || !data.priority || !data.location || !data.reportedById) {
      throw new Error('Faltan campos requeridos');
    }
    
    // Generar número único de incidente
    const incidentNumber = this.generateIncidentNumber();
    
    // Obtener configuración de incidentes
    const settings = await this.getIncidentSettings();
    
    // Calcular fecha límite según SLA
    const sla = await this.getApplicableSLA(data.category as any, data.priority as any);
    const dueDate = sla ? addDays(new Date(), Math.ceil(sla.resolutionTime / (24 * 60))) : undefined;
    
    // Crear el incidente
    const incident = await prisma.incident.create({
      data: {
        incidentNumber,
        title: data.title,
        description: data.description,
        category: data.category as any,
        subcategory: data.subcategory,
        priority: data.priority as any,
        impact: data.impact,
        location: data.location,
        unitId: data.unitId,
        unitNumber: data.unitNumber,
        area: data.area,
        reportedAt: new Date(),
        reportedById: data.reportedById,
        reportedByName: data.reportedByName,
        reportedByRole: data.reportedByRole,
        status: 'REPORTED',
        isPublic: data.isPublic || false,
        isEmergency: data.isEmergency || false,
        requiresFollowUp: data.requiresFollowUp || false,
        tags: data.tags || [],
        mainPhotoUrl: data.mainPhotoUrl,
        attachments: data.attachments,
        relatedIncidentIds: data.relatedIncidentIds || [],
        visitorId: data.visitorId,
        packageId: data.packageId,
        dueDate,
        slaId: sla?.id
      }
    });
    
    // Crear registro en historial de estados
    await this.createStatusHistoryEntry({
      incidentId: incident.id,
      newStatus: 'REPORTED',
      changedById: data.reportedById,
      changedByName: data.reportedByName,
      changedByRole: data.reportedByRole,
      reason: 'Incidente reportado'
    });
    
    // Crear actualización inicial
    await this.createIncidentUpdate({
      incidentId: incident.id,
      content: 'Incidente reportado',
      type: 'creation',
      authorId: data.reportedById,
      authorName: data.reportedByName,
      authorRole: data.reportedByRole,
      isInternal: false
    });
    
    // Asignación automática si está configurada
    if (settings.autoAssignEnabled) {
      try {
        await this.autoAssignIncident(incident.id);
      } catch (error) {
        console.error('Error en asignación automática:', error);
        // No fallamos la operación completa si falla la asignación automática
      }
    }
    
    // Notificaciones automáticas
    if (settings.autoNotifyStaff) {
      try {
        await this.notifyStaff(incident.id);
      } catch (error) {
        console.error('Error al notificar al personal:', error);
      }
    }
    
    return incident;
  }
  
  /**
   * Actualiza la información de un incidente
   */
  async updateIncident(id: number, data: {
    title?: string;
    description?: string;
    category?: string;
    subcategory?: string;
    priority?: string;
    impact?: string;
    location?: string;
    unitId?: number;
    unitNumber?: string;
    area?: string;
    isPublic?: boolean;
    isEmergency?: boolean;
    requiresFollowUp?: boolean;
    tags?: string[];
    mainPhotoUrl?: string;
    attachments?: any;
    relatedIncidentIds?: string[];
    visitorId?: number;
    packageId?: number;
    updatedById: number;
    updatedByName: string;
    updatedByRole: string;
  }) {
    // Verificar que el incidente exista
    const incident = await prisma.incident.findUnique({
      where: { id }
    });
    
    if (!incident) {
      throw new Error('Incidente no encontrado');
    }
    
    // Preparar datos para actualización
    const updateData: any = {};
    
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.subcategory !== undefined) updateData.subcategory = data.subcategory;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.impact !== undefined) updateData.impact = data.impact;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.unitId !== undefined) updateData.unitId = data.unitId;
    if (data.unitNumber !== undefined) updateData.unitNumber = data.unitNumber;
    if (data.area !== undefined) updateData.area = data.area;
    if (data.isPublic !== undefined) updateData.isPublic = data.isPublic;
    if (data.isEmergency !== undefined) updateData.isEmergency = data.isEmergency;
    if (data.requiresFollowUp !== undefined) updateData.requiresFollowUp = data.requiresFollowUp;
    if (data.tags !== undefined) updateData.tags = data.tags;
    if (data.mainPhotoUrl !== undefined) updateData.mainPhotoUrl = data.mainPhotoUrl;
    if (data.attachments !== undefined) updateData.attachments = data.attachments;
    if (data.relatedIncidentIds !== undefined) updateData.relatedIncidentIds = data.relatedIncidentIds;
    if (data.visitorId !== undefined) updateData.visitorId = data.visitorId;
    if (data.packageId !== undefined) updateData.packageId = data.packageId;
    
    // Si cambia la categoría o prioridad, recalcular SLA
    if (data.category !== undefined || data.priority !== undefined) {
      const category = data.category !== undefined ? data.category : incident.category;
      const priority = data.priority !== undefined ? data.priority : incident.priority;
      
      const sla = await this.getApplicableSLA(category as any, priority as any);
      if (sla) {
        updateData.slaId = sla.id;
        updateData.dueDate = addDays(incident.reportedAt, Math.ceil(sla.resolutionTime / (24 * 60)));
      }
    }
    
    // Actualizar el incidente
    const updatedIncident = await prisma.incident.update({
      where: { id },
      data: updateData
    });
    
    // Crear actualización
    await this.createIncidentUpdate({
      incidentId: id,
      content: 'Información del incidente actualizada',
      type: 'update',
      authorId: data.updatedById,
      authorName: data.updatedByName,
      authorRole: data.updatedByRole,
      isInternal: false,
      attachments: {
        updatedFields: Object.keys(updateData)
      }
    });
    
    return updatedIncident;
  }
  
  /**
   * Cambia el estado de un incidente
   */
  async changeIncidentStatus(id: number, data: {
    newStatus: string;
    changedById: number;
    changedByName: string;
    changedByRole: string;
    reason?: string;
    resolution?: string;
    rootCause?: string;
    preventiveActions?: string;
  }) {
    // Verificar que el incidente exista
    const incident = await prisma.incident.findUnique({
      where: { id }
    });
    
    if (!incident) {
      throw new Error('Incidente no encontrado');
    }
    
    // Validar transición de estado
    if (!this.isValidStatusTransition(incident.status as any, data.newStatus as any)) {
      throw new Error(`Transición de estado inválida: ${incident.status} -> ${data.newStatus}`);
    }
    
    // Preparar datos para actualización
    const updateData: any = {
      status: data.newStatus
    };
    
    // Calcular tiempo en el estado anterior
    const timeInStatus = incident.statusHistory.length > 0
      ? differenceInMinutes(new Date(), incident.statusHistory[0].changedAt)
      : differenceInMinutes(new Date(), incident.reportedAt);
    
    // Si el estado es ASSIGNED, registrar fecha de asignación
    if (data.newStatus === 'ASSIGNED' && !incident.assignedAt) {
      updateData.assignedAt = new Date();
    }
    
    // Si el estado es IN_PROGRESS, registrar fecha de inicio
    if (data.newStatus === 'IN_PROGRESS' && !incident.startedAt) {
      updateData.startedAt = new Date();
    }
    
    // Si el estado es RESOLVED, registrar fecha de resolución y datos adicionales
    if (data.newStatus === 'RESOLVED') {
      updateData.resolvedAt = new Date();
      if (data.resolution) updateData.resolution = data.resolution;
      if (data.rootCause) updateData.rootCause = data.rootCause;
      if (data.preventiveActions) updateData.preventiveActions = data.preventiveActions;
      
      // Calcular tiempo de resolución si hay SLA
      if (incident.slaId) {
        updateData.resolutionTime = differenceInMinutes(new Date(), incident.reportedAt);
        
        // Verificar si se incumplió el SLA
        const sla = await prisma.incidentSLA.findUnique({
          where: { id: incident.slaId }
        });
        
        if (sla) {
          updateData.slaBreached = updateData.resolutionTime > sla.resolutionTime;
        }
      }
    }
    
    // Si el estado es CLOSED, registrar fecha de cierre
    if (data.newStatus === 'CLOSED') {
      updateData.closedAt = new Date();
    }
    
    // Actualizar el incidente
    const updatedIncident = await prisma.incident.update({
      where: { id },
      data: updateData
    });
    
    // Crear registro en historial de estados
    await this.createStatusHistoryEntry({
      incidentId: id,
      previousStatus: incident.status as any,
      newStatus: data.newStatus as any,
      changedById: data.changedById,
      changedByName: data.changedByName,
      changedByRole: data.changedByRole,
      reason: data.reason,
      timeInStatus
    });
    
    // Crear actualización
    await this.createIncidentUpdate({
      incidentId: id,
      content: `Estado cambiado a ${data.newStatus}${data.reason ? `: ${data.reason}` : ''}`,
      type: 'status_change',
      authorId: data.changedById,
      authorName: data.changedByName,
      authorRole: data.changedByRole,
      isInternal: false
    });
    
    // Notificar cambio de estado
    try {
      await this.notifyStatusChange(id, data.newStatus as any);
    } catch (error) {
      console.error('Error al notificar cambio de estado:', error);
    }
    
    return updatedIncident;
  }
  
  /**
   * Asigna un incidente a un responsable
   */
  async assignIncident(id: number, data: {
    assignedToId: number;
    assignedToName: string;
    assignedToRole: string;
    assignedById: number;
    assignedByName: string;
    assignedByRole: string;
    notes?: string;
  }) {
    // Verificar que el incidente exista
    const incident = await prisma.incident.findUnique({
      where: { id }
    });
    
    if (!incident) {
      throw new Error('Incidente no encontrado');
    }
    
    // Actualizar el incidente
    const updatedIncident = await prisma.incident.update({
      where: { id },
      data: {
        assignedToId: data.assignedToId,
        assignedToName: data.assignedToName,
        assignedToRole: data.assignedToRole,
        assignedAt: new Date()
      }
    });
    
    // Si el estado es REPORTED, cambiarlo a ASSIGNED
    if (incident.status === 'REPORTED') {
      await this.changeIncidentStatus(id, {
        newStatus: 'ASSIGNED',
        changedById: data.assignedById,
        changedByName: data.assignedByName,
        changedByRole: data.assignedByRole,
        reason: `Asignado a ${data.assignedToName}`
      });
    } else {
      // Crear actualización
      await this.createIncidentUpdate({
        incidentId: id,
        content: `Incidente asignado a ${data.assignedToName}${data.notes ? `: ${data.notes}` : ''}`,
        type: 'assignment',
        authorId: data.assignedById,
        authorName: data.assignedByName,
        authorRole: data.assignedByRole,
        isInternal: false
      });
    }
    
    // Notificar al asignado
    try {
      await this.notifyAssignment(id);
    } catch (error) {
      console.error('Error al notificar asignación:', error);
    }
    
    return updatedIncident;
  }
  
  /**
   * Resuelve un incidente
   */
  async resolveIncident(id: number, data: {
    resolution: string;
    rootCause?: string;
    preventiveActions?: string;
    resolvedById: number;
    resolvedByName: string;
    resolvedByRole: string;
  }) {
    return this.changeIncidentStatus(id, {
      newStatus: 'RESOLVED',
      changedById: data.resolvedById,
      changedByName: data.resolvedByName,
      changedByRole: data.resolvedByRole,
      reason: 'Incidente resuelto',
      resolution: data.resolution,
      rootCause: data.rootCause,
      preventiveActions: data.preventiveActions
    });
  }
  
  /**
   * Cierra un incidente
   */
  async closeIncident(id: number, data: {
    closedById: number;
    closedByName: string;
    closedByRole: string;
    reason?: string;
  }) {
    return this.changeIncidentStatus(id, {
      newStatus: 'CLOSED',
      changedById: data.closedById,
      changedByName: data.closedByName,
      changedByRole: data.closedByRole,
      reason: data.reason || 'Incidente cerrado'
    });
  }
  
  /**
   * Reabre un incidente
   */
  async reopenIncident(id: number, data: {
    reopenedById: number;
    reopenedByName: string;
    reopenedByRole: string;
    reason: string;
  }) {
    return this.changeIncidentStatus(id, {
      newStatus: 'REOPENED',
      changedById: data.reopenedById,
      changedByName: data.reopenedByName,
      changedByRole: data.reopenedByRole,
      reason: data.reason
    });
  }
  
  /**
   * Crea una actualización para un incidente
   */
  async createIncidentUpdate(data: {
    incidentId: number;
    content: string;
    type: string;
    authorId: number;
    authorName: string;
    authorRole: string;
    isInternal?: boolean;
    attachments?: any;
  }) {
    return prisma.incidentUpdate.create({
      data: {
        incidentId: data.incidentId,
        content: data.content,
        type: data.type,
        authorId: data.authorId,
        authorName: data.authorName,
        authorRole: data.authorRole,
        isInternal: data.isInternal || false,
        attachments: data.attachments
      }
    });
  }
  
  /**
   * Crea un comentario para un incidente
   */
  async createIncidentComment(data: {
    incidentId: number;
    content: string;
    authorId: number;
    authorName: string;
    authorRole: string;
    isInternal?: boolean;
    parentId?: number;
    attachments?: any;
  }) {
    // Verificar que el incidente exista
    const incident = await prisma.incident.findUnique({
      where: { id: data.incidentId }
    });
    
    if (!incident) {
      throw new Error('Incidente no encontrado');
    }
    
    // Si hay parentId, verificar que exista
    if (data.parentId) {
      const parentComment = await prisma.incidentComment.findUnique({
        where: { id: data.parentId }
      });
      
      if (!parentComment) {
        throw new Error('Comentario padre no encontrado');
      }
    }
    
    // Crear el comentario
    const comment = await prisma.incidentComment.create({
      data: {
        incidentId: data.incidentId,
        content: data.content,
        authorId: data.authorId,
        authorName: data.authorName,
        authorRole: data.authorRole,
        isInternal: data.isInternal || false,
        parentId: data.parentId,
        attachments: data.attachments
      }
    });
    
    // Crear actualización
    await this.createIncidentUpdate({
      incidentId: data.incidentId,
      content: `Nuevo comentario: ${data.content.substring(0, 50)}${data.content.length > 50 ? '...' : ''}`,
      type: 'comment',
      authorId: data.authorId,
      authorName: data.authorName,
      authorRole: data.authorRole,
      isInternal: data.isInternal || false
    });
    
    // Notificar nuevo comentario si no es interno
    if (!data.isInternal) {
      try {
        await this.notifyNewComment(data.incidentId, comment.id);
      } catch (error) {
        console.error('Error al notificar nuevo comentario:', error);
      }
    }
    
    return comment;
  }
  
  /**
   * Crea una entrada en el historial de estados
   */
  async createStatusHistoryEntry(data: {
    incidentId: number;
    previousStatus?: string;
    newStatus: string;
    changedById: number;
    changedByName: string;
    changedByRole: string;
    reason?: string;
    timeInStatus?: number;
  }) {
    return prisma.incidentStatusHistory.create({
      data: {
        incidentId: data.incidentId,
        previousStatus: data.previousStatus as any,
        newStatus: data.newStatus as any,
        changedById: data.changedById,
        changedByName: data.changedByName,
        changedByRole: data.changedByRole,
        reason: data.reason,
        timeInStatus: data.timeInStatus
      }
    });
  }
  
  /**
   * Notifica al personal sobre un nuevo incidente
   */
  async notifyStaff(incidentId: number) {
    // Obtener datos del incidente
    const incident = await this.getIncidentById(incidentId, true);
    
    // Obtener configuración de incidentes
    const settings = await this.getIncidentSettings();
    
    // Obtener equipos aplicables según categoría
    const teams = await prisma.incidentTeam.findMany({
      where: {
        categories: {
          has: incident.category
        },
        isActive: true
      }
    });
    
    // Obtener plantilla de notificación
    const template = await this.getNotificationTemplate('EMAIL', 'incident_created');
    
    // Notificar a cada miembro del equipo
    for (const team of teams) {
      for (const memberId of team.memberIds) {
        // Simular envío de notificación (aquí iría la lógica real de envío)
        const notificationContent = this.generateNotificationContent(template, incident);
        
        // Registrar notificación
        await prisma.incidentNotification.create({
          data: {
            incidentId,
            type: 'EMAIL',
            recipient: `staff_${memberId}@example.com`, // Simulado
            recipientId: memberId,
            recipientRole: 'STAFF',
            subject: `Nuevo incidente: ${incident.title}`,
            content: notificationContent,
            status: 'sent'
          }
        });
      }
    }
    
    return true;
  }
  
  /**
   * Notifica sobre un cambio de estado
   */
  async notifyStatusChange(incidentId: number, newStatus: string) {
    // Obtener datos del incidente
    const incident = await this.getIncidentById(incidentId, true);
    
    // Obtener configuración de incidentes
    const settings = await this.getIncidentSettings();
    
    // Obtener plantilla de notificación
    const template = await this.getNotificationTemplate('EMAIL', `incident_${newStatus.toLowerCase()}`);
    
    // Notificar al reportante
    const notificationContent = this.generateNotificationContent(template, incident);
    
    // Registrar notificación
    await prisma.incidentNotification.create({
      data: {
        incidentId,
        type: 'EMAIL',
        recipient: `resident_${incident.reportedById}@example.com`, // Simulado
        recipientId: incident.reportedById,
        recipientRole: incident.reportedByRole,
        subject: `Actualización de incidente: ${incident.title}`,
        content: notificationContent,
        status: 'sent'
      }
    });
    
    // Si hay asignado, notificar también
    if (incident.assignedToId) {
      await prisma.incidentNotification.create({
        data: {
          incidentId,
          type: 'EMAIL',
          recipient: `staff_${incident.assignedToId}@example.com`, // Simulado
          recipientId: incident.assignedToId,
          recipientRole: incident.assignedToRole || 'STAFF',
          subject: `Actualización de incidente: ${incident.title}`,
          content: notificationContent,
          status: 'sent'
        }
      });
    }
    
    return true;
  }
  
  /**
   * Notifica sobre una asignación
   */
  async notifyAssignment(incidentId: number) {
    // Obtener datos del incidente
    const incident = await this.getIncidentById(incidentId, true);
    
    if (!incident.assignedToId) {
      throw new Error('Incidente no tiene asignado');
    }
    
    // Obtener plantilla de notificación
    const template = await this.getNotificationTemplate('EMAIL', 'incident_assigned');
    
    // Notificar al asignado
    const notificationContent = this.generateNotificationContent(template, incident);
    
    // Registrar notificación
    await prisma.incidentNotification.create({
      data: {
        incidentId,
        type: 'EMAIL',
        recipient: `staff_${incident.assignedToId}@example.com`, // Simulado
        recipientId: incident.assignedToId,
        recipientRole: incident.assignedToRole || 'STAFF',
        subject: `Incidente asignado: ${incident.title}`,
        content: notificationContent,
        status: 'sent'
      }
    });
    
    return true;
  }
  
  /**
   * Notifica sobre un nuevo comentario
   */
  async notifyNewComment(incidentId: number, commentId: number) {
    // Obtener datos del incidente
    const incident = await this.getIncidentById(incidentId, true);
    
    // Obtener datos del comentario
    const comment = await prisma.incidentComment.findUnique({
      where: { id: commentId }
    });
    
    if (!comment) {
      throw new Error('Comentario no encontrado');
    }
    
    // Obtener plantilla de notificación
    const template = await this.getNotificationTemplate('EMAIL', 'incident_comment');
    
    // Determinar destinatarios
    const recipients = [];
    
    // Siempre notificar al reportante (si no es el autor del comentario)
    if (incident.reportedById !== comment.authorId) {
      recipients.push({
        id: incident.reportedById,
        role: incident.reportedByRole,
        email: `resident_${incident.reportedById}@example.com` // Simulado
      });
    }
    
    // Si hay asignado, notificar también (si no es el autor del comentario)
    if (incident.assignedToId && incident.assignedToId !== comment.authorId) {
      recipients.push({
        id: incident.assignedToId,
        role: incident.assignedToRole || 'STAFF',
        email: `staff_${incident.assignedToId}@example.com` // Simulado
      });
    }
    
    // Notificar a cada destinatario
    for (const recipient of recipients) {
      // Generar contenido personalizado
      const notificationContent = this.generateNotificationContent(template, incident, {
        commentAuthor: comment.authorName,
        commentContent: comment.content
      });
      
      // Registrar notificación
      await prisma.incidentNotification.create({
        data: {
          incidentId,
          type: 'EMAIL',
          recipient: recipient.email,
          recipientId: recipient.id,
          recipientRole: recipient.role,
          subject: `Nuevo comentario en incidente: ${incident.title}`,
          content: notificationContent,
          status: 'sent'
        }
      });
    }
    
    return true;
  }
  
  /**
   * Asigna automáticamente un incidente según reglas
   */
  async autoAssignIncident(incidentId: number) {
    // Obtener datos del incidente
    const incident = await this.getIncidentById(incidentId, true);
    
    // Obtener equipos aplicables según categoría
    const teams = await prisma.incidentTeam.findMany({
      where: {
        categories: {
          has: incident.category
        },
        isActive: true
      }
    });
    
    if (teams.length === 0) {
      throw new Error('No hay equipos disponibles para esta categoría');
    }
    
    // Seleccionar equipo (por ahora el primero)
    const team = teams[0];
    
    if (team.memberIds.length === 0) {
      throw new Error('El equipo no tiene miembros');
    }
    
    // Seleccionar miembro con menos incidentes asignados
    const memberCounts = await Promise.all(
      team.memberIds.map(async (memberId) => {
        const count = await prisma.incident.count({
          where: {
            assignedToId: memberId,
            status: {
              in: ['ASSIGNED', 'IN_PROGRESS', 'ON_HOLD']
            }
          }
        });
        return { memberId, count };
      })
    );
    
    // Ordenar por cantidad de incidentes
    memberCounts.sort((a, b) => a.count - b.count);
    
    // Seleccionar el miembro con menos incidentes
    const selectedMember = memberCounts[0];
    
    // Obtener datos del miembro (simulado)
    const memberName = `Staff ${selectedMember.memberId}`;
    const memberRole = 'STAFF';
    
    // Asignar el incidente
    await this.assignIncident(incidentId, {
      assignedToId: selectedMember.memberId,
      assignedToName: memberName,
      assignedToRole: memberRole,
      assignedById: 0, // Sistema
      assignedByName: 'Sistema',
      assignedByRole: 'SYSTEM',
      notes: 'Asignación automática'
    });
    
    return true;
  }
  
  /**
   * Obtiene estadísticas de incidentes
   */
  async getIncidentStats(params: {
    startDate?: string;
    endDate?: string;
  }) {
    const { startDate, endDate } = params;
    
    // Construir filtros de fecha
    const dateFilter: any = {};
    
    if (startDate && endDate) {
      dateFilter.reportedAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    } else if (startDate) {
      dateFilter.reportedAt = {
        gte: new Date(startDate)
      };
    } else if (endDate) {
      dateFilter.reportedAt = {
        lte: new Date(endDate)
      };
    }
    
    // Obtener estadísticas
    const [
      totalIncidents,
      openIncidents,
      resolvedIncidents,
      closedIncidents,
      todayCount,
      incidentsByCategory,
      incidentsByStatus,
      incidentsByPriority,
      avgResolutionTime,
      slaBreachedCount
    ] = await Promise.all([
      prisma.incident.count({ where: dateFilter }),
      prisma.incident.count({ where: { ...dateFilter, status: { in: ['REPORTED', 'ASSIGNED', 'IN_PROGRESS', 'ON_HOLD', 'REOPENED'] } } }),
      prisma.incident.count({ where: { ...dateFilter, status: 'RESOLVED' } }),
      prisma.incident.count({ where: { ...dateFilter, status: 'CLOSED' } }),
      prisma.incident.count({
        where: {
          reportedAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),
      prisma.$queryRaw`
        SELECT "category", COUNT(*) as count
        FROM "tenant"."Incident"
        WHERE ${dateFilter.reportedAt ? `"reportedAt" >= '${dateFilter.reportedAt.gte.toISOString()}'::timestamp 
              AND "reportedAt" <= '${dateFilter.reportedAt.lte?.toISOString() || new Date().toISOString()}'::timestamp` : '1=1'}
        GROUP BY "category"
      `,
      prisma.$queryRaw`
        SELECT "status", COUNT(*) as count
        FROM "tenant"."Incident"
        WHERE ${dateFilter.reportedAt ? `"reportedAt" >= '${dateFilter.reportedAt.gte.toISOString()}'::timestamp 
              AND "reportedAt" <= '${dateFilter.reportedAt.lte?.toISOString() || new Date().toISOString()}'::timestamp` : '1=1'}
        GROUP BY "status"
      `,
      prisma.$queryRaw`
        SELECT "priority", COUNT(*) as count
        FROM "tenant"."Incident"
        WHERE ${dateFilter.reportedAt ? `"reportedAt" >= '${dateFilter.reportedAt.gte.toISOString()}'::timestamp 
              AND "reportedAt" <= '${dateFilter.reportedAt.lte?.toISOString() || new Date().toISOString()}'::timestamp` : '1=1'}
        GROUP BY "priority"
      `,
      prisma.$queryRaw`
        SELECT AVG("resolutionTime") as avg_time
        FROM "tenant"."Incident"
        WHERE "resolutionTime" IS NOT NULL
        AND ${dateFilter.reportedAt ? `"reportedAt" >= '${dateFilter.reportedAt.gte.toISOString()}'::timestamp 
            AND "reportedAt" <= '${dateFilter.reportedAt.lte?.toISOString() || new Date().toISOString()}'::timestamp` : '1=1'}
      `,
      prisma.incident.count({ where: { ...dateFilter, slaBreached: true } })
    ]);
    
    return {
      totalIncidents,
      openIncidents,
      resolvedIncidents,
      closedIncidents,
      todayCount,
      incidentsByCategory,
      incidentsByStatus,
      incidentsByPriority,
      avgResolutionTime: avgResolutionTime[0]?.avg_time || 0,
      slaBreachedCount
    };
  }
  
  /**
   * Obtiene la configuración de incidentes
   */
  async getIncidentSettings() {
    // Buscar configuración existente
    let settings = await prisma.incidentSettings.findFirst();
    
    // Si no existe, crear configuración por defecto
    if (!settings) {
      settings = await prisma.incidentSettings.create({
        data: {
          autoAssignEnabled: false,
          autoNotifyResident: true,
          autoNotifyStaff: true,
          notificationMethods: ['EMAIL'],
          requirePhoto: false,
          allowAnonymousReports: false,
          publicIncidentsEnabled: true,
          residentCanClose: false
        }
      });
    }
    
    return settings;
  }
  
  /**
   * Actualiza la configuración de incidentes
   */
  async updateIncidentSettings(data: {
    autoAssignEnabled?: boolean;
    autoNotifyResident?: boolean;
    autoNotifyStaff?: boolean;
    notificationMethods?: string[];
    requirePhoto?: boolean;
    allowAnonymousReports?: boolean;
    publicIncidentsEnabled?: boolean;
    residentCanClose?: boolean;
  }) {
    // Obtener configuración actual
    const currentSettings = await this.getIncidentSettings();
    
    // Actualizar configuración
    return prisma.incidentSettings.update({
      where: { id: currentSettings.id },
      data
    });
  }
  
  /**
   * Obtiene una plantilla de notificación
   */
  async getNotificationTemplate(type: string, eventType: string) {
    // Buscar plantilla por defecto para el tipo y evento especificados
    let template = await prisma.incidentNotificationTemplate.findFirst({
      where: {
        type: type as any,
        eventType,
        isDefault: true,
        isActive: true
      }
    });
    
    // Si no existe, crear plantilla por defecto
    if (!template) {
      let subject = 'Notificación de incidente';
      let templateContent = 'Incidente {{incidentNumber}}: {{title}}';
      
      switch (eventType) {
        case 'incident_created':
          subject = 'Nuevo incidente reportado';
          templateContent = 'Se ha reportado un nuevo incidente {{incidentNumber}}: {{title}}. Categoría: {{category}}, Prioridad: {{priority}}.';
          break;
        case 'incident_assigned':
          subject = 'Incidente asignado';
          templateContent = 'Se le ha asignado el incidente {{incidentNumber}}: {{title}}. Por favor, revise los detalles y comience a trabajar en él.';
          break;
        case 'incident_in_progress':
          subject = 'Incidente en progreso';
          templateContent = 'El incidente {{incidentNumber}}: {{title}} está siendo atendido.';
          break;
        case 'incident_resolved':
          subject = 'Incidente resuelto';
          templateContent = 'El incidente {{incidentNumber}}: {{title}} ha sido resuelto. Resolución: {{resolution}}.';
          break;
        case 'incident_closed':
          subject = 'Incidente cerrado';
          templateContent = 'El incidente {{incidentNumber}}: {{title}} ha sido cerrado.';
          break;
        case 'incident_comment':
          subject = 'Nuevo comentario en incidente';
          templateContent = '{{commentAuthor}} ha comentado en el incidente {{incidentNumber}}: {{title}}. Comentario: {{commentContent}}.';
          break;
      }
      
      template = await prisma.incidentNotificationTemplate.create({
        data: {
          name: `Plantilla por defecto (${type} - ${eventType})`,
          type: type as any,
          eventType,
          subject,
          template: templateContent,
          isDefault: true,
          isActive: true
        }
      });
    }
    
    return template;
  }
  
  /**
   * Obtiene el SLA aplicable para una categoría y prioridad
   */
  async getApplicableSLA(category: string, priority: string) {
    // Buscar SLA específico para categoría y prioridad
    let sla = await prisma.incidentSLA.findFirst({
      where: {
        category,
        priority,
        isActive: true
      }
    });
    
    // Si no existe, buscar SLA para la categoría (cualquier prioridad)
    if (!sla) {
      sla = await prisma.incidentSLA.findFirst({
        where: {
          category,
          priority: null,
          isActive: true
        }
      });
    }
    
    // Si no existe, buscar SLA para la prioridad (cualquier categoría)
    if (!sla) {
      sla = await prisma.incidentSLA.findFirst({
        where: {
          category: null,
          priority,
          isActive: true
        }
      });
    }
    
    // Si no existe, buscar SLA por defecto
    if (!sla) {
      sla = await prisma.incidentSLA.findFirst({
        where: {
          category: null,
          priority: null,
          isActive: true
        }
      });
    }
    
    // Si no existe ningún SLA, crear uno por defecto
    if (!sla) {
      sla = await prisma.incidentSLA.create({
        data: {
          name: 'SLA por defecto',
          responseTime: 60, // 1 hora
          resolutionTime: 1440, // 24 horas
          businessHoursOnly: true,
          isActive: true
        }
      });
    }
    
    return sla;
  }
  
  /**
   * Genera un número único de incidente
   */
  private generateIncidentNumber(): string {
    // Formato: INC-YYYYMMDD-XXXX (donde XXXX son caracteres alfanuméricos aleatorios)
    const date = new Date();
    const dateStr = date.getFullYear().toString() +
                   (date.getMonth() + 1).toString().padStart(2, '0') +
                   date.getDate().toString().padStart(2, '0');
    const randomStr = uuidv4().substring(0, 4).toUpperCase();
    
    return `INC-${dateStr}-${randomStr}`;
  }
  
  /**
   * Genera el contenido de una notificación
   */
  private generateNotificationContent(template: any, incident: any, extraData: any = {}): string {
    let content = template.template;
    
    // Reemplazar variables en la plantilla
    content = content.replace(/{{incidentNumber}}/g, incident.incidentNumber);
    content = content.replace(/{{title}}/g, incident.title);
    content = content.replace(/{{category}}/g, incident.category);
    content = content.replace(/{{priority}}/g, incident.priority);
    content = content.replace(/{{location}}/g, incident.location);
    content = content.replace(/{{reportedAt}}/g, incident.reportedAt.toLocaleString());
    content = content.replace(/{{reportedBy}}/g, incident.reportedByName);
    
    if (incident.assignedToName) {
      content = content.replace(/{{assignedTo}}/g, incident.assignedToName);
    }
    
    if (incident.resolution) {
      content = content.replace(/{{resolution}}/g, incident.resolution);
    }
    
    // Reemplazar variables adicionales
    for (const [key, value] of Object.entries(extraData)) {
      content = content.replace(new RegExp(`{{${key}}}`, 'g'), value as string);
    }
    
    return content;
  }
  
  /**
   * Valida si una transición de estado es válida
   */
  private isValidStatusTransition(currentStatus: string, newStatus: string): boolean {
    // Definir transiciones válidas
    const validTransitions: Record<string, string[]> = {
      'REPORTED': ['ASSIGNED', 'IN_PROGRESS', 'CANCELLED'],
      'ASSIGNED': ['IN_PROGRESS', 'ON_HOLD', 'CANCELLED'],
      'IN_PROGRESS': ['ON_HOLD', 'RESOLVED', 'CANCELLED'],
      'ON_HOLD': ['IN_PROGRESS', 'RESOLVED', 'CANCELLED'],
      'RESOLVED': ['CLOSED', 'REOPENED'],
      'CLOSED': ['REOPENED'],
      'CANCELLED': ['REOPENED'],
      'REOPENED': ['ASSIGNED', 'IN_PROGRESS', 'ON_HOLD']
    };
    
    // Verificar si la transición es válida
    return validTransitions[currentStatus]?.includes(newStatus) || false;
  }
}

// Exportar una instancia del servicio
export const incidentService = new IncidentService();
