// src/services/reservationService.ts
import { PrismaClient, ReservationStatus } from '@prisma/client';
import { ServerLogger } from '@/lib/logging/server-logger';
import { formatDate } from '@/lib/utils/formatters';

// Interfaces para los parámetros de entrada
interface GetCommonAreasParams {
  isActive?: boolean;
  page?: number;
  limit?: number;
}

interface GetReservationsParams {
  userId?: number;
  propertyId?: number;
  commonAreaId?: number;
  status?: ReservationStatus;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

interface CreateReservationParams {
  commonAreaId: number;
  userId: number;
  propertyId: number;
  title: string;
  description?: string;
  startDateTime: Date;
  endDateTime: Date;
  attendees: number;
}

interface UpdateReservationStatusParams {
  reservationId: number;
  status: ReservationStatus;
  adminId?: number;
  reason?: string;
}

/**
 * Servicio para la gestión de reservas de áreas comunes
 */
export class ReservationService {
  private prisma: PrismaClient;
  private schema: string;

  /**
   * Constructor del servicio
   * @param schema Esquema de la base de datos (tenant)
   */
  constructor(schema: string) {
    this.schema = schema;
    this.prisma = new PrismaClient();
  }

  /**
   * Obtiene las áreas comunes disponibles
   * @param params Parámetros de filtrado
   * @returns Lista de áreas comunes y total
   */
  async getCommonAreas(params: GetCommonAreasParams = {}) {
    try {
      const { isActive = true, page = 1, limit = 10 } = params;
      const offset = (page - 1) * limit;

      // Consulta para obtener el total de áreas comunes
      const totalQuery = `
        SELECT COUNT(*) as count
        FROM "${this.schema}"."CommonArea"
        WHERE "isActive" = ${isActive}
      `;
      const totalResult = await this.prisma.$queryRawUnsafe(totalQuery);
      const total = parseInt(totalResult[0]?.count || '0', 10);

      // Consulta para obtener las áreas comunes con paginación
      const areasQuery = `
        SELECT *
        FROM "${this.schema}"."CommonArea"
        WHERE "isActive" = ${isActive}
        ORDER BY "name" ASC
        LIMIT ${limit} OFFSET ${offset}
      `;
      const areas = await this.prisma.$queryRawUnsafe(areasQuery);

      // Para cada área común, obtener su configuración de disponibilidad
      const areasWithConfig = await Promise.all(
        areas.map(async (area: any) => {
          const configQuery = `
            SELECT *
            FROM "${this.schema}"."AvailabilityConfig"
            WHERE "commonAreaId" = ${area.id}
          `;
          const config = await this.prisma.$queryRawUnsafe(configQuery);
          
          return {
            ...area,
            availabilityConfig: config[0] || null
          };
        })
      );

      return {
        areas: areasWithConfig,
        total
      };
    } catch (error) {
      ServerLogger.error(`Error al obtener áreas comunes: ${error}`);
      throw error;
    }
  }

  /**
   * Obtiene un área común por su ID
   * @param id ID del área común
   * @returns Área común con su configuración de disponibilidad
   */
  async getCommonAreaById(id: number) {
    try {
      const areaQuery = `
        SELECT *
        FROM "${this.schema}"."CommonArea"
        WHERE "id" = ${id}
      `;
      const areas = await this.prisma.$queryRawUnsafe(areaQuery);
      
      if (!areas || areas.length === 0) {
        return null;
      }

      const area = areas[0];

      // Obtener configuración de disponibilidad
      const configQuery = `
        SELECT *
        FROM "${this.schema}"."AvailabilityConfig"
        WHERE "commonAreaId" = ${id}
      `;
      const configs = await this.prisma.$queryRawUnsafe(configQuery);
      
      // Obtener reglas de reserva
      const rulesQuery = `
        SELECT *
        FROM "${this.schema}"."ReservationRule"
        WHERE "commonAreaId" = ${id} AND "isActive" = true
      `;
      const rules = await this.prisma.$queryRawUnsafe(rulesQuery);

      return {
        ...area,
        availabilityConfig: configs[0] || null,
        reservationRules: rules || []
      };
    } catch (error) {
      ServerLogger.error(`Error al obtener área común ${id}: ${error}`);
      throw error;
    }
  }

  /**
   * Obtiene las reservas según los filtros especificados
   * @param params Parámetros de filtrado
   * @returns Lista de reservas y total
   */
  async getReservations(params: GetReservationsParams = {}) {
    try {
      const {
        userId,
        propertyId,
        commonAreaId,
        status,
        startDate,
        endDate,
        page = 1,
        limit = 10
      } = params;
      
      const offset = (page - 1) * limit;
      
      // Construir condiciones de filtrado
      const conditions = [];
      
      if (userId !== undefined) {
        conditions.push(`"userId" = ${userId}`);
      }
      
      if (propertyId !== undefined) {
        conditions.push(`"propertyId" = ${propertyId}`);
      }
      
      if (commonAreaId !== undefined) {
        conditions.push(`"commonAreaId" = ${commonAreaId}`);
      }
      
      if (status !== undefined) {
        conditions.push(`"status" = '${status}'`);
      }
      
      if (startDate !== undefined) {
        conditions.push(`"startDateTime" >= '${startDate.toISOString()}'`);
      }
      
      if (endDate !== undefined) {
        conditions.push(`"endDateTime" <= '${endDate.toISOString()}'`);
      }
      
      const whereClause = conditions.length > 0
        ? `WHERE ${conditions.join(' AND ')}`
        : '';
      
      // Consulta para obtener el total de reservas
      const totalQuery = `
        SELECT COUNT(*) as count
        FROM "${this.schema}"."Reservation"
        ${whereClause}
      `;
      const totalResult = await this.prisma.$queryRawUnsafe(totalQuery);
      const total = parseInt(totalResult[0]?.count || '0', 10);
      
      // Consulta para obtener las reservas con paginación
      const reservationsQuery = `
        SELECT r.*, ca.name as "commonAreaName", ca.location as "commonAreaLocation"
        FROM "${this.schema}"."Reservation" r
        LEFT JOIN "${this.schema}"."CommonArea" ca ON r."commonAreaId" = ca.id
        ${whereClause}
        ORDER BY r."startDateTime" DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      const reservations = await this.prisma.$queryRawUnsafe(reservationsQuery);
      
      return {
        reservations,
        total
      };
    } catch (error) {
      ServerLogger.error(`Error al obtener reservas: ${error}`);
      throw error;
    }
  }

  /**
   * Obtiene una reserva por su ID
   * @param id ID de la reserva
   * @returns Reserva con detalles del área común
   */
  async getReservationById(id: number) {
    try {
      const query = `
        SELECT r.*, ca.name as "commonAreaName", ca.location as "commonAreaLocation",
               ca.capacity as "commonAreaCapacity", ca.imageUrl as "commonAreaImageUrl"
        FROM "${this.schema}"."Reservation" r
        LEFT JOIN "${this.schema}"."CommonArea" ca ON r."commonAreaId" = ca.id
        WHERE r."id" = ${id}
      `;
      const reservations = await this.prisma.$queryRawUnsafe(query);
      
      if (!reservations || reservations.length === 0) {
        return null;
      }
      
      return reservations[0];
    } catch (error) {
      ServerLogger.error(`Error al obtener reserva ${id}: ${error}`);
      throw error;
    }
  }

  /**
   * Verifica la disponibilidad de un área común en un rango de fechas
   * @param commonAreaId ID del área común
   * @param startDateTime Fecha y hora de inicio
   * @param endDateTime Fecha y hora de fin
   * @returns Objeto con disponibilidad y conflictos
   */
  async checkAvailability(
    commonAreaId: number,
    startDateTime: Date,
    endDateTime: Date
  ) {
    try {
      // 1. Verificar que el área común existe y está activa
      const area = await this.getCommonAreaById(commonAreaId);
      
      if (!area) {
        throw new Error(`El área común con ID ${commonAreaId} no existe`);
      }
      
      if (!area.isActive) {
        throw new Error(`El área común ${area.name} no está disponible actualmente`);
      }
      
      // 2. Verificar que el horario está dentro de la configuración de disponibilidad
      const isWithinBusinessHours = await this.isWithinBusinessHours(
        commonAreaId,
        startDateTime,
        endDateTime
      );
      
      if (!isWithinBusinessHours) {
        return {
          available: false,
          reason: 'El horario solicitado está fuera del horario de disponibilidad del área común',
          conflicts: []
        };
      }
      
      // 3. Verificar que no hay conflictos con otras reservas
      const conflictsQuery = `
        SELECT id, title, "startDateTime", "endDateTime", status
        FROM "${this.schema}"."Reservation"
        WHERE "commonAreaId" = ${commonAreaId}
        AND status IN ('PENDING', 'APPROVED')
        AND (
          ("startDateTime" < '${endDateTime.toISOString()}' AND "endDateTime" > '${startDateTime.toISOString()}')
        )
      `;
      const conflicts = await this.prisma.$queryRawUnsafe(conflictsQuery);
      
      return {
        available: conflicts.length === 0,
        reason: conflicts.length > 0 ? 'Existen reservas que se solapan con el horario solicitado' : null,
        conflicts
      };
    } catch (error) {
      ServerLogger.error(`Error al verificar disponibilidad: ${error}`);
      throw error;
    }
  }

  /**
   * Verifica si un horario está dentro de la configuración de disponibilidad
   * @param commonAreaId ID del área común
   * @param startDateTime Fecha y hora de inicio
   * @param endDateTime Fecha y hora de fin
   * @returns true si está dentro del horario de disponibilidad
   */
  private async isWithinBusinessHours(
    commonAreaId: number,
    startDateTime: Date,
    endDateTime: Date
  ): Promise<boolean> {
    try {
      // Obtener la configuración de disponibilidad
      const configQuery = `
        SELECT *
        FROM "${this.schema}"."AvailabilityConfig"
        WHERE "commonAreaId" = ${commonAreaId}
      `;
      const configs = await this.prisma.$queryRawUnsafe(configQuery);
      
      if (!configs || configs.length === 0) {
        // Si no hay configuración, asumimos que está disponible 24/7
        return true;
      }
      
      const config = configs[0];
      
      // Obtener el día de la semana de la fecha de inicio (0 = domingo, 1 = lunes, etc.)
      const startDay = startDateTime.getDay();
      const endDay = endDateTime.getDay();
      
      // Si la reserva abarca más de un día, verificar cada día
      if (startDay !== endDay) {
        return false; // Por simplicidad, no permitimos reservas que abarquen más de un día
      }
      
      // Convertir la hora a formato "HH:MM"
      const startHour = `${startDateTime.getHours().toString().padStart(2, '0')}:${startDateTime.getMinutes().toString().padStart(2, '0')}`;
      const endHour = `${endDateTime.getHours().toString().padStart(2, '0')}:${endDateTime.getMinutes().toString().padStart(2, '0')}`;
      
      // Verificar según el día de la semana
      let dayStart: string | null = null;
      let dayEnd: string | null = null;
      
      switch (startDay) {
        case 0: // Domingo
          dayStart = config.sundayStart;
          dayEnd = config.sundayEnd;
          break;
        case 1: // Lunes
          dayStart = config.mondayStart;
          dayEnd = config.mondayEnd;
          break;
        case 2: // Martes
          dayStart = config.tuesdayStart;
          dayEnd = config.tuesdayEnd;
          break;
        case 3: // Miércoles
          dayStart = config.wednesdayStart;
          dayEnd = config.wednesdayEnd;
          break;
        case 4: // Jueves
          dayStart = config.thursdayStart;
          dayEnd = config.thursdayEnd;
          break;
        case 5: // Viernes
          dayStart = config.fridayStart;
          dayEnd = config.fridayEnd;
          break;
        case 6: // Sábado
          dayStart = config.saturdayStart;
          dayEnd = config.saturdayEnd;
          break;
      }
      
      // Si no hay configuración para ese día, no está disponible
      if (!dayStart || !dayEnd) {
        return false;
      }
      
      // Verificar que el horario solicitado está dentro del horario de disponibilidad
      return startHour >= dayStart && endHour <= dayEnd;
    } catch (error) {
      ServerLogger.error(`Error al verificar horario de disponibilidad: ${error}`);
      throw error;
    }
  }

  /**
   * Crea una nueva reserva
   * @param params Parámetros de la reserva
   * @returns Reserva creada
   */
  async createReservation(params: CreateReservationParams) {
    try {
      const {
        commonAreaId,
        userId,
        propertyId,
        title,
        description,
        startDateTime,
        endDateTime,
        attendees
      } = params;
      
      // 1. Verificar disponibilidad
      const availability = await this.checkAvailability(
        commonAreaId,
        startDateTime,
        endDateTime
      );
      
      if (!availability.available) {
        throw new Error(availability.reason || 'El área común no está disponible en el horario solicitado');
      }
      
      // 2. Verificar reglas de reserva
      await this.validateReservationRules(
        commonAreaId,
        userId,
        startDateTime,
        endDateTime
      );
      
      // 3. Obtener información del área común
      const area = await this.getCommonAreaById(commonAreaId);
      
      // 4. Crear la reserva
      const insertQuery = `
        INSERT INTO "${this.schema}"."Reservation" (
          "commonAreaId", "userId", "propertyId", "title", "description",
          "startDateTime", "endDateTime", "attendees", "status",
          "requiresPayment", "paymentAmount", "createdAt", "updatedAt"
        )
        VALUES (
          ${commonAreaId}, ${userId}, ${propertyId}, '${title}',
          ${description ? `'${description}'` : 'NULL'},
          '${startDateTime.toISOString()}', '${endDateTime.toISOString()}',
          ${attendees}, '${area?.requiresApproval ? 'PENDING' : 'APPROVED'}',
          ${area?.hasFee}, ${area?.hasFee ? area.feeAmount : 'NULL'},
          NOW(), NOW()
        )
        RETURNING *
      `;
      
      const result = await this.prisma.$queryRawUnsafe(insertQuery);
      const reservation = result[0];
      
      // 5. Crear notificación
      await this.createReservationNotification(
        reservation.id,
        userId,
        area?.requiresApproval ? 'reservation_pending' : 'reservation_confirmed',
        area?.requiresApproval
          ? `Tu reserva para ${area.name} está pendiente de aprobación`
          : `Tu reserva para ${area.name} ha sido confirmada`
      );
      
      return reservation;
    } catch (error) {
      ServerLogger.error(`Error al crear reserva: ${error}`);
      throw error;
    }
  }

  /**
   * Valida las reglas de reserva
   * @param commonAreaId ID del área común
   * @param userId ID del usuario
   * @param startDateTime Fecha y hora de inicio
   * @param endDateTime Fecha y hora de fin
   */
  private async validateReservationRules(
    commonAreaId: number,
    userId: number,
    startDateTime: Date,
    endDateTime: Date
  ) {
    try {
      // Obtener reglas de reserva
      const rulesQuery = `
        SELECT *
        FROM "${this.schema}"."ReservationRule"
        WHERE "commonAreaId" = ${commonAreaId} AND "isActive" = true
      `;
      const rules = await this.prisma.$queryRawUnsafe(rulesQuery);
      
      if (!rules || rules.length === 0) {
        // Si no hay reglas, no hay validaciones adicionales
        return;
      }
      
      const rule = rules[0]; // Tomamos la primera regla activa
      
      // 1. Validar duración mínima y máxima
      const durationHours = (endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60 * 60);
      
      if (durationHours < rule.minDurationHours) {
        throw new Error(`La duración mínima de reserva es de ${rule.minDurationHours} horas`);
      }
      
      if (durationHours > rule.maxDurationHours) {
        throw new Error(`La duración máxima de reserva es de ${rule.maxDurationHours} horas`);
      }
      
      // 2. Validar anticipación mínima y máxima
      const now = new Date();
      const daysInAdvance = (startDateTime.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysInAdvance < rule.minAdvanceDays) {
        throw new Error(`Debes reservar con al menos ${rule.minAdvanceDays} días de anticipación`);
      }
      
      if (daysInAdvance > rule.maxAdvanceDays) {
        throw new Error(`No puedes reservar con más de ${rule.maxAdvanceDays} días de anticipación`);
      }
      
      // 3. Validar número máximo de reservas por semana
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay()); // Domingo de la semana actual
      startOfWeek.setHours(0, 0, 0, 0);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 7); // Sábado de la semana actual
      endOfWeek.setHours(23, 59, 59, 999);
      
      const weeklyReservationsQuery = `
        SELECT COUNT(*) as count
        FROM "${this.schema}"."Reservation"
        WHERE "userId" = ${userId}
        AND "commonAreaId" = ${commonAreaId}
        AND "status" IN ('PENDING', 'APPROVED')
        AND "startDateTime" >= '${startOfWeek.toISOString()}'
        AND "startDateTime" <= '${endOfWeek.toISOString()}'
      `;
      const weeklyResult = await this.prisma.$queryRawUnsafe(weeklyReservationsQuery);
      const weeklyCount = parseInt(weeklyResult[0]?.count || '0', 10);
      
      if (weeklyCount >= rule.maxReservationsPerWeek) {
        throw new Error(`Has alcanzado el límite de ${rule.maxReservationsPerWeek} reservas por semana para esta área`);
      }
      
      // 4. Validar número máximo de reservas por mes
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      
      const monthlyReservationsQuery = `
        SELECT COUNT(*) as count
        FROM "${this.schema}"."Reservation"
        WHERE "userId" = ${userId}
        AND "commonAreaId" = ${commonAreaId}
        AND "status" IN ('PENDING', 'APPROVED')
        AND "startDateTime" >= '${startOfMonth.toISOString()}'
        AND "startDateTime" <= '${endOfMonth.toISOString()}'
      `;
      const monthlyResult = await this.prisma.$queryRawUnsafe(monthlyReservationsQuery);
      const monthlyCount = parseInt(monthlyResult[0]?.count || '0', 10);
      
      if (monthlyCount >= rule.maxReservationsPerMonth) {
        throw new Error(`Has alcanzado el límite de ${rule.maxReservationsPerMonth} reservas por mes para esta área`);
      }
      
      // 5. Validar número máximo de reservas concurrentes
      const concurrentReservationsQuery = `
        SELECT COUNT(*) as count
        FROM "${this.schema}"."Reservation"
        WHERE "userId" = ${userId}
        AND "status" IN ('PENDING', 'APPROVED')
        AND (
          ("startDateTime" <= '${endDateTime.toISOString()}' AND "endDateTime" >= '${startDateTime.toISOString()}')
        )
      `;
      const concurrentResult = await this.prisma.$queryRawUnsafe(concurrentReservationsQuery);
      const concurrentCount = parseInt(concurrentResult[0]?.count || '0', 10);
      
      if (concurrentCount >= rule.maxConcurrentReservations) {
        throw new Error(`Has alcanzado el límite de ${rule.maxConcurrentReservations} reservas concurrentes`);
      }
    } catch (error) {
      ServerLogger.error(`Error al validar reglas de reserva: ${error}`);
      throw error;
    }
  }

  /**
   * Actualiza el estado de una reserva
   * @param params Parámetros de actualización
   * @returns Reserva actualizada
   */
  async updateReservationStatus(params: UpdateReservationStatusParams) {
    try {
      const { reservationId, status, adminId, reason } = params;
      
      // 1. Verificar que la reserva existe
      const reservation = await this.getReservationById(reservationId);
      
      if (!reservation) {
        throw new Error(`La reserva con ID ${reservationId} no existe`);
      }
      
      // 2. Validar transiciones de estado permitidas
      this.validateStatusTransition(reservation.status, status);
      
      // 3. Actualizar el estado de la reserva
      let updateFields = `"status" = '${status}', "updatedAt" = NOW()`;
      
      if (status === 'APPROVED' && adminId) {
        updateFields += `, "approvedById" = ${adminId}, "approvedAt" = NOW()`;
      }
      
      if (status === 'REJECTED' && reason) {
        updateFields += `, "rejectionReason" = '${reason}'`;
      }
      
      if (status === 'CANCELLED') {
        updateFields += `, "cancelledAt" = NOW()`;
        
        if (reason) {
          updateFields += `, "cancellationReason" = '${reason}'`;
        }
      }
      
      const updateQuery = `
        UPDATE "${this.schema}"."Reservation"
        SET ${updateFields}
        WHERE "id" = ${reservationId}
        RETURNING *
      `;
      
      const result = await this.prisma.$queryRawUnsafe(updateQuery);
      const updatedReservation = result[0];
      
      // 4. Crear notificación según el nuevo estado
      let notificationType = '';
      let notificationMessage = '';
      
      switch (status) {
        case 'APPROVED':
          notificationType = 'reservation_approved';
          notificationMessage = `Tu reserva para ${reservation.commonAreaName} ha sido aprobada`;
          break;
        case 'REJECTED':
          notificationType = 'reservation_rejected';
          notificationMessage = `Tu reserva para ${reservation.commonAreaName} ha sido rechazada${reason ? `: ${reason}` : ''}`;
          break;
        case 'CANCELLED':
          notificationType = 'reservation_cancelled';
          notificationMessage = `Tu reserva para ${reservation.commonAreaName} ha sido cancelada${reason ? `: ${reason}` : ''}`;
          break;
        case 'COMPLETED':
          notificationType = 'reservation_completed';
          notificationMessage = `Tu reserva para ${reservation.commonAreaName} ha sido completada`;
          break;
      }
      
      if (notificationType) {
        await this.createReservationNotification(
          reservationId,
          reservation.userId,
          notificationType,
          notificationMessage
        );
      }
      
      return updatedReservation;
    } catch (error) {
      ServerLogger.error(`Error al actualizar estado de reserva: ${error}`);
      throw error;
    }
  }

  /**
   * Valida las transiciones de estado permitidas
   * @param currentStatus Estado actual
   * @param newStatus Nuevo estado
   */
  private validateStatusTransition(currentStatus: string, newStatus: ReservationStatus) {
    // Definir transiciones permitidas
    const allowedTransitions: Record<string, ReservationStatus[]> = {
      'PENDING': ['APPROVED', 'REJECTED', 'CANCELLED'],
      'APPROVED': ['CANCELLED', 'COMPLETED'],
      'REJECTED': [],
      'CANCELLED': [],
      'COMPLETED': []
    };
    
    if (!allowedTransitions[currentStatus]?.includes(newStatus)) {
      throw new Error(`No se puede cambiar el estado de ${currentStatus} a ${newStatus}`);
    }
  }

  /**
   * Crea una notificación de reserva
   * @param reservationId ID de la reserva
   * @param userId ID del usuario
   * @param type Tipo de notificación
   * @param message Mensaje de la notificación
   * @returns Notificación creada
   */
  private async createReservationNotification(
    reservationId: number,
    userId: number,
    type: string,
    message: string
  ) {
    try {
      const insertQuery = `
        INSERT INTO "${this.schema}"."ReservationNotification" (
          "reservationId", "userId", "type", "message", "isRead", "sentAt"
        )
        VALUES (
          ${reservationId}, ${userId}, '${type}', '${message}', false, NOW()
        )
        RETURNING *
      `;
      
      const result = await this.prisma.$queryRawUnsafe(insertQuery);
      return result[0];
    } catch (error) {
      ServerLogger.error(`Error al crear notificación de reserva: ${error}`);
      // No propagamos el error para no interrumpir el flujo principal
      return null;
    }
  }

  /**
   * Obtiene las notificaciones de un usuario
   * @param userId ID del usuario
   * @param page Página
   * @param limit Límite por página
   * @returns Lista de notificaciones y total
   */
  async getUserNotifications(userId: number, page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      
      // Consulta para obtener el total de notificaciones
      const totalQuery = `
        SELECT COUNT(*) as count
        FROM "${this.schema}"."ReservationNotification"
        WHERE "userId" = ${userId}
      `;
      const totalResult = await this.prisma.$queryRawUnsafe(totalQuery);
      const total = parseInt(totalResult[0]?.count || '0', 10);
      
      // Consulta para obtener las notificaciones con paginación
      const notificationsQuery = `
        SELECT n.*, r.title as "reservationTitle", r."startDateTime", r."endDateTime",
               ca.name as "commonAreaName"
        FROM "${this.schema}"."ReservationNotification" n
        LEFT JOIN "${this.schema}"."Reservation" r ON n."reservationId" = r.id
        LEFT JOIN "${this.schema}"."CommonArea" ca ON r."commonAreaId" = ca.id
        WHERE n."userId" = ${userId}
        ORDER BY n."sentAt" DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      const notifications = await this.prisma.$queryRawUnsafe(notificationsQuery);
      
      return {
        notifications,
        total
      };
    } catch (error) {
      ServerLogger.error(`Error al obtener notificaciones del usuario ${userId}: ${error}`);
      throw error;
    }
  }

  /**
   * Marca una notificación como leída
   * @param notificationId ID de la notificación
   * @param userId ID del usuario
   * @returns Notificación actualizada
   */
  async markNotificationAsRead(notificationId: number, userId: number) {
    try {
      const updateQuery = `
        UPDATE "${this.schema}"."ReservationNotification"
        SET "isRead" = true, "readAt" = NOW()
        WHERE "id" = ${notificationId} AND "userId" = ${userId}
        RETURNING *
      `;
      
      const result = await this.prisma.$queryRawUnsafe(updateQuery);
      
      if (!result || result.length === 0) {
        throw new Error(`La notificación con ID ${notificationId} no existe o no pertenece al usuario ${userId}`);
      }
      
      return result[0];
    } catch (error) {
      ServerLogger.error(`Error al marcar notificación como leída: ${error}`);
      throw error;
    }
  }
}
