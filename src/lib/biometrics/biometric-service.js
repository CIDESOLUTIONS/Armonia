/**
 * @fileoverview Servicio de autenticación biométrica para el proyecto Armonía
 * 
 * Este servicio proporciona una interfaz unificada para diferentes tipos de autenticación
 * biométrica, incluyendo huellas dactilares, reconocimiento facial y voz, utilizando
 * el estándar WebAuthn (FIDO2) para la autenticación web.
 * 
 * @module biometric-service
 * @requires @simplewebauthn/server
 * @requires @simplewebauthn/browser
 * @requires crypto-js
 * @requires ../utils/encryption
 */

const { 
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse
} = require('@simplewebauthn/server');

const { encrypt, decrypt } = require('../utils/encryption');
const CryptoJS = require('crypto-js');

// Configuración base para WebAuthn
const rpName = 'Armonía';
const rpID = process.env.NODE_ENV === 'production' 
  ? process.env.WEBAUTHN_RP_ID 
  : 'localhost';

const origin = process.env.NODE_ENV === 'production'
  ? `https://${process.env.WEBAUTHN_RP_ID}`
  : `http://localhost:3000`;

/**
 * Servicio para gestión de autenticación biométrica
 */
class BiometricService {
  /**
   * Crea una instancia del servicio biométrico
   * @param {Object} options - Opciones de configuración
   * @param {Object} options.db - Instancia de la base de datos (Prisma)
   * @param {Object} options.logger - Instancia del logger
   * @param {Object} options.notificationService - Servicio de notificaciones
   */
  constructor({ db, logger, notificationService }) {
    this.db = db;
    this.logger = logger;
    this.notificationService = notificationService;
    
    // Verificar dependencias requeridas
    if (!db) throw new Error('BiometricService requiere una instancia de base de datos');
    if (!logger) this.logger = console;
  }

  /**
   * Genera opciones para el registro de una nueva credencial biométrica
   * @param {Object} user - Usuario para el que se registrará la credencial
   * @param {string} deviceName - Nombre descriptivo del dispositivo
   * @param {string} [biometricType='fingerprint'] - Tipo de biometría (fingerprint, face, voice)
   * @returns {Promise<Object>} Opciones de registro para el cliente
   */
  async generateRegistrationOptions(user, deviceName, biometricType = 'fingerprint') {
    try {
      // Verificar que el usuario existe
      if (!user || !user.id) {
        throw new Error('Usuario inválido para registro biométrico');
      }

      // Obtener credenciales existentes para excluirlas
      const existingCredentials = await this.db.biometricCredential.findMany({
        where: { userId: user.id }
      });

      const excludeCredentials = existingCredentials.map(cred => ({
        id: Buffer.from(cred.credentialId, 'base64'),
        type: 'public-key',
        transports: cred.transports || ['internal']
      }));

      // Generar ID de desafío único y almacenarlo temporalmente
      const challenge = CryptoJS.lib.WordArray.random(32).toString();
      const encryptedChallenge = encrypt(challenge);
      
      // Guardar el desafío en la base de datos para verificación posterior
      await this.db.biometricChallenge.create({
        data: {
          userId: user.id,
          challenge: encryptedChallenge,
          deviceName,
          biometricType,
          expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutos de validez
        }
      });

      // Generar opciones según el estándar WebAuthn
      const options = generateRegistrationOptions({
        rpName,
        rpID,
        userID: user.id.toString(),
        userName: user.email,
        userDisplayName: user.name || user.email,
        attestationType: 'none',
        excludeCredentials,
        authenticatorSelection: {
          userVerification: 'preferred',
          residentKey: 'preferred',
          requireResidentKey: false,
          authenticatorAttachment: 'platform' // Para biometría integrada en dispositivo
        },
        challenge: Buffer.from(challenge, 'hex')
      });

      return options;
    } catch (error) {
      this.logger.error('Error al generar opciones de registro biométrico:', error);
      throw new Error(`Error al generar opciones de registro biométrico: ${error.message}`);
    }
  }

  /**
   * Verifica y registra una nueva credencial biométrica
   * @param {Object} user - Usuario para el que se registra la credencial
   * @param {Object} credential - Credencial generada por el cliente
   * @param {string} deviceName - Nombre descriptivo del dispositivo
   * @returns {Promise<Object>} Resultado de la verificación y registro
   */
  async verifyAndSaveRegistration(user, credential, deviceName) {
    try {
      // Buscar el desafío pendiente más reciente para este usuario
      const challengeRecord = await this.db.biometricChallenge.findFirst({
        where: {
          userId: user.id,
          deviceName,
          expiresAt: { gt: new Date() }
        },
        orderBy: { createdAt: 'desc' }
      });

      if (!challengeRecord) {
        throw new Error('No se encontró un desafío válido para este registro');
      }

      // Desencriptar el desafío almacenado
      const expectedChallenge = decrypt(challengeRecord.challenge);

      // Verificar la respuesta de registro según WebAuthn
      const verification = await verifyRegistrationResponse({
        response: credential,
        expectedChallenge,
        expectedOrigin: origin,
        expectedRPID: rpID
      });

      if (!verification.verified) {
        throw new Error('La verificación de la credencial biométrica falló');
      }

      // Extraer información de la credencial verificada
      const { credentialID, credentialPublicKey, counter } = verification.registrationInfo;

      // Guardar la credencial en la base de datos
      const newCredential = await this.db.biometricCredential.create({
        data: {
          userId: user.id,
          credentialId: credentialID.toString('base64'),
          publicKey: credentialPublicKey.toString('base64'),
          counter,
          deviceName,
          biometricType: challengeRecord.biometricType,
          transports: credential.response.transports || ['internal'],
          lastUsed: new Date()
        }
      });

      // Eliminar el desafío utilizado
      await this.db.biometricChallenge.delete({
        where: { id: challengeRecord.id }
      });

      // Notificar al usuario sobre el nuevo registro biométrico
      if (this.notificationService) {
        await this.notificationService.sendNotification({
          userId: user.id,
          type: 'SECURITY',
          title: 'Nuevo acceso biométrico registrado',
          message: `Se ha registrado un nuevo acceso biométrico para el dispositivo: ${deviceName}`,
          channels: ['email', 'push']
        });
      }

      return {
        success: true,
        credential: {
          id: newCredential.id,
          deviceName: newCredential.deviceName,
          biometricType: newCredential.biometricType,
          createdAt: newCredential.createdAt
        }
      };
    } catch (error) {
      this.logger.error('Error al verificar y guardar registro biométrico:', error);
      throw new Error(`Error al verificar y guardar registro biométrico: ${error.message}`);
    }
  }

  /**
   * Genera opciones para autenticación con credencial biométrica existente
   * @param {Object} user - Usuario que intenta autenticarse
   * @returns {Promise<Object>} Opciones de autenticación para el cliente
   */
  async generateAuthenticationOptions(user) {
    try {
      // Verificar que el usuario existe
      if (!user || !user.id) {
        throw new Error('Usuario inválido para autenticación biométrica');
      }

      // Obtener credenciales existentes para este usuario
      const existingCredentials = await this.db.biometricCredential.findMany({
        where: { userId: user.id, active: true }
      });

      if (existingCredentials.length === 0) {
        throw new Error('No hay credenciales biométricas registradas para este usuario');
      }

      // Generar ID de desafío único y almacenarlo temporalmente
      const challenge = CryptoJS.lib.WordArray.random(32).toString();
      const encryptedChallenge = encrypt(challenge);
      
      // Guardar el desafío en la base de datos para verificación posterior
      await this.db.biometricChallenge.create({
        data: {
          userId: user.id,
          challenge: encryptedChallenge,
          biometricType: 'authentication',
          expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutos de validez
        }
      });

      // Preparar lista de credenciales permitidas
      const allowCredentials = existingCredentials.map(cred => ({
        id: Buffer.from(cred.credentialId, 'base64'),
        type: 'public-key',
        transports: cred.transports || ['internal']
      }));

      // Generar opciones según el estándar WebAuthn
      const options = generateAuthenticationOptions({
        rpID,
        allowCredentials,
        userVerification: 'preferred',
        challenge: Buffer.from(challenge, 'hex')
      });

      return options;
    } catch (error) {
      this.logger.error('Error al generar opciones de autenticación biométrica:', error);
      throw new Error(`Error al generar opciones de autenticación biométrica: ${error.message}`);
    }
  }

  /**
   * Verifica una autenticación biométrica
   * @param {Object} user - Usuario que intenta autenticarse
   * @param {Object} credential - Credencial proporcionada por el cliente
   * @returns {Promise<Object>} Resultado de la verificación
   */
  async verifyAuthentication(user, credential) {
    try {
      // Buscar el desafío pendiente más reciente para este usuario
      const challengeRecord = await this.db.biometricChallenge.findFirst({
        where: {
          userId: user.id,
          biometricType: 'authentication',
          expiresAt: { gt: new Date() }
        },
        orderBy: { createdAt: 'desc' }
      });

      if (!challengeRecord) {
        throw new Error('No se encontró un desafío válido para esta autenticación');
      }

      // Desencriptar el desafío almacenado
      const expectedChallenge = decrypt(challengeRecord.challenge);

      // Buscar la credencial específica utilizada
      const credentialId = credential.id.toString('base64');
      const existingCredential = await this.db.biometricCredential.findFirst({
        where: {
          userId: user.id,
          credentialId,
          active: true
        }
      });

      if (!existingCredential) {
        throw new Error('Credencial biométrica no encontrada o inactiva');
      }

      // Verificar la respuesta de autenticación según WebAuthn
      const verification = await verifyAuthenticationResponse({
        response: credential,
        expectedChallenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
        authenticator: {
          credentialID: Buffer.from(existingCredential.credentialId, 'base64'),
          credentialPublicKey: Buffer.from(existingCredential.publicKey, 'base64'),
          counter: existingCredential.counter
        }
      });

      if (!verification.verified) {
        // Registrar intento fallido
        await this.db.biometricAuthLog.create({
          data: {
            userId: user.id,
            credentialId: existingCredential.id,
            success: false,
            ipAddress: credential.ipAddress || null,
            userAgent: credential.userAgent || null
          }
        });
        
        throw new Error('La verificación de la autenticación biométrica falló');
      }

      // Actualizar el contador de la credencial
      await this.db.biometricCredential.update({
        where: { id: existingCredential.id },
        data: {
          counter: verification.authenticationInfo.newCounter,
          lastUsed: new Date()
        }
      });

      // Eliminar el desafío utilizado
      await this.db.biometricChallenge.delete({
        where: { id: challengeRecord.id }
      });

      // Registrar autenticación exitosa
      await this.db.biometricAuthLog.create({
        data: {
          userId: user.id,
          credentialId: existingCredential.id,
          success: true,
          ipAddress: credential.ipAddress || null,
          userAgent: credential.userAgent || null
        }
      });

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        },
        credential: {
          id: existingCredential.id,
          deviceName: existingCredential.deviceName,
          biometricType: existingCredential.biometricType
        }
      };
    } catch (error) {
      this.logger.error('Error al verificar autenticación biométrica:', error);
      throw new Error(`Error al verificar autenticación biométrica: ${error.message}`);
    }
  }

  /**
   * Obtiene todas las credenciales biométricas de un usuario
   * @param {string} userId - ID del usuario
   * @returns {Promise<Array>} Lista de credenciales
   */
  async getUserCredentials(userId) {
    try {
      const credentials = await this.db.biometricCredential.findMany({
        where: { userId },
        select: {
          id: true,
          deviceName: true,
          biometricType: true,
          active: true,
          createdAt: true,
          lastUsed: true
        },
        orderBy: { createdAt: 'desc' }
      });
      
      return credentials;
    } catch (error) {
      this.logger.error('Error al obtener credenciales biométricas del usuario:', error);
      throw new Error(`Error al obtener credenciales biométricas: ${error.message}`);
    }
  }

  /**
   * Desactiva una credencial biométrica
   * @param {string} credentialId - ID de la credencial a desactivar
   * @param {string} userId - ID del usuario propietario (para verificación)
   * @returns {Promise<Object>} Resultado de la operación
   */
  async deactivateCredential(credentialId, userId) {
    try {
      // Verificar que la credencial pertenece al usuario
      const credential = await this.db.biometricCredential.findFirst({
        where: { id: credentialId, userId }
      });

      if (!credential) {
        throw new Error('Credencial no encontrada o no pertenece al usuario');
      }

      // Desactivar la credencial
      await this.db.biometricCredential.update({
        where: { id: credentialId },
        data: { active: false }
      });

      // Notificar al usuario sobre la desactivación
      if (this.notificationService) {
        await this.notificationService.sendNotification({
          userId,
          type: 'SECURITY',
          title: 'Acceso biométrico desactivado',
          message: `Se ha desactivado el acceso biométrico para el dispositivo: ${credential.deviceName}`,
          channels: ['email', 'push']
        });
      }

      return { success: true, message: 'Credencial desactivada correctamente' };
    } catch (error) {
      this.logger.error('Error al desactivar credencial biométrica:', error);
      throw new Error(`Error al desactivar credencial biométrica: ${error.message}`);
    }
  }

  /**
   * Obtiene el historial de autenticaciones biométricas de un usuario
   * @param {string} userId - ID del usuario
   * @param {Object} options - Opciones de paginación y filtrado
   * @returns {Promise<Array>} Historial de autenticaciones
   */
  async getAuthenticationHistory(userId, options = {}) {
    const { limit = 20, offset = 0, onlySuccessful = false } = options;
    
    try {
      const where = { userId };
      if (onlySuccessful) {
        where.success = true;
      }
      
      const history = await this.db.biometricAuthLog.findMany({
        where,
        include: {
          credential: {
            select: {
              deviceName: true,
              biometricType: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      });
      
      return history;
    } catch (error) {
      this.logger.error('Error al obtener historial de autenticaciones biométricas:', error);
      throw new Error(`Error al obtener historial de autenticaciones: ${error.message}`);
    }
  }

  /**
   * Verifica si un usuario tiene credenciales biométricas activas
   * @param {string} userId - ID del usuario
   * @returns {Promise<boolean>} True si el usuario tiene credenciales activas
   */
  async hasBiometricCredentials(userId) {
    try {
      const count = await this.db.biometricCredential.count({
        where: { userId, active: true }
      });
      
      return count > 0;
    } catch (error) {
      this.logger.error('Error al verificar credenciales biométricas del usuario:', error);
      throw new Error(`Error al verificar credenciales biométricas: ${error.message}`);
    }
  }
}

module.exports = BiometricService;
