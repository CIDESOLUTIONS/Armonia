/**
 * Mock del servicio para asignación de PQRs
 * 
 * Este archivo proporciona un mock completo del servicio de asignación de PQRs
 * para ser utilizado en pruebas unitarias y de integración.
 */

import { PQRCategory, PQRPriority } from '../lib/constants/pqr-constants';

/**
 * Servicio mock para la asignación de PQRs
 */
class PQRAssignmentServiceMock {
  /**
   * Asigna un PQR a un especialista o equipo basado en la categoría y prioridad
   * @param pqrId ID del PQR a asignar
   * @param category Categoría del PQR
   * @param subcategory Subcategoría del PQR (opcional)
   * @param priority Prioridad del PQR
   * @returns Información de la asignación
   */
  async assignPQR(pqrId: number, category: string, subcategory: string | null, priority: string) {
    // Simular tiempo de procesamiento
    await new Promise(resolve => setTimeout(resolve, 10));
    
    // Determinar fecha de vencimiento basada en la prioridad
    const dueDate = new Date();
    switch (priority) {
      case PQRPriority.LOW:
        dueDate.setDate(dueDate.getDate() + 7); // 7 días
        break;
      case PQRPriority.MEDIUM:
        dueDate.setDate(dueDate.getDate() + 3); // 3 días
        break;
      case PQRPriority.HIGH:
        dueDate.setDate(dueDate.getDate() + 1); // 1 día
        break;
      case PQRPriority.CRITICAL:
        dueDate.setHours(dueDate.getHours() + 4); // 4 horas
        break;
      default:
        dueDate.setDate(dueDate.getDate() + 5); // 5 días por defecto
    }
    
    // Determinar equipo asignado basado en la categoría
    let assignedTeamId = 1; // Equipo general por defecto
    
    if (category === PQRCategory.MAINTENANCE) {
      assignedTeamId = 2; // Equipo de mantenimiento
    } else if (category === PQRCategory.SECURITY) {
      assignedTeamId = 3; // Equipo de seguridad
    } else if (category === PQRCategory.SERVICES) {
      assignedTeamId = 4; // Equipo de servicios
    }
    
    // Retornar resultado de la asignación
    return {
      pqrId,
      category,
      subcategory,
      priority,
      assignedTeamId,
      dueDate,
      assignedAt: new Date()
    };
  }
  
  /**
   * Encuentra un especialista adecuado para un PQR basado en criterios específicos
   * @param category Categoría del PQR
   * @param specialization Especialización requerida
   * @param priority Prioridad del PQR
   * @returns Información del especialista asignado
   */
  async findSpecialist(category: string, specialization: string, priority: string) {
    // Simular tiempo de procesamiento
    await new Promise(resolve => setTimeout(resolve, 10));
    
    // Determinar especialista basado en los criterios
    let specialistId = 1;
    let specialistName = "Técnico General";
    
    if (category === PQRCategory.MAINTENANCE) {
      if (specialization === 'Plomería') {
        specialistId = 2;
        specialistName = "Juan Pérez - Plomero";
      } else if (specialization === 'Electricidad') {
        specialistId = 3;
        specialistName = "Carlos Rodríguez - Electricista";
      }
    } else if (category === PQRCategory.SECURITY) {
      specialistId = 4;
      specialistName = "Ana Gómez - Seguridad";
    }
    
    // Ajustar disponibilidad basada en prioridad
    const availability = priority === PQRPriority.CRITICAL || priority === PQRPriority.HIGH ? 
      'Inmediata' : 'Programada';
    
    // Retornar información del especialista
    return {
      specialistId,
      specialistName,
      category,
      specialization,
      availability,
      assignmentPriority: priority
    };
  }
  
  /**
   * Reasigna un PQR a otro equipo o especialista
   * @param pqrId ID del PQR a reasignar
   * @param newTeamId ID del nuevo equipo
   * @param reason Razón de la reasignación
   * @returns Información de la reasignación
   */
  async reassignPQR(pqrId: number, newTeamId: number, reason: string) {
    // Simular tiempo de procesamiento
    await new Promise(resolve => setTimeout(resolve, 10));
    
    // Retornar resultado de la reasignación
    return {
      pqrId,
      previousTeamId: 1, // Valor simulado
      newTeamId,
      reason,
      reassignedAt: new Date()
    };
  }
  
  /**
   * Calcula la carga de trabajo actual de los equipos
   * @returns Información de carga de trabajo por equipo
   */
  async getTeamWorkload() {
    // Simular tiempo de procesamiento
    await new Promise(resolve => setTimeout(resolve, 10));
    
    // Retornar carga de trabajo simulada
    return [
      { teamId: 1, teamName: "Equipo General", assignedPQRs: 5, completedToday: 2 },
      { teamId: 2, teamName: "Equipo Mantenimiento", assignedPQRs: 8, completedToday: 3 },
      { teamId: 3, teamName: "Equipo Seguridad", assignedPQRs: 3, completedToday: 1 },
      { teamId: 4, teamName: "Equipo Servicios", assignedPQRs: 4, completedToday: 2 }
    ];
  }
  
  /**
   * Verifica si un PQR requiere escalamiento basado en su estado actual
   * @param pqrId ID del PQR a verificar
   * @param currentStatus Estado actual del PQR
   * @param daysOpen Días que lleva abierto el PQR
   * @returns Información sobre si requiere escalamiento
   */
  async checkEscalationNeeded(pqrId: number, currentStatus: string, daysOpen: number) {
    // Simular tiempo de procesamiento
    await new Promise(resolve => setTimeout(resolve, 10));
    
    // Determinar si requiere escalamiento
    const needsEscalation = daysOpen > 5 && currentStatus !== 'RESOLVED' && currentStatus !== 'CLOSED';
    
    // Retornar resultado
    return {
      pqrId,
      needsEscalation,
      recommendedAction: needsEscalation ? 'ESCALATE_TO_MANAGER' : 'CONTINUE_NORMAL',
      reason: needsEscalation ? `PQR abierto por ${daysOpen} días sin resolver` : 'Dentro de parámetros normales'
    };
  }
}

// Exportar instancia del servicio mock
export default new PQRAssignmentServiceMock();
