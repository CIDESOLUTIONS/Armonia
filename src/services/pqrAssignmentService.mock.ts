/**
 * Mock del servicio para la asignación inteligente y priorización de solicitudes PQR
 * 
 * Este archivo proporciona un mock del servicio de asignación de PQR para pruebas
 */

// Importar constantes desde nuestro archivo local en lugar de @prisma/client
import { PQRCategory, PQRPriority } from '../lib/constants/pqr-constants';

// Interfaz para datos de entrada de PQR
export interface PQRInputData {
  type: string;
  title: string;
  description: string;
  category?: string;
  priority?: string;
  userId: number;
  userName: string;
  userRole: string;
  unitId?: number;
  unitNumber?: string;
  complexId: number;
  attachments?: any[];
}

// Interfaz para resultado de asignación
export interface AssignmentResult {
  category: string;
  subcategory?: string;
  priority: string;
  assignedToId?: number;
  assignedToName?: string;
  assignedToRole?: string;
  assignedTeamId?: number;
  dueDate?: Date;
  tags?: string[];
}

/**
 * Clase principal del servicio de asignación de PQR (Mock)
 */
export class PQRAssignmentService {
  private schema: string;

  constructor(schema: string) {
    this.schema = schema;
  }

  /**
   * Procesa un nuevo PQR para su categorización, priorización y asignación
   */
  async processPQR(pqrData: PQRInputData): Promise<AssignmentResult> {
    try {
      // 1. Categorizar la solicitud
      const categorization = await this.categorize(pqrData);
      
      // 2. Determinar la prioridad
      const prioritization = await this.prioritize(pqrData, categorization.category);
      
      // 3. Asignar a equipo o persona responsable
      const assignment = await this.assign(pqrData, categorization.category, prioritization.priority);
      
      // 4. Calcular fecha límite según SLA
      const dueDate = await this.calculateDueDate(categorization.category, prioritization.priority);
      
      // 5. Generar etiquetas para clasificación
      const tags = await this.generateTags(pqrData, categorization.category);
      
      // Combinar resultados
      return {
        ...categorization,
        ...prioritization,
        ...assignment,
        dueDate,
        tags
      };
    } catch (error) {
      console.error('Error en procesamiento de PQR:', error);
      // En caso de error, devolver valores predeterminados
      return {
        category: pqrData.category || PQRCategory.OTHER,
        priority: pqrData.priority || PQRPriority.MEDIUM
      };
    }
  }

  /**
   * Categoriza automáticamente un PQR basado en su contenido
   */
  private async categorize(pqrData: PQRInputData): Promise<{ category: string, subcategory?: string }> {
    // Si ya viene con categoría, respetarla
    if (pqrData.category) {
      return { category: pqrData.category };
    }

    try {
      // Texto combinado para análisis
      const combinedText = `${pqrData.title} ${pqrData.description}`.toLowerCase();

      // Análisis básico de texto
      if (combinedText.match(/manten|repar|arregl|da[ñn]|fuga|goter|luz|bombill|ascensor/i)) {
        return { 
          category: PQRCategory.MAINTENANCE,
          subcategory: 'Plomería'
        };
      } else if (combinedText.match(/segur|vigilan|robo|alarm|cctv|c[aá]mara|intru|sospech/i)) {
        return { 
          category: PQRCategory.SECURITY,
          subcategory: 'Videovigilancia'
        };
      } else if (combinedText.match(/admin|documento|certific|paz y salvo|contrato|reglamento/i)) {
        return { 
          category: PQRCategory.ADMINISTRATION,
          subcategory: 'Documentos'
        };
      } else if (combinedText.match(/pag|cuota|factur|cobr|recib|mora|descuent|financ/i)) {
        return { 
          category: PQRCategory.PAYMENTS,
          subcategory: 'Facturas'
        };
      }

      // Categoría por defecto si no hay coincidencias
      return { category: PQRCategory.OTHER };
    } catch (error) {
      console.error('Error en categorización de PQR:', error);
      return { category: PQRCategory.OTHER };
    }
  }

  /**
   * Determina la prioridad de un PQR
   */
  private async prioritize(pqrData: PQRInputData, category: string): Promise<{ priority: string }> {
    // Si ya viene con prioridad, respetarla
    if (pqrData.priority) {
      return { priority: pqrData.priority };
    }

    try {
      // Texto combinado para análisis
      const combinedText = `${pqrData.title} ${pqrData.description}`.toLowerCase();

      // Palabras clave para prioridades
      const urgentKeywords = [
        'urgente', 'emergencia', 'inmediato', 'grave', 'peligro',
        'fuga', 'incendio', 'inundación', 'corto circuito', 'seguridad'
      ];
      
      const highKeywords = [
        'importante', 'pronto', 'rápido', 'afecta', 'impide',
        'no funciona', 'dañado', 'roto', 'bloqueado'
      ];
      
      const lowKeywords = [
        'sugerencia', 'cuando pueda', 'mejora', 'idea', 'propuesta',
        'considerar', 'evaluar', 'futuro'
      ];

      // Verificar coincidencias con palabras clave de prioridad
      if (urgentKeywords.some(keyword => combinedText.includes(keyword))) {
        return { priority: PQRPriority.CRITICAL };
      } else if (highKeywords.some(keyword => combinedText.includes(keyword))) {
        return { priority: PQRPriority.HIGH };
      } else if (lowKeywords.some(keyword => combinedText.includes(keyword))) {
        return { priority: PQRPriority.LOW };
      }

      // Prioridad por categoría
      switch (category) {
        case PQRCategory.SECURITY:
          return { priority: PQRPriority.HIGH };
        case PQRCategory.MAINTENANCE:
          return { priority: PQRPriority.MEDIUM };
        default:
          return { priority: PQRPriority.MEDIUM };
      }
    } catch (error) {
      console.error('Error en priorización de PQR:', error);
      return { priority: PQRPriority.MEDIUM };
    }
  }

  /**
   * Asigna un PQR a un equipo o persona responsable
   */
  private async assign(
    pqrData: PQRInputData, 
    category: string, 
    priority: string
  ): Promise<{ 
    assignedToId?: number, 
    assignedToName?: string, 
    assignedToRole?: string,
    assignedTeamId?: number 
  }> {
    try {
      // Asignación basada en categoría
      switch (category) {
        case PQRCategory.MAINTENANCE:
          return {
            assignedTeamId: 1,
            assignedToName: 'Equipo de Mantenimiento'
          };
        case PQRCategory.SECURITY:
          return {
            assignedTeamId: 2,
            assignedToName: 'Equipo de Seguridad'
          };
        case PQRCategory.ADMINISTRATION:
          return {
            assignedTeamId: 3,
            assignedToName: 'Equipo Administrativo'
          };
        default:
          return {
            assignedTeamId: 4,
            assignedToName: 'Administración General'
          };
      }
    } catch (error) {
      console.error('Error en asignación de PQR:', error);
      return {};
    }
  }

  /**
   * Calcula la fecha límite según SLA y prioridad
   */
  private async calculateDueDate(category: string, priority: string): Promise<Date | undefined> {
    try {
      // Fechas límite basadas en prioridad
      const now = new Date();
      switch (priority) {
        case PQRPriority.CRITICAL:
          return new Date(now.getTime() + 4 * 60 * 60000); // 4 horas
        case PQRPriority.HIGH:
          return new Date(now.getTime() + 24 * 60 * 60000); // 24 horas
        case PQRPriority.MEDIUM:
          return new Date(now.getTime() + 3 * 24 * 60 * 60000); // 3 días
        case PQRPriority.LOW:
          return new Date(now.getTime() + 7 * 24 * 60 * 60000); // 7 días
        default:
          return new Date(now.getTime() + 5 * 24 * 60 * 60000); // 5 días
      }
    } catch (error) {
      console.error('Error al calcular fecha límite:', error);
      return new Date(new Date().getTime() + 5 * 24 * 60 * 60000); // 5 días por defecto
    }
  }

  /**
   * Genera etiquetas para clasificación adicional
   */
  private async generateTags(pqrData: PQRInputData, category: string): Promise<string[]> {
    try {
      const tags = [category];
      
      // Añadir etiquetas basadas en el texto
      const combinedText = `${pqrData.title} ${pqrData.description}`.toLowerCase();
      
      if (combinedText.match(/urgent|emergencia|inmediato/i)) {
        tags.push('URGENTE');
      }
      
      if (combinedText.match(/reincidente|nuevamente|otra vez|vuelve a ocurrir/i)) {
        tags.push('REINCIDENTE');
      }
      
      if (combinedText.match(/vecino|comunidad|todos|general/i)) {
        tags.push('COMUNITARIO');
      }
      
      return tags;
    } catch (error) {
      console.error('Error al generar etiquetas:', error);
      return [category];
    }
  }
}

// Exportar el servicio
export default PQRAssignmentService;
