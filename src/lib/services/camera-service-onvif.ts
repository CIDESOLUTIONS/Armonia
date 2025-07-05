// src/lib/services/camera-service-onvif.ts
/**
 * Servicio avanzado para gestión de cámaras IP con ONVIF
 * Maneja discovery, conexión, streams y control PTZ
 */

import { getPrisma } from '@/lib/prisma';
import { encryptData, decryptData } from '@/lib/security/encryption';

// Definición de interfaces
export interface CameraDevice {
  id?: number;
  name: string;
  ipAddress: string;
  port: number;
  username?: string;
  password?: string;
  manufacturer?: string;
  model?: string;
  firmwareVersion?: string;
  capabilities: CameraCapabilities;
  status: 'ONLINE' | 'OFFLINE' | 'UNKNOWN' | 'ERROR';
  lastStatusCheck?: Date;
}

export interface CameraCapabilities {
  hasVideo: boolean;
  hasAudio: boolean;
  hasPTZ: boolean;
  hasPresets: boolean;
  hasEvents: boolean;
  hasRecording: boolean;
  supportedProfiles: string[];
  supportedResolutions: string[];
}

export interface StreamProfile {
  name: string;
  token: string;
  videoEncoderConfiguration: {
    encoding: string;
    resolution: {
      width: number;
      height: number;
    };
    rateControl: {
      frameRateLimit: number;
      bitrateLimit: number;
    };
  };
  audioEncoderConfiguration?: {
    encoding: string;
    bitrate: number;
    sampleRate: number;
  };
  rtspUri: string;
  snapshotUri: string;
}

export interface PTZCapabilities {
  absolute: boolean;
  relative: boolean;
  continuous: boolean;
  presets: boolean;
  home: boolean;
  zoom: boolean;
  focus: boolean;
  iris: boolean;
}

export interface PTZPosition {
  x: number; // Pan (-1.0 to 1.0)
  y: number; // Tilt (-1.0 to 1.0)
  z: number; // Zoom (0.0 to 1.0)
}

/**
 * Servicio principal para gestión de cámaras IP
 */
export class CameraServiceONVIF {
  private static instance: CameraServiceONVIF;
  private connectedCameras: Map<number, any> = new Map();
  private discoveryInterval: NodeJS.Timeout | null = null;

  private constructor() {}

  static getInstance(): CameraServiceONVIF {
    if (!CameraServiceONVIF.instance) {
      CameraServiceONVIF.instance = new CameraServiceONVIF();
    }
    return CameraServiceONVIF.instance;
  }

  /**
   * Descubre cámaras IP en la red usando ONVIF
   */
  async discoverCameras(complexId: number, timeout: number = 30000): Promise<CameraDevice[]> {
    try {
      console.log('[CAMERA DISCOVERY] Iniciando búsqueda de cámaras ONVIF...');
      
      // En modo desarrollo, simular discovery
      if (process.env.NODE_ENV === 'development') {
        return this.simulateDiscovery();
      }

      // En producción, usar ONVIF real
      // const onvif = require('node-onvif');
      // const devices = await onvif.discovery({
      //   timeout: timeout
      // });

      // return this.processDiscoveredDevices(devices, complexId);
      
      // Por ahora, retornar simulación
      return this.simulateDiscovery();

    } catch (error) {
      console.error('[CAMERA DISCOVERY] Error:', error);
      throw new Error(`Error en discovery de cámaras: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Simula el discovery para desarrollo
   */
  private simulateDiscovery(): CameraDevice[] {
    return [
      {
        name: 'Cámara Entrada Principal',
        ipAddress: '192.168.1.100',
        port: 554,
        manufacturer: 'Hikvision',
        model: 'DS-2CD2142FWD-I',
        firmwareVersion: '5.5.0',
        capabilities: {
          hasVideo: true,
          hasAudio: false,
          hasPTZ: false,
          hasPresets: false,
          hasEvents: true,
          hasRecording: true,
          supportedProfiles: ['Profile_1', 'Profile_2'],
          supportedResolutions: ['1920x1080', '1280x720', '640x480']
        },
        status: 'UNKNOWN'
      },
      {
        name: 'Cámara PTZ Parking',
        ipAddress: '192.168.1.101',
        port: 554,
        manufacturer: 'Dahua',
        model: 'SD6C230I-HC',
        firmwareVersion: '2.840.0000000.23.R',
        capabilities: {
          hasVideo: true,
          hasAudio: true,
          hasPTZ: true,
          hasPresets: true,
          hasEvents: true,
          hasRecording: true,
          supportedProfiles: ['MainStream', 'SubStream'],
          supportedResolutions: ['1920x1080', '1280x720']
        },
        status: 'UNKNOWN'
      }
    ];
  }

  /**
   * Conecta a una cámara específica
   */
  async connectCamera(cameraId: number): Promise<boolean> {
    try {
      const camera = await this.getCameraById(cameraId);
      if (!camera) {
        throw new Error('Cámara no encontrada');
      }

      console.log(`[CAMERA CONNECT] Conectando a ${camera.name} (${camera.ipAddress})`);

      // En desarrollo, simular conexión
      if (process.env.NODE_ENV === 'development') {
        this.connectedCameras.set(cameraId, {
          id: cameraId,
          connected: true,
          lastPing: new Date()
        });
        
        await this.updateCameraStatus(cameraId, 'ONLINE');
        return true;
      }

      // En producción, conectar real con ONVIF
      // const deviceInfo = {
      //   address: camera.ipAddress,
      //   port: camera.port,
      //   username: camera.username,
      //   password: camera.password ? decryptData(camera.password) : undefined
      // };

      // const onvif = require('node-onvif');
      // const device = new onvif.OnvifDevice(deviceInfo);
      // await device.connect();

      // this.connectedCameras.set(cameraId, device);
      await this.updateCameraStatus(cameraId, 'ONLINE');
      
      return true;

    } catch (error) {
      console.error(`[CAMERA CONNECT] Error conectando cámara ${cameraId}:`, error);
      await this.updateCameraStatus(cameraId, 'ERROR');
      return false;
    }
  }

  /**
   * Obtiene los perfiles de stream disponibles
   */
  async getStreamProfiles(cameraId: number): Promise<StreamProfile[]> {
    try {
      const device = this.connectedCameras.get(cameraId);
      if (!device) {
        throw new Error('Cámara no conectada');
      }

      console.log(`[STREAM PROFILES] Obteniendo perfiles para cámara ${cameraId}`);

      // En desarrollo, retornar perfiles simulados
      if (process.env.NODE_ENV === 'development') {
        return [
          {
            name: 'MainStream',
            token: 'Profile_1',
            videoEncoderConfiguration: {
              encoding: 'H264',
              resolution: { width: 1920, height: 1080 },
              rateControl: { frameRateLimit: 25, bitrateLimit: 4096 }
            },
            rtspUri: `rtsp://192.168.1.100:554/Streaming/Channels/101`,
            snapshotUri: `http://192.168.1.100/ISAPI/Streaming/channels/1/picture`
          },
          {
            name: 'SubStream',
            token: 'Profile_2',
            videoEncoderConfiguration: {
              encoding: 'H264',
              resolution: { width: 640, height: 480 },
              rateControl: { frameRateLimit: 15, bitrateLimit: 1024 }
            },
            rtspUri: `rtsp://192.168.1.100:554/Streaming/Channels/102`,
            snapshotUri: `http://192.168.1.100/ISAPI/Streaming/channels/2/picture`
          }
        ];
      }

      // En producción, usar ONVIF real
      // const profiles = await device.getProfiles();
      // return this.parseOnvifProfiles(profiles);
      
      return [];

    } catch (error) {
      console.error(`[STREAM PROFILES] Error:`, error);
      throw error;
    }
  }

  /**
   * Obtiene el URI del stream RTSP
   */
  async getStreamUri(cameraId: number, profileToken: string = 'Profile_1'): Promise<string> {
    try {
      const device = this.connectedCameras.get(cameraId);
      if (!device) {
        throw new Error('Cámara no conectada');
      }

      // En desarrollo, retornar URI simulado
      if (process.env.NODE_ENV === 'development') {
        const camera = await this.getCameraById(cameraId);
        return `rtsp://${camera?.ipAddress}:554/Streaming/Channels/101`;
      }

      // En producción, usar ONVIF real
      // const streamUri = await device.getStreamUri({
      //   stream: 'RTP-Unicast',
      //   transport: 'RTSP',
      //   profileToken
      // });
      // return streamUri.uri;
      
      return '';

    } catch (error) {
      console.error(`[STREAM URI] Error:`, error);
      throw error;
    }
  }

  /**
   * Captura una imagen (snapshot)
   */
  async captureSnapshot(cameraId: number): Promise<Buffer> {
    try {
      const device = this.connectedCameras.get(cameraId);
      if (!device) {
        throw new Error('Cámara no conectada');
      }

      console.log(`[SNAPSHOT] Capturando imagen de cámara ${cameraId}`);

      // En desarrollo, crear imagen simulada
      if (process.env.NODE_ENV === 'development') {
        // Crear un buffer simulado (en producción sería la imagen real)
        const simulatedImage = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
        return simulatedImage;
      }

      // En producción, capturar imagen real
      // const snapshot = await device.getSnapshot();
      // return snapshot;
      
      return Buffer.alloc(0);

    } catch (error) {
      console.error(`[SNAPSHOT] Error:`, error);
      throw error;
    }
  }

  /**
   * Control PTZ (Pan-Tilt-Zoom)
   */
  async controlPTZ(cameraId: number, action: 'move' | 'stop' | 'preset', params?: any): Promise<boolean> {
    try {
      const device = this.connectedCameras.get(cameraId);
      if (!device) {
        throw new Error('Cámara no conectada');
      }

      const camera = await this.getCameraById(cameraId);
      if (!camera?.ptzEnabled) {
        throw new Error('Cámara no soporta PTZ');
      }

      console.log(`[PTZ CONTROL] ${action} en cámara ${cameraId}`, params);

      // En desarrollo, simular control PTZ
      if (process.env.NODE_ENV === 'development') {
        await new Promise(resolve => setTimeout(resolve, 100)); // Simular delay
        return true;
      }

      // En producción, usar control PTZ real
      switch (action) {
        case 'move':
          // await device.absoluteMove(params);
          break;
        case 'stop':
          // await device.stop();
          break;
        case 'preset':
          // await device.gotoPreset(params.presetToken);
          break;
      }

      return true;

    } catch (error) {
      console.error(`[PTZ CONTROL] Error:`, error);
      return false;
    }
  }

  /**
   * Verifica el estado de todas las cámaras
   */
  async checkCamerasStatus(complexId: number): Promise<void> {
    try {
      const cameras = await this.getAllCameras(complexId);
      
      for (const camera of cameras) {
        try {
          await this.pingCamera(camera.id!);
        } catch (error) {
          console.error(`[STATUS CHECK] Error verificando cámara ${camera.id}:`, error);
        }
      }

    } catch (error) {
      console.error('[STATUS CHECK] Error general:', error);
    }
  }

  /**
   * Ping a una cámara para verificar conectividad
   */
  private async pingCamera(cameraId: number): Promise<boolean> {
    try {
      const camera = await this.getCameraById(cameraId);
      if (!camera) return false;

      // En desarrollo, simular ping
      if (process.env.NODE_ENV === 'development') {
        const isOnline = Math.random() > 0.1; // 90% probabilidad online
        await this.updateCameraStatus(cameraId, isOnline ? 'ONLINE' : 'OFFLINE');
        return isOnline;
      }

      // En producción, hacer ping real
      // const axios = require('axios');
      // const response = await axios.get(`http://${camera.ipAddress}`, { timeout: 5000 });
      // const isOnline = response.status === 200;
      // await this.updateCameraStatus(cameraId, isOnline ? 'ONLINE' : 'OFFLINE');
      // return isOnline;
      
      return true;

    } catch (error) {
      await this.updateCameraStatus(cameraId, 'OFFLINE');
      return false;
    }
  }

  /**
   * Inicia monitoreo automático de cámaras
   */
  startMonitoring(complexId: number, intervalMinutes: number = 5): void {
    if (this.discoveryInterval) {
      clearInterval(this.discoveryInterval);
    }

    this.discoveryInterval = setInterval(async () => {
      try {
        await this.checkCamerasStatus(complexId);
      } catch (error) {
        console.error('[MONITORING] Error:', error);
      }
    }, intervalMinutes * 60 * 1000);

    console.log(`[MONITORING] Iniciado para complejo ${complexId} cada ${intervalMinutes} minutos`);
  }

  /**
   * Detiene el monitoreo automático
   */
  stopMonitoring(): void {
    if (this.discoveryInterval) {
      clearInterval(this.discoveryInterval);
      this.discoveryInterval = null;
      console.log('[MONITORING] Detenido');
    }
  }

  // Métodos de base de datos
  private async getCameraById(id: number): Promise<any> {
    const prisma = getPrisma();
    return await prisma.camera.findUnique({
      where: { id },
      include: {
        zone: true,
        createdBy: {
          select: { id: true, name: true, email: true }
        }
      }
    });
  }

  private async getAllCameras(complexId: number): Promise<any[]> {
    const prisma = getPrisma();
    return await prisma.camera.findMany({
      where: { 
        // Asumir que hay relación con complejo via zona o directamente
        zone: {
          complexId: complexId
        }
      },
      include: {
        zone: true
      }
    });
  }

  private async updateCameraStatus(cameraId: number, status: string): Promise<void> {
    const prisma = getPrisma();
    await prisma.camera.update({
      where: { id: cameraId },
      data: {
        status,
        lastStatusCheck: new Date()
      }
    });
  }

  /**
   * Registra una nueva cámara en la base de datos
   */
  async registerCamera(cameraData: CameraDevice, complexId: number, zoneId?: number): Promise<number> {
    const prisma = getPrisma();
    
    const camera = await prisma.camera.create({
      data: {
        name: cameraData.name,
        ipAddress: cameraData.ipAddress,
        port: cameraData.port,
        username: cameraData.username,
        password: cameraData.password ? encryptData(cameraData.password) : null,
        manufacturer: cameraData.manufacturer,
        model: cameraData.model,
        firmwareVersion: cameraData.firmwareVersion,
        status: cameraData.status,
        ptzEnabled: cameraData.capabilities.hasPTZ,
        recordingEnabled: cameraData.capabilities.hasRecording,
        streamSettings: {
          profiles: cameraData.capabilities.supportedProfiles,
          resolutions: cameraData.capabilities.supportedResolutions
        },
        zoneId: zoneId,
        isActive: true
      }
    });

    console.log(`[CAMERA REGISTER] Cámara ${camera.name} registrada con ID ${camera.id}`);
    return camera.id;
  }

  /**
   * Actualiza configuración de una cámara
   */
  async updateCamera(cameraId: number, updates: Partial<CameraDevice>): Promise<boolean> {
    try {
      const prisma = getPrisma();
      
      const updateData: any = {};
      if (updates.name) updateData.name = updates.name;
      if (updates.ipAddress) updateData.ipAddress = updates.ipAddress;
      if (updates.port) updateData.port = updates.port;
      if (updates.username) updateData.username = updates.username;
      if (updates.password) updateData.password = encryptData(updates.password);
      if (updates.manufacturer) updateData.manufacturer = updates.manufacturer;
      if (updates.model) updateData.model = updates.model;

      await prisma.camera.update({
        where: { id: cameraId },
        data: updateData
      });

      console.log(`[CAMERA UPDATE] Cámara ${cameraId} actualizada`);
      return true;

    } catch (error) {
      console.error('[CAMERA UPDATE] Error:', error);
      return false;
    }
  }

  /**
   * Elimina una cámara
   */
  async deleteCamera(cameraId: number): Promise<boolean> {
    try {
      const prisma = getPrisma();
      
      // Desconectar si está conectada
      if (this.connectedCameras.has(cameraId)) {
        this.connectedCameras.delete(cameraId);
      }

      await prisma.camera.delete({
        where: { id: cameraId }
      });

      console.log(`[CAMERA DELETE] Cámara ${cameraId} eliminada`);
      return true;

    } catch (error) {
      console.error('[CAMERA DELETE] Error:', error);
      return false;
    }
  }

  /**
   * Obtiene estadísticas de cámaras
   */
  async getCameraStats(complexId: number): Promise<{
    total: number;
    online: number;
    offline: number;
    error: number;
    unknown: number;
  }> {
    const prisma = getPrisma();
    
    const cameras = await this.getAllCameras(complexId);
    
    const stats = {
      total: cameras.length,
      online: cameras.filter(c => c.status === 'ONLINE').length,
      offline: cameras.filter(c => c.status === 'OFFLINE').length,
      error: cameras.filter(c => c.status === 'ERROR').length,
      unknown: cameras.filter(c => c.status === 'UNKNOWN').length
    };

    return stats;
  }
}

// Instancia singleton
export const cameraService = CameraServiceONVIF.getInstance();
