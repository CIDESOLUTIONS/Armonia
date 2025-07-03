/**
 * Integraciones del sistema de comunicaciones con el módulo de asambleas
 * 
 * Este archivo proporciona funciones para enviar notificaciones automáticas
 * relacionadas con eventos del módulo de asambleas.
 */

import { notifyUser, notifyByRole, NotificationType, NotificationPriority } from '@/lib/communications/notification-service';
import { getPrisma } from '@/lib/prisma';

const prisma = getPrisma();

/**
 * Envía notificación de convocatoria a asamblea
 */
export async function notifyAssemblyConvocation(assemblyId: number, title: string, date: Date, location: string) {
  try {
    // Obtener información de la asamblea
    const assembly = await prisma.assembly.findUnique({
      where: { id: assemblyId }
    });
    
    if (!assembly) {
      throw new Error(`Asamblea con ID ${assemblyId} no encontrada`);
    }
    
    // Notificar a todos los residentes
    await notifyByRole('resident', {
      type: 'info',
      title: `Convocatoria: ${title}`,
      message: `Se ha convocado una asamblea para el ${date.toLocaleDateString()} en ${location}. Por favor confirme su asistencia.`,
      priority: 'high',
      requireConfirmation: true,
      link: `/resident/assemblies/${assemblyId}`,
      data: {
        assemblyId,
        date: date.toISOString(),
        location
      }
    });
    
    return true;
  } catch (error) {
    console.error('Error al enviar notificación de convocatoria:', error);
    throw error;
  }
}

/**
 * Envía notificación de quórum alcanzado
 */
export async function notifyQuorumReached(assemblyId: number, percentage: number) {
  try {
    // Notificar a administradores
    await notifyByRole('admin', {
      type: 'success',
      title: 'Quórum alcanzado',
      message: `Se ha alcanzado el quórum necesario (${percentage}%) para la asamblea #${assemblyId}. La asamblea puede comenzar.`,
      priority: 'medium',
      link: `/dashboard/assemblies/${assemblyId}`,
      data: {
        assemblyId,
        quorumPercentage: percentage
      }
    });
    
    // Notificar a residentes
    await notifyByRole('resident', {
      type: 'info',
      title: 'Asamblea lista para comenzar',
      message: `Se ha alcanzado el quórum necesario. La asamblea comenzará en breve.`,
      priority: 'medium',
      link: `/resident/assemblies/${assemblyId}`,
      data: {
        assemblyId,
        quorumPercentage: percentage
      }
    });
    
    return true;
  } catch (error) {
    console.error('Error al enviar notificación de quórum alcanzado:', error);
    throw error;
  }
}

/**
 * Envía notificación de apertura de votación
 */
export async function notifyVotingOpened(assemblyId: number, agendaNumeral: number, topic: string) {
  try {
    // Notificar a todos los participantes de la asamblea
    const attendees = await prisma.assemblyAttendee.findMany({
      where: { assemblyId }
    });
    
    const userIds = attendees.map(attendee => attendee.userId);
    
    // Enviar notificación a todos los asistentes
    await notifyUsers(userIds, {
      type: 'info',
      title: 'Votación abierta',
      message: `Se ha abierto la votación para el punto #${agendaNumeral}: ${topic}. Por favor emita su voto.`,
      priority: 'high',
      link: `/resident/assemblies/${assemblyId}?vote=${agendaNumeral}`,
      data: {
        assemblyId,
        agendaNumeral,
        topic
      }
    });
    
    return true;
  } catch (error) {
    console.error('Error al enviar notificación de apertura de votación:', error);
    throw error;
  }
}

/**
 * Envía notificación de cierre de votación con resultados
 */
export async function notifyVotingClosed(assemblyId: number, agendaNumeral: number, topic: string, results: {
  yesVotes: number;
  noVotes: number;
  yesPercentage: number;
  noPercentage: number;
  approved: boolean;
}) {
  try {
    // Notificar a todos los participantes de la asamblea
    const attendees = await prisma.assemblyAttendee.findMany({
      where: { assemblyId }
    });
    
    const userIds = attendees.map(attendee => attendee.userId);
    
    // Enviar notificación a todos los asistentes
    await notifyUsers(userIds, {
      type: results.approved ? 'success' : 'info',
      title: 'Votación cerrada',
      message: `La votación para el punto #${agendaNumeral}: ${topic} ha finalizado. Resultado: ${results.approved ? 'APROBADO' : 'NO APROBADO'} (${results.yesPercentage}% a favor, ${results.noPercentage}% en contra)`,
      priority: 'medium',
      link: `/resident/assemblies/${assemblyId}?results=${agendaNumeral}`,
      data: {
        assemblyId,
        agendaNumeral,
        topic,
        results
      }
    });
    
    return true;
  } catch (error) {
    console.error('Error al enviar notificación de cierre de votación:', error);
    throw error;
  }
}

/**
 * Envía notificación de finalización de asamblea
 */
export async function notifyAssemblyEnded(assemblyId: number, title: string) {
  try {
    // Notificar a todos los residentes
    await notifyByRole('resident', {
      type: 'info',
      title: 'Asamblea finalizada',
      message: `La asamblea "${title}" ha finalizado. El acta estará disponible próximamente.`,
      priority: 'medium',
      link: `/resident/assemblies/${assemblyId}`,
      data: {
        assemblyId,
        title
      }
    });
    
    return true;
  } catch (error) {
    console.error('Error al enviar notificación de finalización de asamblea:', error);
    throw error;
  }
}

/**
 * Envía notificación de disponibilidad de acta
 */
export async function notifyMinutesAvailable(assemblyId: number, title: string) {
  try {
    // Notificar a todos los residentes
    await notifyByRole('resident', {
      type: 'info',
      title: 'Acta de asamblea disponible',
      message: `El acta de la asamblea "${title}" ya está disponible para su revisión.`,
      priority: 'medium',
      link: `/resident/assemblies/${assemblyId}/minutes`,
      data: {
        assemblyId,
        title
      }
    });
    
    return true;
  } catch (error) {
    console.error('Error al enviar notificación de disponibilidad de acta:', error);
    throw error;
  }
}

// Función auxiliar para notificar a múltiples usuarios
async function notifyUsers(userIds: number[], notification: {
  type: NotificationType;
  title: string;
  message: string;
  priority?: NotificationPriority;
  requireConfirmation?: boolean;
  link?: string;
  data?: Record<string, any>;
}) {
  const results = [];
  
  for (const userId of userIds) {
    try {
      const _result = await notifyUser(userId, notification);
      results.push(result);
    } catch (error) {
      console.error(`Error al enviar notificación al usuario ${userId}:`, error);
    }
  }
  
  return results;
}
