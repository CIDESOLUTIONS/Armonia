/**
 * Servicio para la integración con sistemas biométricos
 * 
 * Este servicio proporciona funcionalidades para la integración con diferentes
 * tipos de dispositivos biométricos, incluyendo lectores de huella dactilar,
 * reconocimiento facial y otros métodos de autenticación biométrica.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto');
const logger = require('../logging/server-logger');

/**
 * Clase que implementa la integración con sistemas biométricos
 */
class BiometricService {
  /**
   * Constructor del servicio biométrico
   */
  constructor() {
    this.supportedDevices = {
      FINGERPRINT: ['ZKTeco', 'DigitalPersona', 'Suprema'],
      FACIAL: ['FaceID', 'RealSense', 'NeoFace'],
      IRIS: ['IrisID', 'EyeLock', 'IriTech']
    };
    
    this.deviceConnectors = {};
    this.initializeConnectors();
    
    logger.info('BiometricService initialized');
  }
  
  /**
   * Inicializa los conectores para los dispositivos soportados
   * @private
   */
  initializeConnectors() {
    // En un entorno real, aquí se cargarían dinámicamente los conectores
    // para los diferentes dispositivos biométricos soportados
    
    // Mock de conectores para desarrollo
    Object.keys(this.supportedDevices).forEach(type => {
      this.supportedDevices[type].forEach(brand => {
        this.deviceConnectors[`${brand}_${type}`] = {
          connect: async () => true,
          disconnect: async () => true,
          capture: async () => this.mockBiometricCapture(type),
          verify: async (template, sample) => this.mockBiometricVerification(template, sample),
          identify: async (sample, templates) => this.mockBiometricIdentification(sample, templates)
        };
      });
    });
  }
  
  /**
   * Simula la captura de datos biométricos
   * @param {string} type - Tipo de biometría (FINGERPRINT, FACIAL, IRIS)
   * @returns {Object} Datos biométricos simulados
   * @private
   */
  mockBiometricCapture(type) {
    // Generar datos simulados según el tipo de biometría
    const timestamp = Date.now();
    const randomData = crypto.randomBytes(64).toString('hex');
    
    return {
      type,
      timestamp,
      quality: Math.floor(Math.random() * 30) + 70, // 70-100
      template: `${type}_TEMPLATE_${randomData}`,
      raw: `${type}_RAW_${randomData}`
    };
  }
  
  /**
   * Simula la verificación biométrica (1:1)
   * @param {string} template - Plantilla biométrica almacenada
   * @param {string} sample - Muestra biométrica capturada
   * @returns {Object} Resultado de la verificación
   * @private
   */
  mockBiometricVerification(template, sample) {
    // En un entorno real, aquí se compararía la muestra con la plantilla
    // usando algoritmos específicos para cada tipo de biometría
    
    // Simulación simple para desarrollo
    const sampleType = sample.type || 'UNKNOWN';
    const templateType = template.includes('FINGERPRINT') ? 'FINGERPRINT' : 
                        template.includes('FACIAL') ? 'FACIAL' : 
                        template.includes('IRIS') ? 'IRIS' : 'UNKNOWN';
    
    // Si los tipos coinciden, alta probabilidad de match
    const isTypeMatch = sampleType === templateType;
    const baseScore = isTypeMatch ? 80 : 20;
    const randomFactor = Math.floor(Math.random() * 20);
    const score = baseScore + randomFactor;
    
    return {
      match: score >= 70,
      score,
      confidence: score / 100,
      timestamp: Date.now()
    };
  }
  
  /**
   * Simula la identificación biométrica (1:N)
   * @param {Object} sample - Muestra biométrica capturada
   * @param {Array} templates - Lista de plantillas biométricas
   * @returns {Object} Resultado de la identificación
   * @private
   */
  mockBiometricIdentification(sample, templates) {
    // En un entorno real, aquí se compararía la muestra con múltiples plantillas
    
    // Simulación simple para desarrollo
    const results = templates.map((template, index) => {
      const verification = this.mockBiometricVerification(template, sample);
      return {
        templateId: index,
        ...verification
      };
    });
    
    // Ordenar por score descendente
    results.sort((a, b) => b.score - a.score);
    
    return {
      identified: results.length > 0 && results[0].match,
      bestMatch: results.length > 0 ? results[0] : null,
      candidates: results.filter(r => r.match),
      timestamp: Date.now()
    };
  }
  
  /**
   * Registra datos biométricos para un usuario
   * @param {number} userId - ID del usuario
   * @param {string} biometricType - Tipo de biometría (FINGERPRINT, FACIAL, IRIS)
   * @param {Object} deviceInfo - Información del dispositivo utilizado
   * @returns {Promise<Object>} Resultado del registro
   */
  async registerBiometric(userId, biometricType, deviceInfo) {
    try {
      logger.info(`Registering ${biometricType} biometric for user ${userId}`);
      
      // Validar tipo de biometría
      if (!Object.keys(this.supportedDevices).includes(biometricType)) {
        throw new Error(`Unsupported biometric type: ${biometricType}`);
      }
      
      // Validar dispositivo
      const deviceBrand = deviceInfo.brand || 'Unknown';
      const deviceModel = deviceInfo.model || 'Unknown';
      const connectorKey = `${deviceBrand}_${biometricType}`;
      
      if (!this.deviceConnectors[connectorKey]) {
        throw new Error(`Unsupported device: ${deviceBrand} for ${biometricType}`);
      }
      
      // Conectar con el dispositivo
      await this.deviceConnectors[connectorKey].connect();
      
      // Capturar datos biométricos
      const biometricData = await this.deviceConnectors[connectorKey].capture();
      
      // Desconectar dispositivo
      await this.deviceConnectors[connectorKey].disconnect();
      
      // Encriptar plantilla biométrica antes de almacenar
      const encryptedTemplate = this.encryptBiometricTemplate(biometricData.template);
      
      // Guardar en base de datos
      const biometricRecord = await prisma.userBiometrics.create({
        data: {
          userId,
          biometricType,
          template: encryptedTemplate,
          quality: biometricData.quality,
          deviceBrand,
          deviceModel,
          active: true,
          createdAt: new Date()
        }
      });
      
      logger.info(`Successfully registered ${biometricType} for user ${userId}`);
      
      return {
        success: true,
        biometricId: biometricRecord.id,
        quality: biometricData.quality,
        timestamp: biometricData.timestamp
      };
    } catch (error) {
      logger.error(`Error registering biometric: ${error.message}`, { error, userId, biometricType });
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Verifica la identidad de un usuario mediante biometría
   * @param {number} userId - ID del usuario a verificar
   * @param {string} biometricType - Tipo de biometría a utilizar
   * @param {Object} deviceInfo - Información del dispositivo
   * @returns {Promise<Object>} Resultado de la verificación
   */
  async verifyUser(userId, biometricType, deviceInfo) {
    try {
      logger.info(`Verifying user ${userId} using ${biometricType}`);
      
      // Validar tipo de biometría
      if (!Object.keys(this.supportedDevices).includes(biometricType)) {
        throw new Error(`Unsupported biometric type: ${biometricType}`);
      }
      
      // Obtener plantilla biométrica del usuario
      const userBiometric = await prisma.userBiometrics.findFirst({
        where: {
          userId,
          biometricType,
          active: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      if (!userBiometric) {
        return {
          success: false,
          verified: false,
          error: `No active ${biometricType} record found for user ${userId}`
        };
      }
      
      // Validar dispositivo
      const deviceBrand = deviceInfo.brand || 'Unknown';
      const connectorKey = `${deviceBrand}_${biometricType}`;
      
      if (!this.deviceConnectors[connectorKey]) {
        throw new Error(`Unsupported device: ${deviceBrand} for ${biometricType}`);
      }
      
      // Conectar con el dispositivo
      await this.deviceConnectors[connectorKey].connect();
      
      // Capturar datos biométricos
      const biometricSample = await this.deviceConnectors[connectorKey].capture();
      
      // Desconectar dispositivo
      await this.deviceConnectors[connectorKey].disconnect();
      
      // Desencriptar plantilla almacenada
      const decryptedTemplate = this.decryptBiometricTemplate(userBiometric.template);
      
      // Verificar coincidencia
      const verificationResult = await this.deviceConnectors[connectorKey].verify(
        decryptedTemplate,
        biometricSample
      );
      
      // Registrar intento de verificación
      await prisma.biometricVerificationLog.create({
        data: {
          userId,
          biometricId: userBiometric.id,
          biometricType,
          success: verificationResult.match,
          score: verificationResult.score,
          deviceBrand,
          deviceModel: deviceInfo.model || 'Unknown',
          ipAddress: deviceInfo.ipAddress || '',
          createdAt: new Date()
        }
      });
      
      logger.info(`User ${userId} verification result: ${verificationResult.match ? 'SUCCESS' : 'FAILED'}`);
      
      return {
        success: true,
        verified: verificationResult.match,
        score: verificationResult.score,
        confidence: verificationResult.confidence,
        timestamp: verificationResult.timestamp
      };
    } catch (error) {
      logger.error(`Error verifying user: ${error.message}`, { error, userId, biometricType });
      return {
        success: false,
        verified: false,
        error: error.message
      };
    }
  }
  
  /**
   * Identifica a un usuario mediante biometría (búsqueda 1:N)
   * @param {string} biometricType - Tipo de biometría a utilizar
   * @param {Object} deviceInfo - Información del dispositivo
   * @param {Array} userGroupIds - IDs de grupos de usuarios para limitar la búsqueda (opcional)
   * @returns {Promise<Object>} Resultado de la identificación
   */
  async identifyUser(biometricType, deviceInfo, userGroupIds = []) {
    try {
      logger.info(`Identifying user using ${biometricType}`);
      
      // Validar tipo de biometría
      if (!Object.keys(this.supportedDevices).includes(biometricType)) {
        throw new Error(`Unsupported biometric type: ${biometricType}`);
      }
      
      // Validar dispositivo
      const deviceBrand = deviceInfo.brand || 'Unknown';
      const connectorKey = `${deviceBrand}_${biometricType}`;
      
      if (!this.deviceConnectors[connectorKey]) {
        throw new Error(`Unsupported device: ${deviceBrand} for ${biometricType}`);
      }
      
      // Construir query para obtener plantillas biométricas
      let query = {
        where: {
          biometricType,
          active: true
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      };
      
      // Si se especifican grupos, filtrar por usuarios en esos grupos
      if (userGroupIds && userGroupIds.length > 0) {
        query.where.user = {
          userGroups: {
            some: {
              groupId: {
                in: userGroupIds
              }
            }
          }
        };
      }
      
      // Obtener plantillas biométricas
      const biometricRecords = await prisma.userBiometrics.findMany(query);
      
      if (biometricRecords.length === 0) {
        return {
          success: true,
          identified: false,
          message: 'No biometric records found for identification'
        };
      }
      
      // Conectar con el dispositivo
      await this.deviceConnectors[connectorKey].connect();
      
      // Capturar datos biométricos
      const biometricSample = await this.deviceConnectors[connectorKey].capture();
      
      // Desconectar dispositivo
      await this.deviceConnectors[connectorKey].disconnect();
      
      // Preparar plantillas para identificación
      const templates = biometricRecords.map(record => ({
        id: record.id,
        userId: record.userId,
        template: this.decryptBiometricTemplate(record.template),
        user: record.user
      }));
      
      // Realizar identificación
      const identificationResult = await this.deviceConnectors[connectorKey].identify(
        biometricSample,
        templates.map(t => t.template)
      );
      
      // Si se identificó un usuario, obtener sus datos
      let identifiedUser = null;
      if (identificationResult.identified && identificationResult.bestMatch) {
        const matchIndex = identificationResult.bestMatch.templateId;
        identifiedUser = templates[matchIndex].user;
        
        // Registrar identificación exitosa
        await prisma.biometricIdentificationLog.create({
          data: {
            userId: identifiedUser.id,
            biometricId: templates[matchIndex].id,
            biometricType,
            success: true,
            score: identificationResult.bestMatch.score,
            deviceBrand,
            deviceModel: deviceInfo.model || 'Unknown',
            ipAddress: deviceInfo.ipAddress || '',
            createdAt: new Date()
          }
        });
      } else {
        // Registrar identificación fallida
        await prisma.biometricIdentificationLog.create({
          data: {
            userId: null,
            biometricId: null,
            biometricType,
            success: false,
            score: identificationResult.bestMatch?.score || 0,
            deviceBrand,
            deviceModel: deviceInfo.model || 'Unknown',
            ipAddress: deviceInfo.ipAddress || '',
            createdAt: new Date()
          }
        });
      }
      
      logger.info(`Identification result: ${identificationResult.identified ? 'SUCCESS' : 'FAILED'}`);
      
      return {
        success: true,
        identified: identificationResult.identified,
        user: identifiedUser,
        score: identificationResult.bestMatch?.score || 0,
        confidence: identificationResult.bestMatch?.confidence || 0,
        timestamp: identificationResult.timestamp
      };
    } catch (error) {
      logger.error(`Error identifying user: ${error.message}`, { error, biometricType });
      return {
        success: false,
        identified: false,
        error: error.message
      };
    }
  }
  
  /**
   * Desactiva un registro biométrico
   * @param {number} biometricId - ID del registro biométrico
   * @returns {Promise<Object>} Resultado de la operación
   */
  async deactivateBiometric(biometricId) {
    try {
      logger.info(`Deactivating biometric record ${biometricId}`);
      
      const updatedRecord = await prisma.userBiometrics.update({
        where: { id: biometricId },
        data: { active: false }
      });
      
      return {
        success: true,
        biometricId: updatedRecord.id
      };
    } catch (error) {
      logger.error(`Error deactivating biometric: ${error.message}`, { error, biometricId });
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Obtiene los registros biométricos de un usuario
   * @param {number} userId - ID del usuario
   * @returns {Promise<Array>} Lista de registros biométricos
   */
  async getUserBiometrics(userId) {
    try {
      logger.info(`Getting biometric records for user ${userId}`);
      
      const biometricRecords = await prisma.userBiometrics.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });
      
      // Eliminar datos sensibles antes de devolver
      return biometricRecords.map(record => ({
        id: record.id,
        biometricType: record.biometricType,
        quality: record.quality,
        deviceBrand: record.deviceBrand,
        deviceModel: record.deviceModel,
        active: record.active,
        createdAt: record.createdAt
      }));
    } catch (error) {
      logger.error(`Error getting user biometrics: ${error.message}`, { error, userId });
      throw error;
    }
  }
  
  /**
   * Encripta una plantilla biométrica
   * @param {string} template - Plantilla biométrica
   * @returns {string} Plantilla encriptada
   * @private
   */
  encryptBiometricTemplate(template) {
    // En un entorno real, aquí se implementaría encriptación robusta
    // Para desarrollo, usamos una simulación simple
    const key = process.env.BIOMETRIC_ENCRYPTION_KEY || 'default-encryption-key';
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key.padEnd(32).slice(0, 32)), iv);
    
    let encrypted = cipher.update(template);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  }
  
  /**
   * Desencripta una plantilla biométrica
   * @param {string} encryptedTemplate - Plantilla encriptada
   * @returns {string} Plantilla original
   * @private
   */
  decryptBiometricTemplate(encryptedTemplate) {
    // En un entorno real, aquí se implementaría desencriptación robusta
    // Para desarrollo, usamos una simulación simple
    const key = process.env.BIOMETRIC_ENCRYPTION_KEY || 'default-encryption-key';
    const textParts = encryptedTemplate.split(':');
    const iv = Buffer.from(textParts[0], 'hex');
    const encryptedText = Buffer.from(textParts[1], 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key.padEnd(32).slice(0, 32)), iv);
    
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    return decrypted.toString();
  }
  
  /**
   * Obtiene los dispositivos biométricos soportados
   * @returns {Object} Dispositivos soportados por tipo
   */
  getSupportedDevices() {
    return this.supportedDevices;
  }
}

// Exportar instancia del servicio
module.exports = new BiometricService();
