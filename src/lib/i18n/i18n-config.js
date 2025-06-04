/**
 * @fileoverview Configuración central para internacionalización (i18n) en el proyecto Armonía
 * 
 * Este módulo proporciona la configuración base para el soporte multiidioma en toda la aplicación,
 * utilizando next-i18next para la integración con Next.js y React.
 * 
 * @module i18n-config
 * @requires next-i18next
 */

/**
 * Configuración de idiomas soportados por la aplicación
 * @type {Object}
 */
const SUPPORTED_LANGUAGES = {
  es: {
    code: 'es',
    name: 'Español',
    localName: 'Español',
    countryCode: 'ES',
    direction: 'ltr',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm',
    isDefault: true
  },
  en: {
    code: 'en',
    name: 'English',
    localName: 'English',
    countryCode: 'US',
    direction: 'ltr',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: 'hh:mm a',
    isDefault: false
  }
};

/**
 * Códigos de idioma soportados
 * @type {Array<string>}
 */
const LANGUAGE_CODES = Object.keys(SUPPORTED_LANGUAGES);

/**
 * Idioma predeterminado de la aplicación
 * @type {string}
 */
const DEFAULT_LANGUAGE = LANGUAGE_CODES.find(
  code => SUPPORTED_LANGUAGES[code].isDefault
) || 'es';

/**
 * Configuración para next-i18next
 * @type {Object}
 */
const i18nConfig = {
  defaultLocale: DEFAULT_LANGUAGE,
  locales: LANGUAGE_CODES,
  localeDetection: true,
  fallbackLng: DEFAULT_LANGUAGE,
  
  // Configuración de namespaces para organizar las traducciones
  ns: [
    'common',       // Textos comunes en toda la aplicación
    'auth',         // Autenticación y gestión de usuarios
    'dashboard',    // Panel principal
    'admin',        // Administración
    'pqr',          // Sistema PQR
    'assembly',     // Módulo de asambleas
    'payments',     // Pagos y facturación
    'biometrics',   // Accesos biométricos
    'notifications' // Notificaciones
  ],
  defaultNS: 'common',
  
  // Opciones para detección de idioma en navegador
  detection: {
    order: ['cookie', 'localStorage', 'navigator', 'path', 'htmlTag'],
    lookupCookie: 'ARMONIA_LANGUAGE',
    lookupLocalStorage: 'ARMONIA_LANGUAGE',
    caches: ['cookie', 'localStorage']
  },
  
  // Configuración para React
  react: {
    useSuspense: false,
    bindI18n: 'languageChanged loaded',
    bindI18nStore: 'added removed',
    transEmptyNodeValue: '',
    transSupportBasicHtmlNodes: true,
    transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'p', 'span'],
    skipInitialProps: false
  }
};

/**
 * Obtiene la configuración de un idioma específico
 * @param {string} langCode - Código de idioma
 * @returns {Object|null} Configuración del idioma o null si no existe
 */
function getLanguageConfig(langCode) {
  return SUPPORTED_LANGUAGES[langCode] || null;
}

/**
 * Verifica si un idioma está soportado
 * @param {string} langCode - Código de idioma a verificar
 * @returns {boolean} True si el idioma está soportado
 */
function isLanguageSupported(langCode) {
  return LANGUAGE_CODES.includes(langCode);
}

/**
 * Obtiene el idioma predeterminado
 * @returns {string} Código del idioma predeterminado
 */
function getDefaultLanguage() {
  return DEFAULT_LANGUAGE;
}

/**
 * Obtiene todos los idiomas soportados
 * @returns {Array<Object>} Lista de configuraciones de idiomas
 */
function getAllLanguages() {
  return LANGUAGE_CODES.map(code => SUPPORTED_LANGUAGES[code]);
}

/**
 * Formatea una fecha según la configuración del idioma
 * @param {Date} date - Fecha a formatear
 * @param {string} langCode - Código de idioma
 * @returns {string} Fecha formateada
 */
function formatDate(date, langCode = DEFAULT_LANGUAGE) {
  const language = SUPPORTED_LANGUAGES[langCode] || SUPPORTED_LANGUAGES[DEFAULT_LANGUAGE];
  const options = { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit' 
  };
  
  return new Intl.DateTimeFormat(
    `${language.code}-${language.countryCode}`, 
    options
  ).format(date);
}

/**
 * Formatea una hora según la configuración del idioma
 * @param {Date} date - Fecha/hora a formatear
 * @param {string} langCode - Código de idioma
 * @returns {string} Hora formateada
 */
function formatTime(date, langCode = DEFAULT_LANGUAGE) {
  const language = SUPPORTED_LANGUAGES[langCode] || SUPPORTED_LANGUAGES[DEFAULT_LANGUAGE];
  const options = { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: language.timeFormat.includes('a')
  };
  
  return new Intl.DateTimeFormat(
    `${language.code}-${language.countryCode}`, 
    options
  ).format(date);
}

/**
 * Formatea un número según la configuración del idioma
 * @param {number} num - Número a formatear
 * @param {Object} options - Opciones de formato
 * @param {string} langCode - Código de idioma
 * @returns {string} Número formateado
 */
function formatNumber(num, options = {}, langCode = DEFAULT_LANGUAGE) {
  const language = SUPPORTED_LANGUAGES[langCode] || SUPPORTED_LANGUAGES[DEFAULT_LANGUAGE];
  
  return new Intl.NumberFormat(
    `${language.code}-${language.countryCode}`, 
    options
  ).format(num);
}

/**
 * Formatea una moneda según la configuración del idioma
 * @param {number} amount - Cantidad a formatear
 * @param {string} currencyCode - Código de moneda (ISO 4217)
 * @param {string} langCode - Código de idioma
 * @returns {string} Cantidad formateada como moneda
 */
function formatCurrency(amount, currencyCode = 'COP', langCode = DEFAULT_LANGUAGE) {
  const language = SUPPORTED_LANGUAGES[langCode] || SUPPORTED_LANGUAGES[DEFAULT_LANGUAGE];
  const options = { 
    style: 'currency', 
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  };
  
  return new Intl.NumberFormat(
    `${language.code}-${language.countryCode}`, 
    options
  ).format(amount);
}

module.exports = {
  i18nConfig,
  SUPPORTED_LANGUAGES,
  LANGUAGE_CODES,
  DEFAULT_LANGUAGE,
  getLanguageConfig,
  isLanguageSupported,
  getDefaultLanguage,
  getAllLanguages,
  formatDate,
  formatTime,
  formatNumber,
  formatCurrency
};
