/**
 * Módulo de encriptación para la aplicación Armonía
 * Compatible con Next.js 15 y React 19
 */

import crypto from 'crypto';

// Configuración de encriptación
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'armonia-default-encryption-key-32chars';
const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16; // Para AES, esto es siempre 16 bytes

/**
 * Encripta un texto usando AES-256-CBC
 * @param text Texto a encriptar
 * @returns Texto encriptado en formato hexadecimal
 */
export function encrypt(text: string): string {
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
    
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  } catch (error) {
    console.error('Error en encriptación:', error);
    throw new Error('Error al encriptar datos');
  }
}

/**
 * Desencripta un texto previamente encriptado con encrypt()
 * @param text Texto encriptado en formato hexadecimal
 * @returns Texto original desencriptado
 */
export function decrypt(text: string): string {
  try {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift() || '', 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
    
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    return decrypted.toString();
  } catch (error) {
    console.error('Error en desencriptación:', error);
    throw new Error('Error al desencriptar datos');
  }
}

/**
 * Genera un hash seguro de una contraseña
 * @param password Contraseña a hashear
 * @returns Hash de la contraseña
 */
export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

/**
 * Verifica si una contraseña coincide con su hash
 * @param password Contraseña a verificar
 * @param hash Hash con el que comparar
 * @returns true si la contraseña coincide con el hash
 */
export function verifyPassword(password: string, hash: string): boolean {
  const passwordHash = hashPassword(password);
  return passwordHash === hash;
}

export default {
  encrypt,
  decrypt,
  hashPassword,
  verifyPassword
};
