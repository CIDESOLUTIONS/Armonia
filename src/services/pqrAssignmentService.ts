/**
 * Servicio para la asignación inteligente y priorización de solicitudes PQR
 * 
 * Este servicio implementa la lógica para categorizar, priorizar y asignar
 * automáticamente las solicitudes PQR según reglas configurables.
 */

import { getPrisma } from '@/lib/prisma';
import { getSchemaFromRequest } from '@/lib/prisma';
import { PQRCategory, PQRPriority, PQRStatus } from '@/lib/constants/pqr-constants';

// Interfaz para datos de entrada de PQR
export interface PQRInputData {
  type: string;
  title: string;
  description: string;
  category?: PQRCategory;
  priority?: PQRPriority;
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
  category: PQRCategory;
  subcategory?: string;
  priority: PQRPriority;
  assignedToId?: number;
  assignedToName?: string;
  assignedToRole?: string;
  assignedTeamId?: number;
  dueDate?: Date;
  tags?: string[];
}

/**
 * Clase principal del servicio de asignación de PQR
 */
export class PQRAssignmentService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = getPrisma();
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
  private async categorize(pqrData: PQRInputData): Promise<{ category: PQRCategory, subcategory?: string }> {
    // Si ya viene con categoría, respetarla
    if (pqrData.category) {
      return { category: pqrData.category };
    }

    try {
      // Obtener configuración de categorización
      const settings = await this.prisma.pQRSettings.findFirst();

      // Si la categorización automática está desactivada, usar categoría por defecto
      if (settings && !settings.autoCategorizeEnabled) {
        return { category: PQRCategory.OTHER };
      }

      // Obtener reglas de categorización
      const rules = await this.prisma.pQRAssignmentRule.findMany({
        where: { isActive: true },
        orderBy: { priority: 'asc' },
      });

      // Texto combinado para análisis
      const combinedText = `${pqrData.title} ${pqrData.description}`.toLowerCase();

      // Aplicar reglas basadas en palabras clave
      for (const rule of rules) {
        if (rule.keywords && rule.keywords.length > 0) {
          // Verificar si alguna palabra clave está en el texto
          const matchesKeyword = rule.keywords.some(keyword => 
            combinedText.includes(keyword.toLowerCase())
          );
          
          if (matchesKeyword && rule.categories && rule.categories.length > 0) {
            return { 
              category: rule.categories[0] as PQRCategory,
              subcategory: this.determineSubcategory(combinedText, rule.categories[0] as PQRCategory)
            };
          }
        }
      }

      // Análisis básico de texto si no hay coincidencia con reglas
      if (combinedText.match(/manten|repar|arregl|da[ñn]|fuga|goter|luz|bombill|ascensor/i)) {
        return { 
          category: PQRCategory.MAINTENANCE,
          subcategory: this.determineSubcategory(combinedText, PQRCategory.MAINTENANCE)
        };
      } else if (combinedText.match(/segur|vigilan|robo|alarm|cctv|c[aá]mara|intru|sospech/i)) {
        return { 
          category: PQRCategory.SECURITY,
          subcategory: this.determineSubcategory(combinedText, PQRCategory.SECURITY)
        };
      } else if (combinedText.match(/admin|documento|certific|paz y salvo|contrato|reglamento/i)) {
        return { 
          category: PQRCategory.ADMINISTRATION,
          subcategory: this.determineSubcategory(combinedText, PQRCategory.ADMINISTRATION)
        };
      } else if (combinedText.match(/pag|cuota|factur|cobr|recib|mora|descuent|financ/i)) {
        return { 
          category: PQRCategory.PAYMENTS,
          subcategory: this.determineSubcategory(combinedText, PQRCategory.PAYMENTS)
        };
      } else if (combinedText.match(/comun|vecin|ruido|fiesta|mascot|basura|conviven/i)) {
        return { 
          category: PQRCategory.NEIGHBORS,
          subcategory: this.determineSubcategory(combinedText, PQRCategory.NEIGHBORS)
        };
      } else if (combinedText.match(/servicio|agua|luz|gas|internet|tv|ascensor|gimnasio|piscina/i)) {
        return { 
          category: PQRCategory.SERVICES,
          subcategory: this.determineSubcategory(combinedText, PQRCategory.SERVICES)
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
   * Determina subcategorías basadas en el texto y la categoría principal
   */
  private determineSubcategory(text: string, category: PQRCategory): string | undefined {
    // Subcategorías para mantenimiento
    if (category === PQRCategory.MAINTENANCE) {
      if (text.match(/agua|fuga|goter|humed|inunda|tuberi|ba[ñn]o/i)) return 'Plomería';
      if (text.match(/luz|el[eé]ctric|bombill|enchufe|corto|apag[oó]n/i)) return 'Eléctrico';
      if (text.match(/ascensor|elevador/i)) return 'Ascensores';
      if (text.match(/puerta|cerradura|llave|chapa/i)) return 'Cerrajería';
      if (text.match(/pared|muro|grieta|fisura|pintura/i)) return 'Estructural';
    }
    
    // Subcategorías para seguridad
    else if (category === PQRCategory.SECURITY) {
      if (text.match(/c[aá]mara|cctv|video/i)) return 'Videovigilancia';
      if (text.match(/alarm|sensor/i)) return 'Alarmas';
      if (text.match(/robo|hurto|intrusi[oó]n/i)) return 'Incidentes';
      if (text.match(/vigilan|guardia|portero/i)) return 'Personal';
    }
    
    // Subcategorías para servicios
    else if (category === PQRCategory.SERVICES) {
      if (text.match(/internet|wifi|red/i)) return 'Internet';
      if (text.match(/gimnasio|gym/i)) return 'Gimnasio';
      if (text.match(/piscina|alberca|jacuzzi/i)) return 'Piscina';
      if (text.match(/sal[oó]n|evento|fiesta/i)) return 'Salón comunal';
      if (text.match(/parque|juego|infantil/i)) return 'Zonas infantiles';
    }
    
    return undefined;
  }

  /**
   * Determina la prioridad de un PQR
   */
  private async prioritize(pqrData: PQRInputData, category: PQRCategory): Promise<{ priority: PQRPriority }> {
    // Si ya viene con prioridad, respetarla
    if (pqrData.priority) {
      return { priority: pqrData.priority };
    }

    try {
      // Obtener reglas de priorización
      const rules = await this.prisma.pQRAssignmentRule.findMany({
        where: {
          isActive: true,
          categories: { has: category },
        },
        orderBy: { priority: 'asc' },
      });

      // Texto combinado para análisis
      const combinedText = `${pqrData.title} ${pqrData.description}`.toLowerCase();

      // Aplicar reglas basadas en palabras clave para prioridad
      for (const rule of rules) {
        if (rule.keywords && rule.keywords.length > 0 && rule.setPriority) {
          // Verificar si alguna palabra clave está en el texto
          const matchesKeyword = rule.keywords.some(keyword => 
            combinedText.includes(keyword.toLowerCase())
          );
          
          if (matchesKeyword) {
            return { priority: rule.setPriority as PQRPriority };
          }
        }
      }

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
    category: PQRCategory, 
    priority: PQRPriority
  ): Promise<{ 
    assignedToId?: number, 
    assignedToName?: string, 
    assignedToRole?: string,
    assignedTeamId?: number 
  }> {
    try {
      // Verificar si la asignación automática está habilitada
      const settings = await this.prisma.pQRSettings.findFirst();

      if (settings && !settings.autoAssignEnabled) {
        return {}; // No asignar automáticamente
      }

      // Buscar reglas de asignación específicas
      const rules = await this.prisma.pQRAssignmentRule.findMany({
        where: {
          isActive: true,
          categories: { has: category },
          priorities: { has: priority },
        },
        orderBy: { priority: 'asc' },
      });

      // Si hay reglas específicas, aplicar la primera que coincida
      if (rules && rules.length > 0) {
        const rule = rules[0];
        
        // Si la regla asigna a un equipo
        if (rule.assignToTeamId) {
          const team = await this.prisma.pQRTeam.findUnique({
            where: { id: rule.assignToTeamId, isActive: true },
          });
          
          if (team) {
            // Asignar al equipo
            return {
              assignedTeamId: team.id
            };
          }
        }
        
        // Si la regla asigna a un usuario específico
        if (rule.assignToUserId) {
          const user = await this.prisma.user.findUnique({
            where: { id: rule.assignToUserId },
          });
          
          if (user) {
            return {
              assignedToId: user.id,
              assignedToName: user.name || 'Usuario ' + user.id,
              assignedToRole: user.role
            };
          }
        }
      }

      // Si no hay reglas específicas o no se pudo asignar, buscar equipos por categoría
      const teams = await this.prisma.pQRTeam.findMany({
        where: {
          isActive: true,
          categories: { has: category },
        },
      });

      if (teams && teams.length > 0) {
        // Seleccionar equipo con menos carga o por rotación
        // Para este ejemplo, simplemente tomamos el primero
        return {
          assignedTeamId: teams[0].id
        };
      }

      // Si no hay equipos específicos, buscar administradores
      const admins = await this.prisma.user.findMany({
        where: {
          role: 'COMPLEX_ADMIN',
          complexId: pqrData.complexId,
          active: true,
        },
      });

      if (admins && admins.length > 0) {
        // Seleccionar administrador con menos carga o por rotación
        // Para este ejemplo, simplemente tomamos el primero
        return {
          assignedToId: admins[0].id,
          assignedToName: admins[0].name || 'Administrador ' + admins[0].id,
          assignedToRole: admins[0].role
        };
      }

      // Si no se pudo asignar, devolver vacío
      return {};
    } catch (error) {
      console.error('Error en asignación de PQR:', error);
      return {};
    }
  }

  /**
   * Calcula la fecha límite según SLA y prioridad
   */
  private async calculateDueDate(category: PQRCategory, priority: PQRPriority): Promise<Date | undefined> {
    try {
      // Buscar SLA específico para esta categoría y prioridad
      const sla = await this.prisma.pQRSLA.findFirst({
        where: {
          isActive: true,
          OR: [
            { category },
            { category: null },
          ],
          AND: [
            { OR: [{ priority }, { priority: null }] },
          ],
        },
      });

      if (sla) {
        const now = new Date();
        const resolutionTime = sla.resolutionTime || 0; // Tiempo en minutos
        
        // Si solo aplica en horario laboral, calcular considerando días hábiles
        if (sla.businessHoursOnly) {
          // Implementación simplificada: solo añadir tiempo en minutos
          // En una implementación real, se considerarían días hábiles y horario laboral
          return new Date(now.getTime() + resolutionTime * 60000);
        } else {
          // Añadir tiempo en minutos (24/7)
          return new Date(now.getTime() + resolutionTime * 60000);
        }
      }

      // Si no hay SLA específico, usar valores predeterminados según prioridad
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
      return undefined;
    }
  }

  /**
   * Genera etiquetas para clasificación adicional
   */
  private async generateTags(pqrData: PQRInputData, category: PQRCategory): Promise<string[] | undefined> {
    try {
      const tags = [];
      const combinedText = `${pqrData.title} ${pqrData.description}`.toLowerCase();
      
      // Añadir etiqueta de categoría
      tags.push(category);
      
      // Añadir etiquetas basadas en palabras clave
      if (combinedText.match(/urgent|emergencia|inmediato|grave|peligro/i)) {
        tags.push('urgente');
      }
      
      if (combinedText.match(/reincidente|repetido|nuevamente|otra vez/i)) {
        tags.push('reincidente');
      }
      
      if (combinedText.match(/garantía|reciente|nuevo|instalación/i)) {
        tags.push('garantía');
      }
      
      // Añadir etiquetas específicas por categoría
      switch (category) {
        case PQRCategory.MAINTENANCE:
          if (combinedText.match(/agua|fuga|goter|humed|inunda|tuberi|ba[ñn]o/i)) {
            tags.push('plomería');
          }
          if (combinedText.match(/luz|el[eé]ctric|bombill|enchufe|corto|apag[oó]n/i)) {
            tags.push('eléctrico');
          }
          break;
          
        case PQRCategory.SECURITY:
          if (combinedText.match(/c[aá]mara|cctv|video/i)) {
            tags.push('videovigilancia');
          }
          if (combinedText.match(/robo|hurto|intrusi[oó]n/i)) {
            tags.push('incidente');
          }
          break;
      }
      
      return tags.length > 0 ? tags : undefined;
    } catch (error) {
      console.error('Error al generar etiquetas:', error);
      return undefined;
    }
  }
}
