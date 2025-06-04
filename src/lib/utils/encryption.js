/**
 * Utilidad de encriptación para la aplicación Armonía
 * Proporciona funciones para encriptar y desencriptar datos sensibles
 * Adaptado a CommonJS para compatibilidad con Jest
 */

const crypto = require('crypto');
const { ServerLogger } = require('../logging/server-logger');

const logger = new ServerLogger('EncryptionService');

// Algoritmo de encriptación
const ALGORITHM = 'aes-256-gcm';

// Tamaño de la clave en bytes
const KEY_LENGTH = 32;

// Tamaño del vector de inicialización en bytes
const IV_LENGTH = 16;

// Tamaño del auth tag en bytes
const AUTH_TAG_LENGTH = 16;

/**
 * Genera una clave de encriptación a partir de una contraseña
 * @param {string} password - Contraseña para generar la clave
 * @param {string} salt - Salt para la derivación de clave
 * @returns {Buffer} - Clave derivada
 */
function generateKey(password, salt) {
  try {
    if (!password) {
      throw new Error('Se requiere una contraseña para generar la clave');
    }
    
    const derivedKey = crypto.scryptSync(
      password,
      salt || process.env.ENCRYPTION_SALT || 'armonia-salt',
      KEY_LENGTH
    );
    
    return derivedKey;
  } catch (error) {
    logger.error(`Error al generar clave de encriptación: ${error.message}`);
    throw error;
  }
}

/**
 * Encripta datos utilizando AES-256-GCM
 * @param {string|Object} data - Datos a encriptar
 * @param {string} password - Contraseña para encriptación (opcional, usa ENV por defecto)
 * @returns {string} - Datos encriptados en formato hexadecimal
 */
function encryptData(data, password) {
  try {
    if (!data) {
      throw new Error('No se proporcionaron datos para encriptar');
    }
    
    // Convertir objeto a string si es necesario
    const dataString = typeof data === 'object' ? JSON.stringify(data) : String(data);
    
    // Generar vector de inicialización aleatorio
    const iv = crypto.randomBytes(IV_LENGTH);
    
    // Generar clave a partir de contraseña o usar la de entorno
    const key = generateKey(
      password || process.env.ENCRYPTION_KEY || 'armonia-encryption-key',
      process.env.ENCRYPTION_SALT || 'armonia-salt'
    );
    
    // Crear cipher con algoritmo, clave y vector de inicialización
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    // Encriptar datos
    let encrypted = cipher.update(dataString, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Obtener auth tag
    const authTag = cipher.getAuthTag();
    
    // Combinar IV, datos encriptados y auth tag
    const result = iv.toString('hex') + ':' + encrypted + ':' + authTag.toString('hex');
    
    logger.debug('Datos encriptados correctamente');
    return result;
  } catch (error) {
    logger.error(`Error al encriptar datos: ${error.message}`);
    throw error;
  }
}

/**
 * Desencripta datos utilizando AES-256-GCM
 * @param {string} encryptedData - Datos encriptados en formato hexadecimal
 * @param {string} password - Contraseña para desencriptación (opcional, usa ENV por defecto)
 * @returns {string|Object} - Datos desencriptados
 */
function decryptData(encryptedData, password) {
  try {
    if (!encryptedData) {
      throw new Error('No se proporcionaron datos para desencriptar');
    }
    
    // Separar IV, datos encriptados y auth tag
    const parts = encryptedData.split(':');
    
    if (parts.length !== 3) {
      throw new Error('Formato de datos encriptados inválido');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    const authTag = Buffer.from(parts[2], 'hex');
    
    // Generar clave a partir de contraseña o usar la de entorno
    const key = generateKey(
      password || process.env.ENCRYPTION_KEY || 'armonia-encryption-key',
      process.env.ENCRYPTION_SALT || 'armonia-salt'
    );
    
    // Crear decipher con algoritmo, clave y vector de inicialización
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    
    // Establecer auth tag
    decipher.setAuthTag(authTag);
    
    // Desencriptar datos
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    logger.debug('Datos desencriptados correctamente');
    
    // Intentar parsear como JSON si es posible
    try {
      return JSON.parse(decrypted);
    } catch (e) {
      // Si no es JSON válido, devolver como string
      return decrypted;
    }
  } catch (error) {
    logger.error(`Error al desencriptar datos: ${error.message}`);
    throw error;
  }
}

/**
 * Genera un hash seguro para contraseñas
 * @param {string} password - Contraseña a hashear
 * @param {string} salt - Salt para el hash (opcional)
 * @returns {string} - Hash de la contraseña
 */
function hashPassword(password, salt) {
  try {
    if (!password) {
      throw new Error('Se requiere una contraseña para generar el hash');
    }
    
    // Generar salt aleatorio si no se proporciona
    const passwordSalt = salt || crypto.randomBytes(16).toString('hex');
    
    // Generar hash
    const hash = crypto.pbkdf2Sync(
      password,
      passwordSalt,
      10000, // Iteraciones
      64,    // Longitud de clave
      'sha512'
    ).toString('hex');
    
    // Devolver salt y hash combinados
    return `${passwordSalt}:${hash}`;
  } catch (error) {
    logger.error(`Error al generar hash de contraseña: ${error.message}`);
    throw error;
  }
}

/**
 * Verifica una contraseña contra un hash
 * @param {string} password - Contraseña a verificar
 * @param {string} hashedPassword - Hash almacenado
 * @returns {boolean} - True si la contraseña coincide
 */
function verifyPassword(password, hashedPassword) {
  try {
    if (!password || !hashedPassword) {
      throw new Error('Se requieren contraseña y hash para verificación');
    }
    
    // Separar salt y hash
    const [salt, originalHash] = hashedPassword.split(':');
    
    // Generar hash con la misma salt
    const hash = crypto.pbkdf2Sync(
      password,
      salt,
      10000, // Iteraciones (debe coincidir con hashPassword)
      64,    // Longitud de clave
      'sha512'
    ).toString('hex');
    
    // Comparar hashes
    return hash === originalHash;
  } catch (error) {
    logger.error(`Error al verificar contraseña: ${error.message}`);
    return false;
  }
}

/**
 * Genera un token seguro aleatorio
 * @param {number} length - Longitud del token en bytes
 * @returns {string} - Token generado en formato hexadecimal
 */
function generateSecureToken(length = 32) {
  try {
    return crypto.randomBytes(length).toString('hex');
  } catch (error) {
    logger.error(`Error al generar token seguro: ${error.message}`);
    throw error;
  }
}

// Exportar funciones usando CommonJS para compatibilidad con Jest
module.exports = {
  encryptData,
  decryptData,
  hashPassword,
  verifyPassword,
  generateSecureToken,
  generateKey
};
