/**
 * Servicio Avanzado de Asambleas para la aplicación Armonía
 * Proporciona funcionalidades avanzadas para gestión de asambleas
 */

import { ServerLogger } from '../lib/logging/server-logger';
import { PrismaClient } from '@prisma/client';
import * as notificationService from '../lib/services/notification-service';
import * as websocketService from '../communications/websocket-service';
import { ASSEMBLY_STATUS } from '../lib/constants';

const logger = ServerLogger;

/**
 * Clase que gestiona funcionalidades avanzadas de asambleas
 */
export class AssemblyAdvancedService {
  private prisma: PrismaClient;
  private schemaName: string;

  /**
   * Constructor del servicio
   * @param schemaName - Nombre del esquema/comunidad
   */
  constructor(schemaName: string) {
    if (!schemaName) {
      throw new Error('Se requiere un nombre de esquema para el servicio avanzado de asambleas');
    }
    
    this.schemaName = schemaName;
    this.prisma = new PrismaClient({
      datasources: {
        db: {
          url: `${process.env.DATABASE_URL}?schema=${schemaName}`
        }
      }
    });
    
    logger.info(`Servicio avanzado de asambleas inicializado para esquema: ${schemaName}`);
  }
  
  /**
   * Calcula el quórum de una asamblea
   * @param assemblyId - ID de la asamblea
   * @returns Información de quórum
   */
  async calculateQuorum(assemblyId: number): Promise<any> {
    try {
      if (!assemblyId) {
        throw new Error('Se requiere un ID de asamblea para calcular quórum');
      }
      
      // Obtener la asamblea
      const assembly = await this.prisma.assembly.findUnique({
        where: { id: assemblyId },
        include: {
          attendees: true,
          property: {
            include: {
              units: true
            }
          }
        }
      });
      
      if (!assembly) {
        logger.warn(`Asamblea no encontrada: ${assemblyId}`);
        return null;
      }
      
      // Calcular coeficientes totales
      const totalCoefficients = assembly.property.units.reduce((sum: number, unit: any) => sum + (unit.coefficient || 0), 0);
      
      // Calcular coeficientes presentes
      const presentCoefficients = assembly.attendees.reduce((sum: number, attendee: any) => {
        const unit = assembly.property.units.find((u: any) => u.id === attendee.unitId);
        return sum + (unit ? unit.coefficient || 0 : 0);
      }, 0);
      
      // Calcular porcentaje de quórum
      const quorumPercentage = totalCoefficients > 0 ? (presentCoefficients / totalCoefficients) * 100 : 0;
      
      // Determinar si se alcanza el quórum requerido
      const requiredQuorum = assembly.requiredQuorum || 50; // Por defecto 50%
      const quorumReached = quorumPercentage >= requiredQuorum;
      
      const result = {
        assemblyId,
        totalUnits: assembly.property.units.length,
        presentUnits: assembly.attendees.length,
        totalCoefficients,
        presentCoefficients,
        quorumPercentage,
        requiredQuorum,
        quorumReached,
        timestamp: new Date().toISOString()
      };
      
      logger.info(`Quórum calculado para asamblea ${assemblyId}: ${quorumPercentage.toFixed(2)}% (requerido: ${requiredQuorum}%)`);
      return result;
    } catch (error: any) {
      logger.error(`Error al calcular quórum para asamblea ${assemblyId}: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Registra la asistencia de un residente a una asamblea
   * @param assemblyId - ID de la asamblea
   * @param userId - ID del usuario
   * @param unitId - ID de la unidad
   * @param options - Opciones adicionales
   * @returns Registro de asistencia
   */
  async registerAttendance(assemblyId: number, userId: number, unitId: number, options: any = {}): Promise<any> {
    try {
      if (!assemblyId || !userId || !unitId) {
        throw new Error('Se requieren ID de asamblea, usuario y unidad para registrar asistencia');
      }
      
      // Verificar que la asamblea existe y está en progreso
      const assembly = await this.prisma.assembly.findUnique({
        where: { id: assemblyId }
      });
      
      if (!assembly) {
        logger.warn(`Asamblea no encontrada: ${assemblyId}`);
        throw new Error('Asamblea no encontrada');
      }
      
      if (assembly.status !== ASSEMBLY_STATUS.IN_PROGRESS) {
        logger.warn(`Intento de registro en asamblea no activa: ${assemblyId} (estado: ${assembly.status})`);
        throw new Error(`La asamblea no está en progreso (estado actual: ${assembly.status})`);
      }
      
      // Verificar que el usuario tiene derecho a asistir (propietario o delegado)
      const unit = await this.prisma.unit.findUnique({
        where: { id: unitId },
        include: {
          owners: true,
          delegates: true
        }
      });
      
      if (!unit) {
        logger.warn(`Unidad no encontrada: ${unitId}`);
        throw new Error('Unidad no encontrada');
      }
      
      const isOwner = unit.owners.some((owner: any) => owner.id === userId);
      const isDelegate = unit.delegates.some((delegate: any) => delegate.id === userId);
      
      if (!isOwner && !isDelegate && !options.override) {
        logger.warn(`Usuario ${userId} no autorizado para asistir por unidad ${unitId}`);
        throw new Error('Usuario no autorizado para asistir por esta unidad');
      }
      
      // Verificar si ya existe un registro de asistencia
      const existingAttendance = await this.prisma.assemblyAttendance.findFirst({
        where: {
          assemblyId,
          unitId
        }
      });
      
      if (existingAttendance) {
        logger.warn(`Ya existe registro de asistencia para unidad ${unitId} en asamblea ${assemblyId}`);
        
        // Actualizar el registro existente si es necesario
        if (existingAttendance.userId !== userId || options.updateExisting) {
          const updatedAttendance = await this.prisma.assemblyAttendance.update({
            where: { id: existingAttendance.id },
            data: {
              userId,
              checkInTime: options.checkInTime || new Date(),
              notes: options.notes || existingAttendance.notes,
              updatedAt: new Date()
            }
          });
          
          logger.info(`Registro de asistencia actualizado para unidad ${unitId} en asamblea ${assemblyId}`);
          
          // Notificar actualización
          this.notifyAttendanceChange(assembly, updatedAttendance, 'updated');
          
          return updatedAttendance;
        }
        
        return existingAttendance;
      }
      
      // Crear nuevo registro de asistencia
      const attendance = await this.prisma.assemblyAttendance.create({
        data: {
          assemblyId,
          userId,
          unitId,
          checkInTime: options.checkInTime || new Date(),
          notes: options.notes || '',
          proxyName: options.proxyName || null,
          proxyDocument: options.proxyDocument || null,
          isDelegate: isDelegate,
          isOwner: isOwner
        }
      });
      
      logger.info(`Registrada asistencia para unidad ${unitId} en asamblea ${assemblyId}`);
      
      // Notificar nuevo registro
      this.notifyAttendanceChange(assembly, attendance, 'registered');
      
      // Recalcular quórum
      const quorum = await this.calculateQuorum(assemblyId);
      
      // Notificar cambio de quórum
      this.broadcastQuorumUpdate(assemblyId, quorum);
      
      return attendance;
    } catch (error: any) {
      logger.error(`Error al registrar asistencia: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Notifica cambios en la asistencia
   * @param assembly - Datos de la asamblea
   * @param attendance - Registro de asistencia
   * @param action - Acción realizada
   * @private
   */
  async notifyAttendanceChange(assembly: any, attendance: any, action: string): Promise<void> {
    try {
      // Obtener datos del usuario y unidad
      const user = await this.prisma.user.findUnique({
        where: { id: attendance.userId }
      });
      
      const unit = await this.prisma.unit.findUnique({
        where: { id: attendance.unitId }
      });
      
      if (!user || !unit) {
        logger.warn('No se pudo notificar cambio de asistencia: usuario o unidad no encontrados');
        return;
      }
      
      // Notificar a administradores
      const admins = await this.prisma.user.findMany({
        where: {
          role: 'ADMIN',
          schemaName: this.schemaName
        }
      });
      
      for (const admin of admins) {
        websocketService.sendToClient(
          this.schemaName,
          admin.id,
          {
            type: 'ASSEMBLY_ATTENDANCE',
            action,
            assemblyId: assembly.id,
            assemblyTitle: assembly.title,
            attendanceId: attendance.id,
            unitId: unit.id,
            unitName: unit.name,
            userName: `${user.firstName} ${user.lastName}`,
            timestamp: new Date().toISOString()
          }
        );
      }
    } catch (error: any) {
      logger.error(`Error al notificar cambio de asistencia: ${error.message}`);
    }
  }
  
  /**
   * Transmite actualización de quórum a todos los participantes
   * @param assemblyId - ID de la asamblea
   * @param quorumData - Datos de quórum
   * @private
   */
  async broadcastQuorumUpdate(assemblyId: number, quorumData: any): Promise<void> {
    try {
      websocketService.broadcastToSchema(
        this.schemaName,
        {
          type: 'ASSEMBLY_QUORUM_UPDATE',
          assemblyId,
          quorum: quorumData,
          timestamp: new Date().toISOString()
        }
      );
      
      logger.info(`Actualización de quórum transmitida para asamblea ${assemblyId}`);
    } catch (error: any) {
      logger.error(`Error al transmitir actualización de quórum: ${error.message}`);
    }
  }
  
  /**
   * Crea una votación para una asamblea
   * @param assemblyId - ID de la asamblea
   * @param voteData - Datos de la votación
   * @returns Votación creada
   */
  async createVote(assemblyId: number, voteData: any): Promise<any> {
    try {
      if (!assemblyId) {
        throw new Error('Se requiere un ID de asamblea para crear votación');
      }
      
      if (!voteData || !voteData.title || !voteData.description) {
        throw new Error('Datos de votación incompletos');
      }
      
      // Verificar que la asamblea existe y está en progreso
      const assembly = await this.prisma.assembly.findUnique({
        where: { id: assemblyId }
      });
      
      if (!assembly) {
        logger.warn(`Asamblea no encontrada: ${assemblyId}`);
        throw new Error('Asamblea no encontrada');
      }
      
      if (assembly.status !== ASSEMBLY_STATUS.IN_PROGRESS) {
        logger.warn(`Intento de crear votación en asamblea no activa: ${assemblyId} (estado: ${assembly.status})`);
        throw new Error(`La asamblea no está en progreso (estado actual: ${assembly.status})`);
      }
      
      // Crear la votación
      const vote = await this.prisma.assemblyVote.create({
        data: {
          assemblyId,
          title: voteData.title,
          description: voteData.description,
          options: voteData.options || ['A favor', 'En contra', 'Abstención'],
          startTime: voteData.startTime || new Date(),
          endTime: voteData.endTime || null,
          status: 'ACTIVE',
          weightedVoting: voteData.weightedVoting !== undefined ? voteData.weightedVoting : true,
          createdBy: voteData.createdBy || 'system'
        }
      });
      
      logger.info(`Creada votación ${vote.id} para asamblea ${assemblyId}`);
      
      // Notificar a todos los participantes
      this.broadcastVoteCreation(vote, assembly);
      
      return vote;
    } catch (error: any) {
      logger.error(`Error al crear votación: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Transmite creación de votación a todos los participantes
   * @param vote - Datos de la votación
   * @param assembly - Datos de la asamblea
   * @private
   */
  async broadcastVoteCreation(vote: any, assembly: any): Promise<void> {
    try {
      websocketService.broadcastToSchema(
        this.schemaName,
        {
          type: 'ASSEMBLY_VOTE_CREATED',
          voteId: vote.id,
          voteTitle: vote.title,
          assemblyId: assembly.id,
          voteOptions: vote.options,
          startTime: vote.startTime,
          endTime: vote.endTime,
          timestamp: new Date().toISOString()
        }
      );
      
      logger.info(`Notificación de nueva votación transmitida para asamblea ${assembly.id}`);
    } catch (error: any) {
      logger.error(`Error al transmitir creación de votación: ${error.message}`);
    }
  }
  
  /**
   * Registra un voto en una votación
   * @param voteId - ID de la votación
   * @param userId - ID del usuario
   * @param unitId - ID de la unidad
   * @param option - Opción seleccionada
   * @returns Registro de voto
   */
  async castVote(voteId: number, userId: number, unitId: number, option: string): Promise<any> {
    try {
      if (!voteId || !userId || !unitId || !option) {
        throw new Error('Se requieren ID de votación, usuario, unidad y opción para registrar voto');
      }
      
      // Verificar que la votación existe y está activa
      const vote = await this.prisma.assemblyVote.findUnique({
        where: { id: voteId },
        include: {
          assembly: true
        }
      });
      
      if (!vote) {
        logger.warn(`Votación no encontrada: ${voteId}`);
        throw new Error('Votación no encontrada');
      }
      
      if (vote.status !== 'ACTIVE') {
        logger.warn(`Intento de votar en votación no activa: ${voteId} (estado: ${vote.status})`);
        throw new Error(`La votación no está activa (estado actual: ${vote.status})`);
      }
      
      // Verificar que la opción es válida
      if (!vote.options.includes(option)) {
        logger.warn(`Opción de voto inválida: ${option}`);
        throw new Error('Opción de voto inválida');
      }
      
      // Verificar que el usuario tiene derecho a votar (asistente registrado)
      const attendance = await this.prisma.assemblyAttendance.findFirst({
        where: {
          assemblyId: vote.assemblyId,
          unitId,
          userId
        }
      });
      
      if (!attendance) {
        logger.warn(`Usuario ${userId} no registrado como asistente para unidad ${unitId}`);
        throw new Error('Usuario no registrado como asistente para esta unidad');
      }
      
      // Verificar si ya existe un voto para esta unidad
      const existingVote = await this.prisma.assemblyVoteRecord.findFirst({
        where: {
          voteId,
          unitId
        }
      });
      
      if (existingVote) {
        logger.warn(`Ya existe un voto para unidad ${unitId} en votación ${voteId}`);
        
        // Actualizar el voto existente
        const updatedVote = await this.prisma.assemblyVoteRecord.update({
          where: { id: existingVote.id },
          data: {
            userId,
            option,
            updatedAt: new Date()
          }
        });
        
        logger.info(`Voto actualizado para unidad ${unitId} en votación ${voteId}`);
        
        // Notificar actualización
        this.notifyVoteChange(vote, updatedVote, 'updated');
        
        return updatedVote;
      }
      
      // Obtener coeficiente de la unidad si es votación ponderada
      let coefficient = 1;
      
      if (vote.weightedVoting) {
        const unit = await this.prisma.unit.findUnique({
          where: { id: unitId }
        });
        
        coefficient = unit ? (unit.coefficient || 1) : 1;
      }
      
      // Crear nuevo registro de voto
      const voteRecord = await this.prisma.assemblyVoteRecord.create({
        data: {
          voteId,
          userId,
          unitId,
          option,
          coefficient,
          timestamp: new Date()
        }
      });
      
      logger.info(`Registrado voto para unidad ${unitId} en votación ${voteId}`);
      
      // Notificar nuevo voto
      this.notifyVoteChange(vote, voteRecord, 'cast');
      
      // Actualizar resultados
      const results = await this.calculateVoteResults(voteId);
      
      // Transmitir actualización de resultados
      this.broadcastVoteResults(voteId, results);
      
      return voteRecord;
    } catch (error: any) {
      logger.error(`Error al registrar voto: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Notifica cambios en los votos
   * @param vote - Datos de la votación
   * @param voteRecord - Registro de voto
   * @param action - Acción realizada
   * @private
   */
  async notifyVoteChange(vote: any, voteRecord: any, action: string): Promise<void> {
    try {
      // Obtener datos del usuario y unidad
      const user = await this.prisma.user.findUnique({
        where: { id: voteRecord.userId }
      });
      
      const unit = await this.prisma.unit.findUnique({
        where: { id: voteRecord.unitId }
      });
      
      if (!user || !unit) {
        logger.warn('No se pudo notificar cambio de voto: usuario o unidad no encontrados');
        return;
      }
      
      // Notificar a administradores
      const admins = await this.prisma.user.findMany({
        where: {
          role: 'ADMIN',
          schemaName: this.schemaName
        }
      });
      
      for (const admin of admins) {
        websocketService.sendToClient(
          this.schemaName,
          admin.id,
          {
            type: 'ASSEMBLY_VOTE_RECORD',
            action,
            voteId: vote.id,
            voteTitle: vote.title,
            assemblyId: vote.assemblyId,
            unitId: unit.id,
            unitName: unit.name,
            userName: `${user.firstName} ${user.lastName}`,
            option: voteRecord.option,
            timestamp: new Date().toISOString()
          }
        );
      }
    } catch (error: any) {
      logger.error(`Error al notificar cambio de voto: ${error.message}`);
    }
  }
  
  /**
   * Calcula los resultados de una votación
   * @param voteId - ID de la votación
   * @returns Resultados de la votación
   */
  async calculateVoteResults(voteId: number): Promise<any> {
    try {
      if (!voteId) {
        throw new Error('Se requiere un ID de votación para calcular resultados');
      }
      
      // Obtener la votación
      const vote = await this.prisma.assemblyVote.findUnique({
        where: { id: voteId }
      });
      
      if (!vote) {
        logger.warn(`Votación no encontrada: ${voteId}`);
        return null;
      }
      
      // Obtener todos los votos
      const voteRecords = await this.prisma.assemblyVoteRecord.findMany({
        where: { voteId }
      });
      
      // Inicializar resultados
      const results: any = {
        voteId,
        title: vote.title,
        totalVotes: voteRecords.length,
        totalWeight: 0,
        options: {},
        timestamp: new Date().toISOString()
      };
      
      // Inicializar contadores para cada opción
      vote.options.forEach((option: string) => {
        results.options[option] = {
          count: 0,
          weight: 0,
          percentage: 0
        };
      });
      
      // Contar votos
      voteRecords.forEach((record: any) => {
        const option = record.option;
        if (results.options[option]) {
          results.options[option].count++;
          results.options[option].weight += record.coefficient || 1;
          results.totalWeight += record.coefficient || 1;
        }
      });
      
      // Calcular porcentajes
      if (results.totalWeight > 0) {
        Object.keys(results.options).forEach((option: string) => {
          results.options[option].percentage = (results.options[option].weight / results.totalWeight) * 100;
        });
      }
      
      logger.info(`Resultados calculados para votación ${voteId}`);
      return results;
    } catch (error: any) {
      logger.error(`Error al calcular resultados de votación ${voteId}: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Transmite resultados de votación a todos los participantes
   * @param vote - Datos de la votación
   * @param results - Resultados de la votación
   * @private
   */
  async broadcastVoteResults(vote: any, results: any): Promise<void> {
    try {
      websocketService.broadcastToSchema(
        this.schemaName,
        {
          type: 'ASSEMBLY_VOTE_RESULTS',
          voteId,
          results,
          timestamp: new Date().toISOString()
        }
      );
      
      logger.info(`Resultados de votación transmitidos para votación ${voteId}`);
    } catch (error: any) {
      logger.error(`Error al transmitir resultados de votación: ${error.message}`);
    }
  }
  
  /**
   * Finaliza una votación
   * @param voteId - ID de la votación
   * @returns Votación actualizada
   */
  async endVote(voteId: number): Promise<any> {
    try {
      if (!voteId) {
        throw new Error('Se requiere un ID de votación para finalizar');
      }
      
      // Verificar que la votación existe y está activa
      const vote = await this.prisma.assemblyVote.findUnique({
        where: { id: voteId }
      });
      
      if (!vote) {
        logger.warn(`Votación no encontrada: ${voteId}`);
        throw new Error('Votación no encontrada');
      }
      
      if (vote.status !== 'ACTIVE') {
        logger.warn(`Intento de finalizar votación no activa: ${voteId} (estado: ${vote.status})`);
        return vote;
      }
      
      // Actualizar la votación
      const updatedVote = await this.prisma.assemblyVote.update({
        where: { id: voteId },
        data: {
          status: 'COMPLETED',
          endTime: new Date()
        }
      });
      
      logger.info(`Finalizada votación ${voteId}`);
      
      // Calcular resultados finales
      const results = await this.calculateVoteResults(voteId);
      
      // Guardar resultados
      await this.prisma.assemblyVote.update({
        where: { id: voteId },
        data: {
          results: results
        }
      });
      
      // Transmitir finalización y resultados
      this.broadcastVoteEnd(updatedVote, results);
      
      return {
        vote: updatedVote,
        results
      };
    } catch (error: any) {
      logger.error(`Error al finalizar votación ${voteId}: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Transmite finalización de votación a todos los participantes
   * @param vote - Datos de la votación
   * @param results - Resultados de la votación
   * @private
   */
  async broadcastVoteEnd(vote: any, results: any): Promise<void> {
    try {
      websocketService.broadcastToSchema(
        this.schemaName,
        {
          type: 'ASSEMBLY_VOTE_ENDED',
          voteId: vote.id,
          voteTitle: vote.title,
          assemblyId: vote.assemblyId,
          results,
          timestamp: new Date().toISOString()
        }
      );
      
      logger.info(`Finalización de votación transmitida para votación ${vote.id}`);
    } catch (error: any) {
      logger.error(`Error al transmitir finalización de votación: ${error.message}`);
    }
  }
  
  /**
   * Genera el acta de una asamblea
   * @param assemblyId - ID de la asamblea
   * @returns Datos del acta generada
   */
  async generateMinutes(assemblyId: number): Promise<any> {
    try {
      if (!assemblyId) {
        throw new Error('Se requiere un ID de asamblea para generar acta');
      }
      
      // Obtener la asamblea con todos los datos relacionados
      const assembly = await this.prisma.assembly.findUnique({
        where: { id: assemblyId },
        include: {
          property: true,
          attendees: {
            include: {
              user: true,
              unit: true
            }
          },
          votes: {
            include: {
              voteRecords: true
            }
          },
          topics: true
        }
      });
      
      if (!assembly) {
        logger.warn(`Asamblea no encontrada: ${assemblyId}`);
        throw new Error('Asamblea no encontrada');
      }
      
      // Calcular quórum final
      const quorum = await this.calculateQuorum(assemblyId);
      
      // Preparar datos para el acta
      const minutesData = {
        assemblyId,
        title: `Acta de Asamblea: ${assembly.title}`,
        date: assembly.date,
        location: assembly.location,
        property: assembly.property.name,
        quorum: quorum,
        attendees: assembly.attendees.map((a: any) => ({
          name: `${a.user.firstName} ${a.user.lastName}`,
          unit: a.unit.name,
          coefficient: a.unit.coefficient || 0,
          checkInTime: a.checkInTime
        })),
        topics: assembly.topics.map((t: any) => ({
          title: t.title,
          description: t.description,
          decisions: t.decisions || 'Sin decisiones registradas'
        })),
        votes: assembly.votes.map((v: any) => {
          // Calcular resultados de cada votación
          const results: any = {};
          v.options.forEach((option: string) => {
            results[option] = {
              count: 0,
              weight: 0
            };
          });
          
          v.voteRecords.forEach((record: any) => {
            if (results[record.option]) {
              results[record.option].count++;
              results[record.option].weight += record.coefficient || 1;
            }
          });
          
          return {
            title: v.title,
            description: v.description,
            options: v.options,
            results,
            startTime: v.startTime,
            endTime: v.endTime || new Date()
          };
        }),
        conclusions: assembly.conclusions || 'Sin conclusiones registradas',
        generatedAt: new Date().toISOString()
      };
      
      // Crear registro del acta en la base de datos
      const minutes = await this.prisma.assemblyMinutes.create({
        data: {
          assemblyId,
          content: minutesData,
          generatedBy: 'system',
          status: 'DRAFT'
        }
      });
      
      logger.info(`Acta generada para asamblea ${assemblyId}: ${minutes.id}`);
      
      return {
        minutesId: minutes.id,
        data: minutesData
      };
    } catch (error: any) {
      logger.error(`Error al generar acta para asamblea ${assemblyId}: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Cierra la conexión a la base de datos
   */
  async disconnect(): Promise<void> {
    try {
      await this.prisma.$disconnect();
      logger.info('Conexión a base de datos cerrada');
    } catch (error: any) {
      logger.error(`Error al cerrar conexión a base de datos: ${error.message}`);
    }
  }
}