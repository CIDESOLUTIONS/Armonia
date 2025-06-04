/**
 * Servicio de encriptación para datos sensibles
 */

import crypto from 'crypto';

// Configuración de encriptación
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'armonia-default-encryption-key-32chars'; // Debe ser de 32 caracteres para AES-256
const ENCRYPTION_IV = process.env.ENCRYPTION_IV || 'armonia-iv-16chr'; // Debe ser de 16 caracteres
const ALGORITHM = 'aes-256-cbc';

/**
 * Encripta un texto usando AES-256-CBC
 * @param text Texto a encriptar
 * @returns Texto encriptado en formato hexadecimal
 */
export function encrypt(text: string): string {
  try {
    const iv = Buffer.from(ENCRYPTION_IV, 'utf8').slice(0, 16);
    const key = Buffer.from(ENCRYPTION_KEY, 'utf8').slice(0, 32);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return encrypted;
  } catch (error) {
    console.error('Error al encriptar:', error);
    throw new Error('Error de encriptación');
  }
}

/**
 * Desencripta un texto usando AES-256-CBC
 * @param encryptedText Texto encriptado en formato hexadecimal
 * @returns Texto desencriptado
 */
export function decrypt(encryptedText: string): string {
  try {
    const iv = Buffer.from(ENCRYPTION_IV, 'utf8').slice(0, 16);
    const key = Buffer.from(ENCRYPTION_KEY, 'utf8').slice(0, 32);
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Error al desencriptar:', error);
    throw new Error('Error de desencriptación');
  }
}

/**
 * Genera un hash seguro para contraseñas usando bcrypt
 * @param password Contraseña a hashear
 * @returns Hash de la contraseña
 */
export function hashPassword(password: string): string {
  // En una implementación real, usaríamos bcrypt
  // Por ahora, simulamos con SHA-256 + salt
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.createHash('sha256')
    .update(password + salt)
    .digest('hex');
  
  return `${salt}:${hash}`;
}

/**
 * Verifica si una contraseña coincide con su hash
 * @param password Contraseña a verificar
 * @param hashedPassword Hash almacenado
 * @returns true si la contraseña coincide, false en caso contrario
 */
export function verifyPassword(password: string, hashedPassword: string): boolean {
  try {
    const [salt, storedHash] = hashedPassword.split(':');
    
    const hash = crypto.createHash('sha256')
      .update(password + salt)
      .digest('hex');
    
    return storedHash === hash;
  } catch (error) {
    console.error('Error al verificar contraseña:', error);
    return false;
  }
}

/**
 * Genera un token seguro para autenticación
 * @param length Longitud del token
 * @returns Token generado
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}
