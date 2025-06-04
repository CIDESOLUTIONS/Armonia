/**
 * Configuración de internacionalización para el proyecto Armonía
 * 
 * Este módulo proporciona la configuración central para la internacionalización
 * del proyecto, incluyendo idiomas soportados, formatos de fecha/hora/moneda,
 * y funciones auxiliares para la detección y cambio de idioma.
 */

const { createIntl, createIntlCache } = require('@formatjs/intl');
const logger = require('../logging/server-logger');

// Idiomas soportados por la aplicación
const SUPPORTED_LANGUAGES = {
  es: {
    code: 'es',
    name: 'Español',
    locale: 'es-ES',
    default: true,
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm',
    currencyFormat: {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }
  },
  en: {
    code: 'en',
    name: 'English',
    locale: 'en-US',
    default: false,
    dateFormat: 'MM/DD/YYYY',
    timeFormat: 'hh:mm a',
    currencyFormat: {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }
  }
};

// Idioma por defecto
const DEFAULT_LANGUAGE = 'es';

// Cache para optimizar rendimiento de formateo
const cache = createIntlCache();

// Instancias de intl para cada idioma
const intlInstances = {};

// Inicializar instancias de intl para cada idioma
Object.keys(SUPPORTED_LANGUAGES).forEach(langCode => {
  try {
    const messages = require(`./translations/${langCode}.json`);
    intlInstances[langCode] = createIntl({
      locale: SUPPORTED_LANGUAGES[langCode].locale,
      messages,
      defaultLocale: SUPPORTED_LANGUAGES[DEFAULT_LANGUAGE].locale
    }, cache);
  } catch (error) {
    logger.error(`Error loading translations for ${langCode}`, { error });
    // Fallback a un objeto vacío si no se pueden cargar las traducciones
    intlInstances[langCode] = createIntl({
      locale: SUPPORTED_LANGUAGES[langCode].locale,
      messages: {},
      defaultLocale: SUPPORTED_LANGUAGES[DEFAULT_LANGUAGE].locale
    }, cache);
  }
});

/**
 * Clase que gestiona la configuración de internacionalización
 */
class I18nConfig {
  /**
   * Constructor de la configuración de i18n
   */
  constructor() {
    this.supportedLanguages = SUPPORTED_LANGUAGES;
    this.defaultLanguage = DEFAULT_LANGUAGE;
    this.intlInstances = intlInstances;
    
    logger.info('I18nConfig initialized');
  }
  
  /**
   * Obtiene los idiomas soportados por la aplicación
   * @returns {Object} Idiomas soportados
   */
  getSupportedLanguages() {
    return this.supportedLanguages;
  }
  
  /**
   * Obtiene el idioma por defecto
   * @returns {string} Código del idioma por defecto
   */
  getDefaultLanguage() {
    return this.defaultLanguage;
  }
  
  /**
   * Verifica si un idioma está soportado
   * @param {string} langCode - Código del idioma a verificar
   * @returns {boolean} true si el idioma está soportado, false en caso contrario
   */
  isLanguageSupported(langCode) {
    return !!this.supportedLanguages[langCode];
  }
  
  /**
   * Detecta el idioma preferido del usuario basado en cabeceras HTTP y cookies
   * @param {Object} req - Objeto de solicitud HTTP
   * @returns {string} Código del idioma detectado o idioma por defecto
   */
  detectLanguage(req) {
    try {
      // Intentar obtener el idioma de la cookie
      const cookieLang = req.cookies?.NEXT_LOCALE;
      if (cookieLang && this.isLanguageSupported(cookieLang)) {
        return cookieLang;
      }
      
      // Intentar obtener el idioma de la cabecera Accept-Language
      const acceptLanguage = req.headers['accept-language'];
      if (acceptLanguage) {
        // Parsear la cabecera Accept-Language
        const languages = acceptLanguage.split(',')
          .map(lang => {
            const [code, q = 'q=1.0'] = lang.trim().split(';');
            const quality = parseFloat(q.split('=')[1]) || 0;
            return { code: code.split('-')[0], quality };
          })
          .sort((a, b) => b.quality - a.quality);
        
        // Buscar el primer idioma soportado
        for (const lang of languages) {
          if (this.isLanguageSupported(lang.code)) {
            return lang.code;
          }
        }
      }
      
      // Si no se pudo detectar, usar el idioma por defecto
      return this.defaultLanguage;
    } catch (error) {
      logger.error('Error detecting language', { error });
      return this.defaultLanguage;
    }
  }
  
  /**
   * Obtiene la instancia de intl para un idioma específico
   * @param {string} langCode - Código del idioma
   * @returns {Object} Instancia de intl para el idioma especificado o para el idioma por defecto
   */
  getIntl(langCode) {
    if (!this.isLanguageSupported(langCode)) {
      logger.warn(`Language ${langCode} not supported, using default`);
      return this.intlInstances[this.defaultLanguage];
    }
    
    return this.intlInstances[langCode];
  }
  
  /**
   * Traduce un mensaje a un idioma específico
   * @param {string} id - ID del mensaje a traducir
   * @param {string} langCode - Código del idioma
   * @param {Object} values - Valores para interpolar en el mensaje
   * @returns {string} Mensaje traducido
   */
  translate(id, langCode, values = {}) {
    try {
      const intl = this.getIntl(langCode);
      return intl.formatMessage({ id }, values);
    } catch (error) {
      logger.error(`Error translating message ${id}`, { error, langCode });
      // Fallback al ID del mensaje si no se puede traducir
      return id;
    }
  }
  
  /**
   * Formatea una fecha según el formato del idioma
   * @param {Date|string|number} date - Fecha a formatear
   * @param {string} langCode - Código del idioma
   * @param {Object} options - Opciones adicionales de formato
   * @returns {string} Fecha formateada
   */
  formatDate(date, langCode, options = {}) {
    try {
      const intl = this.getIntl(langCode);
      const language = this.supportedLanguages[langCode] || this.supportedLanguages[this.defaultLanguage];
      
      return intl.formatDate(date, {
        ...options,
        timeZone: options.timeZone || 'UTC'
      });
    } catch (error) {
      logger.error('Error formatting date', { error, langCode });
      // Fallback a formato ISO
      return new Date(date).toISOString();
    }
  }
  
  /**
   * Formatea una cantidad monetaria según el formato del idioma
   * @param {number} amount - Cantidad a formatear
   * @param {string} langCode - Código del idioma
   * @param {Object} options - Opciones adicionales de formato
   * @returns {string} Cantidad formateada
   */
  formatCurrency(amount, langCode, options = {}) {
    try {
      const intl = this.getIntl(langCode);
      const language = this.supportedLanguages[langCode] || this.supportedLanguages[this.defaultLanguage];
      
      return intl.formatNumber(amount, {
        ...language.currencyFormat,
        ...options
      });
    } catch (error) {
      logger.error('Error formatting currency', { error, langCode });
      // Fallback a formato simple
      return `${amount.toFixed(2)}`;
    }
  }
  
  /**
   * Formatea un número según el formato del idioma
   * @param {number} number - Número a formatear
   * @param {string} langCode - Código del idioma
   * @param {Object} options - Opciones adicionales de formato
   * @returns {string} Número formateado
   */
  formatNumber(number, langCode, options = {}) {
    try {
      const intl = this.getIntl(langCode);
      
      return intl.formatNumber(number, options);
    } catch (error) {
      logger.error('Error formatting number', { error, langCode });
      // Fallback a formato simple
      return `${number}`;
    }
  }
  
  /**
   * Obtiene la configuración de formato para un idioma específico
   * @param {string} langCode - Código del idioma
   * @returns {Object} Configuración de formato
   */
  getFormatConfig(langCode) {
    const language = this.supportedLanguages[langCode] || this.supportedLanguages[this.defaultLanguage];
    
    return {
      dateFormat: language.dateFormat,
      timeFormat: language.timeFormat,
      currencyFormat: language.currencyFormat
    };
  }
}

// Exportar instancia de la configuración
module.exports = new I18nConfig();
