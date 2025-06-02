import { PrismaClient, ReservationStatus } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Servicio para la gestión de áreas comunes y reservas
 */
export class ReservationService {
  /**
   * Obtiene todas las áreas comunes disponibles
   * @param filters Filtros opcionales (active, requiresApproval, hasFee)
   * @returns Lista de áreas comunes
   */
  async getCommonAreas(filters: {
    active?: boolean;
    requiresApproval?: boolean;
    hasFee?: boolean;
  } = {}) {
    const { active, requiresApproval, hasFee } = filters;
    
    return prisma.commonArea.findMany({
      where: {
        ...(active !== undefined && { isActive: active }),
        ...(requiresApproval !== undefined && { requiresApproval }),
        ...(hasFee !== undefined && { hasFee }),
      },
      include: {
        availabilityConfig: true,
        reservationRules: {
          where: { isActive: true },
        },
      },
    });
  }

  /**
   * Obtiene un área común por su ID
   * @param id ID del área común
   * @returns Área común con su configuración y reglas
   */
  async getCommonAreaById(id: number) {
    return prisma.commonArea.findUnique({
      where: { id },
      include: {
        availabilityConfig: true,
        reservationRules: {
          where: { isActive: true },
        },
      },
    });
  }

  /**
   * Crea una nueva área común
   * @param data Datos del área común
   * @returns Área común creada
   */
  async createCommonArea(data: {
    name: string;
    description?: string;
    location: string;
    capacity: number;
    imageUrl?: string;
    isActive?: boolean;
    requiresApproval?: boolean;
    hasFee?: boolean;
    feeAmount?: number;
  }) {
    return prisma.commonArea.create({
      data,
    });
  }

  /**
   * Actualiza un área común existente
   * @param id ID del área común
   * @param data Datos actualizados
   * @returns Área común actualizada
   */
  async updateCommonArea(id: number, data: {
    name?: string;
    description?: string;
    location?: string;
    capacity?: number;
    imageUrl?: string;
    isActive?: boolean;
    requiresApproval?: boolean;
    hasFee?: boolean;
    feeAmount?: number;
  }) {
    return prisma.commonArea.update({
      where: { id },
      data,
    });
  }

  /**
   * Desactiva un área común (no elimina)
   * @param id ID del área común
   * @returns Área común desactivada
   */
  async deactivateCommonArea(id: number) {
    return prisma.commonArea.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Configura la disponibilidad de un área común
   * @param commonAreaId ID del área común
   * @param config Configuración de disponibilidad
   * @returns Configuración actualizada
   */
  async setAvailabilityConfig(commonAreaId: number, config: {
    mondayStart?: string;
    mondayEnd?: string;
    tuesdayStart?: string;
    tuesdayEnd?: string;
    wednesdayStart?: string;
    wednesdayEnd?: string;
    thursdayStart?: string;
    thursdayEnd?: string;
    fridayStart?: string;
    fridayEnd?: string;
    saturdayStart?: string;
    saturdayEnd?: string;
    sundayStart?: string;
    sundayEnd?: string;
    holidaysAvailable?: boolean;
  }) {
    // Verificar si ya existe una configuración
    const existingConfig = await prisma.availabilityConfig.findUnique({
      where: { commonAreaId },
    });

    if (existingConfig) {
      // Actualizar configuración existente
      return prisma.availabilityConfig.update({
        where: { commonAreaId },
        data: config,
      });
    } else {
      // Crear nueva configuración
      return prisma.availabilityConfig.create({
        data: {
          ...config,
          commonArea: {
            connect: { id: commonAreaId },
          },
        },
      });
    }
  }

  /**
   * Verifica la disponibilidad de un área común en un rango de fechas
   * @param commonAreaId ID del área común
   * @param startDate Fecha de inicio
   * @param endDate Fecha de fin
   * @returns Objeto con slots disponibles y ocupados
   */
  async checkAvailability(commonAreaId: number, startDate: Date, endDate: Date) {
    // Obtener área común con su configuración
    const commonArea = await prisma.commonArea.findUnique({
      where: { id: commonAreaId },
      include: {
        availabilityConfig: true,
        reservationRules: {
          where: { isActive: true },
        },
      },
    });

    if (!commonArea) {
      throw new Error('Área común no encontrada');
    }

    // Obtener reservas existentes en el rango de fechas
    const existingReservations = await prisma.reservation.findMany({
      where: {
        commonAreaId,
        status: {
          in: [ReservationStatus.APPROVED, ReservationStatus.PENDING],
        },
        OR: [
          {
            // Reservas que comienzan dentro del rango
            startDateTime: {
              gte: startDate,
              lte: endDate,
            },
          },
          {
            // Reservas que terminan dentro del rango
            endDateTime: {
              gte: startDate,
              lte: endDate,
            },
          },
          {
            // Reservas que abarcan todo el rango
            startDateTime: {
              lte: startDate,
            },
            endDateTime: {
              gte: endDate,
            },
          },
        ],
      },
    });

    // Generar slots de disponibilidad basados en la configuración
    // Este es un cálculo simplificado, en una implementación real
    // se generarían slots por hora según la configuración de días y horarios
    const availabilitySlots = this.generateAvailabilitySlots(
      startDate,
      endDate,
      commonArea.availabilityConfig,
    );

    // Marcar slots ocupados basados en reservas existentes
    const occupiedSlots = existingReservations.map(reservation => ({
      startDateTime: reservation.startDateTime,
      endDateTime: reservation.endDateTime,
      reservationId: reservation.id,
      status: reservation.status,
    }));

    return {
      commonArea,
      availabilitySlots,
      occupiedSlots,
    };
  }

  /**
   * Genera slots de disponibilidad basados en la configuración
   * @param startDate Fecha de inicio
   * @param endDate Fecha de fin
   * @param config Configuración de disponibilidad
   * @returns Array de slots disponibles
   */
  private generateAvailabilitySlots(startDate: Date, endDate: Date, config: any) {
    // Implementación simplificada para generar slots
    // En una implementación real, se generarían slots por hora
    // según la configuración de días y horarios
    const slots = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      let startTime = null;
      let endTime = null;

      // Determinar horarios según el día de la semana
      switch (dayOfWeek) {
        case 0: // Domingo
          startTime = config?.sundayStart;
          endTime = config?.sundayEnd;
          break;
        case 1: // Lunes
          startTime = config?.mondayStart;
          endTime = config?.mondayEnd;
          break;
        case 2: // Martes
          startTime = config?.tuesdayStart;
          endTime = config?.tuesdayEnd;
          break;
        case 3: // Miércoles
          startTime = config?.wednesdayStart;
          endTime = config?.wednesdayEnd;
          break;
        case 4: // Jueves
          startTime = config?.thursdayStart;
          endTime = config?.thursdayEnd;
          break;
        case 5: // Viernes
          startTime = config?.fridayStart;
          endTime = config?.fridayEnd;
          break;
        case 6: // Sábado
          startTime = config?.saturdayStart;
          endTime = config?.saturdayEnd;
          break;
      }

      // Si hay horario definido para este día, crear slot
      if (startTime && endTime) {
        const [startHour, startMinute] = startTime.split(':').map(Number);
        const [endHour, endMinute] = endTime.split(':').map(Number);

        const slotStart = new Date(currentDate);
        slotStart.setHours(startHour, startMinute, 0, 0);

        const slotEnd = new Date(currentDate);
        slotEnd.setHours(endHour, endMinute, 0, 0);

        slots.push({
          date: new Date(currentDate),
          startDateTime: slotStart,
          endDateTime: slotEnd,
          available: true,
        });
      }

      // Avanzar al siguiente día
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return slots;
  }

  /**
   * Crea una regla de reserva para un área común
   * @param commonAreaId ID del área común
   * @param ruleData Datos de la regla
   * @returns Regla creada
   */
  async createReservationRule(commonAreaId: number, ruleData: {
    name: string;
    description: string;
    maxDurationHours?: number;
    minDurationHours?: number;
    maxAdvanceDays?: number;
    minAdvanceDays?: number;
    maxReservationsPerMonth?: number;
    maxReservationsPerWeek?: number;
    maxConcurrentReservations?: number;
    allowCancellation?: boolean;
    cancellationHours?: number;
    isActive?: boolean;
  }) {
    return prisma.reservationRule.create({
      data: {
        ...ruleData,
        commonArea: {
          connect: { id: commonAreaId },
        },
      },
    });
  }

  /**
   * Obtiene todas las reservas según filtros
   * @param filters Filtros opcionales
   * @returns Lista de reservas
   */
  async getReservations(filters: {
    userId?: number;
    propertyId?: number;
    commonAreaId?: number;
    status?: ReservationStatus;
    startDate?: Date;
    endDate?: Date;
  } = {}) {
    const { userId, propertyId, commonAreaId, status, startDate, endDate } = filters;
    
    return prisma.reservation.findMany({
      where: {
        ...(userId !== undefined && { userId }),
        ...(propertyId !== undefined && { propertyId }),
        ...(commonAreaId !== undefined && { commonAreaId }),
        ...(status !== undefined && { status }),
        ...(startDate !== undefined && {
          startDateTime: {
            gte: startDate,
          },
        }),
        ...(endDate !== undefined && {
          endDateTime: {
            lte: endDate,
          },
        }),
      },
      include: {
        commonArea: true,
      },
      orderBy: {
        startDateTime: 'asc',
      },
    });
  }

  /**
   * Obtiene una reserva por su ID
   * @param id ID de la reserva
   * @returns Reserva con detalles
   */
  async getReservationById(id: number) {
    return prisma.reservation.findUnique({
      where: { id },
      include: {
        commonArea: true,
      },
    });
  }

  /**
   * Crea una nueva solicitud de reserva
   * @param data Datos de la reserva
   * @returns Reserva creada
   */
  async createReservation(data: {
    commonAreaId: number;
    userId: number;
    propertyId: number;
    title: string;
    description?: string;
    startDateTime: Date;
    endDateTime: Date;
    attendees?: number;
    requiresPayment?: boolean;
    paymentAmount?: number;
  }) {
    // Validar disponibilidad
    const availability = await this.checkAvailability(
      data.commonAreaId,
      data.startDateTime,
      data.endDateTime,
    );

    // Verificar si hay conflictos con otras reservas
    const hasConflict = this.checkForConflicts(
      data.startDateTime,
      data.endDateTime,
      availability.occupiedSlots,
    );

    if (hasConflict) {
      throw new Error('El horario solicitado no está disponible');
    }

    // Obtener área común para verificar si requiere aprobación
    const commonArea = await prisma.commonArea.findUnique({
      where: { id: data.commonAreaId },
    });

    if (!commonArea) {
      throw new Error('Área común no encontrada');
    }

    // Determinar estado inicial (pendiente o aprobado)
    const initialStatus = commonArea.requiresApproval
      ? ReservationStatus.PENDING
      : ReservationStatus.APPROVED;

    // Crear la reserva
    const reservation = await prisma.reservation.create({
      data: {
        ...data,
        status: initialStatus,
      },
    });

    // Crear notificación de confirmación
    await this.createReservationNotification({
      reservationId: reservation.id,
      userId: data.userId,
      type: 'confirmation',
      message: commonArea.requiresApproval
        ? 'Su solicitud de reserva ha sido recibida y está pendiente de aprobación.'
        : 'Su reserva ha sido confirmada exitosamente.',
    });

    return reservation;
  }

  /**
   * Verifica si hay conflictos con otras reservas
   * @param startDateTime Fecha y hora de inicio
   * @param endDateTime Fecha y hora de fin
   * @param occupiedSlots Slots ocupados
   * @returns true si hay conflicto, false en caso contrario
   */
  private checkForConflicts(
    startDateTime: Date,
    endDateTime: Date,
    occupiedSlots: Array<{
      startDateTime: Date;
      endDateTime: Date;
      reservationId: number;
      status: ReservationStatus;
    }>,
  ) {
    return occupiedSlots.some(slot => {
      // Verificar si hay solapamiento
      return (
        (startDateTime >= slot.startDateTime && startDateTime < slot.endDateTime) ||
        (endDateTime > slot.startDateTime && endDateTime <= slot.endDateTime) ||
        (startDateTime <= slot.startDateTime && endDateTime >= slot.endDateTime)
      );
    });
  }

  /**
   * Actualiza una reserva existente
   * @param id ID de la reserva
   * @param data Datos actualizados
   * @returns Reserva actualizada
   */
  async updateReservation(id: number, data: {
    title?: string;
    description?: string;
    startDateTime?: Date;
    endDateTime?: Date;
    attendees?: number;
  }) {
    // Obtener reserva actual
    const currentReservation = await prisma.reservation.findUnique({
      where: { id },
    });

    if (!currentReservation) {
      throw new Error('Reserva no encontrada');
    }

    // Si se están actualizando las fechas, verificar disponibilidad
    if (data.startDateTime || data.endDateTime) {
      const startDateTime = data.startDateTime || currentReservation.startDateTime;
      const endDateTime = data.endDateTime || currentReservation.endDateTime;

      // Validar disponibilidad
      const availability = await this.checkAvailability(
        currentReservation.commonAreaId,
        startDateTime,
        endDateTime,
      );

      // Verificar si hay conflictos con otras reservas (excluyendo la actual)
      const hasConflict = this.checkForConflicts(
        startDateTime,
        endDateTime,
        availability.occupiedSlots.filter(slot => slot.reservationId !== id),
      );

      if (hasConflict) {
        throw new Error('El horario solicitado no está disponible');
      }
    }

    // Actualizar la reserva
    return prisma.reservation.update({
      where: { id },
      data,
    });
  }

  /**
   * Aprueba una solicitud de reserva pendiente
   * @param id ID de la reserva
   * @param approvedById ID del administrador que aprueba
   * @returns Reserva aprobada
   */
  async approveReservation(id: number, approvedById: number) {
    // Obtener reserva actual
    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: {
        commonArea: true,
      },
    });

    if (!reservation) {
      throw new Error('Reserva no encontrada');
    }

    if (reservation.status !== ReservationStatus.PENDING) {
      throw new Error('Solo se pueden aprobar reservas pendientes');
    }

    // Actualizar la reserva
    const updatedReservation = await prisma.reservation.update({
      where: { id },
      data: {
        status: ReservationStatus.APPROVED,
        approvedById,
        approvedAt: new Date(),
      },
    });

    // Crear notificación de aprobación
    await this.createReservationNotification({
      reservationId: id,
      userId: reservation.userId,
      type: 'approval',
      message: `Su reserva para ${reservation.commonArea.name} ha sido aprobada.`,
    });

    return updatedReservation;
  }

  /**
   * Rechaza una solicitud de reserva pendiente
   * @param id ID de la reserva
   * @param rejectionReason Razón del rechazo
   * @param approvedById ID del administrador que rechaza
   * @returns Reserva rechazada
   */
  async rejectReservation(id: number, rejectionReason: string, approvedById: number) {
    // Obtener reserva actual
    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: {
        commonArea: true,
      },
    });

    if (!reservation) {
      throw new Error('Reserva no encontrada');
    }

    if (reservation.status !== ReservationStatus.PENDING) {
      throw new Error('Solo se pueden rechazar reservas pendientes');
    }

    // Actualizar la reserva
    const updatedReservation = await prisma.reservation.update({
      where: { id },
      data: {
        status: ReservationStatus.REJECTED,
        rejectionReason,
        approvedById,
        approvedAt: new Date(),
      },
    });

    // Crear notificación de rechazo
    await this.createReservationNotification({
      reservationId: id,
      userId: reservation.userId,
      type: 'rejection',
      message: `Su reserva para ${reservation.commonArea.name} ha sido rechazada. Razón: ${rejectionReason}`,
    });

    return updatedReservation;
  }

  /**
   * Cancela una reserva
   * @param id ID de la reserva
   * @param cancellationReason Razón de la cancelación
   * @param userId ID del usuario que cancela
   * @returns Reserva cancelada
   */
  async cancelReservation(id: number, cancellationReason: string, userId: number) {
    // Obtener reserva actual
    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: {
        commonArea: true,
      },
    });

    if (!reservation) {
      throw new Error('Reserva no encontrada');
    }

    // Verificar si el usuario es el propietario de la reserva
    if (reservation.userId !== userId) {
      throw new Error('Solo el propietario puede cancelar la reserva');
    }

    // Verificar que la reserva esté en estado pendiente o aprobada
    if (reservation.status !== ReservationStatus.PENDING && 
        reservation.status !== ReservationStatus.APPROVED) {
      throw new Error('Solo se pueden cancelar reservas pendientes o aprobadas');
    }

    // Verificar reglas de cancelación
    const rules = await prisma.reservationRule.findMany({
      where: {
        commonAreaId: reservation.commonAreaId,
        isActive: true,
      },
    });

    const rule = rules[0]; // Tomamos la primera regla activa
    if (rule && !rule.allowCancellation) {
      throw new Error('Las cancelaciones no están permitidas para esta área común');
    }

    if (rule && rule.allowCancellation && rule.cancellationHours > 0) {
      const hoursUntilStart = Math.floor(
        (reservation.startDateTime.getTime() - new Date().getTime()) / (1000 * 60 * 60)
      );
      
      if (hoursUntilStart < rule.cancellationHours) {
        throw new Error(`Las cancelaciones deben realizarse con al menos ${rule.cancellationHours} horas de anticipación`);
      }
    }

    // Actualizar la reserva
    const updatedReservation = await prisma.reservation.update({
      where: { id },
      data: {
        status: ReservationStatus.CANCELLED,
        cancellationReason,
        cancelledAt: new Date(),
      },
    });

    // Crear notificación de cancelación
    await this.createReservationNotification({
      reservationId: id,
      userId: reservation.userId,
      type: 'cancellation',
      message: `Su reserva para ${reservation.commonArea.name} ha sido cancelada.`,
    });

    return updatedReservation;
  }

  /**
   * Crea una notificación de reserva
   * @param data Datos de la notificación
   * @returns Notificación creada
   */
  async createReservationNotification(data: {
    reservationId: number;
    userId: number;
    type: string;
    message: string;
  }) {
    return prisma.reservationNotification.create({
      data,
    });
  }

  /**
   * Obtiene las notificaciones de un usuario
   * @param userId ID del usuario
   * @param filters Filtros opcionales
   * @returns Lista de notificaciones
   */
  async getUserNotifications(userId: number, filters: {
    isRead?: boolean;
    type?: string;
  } = {}) {
    const { isRead, type } = filters;
    
    return prisma.reservationNotification.findMany({
      where: {
        userId,
        ...(isRead !== undefined && { isRead }),
        ...(type !== undefined && { type }),
      },
      orderBy: {
        sentAt: 'desc',
      },
    });
  }

  /**
   * Marca una notificación como leída
   * @param id ID de la notificación
   * @param userId ID del usuario
   * @returns Notificación actualizada
   */
  async markNotificationAsRead(id: number, userId: number) {
    // Verificar que la notificación pertenece al usuario
    const notification = await prisma.reservationNotification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new Error('Notificación no encontrada');
    }

    if (notification.userId !== userId) {
      throw new Error('No tiene permiso para acceder a esta notificación');
    }

    return prisma.reservationNotification.update({
      where: { id },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }
}

export default new ReservationService();
