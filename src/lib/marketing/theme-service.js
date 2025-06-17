import { getPrisma } from '@/lib/prisma';
/**
 * Servicio de personalización visual para Armonía
 * 
 * Este servicio proporciona funcionalidades para la personalización visual
 * de la aplicación, incluyendo sistema de temas (claro/oscuro) y opciones
 * de personalización por usuario y comunidad.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = getPrisma();
const logger = require('../logging/server-logger');

/**
 * Temas predefinidos disponibles en la aplicación
 */
const PREDEFINED_THEMES = {
  light: {
    id: 'light',
    name: 'Claro',
    colors: {
      primary: '#3B82F6',
      secondary: '#10B981',
      accent: '#8B5CF6',
      background: '#FFFFFF',
      surface: '#F9FAFB',
      text: '#1F2937',
      textSecondary: '#6B7280',
      border: '#E5E7EB',
      error: '#EF4444',
      warning: '#F59E0B',
      success: '#10B981',
      info: '#3B82F6'
    },
    isDark: false
  },
  dark: {
    id: 'dark',
    name: 'Oscuro',
    colors: {
      primary: '#60A5FA',
      secondary: '#34D399',
      accent: '#A78BFA',
      background: '#111827',
      surface: '#1F2937',
      text: '#F9FAFB',
      textSecondary: '#D1D5DB',
      border: '#374151',
      error: '#F87171',
      warning: '#FBBF24',
      success: '#34D399',
      info: '#60A5FA'
    },
    isDark: true
  },
  sepia: {
    id: 'sepia',
    name: 'Sepia',
    colors: {
      primary: '#9F7AEA',
      secondary: '#38B2AC',
      accent: '#ED8936',
      background: '#FFF8F1',
      surface: '#FFF1E5',
      text: '#433422',
      textSecondary: '#7B6C5B',
      border: '#E8D6C3',
      error: '#E53E3E',
      warning: '#DD6B20',
      success: '#38A169',
      info: '#3182CE'
    },
    isDark: false
  },
  highContrast: {
    id: 'highContrast',
    name: 'Alto Contraste',
    colors: {
      primary: '#FFFF00',
      secondary: '#00FFFF',
      accent: '#FF00FF',
      background: '#000000',
      surface: '#121212',
      text: '#FFFFFF',
      textSecondary: '#EEEEEE',
      border: '#FFFFFF',
      error: '#FF0000',
      warning: '#FFFF00',
      success: '#00FF00',
      info: '#00FFFF'
    },
    isDark: true,
    accessibility: true
  }
};

/**
 * Clase que implementa el servicio de personalización visual
 */
class ThemeService {
  /**
   * Constructor del servicio de temas
   */
  constructor() {
    this.predefinedThemes = PREDEFINED_THEMES;
    this.defaultTheme = 'light';
    
    logger.info('ThemeService initialized');
  }
  
  /**
   * Obtiene todos los temas predefinidos
   * @returns {Object} Temas predefinidos
   */
  getPredefinedThemes() {
    return this.predefinedThemes;
  }
  
  /**
   * Obtiene un tema predefinido por su ID
   * @param {string} themeId - ID del tema
   * @returns {Object|null} Tema predefinido o null si no existe
   */
  getPredefinedTheme(themeId) {
    return this.predefinedThemes[themeId] || null;
  }
  
  /**
   * Obtiene el tema por defecto
   * @returns {Object} Tema por defecto
   */
  getDefaultTheme() {
    return this.predefinedThemes[this.defaultTheme];
  }
  
  /**
   * Obtiene el tema preferido de un usuario
   * @param {number} userId - ID del usuario
   * @returns {Promise<Object>} Tema preferido del usuario o tema por defecto
   */
  async getUserTheme(userId) {
    try {
      // Buscar preferencia de tema del usuario
      const userPreference = await prisma.userPreference.findFirst({
        where: { userId, key: 'theme' }
      });
      
      if (userPreference && userPreference.value) {
        // Verificar si es un tema predefinido
        const themeId = userPreference.value;
        if (this.predefinedThemes[themeId]) {
          return this.predefinedThemes[themeId];
        }
        
        // Verificar si es un tema personalizado
        const customTheme = await prisma.customTheme.findFirst({
          where: { id: parseInt(themeId, 10), userId }
        });
        
        if (customTheme) {
          return {
            id: `custom-${customTheme.id}`,
            name: customTheme.name,
            colors: JSON.parse(customTheme.colors),
            isDark: customTheme.isDark,
            isCustom: true
          };
        }
      }
      
      // Si no se encuentra preferencia o tema, devolver tema por defecto
      return this.getDefaultTheme();
    } catch (error) {
      logger.error(`Error getting user theme: ${error.message}`, { error, userId });
      return this.getDefaultTheme();
    }
  }
  
  /**
   * Obtiene el tema de una comunidad
   * @param {number} communityId - ID de la comunidad
   * @returns {Promise<Object>} Tema de la comunidad o tema por defecto
   */
  async getCommunityTheme(communityId) {
    try {
      // Buscar tema de la comunidad
      const community = await prisma.community.findUnique({
        where: { id: communityId },
        include: { theme: true }
      });
      
      if (community && community.theme) {
        return {
          id: `community-${community.theme.id}`,
          name: community.theme.name,
          colors: JSON.parse(community.theme.colors),
          isDark: community.theme.isDark,
          isCommunity: true
        };
      }
      
      // Si no se encuentra tema, devolver tema por defecto
      return this.getDefaultTheme();
    } catch (error) {
      logger.error(`Error getting community theme: ${error.message}`, { error, communityId });
      return this.getDefaultTheme();
    }
  }
  
  /**
   * Establece el tema preferido de un usuario
   * @param {number} userId - ID del usuario
   * @param {string} themeId - ID del tema
   * @returns {Promise<boolean>} true si se estableció correctamente, false en caso contrario
   */
  async setUserTheme(userId, themeId) {
    try {
      // Verificar si el tema existe
      if (!this.predefinedThemes[themeId] && !themeId.startsWith('custom-')) {
        throw new Error(`Theme ${themeId} not found`);
      }
      
      // Actualizar o crear preferencia de tema
      await prisma.userPreference.upsert({
        where: {
          userId_key: {
            userId,
            key: 'theme'
          }
        },
        update: {
          value: themeId
        },
        create: {
          userId,
          key: 'theme',
          value: themeId
        }
      });
      
      logger.info(`User theme set: ${userId} -> ${themeId}`);
      return true;
    } catch (error) {
      logger.error(`Error setting user theme: ${error.message}`, { error, userId, themeId });
      return false;
    }
  }
  
  /**
   * Crea un tema personalizado para un usuario
   * @param {number} userId - ID del usuario
   * @param {string} name - Nombre del tema
   * @param {Object} colors - Colores del tema
   * @param {boolean} isDark - Indica si es un tema oscuro
   * @returns {Promise<Object|null>} Tema creado o null si hubo un error
   */
  async createCustomTheme(userId, name, colors, isDark = false) {
    try {
      // Crear tema personalizado
      const customTheme = await prisma.customTheme.create({
        data: {
          userId,
          name,
          colors: JSON.stringify(colors),
          isDark
        }
      });
      
      // Establecer como tema preferido del usuario
      await this.setUserTheme(userId, `custom-${customTheme.id}`);
      
      logger.info(`Custom theme created: ${customTheme.id} for user ${userId}`);
      
      return {
        id: `custom-${customTheme.id}`,
        name,
        colors,
        isDark,
        isCustom: true
      };
    } catch (error) {
      logger.error(`Error creating custom theme: ${error.message}`, { error, userId });
      return null;
    }
  }
  
  /**
   * Actualiza un tema personalizado
   * @param {number} themeId - ID del tema personalizado
   * @param {number} userId - ID del usuario propietario
   * @param {Object} updates - Actualizaciones al tema
   * @returns {Promise<Object|null>} Tema actualizado o null si hubo un error
   */
  async updateCustomTheme(themeId, userId, updates) {
    try {
      // Extraer ID numérico si viene con prefijo
      const numericId = themeId.startsWith('custom-') ? 
        parseInt(themeId.replace('custom-', ''), 10) : 
        parseInt(themeId, 10);
      
      // Verificar que el tema exista y pertenezca al usuario
      const existingTheme = await prisma.customTheme.findFirst({
        where: { id: numericId, userId }
      });
      
      if (!existingTheme) {
        throw new Error(`Theme ${themeId} not found or does not belong to user ${userId}`);
      }
      
      // Preparar datos para actualización
      const updateData = {};
      if (updates.name) updateData.name = updates.name;
      if (updates.colors) updateData.colors = JSON.stringify(updates.colors);
      if (typeof updates.isDark === 'boolean') updateData.isDark = updates.isDark;
      
      // Actualizar tema
      const updatedTheme = await prisma.customTheme.update({
        where: { id: numericId },
        data: updateData
      });
      
      logger.info(`Custom theme updated: ${numericId}`);
      
      return {
        id: `custom-${updatedTheme.id}`,
        name: updatedTheme.name,
        colors: JSON.parse(updatedTheme.colors),
        isDark: updatedTheme.isDark,
        isCustom: true
      };
    } catch (error) {
      logger.error(`Error updating custom theme: ${error.message}`, { error, themeId, userId });
      return null;
    }
  }
  
  /**
   * Elimina un tema personalizado
   * @param {number} themeId - ID del tema personalizado
   * @param {number} userId - ID del usuario propietario
   * @returns {Promise<boolean>} true si se eliminó correctamente, false en caso contrario
   */
  async deleteCustomTheme(themeId, userId) {
    try {
      // Extraer ID numérico si viene con prefijo
      const numericId = themeId.startsWith('custom-') ? 
        parseInt(themeId.replace('custom-', ''), 10) : 
        parseInt(themeId, 10);
      
      // Verificar que el tema exista y pertenezca al usuario
      const existingTheme = await prisma.customTheme.findFirst({
        where: { id: numericId, userId }
      });
      
      if (!existingTheme) {
        throw new Error(`Theme ${themeId} not found or does not belong to user ${userId}`);
      }
      
      // Eliminar tema
      await prisma.customTheme.delete({
        where: { id: numericId }
      });
      
      // Si era el tema preferido del usuario, establecer tema por defecto
      const userPreference = await prisma.userPreference.findFirst({
        where: { userId, key: 'theme', value: `custom-${numericId}` }
      });
      
      if (userPreference) {
        await this.setUserTheme(userId, this.defaultTheme);
      }
      
      logger.info(`Custom theme deleted: ${numericId}`);
      return true;
    } catch (error) {
      logger.error(`Error deleting custom theme: ${error.message}`, { error, themeId, userId });
      return false;
    }
  }
  
  /**
   * Establece el tema de una comunidad
   * @param {number} communityId - ID de la comunidad
   * @param {Object} themeData - Datos del tema
   * @param {number} adminUserId - ID del usuario administrador
   * @returns {Promise<Object|null>} Tema establecido o null si hubo un error
   */
  async setCommunityTheme(communityId, themeData, adminUserId) {
    try {
      // Verificar que el usuario sea administrador de la comunidad
      const isAdmin = await prisma.communityMember.findFirst({
        where: {
          communityId,
          userId: adminUserId,
          role: 'ADMIN'
        }
      });
      
      if (!isAdmin) {
        throw new Error(`User ${adminUserId} is not an admin of community ${communityId}`);
      }
      
      // Buscar tema existente de la comunidad
      const existingTheme = await prisma.communityTheme.findFirst({
        where: { communityId }
      });
      
      let communityTheme;
      
      if (existingTheme) {
        // Actualizar tema existente
        communityTheme = await prisma.communityTheme.update({
          where: { id: existingTheme.id },
          data: {
            name: themeData.name,
            colors: JSON.stringify(themeData.colors),
            isDark: themeData.isDark || false
          }
        });
      } else {
        // Crear nuevo tema
        communityTheme = await prisma.communityTheme.create({
          data: {
            communityId,
            name: themeData.name,
            colors: JSON.stringify(themeData.colors),
            isDark: themeData.isDark || false
          }
        });
      }
      
      logger.info(`Community theme set: ${communityId}`);
      
      return {
        id: `community-${communityTheme.id}`,
        name: communityTheme.name,
        colors: JSON.parse(communityTheme.colors),
        isDark: communityTheme.isDark,
        isCommunity: true
      };
    } catch (error) {
      logger.error(`Error setting community theme: ${error.message}`, { error, communityId });
      return null;
    }
  }
  
  /**
   * Genera CSS para un tema específico
   * @param {Object} theme - Tema para el que generar CSS
   * @returns {string} CSS generado
   */
  generateThemeCSS(theme) {
    if (!theme || !theme.colors) {
      theme = this.getDefaultTheme();
    }
    
    const { colors } = theme;
    
    return `
      :root {
        --color-primary: ${colors.primary};
        --color-primary-light: ${this.adjustColor(colors.primary, 20)};
        --color-primary-dark: ${this.adjustColor(colors.primary, -20)};
        
        --color-secondary: ${colors.secondary};
        --color-secondary-light: ${this.adjustColor(colors.secondary, 20)};
        --color-secondary-dark: ${this.adjustColor(colors.secondary, -20)};
        
        --color-accent: ${colors.accent};
        --color-accent-light: ${this.adjustColor(colors.accent, 20)};
        --color-accent-dark: ${this.adjustColor(colors.accent, -20)};
        
        --color-background: ${colors.background};
        --color-surface: ${colors.surface};
        
        --color-text: ${colors.text};
        --color-text-secondary: ${colors.textSecondary};
        
        --color-border: ${colors.border};
        
        --color-error: ${colors.error};
        --color-warning: ${colors.warning};
        --color-success: ${colors.success};
        --color-info: ${colors.info};
        
        --font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      }
      
      body {
        background-color: var(--color-background);
        color: var(--color-text);
        font-family: var(--font-family);
      }
      
      a {
        color: var(--color-primary);
      }
      
      a:hover {
        color: var(--color-primary-dark);
      }
      
      button.primary {
        background-color: var(--color-primary);
        color: white;
      }
      
      button.secondary {
        background-color: var(--color-secondary);
        color: white;
      }
      
      button.accent {
        background-color: var(--color-accent);
        color: white;
      }
      
      .card {
        background-color: var(--color-surface);
        border: 1px solid var(--color-border);
      }
      
      .error-text {
        color: var(--color-error);
      }
      
      .warning-text {
        color: var(--color-warning);
      }
      
      .success-text {
        color: var(--color-success);
      }
      
      .info-text {
        color: var(--color-info);
      }
    `;
  }
  
  /**
   * Ajusta un color para hacerlo más claro o más oscuro
   * @param {string} color - Color en formato hexadecimal
   * @param {number} amount - Cantidad de ajuste (-100 a 100)
   * @returns {string} Color ajustado
   * @private
   */
  adjustColor(color, amount) {
    // Convertir color hexadecimal a RGB
    let hex = color.replace('#', '');
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    // Ajustar componentes RGB
    const adjustComponent = (component) => {
      const adjusted = component + amount;
      return Math.max(0, Math.min(255, adjusted));
    };
    
    const adjustedR = adjustComponent(r);
    const adjustedG = adjustComponent(g);
    const adjustedB = adjustComponent(b);
    
    // Convertir de nuevo a hexadecimal
    const toHex = (c) => {
      const hex = c.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    
    return `#${toHex(adjustedR)}${toHex(adjustedG)}${toHex(adjustedB)}`;
  }
  
  /**
   * Detecta si un tema es oscuro basado en el color de fondo
   * @param {Object} colors - Colores del tema
   * @returns {boolean} true si el tema es oscuro, false en caso contrario
   * @private
   */
  isThemeDark(colors) {
    // Convertir color de fondo a RGB
    const hex = colors.background.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    // Calcular luminosidad (fórmula YIQ)
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    
    // Si YIQ < 128, el color es oscuro
    return yiq < 128;
  }
}

// Exportar instancia del servicio
module.exports = new ThemeService();
