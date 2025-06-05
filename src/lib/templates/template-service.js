/**
 * Servicio de plantillas para la aplicación Armonía
 * 
 * Este servicio proporciona funcionalidades para gestionar y renderizar
 * plantillas utilizadas en diferentes partes de la aplicación.
 */

const logger = require('../logging/server-logger');

/**
 * Clase que implementa el servicio de plantillas
 */
class TemplateService {
  /**
   * Constructor del servicio de plantillas
   */
  constructor() {
    this.templates = new Map();
    this.defaultVariables = {
      appName: 'Armonía',
      supportEmail: 'soporte@armonia.app',
      supportPhone: '+57 300 123 4567',
      websiteUrl: 'https://armonia.app'
    };
    
    logger.info('TemplateService initialized');
  }
  
  /**
   * Registra una plantilla en el servicio
   * @param {string} name - Nombre único de la plantilla
   * @param {string} content - Contenido de la plantilla
   * @param {Object} defaultVars - Variables por defecto para esta plantilla
   * @returns {boolean} true si se registró correctamente, false en caso contrario
   */
  registerTemplate(name, content, defaultVars = {}) {
    try {
      if (!name || !content) {
        throw new Error('Name and content are required');
      }
      
      this.templates.set(name, {
        content,
        defaultVars
      });
      
      logger.info(`Template registered: ${name}`);
      return true;
    } catch (error) {
      logger.error(`Error registering template: ${error.message}`, { error });
      return false;
    }
  }
  
  /**
   * Obtiene una plantilla por su nombre
   * @param {string} name - Nombre de la plantilla
   * @returns {Object|null} Plantilla o null si no existe
   */
  getTemplate(name) {
    try {
      const template = this.templates.get(name);
      
      if (!template) {
        logger.warn(`Template not found: ${name}`);
        return null;
      }
      
      return template;
    } catch (error) {
      logger.error(`Error getting template: ${error.message}`, { error });
      return null;
    }
  }
  
  /**
   * Renderiza una plantilla con las variables proporcionadas
   * @param {string} name - Nombre de la plantilla
   * @param {Object} variables - Variables para renderizar la plantilla
   * @returns {string|null} Plantilla renderizada o null si hubo un error
   */
  renderTemplate(name, variables = {}) {
    try {
      const template = this.getTemplate(name);
      
      if (!template) {
        return null;
      }
      
      // Combinar variables por defecto con las proporcionadas
      const mergedVars = {
        ...this.defaultVariables,
        ...template.defaultVars,
        ...variables
      };
      
      // Renderizar plantilla reemplazando variables
      let rendered = template.content;
      
      Object.entries(mergedVars).forEach(([key, value]) => {
        const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
        rendered = rendered.replace(regex, value);
      });
      
      return rendered;
    } catch (error) {
      logger.error(`Error rendering template: ${error.message}`, { error });
      return null;
    }
  }
  
  /**
   * Elimina una plantilla del servicio
   * @param {string} name - Nombre de la plantilla
   * @returns {boolean} true si se eliminó correctamente, false en caso contrario
   */
  removeTemplate(name) {
    try {
      const exists = this.templates.has(name);
      
      if (!exists) {
        logger.warn(`Template not found for removal: ${name}`);
        return false;
      }
      
      this.templates.delete(name);
      logger.info(`Template removed: ${name}`);
      return true;
    } catch (error) {
      logger.error(`Error removing template: ${error.message}`, { error });
      return false;
    }
  }
  
  /**
   * Actualiza una plantilla existente
   * @param {string} name - Nombre de la plantilla
   * @param {string} content - Nuevo contenido de la plantilla
   * @param {Object} defaultVars - Nuevas variables por defecto
   * @returns {boolean} true si se actualizó correctamente, false en caso contrario
   */
  updateTemplate(name, content, defaultVars = null) {
    try {
      const template = this.templates.get(name);
      
      if (!template) {
        logger.warn(`Template not found for update: ${name}`);
        return false;
      }
      
      // Actualizar contenido si se proporciona
      if (content) {
        template.content = content;
      }
      
      // Actualizar variables por defecto si se proporcionan
      if (defaultVars) {
        template.defaultVars = {
          ...template.defaultVars,
          ...defaultVars
        };
      }
      
      this.templates.set(name, template);
      logger.info(`Template updated: ${name}`);
      return true;
    } catch (error) {
      logger.error(`Error updating template: ${error.message}`, { error });
      return false;
    }
  }
  
  /**
   * Obtiene todas las plantillas registradas
   * @returns {Array} Lista de nombres de plantillas
   */
  getAllTemplateNames() {
    return Array.from(this.templates.keys());
  }
  
  /**
   * Verifica si una plantilla existe
   * @param {string} name - Nombre de la plantilla
   * @returns {boolean} true si existe, false en caso contrario
   */
  hasTemplate(name) {
    return this.templates.has(name);
  }
}

// Exportar instancia del servicio
module.exports = new TemplateService();
