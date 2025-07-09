
import crypto from 'crypto';
import { ServerLogger } from '../logging/server-logger'; // Asumiendo que existe este logger

const logger = new ServerLogger('EncryptionService');

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;

function generateKey(password: string, salt?: string): Buffer {
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
  } catch (error: any) {
    logger.error(`Error al generar clave de encriptación: ${error.message}`);
    throw error;
  }
}

export function encryptData(data: string | object, password?: string): string {
  try {
    if (!data) {
      throw new Error('No se proporcionaron datos para encriptar');
    }
    
    const dataString = typeof data === 'object' ? JSON.stringify(data) : String(data);
    const iv = crypto.randomBytes(IV_LENGTH);
    const key = generateKey(
      password || process.env.ENCRYPTION_KEY || 'armonia-encryption-key',
      process.env.ENCRYPTION_SALT
    );
    
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(dataString, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return `${iv.toString('hex')}:${encrypted}:${authTag.toString('hex')}`;
  } catch (error: any) {
    logger.error(`Error al encriptar datos: ${error.message}`);
    throw error;
  }
}

export function decryptData(encryptedData: string, password?: string): string | object {
  try {
    if (!encryptedData) {
      throw new Error('No se proporcionaron datos para desencriptar');
    }
    
    const parts = encryptedData.split(':');
    if (parts.length !== 3) {
      throw new Error('Formato de datos encriptados inválido');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    const authTag = Buffer.from(parts[2], 'hex');
    
    const key = generateKey(
      password || process.env.ENCRYPTION_KEY || 'armonia-encryption-key',
      process.env.ENCRYPTION_SALT
    );
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    try {
      return JSON.parse(decrypted);
    } catch (e) {
      return decrypted;
    }
  } catch (error: any) {
    logger.error(`Error al desencriptar datos: ${error.message}`);
    throw error;
  }
}

export function hashPassword(password: string, salt?: string): string {
    try {
        if (!password) {
            throw new Error('Se requiere una contraseña para generar el hash');
        }
        const passwordSalt = salt || crypto.randomBytes(16).toString('hex');
        const hash = crypto.pbkdf2Sync(password, passwordSalt, 10000, 64, 'sha512').toString('hex');
        return `${passwordSalt}:${hash}`;
    } catch (error: any) {
        logger.error(`Error al generar hash de contraseña: ${error.message}`);
        throw error;
    }
}

export function verifyPassword(password: string, hashedPassword: string): boolean {
    try {
        if (!password || !hashedPassword) {
            throw new Error('Se requieren contraseña y hash para verificación');
        }
        const [salt, originalHash] = hashedPassword.split(':');
        const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
        return hash === originalHash;
    } catch (error: any) {
        logger.error(`Error al verificar contraseña: ${error.message}`);
        return false;
    }
}

export function generateSecureToken(length: number = 32): string {
    try {
        return crypto.randomBytes(length).toString('hex');
    } catch (error: any) {
        logger.error(`Error al generar token seguro: ${error.message}`);
        throw error;
    }
}
