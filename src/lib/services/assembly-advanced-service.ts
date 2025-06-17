/**
 * Servicio avanzado para gestión de asambleas con soporte para votaciones en tiempo real,
 * cálculo automático de quórum y generación de actas con firmas digitales.
 * 
 * Este servicio extiende la funcionalidad básica del AssemblyService existente
 * para implementar los requisitos avanzados de la especificación v10.
 */

import { PrismaClient, AssemblyStatus, VotingStatus, QuorumStatus, MinutesStatus, SignatureStatus } from '@prisma/client';
import { getPrisma } from '@/lib/prisma';
import { ServerLogger } from '../logging/server-logger';
import { ActivityLogger } from '../logging/activity-logger';
import { WebSocketService } from '../communications/websocket-service';
import { notifyAssemblyConvocation, notifyQuorumReached, notifyVotingOpened, notifyVotingClosed, notifyAssemblyEnded, notifyMinutesAvailable } from '../communications/integrations/assembly-notifications';
import { generatePdf } from '../pdf/pdfGenerator';
import { DigitalSignatureService } from './digital-signature-service';

const prisma = getPrisma();
const activityLogger = new ActivityLogger();
const wsService = new WebSocketService();
const signatureService = new DigitalSignatureService();

/**
 * Servicio avanzado para gestión de asambleas
 */
export class AssemblyAdvancedService {
  /**
   * Crea una nueva asamblea con configuración avanzada
   * 
   * @param data Datos de la asamblea a crear
   * @param userId ID del usuario que crea la asamblea
   */
  async createAssembly(data: {
    title: string;
    description?: string;
    type: string;
    date: Date;
    location: string;
    agenda: any[];
    requiredCoefficient: number;
  }, userId: number) {
    try {
      // Generar canal de tiempo real único para esta asamblea
      const realtimeChannel = `assembly-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      // Crear la asamblea en la base de datos
      const assembly = await prisma.assembly.create({
        data: {
          title: data.title,
          description: data.description,
          type: data.type as any,
          status: 'SCHEDULED',
          date: data.date,
          location: data.location,
          agenda: data.agenda,
          requiredCoefficient: data.requiredCoefficient,
          currentCoefficient: 0,
          quorumStatus: 'NOT_REACHED',
          realtimeChannel,
          createdBy: userId
        }
      });
      
      // Registrar actividad
      await activityLogger.logActivity({
        userId,
        action: 'CREATE_ASSEMBLY',
        resourceType: 'ASSEMBLY',
        resourceId: assembly.id,
        details: {
          title: assembly.title,
          date: assembly.date
        }
      });
      
      // Enviar notificaciones de convocatoria
      await notifyAssemblyConvocation(
        assembly.id,
        assembly.title,
        assembly.date,
        assembly.location
      );
      
      return assembly;
    } catch (error) {
      ServerLogger.error('Error al crear asamblea avanzada:', error);
      throw error;
    }
  }
  
  /**
   * Registra asistencia a una asamblea y actualiza el quórum automáticamente
   * 
   * @param assemblyId ID de la asamblea
   * @param data Datos de asistencia
   */
  async registerAttendance(assemblyId: number, data: {
    userId: number;
    propertyUnitId: number;
    coefficient: number;
    attendanceType: string;
    proxyUserId?: number;
    proxyDocumentUrl?: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    try {
      // Verificar si la asamblea existe y está en estado válido
      const assembly = await prisma.assembly.findUnique({
        where: { id: assemblyId }
      });
      
      if (!assembly) {
        throw new Error(`Asamblea con ID ${assemblyId} no encontrada`);
      }
      
      if (assembly.status !== 'SCHEDULED' && assembly.status !== 'IN_PROGRESS') {
        throw new Error(`No se puede registrar asistencia en una asamblea con estado ${assembly.status}`);
      }
      
      // Verificar si ya existe registro de asistencia para esta propiedad
      const existingAttendance = await prisma.assemblyAttendee.findFirst({
        where: {
          assemblyId,
          propertyUnitId: data.propertyUnitId
        }
      });
      
      if (existingAttendance) {
        throw new Error(`Ya existe un registro de asistencia para la propiedad ${data.propertyUnitId} en esta asamblea`);
      }
      
      // Registrar asistencia
      const attendance = await prisma.assemblyAttendee.create({
        data: {
          assemblyId,
          userId: data.userId,
          propertyUnitId: data.propertyUnitId,
          coefficient: data.coefficient,
          attendanceType: data.attendanceType as any,
          proxyUserId: data.proxyUserId,
          proxyDocumentUrl: data.proxyDocumentUrl,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent
        }
      });
      
      // Actualizar coeficiente actual y verificar quórum
      await this.updateQuorum(assemblyId);
      
      // Registrar actividad
      await activityLogger.logActivity({
        userId: data.userId,
        action: 'REGISTER_ATTENDANCE',
        resourceType: 'ASSEMBLY',
        resourceId: assemblyId,
        details: {
          attendanceId: attendance.id,
          propertyUnitId: data.propertyUnitId,
          coefficient: data.coefficient
        }
      });
      
      return attendance;
    } catch (error) {
      ServerLogger.error(`Error al registrar asistencia para asamblea ${assemblyId}:`, error);
      throw error;
    }
  }
  
  /**
   * Actualiza el cálculo de quórum para una asamblea
   * 
   * @param assemblyId ID de la asamblea
   */
  async updateQuorum(assemblyId: number) {
    try {
      // Obtener todos los asistentes y sumar coeficientes
      const attendees = await prisma.assemblyAttendee.findMany({
        where: { assemblyId }
      });
      
      const totalCoefficient = attendees.reduce((sum, attendee) => sum + attendee.coefficient, 0);
      
      // Obtener la asamblea actual
      const assembly = await prisma.assembly.findUnique({
        where: { id: assemblyId }
      });
      
      if (!assembly) {
        throw new Error(`Asamblea con ID ${assemblyId} no encontrada`);
      }
      
      // Determinar si se alcanzó el quórum
      const quorumReached = totalCoefficient >= assembly.requiredCoefficient;
      const quorumStatus = quorumReached ? 'REACHED' : 'NOT_REACHED';
      
      // Actualizar la asamblea
      const updatedAssembly = await prisma.assembly.update({
        where: { id: assemblyId },
        data: {
          currentCoefficient: totalCoefficient,
          quorumStatus: quorumStatus as any,
          quorumReachedAt: quorumReached && !assembly.quorumReachedAt ? new Date() : assembly.quorumReachedAt
        }
      });
      
      // Si se acaba de alcanzar el quórum, enviar notificación
      if (quorumReached && (!assembly.quorumReachedAt || assembly.quorumStatus !== 'REACHED')) {
        const quorumPercentage = Math.round((totalCoefficient / assembly.requiredCoefficient) * 100);
        await notifyQuorumReached(assemblyId, quorumPercentage);
        
        // Notificar por WebSocket
        await wsService.broadcast(assembly.realtimeChannel, {
          type: 'QUORUM_REACHED',
          data: {
            assemblyId,
            currentCoefficient: totalCoefficient,
            requiredCoefficient: assembly.requiredCoefficient,
            percentage: quorumPercentage
          }
        });
      }
      
      return {
        currentCoefficient: totalCoefficient,
        requiredCoefficient: assembly.requiredCoefficient,
        quorumStatus,
        quorumReached
      };
    } catch (error) {
      ServerLogger.error(`Error al actualizar quórum para asamblea ${assemblyId}:`, error);
      throw error;
    }
  }
  
  /**
   * Inicia una asamblea si se ha alcanzado el quórum
   * 
   * @param assemblyId ID de la asamblea
   * @param userId ID del usuario que inicia la asamblea
   */
  async startAssembly(assemblyId: number, userId: number) {
    try {
      // Verificar si la asamblea existe y está en estado válido
      const assembly = await prisma.assembly.findUnique({
        where: { id: assemblyId }
      });
      
      if (!assembly) {
        throw new Error(`Asamblea con ID ${assemblyId} no encontrada`);
      }
      
      if (assembly.status !== 'SCHEDULED') {
        throw new Error(`No se puede iniciar una asamblea con estado ${assembly.status}`);
      }
      
      // Verificar si se alcanzó el quórum
      if (assembly.quorumStatus !== 'REACHED') {
        throw new Error('No se puede iniciar la asamblea porque no se ha alcanzado el quórum requerido');
      }
      
      // Actualizar estado de la asamblea
      const updatedAssembly = await prisma.assembly.update({
        where: { id: assemblyId },
        data: {
          status: 'IN_PROGRESS' as any
        }
      });
      
      // Notificar por WebSocket
      await wsService.broadcast(assembly.realtimeChannel, {
        type: 'ASSEMBLY_STARTED',
        data: {
          assemblyId,
          startTime: new Date()
        }
      });
      
      // Registrar actividad
      await activityLogger.logActivity({
        userId,
        action: 'START_ASSEMBLY',
        resourceType: 'ASSEMBLY',
        resourceId: assemblyId,
        details: {
          title: assembly.title,
          quorum: {
            current: assembly.currentCoefficient,
            required: assembly.requiredCoefficient
          }
        }
      });
      
      return updatedAssembly;
    } catch (error) {
      ServerLogger.error(`Error al iniciar asamblea ${assemblyId}:`, error);
      throw error;
    }
  }
  
  /**
   * Crea una nueva votación en tiempo real
   * 
   * @param data Datos de la votación
   * @param userId ID del usuario que crea la votación
   */
  async createVoting(data: {
    assemblyId: number;
    agendaPoint: number;
    title: string;
    description?: string;
    type: string;
    options: string[];
    requiredPercentage?: number;
    baseForPercentage?: string;
  }, userId: number) {
    try {
      // Verificar si la asamblea existe y está en progreso
      const assembly = await prisma.assembly.findUnique({
        where: { id: data.assemblyId }
      });
      
      if (!assembly) {
        throw new Error(`Asamblea con ID ${data.assemblyId} no encontrada`);
      }
      
      if (assembly.status !== 'IN_PROGRESS') {
        throw new Error(`No se puede crear una votación en una asamblea con estado ${assembly.status}`);
      }
      
      // Crear la votación
      const voting = await prisma.voting.create({
        data: {
          assemblyId: data.assemblyId,
          agendaPoint: data.agendaPoint,
          title: data.title,
          description: data.description,
          type: data.type as any,
          options: data.options,
          requiredPercentage: data.requiredPercentage,
          baseForPercentage: data.baseForPercentage,
          status: 'PENDING' as any
        }
      });
      
      // Registrar actividad
      await activityLogger.logActivity({
        userId,
        action: 'CREATE_VOTING',
        resourceType: 'VOTING',
        resourceId: voting.id,
        details: {
          assemblyId: data.assemblyId,
          title: voting.title,
          type: voting.type
        }
      });
      
      return voting;
    } catch (error) {
      ServerLogger.error('Error al crear votación:', error);
      throw error;
    }
  }
  
  /**
   * Inicia una votación en tiempo real
   * 
   * @param votingId ID de la votación
   * @param userId ID del usuario que inicia la votación
   */
  async startVoting(votingId: number, userId: number) {
    try {
      // Verificar si la votación existe y está en estado válido
      const voting = await prisma.voting.findUnique({
        where: { id: votingId },
        include: { assembly: true }
      });
      
      if (!voting) {
        throw new Error(`Votación con ID ${votingId} no encontrada`);
      }
      
      if (voting.status !== 'PENDING') {
        throw new Error(`No se puede iniciar una votación con estado ${voting.status}`);
      }
      
      if (voting.assembly.status !== 'IN_PROGRESS') {
        throw new Error(`No se puede iniciar una votación en una asamblea con estado ${voting.assembly.status}`);
      }
      
      // Actualizar estado de la votación
      const updatedVoting = await prisma.voting.update({
        where: { id: votingId },
        data: {
          status: 'ACTIVE' as any,
          startTime: new Date()
        }
      });
      
      // Notificar por WebSocket
      await wsService.broadcast(voting.assembly.realtimeChannel, {
        type: 'VOTING_STARTED',
        data: {
          votingId,
          assemblyId: voting.assemblyId,
          title: voting.title,
          options: voting.options,
          startTime: updatedVoting.startTime
        }
      });
      
      // Enviar notificaciones
      await notifyVotingOpened(
        voting.assemblyId,
        voting.agendaPoint,
        voting.title
      );
      
      // Registrar actividad
      await activityLogger.logActivity({
        userId,
        action: 'START_VOTING',
        resourceType: 'VOTING',
        resourceId: votingId,
        details: {
          assemblyId: voting.assemblyId,
          title: voting.title
        }
      });
      
      return updatedVoting;
    } catch (error) {
      ServerLogger.error(`Error al iniciar votación ${votingId}:`, error);
      throw error;
    }
  }
  
  /**
   * Emite un voto en una votación activa
   * 
   * @param data Datos del voto
   * @param userId ID del usuario que emite el voto
   */
  async castVote(data: {
    votingId: number;
    attendeeId: number;
    propertyUnitId: number;
    value: string;
    comments?: string;
    ipAddress?: string;
    userAgent?: string;
  }, userId: number) {
    try {
      // Verificar si la votación existe y está activa
      const voting = await prisma.voting.findUnique({
        where: { id: data.votingId },
        include: { assembly: true }
      });
      
      if (!voting) {
        throw new Error(`Votación con ID ${data.votingId} no encontrada`);
      }
      
      if (voting.status !== 'ACTIVE') {
        throw new Error(`No se puede votar en una votación con estado ${voting.status}`);
      }
      
      // Verificar si el usuario está registrado como asistente
      const attendee = await prisma.assemblyAttendee.findUnique({
        where: { id: data.attendeeId }
      });
      
      if (!attendee || attendee.assemblyId !== voting.assemblyId) {
        throw new Error('El usuario no está registrado como asistente en esta asamblea');
      }
      
      // Verificar si ya ha votado
      const existingVote = await prisma.vote.findFirst({
        where: {
          votingId: data.votingId,
          attendeeId: data.attendeeId
        }
      });
      
      if (existingVote) {
        throw new Error('Ya ha emitido un voto en esta votación');
      }
      
      // Verificar que la opción de voto sea válida
      if (!voting.options.includes(data.value)) {
        throw new Error(`Opción de voto "${data.value}" no válida`);
      }
      
      // Registrar el voto
      const vote = await prisma.vote.create({
        data: {
          votingId: data.votingId,
          attendeeId: data.attendeeId,
          userId,
          propertyUnitId: data.propertyUnitId,
          coefficient: attendee.coefficient,
          value: data.value,
          comments: data.comments,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent
        }
      });
      
      // Actualizar contadores de la votación
      await this.updateVotingCounters(data.votingId);
      
      // Notificar por WebSocket (sin revelar el voto específico)
      await wsService.broadcast(voting.assembly.realtimeChannel, {
        type: 'VOTE_CAST',
        data: {
          votingId: data.votingId,
          totalVotes: voting.totalVotes + 1
        }
      });
      
      // Registrar actividad
      await activityLogger.logActivity({
        userId,
        action: 'CAST_VOTE',
        resourceType: 'VOTING',
        resourceId: data.votingId,
        details: {
          assemblyId: voting.assemblyId,
          propertyUnitId: data.propertyUnitId,
          // No incluir el valor del voto para mantener privacidad
        }
      });
      
      return vote;
    } catch (error) {
      ServerLogger.error(`Error al emitir voto en votación ${data.votingId}:`, error);
      throw error;
    }
  }
  
  /**
   * Actualiza los contadores de una votación
   * 
   * @param votingId ID de la votación
   */
  private async updateVotingCounters(votingId: number) {
    try {
      // Obtener todos los votos
      const votes = await prisma.vote.findMany({
        where: { votingId }
      });
      
      // Calcular totales
      const totalVotes = votes.length;
      const totalCoefficientVoted = votes.reduce((sum, vote) => sum + vote.coefficient, 0);
      
      // Calcular resultados por opción
      const result: Record<string, { count: number; coefficient: number }> = {};
      
      votes.forEach(vote => {
        if (!result[vote.value]) {
          result[vote.value] = { count: 0, coefficient: 0 };
        }
        result[vote.value].count++;
        result[vote.value].coefficient += vote.coefficient;
      });
      
      // Actualizar la votación
      await prisma.voting.update({
        where: { id: votingId },
        data: {
          totalVotes,
          totalCoefficientVoted,
          result
        }
      });
      
      return { totalVotes, totalCoefficientVoted, result };
    } catch (error) {
      ServerLogger.error(`Error al actualizar contadores de votación ${votingId}:`, error);
      throw error;
    }
  }
  
  /**
   * Cierra una votación y calcula los resultados finales
   * 
   * @param votingId ID de la votación
   * @param userId ID del usuario que cierra la votación
   */
  async closeVoting(votingId: number, userId: number) {
    try {
      // Verificar si la votación existe y está activa
      const voting = await prisma.voting.findUnique({
        where: { id: votingId },
        include: { assembly: true }
      });
      
      if (!voting) {
        throw new Error(`Votación con ID ${votingId} no encontrada`);
      }
      
      if (voting.status !== 'ACTIVE') {
        throw new Error(`No se puede cerrar una votación con estado ${voting.status}`);
      }
      
      // Actualizar contadores finales
      const counters = await this.updateVotingCounters(votingId);
      
      // Determinar si la votación fue aprobada según su tipo
      let isApproved = false;
      
      switch (voting.type) {
        case 'SIMPLE_MAJORITY':
          // Mayoría simple de los votos emitidos
          if (counters.result['Sí'] && counters.result['No']) {
            isApproved = counters.result['Sí'].count > counters.result['No'].count;
          }
          break;
          
        case 'QUALIFIED_MAJORITY':
          // Mayoría calificada según porcentaje requerido
          if (voting.requiredPercentage && counters.result['Sí']) {
            const baseValue = voting.baseForPercentage === 'TOTAL_COEFFICIENTS' 
              ? voting.assembly.requiredCoefficient 
              : counters.totalCoefficientVoted;
              
            const approvalPercentage = (counters.result['Sí'].coefficient / baseValue) * 100;
            isApproved = approvalPercentage >= voting.requiredPercentage;
          }
          break;
          
        case 'UNANIMOUS':
          // Todos los votos deben ser "Sí"
          isApproved = counters.totalVotes > 0 && 
                      (!counters.result['No'] || counters.result['No'].count === 0);
          break;
          
        case 'COEFFICIENT_BASED':
          // Basado en coeficientes según configuración
          if (counters.result['Sí'] && voting.requiredPercentage) {
            const approvalPercentage = (counters.result['Sí'].coefficient / counters.totalCoefficientVoted) * 100;
            isApproved = approvalPercentage >= voting.requiredPercentage;
          }
          break;
      }
      
      // Actualizar estado de la votación
      const updatedVoting = await prisma.voting.update({
        where: { id: votingId },
        data: {
          status: 'CLOSED' as any,
          endTime: new Date(),
          isApproved
        }
      });
      
      // Notificar por WebSocket
      await wsService.broadcast(voting.assembly.realtimeChannel, {
        type: 'VOTING_CLOSED',
        data: {
          votingId,
          assemblyId: voting.assemblyId,
          result: counters.result,
          isApproved,
          endTime: updatedVoting.endTime
        }
      });
      
      // Enviar notificaciones
      if (counters.result['Sí'] && counters.result['No']) {
        const yesVotes = counters.result['Sí'].count;
        const noVotes = counters.result['No'].count;
        const total = yesVotes + noVotes;
        
        const yesPercentage = Math.round((yesVotes / total) * 100);
        const noPercentage = Math.round((noVotes / total) * 100);
        
        await notifyVotingClosed(
          voting.assemblyId,
          voting.agendaPoint,
          voting.title,
          {
            yesVotes,
            noVotes,
            yesPercentage,
            noPercentage,
            approved: isApproved
          }
        );
      }
      
      // Registrar actividad
      await activityLogger.logActivity({
        userId,
        action: 'CLOSE_VOTING',
        resourceType: 'VOTING',
        resourceId: votingId,
        details: {
          assemblyId: voting.assemblyId,
          title: voting.title,
          result: counters.result,
          isApproved
        }
      });
      
      return {
        ...updatedVoting,
        result: counters.result
      };
    } catch (error) {
      ServerLogger.error(`Error al cerrar votación ${votingId}:`, error);
      throw error;
    }
  }
  
  /**
   * Finaliza una asamblea y prepara la generación del acta
   * 
   * @param assemblyId ID de la asamblea
   * @param userId ID del usuario que finaliza la asamblea
   */
  async endAssembly(assemblyId: number, userId: number) {
    try {
      // Verificar si la asamblea existe y está en progreso
      const assembly = await prisma.assembly.findUnique({
        where: { id: assemblyId }
      });
      
      if (!assembly) {
        throw new Error(`Asamblea con ID ${assemblyId} no encontrada`);
      }
      
      if (assembly.status !== 'IN_PROGRESS') {
        throw new Error(`No se puede finalizar una asamblea con estado ${assembly.status}`);
      }
      
      // Verificar si hay votaciones activas
      const activeVotings = await prisma.voting.count({
        where: {
          assemblyId,
          status: 'ACTIVE'
        }
      });
      
      if (activeVotings > 0) {
        throw new Error('No se puede finalizar la asamblea mientras haya votaciones activas');
      }
      
      // Actualizar estado de la asamblea
      const updatedAssembly = await prisma.assembly.update({
        where: { id: assemblyId },
        data: {
          status: 'COMPLETED' as any,
          endTime: new Date()
        }
      });
      
      // Notificar por WebSocket
      await wsService.broadcast(assembly.realtimeChannel, {
        type: 'ASSEMBLY_ENDED',
        data: {
          assemblyId,
          endTime: updatedAssembly.endTime
        }
      });
      
      // Enviar notificaciones
      await notifyAssemblyEnded(assemblyId, assembly.title);
      
      // Iniciar generación de acta
      await this.initializeMinutes(assemblyId, userId);
      
      // Registrar actividad
      await activityLogger.logActivity({
        userId,
        action: 'END_ASSEMBLY',
        resourceType: 'ASSEMBLY',
        resourceId: assemblyId,
        details: {
          title: assembly.title,
          duration: updatedAssembly.endTime 
            ? Math.round((updatedAssembly.endTime.getTime() - assembly.date.getTime()) / 60000) 
            : null
        }
      });
      
      return updatedAssembly;
    } catch (error) {
      ServerLogger.error(`Error al finalizar asamblea ${assemblyId}:`, error);
      throw error;
    }
  }
  
  /**
   * Inicializa la generación del acta de una asamblea
   * 
   * @param assemblyId ID de la asamblea
   * @param userId ID del usuario que inicia la generación
   */
  async initializeMinutes(assemblyId: number, userId: number) {
    try {
      // Verificar si la asamblea existe y está completada
      const assembly = await prisma.assembly.findUnique({
        where: { id: assemblyId }
      });
      
      if (!assembly) {
        throw new Error(`Asamblea con ID ${assemblyId} no encontrada`);
      }
      
      if (assembly.status !== 'COMPLETED') {
        throw new Error(`No se puede generar acta para una asamblea con estado ${assembly.status}`);
      }
      
      // Verificar si ya existe un acta
      const existingMinutes = await prisma.assemblyMinutes.findUnique({
        where: { assemblyId }
      });
      
      if (existingMinutes) {
        throw new Error(`Ya existe un acta para la asamblea ${assemblyId}`);
      }
      
      // Crear registro de acta
      const minutes = await prisma.assemblyMinutes.create({
        data: {
          assemblyId,
          status: 'GENERATING' as any,
          signaturesRequired: 2 // Por defecto, presidente y secretario
        }
      });
      
      // Iniciar generación asíncrona del acta
      this.generateMinutesContent(minutes.id, userId).catch(error => {
        ServerLogger.error(`Error en generación asíncrona de acta ${minutes.id}:`, error);
      });
      
      // Registrar actividad
      await activityLogger.logActivity({
        userId,
        action: 'INITIALIZE_MINUTES',
        resourceType: 'ASSEMBLY_MINUTES',
        resourceId: minutes.id,
        details: {
          assemblyId,
          status: minutes.status
        }
      });
      
      return minutes;
    } catch (error) {
      ServerLogger.error(`Error al inicializar acta para asamblea ${assemblyId}:`, error);
      throw error;
    }
  }
  
  /**
   * Genera el contenido del acta de forma asíncrona
   * 
   * @param minutesId ID del acta
   * @param userId ID del usuario que inicia la generación
   */
  private async generateMinutesContent(minutesId: number, userId: number) {
    try {
      // Obtener información del acta
      const minutes = await prisma.assemblyMinutes.findUnique({
        where: { id: minutesId },
        include: { assembly: true }
      });
      
      if (!minutes) {
        throw new Error(`Acta con ID ${minutesId} no encontrada`);
      }
      
      // Obtener información completa de la asamblea
      const assembly = await prisma.assembly.findUnique({
        where: { id: minutes.assemblyId }
      });
      
      // Obtener asistentes
      const attendees = await prisma.assemblyAttendee.findMany({
        where: { assemblyId: minutes.assemblyId }
      });
      
      // Obtener votaciones y resultados
      const votings = await prisma.voting.findMany({
        where: { assemblyId: minutes.assemblyId }
      });
      
      // Generar contenido del acta en formato Markdown
      let content = `# Acta de Asamblea: ${assembly.title}\n\n`;
      content += `**Fecha:** ${assembly.date.toLocaleDateString()}\n`;
      content += `**Hora de inicio:** ${assembly.date.toLocaleTimeString()}\n`;
      content += `**Hora de finalización:** ${assembly.endTime ? assembly.endTime.toLocaleTimeString() : 'No registrada'}\n`;
      content += `**Lugar:** ${assembly.location}\n\n`;
      
      content += `## Quórum\n\n`;
      content += `Coeficiente requerido: ${assembly.requiredCoefficient}%\n`;
      content += `Coeficiente presente: ${assembly.currentCoefficient}%\n`;
      content += `Estado del quórum: ${assembly.quorumStatus === 'REACHED' ? 'ALCANZADO' : 'NO ALCANZADO'}\n\n`;
      
      content += `## Asistentes\n\n`;
      content += `Total de asistentes: ${attendees.length}\n\n`;
      content += `| Unidad | Coeficiente | Tipo de Asistencia |\n`;
      content += `|--------|-------------|--------------------|\n`;
      
      // Agregar información de asistentes (se completaría con datos reales)
      attendees.forEach(attendee => {
        content += `| Unidad ${attendee.propertyUnitId} | ${attendee.coefficient}% | ${attendee.attendanceType} |\n`;
      });
      
      content += `\n## Agenda\n\n`;
      
      // Agregar puntos de la agenda
      const agenda = assembly.agenda as any[];
      agenda.forEach((item, index) => {
        content += `### ${index + 1}. ${item.topic}\n\n`;
        
        // Buscar votaciones relacionadas con este punto
        const pointVotings = votings.filter(v => v.agendaPoint === index + 1);
        
        if (pointVotings.length > 0) {
          content += `**Votaciones:**\n\n`;
          
          pointVotings.forEach(voting => {
            content += `#### ${voting.title}\n\n`;
            content += `${voting.description || ''}\n\n`;
            content += `**Tipo de votación:** ${voting.type}\n`;
            content += `**Estado:** ${voting.status}\n`;
            
            if (voting.status === 'CLOSED') {
              content += `**Resultado:** ${voting.isApproved ? 'APROBADO' : 'NO APROBADO'}\n\n`;
              
              const result = voting.result as any;
              if (result) {
                content += `| Opción | Votos | Coeficiente |\n`;
                content += `|--------|-------|-------------|\n`;
                
                Object.entries(result).forEach(([option, data]: [string, any]) => {
                  content += `| ${option} | ${data.count} | ${data.coefficient}% |\n`;
                });
              }
            }
            
            content += `\n`;
          });
        }
        
        content += `\n`;
      });
      
      content += `## Firmas\n\n`;
      content += `Este documento requiere la firma digital del presidente y secretario de la asamblea.\n\n`;
      
      // Actualizar el acta con el contenido generado
      await prisma.assemblyMinutes.update({
        where: { id: minutesId },
        data: {
          content,
          status: 'GENERATED' as any,
          generatedAt: new Date()
        }
      });
      
      // Generar PDF
      const pdfResult = await this.generateMinutesPdf(minutesId);
      
      // Registrar actividad
      await activityLogger.logActivity({
        userId,
        action: 'GENERATE_MINUTES_CONTENT',
        resourceType: 'ASSEMBLY_MINUTES',
        resourceId: minutesId,
        details: {
          assemblyId: minutes.assemblyId,
          pdfUrl: pdfResult.pdfUrl
        }
      });
      
      // Notificar disponibilidad del acta
      await notifyMinutesAvailable(minutes.assemblyId, assembly.title);
      
      return { success: true, minutesId, pdfUrl: pdfResult.pdfUrl };
    } catch (error) {
      // Actualizar estado en caso de error
      await prisma.assemblyMinutes.update({
        where: { id: minutesId },
        data: {
          status: 'FAILED' as any,
          generationLog: `Error: ${error.message}`
        }
      });
      
      ServerLogger.error(`Error al generar contenido de acta ${minutesId}:`, error);
      throw error;
    }
  }
  
  /**
   * Genera el PDF del acta
   * 
   * @param minutesId ID del acta
   */
  private async generateMinutesPdf(minutesId: number) {
    try {
      // Obtener información del acta
      const minutes = await prisma.assemblyMinutes.findUnique({
        where: { id: minutesId },
        include: { assembly: true }
      });
      
      if (!minutes || !minutes.content) {
        throw new Error(`Acta con ID ${minutesId} no encontrada o sin contenido`);
      }
      
      // Generar nombre de archivo
      const fileName = `acta_asamblea_${minutes.assemblyId}_${Date.now()}.pdf`;
      const filePath = `/tmp/${fileName}`;
      
      // Generar PDF
      await generatePdf({
        content: minutes.content,
        outputPath: filePath,
        title: `Acta de Asamblea: ${minutes.assembly.title}`,
        author: 'Sistema Armonía',
        subject: `Acta de la asamblea realizada el ${minutes.assembly.date.toLocaleDateString()}`,
        keywords: ['acta', 'asamblea', 'condominio', 'votación']
      });
      
      // Simular URL de almacenamiento (en producción sería S3 u otro servicio)
      const pdfUrl = `/api/documents/assemblies/${minutes.assemblyId}/minutes/${fileName}`;
      
      // Actualizar acta con URL del PDF
      await prisma.assemblyMinutes.update({
        where: { id: minutesId },
        data: {
          pdfUrl,
          status: 'SIGNING' as any
        }
      });
      
      return { success: true, pdfUrl };
    } catch (error) {
      ServerLogger.error(`Error al generar PDF de acta ${minutesId}:`, error);
      throw error;
    }
  }
  
  /**
   * Registra firmantes requeridos para el acta
   * 
   * @param minutesId ID del acta
   * @param signers Lista de firmantes
   * @param userId ID del usuario que registra los firmantes
   */
  async registerRequiredSigners(minutesId: number, signers: Array<{
    userId: number;
    name: string;
    role: string;
  }>, userId: number) {
    try {
      // Verificar si el acta existe y está en estado válido
      const minutes = await prisma.assemblyMinutes.findUnique({
        where: { id: minutesId }
      });
      
      if (!minutes) {
        throw new Error(`Acta con ID ${minutesId} no encontrada`);
      }
      
      if (minutes.status !== 'GENERATED' && minutes.status !== 'SIGNING') {
        throw new Error(`No se pueden registrar firmantes para un acta con estado ${minutes.status}`);
      }
      
      // Registrar cada firmante
      const signatures = [];
      
      for (const signer of signers) {
        const signature = await prisma.digitalSignature.create({
          data: {
            minutesId,
            signerUserId: signer.userId,
            signerName: signer.name,
            signerRole: signer.role,
            status: 'PENDING' as any
          }
        });
        
        signatures.push(signature);
      }
      
      // Actualizar número de firmas requeridas
      await prisma.assemblyMinutes.update({
        where: { id: minutesId },
        data: {
          signaturesRequired: signers.length,
          status: 'SIGNING' as any
        }
      });
      
      // Registrar actividad
      await activityLogger.logActivity({
        userId,
        action: 'REGISTER_REQUIRED_SIGNERS',
        resourceType: 'ASSEMBLY_MINUTES',
        resourceId: minutesId,
        details: {
          signers: signers.map(s => ({ userId: s.userId, role: s.role }))
        }
      });
      
      return signatures;
    } catch (error) {
      ServerLogger.error(`Error al registrar firmantes para acta ${minutesId}:`, error);
      throw error;
    }
  }
  
  /**
   * Firma digitalmente un acta
   * 
   * @param signatureId ID de la firma
   * @param userId ID del usuario que firma
   * @param data Datos adicionales de la firma
   */
  async signMinutes(signatureId: number, userId: number, data: {
    ipAddress?: string;
    userAgent?: string;
  }) {
    try {
      // Verificar si la firma existe
      const signature = await prisma.digitalSignature.findUnique({
        where: { id: signatureId },
        include: { minutes: true }
      });
      
      if (!signature) {
        throw new Error(`Firma con ID ${signatureId} no encontrada`);
      }
      
      if (signature.signerUserId !== userId) {
        throw new Error('No está autorizado para firmar este documento');
      }
      
      if (signature.status !== 'PENDING') {
        throw new Error(`No se puede firmar un documento con estado de firma ${signature.status}`);
      }
      
      // Generar datos de firma digital
      const signatureData = await signatureService.generateSignature({
        documentId: signature.minutes.pdfUrl,
        userId,
        role: signature.signerRole,
        timestamp: new Date()
      });
      
      // Actualizar firma
      const updatedSignature = await prisma.digitalSignature.update({
        where: { id: signatureId },
        data: {
          status: 'SIGNED' as any,
          signedAt: new Date(),
          signatureData: JSON.stringify(signatureData),
          ipAddress: data.ipAddress,
          userAgent: data.userAgent
        }
      });
      
      // Actualizar contador de firmas completadas
      const minutes = await prisma.assemblyMinutes.update({
        where: { id: signature.minutesId },
        data: {
          signaturesCompleted: {
            increment: 1
          }
        }
      });
      
      // Verificar si se completaron todas las firmas
      if (minutes.signaturesCompleted >= minutes.signaturesRequired) {
        await this.finalizeSignedMinutes(signature.minutesId, userId);
      }
      
      // Registrar actividad
      await activityLogger.logActivity({
        userId,
        action: 'SIGN_MINUTES',
        resourceType: 'DIGITAL_SIGNATURE',
        resourceId: signatureId,
        details: {
          minutesId: signature.minutesId,
          role: signature.signerRole
        }
      });
      
      return updatedSignature;
    } catch (error) {
      ServerLogger.error(`Error al firmar acta (firma ${signatureId}):`, error);
      throw error;
    }
  }
  
  /**
   * Finaliza el proceso de firma de un acta
   * 
   * @param minutesId ID del acta
   * @param userId ID del usuario que finaliza el proceso
   */
  private async finalizeSignedMinutes(minutesId: number, userId: number) {
    try {
      // Obtener información del acta
      const minutes = await prisma.assemblyMinutes.findUnique({
        where: { id: minutesId },
        include: {
          assembly: true,
          signatures: true
        }
      });
      
      if (!minutes) {
        throw new Error(`Acta con ID ${minutesId} no encontrada`);
      }
      
      // Verificar que todas las firmas estén completadas
      const pendingSignatures = minutes.signatures.filter(s => s.status !== 'SIGNED');
      
      if (pendingSignatures.length > 0) {
        throw new Error('No se puede finalizar el acta porque hay firmas pendientes');
      }
      
      // Generar PDF final con firmas
      const signedPdfUrl = await signatureService.generateSignedPdf(
        minutes.pdfUrl,
        minutes.signatures.map(s => ({
          id: s.id,
          name: s.signerName,
          role: s.signerRole,
          timestamp: s.signedAt,
          data: s.signatureData
        }))
      );
      
      // Actualizar acta
      const updatedMinutes = await prisma.assemblyMinutes.update({
        where: { id: minutesId },
        data: {
          status: 'SIGNED' as any,
          signedPdfUrl
        }
      });
      
      // Notificar por WebSocket
      await wsService.broadcast(`assembly-${minutes.assemblyId}`, {
        type: 'MINUTES_SIGNED',
        data: {
          assemblyId: minutes.assemblyId,
          minutesId,
          signedPdfUrl
        }
      });
      
      // Registrar actividad
      await activityLogger.logActivity({
        userId,
        action: 'FINALIZE_SIGNED_MINUTES',
        resourceType: 'ASSEMBLY_MINUTES',
        resourceId: minutesId,
        details: {
          assemblyId: minutes.assemblyId,
          signedPdfUrl
        }
      });
      
      return updatedMinutes;
    } catch (error) {
      ServerLogger.error(`Error al finalizar acta firmada ${minutesId}:`, error);
      throw error;
    }
  }
}

export default AssemblyAdvancedService;
