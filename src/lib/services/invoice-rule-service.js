/**
 * Servicio de Reglas de Facturación para la aplicación Armonía
 * Proporciona funcionalidades para gestión de reglas de facturación
 * Adaptado a CommonJS para compatibilidad con Jest
 */

const { ServerLogger } = require('../logging/server-logger');
const { PrismaClient } = require('@prisma/client');

const logger = new ServerLogger('InvoiceRuleService');

/**
 * Clase que gestiona las reglas de facturación
 */
class InvoiceRuleService {
  /**
   * Constructor del servicio
   * @param {string} schemaName - Nombre del esquema/comunidad
   */
  constructor(schemaName) {
    if (!schemaName) {
      throw new Error('Se requiere un nombre de esquema para el servicio de reglas de facturación');
    }
    
    this.schemaName = schemaName;
    this.prisma = new PrismaClient({
      datasources: {
        db: {
          url: `${process.env.DATABASE_URL}?schema=${schemaName}`
        }
      }
    });
    
    logger.info(`Servicio de reglas de facturación inicializado para esquema: ${schemaName}`);
  }
  
  /**
   * Obtiene todas las reglas de facturación
   * @param {Object} options - Opciones de filtrado y paginación
   * @returns {Promise<Array>} - Lista de reglas
   */
  async getAllRules(options = {}) {
    try {
      const { skip = 0, take = 50, active, category } = options;
      
      const where = {};
      
      if (active !== undefined) {
        where.active = active;
      }
      
      if (category) {
        where.category = category;
      }
      
      const rules = await this.prisma.invoiceRule.findMany({
        where,
        skip,
        take,
        orderBy: {
          priority: 'asc'
        }
      });
      
      logger.info(`Recuperadas ${rules.length} reglas de facturación`);
      return rules;
    } catch (error) {
      logger.error(`Error al obtener reglas de facturación: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Obtiene una regla de facturación por ID
   * @param {string} id - ID de la regla
   * @returns {Promise<Object>} - Regla encontrada
   */
  async getRuleById(id) {
    try {
      if (!id) {
        throw new Error('Se requiere un ID para obtener la regla');
      }
      
      const rule = await this.prisma.invoiceRule.findUnique({
        where: { id }
      });
      
      if (!rule) {
        logger.warn(`Regla de facturación no encontrada: ${id}`);
        return null;
      }
      
      logger.info(`Recuperada regla de facturación: ${id}`);
      return rule;
    } catch (error) {
      logger.error(`Error al obtener regla de facturación ${id}: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Crea una nueva regla de facturación
   * @param {Object} ruleData - Datos de la regla
   * @returns {Promise<Object>} - Regla creada
   */
  async createRule(ruleData) {
    try {
      if (!ruleData || !ruleData.name || !ruleData.formula) {
        throw new Error('Datos de regla incompletos');
      }
      
      const rule = await this.prisma.invoiceRule.create({
        data: {
          name: ruleData.name,
          description: ruleData.description || '',
          category: ruleData.category || 'GENERAL',
          formula: ruleData.formula,
          parameters: ruleData.parameters || {},
          priority: ruleData.priority || 100,
          active: ruleData.active !== undefined ? ruleData.active : true,
          startDate: ruleData.startDate || new Date(),
          endDate: ruleData.endDate || null,
          createdBy: ruleData.createdBy || 'system'
        }
      });
      
      logger.info(`Creada nueva regla de facturación: ${rule.id}`);
      return rule;
    } catch (error) {
      logger.error(`Error al crear regla de facturación: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Actualiza una regla de facturación existente
   * @param {string} id - ID de la regla
   * @param {Object} ruleData - Datos a actualizar
   * @returns {Promise<Object>} - Regla actualizada
   */
  async updateRule(id, ruleData) {
    try {
      if (!id) {
        throw new Error('Se requiere un ID para actualizar la regla');
      }
      
      // Verificar que la regla existe
      const existingRule = await this.prisma.invoiceRule.findUnique({
        where: { id }
      });
      
      if (!existingRule) {
        logger.warn(`Regla de facturación no encontrada para actualizar: ${id}`);
        return null;
      }
      
      const updatedRule = await this.prisma.invoiceRule.update({
        where: { id },
        data: {
          name: ruleData.name !== undefined ? ruleData.name : existingRule.name,
          description: ruleData.description !== undefined ? ruleData.description : existingRule.description,
          category: ruleData.category !== undefined ? ruleData.category : existingRule.category,
          formula: ruleData.formula !== undefined ? ruleData.formula : existingRule.formula,
          parameters: ruleData.parameters !== undefined ? ruleData.parameters : existingRule.parameters,
          priority: ruleData.priority !== undefined ? ruleData.priority : existingRule.priority,
          active: ruleData.active !== undefined ? ruleData.active : existingRule.active,
          startDate: ruleData.startDate !== undefined ? ruleData.startDate : existingRule.startDate,
          endDate: ruleData.endDate !== undefined ? ruleData.endDate : existingRule.endDate,
          updatedAt: new Date(),
          updatedBy: ruleData.updatedBy || 'system'
        }
      });
      
      logger.info(`Actualizada regla de facturación: ${id}`);
      return updatedRule;
    } catch (error) {
      logger.error(`Error al actualizar regla de facturación ${id}: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Elimina una regla de facturación
   * @param {string} id - ID de la regla
   * @returns {Promise<boolean>} - Resultado de la operación
   */
  async deleteRule(id) {
    try {
      if (!id) {
        throw new Error('Se requiere un ID para eliminar la regla');
      }
      
      // Verificar que la regla existe
      const existingRule = await this.prisma.invoiceRule.findUnique({
        where: { id }
      });
      
      if (!existingRule) {
        logger.warn(`Regla de facturación no encontrada para eliminar: ${id}`);
        return false;
      }
      
      await this.prisma.invoiceRule.delete({
        where: { id }
      });
      
      logger.info(`Eliminada regla de facturación: ${id}`);
      return true;
    } catch (error) {
      logger.error(`Error al eliminar regla de facturación ${id}: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Activa o desactiva una regla de facturación
   * @param {string} id - ID de la regla
   * @param {boolean} active - Estado de activación
   * @returns {Promise<Object>} - Regla actualizada
   */
  async toggleRuleActive(id, active) {
    try {
      if (!id) {
        throw new Error('Se requiere un ID para activar/desactivar la regla');
      }
      
      // Verificar que la regla existe
      const existingRule = await this.prisma.invoiceRule.findUnique({
        where: { id }
      });
      
      if (!existingRule) {
        logger.warn(`Regla de facturación no encontrada: ${id}`);
        return null;
      }
      
      const updatedRule = await this.prisma.invoiceRule.update({
        where: { id },
        data: { 
          active: active !== undefined ? active : !existingRule.active,
          updatedAt: new Date()
        }
      });
      
      logger.info(`Regla de facturación ${id} ${updatedRule.active ? 'activada' : 'desactivada'}`);
      return updatedRule;
    } catch (error) {
      logger.error(`Error al activar/desactivar regla de facturación ${id}: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Obtiene reglas activas para una categoría específica
   * @param {string} category - Categoría de reglas
   * @returns {Promise<Array>} - Lista de reglas activas
   */
  async getActiveRulesByCategory(category) {
    try {
      if (!category) {
        throw new Error('Se requiere una categoría para filtrar reglas');
      }
      
      const rules = await this.prisma.invoiceRule.findMany({
        where: {
          category,
          active: true,
          OR: [
            { endDate: null },
            { endDate: { gt: new Date() } }
          ],
          startDate: { lte: new Date() }
        },
        orderBy: {
          priority: 'asc'
        }
      });
      
      logger.info(`Recuperadas ${rules.length} reglas activas para categoría: ${category}`);
      return rules;
    } catch (error) {
      logger.error(`Error al obtener reglas activas para categoría ${category}: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Evalúa una regla con datos específicos
   * @param {string} ruleId - ID de la regla
   * @param {Object} data - Datos para evaluación
   * @returns {Promise<Object>} - Resultado de la evaluación
   */
  async evaluateRule(ruleId, data) {
    try {
      if (!ruleId) {
        throw new Error('Se requiere un ID de regla para evaluar');
      }
      
      if (!data) {
        throw new Error('Se requieren datos para evaluar la regla');
      }
      
      // Obtener la regla
      const rule = await this.getRuleById(ruleId);
      
      if (!rule) {
        throw new Error(`Regla no encontrada: ${ruleId}`);
      }
      
      if (!rule.active) {
        logger.warn(`Intentando evaluar regla inactiva: ${ruleId}`);
        return {
          success: false,
          error: 'La regla está inactiva',
          result: null
        };
      }
      
      // Evaluar la fórmula (en una implementación real, se usaría un motor de evaluación de expresiones)
      // Este es un ejemplo simplificado
      let result;
      try {
        // Combinar datos con parámetros de la regla
        const context = { ...rule.parameters, ...data };
        
        // Evaluar la fórmula (simulado)
        result = this.evaluateFormula(rule.formula, context);
        
        logger.info(`Regla ${ruleId} evaluada correctamente`);
        return {
          success: true,
          result,
          ruleId,
          ruleName: rule.name
        };
      } catch (evalError) {
        logger.error(`Error al evaluar fórmula de regla ${ruleId}: ${evalError.message}`);
        return {
          success: false,
          error: evalError.message,
          result: null
        };
      }
    } catch (error) {
      logger.error(`Error al evaluar regla ${ruleId}: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Evalúa una fórmula con un contexto dado
   * @param {string} formula - Fórmula a evaluar
   * @param {Object} context - Contexto con variables
   * @returns {number} - Resultado de la evaluación
   */
  evaluateFormula(formula, context) {
    // Implementación simplificada para demostración
    // En una implementación real, se usaría una biblioteca como mathjs o expr-eval
    
    try {
      // Reemplazar variables en la fórmula
      let evaluableFormula = formula;
      
      Object.keys(context).forEach(key => {
        const regex = new RegExp(`\\b${key}\\b`, 'g');
        const value = context[key];
        
        if (typeof value === 'string') {
          evaluableFormula = evaluableFormula.replace(regex, `"${value}"`);
        } else {
          evaluableFormula = evaluableFormula.replace(regex, value);
        }
      });
      
      // Evaluar la fórmula (ADVERTENCIA: eval es inseguro para uso en producción)
      // En una implementación real, usar una biblioteca segura de evaluación de expresiones
      // eslint-disable-next-line no-eval
      const result = eval(evaluableFormula);
      
      return result;
    } catch (error) {
      logger.error(`Error al evaluar fórmula: ${error.message}`);
      throw new Error(`Error en fórmula: ${error.message}`);
    }
  }
  
  /**
   * Aplica reglas de facturación a un conjunto de datos
   * @param {string} category - Categoría de reglas a aplicar
   * @param {Object} data - Datos para evaluación
   * @returns {Promise<Object>} - Resultado de la aplicación de reglas
   */
  async applyRules(category, data) {
    try {
      if (!category) {
        throw new Error('Se requiere una categoría para aplicar reglas');
      }
      
      if (!data) {
        throw new Error('Se requieren datos para aplicar reglas');
      }
      
      // Obtener reglas activas para la categoría
      const rules = await this.getActiveRulesByCategory(category);
      
      if (rules.length === 0) {
        logger.warn(`No hay reglas activas para la categoría: ${category}`);
        return {
          success: true,
          results: [],
          finalResult: null
        };
      }
      
      // Aplicar cada regla en orden de prioridad
      const results = [];
      let finalResult = null;
      
      for (const rule of rules) {
        const evaluation = await this.evaluateRule(rule.id, data);
        
        results.push({
          ruleId: rule.id,
          ruleName: rule.name,
          priority: rule.priority,
          success: evaluation.success,
          result: evaluation.result,
          error: evaluation.error
        });
        
        if (evaluation.success) {
          finalResult = evaluation.result;
        }
      }
      
      logger.info(`Aplicadas ${results.length} reglas para categoría: ${category}`);
      return {
        success: true,
        results,
        finalResult
      };
    } catch (error) {
      logger.error(`Error al aplicar reglas para categoría ${category}: ${error.message}`);
      return {
        success: false,
        error: error.message,
        results: [],
        finalResult: null
      };
    }
  }
  
  /**
   * Cierra la conexión a la base de datos
   */
  async disconnect() {
    try {
      await this.prisma.$disconnect();
      logger.info('Conexión a base de datos cerrada');
    } catch (error) {
      logger.error(`Error al cerrar conexión a base de datos: ${error.message}`);
    }
  }
}

// Exportar la clase usando CommonJS para compatibilidad con Jest
module.exports = InvoiceRuleService;
