/**
 * Servicio para gestión de cámaras IP
 * Parte del sistema de integración con cámaras - Proyecto Armonía
 */

import { getPrisma } from '@/lib/prisma';
import { ServerLogger } from '@/lib/logging/server-logger';
import { ActivityLogger } from '@/lib/logging/activity-logger';
import { getTenantSchema } from '@/lib/db';
import { encryptData, decryptData } from '@/lib/security/encryption';
import axios from 'axios';
import { OnvifDevice } from 'node-onvif';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

export default class CameraService {
  private prisma: PrismaClient;
  private schema: string;
  private activityLogger: ActivityLogger;
  private recordingsPath: string;

  /**
   * Constructor del servicio
   * @param schema Esquema del tenant
   */
  constructor(schema: string) {
    this.schema = schema;
    this.prisma = getPrisma();
    this.activityLogger = new ActivityLogger();
    this.recordingsPath = process.env.RECORDINGS_PATH || '/data/recordings';
    
    // Asegurar que existe el directorio de grabaciones
    if (!fs.existsSync(this.recordingsPath)) {
      fs.mkdirSync(this.recordingsPath, { recursive: true });
    }
  }

  /**
   * Obtiene todas las cámaras
   * @param includeInactive Si se deben incluir cámaras inactivas
   * @returns Lista de cámaras
   */
  async getCameras(includeInactive: boolean = false): Promise<any[]> {
    try {
      const where = includeInactive ? {} : { isActive: true };
      
      return await this.prisma.camera.findMany({
        where,
        orderBy: [
          { name: 'asc' }
        ],
        include: {
          zone: {
            select: {
              id: true,
              name: true,
              isPublic: true
            }
          },
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });
    } catch (error) {
      ServerLogger.error('Error al obtener cámaras:', error);
      throw new Error('Error al obtener cámaras');
    }
  }

  /**
   * Obtiene una cámara por ID
   * @param id ID de la cámara
   * @returns Cámara
   */
  async getCameraById(id: number): Promise<any> {
    try {
      const camera = await this.prisma.camera.findUnique({
        where: { id },
        include: {
          zone: {
            select: {
              id: true,
              name: true,
              isPublic: true
            }
          },
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });
      
      if (!camera) {
        throw new Error(`Cámara con ID ${id} no encontrada`);
      }
      
      // Desencriptar credenciales si existen
      if (camera.password) {
        camera.password = await decryptData(camera.password);
      }
      
      return camera;
    } catch (error) {
      ServerLogger.error(`Error al obtener cámara con ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Crea una nueva cámara
   * @param data Datos de la cámara
   * @param userId ID del usuario que crea la cámara
   * @returns Cámara creada
   */
  async createCamera(data: any, userId: number): Promise<any> {
    try {
      // Validar datos de la cámara
      this.validateCameraData(data);
      
      // Encriptar contraseña si existe
      let cameraData = { ...data };
      if (cameraData.password) {
        cameraData.password = await encryptData(cameraData.password);
      }
      
      // Generar URLs si no se proporcionan
      if (!cameraData.rtspUrl && cameraData.ipAddress) {
        cameraData.rtspUrl = this.generateRtspUrl(cameraData);
      }
      
      if (!cameraData.onvifUrl && cameraData.ipAddress) {
        cameraData.onvifUrl = `http://${cameraData.ipAddress}:${cameraData.onvifPort || 8080}/onvif/device_service`;
      }
      
      // Crear la cámara
      const camera = await this.prisma.camera.create({
        data: {
          ...cameraData,
          createdById: userId
        }
      });
      
      // Registrar actividad
      await this.activityLogger.logActivity({
        userId,
        action: 'CREATE_CAMERA',
        resourceType: 'CAMERA',
        resourceId: camera.id,
        details: {
          name: camera.name,
          ipAddress: camera.ipAddress
        }
      });
      
      // Verificar conectividad
      this.checkCameraStatus(camera.id).catch(err => {
        ServerLogger.warn(`Error al verificar estado inicial de cámara ${camera.id}:`, err);
      });
      
      return camera;
    } catch (error) {
      ServerLogger.error('Error al crear cámara:', error);
      throw error;
    }
  }

  /**
   * Actualiza una cámara existente
   * @param id ID de la cámara
   * @param data Datos actualizados
   * @param userId ID del usuario que realiza la actualización
   * @returns Cámara actualizada
   */
  async updateCamera(id: number, data: any, userId: number): Promise<any> {
    try {
      // Verificar que la cámara existe
      const existingCamera = await this.prisma.camera.findUnique({
        where: { id }
      });
      
      if (!existingCamera) {
        throw new Error(`Cámara con ID ${id} no encontrada`);
      }
      
      // Validar datos de la cámara
      this.validateCameraData(data);
      
      // Encriptar contraseña si se proporciona una nueva
      let cameraData = { ...data };
      if (cameraData.password) {
        // Si la contraseña es "********", mantener la existente
        if (cameraData.password === '********') {
          delete cameraData.password;
        } else {
          cameraData.password = await encryptData(cameraData.password);
        }
      }
      
      // Actualizar URLs si cambia la dirección IP
      if (cameraData.ipAddress && cameraData.ipAddress !== existingCamera.ipAddress) {
        if (!cameraData.rtspUrl) {
          cameraData.rtspUrl = this.generateRtspUrl(cameraData);
        }
        
        if (!cameraData.onvifUrl) {
          cameraData.onvifUrl = `http://${cameraData.ipAddress}:${cameraData.onvifPort || 8080}/onvif/device_service`;
        }
      }
      
      // Actualizar la cámara
      const camera = await this.prisma.camera.update({
        where: { id },
        data: cameraData
      });
      
      // Registrar actividad
      await this.activityLogger.logActivity({
        userId,
        action: 'UPDATE_CAMERA',
        resourceType: 'CAMERA',
        resourceId: camera.id,
        details: {
          name: camera.name,
          ipAddress: camera.ipAddress
        }
      });
      
      // Verificar conectividad si cambiaron datos relevantes
      if (cameraData.ipAddress || cameraData.port || cameraData.username || cameraData.password) {
        this.checkCameraStatus(camera.id).catch(err => {
          ServerLogger.warn(`Error al verificar estado de cámara ${camera.id} tras actualización:`, err);
        });
      }
      
      return camera;
    } catch (error) {
      ServerLogger.error(`Error al actualizar cámara con ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Elimina una cámara
   * @param id ID de la cámara
   * @param userId ID del usuario que realiza la eliminación
   * @returns Resultado de la operación
   */
  async deleteCamera(id: number, userId: number): Promise<any> {
    try {
      // Verificar que la cámara existe
      const existingCamera = await this.prisma.camera.findUnique({
        where: { id }
      });
      
      if (!existingCamera) {
        throw new Error(`Cámara con ID ${id} no encontrada`);
      }
      
      // Eliminar grabaciones y snapshots asociados
      await this.prisma.$transaction([
        this.prisma.recording.deleteMany({
          where: { cameraId: id }
        }),
        this.prisma.snapshot.deleteMany({
          where: { cameraId: id }
        }),
        this.prisma.cameraPermission.deleteMany({
          where: { cameraId: id }
        }),
        this.prisma.camera.delete({
          where: { id }
        })
      ]);
      
      // Registrar actividad
      await this.activityLogger.logActivity({
        userId,
        action: 'DELETE_CAMERA',
        resourceType: 'CAMERA',
        resourceId: id,
        details: {
          name: existingCamera.name,
          ipAddress: existingCamera.ipAddress
        }
      });
      
      return { success: true, message: 'Cámara eliminada correctamente' };
    } catch (error) {
      ServerLogger.error(`Error al eliminar cámara con ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Activa o desactiva una cámara
   * @param id ID de la cámara
   * @param isActive Estado de activación
   * @param userId ID del usuario que realiza la acción
   * @returns Cámara actualizada
   */
  async toggleCameraActive(id: number, isActive: boolean, userId: number): Promise<any> {
    try {
      // Verificar que la cámara existe
      const existingCamera = await this.prisma.camera.findUnique({
        where: { id }
      });
      
      if (!existingCamera) {
        throw new Error(`Cámara con ID ${id} no encontrada`);
      }
      
      // Actualizar estado de activación
      const camera = await this.prisma.camera.update({
        where: { id },
        data: { isActive }
      });
      
      // Registrar actividad
      await this.activityLogger.logActivity({
        userId,
        action: isActive ? 'ACTIVATE_CAMERA' : 'DEACTIVATE_CAMERA',
        resourceType: 'CAMERA',
        resourceId: id,
        details: {
          name: camera.name
        }
      });
      
      return camera;
    } catch (error) {
      ServerLogger.error(`Error al ${isActive ? 'activar' : 'desactivar'} cámara ${id}:`, error);
      throw error;
    }
  }

  /**
   * Verifica el estado de una cámara
   * @param id ID de la cámara
   * @returns Estado actualizado de la cámara
   */
  async checkCameraStatus(id: number): Promise<any> {
    try {
      // Obtener datos de la cámara
      const camera = await this.getCameraById(id);
      
      let status = 'OFFLINE';
      let statusDetails = null;
      
      // Intentar conectar según el tipo de cámara
      if (camera.onvifUrl) {
        // Intentar conexión ONVIF
        try {
          const device = new OnvifDevice({
            xaddr: camera.onvifUrl,
            user: camera.username,
            pass: camera.password
          });
          
          await device.init();
          const deviceInfo = await device.fetchDeviceInformation();
          
          status = 'ONLINE';
          statusDetails = {
            manufacturer: deviceInfo.manufacturer,
            model: deviceInfo.model,
            firmwareVersion: deviceInfo.firmwareVersion,
            serialNumber: deviceInfo.serialNumber
          };
        } catch (onvifError) {
          ServerLogger.warn(`Error ONVIF para cámara ${id}:`, onvifError);
        }
      }
      
      if (status === 'OFFLINE' && camera.httpUrl) {
        // Intentar ping HTTP
        try {
          const response = await axios.get(camera.httpUrl, {
            auth: camera.username ? {
              username: camera.username,
              password: camera.password || ''
            } : undefined,
            timeout: 5000
          });
          
          if (response.status === 200) {
            status = 'ONLINE';
          }
        } catch (httpError) {
          ServerLogger.warn(`Error HTTP para cámara ${id}:`, httpError);
        }
      }
      
      // Actualizar estado en la base de datos
      const updatedCamera = await this.prisma.camera.update({
        where: { id },
        data: {
          status,
          lastStatusCheck: new Date(),
          ...(statusDetails && {
            manufacturer: statusDetails.manufacturer || camera.manufacturer,
            model: statusDetails.model || camera.model,
            firmwareVersion: statusDetails.firmwareVersion || camera.firmwareVersion,
            serialNumber: statusDetails.serialNumber || camera.serialNumber
          })
        }
      });
      
      return updatedCamera;
    } catch (error) {
      ServerLogger.error(`Error al verificar estado de cámara ${id}:`, error);
      throw error;
    }
  }

  /**
   * Obtiene el stream de una cámara
   * @param id ID de la cámara
   * @param quality Calidad del stream (high, medium, low)
   * @returns URL del stream
   */
  async getCameraStream(id: number, quality: string = 'medium'): Promise<string> {
    try {
      // Obtener datos de la cámara
      const camera = await this.getCameraById(id);
      
      if (!camera.isActive) {
        throw new Error('La cámara no está activa');
      }
      
      if (camera.status !== 'ONLINE') {
        // Intentar verificar estado
        const updatedCamera = await this.checkCameraStatus(id);
        if (updatedCamera.status !== 'ONLINE') {
          throw new Error('La cámara no está en línea');
        }
      }
      
      // Configurar calidad según parámetro
      let streamSettings = camera.streamSettings || {};
      let resolution, bitrate, fps;
      
      switch (quality) {
        case 'high':
          resolution = streamSettings.highResolution || '1280x720';
          bitrate = streamSettings.highBitrate || '1500k';
          fps = streamSettings.highFps || 30;
          break;
        case 'low':
          resolution = streamSettings.lowResolution || '320x240';
          bitrate = streamSettings.lowBitrate || '300k';
          fps = streamSettings.lowFps || 15;
          break;
        default: // medium
          resolution = streamSettings.mediumResolution || '640x480';
          bitrate = streamSettings.mediumBitrate || '800k';
          fps = streamSettings.mediumFps || 25;
          break;
      }
      
      // Generar URL de stream
      // En una implementación real, aquí se configuraría un servidor de streaming
      // como Nginx-RTMP o se usaría WebRTC
      
      // Para este ejemplo, devolvemos una URL simulada
      const streamUrl = `/api/cameras/${id}/stream?quality=${quality}&token=${this.generateStreamToken(id)}`;
      
      return streamUrl;
    } catch (error) {
      ServerLogger.error(`Error al obtener stream de cámara ${id}:`, error);
      throw error;
    }
  }

  /**
   * Toma una instantánea de una cámara
   * @param id ID de la cámara
   * @param userId ID del usuario que toma la instantánea
   * @param description Descripción opcional
   * @returns Datos de la instantánea
   */
  async takeSnapshot(id: number, userId: number, description?: string): Promise<any> {
    try {
      // Obtener datos de la cámara
      const camera = await this.getCameraById(id);
      
      if (!camera.isActive) {
        throw new Error('La cámara no está activa');
      }
      
      if (camera.status !== 'ONLINE') {
        // Intentar verificar estado
        const updatedCamera = await this.checkCameraStatus(id);
        if (updatedCamera.status !== 'ONLINE') {
          throw new Error('La cámara no está en línea');
        }
      }
      
      // Crear directorio para instantáneas si no existe
      const snapshotDir = path.join(this.recordingsPath, 'snapshots', id.toString());
      if (!fs.existsSync(snapshotDir)) {
        fs.mkdirSync(snapshotDir, { recursive: true });
      }
      
      // Generar nombre de archivo
      const timestamp = new Date();
      const fileName = `snapshot_${timestamp.getTime()}.jpg`;
      const filePath = path.join(snapshotDir, fileName);
      
      // Tomar instantánea usando FFmpeg
      await this.captureSnapshot(camera.rtspUrl, filePath, camera.username, camera.password);
      
      // Registrar en la base de datos
      const snapshot = await this.prisma.snapshot.create({
        data: {
          cameraId: id,
          timestamp,
          filePath,
          takenById: userId,
          description
        }
      });
      
      // Registrar actividad
      await this.activityLogger.logActivity({
        userId,
        action: 'TAKE_SNAPSHOT',
        resourceType: 'CAMERA',
        resourceId: id,
        details: {
          snapshotId: snapshot.id,
          cameraName: camera.name
        }
      });
      
      return snapshot;
    } catch (error) {
      ServerLogger.error(`Error al tomar instantánea de cámara ${id}:`, error);
      throw error;
    }
  }

  /**
   * Inicia la grabación de una cámara
   * @param id ID de la cámara
   * @param userId ID del usuario que inicia la grabación
   * @param duration Duración en segundos (opcional)
   * @returns Datos de la grabación
   */
  async startRecording(id: number, userId: number, duration?: number): Promise<any> {
    try {
      // Obtener datos de la cámara
      const camera = await this.getCameraById(id);
      
      if (!camera.isActive) {
        throw new Error('La cámara no está activa');
      }
      
      if (camera.status !== 'ONLINE') {
        // Intentar verificar estado
        const updatedCamera = await this.checkCameraStatus(id);
        if (updatedCamera.status !== 'ONLINE') {
          throw new Error('La cámara no está en línea');
        }
      }
      
      // Verificar si ya hay una grabación en curso
      const activeRecording = await this.prisma.recording.findFirst({
        where: {
          cameraId: id,
          status: 'RECORDING'
        }
      });
      
      if (activeRecording) {
        throw new Error('Ya hay una grabación en curso para esta cámara');
      }
      
      // Crear directorio para grabaciones si no existe
      const recordingDir = path.join(this.recordingsPath, 'videos', id.toString());
      if (!fs.existsSync(recordingDir)) {
        fs.mkdirSync(recordingDir, { recursive: true });
      }
      
      // Generar nombre de archivo
      const startTime = new Date();
      const fileName = `recording_${startTime.getTime()}.mp4`;
      const filePath = path.join(recordingDir, fileName);
      
      // Crear registro de grabación
      const recording = await this.prisma.recording.create({
        data: {
          cameraId: id,
          startTime,
          filePath,
          triggerType: 'MANUAL',
          status: 'RECORDING'
        }
      });
      
      // Iniciar grabación en segundo plano
      this.recordCamera(camera, filePath, recording.id, duration);
      
      // Registrar actividad
      await this.activityLogger.logActivity({
        userId,
        action: 'START_RECORDING',
        resourceType: 'CAMERA',
        resourceId: id,
        details: {
          recordingId: recording.id,
          cameraName: camera.name,
          duration
        }
      });
      
      return recording;
    } catch (error) {
      ServerLogger.error(`Error al iniciar grabación de cámara ${id}:`, error);
      throw error;
    }
  }

  /**
   * Detiene la grabación de una cámara
   * @param id ID de la cámara
   * @param userId ID del usuario que detiene la grabación
   * @returns Datos de la grabación
   */
  async stopRecording(id: number, userId: number): Promise<any> {
    try {
      // Verificar si hay una grabación en curso
      const activeRecording = await this.prisma.recording.findFirst({
        where: {
          cameraId: id,
          status: 'RECORDING'
        }
      });
      
      if (!activeRecording) {
        throw new Error('No hay una grabación en curso para esta cámara');
      }
      
      // Actualizar estado de la grabación
      const endTime = new Date();
      const duration = Math.round((endTime.getTime() - activeRecording.startTime.getTime()) / 1000);
      
      const recording = await this.prisma.recording.update({
        where: { id: activeRecording.id },
        data: {
          endTime,
          duration,
          status: 'COMPLETED'
        }
      });
      
      // Registrar actividad
      await this.activityLogger.logActivity({
        userId,
        action: 'STOP_RECORDING',
        resourceType: 'CAMERA',
        resourceId: id,
        details: {
          recordingId: recording.id,
          duration
        }
      });
      
      return recording;
    } catch (error) {
      ServerLogger.error(`Error al detener grabación de cámara ${id}:`, error);
      throw error;
    }
  }

  /**
   * Obtiene las grabaciones de una cámara
   * @param id ID de la cámara
   * @param filters Filtros de búsqueda
   * @returns Lista de grabaciones
   */
  async getCameraRecordings(id: number, filters: any = {}): Promise<any> {
    try {
      const {
        page = 1,
        limit = 10,
        startDate,
        endDate,
        status
      } = filters;

      const skip = (page - 1) * limit;
      
      // Construir cláusula where
      let where: any = { cameraId: id };
      
      if (status) {
        where.status = status;
      }
      
      if (startDate && endDate) {
        where.startTime = {
          gte: new Date(startDate),
          lte: new Date(endDate)
        };
      } else if (startDate) {
        where.startTime = {
          gte: new Date(startDate)
        };
      } else if (endDate) {
        where.startTime = {
          lte: new Date(endDate)
        };
      }
      
      // Obtener grabaciones
      const [recordings, total] = await Promise.all([
        this.prisma.recording.findMany({
          where,
          skip,
          take: limit,
          orderBy: { startTime: 'desc' }
        }),
        this.prisma.recording.count({ where })
      ]);
      
      return {
        data: recordings,
        meta: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      ServerLogger.error(`Error al obtener grabaciones de cámara ${id}:`, error);
      throw new Error('Error al obtener grabaciones');
    }
  }

  /**
   * Obtiene las instantáneas de una cámara
   * @param id ID de la cámara
   * @param filters Filtros de búsqueda
   * @returns Lista de instantáneas
   */
  async getCameraSnapshots(id: number, filters: any = {}): Promise<any> {
    try {
      const {
        page = 1,
        limit = 10,
        startDate,
        endDate
      } = filters;

      const skip = (page - 1) * limit;
      
      // Construir cláusula where
      let where: any = { cameraId: id };
      
      if (startDate && endDate) {
        where.timestamp = {
          gte: new Date(startDate),
          lte: new Date(endDate)
        };
      } else if (startDate) {
        where.timestamp = {
          gte: new Date(startDate)
        };
      } else if (endDate) {
        where.timestamp = {
          lte: new Date(endDate)
        };
      }
      
      // Obtener instantáneas
      const [snapshots, total] = await Promise.all([
        this.prisma.snapshot.findMany({
          where,
          skip,
          take: limit,
          orderBy: { timestamp: 'desc' },
          include: {
            takenBy: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }),
        this.prisma.snapshot.count({ where })
      ]);
      
      return {
        data: snapshots,
        meta: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      ServerLogger.error(`Error al obtener instantáneas de cámara ${id}:`, error);
      throw new Error('Error al obtener instantáneas');
    }
  }

  /**
   * Descubre cámaras en la red local
   * @returns Lista de cámaras descubiertas
   */
  async discoverCameras(): Promise<any[]> {
    try {
      // Usar biblioteca node-onvif para descubrir dispositivos
      const devices = await OnvifDevice.discoverDevices();
      
      // Transformar resultados
      const discoveredCameras = devices.map(device => {
        return {
          name: device.name || 'Cámara ONVIF',
          ipAddress: device.xaddrs[0].split('//')[1].split(':')[0],
          onvifUrl: device.xaddrs[0],
          manufacturer: device.manufacturer,
          model: device.model,
          isDiscovered: true
        };
      });
      
      return discoveredCameras;
    } catch (error) {
      ServerLogger.error('Error al descubrir cámaras:', error);
      throw new Error('Error al descubrir cámaras en la red');
    }
  }

  /**
   * Gestiona los permisos de una cámara
   * @param id ID de la cámara
   * @param permissions Lista de permisos
   * @param userId ID del usuario que realiza la acción
   * @returns Resultado de la operación
   */
  async updateCameraPermissions(id: number, permissions: any[], userId: number): Promise<any> {
    try {
      // Verificar que la cámara existe
      const camera = await this.prisma.camera.findUnique({
        where: { id }
      });
      
      if (!camera) {
        throw new Error(`Cámara con ID ${id} no encontrada`);
      }
      
      // Eliminar permisos existentes
      await this.prisma.cameraPermission.deleteMany({
        where: { cameraId: id }
      });
      
      // Crear nuevos permisos
      const createdPermissions = await Promise.all(
        permissions.map(async (perm) => {
          return this.prisma.cameraPermission.create({
            data: {
              cameraId: id,
              userId: perm.userId,
              canView: perm.canView || true,
              canControl: perm.canControl || false,
              canRecord: perm.canRecord || false,
              startTime: perm.startTime ? new Date(perm.startTime) : null,
              endTime: perm.endTime ? new Date(perm.endTime) : null,
              createdById: userId
            }
          });
        })
      );
      
      // Registrar actividad
      await this.activityLogger.logActivity({
        userId,
        action: 'UPDATE_CAMERA_PERMISSIONS',
        resourceType: 'CAMERA',
        resourceId: id,
        details: {
          permissionsCount: createdPermissions.length
        }
      });
      
      return {
        success: true,
        message: `${createdPermissions.length} permisos actualizados correctamente`,
        permissions: createdPermissions
      };
    } catch (error) {
      ServerLogger.error(`Error al actualizar permisos de cámara ${id}:`, error);
      throw error;
    }
  }

  /**
   * Verifica si un usuario tiene permiso para una cámara
   * @param cameraId ID de la cámara
   * @param userId ID del usuario
   * @param permission Tipo de permiso (view, control, record)
   * @returns Si el usuario tiene permiso
   */
  async checkUserPermission(cameraId: number, userId: number, permission: string): Promise<boolean> {
    try {
      // Obtener cámara
      const camera = await this.prisma.camera.findUnique({
        where: { id: cameraId },
        include: {
          zone: true
        }
      });
      
      if (!camera) {
        throw new Error(`Cámara con ID ${cameraId} no encontrada`);
      }
      
      // Verificar si la zona es pública (todos pueden ver)
      if (permission === 'view' && camera.zone?.isPublic) {
        return true;
      }
      
      // Obtener usuario
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          role: true
        }
      });
      
      if (!user) {
        throw new Error(`Usuario con ID ${userId} no encontrado`);
      }
      
      // Administradores tienen todos los permisos
      if (user.role === 'ADMIN') {
        return true;
      }
      
      // Verificar permiso específico
      const userPermission = await this.prisma.cameraPermission.findUnique({
        where: {
          cameraId_userId: {
            cameraId,
            userId
          }
        }
      });
      
      if (!userPermission) {
        return false;
      }
      
      // Verificar si el permiso está activo temporalmente
      const now = new Date();
      if (
        (userPermission.startTime && userPermission.startTime > now) ||
        (userPermission.endTime && userPermission.endTime < now)
      ) {
        return false;
      }
      
      // Verificar tipo de permiso
      switch (permission) {
        case 'view':
          return userPermission.canView;
        case 'control':
          return userPermission.canControl;
        case 'record':
          return userPermission.canRecord;
        default:
          return false;
      }
    } catch (error) {
      ServerLogger.error(`Error al verificar permiso de usuario ${userId} para cámara ${cameraId}:`, error);
      return false;
    }
  }

  /**
   * Controla una cámara PTZ
   * @param id ID de la cámara
   * @param action Acción a realizar (move, zoom, preset)
   * @param params Parámetros de la acción
   * @param userId ID del usuario que realiza la acción
   * @returns Resultado de la operación
   */
  async controlCamera(id: number, action: string, params: any, userId: number): Promise<any> {
    try {
      // Verificar permiso
      const hasPermission = await this.checkUserPermission(id, userId, 'control');
      if (!hasPermission) {
        throw new Error('No tiene permiso para controlar esta cámara');
      }
      
      // Obtener cámara
      const camera = await this.getCameraById(id);
      
      if (!camera.isActive) {
        throw new Error('La cámara no está activa');
      }
      
      if (camera.status !== 'ONLINE') {
        throw new Error('La cámara no está en línea');
      }
      
      if (!camera.ptzEnabled) {
        throw new Error('Esta cámara no soporta control PTZ');
      }
      
      // Inicializar dispositivo ONVIF
      const device = new OnvifDevice({
        xaddr: camera.onvifUrl,
        user: camera.username,
        pass: camera.password
      });
      
      await device.init();
      
      // Ejecutar acción según tipo
      let result;
      
      switch (action) {
        case 'move':
          // Mover cámara (pan/tilt)
          result = await device.ptzMove({
            speed: {
              x: params.pan || 0,  // -1.0 a 1.0
              y: params.tilt || 0, // -1.0 a 1.0
              z: 0
            }
          });
          break;
          
        case 'zoom':
          // Zoom in/out
          result = await device.ptzMove({
            speed: {
              x: 0,
              y: 0,
              z: params.zoom || 0 // -1.0 a 1.0
            }
          });
          break;
          
        case 'preset':
          // Ir a preset
          if (params.presetToken) {
            result = await device.ptzGotoPreset({
              preset: { token: params.presetToken }
            });
          } else {
            throw new Error('Se requiere presetToken para la acción preset');
          }
          break;
          
        case 'stop':
          // Detener movimiento
          result = await device.ptzStop();
          break;
          
        default:
          throw new Error(`Acción PTZ no soportada: ${action}`);
      }
      
      // Registrar actividad
      await this.activityLogger.logActivity({
        userId,
        action: 'CONTROL_CAMERA',
        resourceType: 'CAMERA',
        resourceId: id,
        details: {
          ptzAction: action,
          params
        }
      });
      
      return {
        success: true,
        message: `Control PTZ ejecutado: ${action}`,
        result
      };
    } catch (error) {
      ServerLogger.error(`Error al controlar cámara ${id}:`, error);
      throw error;
    }
  }

  /**
   * Valida los datos de una cámara
   * @param data Datos de la cámara
   */
  private validateCameraData(data: any): void {
    // Validar campos requeridos
    if (!data.name) {
      throw new Error('El nombre de la cámara es obligatorio');
    }
    
    if (!data.ipAddress) {
      throw new Error('La dirección IP es obligatoria');
    }
    
    // Validar formato de IP
    const ipRegex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    if (!ipRegex.test(data.ipAddress)) {
      throw new Error('Formato de dirección IP inválido');
    }
    
    // Validar puerto
    if (data.port && (data.port < 1 || data.port > 65535)) {
      throw new Error('Puerto inválido, debe estar entre 1 y 65535');
    }
  }

  /**
   * Genera una URL RTSP basada en los datos de la cámara
   * @param camera Datos de la cámara
   * @returns URL RTSP
   */
  private generateRtspUrl(camera: any): string {
    const auth = camera.username ? `${camera.username}:${camera.password || ''}@` : '';
    const port = camera.port || 554;
    const path = camera.rtspPath || '/stream1';
    
    return `rtsp://${auth}${camera.ipAddress}:${port}${path}`;
  }

  /**
   * Genera un token para acceso a stream
   * @param cameraId ID de la cámara
   * @returns Token de acceso
   */
  private generateStreamToken(cameraId: number): string {
    // En una implementación real, se usaría un sistema de tokens JWT
    // con firma y expiración
    const timestamp = new Date().getTime();
    const token = `cam_${cameraId}_${timestamp}_token`;
    
    return token;
  }

  /**
   * Captura una instantánea de una cámara usando FFmpeg
   * @param rtspUrl URL RTSP de la cámara
   * @param outputPath Ruta de salida para la imagen
   * @param username Usuario (opcional)
   * @param password Contraseña (opcional)
   * @returns Promesa que se resuelve cuando se completa la captura
   */
  private captureSnapshot(rtspUrl: string, outputPath: string, username?: string, password?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Construir comando FFmpeg
      let ffmpegArgs = [
        '-y',                // Sobrescribir archivo si existe
        '-rtsp_transport', 'tcp', // Usar TCP para RTSP
        '-i', rtspUrl,       // URL de entrada
        '-frames:v', '1',    // Capturar un solo frame
        '-q:v', '2',         // Calidad de imagen (2 es alta)
        outputPath           // Archivo de salida
      ];
      
      // Agregar credenciales si se proporcionan
      if (username && password) {
        ffmpegArgs = [
          '-y',
          '-rtsp_transport', 'tcp',
          '-auth_type', 'basic',
          '-i', rtspUrl,
          '-frames:v', '1',
          '-q:v', '2',
          outputPath
        ];
      }
      
      // Ejecutar FFmpeg
      const ffmpeg = spawn('ffmpeg', ffmpegArgs);
      
      // Capturar salida de error
      let errorOutput = '';
      ffmpeg.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });
      
      // Manejar finalización
      ffmpeg.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`FFmpeg salió con código ${code}: ${errorOutput}`));
        }
      });
      
      // Manejar errores
      ffmpeg.on('error', (err) => {
        reject(new Error(`Error al ejecutar FFmpeg: ${err.message}`));
      });
    });
  }

  /**
   * Graba una cámara usando FFmpeg
   * @param camera Datos de la cámara
   * @param outputPath Ruta de salida para el video
   * @param recordingId ID de la grabación
   * @param duration Duración en segundos (opcional)
   */
  private recordCamera(camera: any, outputPath: string, recordingId: number, duration?: number): void {
    // Construir comando FFmpeg
    let ffmpegArgs = [
      '-y',                // Sobrescribir archivo si existe
      '-rtsp_transport', 'tcp', // Usar TCP para RTSP
      '-i', camera.rtspUrl, // URL de entrada
      '-c:v', 'libx264',   // Codec de video
      '-preset', 'medium', // Preset de codificación
      '-crf', '23',        // Factor de calidad constante
      '-c:a', 'aac',       // Codec de audio
      '-strict', 'experimental',
      '-b:a', '128k'       // Bitrate de audio
    ];
    
    // Agregar duración si se especifica
    if (duration) {
      ffmpegArgs.push('-t', duration.toString());
    }
    
    // Agregar archivo de salida
    ffmpegArgs.push(outputPath);
    
    // Ejecutar FFmpeg
    const ffmpeg = spawn('ffmpeg', ffmpegArgs);
    
    // Capturar salida de error
    let errorOutput = '';
    ffmpeg.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    // Manejar finalización
    ffmpeg.on('close', async (code) => {
      try {
        // Obtener tamaño del archivo
        const stats = fs.statSync(outputPath);
        const fileSize = stats.size;
        
        // Actualizar grabación
        if (code === 0) {
          // Grabación exitosa
          await this.prisma.recording.update({
            where: { id: recordingId },
            data: {
              status: 'COMPLETED',
              endTime: new Date(),
              fileSize
            }
          });
          
          // Generar thumbnail
          const thumbnailPath = outputPath.replace('.mp4', '_thumb.jpg');
          this.generateThumbnail(outputPath, thumbnailPath)
            .then(async () => {
              await this.prisma.recording.update({
                where: { id: recordingId },
                data: {
                  thumbnailPath
                }
              });
            })
            .catch(err => {
              ServerLogger.warn(`Error al generar thumbnail para grabación ${recordingId}:`, err);
            });
        } else {
          // Error en grabación
          await this.prisma.recording.update({
            where: { id: recordingId },
            data: {
              status: 'FAILED',
              endTime: new Date()
            }
          });
          
          ServerLogger.error(`Error en grabación ${recordingId}: FFmpeg salió con código ${code}`);
          ServerLogger.error(errorOutput);
        }
      } catch (error) {
        ServerLogger.error(`Error al finalizar grabación ${recordingId}:`, error);
      }
    });
    
    // Manejar errores
    ffmpeg.on('error', async (err) => {
      try {
        await this.prisma.recording.update({
          where: { id: recordingId },
          data: {
            status: 'FAILED',
            endTime: new Date()
          }
        });
        
        ServerLogger.error(`Error al ejecutar FFmpeg para grabación ${recordingId}:`, err);
      } catch (error) {
        ServerLogger.error(`Error al actualizar estado de grabación ${recordingId}:`, error);
      }
    });
  }

  /**
   * Genera un thumbnail para un video
   * @param videoPath Ruta del video
   * @param outputPath Ruta de salida para el thumbnail
   * @returns Promesa que se resuelve cuando se completa la generación
   */
  private generateThumbnail(videoPath: string, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Construir comando FFmpeg
      const ffmpegArgs = [
        '-y',                // Sobrescribir archivo si existe
        '-i', videoPath,     // Video de entrada
        '-ss', '00:00:01',   // Posición (1 segundo)
        '-vframes', '1',     // Capturar un solo frame
        '-q:v', '2',         // Calidad de imagen
        outputPath           // Archivo de salida
      ];
      
      // Ejecutar FFmpeg
      const ffmpeg = spawn('ffmpeg', ffmpegArgs);
      
      // Capturar salida de error
      let errorOutput = '';
      ffmpeg.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });
      
      // Manejar finalización
      ffmpeg.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`FFmpeg salió con código ${code}: ${errorOutput}`));
        }
      });
      
      // Manejar errores
      ffmpeg.on('error', (err) => {
        reject(new Error(`Error al ejecutar FFmpeg: ${err.message}`));
      });
    });
  }
}
