/**
 * Servicio de Plantillas de Facturas para la aplicación Armonía
 * Proporciona funcionalidades para gestión de plantillas de facturas
 * Adaptado a CommonJS para compatibilidad con Jest
 */

const { ServerLogger } = require('../logging/server-logger');
const { PrismaClient } = require('@prisma/client');

const logger = new ServerLogger('InvoiceTemplateService');

/**
 * Clase que gestiona las plantillas de facturas
 */
class InvoiceTemplateService {
  /**
   * Constructor del servicio
   * @param {string} schemaName - Nombre del esquema/comunidad
   */
  constructor(schemaName) {
    if (!schemaName) {
      throw new Error('Se requiere un nombre de esquema para el servicio de plantillas de facturas');
    }
    
    this.schemaName = schemaName;
    this.prisma = new PrismaClient({
      datasources: {
        db: {
          url: `${process.env.DATABASE_URL}?schema=${schemaName}`
        }
      }
    });
    
    logger.info(`Servicio de plantillas de facturas inicializado para esquema: ${schemaName}`);
  }
  
  /**
   * Obtiene todas las plantillas de facturas
   * @returns {Promise<Array>} - Lista de plantillas
   */
  async getAllTemplates() {
    try {
      const templates = await this.prisma.invoiceTemplate.findMany({
        orderBy: {
          updatedAt: 'desc'
        }
      });
      
      logger.info(`Recuperadas ${templates.length} plantillas de facturas`);
      return templates;
    } catch (error) {
      logger.error(`Error al obtener plantillas de facturas: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Obtiene una plantilla de factura por ID
   * @param {string} id - ID de la plantilla
   * @returns {Promise<Object>} - Plantilla encontrada
   */
  async getTemplateById(id) {
    try {
      if (!id) {
        throw new Error('Se requiere un ID para obtener la plantilla');
      }
      
      const template = await this.prisma.invoiceTemplate.findUnique({
        where: { id }
      });
      
      if (!template) {
        logger.warn(`Plantilla de factura no encontrada: ${id}`);
        return null;
      }
      
      logger.info(`Recuperada plantilla de factura: ${id}`);
      return template;
    } catch (error) {
      logger.error(`Error al obtener plantilla de factura ${id}: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Crea una nueva plantilla de factura
   * @param {Object} templateData - Datos de la plantilla
   * @param {string} templateData.name - Nombre de la plantilla
   * @param {string} templateData.description - Descripción de la plantilla
   * @param {string} templateData.content - Contenido HTML/JSON de la plantilla
   * @param {boolean} templateData.isDefault - Si es la plantilla por defecto
   * @returns {Promise<Object>} - Plantilla creada
   */
  async createTemplate(templateData) {
    try {
      if (!templateData || !templateData.name || !templateData.content) {
        throw new Error('Datos de plantilla incompletos');
      }
      
      // Si la nueva plantilla es por defecto, quitar el estado por defecto de otras plantillas
      if (templateData.isDefault) {
        await this.prisma.invoiceTemplate.updateMany({
          where: { isDefault: true },
          data: { isDefault: false }
        });
      }
      
      const template = await this.prisma.invoiceTemplate.create({
        data: {
          name: templateData.name,
          description: templateData.description || '',
          content: templateData.content,
          isDefault: templateData.isDefault || false,
          createdBy: templateData.createdBy || 'system'
        }
      });
      
      logger.info(`Creada nueva plantilla de factura: ${template.id}`);
      return template;
    } catch (error) {
      logger.error(`Error al crear plantilla de factura: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Actualiza una plantilla de factura existente
   * @param {string} id - ID de la plantilla
   * @param {Object} templateData - Datos a actualizar
   * @returns {Promise<Object>} - Plantilla actualizada
   */
  async updateTemplate(id, templateData) {
    try {
      if (!id) {
        throw new Error('Se requiere un ID para actualizar la plantilla');
      }
      
      // Verificar que la plantilla existe
      const existingTemplate = await this.prisma.invoiceTemplate.findUnique({
        where: { id }
      });
      
      if (!existingTemplate) {
        logger.warn(`Plantilla de factura no encontrada para actualizar: ${id}`);
        return null;
      }
      
      // Si la plantilla actualizada es por defecto, quitar el estado por defecto de otras plantillas
      if (templateData.isDefault) {
        await this.prisma.invoiceTemplate.updateMany({
          where: { 
            isDefault: true,
            id: { not: id }
          },
          data: { isDefault: false }
        });
      }
      
      const updatedTemplate = await this.prisma.invoiceTemplate.update({
        where: { id },
        data: {
          name: templateData.name !== undefined ? templateData.name : existingTemplate.name,
          description: templateData.description !== undefined ? templateData.description : existingTemplate.description,
          content: templateData.content !== undefined ? templateData.content : existingTemplate.content,
          isDefault: templateData.isDefault !== undefined ? templateData.isDefault : existingTemplate.isDefault,
          updatedAt: new Date(),
          updatedBy: templateData.updatedBy || 'system'
        }
      });
      
      logger.info(`Actualizada plantilla de factura: ${id}`);
      return updatedTemplate;
    } catch (error) {
      logger.error(`Error al actualizar plantilla de factura ${id}: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Elimina una plantilla de factura
   * @param {string} id - ID de la plantilla
   * @returns {Promise<boolean>} - Resultado de la operación
   */
  async deleteTemplate(id) {
    try {
      if (!id) {
        throw new Error('Se requiere un ID para eliminar la plantilla');
      }
      
      // Verificar que la plantilla existe
      const existingTemplate = await this.prisma.invoiceTemplate.findUnique({
        where: { id }
      });
      
      if (!existingTemplate) {
        logger.warn(`Plantilla de factura no encontrada para eliminar: ${id}`);
        return false;
      }
      
      // No permitir eliminar la plantilla por defecto
      if (existingTemplate.isDefault) {
        logger.warn(`No se puede eliminar la plantilla por defecto: ${id}`);
        throw new Error('No se puede eliminar la plantilla por defecto');
      }
      
      await this.prisma.invoiceTemplate.delete({
        where: { id }
      });
      
      logger.info(`Eliminada plantilla de factura: ${id}`);
      return true;
    } catch (error) {
      logger.error(`Error al eliminar plantilla de factura ${id}: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Obtiene la plantilla por defecto
   * @returns {Promise<Object>} - Plantilla por defecto
   */
  async getDefaultTemplate() {
    try {
      const defaultTemplate = await this.prisma.invoiceTemplate.findFirst({
        where: { isDefault: true }
      });
      
      if (!defaultTemplate) {
        logger.warn('No se encontró plantilla por defecto');
        return null;
      }
      
      logger.info(`Recuperada plantilla por defecto: ${defaultTemplate.id}`);
      return defaultTemplate;
    } catch (error) {
      logger.error(`Error al obtener plantilla por defecto: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Establece una plantilla como predeterminada
   * @param {string} id - ID de la plantilla
   * @returns {Promise<Object>} - Plantilla actualizada
   */
  async setDefaultTemplate(id) {
    try {
      if (!id) {
        throw new Error('Se requiere un ID para establecer la plantilla por defecto');
      }
      
      // Verificar que la plantilla existe
      const existingTemplate = await this.prisma.invoiceTemplate.findUnique({
        where: { id }
      });
      
      if (!existingTemplate) {
        logger.warn(`Plantilla de factura no encontrada: ${id}`);
        return null;
      }
      
      // Quitar el estado por defecto de todas las plantillas
      await this.prisma.invoiceTemplate.updateMany({
        where: { isDefault: true },
        data: { isDefault: false }
      });
      
      // Establecer la nueva plantilla por defecto
      const updatedTemplate = await this.prisma.invoiceTemplate.update({
        where: { id },
        data: { isDefault: true }
      });
      
      logger.info(`Establecida plantilla por defecto: ${id}`);
      return updatedTemplate;
    } catch (error) {
      logger.error(`Error al establecer plantilla por defecto ${id}: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Renderiza una factura con una plantilla específica
   * @param {string} templateId - ID de la plantilla (opcional, usa la predeterminada si no se proporciona)
   * @param {Object} invoiceData - Datos de la factura
   * @returns {Promise<string>} - HTML renderizado
   */
  async renderInvoice(templateId, invoiceData) {
    try {
      if (!invoiceData) {
        throw new Error('Se requieren datos de factura para renderizar');
      }
      
      // Obtener la plantilla
      let template;
      
      if (templateId) {
        template = await this.getTemplateById(templateId);
      } else {
        template = await this.getDefaultTemplate();
      }
      
      if (!template) {
        throw new Error('No se encontró plantilla para renderizar la factura');
      }
      
      // Renderizar la plantilla con los datos
      // En una implementación real, aquí se usaría un motor de plantillas como Handlebars o EJS
      let renderedContent = template.content;
      
      // Reemplazar variables en la plantilla
      Object.keys(invoiceData).forEach(key => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        renderedContent = renderedContent.replace(regex, invoiceData[key]);
      });
      
      logger.info(`Factura renderizada con plantilla: ${template.id}`);
      return renderedContent;
    } catch (error) {
      logger.error(`Error al renderizar factura: ${error.message}`);
      throw error;
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
module.exports = InvoiceTemplateService;
